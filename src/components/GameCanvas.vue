<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { useBestScore } from '../composables/useBestScore'
import { Game } from '../game/Game'
import type { GameState } from '../game/types'
import GameOverScreen from './GameOverScreen.vue'
import ScoreHud from './ScoreHud.vue'
import StartScreen from './StartScreen.vue'

const container = useTemplateRef<HTMLDivElement>('container')

// Состояние интерфейса: простые значения — их безопасно делать реактивными.
// state — копия состояния игры: меняется только по событию из Game
const state = ref<GameState>('ready')
const score = ref(0)
const isNewBest = ref(false)
const combo = ref(0)
const perfectCount = ref(0)

const { best, submit } = useBestScore()

// Не ref(): Three.js не должен становиться реактивным
let game: Game | null = null

onMounted(() => {
  if (!container.value) return

  game = new Game(container.value, {
    onScore: (value) => {
      score.value = value
    },
    onStateChange: (value) => {
      if (value === 'over') isNewBest.value = submit(score.value)
      if (value === 'playing') perfectCount.value = 0
      state.value = value
    },
    onPerfect: (value) => {
      combo.value = value
      perfectCount.value++
    },
  })
})

function restart(): void {
  game?.restart()
}

onBeforeUnmount(() => {
  game?.dispose()
  game = null
})
</script>

<template>
  <div ref="container" class="game" />
  <StartScreen v-if="state === 'ready'" :best="best" />
  <ScoreHud
    v-if="state === 'playing'"
    :score="score"
    :combo="combo"
    :perfect-count="perfectCount"
  />
  <GameOverScreen
    v-if="state === 'over'"
    :score="score"
    :best="best"
    :is-new-best="isNewBest"
    @restart="restart"
  />
</template>

<style scoped>
.game {
  position: fixed;
  inset: 0;
  /* Без масштабирования двойным тапом на мобильных */
  touch-action: none;
}
</style>
