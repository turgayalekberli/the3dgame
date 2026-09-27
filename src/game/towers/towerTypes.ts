import type { TowerType } from '../types'

export interface TowerStats {
  name: string
  cost: number
  // Урон за выстрел; для луча — урон в секунду
  damage: number
  // Выстрелов в секунду; у луча 0 — он бьёт непрерывно
  fireRate: number
  // Радиус в клетках
  range: number
  // Радиус сплеша в клетках (0 — без сплеша)
  splash: number
  // Доля замедления и сколько секунд оно держится после выхода из луча
  slow: number
  slowDuration: number
}

// Характеристики из docs/game-design.md — стартовые значения для балансировки
export const TOWER_STATS: Readonly<Record<TowerType, TowerStats>> = {
  pulse: { name: 'Пулемёт', cost: 50, damage: 8, fireRate: 5, range: 3, splash: 0, slow: 0, slowDuration: 0 },
  rocket: { name: 'Ракетница', cost: 100, damage: 40, fireRate: 0.8, range: 4, splash: 1.2, slow: 0, slowDuration: 0 },
  cryo: { name: 'Крио-луч', cost: 75, damage: 5, fireRate: 0, range: 2.5, splash: 0, slow: 0.4, slowDuration: 1 },
}

// Порядок в панели; он же задаёт горячие клавиши 1, 2, 3
export const TOWER_ORDER: readonly TowerType[] = ['pulse', 'rocket', 'cryo']

// Улучшение: сколько уровней всего, цена — доля базовой, прибавка к урону и радиусу за уровень
export const MAX_TOWER_LEVEL = 2
export const UPGRADE_COST_RATIO = 0.75
export const UPGRADE_DAMAGE_BONUS = 0.5
export const UPGRADE_RANGE_BONUS = 0.15

// Продажа возвращает эту долю всех вложений (постройка + улучшения)
export const SELL_RATIO = 0.7
