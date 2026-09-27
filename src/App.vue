<script setup lang="ts">
import { REVISION } from 'three'

const title = 'the3dgame'
</script>

<template>
  <main class="hello">
    <h1>{{ title }}</h1>
    <p>Vue 3 + Vite + Three.js r{{ REVISION }} — фундамент готов.</p>
  </main>
</template>

<style scoped>
.hello {
  display: grid;
  place-content: center;
  min-height: 100vh;
  text-align: center;
}
</style>
