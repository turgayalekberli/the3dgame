import type { EnemyType } from '../types'

export interface EnemyStats {
  hp: number
  // Клеток в секунду
  speed: number
  // Кредиты за убийство
  reward: number
  // Сколько жизней снимает, дойдя до базы
  damage: number
}

// Характеристики из docs/game-design.md — стартовые значения для балансировки
export const ENEMY_STATS: Readonly<Record<EnemyType, EnemyStats>> = {
  drone: { hp: 60, speed: 1.5, reward: 5, damage: 1 },
  runner: { hp: 35, speed: 3, reward: 6, damage: 1 },
  tank: { hp: 300, speed: 0.8, reward: 20, damage: 3 },
}
