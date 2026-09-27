import { START_CREDITS, START_LIVES } from './config'
import type { GameState } from './types'
import { WAVES } from './waves/waves'

// Состояние, которое видит интерфейс. Только примитивы: Vue оборачивает объект в reactive(),
// а игра лишь записывает в него значения — сама о Vue ничего не знает
export interface GameStore {
  state: GameState
  credits: number
  lives: number
  // Номер текущей волны (0 — ни одна ещё не начиналась)
  wave: number
  totalWaves: number
}

export function initialState(): GameStore {
  return {
    state: 'build',
    credits: START_CREDITS,
    lives: START_LIVES,
    wave: 0,
    totalWaves: WAVES.length,
  }
}
