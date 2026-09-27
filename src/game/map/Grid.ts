import * as THREE from 'three'
import { CELL_SIZE } from '../config'
import type { CellType, GridPoint, LevelData } from '../types'

// Клеточное поле: тип каждой клетки и перевод координат сетки в мировые
export class Grid {
  readonly cols: number
  readonly rows: number
  readonly waypoints: readonly GridPoint[]
  private readonly cells: CellType[]

  constructor(level: LevelData) {
    this.cols = level.cols
    this.rows = level.rows
    this.waypoints = level.waypoints
    this.cells = new Array<CellType>(level.cols * level.rows).fill('buildable')

    for (const point of level.blocked) this.set(point, 'blocked')
    // Дорога размечается после препятствий и при пересечении побеждает
    this.markPath(level.waypoints)
  }

  get width(): number {
    return this.cols * CELL_SIZE
  }

  get depth(): number {
    return this.rows * CELL_SIZE
  }

  get spawn(): GridPoint {
    return this.waypoints[0]
  }

  get base(): GridPoint {
    return this.waypoints[this.waypoints.length - 1]
  }

  // null — клетка за пределами карты
  cellAt(col: number, row: number): CellType | null {
    return this.inside(col, row) ? this.cells[row * this.cols + col] : null
  }

  // Центр клетки на уровне пола (y = 0); карта отцентрована в начале координат
  toWorld(point: GridPoint, target = new THREE.Vector3()): THREE.Vector3 {
    return target.set(
      (point.col - (this.cols - 1) / 2) * CELL_SIZE,
      0,
      (point.row - (this.rows - 1) / 2) * CELL_SIZE,
    )
  }

  // Клетка под мировой точкой; null — за пределами карты
  fromWorld(x: number, z: number): GridPoint | null {
    const col = Math.floor(x / CELL_SIZE + this.cols / 2)
    const row = Math.floor(z / CELL_SIZE + this.rows / 2)
    return this.inside(col, row) ? { col, row } : null
  }

  // Уникальный номер клетки — ключ для словарей
  key(point: GridPoint): number {
    return point.row * this.cols + point.col
  }

  forEach(callback: (point: GridPoint, type: CellType) => void): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        callback({ col, row }, this.cells[row * this.cols + col])
      }
    }
  }

  // Клетки между соседними точками пути — дорога, последняя точка — база
  private markPath(waypoints: readonly GridPoint[]): void {
    if (waypoints.length < 2) throw new Error('Путь должен содержать хотя бы две точки')

    for (let i = 1; i < waypoints.length; i++) {
      const from = waypoints[i - 1]
      const to = waypoints[i]
      if (from.col !== to.col && from.row !== to.row) {
        throw new Error(`Отрезок пути ${i} не горизонтальный и не вертикальный`)
      }

      const stepCol = Math.sign(to.col - from.col)
      const stepRow = Math.sign(to.row - from.row)
      let col = from.col
      let row = from.row
      this.set({ col, row }, 'path')
      while (col !== to.col || row !== to.row) {
        col += stepCol
        row += stepRow
        this.set({ col, row }, 'path')
      }
    }

    this.set(this.base, 'base')
  }

  private set(point: GridPoint, type: CellType): void {
    if (!this.inside(point.col, point.row)) {
      throw new Error(`Клетка (${point.col}, ${point.row}) за пределами карты`)
    }
    this.cells[point.row * this.cols + point.col] = type
  }

  private inside(col: number, row: number): boolean {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows
  }
}
