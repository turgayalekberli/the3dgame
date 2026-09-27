import * as THREE from 'three'
import { HEALTH_BAR_HEIGHT, HEALTH_BAR_PADDING, HEALTH_BAR_WIDTH } from '../config'

const INNER_WIDTH = HEALTH_BAR_WIDTH - HEALTH_BAR_PADDING * 2
const INNER_HEIGHT = HEALTH_BAR_HEIGHT - HEALTH_BAR_PADDING * 2

// Полоска HP: фон и заливка — спрайты, они всегда повёрнуты к камере
export class HealthBar {
  readonly group = new THREE.Group()
  private readonly fill: THREE.Sprite

  constructor(background: THREE.SpriteMaterial, fill: THREE.SpriteMaterial) {
    const back = new THREE.Sprite(background)
    back.scale.set(HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT, 1)

    this.fill = new THREE.Sprite(fill)
    this.fill.scale.set(INNER_WIDTH, INNER_HEIGHT, 1)

    // Глубина одинаковая — порядок задаём явно: заливка поверх фона
    back.renderOrder = 1
    this.fill.renderOrder = 2

    this.group.add(back, this.fill)
  }

  // ratio — доля оставшегося HP, от 0 до 1
  set(ratio: number): void {
    const value = THREE.MathUtils.clamp(ratio, 0, 1)
    this.fill.visible = value > 0
    if (value === 0) return

    this.fill.scale.x = INNER_WIDTH * value
    // Точка привязки спрайта задаётся в долях его ширины. Сдвигаем её так, чтобы левый край
    // заливки оставался у левого края фона. Сдвиг позицией не подходит: он в мировых
    // координатах и разъехался бы при повороте камеры
    this.fill.center.x = 1 / (2 * value)
  }
}
