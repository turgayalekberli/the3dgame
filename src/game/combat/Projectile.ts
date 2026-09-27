import * as THREE from 'three'
import type { Enemy } from '../enemies/Enemy'

// Общий временный вектор: снаряды обновляются по очереди
const step = new THREE.Vector3()

// Самонаводящийся снаряд: летит к цели, а если она погибла — к её последней позиции
export class Projectile {
  readonly mesh: THREE.Mesh
  readonly target: Enemy
  readonly damage: number
  // Радиус сплеша в мировых единицах (0 — урон только по цели)
  readonly splash: number
  // Цвет вспышки при попадании
  readonly color: number
  private readonly speed: number
  private readonly aim = new THREE.Vector3()

  constructor(
    mesh: THREE.Mesh,
    from: THREE.Vector3,
    target: Enemy,
    speed: number,
    damage: number,
    splash: number,
    color: number,
  ) {
    this.mesh = mesh
    this.target = target
    this.speed = speed
    this.damage = damage
    this.splash = splash
    this.color = color

    mesh.position.copy(from)
    mesh.lookAt(target.aimPoint(this.aim))
  }

  // Возвращает true, когда снаряд долетел
  update(delta: number): boolean {
    if (this.target.alive) this.target.aimPoint(this.aim)

    step.subVectors(this.aim, this.mesh.position)
    const distance = step.length()
    const travel = this.speed * delta
    if (distance <= travel) {
      this.mesh.position.copy(this.aim)
      return true
    }

    this.mesh.position.addScaledVector(step, travel / distance)
    // Геометрия вытянута вдоль Z — lookAt разворачивает снаряд носом по курсу
    this.mesh.lookAt(this.aim)
    return false
  }
}
