import * as THREE from 'three'
import type { Grid } from './Grid'

// Путь врагов: ломаная по центрам клеток-waypoints, от портала до базы
export class Path {
  readonly length: number
  private readonly points: THREE.Vector3[]
  // Дистанция от начала пути до каждой точки
  private readonly distances: number[]

  constructor(grid: Grid) {
    this.points = grid.waypoints.map((point) => grid.toWorld(point))
    this.distances = [0]
    for (let i = 1; i < this.points.length; i++) {
      this.distances.push(this.distances[i - 1] + this.points[i - 1].distanceTo(this.points[i]))
    }
    this.length = this.distances[this.distances.length - 1]
  }

  // Точка на дистанции distance от начала пути и единичное направление движения в ней
  sample(distance: number, position: THREE.Vector3, direction: THREE.Vector3): void {
    const d = THREE.MathUtils.clamp(distance, 0, this.length)

    // Отрезок, на котором лежит точка (точек мало — хватает линейного поиска)
    let i = 1
    while (i < this.points.length - 1 && this.distances[i] < d) i++

    const from = this.points[i - 1]
    const to = this.points[i]
    const segment = this.distances[i] - this.distances[i - 1]
    const t = segment > 0 ? (d - this.distances[i - 1]) / segment : 0

    position.lerpVectors(from, to, t)
    direction.subVectors(to, from).normalize()
  }
}
