import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  CAMERA_AZIMUTH,
  CAMERA_AZIMUTH_RANGE,
  CAMERA_DAMPING,
  CAMERA_DISTANCE,
  CAMERA_FOV,
  CAMERA_MAX_DISTANCE,
  CAMERA_MAX_POLAR,
  CAMERA_MIN_DISTANCE,
  CAMERA_MIN_POLAR,
  CAMERA_POLAR,
} from '../config'

// Изометрическая камера с ограниченным OrbitControls:
// ПКМ — панорама, средняя кнопка — вращение, колесо — зум. ЛКМ оставлена игре
export class CameraRig {
  readonly camera: THREE.PerspectiveCamera
  private readonly controls: OrbitControls

  // Центр обзора не выходит за пределы карты
  private readonly panMin: THREE.Vector3
  private readonly panMax: THREE.Vector3
  private readonly clamped = new THREE.Vector3()

  constructor(domElement: HTMLElement, halfWidth: number, halfDepth: number) {
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.5, 200)
    // Стартовая позиция — в сферических координатах вокруг центра карты
    this.camera.position.setFromSphericalCoords(CAMERA_DISTANCE, CAMERA_POLAR, CAMERA_AZIMUTH)

    const controls = new OrbitControls(this.camera, domElement)
    controls.enableDamping = true
    controls.dampingFactor = CAMERA_DAMPING
    // Панорама по плоскости пола, а не экрана — камера не «ныряет» при сдвиге
    controls.screenSpacePanning = false
    controls.minDistance = CAMERA_MIN_DISTANCE
    controls.maxDistance = CAMERA_MAX_DISTANCE
    controls.minPolarAngle = CAMERA_MIN_POLAR
    controls.maxPolarAngle = CAMERA_MAX_POLAR
    controls.minAzimuthAngle = CAMERA_AZIMUTH - CAMERA_AZIMUTH_RANGE
    controls.maxAzimuthAngle = CAMERA_AZIMUTH + CAMERA_AZIMUTH_RANGE
    controls.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.ROTATE, RIGHT: THREE.MOUSE.PAN }
    controls.target.set(0, 0, 0)
    controls.update()
    this.controls = controls

    this.panMin = new THREE.Vector3(-halfWidth, 0, -halfDepth)
    this.panMax = new THREE.Vector3(halfWidth, 0, halfDepth)
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
  }

  // Каждый кадр: инерция OrbitControls + удержание центра обзора в пределах карты
  update(): void {
    this.controls.update()

    // OrbitControls не умеет ограничивать панораму — возвращаем центр в пределы
    // и сдвигаем камеру на ту же величину, чтобы ракурс не менялся
    const target = this.controls.target
    this.clamped.copy(target).clamp(this.panMin, this.panMax)
    if (!this.clamped.equals(target)) {
      this.camera.position.add(this.clamped).sub(target)
      target.copy(this.clamped)
    }
  }

  dispose(): void {
    this.controls.dispose()
  }
}
