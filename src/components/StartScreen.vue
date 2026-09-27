<script setup lang="ts">
defineProps<{ best: number }>()
</script>

<template>
  <div class="start">
    <h1 class="title">the3dgame</h1>
    <div class="bottom">
      <p class="hint">Коснитесь экрана или нажмите пробел</p>
      <p v-if="best > 0" class="best">Лучший: {{ best }}</p>
    </div>
  </div>
</template>

<style scoped>
.start {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 10vh 1rem;
  text-align: center;
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.5);
  /* Весь экран — «кнопка»: клики проходят в игру, её Input и запускает партию */
  pointer-events: none;
  user-select: none;
}

.title {
  margin: 0;
  font-size: clamp(2.5rem, 9vw, 5rem);
  font-weight: 800;
  letter-spacing: 0.05em;
}

.bottom {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hint {
  margin: 0;
  font-size: 1.1rem;
  animation: pulse 1.6s ease-in-out infinite;
}

.best {
  margin: 0;
  opacity: 0.6;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}
</style>
