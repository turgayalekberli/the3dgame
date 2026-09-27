import type { EnemyType } from '../types'

// Группа врагов одного типа внутри волны
export interface WaveGroup {
  type: EnemyType
  count: number
  // Секунды между врагами группы
  interval: number
  // Секунды от начала волны до первого врага группы (группы могут идти одновременно)
  start: number
}

export type Wave = readonly WaveGroup[]

// Состав волн из docs/game-design.md — стартовые значения для балансировки
export const WAVES: readonly Wave[] = [
  [{ type: 'drone', count: 8, interval: 1.2, start: 0 }],
  [{ type: 'drone', count: 12, interval: 1, start: 0 }],
  [
    { type: 'drone', count: 8, interval: 1.2, start: 0 },
    { type: 'runner', count: 6, interval: 0.8, start: 6 },
  ],
  [{ type: 'runner', count: 15, interval: 0.6, start: 0 }],
  [
    { type: 'drone', count: 10, interval: 1, start: 0 },
    { type: 'tank', count: 2, interval: 4, start: 5 },
  ],
  [
    { type: 'runner', count: 12, interval: 0.6, start: 0 },
    { type: 'tank', count: 3, interval: 3.5, start: 3 },
  ],
  [
    { type: 'drone', count: 20, interval: 0.7, start: 0 },
    { type: 'runner', count: 10, interval: 0.5, start: 8 },
  ],
  [
    { type: 'tank', count: 6, interval: 2.5, start: 0 },
    { type: 'runner', count: 10, interval: 0.5, start: 4 },
  ],
  [
    { type: 'drone', count: 25, interval: 0.5, start: 0 },
    { type: 'tank', count: 5, interval: 3, start: 4 },
  ],
  [
    { type: 'runner', count: 15, interval: 0.5, start: 0 },
    { type: 'drone', count: 15, interval: 0.6, start: 3 },
    { type: 'tank', count: 8, interval: 2, start: 6 },
  ],
]
