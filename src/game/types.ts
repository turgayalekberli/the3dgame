// Состояния игры: стартовый экран → строительство ⇄ волна → победа / поражение
export type GameState = 'ready' | 'build' | 'wave' | 'victory' | 'defeat'

// Тип клетки поля
export type CellType = 'buildable' | 'path' | 'base' | 'blocked'

// Координаты клетки в сетке: столбец (ось X) и строка (ось Z)
export interface GridPoint {
  readonly col: number
  readonly row: number
}

// Описание уровня: размер сетки, путь врагов и декоративные препятствия
export interface LevelData {
  readonly cols: number
  readonly rows: number
  // Ключевые точки пути: первая — спавн, последняя — база
  readonly waypoints: readonly GridPoint[]
  readonly blocked: readonly GridPoint[]
}

// Типы врагов
export type EnemyType = 'drone' | 'runner' | 'tank'

// Типы башен
export type TowerType = 'pulse' | 'rocket' | 'cryo'

// Выбранная построенная башня — данные для панели в HUD
export interface TowerInfo {
  type: TowerType
  level: number
  maxLevel: number
  // За выстрел; у луча — в секунду
  damage: number
  // Выстрелов в секунду; у луча 0
  fireRate: number
  // Радиус в клетках
  range: number
  // Цена следующего улучшения; null — уровень максимальный
  upgradeCost: number | null
  sellValue: number
}
