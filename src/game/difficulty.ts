import { MOVE_SPEED_MAX, MOVE_SPEED_RAMP, MOVE_SPEED_START } from './config'

// Скорость плиты для текущего счёта: быстрый рост в начале, плавный выход на предел
export function moveSpeed(score: number): number {
  const remaining = (MOVE_SPEED_MAX - MOVE_SPEED_START) * Math.exp(-score / MOVE_SPEED_RAMP)
  return MOVE_SPEED_MAX - remaining
}
