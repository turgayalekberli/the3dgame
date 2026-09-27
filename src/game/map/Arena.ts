import * as THREE from 'three'
import {
  ARENA_MARGIN,
  BASE_CORE_SIZE,
  BASE_CORE_Y,
  BASE_HEIGHT,
  BASE_LIGHT_DISTANCE,
  BASE_LIGHT_INTENSITY,
  BASE_RADIUS,
  BASE_SPIN_SPEED,
  BLOCKED_HEIGHT,
  CELL_SIZE,
  COLORS,
  FLOOR_THICKNESS,
  GRID_INTENSITY,
  NEON_INTENSITY,
  PATH_LINE_HEIGHT,
  PATH_LINE_WIDTH,
  PORTAL_RADIUS,
  PORTAL_TUBE,
  TILE_GAP,
  TILE_HEIGHT,
} from '../config'
import type { CellType, GridPoint } from '../types'
import type { Grid } from './Grid'

// Статичное окружение уровня: пол, плитки, светящаяся сетка, дорога, портал спавна и база
export class Arena {
  readonly group = new THREE.Group()
  private readonly grid: Grid

  // Всё созданное здесь освобождается в dispose()
  private readonly geometries: THREE.BufferGeometry[] = []
  private readonly materials: THREE.Material[] = []

  // Анимируемые части
  private readonly portalMaterial: THREE.MeshStandardMaterial
  private readonly core: THREE.Mesh
  private readonly ring: THREE.Mesh
  private time = 0

  constructor(grid: Grid) {
    this.grid = grid

    this.group.add(this.createFloor(), this.createGridLines(), this.createPathLine())
    this.addTiles('buildable', TILE_HEIGHT, COLORS.tile)
    this.addTiles('blocked', BLOCKED_HEIGHT, COLORS.blocked)

    this.portalMaterial = this.neon(COLORS.spawn)
    this.group.add(this.createPortal(this.portalMaterial))

    const base = this.createBase()
    this.core = base.core
    this.ring = base.ring
    this.group.add(base.group)
  }

  update(delta: number): void {
    this.time += delta

    // Ядро базы вращается и покачивается, кольцо «дышит»
    this.core.rotation.y += BASE_SPIN_SPEED * delta
    this.core.position.y = BASE_CORE_Y + Math.sin(this.time * 2) * 0.12
    this.ring.scale.setScalar(1 + Math.sin(this.time * 3) * 0.08)

    // Портал пульсирует яркостью
    this.portalMaterial.emissiveIntensity = NEON_INTENSITY * (0.75 + 0.25 * Math.sin(this.time * 4))
  }

  private createFloor(): THREE.Mesh {
    const margin = ARENA_MARGIN * CELL_SIZE * 2
    const geometry = this.geometry(
      new THREE.BoxGeometry(this.grid.width + margin, FLOOR_THICKNESS, this.grid.depth + margin),
    )
    const floor = new THREE.Mesh(geometry, this.metal(COLORS.floor))
    floor.position.y = -FLOOR_THICKNESS / 2
    floor.receiveShadow = true
    return floor
  }

