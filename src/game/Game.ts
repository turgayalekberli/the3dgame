import * as THREE from 'three'

export class Game {
  private readonly container: HTMLElement
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
  private readonly clock = new THREE.Clock()
  private readonly resizeObserver: ResizeObserver

  constructor(container: HTMLElement) {
    this.container = container

    // Renderer: рисует кадр в <canvas>
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(this.renderer.domElement)

    this.scene.background = new THREE.Color(0x111111)

    // Camera: угол обзора 60°, видит от 0.1 до 100 единиц
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    this.camera.position.set(3, 3, 5)
    this.camera.lookAt(0, 0, 0)

    // Свет: мягкий общий + направленный «солнечный»
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    const sun = new THREE.DirectionalLight(0xffffff, 1.5)
    sun.position.set(5, 10, 7)
    this.scene.add(ambient, sun)

    // Mesh = Geometry (форма) + Material (поверхность)
    this.cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x4f9dff }),
    )
    this.scene.add(this.cube)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)
    this.resize()

    this.renderer.setAnimationLoop(() => this.tick())
  }

  private resize(): void {
    const { clientWidth: width, clientHeight: height } = this.container
    if (width === 0 || height === 0) return

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  // Игровой цикл: ~60 раз в секунду
  private tick(): void {
    const delta = this.clock.getDelta()

    this.cube.rotation.x += delta * 0.5
    this.cube.rotation.y += delta

    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null)
    this.resizeObserver.disconnect()
    this.cube.geometry.dispose()
    this.cube.material.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
