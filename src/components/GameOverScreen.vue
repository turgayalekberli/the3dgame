<script setup lang="ts">
defineProps<{ score: number }>()

const emit = defineEmits<{ restart: [] }>()
</script>

<template>
  <div class="overlay">
    <p class="title">Игра окончена</p>
    <p class="score">Счёт: {{ score }}</p>
    <button type="button" class="button" @click="emit('restart')">Ещё раз</button>
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
</style>
