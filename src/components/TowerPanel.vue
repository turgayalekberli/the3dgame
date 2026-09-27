<script setup lang="ts">
import { TOWER_ORDER, TOWER_STATS } from '../game/towers/towerTypes'
import type { TowerType } from '../game/types'

defineProps<{ credits: number; selected: TowerType | null }>()
const emit = defineEmits<{ select: [type: TowerType] }>()
</script>

<template>
  <div class="panel">
    <!-- Выбранную карточку не блокируем даже без кредитов: по ней выбор снимается -->
    <button
      v-for="(type, index) in TOWER_ORDER"
      :key="type"
      class="card"
      :class="[type, { active: selected === type }]"
      :disabled="credits < TOWER_STATS[type].cost && selected !== type"
      @click="emit('select', type)"
    >
      <span class="hotkey">{{ index + 1 }}</span>
      <span class="name">{{ TOWER_STATS[type].name }}</span>
      <span class="cost">{{ TOWER_STATS[type].cost }}</span>
    </button>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  gap: 0.75rem;
}

/* Цвета совпадают с неоном башен (COLORS в config.ts) */
.pulse {
  --accent: 255 209 102;
}

.rocket {
  --accent: 255 138 61;
}

.cryo {
  --accent: 127 231 255;
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 8rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid rgb(var(--accent) / 0.4);
  border-radius: 6px;
  background: rgb(8 14 28 / 0.75);
  color: #e8f8ff;
  font: inherit;
  text-align: left;
  cursor: pointer;
  pointer-events: auto;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    background 0.15s;
}

.card:hover:not(:disabled) {
  border-color: rgb(var(--accent) / 0.8);
}

.card.active {
  border-color: rgb(var(--accent));
  background: rgb(var(--accent) / 0.15);
  box-shadow: 0 0 18px rgb(var(--accent) / 0.45);
}

.card:disabled {
  opacity: 0.35;
  cursor: default;
}

.hotkey {
  position: absolute;
  top: 0.4rem;
  right: 0.5rem;
  font-size: 0.7rem;
  opacity: 0.5;
}

.name {
  font-weight: 700;
  color: rgb(var(--accent));
}

.cost {
  font-size: 0.9rem;
  color: #ffd166;
  font-variant-numeric: tabular-nums;
}
</style>
