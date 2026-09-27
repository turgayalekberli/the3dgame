import * as THREE from 'three'
import { CELL_SIZE, ENEMY_BOB_AMPLITUDE, ENEMY_BOB_SPEED, ENEMY_TURN_DAMPING } from '../config'
import type { Path } from '../map/Path'
import type { EnemyType } from '../types'
import type { EnemyModel, EnemyModels } from './EnemyModels'
import { ENEMY_STATS, type EnemyStats } from './enemyTypes'

// Общий временный вектор: враги обновляются по очереди
const direction = new THREE.Vector3()

// Враг: движется по пути с постоянной скоростью и получает урон
export class Enemy {
  readonly type: EnemyType
  readonly stats: EnemyStats
  hp: number

  // Пройденная дистанция — прогресс по пути, по нему считается таргетинг First
  distance = 0

  // Множитель скорости: меньше 1 — замедление (Cryo Beam в Фазе 3)
  speedMultiplier = 1

  private readonly model: EnemyModel
  private readonly path: Path
  private heading: number

  // Случайная фаза покачивания — чтобы враги не качались в такт
  private bobTime = Math.random() * Math.PI * 2

  constructor(type: EnemyType, models: EnemyModels, path: Path) {
    this.type = type
    this.stats = ENEMY_STATS[type]
    this.hp = this.stats.hp
    this.model = models.create(type)
    this.path = path

    path.sample(0, this.model.root.position, direction)
    this.heading = Math.atan2(direction.x, direction.z)
    this.model.root.rotation.y = this.heading
  }

  get root(): THREE.Group {
    return this.model.root
  }

  // Дошёл до базы
  get finished(): boolean {
    return this.distance >= this.path.length
  }

  update(delta: number): void {
    this.distance += this.stats.speed * CELL_SIZE * this.speedMultiplier * delta
    this.path.sample(this.distance, this.model.root.position, direction)

    // Плавный доворот на углах — кратчайшим путём к направлению движения
    const target = Math.atan2(direction.x, direction.z)
    const diff = Math.atan2(Math.sin(target - this.heading), Math.cos(target - this.heading))
    this.heading += diff * (1 - Math.exp(-ENEMY_TURN_DAMPING * delta))
    this.model.root.rotation.y = this.heading

    this.bobTime += ENEMY_BOB_SPEED * delta
    this.model.body.position.y = this.model.hover + Math.sin(this.bobTime) * ENEMY_BOB_AMPLITUDE
  }

  // Возвращает true, если враг уничтожен (стрельба — в Фазе 3)
  takeDamage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount)
    this.model.bar.set(this.hp / this.stats.hp)
    return this.hp === 0
  }
}
