import * as THREE from 'three'
import {
  COLORS,
  HIT_FLASH_DURATION,
  HIT_FLASH_RADIUS,
  NEON_INTENSITY,
  PULSE_PROJECTILE_SPEED,
  ROCKET_EXPLOSION_DURATION,
  ROCKET_PROJECTILE_SPEED,
} from '../config'
import type { Enemy } from '../enemies/Enemy'
import type { TowerType } from '../types'
import { Explosion } from './Explosion'
import { Projectile } from './Projectile'

// Внешний вид и скорость снаряда одного типа башни
interface ProjectileKind {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  speed: number
  color: number
}

function neon(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: NEON_INTENSITY })
}

// Снаряды и вспышки: полёт, попадания и урон, в том числе по площади.
// Гибель врагов и награды обрабатывает Game — здесь урон только отнимает HP
export class Combat {
  private readonly scene: THREE.Scene
  private readonly projectiles: Projectile[] = []
  private readonly explosions: Explosion[] = []

  // Сфера единичного радиуса — общая для всех вспышек
  private readonly flashGeometry = new THREE.SphereGeometry(1, 12, 8)

  // Снаряды есть только у башен со скорострельностью; у крио-луча их нет
  private readonly kinds: Partial<Record<TowerType, ProjectileKind>>

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.kinds = {
      // Трассер — тонкий вытянутый брусок
      pulse: {
        geometry: new THREE.BoxGeometry(0.05, 0.05, 0.4),
        material: neon(COLORS.pulse),
        speed: PULSE_PROJECTILE_SPEED,
        color: COLORS.pulse,
      },
      // Ракета — цилиндр, повёрнутый вдоль Z (lookAt направляет по курсу ось Z)
      rocket: {
        geometry: new THREE.CylinderGeometry(0.06, 0.06, 0.3, 6).rotateX(Math.PI / 2),
        material: neon(COLORS.rocket),
        speed: ROCKET_PROJECTILE_SPEED,
        color: COLORS.rocket,
      },
    }
  }

  // splash — радиус сплеша в мировых единицах (0 — без сплеша)
  fire(type: TowerType, from: THREE.Vector3, target: Enemy, damage: number, splash: number): void {
    const kind = this.kinds[type]
    if (!kind) return

    const mesh = new THREE.Mesh(kind.geometry, kind.material)
    this.projectiles.push(new Projectile(mesh, from, target, kind.speed, damage, splash, kind.color))
    this.scene.add(mesh)
  }

  explode(position: THREE.Vector3, radius: number, color: number, duration: number): void {
    const explosion = new Explosion(this.flashGeometry, position, radius, color, duration)
    this.explosions.push(explosion)
    this.scene.add(explosion.mesh)
  }

  // enemies — враги, по которым засчитывается сплеш
  update(delta: number, enemies: readonly Enemy[]): void {
    // С конца: splice сдвигает элементы, при обходе с начала часть пропустили бы
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i]
      if (!projectile.update(delta)) continue

      this.impact(projectile, enemies)
      this.scene.remove(projectile.mesh)
      this.projectiles.splice(i, 1)
    }

    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i]
      if (explosion.update(delta)) continue

      this.removeExplosion(explosion)
      this.explosions.splice(i, 1)
    }
  }

  // Убрать все снаряды и вспышки (рестарт, поражение)
  clear(): void {
    for (const projectile of this.projectiles) this.scene.remove(projectile.mesh)
    for (const explosion of this.explosions) this.removeExplosion(explosion)
    this.projectiles.length = 0
    this.explosions.length = 0
  }

  private impact(projectile: Projectile, enemies: readonly Enemy[]): void {
    const point = projectile.mesh.position

    if (projectile.splash > 0) {
      // Сплеш по горизонтали: высота корпуса (дрон парит выше танка) не влияет на попадание
      const radiusSq = projectile.splash * projectile.splash
      for (const enemy of enemies) {
        if (!enemy.alive) continue
        const dx = enemy.root.position.x - point.x
        const dz = enemy.root.position.z - point.z
        if (dx * dx + dz * dz <= radiusSq) enemy.takeDamage(projectile.damage)
      }
      this.explode(point, projectile.splash, projectile.color, ROCKET_EXPLOSION_DURATION)
      return
    }

    // Цель погибла, пока снаряд летел, — просто гаснет без урона
    if (projectile.target.alive) projectile.target.takeDamage(projectile.damage)
    this.explode(point, HIT_FLASH_RADIUS, projectile.color, HIT_FLASH_DURATION)
  }

  private removeExplosion(explosion: Explosion): void {
    this.scene.remove(explosion.mesh)
    explosion.dispose()
  }

  dispose(): void {
    this.clear()
    this.flashGeometry.dispose()
    for (const kind of Object.values(this.kinds)) {
      kind.geometry.dispose()
      kind.material.dispose()
    }
  }
}
