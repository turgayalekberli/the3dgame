<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

defineProps<{
  score: number
  best: number
  isNewBest: boolean
}>()

const emit = defineEmits<{ restart: [] }>()

// Фокус на кнопку с задержкой: чтобы пробел/Enter «по инерции» не перезапустили игру сразу
const FOCUS_DELAY = 500

const button = useTemplateRef<HTMLButtonElement>('button')
let focusTimer: number | undefined

onMounted(() => {
  focusTimer = window.setTimeout(() => button.value?.focus(), FOCUS_DELAY)
})

onBeforeUnmount(() => {
  window.clearTimeout(focusTimer)
})
</script>

<template>
  <div class="overlay">
    <p class="title">Игра окончена</p>
    <p v-if="isNewBest" class="badge">Новый рекорд!</p>
    <p class="score">Счёт: {{ score }}</p>
    <p class="best">Лучший: {{ best }}</p>
    <button ref="button" type="button" class="button" @click="emit('restart')">Ещё раз</button>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgb(0 0 0 / 0.55);
}

.title {
  margin: 0;
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 700;
}

.score {
  margin: 0;
  font-size: 1.5rem;
  opacity: 0.85;
}

.button {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  font: inherit;
  font-size: 1.25rem;
  color: #111;
  background: #eee;
  border: none;
  border-radius: 999px;
  cursor: pointer;
}

.button:hover {
  background: #fff;
}

.button:focus-visible {
  outline: 3px solid #ffd166;
  outline-offset: 3px;
}

.badge {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffd166;
  animation: pop 0.4s ease-out;
}

.best {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.6;
}

@keyframes pop {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
