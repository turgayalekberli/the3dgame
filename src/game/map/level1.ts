import type { GridPoint, LevelData } from '../types'

const p = (col: number, row: number): GridPoint => ({ col, row })

// Первая карта: змейка слева направо, база у правого края
export const LEVEL_1: LevelData = {
  cols: 14,
  rows: 10,
  waypoints: [p(0, 1), p(3, 1), p(3, 7), p(7, 7), p(7, 2), p(11, 2), p(11, 6), p(13, 6)],
  blocked: [p(1, 5), p(5, 4), p(9, 9), p(13, 0)],
}
