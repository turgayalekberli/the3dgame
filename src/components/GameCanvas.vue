<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, readonly, useTemplateRef } from 'vue'
import { Game } from '../game/Game'
import { initialState } from '../game/store'
import Hud from './Hud.vue'

const container = useTemplateRef<HTMLDivElement>('container')

// Состояние для интерфейса: пишет только Game, компоненты получают версию только для чтения
const store = reactive(initialState())
const view = readonly(store)

// Не ref(): Three.js не должен становиться реактивным
let game: Game | null = null

onMounted(() => {
  if (!container.value) return
  game = new Game(container.value, store)
})

// Команды из интерфейса — через публичные методы игры
function startWave(): void {
  game?.startWave()
}

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
  <Hud :store="view" @start-wave="startWave" @restart="restart" />
</template>

<style scoped>
.game {
  position: fixed;
  inset: 0;
}
</style>
