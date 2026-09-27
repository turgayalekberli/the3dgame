import * as THREE from 'three'
import { Block } from './Block'
import { Debris } from './Debris'
import { moveSpeed } from './difficulty'
import { Input } from './Input'
import { Palette } from './Palette'
import { PerfectFlash } from './PerfectFlash'
import {
  BACKGROUND_DAMPING,
  BLOCK_HEIGHT,
  BLOCK_SIZE,
  CAMERA_DAMPING,
  CAMERA_OFFSET,
  DEBRIS_CLEANUP_DEPTH,
  FOG_FAR,
  FOG_NEAR,
  MAX_DELTA,
  MIN_PIECE,
  MOVE_RANGE,
  PERFECT_GROW_AMOUNT,
  PERFECT_GROW_STREAK,
  PERFECT_TOLERANCE,
} from './config'
import type { Axis, GameEvents } from './types'

export class Game {
  private readonly container: HTMLElement
  private readonly events: GameEvents
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly clock = new THREE.Clock()
  private readonly resizeObserver: ResizeObserver
  private readonly input: Input

  // Уложенные плиты башни, последняя — верхняя
  private readonly blocks: Block[] = []

  // Падающие обрезки
  private readonly debris: Debris[] = []

  // Вспышки идеальных попаданий
  private readonly flashes: PerfectFlash[] = []

  // Сколько идеальных попаданий подряд
  private combo = 0

  // Плита, которая сейчас ездит над башней; null — игра окончена
  private moving: Block | null = null
  private axis: Axis = 'x'
  private direction = 1
  private speed = 0

  // Высота, на которую сейчас смотрит камера (плавно догоняет вершину башни)
  private focusY = 0

  // Палитра текущей партии; при рестарте создаётся новая
  private palette = new Palette()

  // Текущий цвет фона и тот, к которому он плавно стремится
  private readonly background = new THREE.Color()
  private readonly targetBackground = new THREE.Color()
  private readonly fog: THREE.Fog

  constructor(container: HTMLElement, events: GameEvents) {
    this.container = container
    this.events = events

    // Renderer: рисует кадр в <canvas>
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(this.renderer.domElement)

    // Фон и туман одного цвета: дальние объекты плавно растворяются в фоне
    this.fog = new THREE.Fog(this.background, FOG_NEAR, FOG_FAR)
    this.scene.background = this.background
    this.scene.fog = this.fog

    // Camera: угол обзора 45°, видит от 0.1 до 100 единиц
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)

    // Свет: мягкий общий + направленный «солнечный»
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    const sun = new THREE.DirectionalLight(0xffffff, 1.5)
    sun.position.set(5, 10, 7)
    this.scene.add(ambient, sun)

    this.start()

    // Первый кадр сразу в цвет палитры, без перехода из чёрного
    this.palette.background(this.blocks.length, this.background)

