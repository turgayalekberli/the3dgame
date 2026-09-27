import * as THREE from 'three'

// Поля, в которых цифры и Esc принадлежат самому полю
const TEXT_INPUTS = 'input, textarea, select'

export interface PointerEvents {
  // ЛКМ по карте
  onClick: () => void
  // Нажатие клавиши (физический код — не зависит от раскладки)
  onKey: (code: string) => void
}

// Ввод для игры: точка на плоскости под курсором, ЛКМ и клавиши.
// Камерой (ПКМ, средняя кнопка, колесо) занимается OrbitControls
export class Pointer {
  private readonly element: HTMLElement
  private readonly camera: THREE.Camera
  private readonly events: PointerEvents
  private readonly raycaster = new THREE.Raycaster()
  // Курсор в нормализованных координатах экрана (-1..1)
  private readonly ndc = new THREE.Vector2()
  private readonly plane: THREE.Plane
  // Курсор над канвасом (над HUD — уже нет)
  private hovering = false

  constructor(element: HTMLElement, camera: THREE.Camera, planeHeight: number, events: PointerEvents) {
    this.element = element
    this.camera = camera
    this.events = events
    // Горизонтальная плоскость y = planeHeight (уравнение плоскости: normal · p + constant = 0)
    this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeHeight)

    element.addEventListener('pointermove', this.onPointerMove)
    element.addEventListener('pointerleave', this.onPointerLeave)
    element.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('keydown', this.onKeyDown)
  }

  // Точка плоскости под курсором. Считается при каждом вызове:
  // камера может сдвинуться (инерция, панорама) и без движения мыши
  pick(target: THREE.Vector3): boolean {
    if (!this.hovering) return false
    this.raycaster.setFromCamera(this.ndc, this.camera)
    return this.raycaster.ray.intersectPlane(this.plane, target) !== null
  }

  private setFromEvent(event: PointerEvent): void {
    const rect = this.element.getBoundingClientRect()
    this.ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    )
    this.hovering = true
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.setFromEvent(event)
  }

  private readonly onPointerLeave = (): void => {
    this.hovering = false
  }

  // Только основная кнопка мыши: остальные — у камеры
  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || !event.isPrimary) return
    this.setFromEvent(event)
    this.events.onClick()
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) return
    if (event.target instanceof Element && event.target.closest(TEXT_INPUTS)) return
    this.events.onKey(event.code)
  }

  dispose(): void {
    this.element.removeEventListener('pointermove', this.onPointerMove)
    this.element.removeEventListener('pointerleave', this.onPointerLeave)
    this.element.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('keydown', this.onKeyDown)
  }
}
