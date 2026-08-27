<script setup lang="ts">
import { computed, ref } from 'vue';
import { states } from '../../data/states';
import { CepFormatter } from '../../utils/CepFormatter';

const props = defineProps<{ selectedUf: string }>();
const emit = defineEmits<{ select: [uf: string] }>();
const search = ref('');
const filteredStates = computed(() => {
  const term = CepFormatter.normalizeSearch(search.value.trim());
  return states.filter(
    ({ name, uf }) =>
      CepFormatter.normalizeSearch(name).includes(term) || uf.toLowerCase().includes(term)
  );
});
</script>

<template>
  <div class="field-group">
    <label for="stateSearch">Escolha um estado</label>
    <div class="search-wrap">
      <input
        id="stateSearch"
        v-model="search"
        type="search"
        placeholder="Buscar por nome ou UF..."
      />
    </div>
    <div class="state-list">
      <button
        v-for="state in filteredStates"
        :key="state.uf"
        class="state-option"
        :class="{ selected: state.uf === props.selectedUf }"
        type="button"
        @click="emit('select', state.uf)"
      >
        <span class="uf-chip">{{ state.uf }}</span
        ><span>{{ state.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.field-group > label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
}
.search-wrap {
  position: relative;
}
.search-wrap input {
  width: 100%;
  height: 40px;
  padding: 0 12px 0 39px;
  color: #252d40;
  border: 1px solid #dfe2e9;
  border-radius: 10px;
  outline: none;
  background: #fff;
  font-size: 13px;
  transition: 0.2s;
}
.search-wrap input:focus {
  border-color: #7564e9;
  box-shadow: 0 0 0 3px #6655dc16;
}
.search-wrap input::placeholder {
  color: #a0a5b2;
}
.state-list {
  max-height: 116px;
  margin-top: 7px;
  overflow-y: auto;
  border: 1px solid #e2e4ea;
  border-radius: 10px;
  background: #fff;
  scrollbar-width: thin;
  scrollbar-color: #c8cbd4 transparent;
}
.state-option {
  display: flex;
  align-items: center;
  width: 100%;
  height: 39px;
  gap: 9px;
  padding: 0 10px;
  border: 0;
  border-bottom: 1px solid #f0f1f4;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
}
.state-option:last-child {
  border-bottom: 0;
}
.state-option:hover {
  background: #f8f7ff;
}
.state-option.selected {
  color: #5a48d2;
  background: #f3f1ff;
  font-weight: 700;
}
.uf-chip {
  width: 29px;
  height: 22px;
  border-radius: 6px;
  font-size: 10px;
}
[data-theme='dark'] .search-wrap input,
[data-theme='dark'] .state-list {
  color: #e8ebf3;
  border-color: #303541;
  background: #20242d;
}
[data-theme='dark'] .search-wrap input::placeholder {
  color: #777f90;
}
[data-theme='dark'] .state-option {
  color: #dfe3ec;
  border-color: #2c313c;
}
[data-theme='dark'] .state-option:hover {
  background: #292d39;
}
[data-theme='dark'] .state-option.selected {
  color: #bcb3ff;
  background: #2d2946;
}
</style>
