// Анимация по времени: считает прогресс t от 0 до 1 и отдаёт его в onUpdate
export class Tween {
  private readonly duration: number
  private readonly onUpdate: (t: number) => void
  private age = 0

  constructor(duration: number, onUpdate: (t: number) => void) {
    this.duration = duration
    this.onUpdate = onUpdate
  }

  // Возвращает false, когда анимация закончилась
  update(delta: number): boolean {
    this.age += delta
    const t = Math.min(this.age / this.duration, 1)
    this.onUpdate(t)
    return t < 1
  }
}
