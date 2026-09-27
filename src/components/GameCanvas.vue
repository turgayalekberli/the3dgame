<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { Game } from '../game/Game'

const container = useTemplateRef<HTMLDivElement>('container')

// Не ref(): Three.js не должен становиться реактивным
let game: Game | null = null

onMounted(() => {
  if (container.value) game = new Game(container.value)
})

onBeforeUnmount(() => {
  game?.dispose()
  game = null
})
</script>

<template>
  <div ref="container" class="game" />
</template>

<style scoped>
.game {
  position: fixed;
  inset: 0;
}
</style>
