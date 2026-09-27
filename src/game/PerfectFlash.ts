import * as THREE from 'three'
import { BLOCK_HEIGHT, FLASH_DURATION, FLASH_GROWTH } from './config'
import { easeOutQuad } from './easing'

// Вспышка при идеальном попадании: белый прямоугольник на стыке плит расширяется и гаснет
export class PerfectFlash {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  private age = 0

  constructor(width: number, depth: number, position: THREE.Vector3) {
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      // Basic: не зависит от света; depthWrite: false — не загораживает то, что за ней
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false }),
    )

    // PlaneGeometry создаётся вертикальной — кладём её горизонтально
    this.mesh.rotation.x = -Math.PI / 2

    // Чуть выше стыка с нижней плитой, чтобы не мерцать с её верхней гранью
    this.mesh.position.copy(position)
    this.mesh.position.y -= BLOCK_HEIGHT / 2 - 0.01
  }

  // Возвращает false, когда вспышка закончилась
  update(delta: number): boolean {
    this.age += delta
    const t = Math.min(this.age / FLASH_DURATION, 1)

    // Быстро вылетает, плавно замедляется
    const scale = THREE.MathUtils.lerp(1, FLASH_GROWTH, easeOutQuad(t))

    // После поворота локальные X/Y плоскости смотрят вдоль мировых X/Z
    this.mesh.scale.set(scale, scale, 1)
    this.mesh.material.opacity = 1 - t

    return t < 1
  }

  dispose(): void {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
  }
}
