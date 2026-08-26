<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { states } from '../data/states';
import { cepCatalog } from '../data/cepCatalog';
import { CepFormatter } from '../utils/CepFormatter';
import { CepService } from '../services/CepService';
import { StorageService } from '../services/StorageService';
import type { CustomCep, HistoryEntry } from '../types';
import CopyButton from './CopyButton.vue';

const emit = defineEmits<{ feedback: [message: string] }>();
const service = new CepService(states, cepCatalog);
const storage = new StorageService();
const selectedUf = ref('SP');
const search = ref('');
const currentCep = ref('01310100');
const useFormat = ref(true);
const history = ref<HistoryEntry[]>([]);
const customCeps = ref<CustomCep[]>([]);
const copied = ref('');
const modalOpen = ref(false);
const editId = ref('');
const formCep = ref('');
const formLabel = ref('');
const formError = ref('');
const ready = ref(false);
const historyIcon =
  '<svg class="history-copy-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"/></svg><svg class="history-check-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const selectedState = computed(() => service.getState(selectedUf.value));
const formattedCep = computed(() => CepFormatter.format(currentCep.value, useFormat.value));
const filteredStates = computed(() => {
  const term = CepFormatter.normalizeSearch(search.value.trim());
  return states.filter(
    ({ name, uf }) =>
      CepFormatter.normalizeSearch(name).includes(term) || uf.toLowerCase().includes(term)
  );
});

function persist() {
  return storage.save({
    selectedUf: selectedUf.value,
    cepHistory: history.value,
    customCeps: customCeps.value,
    useFormat: useFormat.value
  });
}
function format(cep: string) {
  return CepFormatter.format(cep, useFormat.value);
}
function generate() {
  currentCep.value = service.generate(selectedUf.value, customCeps.value, currentCep.value);
  history.value = [
    { cep: currentCep.value, uf: selectedUf.value, name: selectedState.value.name },
    ...history.value.filter((item) => item.cep !== currentCep.value)
  ].slice(0, 4);
  void persist();
}
function selectState(uf: string) {
  selectedUf.value = uf;
  generate();
}
async function copy(value: string, key: string, message: string) {
  try {
    await navigator.clipboard.writeText(value);
    copied.value = key;
    emit('feedback', message);
    window.setTimeout(() => (copied.value = ''), 1500);
  } catch {
    emit('feedback', 'Não foi possível copiar');
  }
}
function openModal(item?: CustomCep) {
  editId.value = item?.id || '';
  formCep.value = item ? CepFormatter.format(item.cep) : '';
  formLabel.value = item?.label || '';
  formError.value = '';
  modalOpen.value = true;
}
function saveCustom() {
  const cep = formCep.value.replace(/\D/g, '');
  const validation = service.validateCustom(cep, customCeps.value, editId.value);
  if (validation.error || !validation.state) {
    formError.value = validation.error || 'CEP inválido';
    return;
  }
  const item: CustomCep = {
    id: editId.value || crypto.randomUUID(),
    cep,
    uf: validation.state.uf,
    label: formLabel.value.trim()
  };
  customCeps.value = editId.value
    ? customCeps.value.map((old) => (old.id === editId.value ? item : old))
    : [item, ...customCeps.value];
  modalOpen.value = false;
  void persist();
  emit('feedback', editId.value ? 'CEP atualizado!' : 'CEP adicionado!');
}
function removeCustom(id: string) {
  customCeps.value = customCeps.value.filter((item) => item.id !== id);
  void persist();
  emit('feedback', 'CEP excluído');
}
watch([selectedUf, useFormat], () => {
  if (ready.value) void persist();
});
onMounted(async () => {
  const saved = await storage.load();
  selectedUf.value = service.findState(saved.selectedUf)?.uf || 'SP';
  history.value = saved.cepHistory?.slice(0, 4) || [];
  customCeps.value = saved.customCeps || [];
  useFormat.value = saved.useFormat ?? true;
  ready.value = true;
});
</script>

