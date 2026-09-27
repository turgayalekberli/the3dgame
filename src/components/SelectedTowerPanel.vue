<script setup lang="ts">
import { computed, type DeepReadonly } from 'vue'
import { TOWER_STATS } from '../game/towers/towerTypes'
import type { TowerInfo } from '../game/types'

const props = defineProps<{ info: DeepReadonly<TowerInfo>; credits: number }>()
const emit = defineEmits<{ upgrade: []; sell: [] }>()

const stats = computed(() => TOWER_STATS[props.info.type])

const canUpgrade = computed(() => props.info.upgradeCost !== null && props.credits >= props.info.upgradeCost)

// Не больше двух знаков после запятой, без хвостовых нулей
function format(value: number): string {
  return String(Math.round(value * 100) / 100)
}

// Луч бьёт непрерывно — урон в секунду; остальные — урон × выстрелов в секунду
const damage = computed(() =>
  props.info.fireRate === 0
    ? `${format(props.info.damage)}/с`
    : `${format(props.info.damage)} × ${format(props.info.fireRate)}/с`,
)
</script>

<template>
  <div class="panel" :data-tower="info.type">
    <div class="header">
      <span class="name">{{ stats.name }}</span>
      <span class="level">Ур. {{ info.level }}/{{ info.maxLevel }}</span>
    </div>

    <dl class="stats">
      <dt>Урон</dt>
      <dd>{{ damage }}</dd>
      <dt>Радиус</dt>
      <dd>{{ format(info.range) }}</dd>
      <template v-if="stats.splash > 0">
        <dt>Сплеш</dt>
        <dd>{{ format(stats.splash) }}</dd>
      </template>
      <template v-if="stats.slow > 0">
        <dt>Замедление</dt>
        <dd>{{ format(stats.slow * 100) }}%</dd>
      </template>
    </dl>

    <div class="buttons">
      <button class="button" :disabled="!canUpgrade" @click="emit('upgrade')">
        <template v-if="info.upgradeCost !== null">
          Улучшить <span class="price">{{ info.upgradeCost }}</span>
        </template>
        <template v-else>Макс. уровень</template>
        <kbd>U</kbd>
      </button>
      <button class="button" @click="emit('sell')">
        Продать <span class="price">+{{ info.sellValue }}</span>
        <kbd>S</kbd>
      </button>
    </div>
  </div>
</template>

<style scoped>
.panel {
  min-width: 14rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid rgb(var(--accent) / 0.6);
  border-radius: 6px;
  background: rgb(8 14 28 / 0.8);
  box-shadow: 0 0 16px rgb(var(--accent) / 0.25);
  pointer-events: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.name {
  font-weight: 700;
  color: rgb(var(--accent));
}

.level {
  font-size: 0.8rem;
  opacity: 0.7;
}

.stats {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.2rem 1rem;
  margin: 0.6rem 0;
  font-size: 0.9rem;
}

.stats dt {
  opacity: 0.6;
}

.stats dd {
  margin: 0;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid rgb(var(--accent) / 0.5);
  border-radius: 4px;
  background: rgb(var(--accent) / 0.08);
  color: #e8f8ff;
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
}

.button:hover:not(:disabled) {
  background: rgb(var(--accent) / 0.2);
}

.button:disabled {
  opacity: 0.4;
  cursor: default;
}

.price {
  color: #ffd166;
  font-variant-numeric: tabular-nums;
}

kbd {
  margin-left: auto;
  font: inherit;
  font-size: 0.7rem;
  opacity: 0.5;
}
</style>
