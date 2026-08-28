<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { documentService } from '../services/DocumentService';
import { StorageService } from '../services/StorageService';
import type { DocumentKind } from '../types';
import CopyButton from './CopyButton.vue';
import FormatToggle from './FormatToggle.vue';

const emit = defineEmits<{ feedback: [message: string] }>();
const service = documentService;
const storage = new StorageService();
const kind = ref<DocumentKind>('cpf');
const useFormat = ref(true);
const digits = ref('');
let hasInteracted = false;
const hint = computed(() =>
  kind.value === 'cpf' ? 'Exibir como 000.000.000-00' : 'Exibir como 00.000.000/0000-00'
);
const value = computed(() => {
  if (!useFormat.value) return digits.value;
  return kind.value === 'cpf'
    ? digits.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : digits.value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
});

function generate(hasUserInteraction = true) {
  hasInteracted ||= hasUserInteraction;
  digits.value = kind.value === 'cpf' ? service.generateCpf(false) : service.generateCnpj(false);
}
function selectKind(nextKind: DocumentKind) {
  hasInteracted = true;
  kind.value = nextKind;
  generate();
}
function updateFormat(value: boolean) {
  hasInteracted = true;
  useFormat.value = value;
}
watch(useFormat, () => void storage.save({ useDocumentFormat: useFormat.value }));
watch(kind, (value) => void storage.save({ selectedDocumentKind: value }));
watch(digits, (value) => void storage.save({ documentDigits: value }));
onMounted(async () => {
  const saved = await storage.load();
  if (hasInteracted) return;
  useFormat.value = saved.useDocumentFormat ?? true;
  kind.value = saved.selectedDocumentKind === 'cnpj' ? 'cnpj' : 'cpf';
  const expectedLength = kind.value === 'cpf' ? 11 : 14;
  if (new RegExp(`^\\d{${expectedLength}}$`).test(saved.documentDigits || '')) {
    digits.value = saved.documentDigits!;
  } else {
    generate(false);
  }
});
</script>

<template>
  <section class="generator-panel" aria-labelledby="documentsTitle">
    <div class="panel-intro">
      <h2 id="documentsTitle">Documentos para testes</h2>
      <p>Gere números válidos com dígitos verificadores.</p>
    </div>
    <div class="document-tabs" role="group" aria-label="Tipo de documento">
      <button
        v-for="item in ['cpf', 'cnpj'] as DocumentKind[]"
        :key="item"
        class="document-tab"
        :class="{ active: kind === item }"
        type="button"
        @click="selectKind(item)"
      >
        {{ item.toUpperCase() }}
      </button>
    </div>
    <section class="document-card" aria-live="polite">
      <div class="document-heading">{{ kind.toUpperCase() }} GERADO</div>
      <div class="document-value-row">
        <output class="document-value">{{ value }}</output
        ><CopyButton
          class="document-copy"
          :value="value"
          label="Copiar documento"
          success-message="Resultado copiado!"
          @feedback="emit('feedback', $event)"
        />
      </div>
      <button class="document-generate" type="button" @click="generate()">
        Gerar novo {{ kind.toUpperCase() }}
      </button>
    </section>
    <FormatToggle
      :model-value="useFormat"
      title="Usar máscara"
      :hint="hint"
      @update:model-value="updateFormat"
    />
  </section>
</template>

<style scoped>
.panel-intro {
  margin: 2px 0 13px;
}
.panel-intro h2 {
  margin: 0;
  font-size: 16px;
}
.panel-intro p {
  margin: 4px 0 0;
  color: #9298a7;
  font-size: 12px;
}
.document-tabs {
  display: flex;
  gap: 6px;
}
.document-tab {
  flex: 1;
  height: 31px;
  color: #687084;
  border: 1px solid #e0e2e8;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
}
.document-tab.active {
  color: #5d4bd6;
  border-color: #cfc8fa;
  background: #f0eeff;
  box-shadow: inset 0 0 0 1px #cfc8fa;
}
.document-card {
  margin-top: 8px;
  padding: 14px;
  color: #fff;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(130deg, #6251de 0%, #7767ea 100%);
  box-shadow: 0 8px 20px #5f4fda2d;
}
.document-heading {
  color: #dcd7ff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
}
.document-value-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 7px 0 11px;
}
.document-value {
  overflow: hidden;
  color: #fff;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.document-copy {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  color: #fff;
  border-color: #ffffff3d;
  background: #ffffff17;
}
.document-copy.copied,
.document-copy.copied:hover {
  color: #5d4bd6;
  border-color: #cfc8fa;
  background: #f0eeff;
}
.document-copy:not(.copied):hover .copy-icon {
  transform: translateY(-2px);
}
.document-copy.copied:hover .check-icon {
  transform: translateY(-1px) scale(1);
}
.document-generate {
  width: 100%;
  height: 34px;
  color: #5d4bd6;
  border: 0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
}
.document-generate:hover {
  background: #f8f7ff;
}
[data-theme='dark'] .document-tab {
  color: #b4bac8;
  border-color: #303541;
  background: #20242d;
}
[data-theme='dark'] .document-tab.active {
  color: #c8c0ff;
  border-color: #514a79;
  background: #2d2946;
}
[data-theme='dark'] .panel-intro p {
  color: #929aab;
}
</style>
