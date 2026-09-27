import * as THREE from 'three'
import { FLASH_INTENSITY } from '../config'
import { easeOutQuad } from '../easing'
import { Tween } from '../Tween'

// Вспышка: светящаяся сфера быстро расширяется и гаснет
export class Explosion {
  readonly mesh: THREE.Mesh
  // Свой материал у каждой вспышки — прозрачность у всех разная
  private readonly material: THREE.MeshBasicMaterial
  private readonly tween: Tween

  // geometry — общая сфера единичного радиуса
  constructor(geometry: THREE.BufferGeometry, position: THREE.Vector3, radius: number, color: number, duration: number) {
    this.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(FLASH_INTENSITY),
      transparent: true,
      depthWrite: false,
      // Сложение цветов: перекрывающиеся вспышки становятся ярче, а не заслоняют друг друга
      blending: THREE.AdditiveBlending,
    })
    this.mesh = new THREE.Mesh(geometry, this.material)
    this.mesh.position.copy(position)
    this.mesh.scale.setScalar(0.001)

    this.tween = new Tween(duration, (t) => {
      this.mesh.scale.setScalar(radius * easeOutQuad(t))
      this.material.opacity = 1 - t
    })
  }

  // Возвращает false, когда вспышка догорела
  update(delta: number): boolean {
    return this.tween.update(delta)
  }

  dispose(): void {
    this.material.dispose()
  }
}
