<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { cepCatalog } from '../data/cepCatalog';
import { states } from '../data/states';
import { CepService } from '../services/CepService';
import { StorageService } from '../services/StorageService';
import type { CustomCep, HistoryEntry } from '../types';
import { CepFormatter } from '../utils/CepFormatter';
import CepHistory from './cep/CepHistory.vue';
import CepResultCard from './cep/CepResultCard.vue';
import CepStateSelector from './cep/CepStateSelector.vue';
import CustomCepList from './cep/CustomCepList.vue';
import CustomCepModal from './cep/CustomCepModal.vue';
import FormatToggle from './FormatToggle.vue';

const emit = defineEmits<{ feedback: [message: string] }>();
const service = new CepService(states, cepCatalog);
const storage = new StorageService();
const selectedUf = ref('SP');
const currentCep = ref('01310100');
const useFormat = ref(true);
const history = ref<HistoryEntry[]>([]);
const customCeps = ref<CustomCep[]>([]);
const editingCustom = ref<CustomCep>();
const modalOpen = ref(false);
const formError = ref('');
const ready = ref(false);
const selectedState = computed(() => service.getState(selectedUf.value));
const formattedCep = computed(() => CepFormatter.format(currentCep.value, useFormat.value));

function persist(): Promise<void> {
  return storage.save({
    selectedUf: selectedUf.value,
    cepHistory: history.value,
    customCeps: customCeps.value,
    useFormat: useFormat.value
  });
}
function generate(): void {
  currentCep.value = service.generate(selectedUf.value, customCeps.value, currentCep.value);
  history.value = [
    { cep: currentCep.value, uf: selectedUf.value, name: selectedState.value.name },
    ...history.value.filter((item) => item.cep !== currentCep.value)
  ].slice(0, 4);
  void persist();
}
function selectState(uf: string): void {
  selectedUf.value = uf;
  generate();
}
function clearHistory(): void {
  history.value = [];
  void persist();
}
function openModal(item?: CustomCep): void {
  editingCustom.value = item;
  formError.value = '';
  modalOpen.value = true;
}
function closeModal(): void {
  modalOpen.value = false;
}
function saveCustom(value: string, label: string): void {
  const cep = value.replace(/\D/g, '');
  const editingId = editingCustom.value?.id ?? '';
  const validation = service.validateCustom(cep, customCeps.value, editingId);
  if (validation.error || !validation.state) {
    formError.value = validation.error || 'CEP inválido';
    return;
  }
  const item: CustomCep = {
    id: editingId || crypto.randomUUID(),
    cep,
    uf: validation.state.uf,
    label: label.trim()
  };
  customCeps.value = editingId
    ? customCeps.value.map((old) => (old.id === editingId ? item : old))
    : [item, ...customCeps.value];
  closeModal();
  void persist();
  emit('feedback', editingId ? 'CEP atualizado!' : 'CEP adicionado!');
}
function removeCustom(id: string): void {
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
    <CepStateSelector :selected-uf="selectedUf" @select="selectState" />
    <CepResultCard
      :state="selectedState"
      :cep="formattedCep"
      @generate="generate"
      @feedback="emit('feedback', $event)"
    />
    <FormatToggle v-model="useFormat" title="Usar formatação" hint="Exibir como 00000-000" />
    <CepHistory
      :history="history"
      :use-format="useFormat"
      @clear="clearHistory"
      @feedback="emit('feedback', $event)"
    />
    <CustomCepList
      :custom-ceps="customCeps"
      :use-format="useFormat"
      @add="openModal()"
      @edit="openModal"
      @remove="removeCustom"
      @feedback="emit('feedback', $event)"
    />
    <CustomCepModal
      v-if="modalOpen"
      :key="editingCustom?.id ?? 'new'"
      :item="editingCustom"
      :error="formError"
      @close="closeModal"
      @save="saveCustom"
    />
  </section>
</template>