  // Линии по границам клеток на уровне пола: светятся в зазорах между плитками и на дороге
  private createGridLines(): THREE.LineSegments {
    const halfWidth = this.grid.width / 2
    const halfDepth = this.grid.depth / 2
    const y = 0.01
    const points: number[] = []

    for (let col = 0; col <= this.grid.cols; col++) {
      const x = -halfWidth + col * CELL_SIZE
      points.push(x, y, -halfDepth, x, y, halfDepth)
    }
    for (let row = 0; row <= this.grid.rows; row++) {
      const z = -halfDepth + row * CELL_SIZE
      points.push(-halfWidth, y, z, halfWidth, y, z)
    }

    const geometry = this.geometry(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(points, 3)),
    )
    // Цвет ярче 1 — линии проходят порог bloom
    const color = new THREE.Color(COLORS.grid).multiplyScalar(GRID_INTENSITY)
    const material = this.track(new THREE.LineBasicMaterial({ color }))
    return new THREE.LineSegments(geometry, material)
  }

  // Неоновая осевая линия дороги: по полоске на каждый отрезок пути
  private createPathLine(): THREE.Group {
    const group = new THREE.Group()
    const material = this.neon(COLORS.path)
    const from = new THREE.Vector3()
    const to = new THREE.Vector3()
    const waypoints = this.grid.waypoints

    for (let i = 1; i < waypoints.length; i++) {
      this.grid.toWorld(waypoints[i - 1], from)
      this.grid.toWorld(waypoints[i], to)

      // Удлиняем на ширину полоски — стыки в углах без щелей
      const length = from.distanceTo(to) + PATH_LINE_WIDTH
      const geometry = this.geometry(new THREE.BoxGeometry(PATH_LINE_WIDTH, PATH_LINE_HEIGHT, length))
      const strip = new THREE.Mesh(geometry, material)
      strip.position.addVectors(from, to).multiplyScalar(0.5)
      strip.position.y = PATH_LINE_HEIGHT / 2
      // lookAt разворачивает локальную ось Z (длину полоски) к следующей точке
      strip.lookAt(to.x, strip.position.y, to.z)
      group.add(strip)
    }

    return group
  }

  // Плитки одного типа клеток — одним InstancedMesh (один draw call на все)
  private addTiles(type: CellType, height: number, color: number): void {
    const cells: GridPoint[] = []
    this.grid.forEach((point, cellType) => {
      if (cellType === type) cells.push(point)
    })
    if (cells.length === 0) return

    const size = CELL_SIZE * (1 - TILE_GAP)
    const geometry = this.geometry(new THREE.BoxGeometry(size, height, size))
    const mesh = new THREE.InstancedMesh(geometry, this.metal(color), cells.length)

    const position = new THREE.Vector3()
    const matrix = new THREE.Matrix4()
    cells.forEach((point, i) => {
      this.grid.toWorld(point, position)
      mesh.setMatrixAt(i, matrix.makeTranslation(position.x, height / 2, position.z))
    })

    mesh.castShadow = true
    mesh.receiveShadow = true
    this.group.add(mesh)
  }

  private createPortal(material: THREE.Material): THREE.Mesh {
    const spawn = this.grid.toWorld(this.grid.spawn)
    const next = this.grid.toWorld(this.grid.waypoints[1])

    const geometry = this.geometry(new THREE.TorusGeometry(PORTAL_RADIUS, PORTAL_TUBE, 12, 48))
    const portal = new THREE.Mesh(geometry, material)
    portal.position.set(spawn.x, PORTAL_RADIUS + PORTAL_TUBE, spawn.z)
    // Тор лежит в плоскости XY: разворачиваем его «лицом» вдоль первого отрезка пути
    portal.rotation.y = Math.atan2(next.x - spawn.x, next.z - spawn.z)
    return portal
  }

  private createBase(): { group: THREE.Group; core: THREE.Mesh; ring: THREE.Mesh } {
    const group = new THREE.Group()
    this.grid.toWorld(this.grid.base, group.position)

    // Шестигранная платформа
    const platform = new THREE.Mesh(
      this.geometry(new THREE.CylinderGeometry(BASE_RADIUS, BASE_RADIUS * 1.1, BASE_HEIGHT, 6)),
      this.metal(COLORS.baseBody),
    )
    platform.position.y = BASE_HEIGHT / 2
    platform.castShadow = true
    platform.receiveShadow = true

    const baseMaterial = this.neon(COLORS.base)

    // Парящее энергоядро
    const core = new THREE.Mesh(this.geometry(new THREE.OctahedronGeometry(BASE_CORE_SIZE)), baseMaterial)
    core.position.y = BASE_CORE_Y

    // Кольцо по краю платформы
    const ring = new THREE.Mesh(
      this.geometry(new THREE.TorusGeometry(BASE_RADIUS * 0.8, 0.04, 8, 48)),
      baseMaterial,
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = BASE_HEIGHT + 0.05

    // Локальная бирюзовая подсветка окружения
    const light = new THREE.PointLight(COLORS.base, BASE_LIGHT_INTENSITY, BASE_LIGHT_DISTANCE)
    light.position.y = BASE_CORE_Y

    group.add(platform, core, ring, light)
    return { group, core, ring }
  }

  // Светящийся материал: цвет задаёт только emissive
  private neon(color: number): THREE.MeshStandardMaterial {
    return this.track(
      new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: NEON_INTENSITY }),
    )
  }

  // Матовый тёмный металл (без карты окружения высокий metalness выглядит чёрным)
  private metal(color: number): THREE.MeshStandardMaterial {
    return this.track(new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.6 }))
  }

  private track<T extends THREE.Material>(material: T): T {
    this.materials.push(material)
    return material
  }

  private geometry<T extends THREE.BufferGeometry>(geometry: T): T {
    this.geometries.push(geometry)
    return geometry
  }

  dispose(): void {
    for (const geometry of this.geometries) geometry.dispose()
    for (const material of this.materials) material.dispose()
  }
}
