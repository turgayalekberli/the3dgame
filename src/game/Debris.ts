import * as THREE from 'three'
import type { Block } from './Block'
import { DEBRIS_PUSH, DEBRIS_SPIN, GRAVITY } from './config'
import type { Axis } from './types'

// Падающий кусок: простая физика без движка — гравитация, толчок наружу, вращение
export class Debris {
  readonly block: Block
  private readonly velocity = new THREE.Vector3()
  private readonly spin = new THREE.Vector3()

  // side: +1 или −1 — с какой стороны башни кусок свисает
  constructor(block: Block, axis: Axis, side: number) {
    this.block = block

    this.velocity[axis] = side * DEBRIS_PUSH

    // Опрокидывание наружу: вокруг оси, перпендикулярной движению
    if (axis === 'x') this.spin.z = -side * DEBRIS_SPIN
    else this.spin.x = side * DEBRIS_SPIN
  }

  update(delta: number): void {
    this.velocity.y -= GRAVITY * delta

    const mesh = this.block.mesh
    mesh.position.addScaledVector(this.velocity, delta)
    mesh.rotation.x += this.spin.x * delta
    mesh.rotation.z += this.spin.z * delta
  }
}
