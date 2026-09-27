import * as THREE from 'three'
import { BLOCK_HEIGHT } from './config'

export class Block {
  readonly width: number
  readonly depth: number
  readonly mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>

  constructor(width: number, depth: number, color: THREE.ColorRepresentation) {
    this.width = width
    this.depth = depth
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, BLOCK_HEIGHT, depth),
      new THREE.MeshStandardMaterial({ color }),
    )
    // Плита и отбрасывает тень, и принимает тени от других
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
  }

  dispose(): void {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
  }
}