<template>
  <section class="generator-panel">
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
          :class="{ selected: state.uf === selectedUf }"
          type="button"
          @click="selectState(state.uf)"
        >
          <span class="uf-chip">{{ state.uf }}</span
          ><span>{{ state.name }}</span>
        </button>
      </div>
    </div>
    <section class="result-card">
      <div class="result-heading">
        <div>
          <span class="eyebrow">CEP GERADO</span
          ><strong>{{ selectedState.name }} · {{ selectedUf }}</strong>
        </div>
        <span class="state-badge">{{ selectedUf }}</span>
      </div>
      <div class="cep-row">
        <span class="cep-value">{{ formattedCep }}</span>
        <CopyButton
          :value="formattedCep"
          label="Copiar CEP"
          success-message="CEP copiado!"
          @feedback="emit('feedback', $event)"
        />
      </div>
      <button class="primary-button" type="button" @click="generate">Gerar novo CEP</button>
    </section>
    <div class="format-row">
      <div><strong>Usar formatação</strong><span>Exibir como 00000-000</span></div>
      <label class="switch"><input v-model="useFormat" type="checkbox" /><span /></label>
    </div>
    <section class="history-section">
      <div class="section-title">
        <h2>Gerados recentemente</h2>
        <button
          v-if="history.length"
          type="button"
          @click="
            history = [];
            persist();
          "
        >
          Limpar
        </button>
      </div>
      <div class="history-list">
        <button
          v-for="item in history"
          :key="item.cep"
          class="history-item"
          type="button"
          @click="copy(format(item.cep), `history-${item.cep}`, 'CEP copiado!')"
        >
          <span class="mini-badge">{{ item.uf }}</span
          ><span
            ><strong>{{ format(item.cep) }}</strong
            ><small>{{ item.name }}</small></span
          ><span
            class="history-copy"
            :class="{ copied: copied === `history-${item.cep}` }"
            v-html="historyIcon"
          />
        </button>
        <p v-if="!history.length" class="history-empty">Seus últimos CEPs aparecerão aqui.</p>
      </div>
    </section>
    <section class="custom-section">
      <div class="section-title">
        <div>
          <h2>Meus CEPs</h2>
          <span>{{ customCeps.length }} salvos</span>
        </div>
        <button class="add-button" type="button" @click="openModal()">+ Adicionar</button>
      </div>
      <div class="custom-list">
        <div v-for="item in customCeps" :key="item.id" class="custom-item">
          <span class="mini-badge">{{ item.uf }}</span
          ><span class="custom-info"
            ><strong>{{ format(item.cep) }}</strong
            ><small>{{ item.label || service.getState(item.uf).name }}</small></span
          ><CopyButton
            :value="format(item.cep)"
            label="Copiar CEP"
            success-message="CEP copiado!"
            @feedback="emit('feedback', $event)"
          />
          <button type="button" @click="openModal(item)">✎</button
          ><button type="button" @click="removeCustom(item.id)">×</button>
        </div>
        <p v-if="!customCeps.length" class="custom-empty">
          Adicione CEPs que você usa com frequência.
        </p>
      </div>
    </section>
    <div v-if="modalOpen" class="modal open">
      <div class="modal-backdrop" @click="modalOpen = false" />
      <form class="modal-card" @submit.prevent="saveCustom">
        <h2>{{ editId ? 'Editar CEP' : 'Adicionar CEP' }}</h2>
        <input
          v-model="formCep"
          maxlength="9"
          placeholder="00000-000"
          @input="formCep = formCep.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2')"
        /><input v-model="formLabel" placeholder="Apelido (opcional)" />
        <p class="form-error">{{ formError }}</p>
        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="modalOpen = false">Cancelar</button
          ><button class="save-button">Salvar</button>
        </div>
      </form>
    </div>
  </section>
</template>
