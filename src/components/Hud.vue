<script setup lang="ts">
import { computed, type DeepReadonly } from 'vue'
import type { GameStore } from '../game/store'
import type { TowerType } from '../game/types'
import SelectedTowerPanel from './SelectedTowerPanel.vue'
import TowerPanel from './TowerPanel.vue'

const props = defineProps<{ store: DeepReadonly<GameStore> }>()
const emit = defineEmits<{
  startWave: []
  restart: []
  selectTower: [type: TowerType]
  upgrade: []
  sell: []
}>()

const isFinished = computed(() => props.store.state === 'victory' || props.store.state === 'defeat')
</script>

<template>
  <div class="hud">
    <div class="stats">
      <div class="stat">
        <span class="label">Кредиты</span>
        <span class="value credits">{{ store.credits }}</span>
      </div>
      <div class="stat">
        <span class="label">Жизни</span>
        <span class="value lives">{{ store.lives }}</span>
      </div>
      <div class="stat">
        <span class="label">Волна</span>
        <span class="value">{{ store.wave }} / {{ store.totalWaves }}</span>
      </div>
    </div>

    <div class="bottom">
      <SelectedTowerPanel
        v-if="store.selectedInfo && !isFinished"
        class="info"
        :info="store.selectedInfo"
        :credits="store.credits"
        @upgrade="emit('upgrade')"
        @sell="emit('sell')"
      />

      <TowerPanel
        v-if="!isFinished"
        class="towers"
        :credits="store.credits"
        :selected="store.selectedTower"
        @select="emit('selectTower', $event)"
      />

      <div class="actions">
        <template v-if="isFinished">
          <p class="result">{{ store.state === 'victory' ? 'Победа' : 'Поражение' }}</p>
          <button class="button" @click="emit('restart')">Заново</button>
        </template>
        <button
          v-else
          class="button"
          :disabled="store.state !== 'build'"
          @click="emit('startWave')"
        >
          {{ store.state === 'wave' ? 'Волна идёт…' : 'Начать волну' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hud {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  /* Мышь проходит сквозь HUD к камере; кликабельны только кнопки */
  pointer-events: none;
  user-select: none;
}

.stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  min-width: 7rem;
  padding: 0.5rem 0.9rem;
  border: 1px solid rgb(63 208 255 / 0.35);
  border-radius: 6px;
  background: rgb(8 14 28 / 0.7);
  box-shadow: 0 0 12px rgb(63 208 255 / 0.15);
}

.label {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.6;
}

.value {
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.credits {
  color: #ffd166;
}

.lives {
  color: #ff5c8a;
}

/* Нижняя строка: выбранная башня слева, панель постройки по центру, кнопка волны справа */
.bottom {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
}

.info {
  grid-column: 1;
  justify-self: start;
}

.towers {
  grid-column: 2;
}

.actions {
  grid-column: 3;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.result {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-shadow: 0 0 12px rgb(42 255 213 / 0.6);
}

.button {
  pointer-events: auto;
  padding: 0.75rem 1.5rem;
  border: 1px solid #3fd0ff;
  border-radius: 6px;
  background: rgb(63 208 255 / 0.12);
  color: #e8f8ff;
  font: inherit;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 16px rgb(63 208 255 / 0.3);
  transition:
    background 0.15s,
    box-shadow 0.15s;
}

.button:hover:not(:disabled) {
  background: rgb(63 208 255 / 0.25);
  box-shadow: 0 0 24px rgb(63 208 255 / 0.5);
}

.button:disabled {
  opacity: 0.4;
  cursor: default;
  box-shadow: none;
}
</style>
