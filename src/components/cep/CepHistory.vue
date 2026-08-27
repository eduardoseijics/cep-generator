<script setup lang="ts">
import { ref } from 'vue';
import type { HistoryEntry } from '../../types';
import { CepFormatter } from '../../utils/CepFormatter';

const props = defineProps<{ history: HistoryEntry[]; useFormat: boolean }>();
const emit = defineEmits<{ clear: []; feedback: [message: string] }>();
const copied = ref('');

function format(cep: string): string {
  return CepFormatter.format(cep, props.useFormat);
}
async function copy(item: HistoryEntry): Promise<void> {
  try {
    await navigator.clipboard.writeText(format(item.cep));
    copied.value = item.cep;
    emit('feedback', 'CEP copiado!');
    window.setTimeout(() => (copied.value = ''), 1500);
  } catch {
    emit('feedback', 'Não foi possível copiar');
  }
}
</script>

<template>
  <section class="history-section">
    <div class="section-title">
      <h2>Gerados recentemente</h2>
      <button v-if="history.length" type="button" @click="emit('clear')">Limpar</button>
    </div>
    <div class="history-list">
      <button
        v-for="item in history"
        :key="item.cep"
        class="history-item"
        type="button"
        @click="copy(item)"
      >
        <span class="mini-badge">{{ item.uf }}</span
        ><span
          ><strong>{{ format(item.cep) }}</strong
          ><small>{{ item.name }}</small></span
        ><span class="history-copy" :class="{ copied: copied === item.cep }"
          ><span class="history-copy-icon" aria-hidden="true" />
          <span class="history-check-icon" aria-hidden="true" />
        </span>
      </button>
      <p v-if="!history.length" class="history-empty">Seus últimos CEPs aparecerão aqui.</p>
    </div>
  </section>
</template>

<style scoped>
.history-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.history-item {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 58px;
  gap: 9px;
  padding: 9px 10px;
  border: 1px solid #e4e6eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: 0.18s;
}
.history-item:hover {
  border-color: #c7c0f3;
  background: #faf9ff;
}
.history-item > span:nth-child(2) {
  display: grid;
  min-width: 0;
  gap: 1px;
}
.history-item strong {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 11px;
  white-space: nowrap;
}
.history-item small {
  overflow: hidden;
  color: #999eaa;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.history-item > span:last-child {
  display: grid;
  margin-left: auto;
  flex: 0 0 auto;
}
.history-copy-icon,
.history-check-icon {
  position: absolute;
  inset: 0;
  width: 15px;
  height: 15px;
  background: #9ba0ad;
  transition: 0.18s;
}
.history-copy {
  position: relative;
  width: 15px;
  height: 15px;
}
.history-copy-icon {
  mask: url('../../assets/icons/copy.svg') center / contain no-repeat;
  -webkit-mask: url('../../assets/icons/copy.svg') center / contain no-repeat;
}
.history-check-icon {
  mask: url('../../assets/icons/check.svg') center / contain no-repeat;
  -webkit-mask: url('../../assets/icons/check.svg') center / contain no-repeat;
  opacity: 0;
  transform: scale(0.55);
}
.history-item:hover .history-copy-icon {
  transform: translateY(-1px);
}
.history-copy.copied .history-copy-icon {
  opacity: 0;
  transform: scale(0.55);
}
.history-copy.copied .history-check-icon {
  opacity: 1;
  transform: scale(1);
  background: #5d4bd6;
}
.history-empty {
  grid-column: 1 / -1;
  border: 1px dashed #dfe1e7;
  border-radius: 9px;
}
[data-theme='dark'] .history-item {
  color: #e8ebf3;
  border-color: #303541;
  background: #20242d;
}
[data-theme='dark'] .history-item small {
  color: #929aab;
}
[data-theme='dark'] .history-item:hover {
  border-color: #56506f;
  background: #292d38;
}
[data-theme='dark'] .history-empty {
  color: #858d9e;
  border-color: #363b47;
}
</style>
