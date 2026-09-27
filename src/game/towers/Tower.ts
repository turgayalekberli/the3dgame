import * as THREE from 'three'
import type { Combat } from '../combat/Combat'
import { BEAM_PULSE_SPEED, CELL_SIZE, TOWER_AIM_TOLERANCE, TOWER_IDLE_SPIN, TOWER_TURN_DAMPING } from '../config'
import type { Enemy } from '../enemies/Enemy'
import type { GridPoint, TowerType } from '../types'
import type { TowerModel, TowerModels } from './TowerModels'
import { TOWER_STATS, type TowerStats } from './towerTypes'

const UP = new THREE.Vector3(0, 1, 0)

// Общие временные векторы: башни обновляются по очереди
const muzzle = new THREE.Vector3()
const aim = new THREE.Vector3()
const beamDirection = new THREE.Vector3()

// Башня на клетке: выбирает цель, доворачивает голову и стреляет снарядами или лучом
export class Tower {
  readonly type: TowerType
  readonly stats: TowerStats
  readonly cell: GridPoint

  // Вложенные кредиты — часть вернётся при продаже (Фаза 4)
  invested: number

  private readonly model: TowerModel
  // Радиус в мировых единицах
  private readonly range: number
  // Луч есть только у башни непрерывного действия (fireRate = 0)
  private readonly beam: THREE.Mesh | null

  // Секунды до следующего выстрела
  private cooldown = 0
  // Следующий ствол/труба
  private muzzleIndex = 0
  private beamTime = 0

  // position — центр клетки на высоте верха плитки
  constructor(type: TowerType, cell: GridPoint, position: THREE.Vector3, models: TowerModels) {
    this.type = type
    this.stats = TOWER_STATS[type]
    this.cell = cell
    this.invested = this.stats.cost
    this.range = this.stats.range * CELL_SIZE

    this.model = models.create(type)
    this.model.root.position.copy(position)

    this.beam = this.stats.fireRate === 0 ? models.createBeam() : null
    if (this.beam) {
      this.beam.visible = false
      this.model.root.add(this.beam)
    }
  }

  get root(): THREE.Group {
    return this.model.root
  }

  // enemies — враги, по которым можно стрелять (вне волны — пустой список)
  update(delta: number, enemies: readonly Enemy[], combat: Combat): void {
    this.cooldown = Math.max(0, this.cooldown - delta)

    const target = this.findTarget(enemies)
    if (!target) {
      this.model.head.rotation.y += TOWER_IDLE_SPIN * delta
      if (this.beam) this.beam.visible = false
      return
    }

    const aimed = this.turnTo(target, delta)
    if (this.beam) this.fireBeam(this.beam, target, delta)
    else if (aimed && this.cooldown === 0) this.fireProjectile(target, combat)
  }

  // Таргетинг First: из врагов в радиусе — тот, кто прошёл по пути дальше всех
  private findTarget(enemies: readonly Enemy[]): Enemy | null {
    const position = this.model.root.position
    const rangeSq = this.range * this.range
    let best: Enemy | null = null

    for (const enemy of enemies) {
      if (!enemy.alive) continue
      const dx = enemy.root.position.x - position.x
      const dz = enemy.root.position.z - position.z
      if (dx * dx + dz * dz > rangeSq) continue
      if (!best || enemy.distance > best.distance) best = enemy
    }

    return best
  }

  // Плавный доворот головы к цели; true — уже наведена достаточно точно для выстрела
  private turnTo(target: Enemy, delta: number): boolean {
    const head = this.model.head
    const position = this.model.root.position
    const desired = Math.atan2(target.root.position.x - position.x, target.root.position.z - position.z)
    // Кратчайший угол: rotation.y после холостого вращения может быть сколь угодно большим
    const diff = Math.atan2(Math.sin(desired - head.rotation.y), Math.cos(desired - head.rotation.y))
    head.rotation.y += diff * (1 - Math.exp(-TOWER_TURN_DAMPING * delta))
    return Math.abs(diff) < TOWER_AIM_TOLERANCE
  }

  private fireProjectile(target: Enemy, combat: Combat): void {
    this.cooldown = 1 / this.stats.fireRate

    const muzzles = this.model.muzzles
    this.muzzlePoint(muzzles[this.muzzleIndex], muzzle)
    this.muzzleIndex = (this.muzzleIndex + 1) % muzzles.length

    combat.fire(this.type, muzzle, target, this.stats.damage, this.stats.splash * CELL_SIZE)
  }

  // Непрерывный луч: урон в секунду и замедление, пока цель в луче
  private fireBeam(beam: THREE.Mesh, target: Enemy, delta: number): void {
    target.takeDamage(this.stats.damage * delta)
    target.applySlow(this.stats.slow, this.stats.slowDuration)

    // Луч — дочерний объект корня башни; корень не повёрнут и не масштабирован,
    // поэтому в его координаты переводим простым вычитанием позиции
    const root = this.model.root.position
    this.muzzlePoint(this.model.muzzles[0], muzzle).sub(root)
    target.aimPoint(aim).sub(root)

    beamDirection.subVectors(aim, muzzle)
    const length = beamDirection.length()
    if (length === 0) return

    beam.visible = true
    beam.position.addVectors(muzzle, aim).multiplyScalar(0.5)
    // Цилиндр вытянут вдоль Y — поворачиваем Y в направлении цели
    beam.quaternion.setFromUnitVectors(UP, beamDirection.divideScalar(length))

    // Толщина пульсирует — луч «живой»
    this.beamTime += delta
    const pulse = 1 + 0.3 * Math.sin(this.beamTime * BEAM_PULSE_SPEED)
    beam.scale.set(pulse, length, pulse)
  }

  // Мировая позиция точки, заданной в координатах головы
  private muzzlePoint(local: THREE.Vector3, target: THREE.Vector3): THREE.Vector3 {
    // Голову только что повернули — матрица должна учесть поворот этого кадра
    this.model.head.updateWorldMatrix(true, false)
    return this.model.head.localToWorld(target.copy(local))
  }
}
