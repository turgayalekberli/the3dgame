import type * as THREE from 'three'
import { TOWER_IDLE_SPIN } from '../config'
import type { GridPoint, TowerType } from '../types'
import type { TowerModel, TowerModels } from './TowerModels'
import { TOWER_STATS, type TowerStats } from './towerTypes'

// Башня на клетке. Пока только стоит и осматривается; стрельба — в этапе 3b
export class Tower {
  readonly type: TowerType
  readonly stats: TowerStats
  readonly cell: GridPoint

  // Вложенные кредиты — часть вернётся при продаже (Фаза 4)
  invested: number

  private readonly model: TowerModel

  // position — центр клетки на высоте верха плитки
  constructor(type: TowerType, cell: GridPoint, position: THREE.Vector3, models: TowerModels) {
    this.type = type
    this.stats = TOWER_STATS[type]
    this.cell = cell
    this.invested = this.stats.cost

    this.model = models.create(type)
    this.model.root.position.copy(position)
  }

  get root(): THREE.Group {
    return this.model.root
  }

  update(delta: number): void {
    this.model.head.rotation.y += TOWER_IDLE_SPIN * delta
  }
}
