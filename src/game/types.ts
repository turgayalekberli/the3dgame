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
