import * as THREE from 'three'
import { CameraRig } from './core/CameraRig'
import { PostFx } from './core/PostFx'
import { Enemy } from './enemies/Enemy'
import { EnemyModels } from './enemies/EnemyModels'
import { Arena } from './map/Arena'
import { Grid } from './map/Grid'
import { LEVEL_1 } from './map/level1'
import { Path } from './map/Path'
import { WaveSpawner } from './waves/WaveSpawner'
import { WAVES } from './waves/waves'
import {
  AMBIENT_INTENSITY,
  COLORS,
  FOG_FAR,
  FOG_NEAR,
  MAX_DELTA,
  SHADOW_EXTENT,
  SHADOW_MAP_SIZE,
  SUN_INTENSITY,
  SUN_POSITION,
  TONE_MAPPING_EXPOSURE,
  WAVE_BONUS_BASE,
  WAVE_BONUS_PER_WAVE,
} from './config'
import { initialState, type GameStore } from './store'
import type { EnemyType } from './types'

// Игра: сцена, цикл и правила. Наружу — store (состояние для интерфейса) и публичные методы (команды)
export class Game {
  private readonly container: HTMLElement
  private readonly store: GameStore
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly clock = new THREE.Clock()
  private readonly resizeObserver: ResizeObserver
  private readonly sun: THREE.DirectionalLight
  private readonly rig: CameraRig
  private readonly postFx: PostFx
  private readonly grid: Grid
  private readonly arena: Arena
  private readonly path: Path
  private readonly models = new EnemyModels()
  private readonly spawner = new WaveSpawner()

  // Живые враги на карте
  private readonly enemies: Enemy[] = []

  constructor(container: HTMLElement, store: GameStore) {
    this.container = container
    this.store = store

    // antialias не нужен: кадр рисуется в буфер постобработки, сглаживание — там (MSAA)
    this.renderer = new THREE.WebGLRenderer({ antialias: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = TONE_MAPPING_EXPOSURE
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(this.renderer.domElement)

    this.scene.background = new THREE.Color(COLORS.background)
    this.scene.fog = new THREE.Fog(COLORS.background, FOG_NEAR, FOG_FAR)

    this.grid = new Grid(LEVEL_1)
    this.path = new Path(this.grid)
    this.arena = new Arena(this.grid)
    this.scene.add(this.arena.group)

    this.sun = this.createLights()

    this.rig = new CameraRig(this.renderer.domElement, this.grid.width / 2, this.grid.depth / 2)
    this.postFx = new PostFx(this.renderer, this.scene, this.rig.camera)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)
    this.resize()

    this.reset()
    this.renderer.setAnimationLoop(() => this.tick())
  }

  // Команда из HUD: начать следующую волну
  startWave(): void {
    if (this.store.state !== 'build') return
    this.store.wave++
    this.spawner.start(WAVES[this.store.wave - 1])
    this.store.state = 'wave'
  }

  // Команда из HUD: начать партию заново
  restart(): void {
    this.reset()
  }

  private reset(): void {
    for (const enemy of this.enemies) this.scene.remove(enemy.root)
    this.enemies.length = 0
    this.spawner.stop()
    Object.assign(this.store, initialState())
  }

  // Стрелочная функция: передаётся спавнеру каждый кадр без создания нового замыкания
  private readonly spawnEnemy = (type: EnemyType): void => {
    const enemy = new Enemy(type, this.models, this.path)
    this.enemies.push(enemy)
    this.scene.add(enemy.root)
  }

  private updateWave(delta: number): void {
    this.spawner.update(delta, this.spawnEnemy)
    this.updateEnemies(delta)

    // Жизни кончились — поражение, враги замирают на местах
    if (this.store.lives === 0) {
      this.spawner.stop()
      this.store.state = 'defeat'
      return
    }

    if (this.spawner.done && this.enemies.length === 0) this.completeWave()
  }

  private updateEnemies(delta: number): void {
    // С конца: splice сдвигает элементы, при обходе с начала часть пропустили бы
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]
      enemy.update(delta)

      if (enemy.finished) {
        this.store.lives = Math.max(0, this.store.lives - enemy.stats.damage)
        this.removeEnemy(i)
      }
    }
  }

  private removeEnemy(index: number): void {
    this.scene.remove(this.enemies[index].root)
    this.enemies.splice(index, 1)
  }

  private completeWave(): void {
    this.store.credits += WAVE_BONUS_BASE + WAVE_BONUS_PER_WAVE * this.store.wave
    this.store.state = this.store.wave >= this.store.totalWaves ? 'victory' : 'build'
  }

  private createLights(): THREE.DirectionalLight {
    const ambient = new THREE.AmbientLight(COLORS.ambient, AMBIENT_INTENSITY)

    const sun = new THREE.DirectionalLight(0xffffff, SUN_INTENSITY)
    sun.position.set(SUN_POSITION.x, SUN_POSITION.y, SUN_POSITION.z)
    sun.castShadow = true
    sun.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE)
    // Против «полос» самозатенения (shadow acne) на гранях
    sun.shadow.normalBias = 0.02

    // Тень направленного света снимает ортографическая камера-коробка: охватываем всю карту
    const shadowCamera = sun.shadow.camera
    shadowCamera.left = -SHADOW_EXTENT
    shadowCamera.right = SHADOW_EXTENT
    shadowCamera.top = SHADOW_EXTENT
    shadowCamera.bottom = -SHADOW_EXTENT
    shadowCamera.near = 1
    shadowCamera.far = 80
    shadowCamera.updateProjectionMatrix()

    // target добавляем в сцену — иначе его положение не учитывается
    this.scene.add(ambient, sun, sun.target)
    return sun
  }

  private resize(): void {
    const { clientWidth: width, clientHeight: height } = this.container
    if (width === 0 || height === 0) return

    this.rig.setAspect(width / height)
    this.renderer.setSize(width, height)
    this.postFx.setSize(width, height)
  }

  // Игровой цикл: ~60 раз в секунду
  private tick(): void {
    const delta = Math.min(this.clock.getDelta(), MAX_DELTA)

    if (this.store.state === 'wave') this.updateWave(delta)

    this.arena.update(delta)
    this.rig.update()
    this.postFx.render(delta)
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null)
    this.resizeObserver.disconnect()
    this.rig.dispose()
    this.postFx.dispose()
    this.arena.dispose()
    this.models.dispose()
    this.sun.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
