import * as THREE from 'three'
import {
  CELL_SIZE,
  HIGHLIGHT_INTENSITY,
  HIGHLIGHT_WIDTH,
  RANGE_FILL_OPACITY,
  RANGE_RING_WIDTH,
  TILE_GAP,
  TILE_HEIGHT,
} from '../config'

// Чуть выше плиток — без z-fighting с их верхом и рамками
const HEIGHT = TILE_HEIGHT + 0.02
const RING_SEGMENTS = 96

// Плоский меш: геометрия строится в плоскости XY, кладём её на пол
function flat(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2
  return mesh
}

// Рамка на клетке и круг радиуса башни: подсветка клетки под курсором при постройке
// и выделение выбранной построенной башни
export class CellHighlight {
  readonly group = new THREE.Group()

  private readonly frameMaterial = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })
  private readonly ringMaterial = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })
  private readonly fillMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: RANGE_FILL_OPACITY,
    depthWrite: false,
  })

  private readonly frame: THREE.Mesh
  private readonly ring: THREE.Mesh
  private readonly fill: THREE.Mesh

  // Радиус, под который построено кольцо (перестраиваем только при смене башни)
  private radius = 1

  constructor() {
    // Кольцо из 4 сегментов, повёрнутое на 45°, — квадратная рамка по размеру плитки
    const outer = ((CELL_SIZE * (1 - TILE_GAP)) / 2) * Math.SQRT2
    const inner = outer - HIGHLIGHT_WIDTH * Math.SQRT2
    this.frame = flat(new THREE.RingGeometry(inner, outer, 4, 1, Math.PI / 4), this.frameMaterial)

    this.ring = flat(this.createRing(this.radius), this.ringMaterial)
    // Круг единичного радиуса — растягиваем масштабом
    this.fill = flat(new THREE.CircleGeometry(1, RING_SEGMENTS), this.fillMaterial)

    this.group.add(this.frame, this.ring, this.fill)
    this.group.visible = false
  }

  // position — центр клетки; radius — радиус башни в мировых единицах
  show(position: THREE.Vector3, frameColor: number, radius: number, rangeColor: number): void {
    this.group.visible = true
    this.group.position.set(position.x, HEIGHT, position.z)

    this.frameMaterial.color.set(frameColor).multiplyScalar(HIGHLIGHT_INTENSITY)
    this.ringMaterial.color.set(rangeColor)
    this.fillMaterial.color.set(rangeColor)

    if (radius !== this.radius) {
      this.radius = radius
      this.ring.geometry.dispose()
      this.ring.geometry = this.createRing(radius)
      this.fill.scale.set(radius, radius, 1)
    }
  }

  hide(): void {
    this.group.visible = false
  }

  // Толщина линии кольца постоянна в мировых единицах, поэтому кольцо не масштабируем, а перестраиваем
  private createRing(radius: number): THREE.RingGeometry {
    return new THREE.RingGeometry(radius - RANGE_RING_WIDTH, radius, RING_SEGMENTS)
  }

  dispose(): void {
    this.frame.geometry.dispose()
    this.ring.geometry.dispose()
    this.fill.geometry.dispose()
    this.frameMaterial.dispose()
    this.ringMaterial.dispose()
    this.fillMaterial.dispose()
  }
}
