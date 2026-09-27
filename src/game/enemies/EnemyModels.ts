import * as THREE from 'three'
import { COLORS, NEON_INTENSITY } from '../config'
import type { EnemyType } from '../types'
import { HealthBar } from './HealthBar'

// Модель врага: корень едет по пути и поворачивается, корпус покачивается внутри него
export interface EnemyModel {
  readonly root: THREE.Group
  readonly body: THREE.Group
  // Высота корпуса над полом
  readonly hover: number
  readonly bar: HealthBar
}

interface Prototype {
  body: THREE.Group
  hover: number
  barHeight: number
}

function group(...children: THREE.Object3D[]): THREE.Group {
  const result = new THREE.Group()
  result.add(...children)
  return result
}

// Фабрика моделей врагов. Геометрии и материалы создаются один раз на тип и общие
// для всех экземпляров: clone() копирует объекты сцены, но не ресурсы GPU
export class EnemyModels {
  private readonly geometries: THREE.BufferGeometry[] = []
  private readonly materials: THREE.Material[] = []
  private readonly metal: THREE.MeshStandardMaterial
  private readonly barBackground: THREE.SpriteMaterial
  private readonly barFill: THREE.SpriteMaterial
  private readonly prototypes: Record<EnemyType, Prototype>

  constructor() {
    this.metal = this.track(
      new THREE.MeshStandardMaterial({ color: COLORS.enemyMetal, metalness: 0.4, roughness: 0.5 }),
    )
    // Полоски не пишут глубину — не перекрывают друг друга «дырами»
    this.barBackground = this.track(new THREE.SpriteMaterial({ color: COLORS.healthBack, depthWrite: false }))
    this.barFill = this.track(new THREE.SpriteMaterial({ color: COLORS.healthFill, depthWrite: false }))

    this.prototypes = {
      drone: this.createDrone(),
      runner: this.createRunner(),
      tank: this.createTank(),
    }
  }

  create(type: EnemyType): EnemyModel {
    const prototype = this.prototypes[type]

    const body = prototype.body.clone()
    body.position.y = prototype.hover

    const bar = new HealthBar(this.barBackground, this.barFill)
    bar.group.position.y = prototype.barHeight

    const root = group(body, bar.group)
    return { root, body, hover: prototype.hover, bar }
  }

  // Дрон: тёмный октаэдр в неоновом кольце, снизу — свечение двигателя
  private createDrone(): Prototype {
    const neon = this.neon(COLORS.drone)

    const core = this.mesh(new THREE.OctahedronGeometry(0.35), this.metal)
    const ring = this.mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 24), neon)
    ring.rotation.x = Math.PI / 2
    const thruster = this.mesh(new THREE.SphereGeometry(0.12, 8, 6), neon)
    thruster.position.y = -0.35

    return { body: group(core, ring, thruster), hover: 0.8, barHeight: 1.5 }
  }

  // Бегун: низкий клин остриём вперёд, сзади — светящееся сопло
  private createRunner(): Prototype {
    const neon = this.neon(COLORS.runner)

    // Конус вытянут вдоль Y — кладём его остриём по +Z, это «вперёд» для врага
    const hull = this.mesh(new THREE.ConeGeometry(0.3, 0.9, 4), this.metal)
    hull.rotation.x = Math.PI / 2
    const nozzle = this.mesh(new THREE.SphereGeometry(0.14, 8, 6), neon)
    nozzle.position.z = -0.45

    return { body: group(hull, nozzle), hover: 0.35, barHeight: 1 }
  }

  // Танк: массивный корпус с неоновым поясом, шестигранная башня с орудием
  private createTank(): Prototype {
    const neon = this.neon(COLORS.tank)

    const hull = this.mesh(new THREE.BoxGeometry(0.9, 0.45, 1.1), this.metal)
    // Чуть шире корпуса — выступает светящейся полосой
    const band = this.mesh(new THREE.BoxGeometry(0.94, 0.06, 1.14), neon)
    const turret = this.mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.3, 6), this.metal)
    turret.position.y = 0.37
    const barrel = this.mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), this.metal)
    barrel.rotation.x = Math.PI / 2
    barrel.position.set(0, 0.37, 0.4)

    return { body: group(hull, band, turret, barrel), hover: 0.3, barHeight: 1.3 }
  }

  private mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
    this.geometries.push(geometry)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    return mesh
  }

  private neon(color: number): THREE.MeshStandardMaterial {
    return this.track(
      new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: NEON_INTENSITY }),
    )
  }

  private track<T extends THREE.Material>(material: T): T {
    this.materials.push(material)
    return material
  }

  dispose(): void {
    for (const geometry of this.geometries) geometry.dispose()
    for (const material of this.materials) material.dispose()
  }
}
