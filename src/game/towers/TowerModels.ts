import * as THREE from 'three'
import { COLORS, NEON_INTENSITY } from '../config'
import type { TowerType } from '../types'

// Высота оси поворота головы над основанием башни
const HEAD_Y = 0.6
const HEAD_NAME = 'head'

// Модель башни: неподвижная платформа и голова, которая поворачивается к цели
export interface TowerModel {
  readonly root: THREE.Group
  readonly head: THREE.Group
}

function group(...children: THREE.Object3D[]): THREE.Group {
  const result = new THREE.Group()
  result.add(...children)
  return result
}

// Фабрика моделей башен: геометрии и материалы общие для всех экземпляров
export class TowerModels {
  private readonly geometries: THREE.BufferGeometry[] = []
  private readonly materials: THREE.Material[] = []
  private readonly metal: THREE.MeshStandardMaterial

  // Детали платформы — одни на все типы, отличается только цвет канта
  private readonly baseGeometry: THREE.BufferGeometry
  private readonly trimGeometry: THREE.BufferGeometry
  private readonly neckGeometry: THREE.BufferGeometry

  private readonly prototypes: Record<TowerType, THREE.Group>

  constructor() {
    this.metal = this.track(
      new THREE.MeshStandardMaterial({ color: COLORS.towerMetal, metalness: 0.5, roughness: 0.45 }),
    )
    this.baseGeometry = this.geometry(new THREE.CylinderGeometry(0.75, 0.85, 0.3, 6))
    this.trimGeometry = this.geometry(new THREE.CylinderGeometry(0.77, 0.77, 0.05, 6))
    this.neckGeometry = this.geometry(new THREE.CylinderGeometry(0.22, 0.3, 0.3, 8))

    this.prototypes = {
      pulse: this.createPulse(),
      rocket: this.createRocket(),
      cryo: this.createCryo(),
    }
  }

  create(type: TowerType): TowerModel {
    const root = this.prototypes[type].clone()
    // clone() не сохраняет ссылки на детали — находим голову по имени
    const head = root.getObjectByName(HEAD_NAME)
    if (!(head instanceof THREE.Group)) throw new Error(`У модели башни ${type} нет головы`)
    return { root, head }
  }

  // Прототип: шестигранная платформа с неоновым кантом + голова на оси поворота
  private assemble(neon: THREE.Material, ...headParts: THREE.Object3D[]): THREE.Group {
    const base = this.mesh(this.baseGeometry, this.metal)
    base.position.y = 0.15
    base.receiveShadow = true
    const trim = this.mesh(this.trimGeometry, neon)
    trim.position.y = 0.28
    const neck = this.mesh(this.neckGeometry, this.metal)
    neck.position.y = 0.45

    const head = group(...headParts)
    head.name = HEAD_NAME
    head.position.y = HEAD_Y

    return group(base, trim, neck, head)
  }

  // Пулемёт: корпус с неоновой полосой и спаренные стволы со светящимися дульными срезами
  private createPulse(): THREE.Group {
    const neon = this.neon(COLORS.pulse)

    const body = this.mesh(this.geometry(new THREE.BoxGeometry(0.5, 0.3, 0.55)), this.metal)
    // Чуть шире корпуса — выступает полосами по бокам
    const stripe = this.mesh(this.geometry(new THREE.BoxGeometry(0.52, 0.05, 0.3)), neon)

    const barrelGeometry = this.geometry(new THREE.CylinderGeometry(0.045, 0.045, 0.6, 8))
    const muzzleGeometry = this.geometry(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 8))
    const parts: THREE.Object3D[] = [body, stripe]
    for (const x of [-0.12, 0.12]) {
      // Цилиндр вытянут по Y — разворачиваем вдоль +Z, «вперёд» для башни
      const barrel = this.mesh(barrelGeometry, this.metal)
      barrel.rotation.x = Math.PI / 2
      barrel.position.set(x, 0, 0.5)
      const muzzle = this.mesh(muzzleGeometry, neon)
      muzzle.rotation.x = Math.PI / 2
      muzzle.position.set(x, 0, 0.8)
      parts.push(barrel, muzzle)
    }

    return this.assemble(neon, ...parts)
  }

  // Ракетница: блок из четырёх пусковых труб, торцы светятся
  private createRocket(): THREE.Group {
    const neon = this.neon(COLORS.rocket)

    const body = this.mesh(this.geometry(new THREE.BoxGeometry(0.7, 0.45, 0.5)), this.metal)
    const tubeGeometry = this.geometry(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 10))
    const capGeometry = this.geometry(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 10))
    const parts: THREE.Object3D[] = [body]
    for (const x of [-0.17, 0.17]) {
      for (const y of [-0.11, 0.11]) {
        const tube = this.mesh(tubeGeometry, this.metal)
        tube.rotation.x = Math.PI / 2
        tube.position.set(x, y, 0.2)
        const cap = this.mesh(capGeometry, neon)
        cap.rotation.x = Math.PI / 2
        cap.position.set(x, y, 0.41)
        parts.push(tube, cap)
      }
    }

    return this.assemble(neon, ...parts)
  }

  // Крио-луч: пилон с вытянутым светящимся кристаллом в кольце
  private createCryo(): THREE.Group {
    const neon = this.neon(COLORS.cryo)

    const pylon = this.mesh(this.geometry(new THREE.CylinderGeometry(0.1, 0.18, 0.4, 6)), this.metal)
    pylon.position.y = 0.2
    const crystal = this.mesh(this.geometry(new THREE.OctahedronGeometry(0.22)), neon)
    crystal.scale.y = 1.6
    crystal.position.y = 0.65
    const ring = this.mesh(this.geometry(new THREE.TorusGeometry(0.3, 0.025, 6, 24)), neon)
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.65

    return this.assemble(neon, pylon, crystal, ring)
  }

  private mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    return mesh
  }

  private neon(color: number): THREE.MeshStandardMaterial {
    return this.track(
      new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: NEON_INTENSITY }),
    )
  }

  private geometry<T extends THREE.BufferGeometry>(geometry: T): T {
    this.geometries.push(geometry)
    return geometry
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
