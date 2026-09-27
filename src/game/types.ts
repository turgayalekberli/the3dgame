export type Axis = 'x' | 'z'

// Колбэки, через которые игра сообщает наружу о событиях
export interface GameEvents {
  onScore: (score: number) => void
  onGameOver: (score: number) => void
}
