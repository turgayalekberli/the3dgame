import * as THREE from 'three'
import { Block } from './Block'
import { BLOCK_HEIGHT, BLOCK_SIZE, CAMERA_DAMPING, CAMERA_OFFSET } from './config'

export class Game {
  private readonly container: HTMLElement
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly clock = new THREE.Clock()
  private readonly resizeObserver: ResizeObserver
  private readonly blocks: Block[] = []

  // Высота, на которую сейчас смотрит камера (плавно догоняет вершину башни)
  private focusY = 0

  constructor(container: HTMLElement) {
    this.container = container

    // Renderer: рисует кадр в <canvas>
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(this.renderer.domElement)

    this.scene.background = new THREE.Color(0x111111)

    // Camera: угол обзора 45°, видит от 0.1 до 100 единиц
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)

    // Свет: мягкий общий + направленный «солнечный»
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    const sun = new THREE.DirectionalLight(0xffffff, 1.5)
    sun.position.set(5, 10, 7)
    this.scene.add(ambient, sun)

    this.addBlock()

    container.addEventListener('pointerdown', this.onPointerDown)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)
    this.resize()

    this.renderer.setAnimationLoop(() => this.tick())
  }

  // Центр верхней плиты по Y
  private get topY(): number {
    return (this.blocks.length - 1) * BLOCK_HEIGHT
  }

  private addBlock(): void {
    const index = this.blocks.length
    // Каждая следующая плита чуть сдвигает оттенок по цветовому кругу
    const color = new THREE.Color().setHSL((index * 0.04) % 1, 0.6, 0.55)

    const block = new Block(BLOCK_SIZE, BLOCK_SIZE, color)
    block.mesh.position.y = index * BLOCK_HEIGHT

    this.blocks.push(block)
    this.scene.add(block.mesh)
  }

  // Стрелочная функция: та же ссылка нужна для removeEventListener
  private readonly onPointerDown = (): void => {
    this.addBlock()
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
    const delta = this.clock.getDelta()

    // Камера плавно подтягивается к вершине, независимо от частоты кадров
    this.focusY = THREE.MathUtils.damp(this.focusY, this.topY, CAMERA_DAMPING, delta)
    this.camera.position.set(CAMERA_OFFSET.x, this.focusY + CAMERA_OFFSET.y, CAMERA_OFFSET.z)
    this.camera.lookAt(0, this.focusY, 0)

    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null)
    this.resizeObserver.disconnect()
    this.container.removeEventListener('pointerdown', this.onPointerDown)
    for (const block of this.blocks) block.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
