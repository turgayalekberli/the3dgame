export type Axis = 'x' | 'z'

// Состояния игры: стартовый экран → игра → проигрыш
export type GameState = 'ready' | 'playing' | 'over'

// Колбэки, через которые игра сообщает наружу о событиях
export interface GameEvents {
  onScore: (score: number) => void
  onStateChange: (state: GameState) => void
  onPerfect: (combo: number) => void
}
