<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { DocumentService } from '../services/DocumentService';
import { StorageService } from '../services/StorageService';
import type { DocumentKind } from '../types';
import CopyButton from './CopyButton.vue';

const emit = defineEmits<{ feedback: [message: string] }>();
const service = new DocumentService();
const storage = new StorageService();
const kind = ref<DocumentKind>('cpf');
const useFormat = ref(true);
const digits = ref('');
const hint = computed(() =>
  kind.value === 'cpf' ? 'Exibir como 000.000.000-00' : 'Exibir como 00.000.000/0000-00'
);
const value = computed(() => {
  if (!useFormat.value) return digits.value;
  return kind.value === 'cpf'
    ? digits.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : digits.value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
});

function generate() {
  digits.value = kind.value === 'cpf' ? service.generateCpf(false) : service.generateCnpj(false);
}
function selectKind(nextKind: DocumentKind) {
  kind.value = nextKind;
  generate();
}
watch(useFormat, () => void storage.save({ useDocumentFormat: useFormat.value }));
watch(kind, (value) => void storage.save({ selectedDocumentKind: value }));
watch(digits, (value) => void storage.save({ documentDigits: value }));
onMounted(async () => {
  const saved = await storage.load();
  useFormat.value = saved.useDocumentFormat ?? true;
  kind.value = saved.selectedDocumentKind === 'cnpj' ? 'cnpj' : 'cpf';
  const expectedLength = kind.value === 'cpf' ? 11 : 14;
  if (new RegExp(`^\\d{${expectedLength}}$`).test(saved.documentDigits || '')) {
    digits.value = saved.documentDigits!;
  } else {
    generate();
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
      <button class="document-generate" type="button" @click="generate">
        Gerar novo {{ kind.toUpperCase() }}
      </button>
    </section>
    <div class="format-row">
      <div>
        <strong>Usar máscara</strong><span>{{ hint }}</span>
      </div>
      <label class="switch"><input v-model="useFormat" type="checkbox" /><span /></label>
    </div>
  </section>
</template>