    this.input = new Input(container, () => this.action())

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)
    this.resize()

    this.renderer.setAnimationLoop(() => this.tick())
  }

  private get top(): Block {
    return this.blocks[this.blocks.length - 1]
  }

  // Счёт: уложенные плиты без основания
  private get score(): number {
    return this.blocks.length - 1
  }

  // Основание башни + первая движущаяся плита
  private start(): void {
    this.blocks.push(this.createBlock(0, BLOCK_SIZE, BLOCK_SIZE))
    this.moving = this.spawnMoving()
    this.events.onScore(this.score)
  }

  // Убрать всё со сцены и начать заново
  restart(): void {
    for (const block of this.blocks) this.removeBlock(block)
    for (const piece of this.debris) this.removeBlock(piece.block)
    for (const flash of this.flashes) this.removeFlash(flash)
    this.blocks.length = 0
    this.debris.length = 0
    this.flashes.length = 0
    this.combo = 0

    this.palette = new Palette()
    this.start()
  }

  private createBlock(index: number, width: number, depth: number): Block {
    const block = new Block(width, depth, this.palette.block(index))
    block.mesh.position.y = index * BLOCK_HEIGHT
    this.scene.add(block.mesh)
    return block
  }

  private removeBlock(block: Block): void {
    this.scene.remove(block.mesh)
    block.dispose()
  }

  private removeFlash(flash: PerfectFlash): void {
    this.scene.remove(flash.mesh)
    flash.dispose()
  }

  // Новая плита над башней: того же размера, что верхняя, сдвинута к краю по своей оси
  private spawnMoving(): Block {
    const index = this.blocks.length
    this.axis = index % 2 === 1 ? 'x' : 'z'
    this.direction = 1
    this.speed = moveSpeed(this.score)

    const block = this.createBlock(index, this.top.width, this.top.depth)
    block.mesh.position.x = this.top.mesh.position.x
    block.mesh.position.z = this.top.mesh.position.z
    block.mesh.position[this.axis] -= MOVE_RANGE
    return block
  }

  // Ping-pong: едем с постоянной скоростью, у границы разворачиваемся
  private updateMoving(moving: Block, delta: number): void {
    const position = moving.mesh.position
    const center = this.top.mesh.position[this.axis]

    position[this.axis] += this.speed * this.direction * delta

    const offset = position[this.axis] - center
    if (Math.abs(offset) > MOVE_RANGE) {
      position[this.axis] = center + Math.sign(offset) * MOVE_RANGE
      this.direction = -Math.sign(offset)
    }
  }

  // Остановить плиту: часть над башней остаётся, свисающая — падает
  private place(moving: Block): void {
    const axis = this.axis
    const size = axis === 'x' ? 'width' : 'depth'
    const top = this.top

    const topCenter = top.mesh.position[axis]
    let center = moving.mesh.position[axis]

    // Почти точное попадание: прощаем и ставим ровно
    const isPerfect = Math.abs(center - topCenter) < PERFECT_TOLERANCE
    if (isPerfect) center = topCenter

    // С какой стороны свисает: +1 / −1 (0 — ровно)
    const side = Math.sign(center - topCenter)

    // Пересечение двух отрезков на оси
    const start = Math.max(center - moving[size] / 2, topCenter - top[size] / 2)
    const end = Math.min(center + moving[size] / 2, topCenter + top[size] / 2)
    const overlap = end - start

    // Промах: вся плита падает, игра окончена
    if (overlap <= 0) {
      this.debris.push(new Debris(moving, axis, side))
      this.moving = null
      this.events.onGameOver(this.score)
      return
    }

    const index = this.blocks.length

    // Серия идеальных попаданий: с PERFECT_GROW_STREAK подряд плита начинает расти
    this.combo = isPerfect ? this.combo + 1 : 0
    const grows = this.combo >= PERFECT_GROW_STREAK
    const placedSize = grows ? Math.min(overlap + PERFECT_GROW_AMOUNT, BLOCK_SIZE) : overlap

    const placed = this.createBlock(
      index,
      axis === 'x' ? placedSize : moving.width,
      axis === 'z' ? placedSize : moving.depth,
    )
    placed.mesh.position.copy(moving.mesh.position)
    placed.mesh.position[axis] = (start + end) / 2

    if (isPerfect) {
      const flash = new PerfectFlash(placed.width, placed.depth, placed.mesh.position)
      this.flashes.push(flash)
      this.scene.add(flash.mesh)
      this.events.onPerfect(this.combo)
    }

    // Свисающая часть: от края башни до края плиты
    const overhang = moving[size] - overlap
    if (overhang > MIN_PIECE) {
      const piece = this.createBlock(
        index,
        axis === 'x' ? overhang : moving.width,
        axis === 'z' ? overhang : moving.depth,
      )
      piece.mesh.position.copy(moving.mesh.position)
      piece.mesh.position[axis] = side > 0 ? end + overhang / 2 : start - overhang / 2
      this.debris.push(new Debris(piece, axis, side))
    }

    this.removeBlock(moving)
    this.blocks.push(placed)
    this.moving = this.spawnMoving()
    this.events.onScore(this.score)
  }

  private updateDebris(delta: number): void {
    const cleanupY = this.focusY - DEBRIS_CLEANUP_DEPTH

    // С конца: splice сдвигает элементы, при обходе с начала часть пропустили бы
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const piece = this.debris[i]
      piece.update(delta)

      if (piece.block.mesh.position.y < cleanupY) {
        this.removeBlock(piece.block)
        this.debris.splice(i, 1)
      }
    }
  }

  private updateFlashes(delta: number): void {
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const flash = this.flashes[i]
      if (!flash.update(delta)) {
        this.removeFlash(flash)
        this.flashes.splice(i, 1)
      }
    }
  }

  // Действие игрока (клик, тап, пробел, Enter): поставить плиту
  private action(): void {
    if (this.moving) this.place(this.moving)
  }

  private resize(): void {
    const { clientWidth: width, clientHeight: height } = this.container
    if (width === 0 || height === 0) return

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  // Игровой цикл: ~60 раз в секунду
  private tick(): void {
    const delta = Math.min(this.clock.getDelta(), MAX_DELTA)

    if (this.moving) this.updateMoving(this.moving, delta)
    this.updateDebris(delta)
    this.updateFlashes(delta)

    // Камера плавно подтягивается к уровню над вершиной, независимо от частоты кадров
    const targetY = this.blocks.length * BLOCK_HEIGHT
    this.focusY = THREE.MathUtils.damp(this.focusY, targetY, CAMERA_DAMPING, delta)
    this.camera.position.set(CAMERA_OFFSET.x, this.focusY + CAMERA_OFFSET.y, CAMERA_OFFSET.z)
    this.camera.lookAt(0, this.focusY, 0)

    // Фон плавно перетекает к цвету текущей высоты; туман — того же цвета
    this.palette.background(this.blocks.length, this.targetBackground)
    this.background.lerp(this.targetBackground, 1 - Math.exp(-BACKGROUND_DAMPING * delta))
    this.fog.color.copy(this.background)

    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null)
    this.resizeObserver.disconnect()
    this.input.dispose()
    for (const block of this.blocks) block.dispose()
    for (const piece of this.debris) piece.block.dispose()
    for (const flash of this.flashes) flash.dispose()
    this.moving?.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
