<script setup lang="ts">
defineProps<{
  score: number
  combo: number
  // Меняется при каждом идеальном попадании — перезапускает анимацию надписи
  perfectCount: number
}>()
</script>

<template>
  <div class="hud">
    <div class="score">{{ score }}</div>
    <div v-if="perfectCount > 0" :key="perfectCount" class="perfect">
      Идеально{{ combo > 1 ? ` ×${combo}` : '' }}
    </div>
  </div>
</template>

<style scoped>
.hud {
  position: fixed;
  top: 8vh;
  left: 0;
  right: 0;
  text-align: center;
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.5);
  /* Клики проходят сквозь счёт в игру */
  pointer-events: none;
  user-select: none;
}

.score {
  font-size: clamp(3rem, 10vw, 6rem);
  font-weight: 700;
}

.perfect {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  /* forwards: после анимации остаётся в конечном (невидимом) состоянии */
  animation: perfect 0.9s ease-out forwards;
}

@keyframes perfect {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: none;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-8px);
  }
}
</style>
