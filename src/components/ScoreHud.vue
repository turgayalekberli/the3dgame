<script setup lang="ts">
defineProps<{ score: number }>()
</script>

<template>
  <div class="hud">{{ score }}</div>
</template>

<style scoped>
.hud {
  position: fixed;
  top: 8vh;
  left: 0;
  right: 0;
  text-align: center;
  font-size: clamp(3rem, 10vw, 6rem);
  font-weight: 700;
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.5);
  /* Клики проходят сквозь счёт в игру */
  pointer-events: none;
  user-select: none;
}
</style>
