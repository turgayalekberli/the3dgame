<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { Game } from '../game/Game'
import GameOverScreen from './GameOverScreen.vue'
import ScoreHud from './ScoreHud.vue'

const container = useTemplateRef<HTMLDivElement>('container')

// Состояние интерфейса: простые значения — их безопасно делать реактивными
const score = ref(0)
const isOver = ref(false)

// Не ref(): Three.js не должен становиться реактивным
let game: Game | null = null

onMounted(() => {
  if (!container.value) return

  game = new Game(container.value, {
    onScore: (value) => {
      score.value = value
    },
    onGameOver: () => {
      isOver.value = true
    },
  })
})

function restart(): void {
  isOver.value = false
  game?.restart()
}

onBeforeUnmount(() => {
  game?.dispose()
  game = null
})
</script>

<template>
  <div ref="container" class="game" />
  <ScoreHud v-if="!isOver" :score="score" />
  <GameOverScreen v-if="isOver" :score="score" @restart="restart" />
</template>

<style scoped>
.game {
  position: fixed;
  inset: 0;
  /* Без масштабирования двойным тапом на мобильных */
  touch-action: none;
}
</style>
