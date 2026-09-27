import type { EnemyType } from '../types'
import type { Wave, WaveGroup } from './waves'

interface GroupProgress {
  group: WaveGroup
  spawned: number
}

// Выпускает врагов волны по расписанию групп
export class WaveSpawner {
  private groups: GroupProgress[] = []
  private time = 0

  start(wave: Wave): void {
    this.time = 0
    this.groups = wave.map((group) => ({ group, spawned: 0 }))
  }

  stop(): void {
    this.groups = []
  }

  // Все враги волны выпущены
  get done(): boolean {
    return this.groups.every(({ group, spawned }) => spawned >= group.count)
  }

  update(delta: number, spawn: (type: EnemyType) => void): void {
    this.time += delta

    for (const progress of this.groups) {
      const { group } = progress
      // Выпускаем всех, чьё время подошло (после долгого кадра — нескольких сразу)
      while (progress.spawned < group.count && this.time >= group.start + progress.spawned * group.interval) {
        spawn(group.type)
        progress.spawned++
      }
    }
  }
}
