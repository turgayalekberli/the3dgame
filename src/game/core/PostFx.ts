import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import type { Pass } from 'three/addons/postprocessing/Pass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { BLOOM_RADIUS, BLOOM_STRENGTH, BLOOM_THRESHOLD, MSAA_SAMPLES } from '../config'

// Постобработка: сцена → bloom (свечение ярких пикселей) → вывод (тонмаппинг и sRGB)
export class PostFx {
  private readonly composer: EffectComposer
  private readonly passes: Pass[]

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    // HalfFloat — чтобы яркость выше 1 не обрезалась до bloom; samples — сглаживание краёв
    const target = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: MSAA_SAMPLES,
    })
    this.composer = new EffectComposer(renderer, target)

    this.passes = [
      new RenderPass(scene, camera),
      new UnrealBloomPass(new THREE.Vector2(1, 1), BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD),
      // Применяет toneMapping рендерера и переводит в sRGB — должен быть последним
      new OutputPass(),
    ]
    for (const pass of this.passes) this.composer.addPass(pass)
  }

  setSize(width: number, height: number): void {
    this.composer.setSize(width, height)
  }

  render(delta: number): void {
    this.composer.render(delta)
  }

  dispose(): void {
    for (const pass of this.passes) pass.dispose()
    this.composer.dispose()
  }
}
