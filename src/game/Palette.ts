import * as THREE from 'three'
import { HUE_STEP } from './config'

// Процедурная палитра одной партии: случайный стартовый оттенок и плавный дрейф по кругу
export class Palette {
  private readonly baseHue = Math.random()

  private hue(index: number): number {
    return (this.baseHue + index * HUE_STEP) % 1
  }

  // Цвет плиты: насыщенность и яркость слегка «дышат», чтобы соседние плиты различались
  block(index: number): THREE.Color {
    const saturation = 0.6 + 0.1 * Math.sin(index * 0.7)
    const lightness = 0.55 + 0.07 * Math.sin(index * 0.45)
    return new THREE.Color().setHSL(this.hue(index), saturation, lightness, THREE.SRGBColorSpace)
  }

  // Цвет фона: тот же оттенок, но тёмный и приглушённый, чтобы плиты на нём читались.
  // Пишет результат в target, чтобы не создавать новый объект каждый кадр
  background(index: number, target: THREE.Color): THREE.Color {
    return target.setHSL(this.hue(index), 0.35, 0.16, THREE.SRGBColorSpace)
  }
}
