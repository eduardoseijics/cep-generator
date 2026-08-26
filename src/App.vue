<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { states } from './data/states';
import { cepCatalog } from './data/cepCatalog';
import { CepFormatter } from './utils/CepFormatter';
import { CepService } from './services/CepService';
import { DocumentService } from './services/DocumentService';
import { StorageService } from './services/StorageService';
import type { CardBrand, DocumentKind } from './services/DocumentService';
import type { CustomCep, HistoryEntry, Theme } from './types';

type Panel = 'cep' | 'documents' | 'cards';
const cepService = new CepService(states, cepCatalog);
const documentService = new DocumentService();
const storage = new StorageService();
const panel = ref<Panel>('cep');
const theme = ref<Theme>('light');
const selectedUf = ref('SP');
const search = ref('');
const currentCep = ref('01310100');
const history = ref<HistoryEntry[]>([]);
const customCeps = ref<CustomCep[]>([]);
const useFormat = ref(true);
const documentKind = ref<DocumentKind>('cpf');
const useDocumentFormat = ref(true);
const documentDigits = ref('');
const brand = ref<CardBrand>('visa');
const card = ref(documentService.generateCard('visa'));
const toast = ref('');
const copied = ref('');
const modalOpen = ref(false);
const editId = ref('');
const formCep = ref('');
const formLabel = ref('');
const formError = ref('');
const hydrated = ref(false);
let toastTimer = 0;
const copyButtonIcon = '<svg class="copy-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"/></svg><svg class="check-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const detailCopyIcon = '<svg class="detail-copy-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"/></svg><svg class="detail-check-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const historyCopyIcon = '<svg class="history-copy-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"/></svg><svg class="history-check-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const brandIcons: Record<CardBrand, string> = {
  visa: '<svg class="brand-logo visa-brand-logo" viewBox="0 0 72 28" aria-hidden="true"><text x="2" y="22" fill="#1434cb" font-family="Arial, sans-serif" font-size="23" font-style="italic" font-weight="900">VISA</text></svg>',
  mastercard: '<svg class="brand-logo" viewBox="0 0 52 32" aria-hidden="true"><circle cx="18" cy="16" r="13" fill="#eb001b"/><circle cx="34" cy="16" r="13" fill="#f79e1b"/><path d="M26 4.4a13 13 0 0 1 0 23.2 13 13 0 0 1 0-23.2Z" fill="#ff5f00"/></svg>',
  amex: '<svg class="brand-logo" viewBox="0 0 58 30" aria-hidden="true"><rect x="1" y="2" width="56" height="26" rx="3" fill="#2679bd"/><text x="6" y="21" fill="#fff" font-family="Arial, sans-serif" font-size="13" font-weight="900">AMEX</text></svg>',
  discover: '<svg class="brand-logo discover-brand-logo" viewBox="0 0 78 30" aria-hidden="true"><text x="1" y="17" fill="#202020" font-family="Arial, sans-serif" font-size="12" font-style="italic" font-weight="900">DISCOVER</text><path d="M4 23h67" stroke="#f58220" stroke-linecap="round" stroke-width="4"/></svg>'
};
function cardBrandIcon(name: string): string { return brandIcons[name as CardBrand]; }

const selectedState = computed(() => cepService.getState(selectedUf.value));
const formattedCep = computed(() => CepFormatter.format(currentCep.value, useFormat.value));
const filteredStates = computed(() => {
  const term = CepFormatter.normalizeSearch(search.value.trim());
  return states.filter(({ name, uf }) => CepFormatter.normalizeSearch(name).includes(term) || uf.toLowerCase().includes(term));
});
const documentHint = computed(() => documentKind.value === 'cpf' ? 'Exibir como 000.000.000-00' : 'Exibir como 00.000.000/0000-00');
const documentValue = computed(() => formatDocument(documentDigits.value));
const cardLabel = computed(() => `${brand.value === 'mastercard' ? 'MASTERCARD' : brand.value.toUpperCase()} · CARTÃO DE TESTE`);

function notify(message: string) { toast.value = message; window.clearTimeout(toastTimer); toastTimer = window.setTimeout(() => toast.value = '', 1800); }
async function copy(value: string, key: string, message: string) {
  try { await navigator.clipboard.writeText(value); copied.value = key; notify(message); window.setTimeout(() => copied.value = '', 1500); }
  catch { notify('Não foi possível copiar'); }
}
function generateCep() {
  currentCep.value = cepService.generate(selectedUf.value, customCeps.value, currentCep.value);
  history.value = [{ cep: currentCep.value, uf: selectedUf.value, name: selectedState.value.name }, ...history.value.filter(item => item.cep !== currentCep.value)].slice(0, 4);
  if (hydrated.value) void persist();
}
function selectState(uf: string) { selectedUf.value = uf; search.value = ''; generateCep(); }
function formatDocument(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!useDocumentFormat.value) return digits;
  return documentKind.value === 'cpf'
    ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}
function generateDocument() { documentDigits.value = documentKind.value === 'cpf' ? documentService.generateCpf(false) : documentService.generateCnpj(false); }
function generateCard() { card.value = documentService.generateCard(brand.value); }
function openModal(item?: CustomCep) { editId.value = item?.id || ''; formCep.value = item ? CepFormatter.format(item.cep, true) : ''; formLabel.value = item?.label || ''; formError.value = ''; modalOpen.value = true; }
function saveCep() {
  const cep = CepFormatter.digits(formCep.value); const validation = cepService.validateCustom(cep, customCeps.value, editId.value);
  if (validation.error || !validation.state) { formError.value = validation.error || 'CEP inválido'; return; }
  const item: CustomCep = { id: editId.value || crypto.randomUUID(), cep, uf: validation.state.uf, label: formLabel.value.trim() };
  customCeps.value = editId.value ? customCeps.value.map(old => old.id === editId.value ? item : old) : [item, ...customCeps.value]; modalOpen.value = false; if (hydrated.value) void persist(); notify(editId.value ? 'CEP atualizado!' : 'CEP adicionado!');
}
function removeCep(id: string) { customCeps.value = customCeps.value.filter(item => item.id !== id); if (hydrated.value) void persist(); notify('CEP excluído'); }
function clearHistory() { history.value = []; if (hydrated.value) void persist(); }
function persist() { return storage.save({ cepHistory: history.value, selectedUf: selectedUf.value, customCeps: customCeps.value, useFormat: useFormat.value, useDocumentFormat: useDocumentFormat.value, theme: theme.value }); }
function toggleTheme() { theme.value = theme.value === 'light' ? 'dark' : 'light'; void persist(); }
watch([selectedUf, history, customCeps, useFormat, useDocumentFormat, theme], () => {
  if (!hydrated.value) return;
  void persist();
}, { deep: true });
watch(documentKind, generateDocument);
watch(theme, value => document.documentElement.dataset.theme = value, { immediate: true });
onMounted(async () => { const saved = await storage.load(); selectedUf.value = cepService.findState(saved.selectedUf)?.uf || 'SP'; history.value = saved.cepHistory?.slice(0, 4) || []; customCeps.value = saved.customCeps || []; useFormat.value = saved.useFormat ?? true; useDocumentFormat.value = saved.useDocumentFormat ?? true; theme.value = saved.theme === 'dark' ? 'dark' : 'light'; generateDocument(); hydrated.value = true; });
</script>

<template>
  <main class="app">
    <header class="topbar"><div class="brand-mark"><svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></div><div><h1>Gerador brasileiro</h1><p>Dados rápidos para testes</p></div><button class="theme-toggle" type="button" :title="theme === 'dark' ? 'Tema claro' : 'Tema escuro'" :aria-label="theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'" @click="toggleTheme"><svg class="moon-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/></svg><svg class="sun-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg></button><span class="status"><i/> Offline</span></header>
    <nav class="main-tabs"><button v-for="item in [['cep','CEP'],['documents','Documentos'],['cards','Cartões']]" :key="item[0]" class="main-tab" :class="{ active: panel === item[0] }" type="button" @click="panel = item[0] as Panel">{{ item[1] }}</button></nav>
    <section class="content">
      <section v-show="panel === 'cep'"><div class="field-group"><label for="stateSearch">Escolha um estado</label><div class="search-wrap"><input id="stateSearch" v-model="search" type="search" placeholder="Buscar por nome ou UF..." /></div><div class="state-list"><button v-for="state in filteredStates" :key="state.uf" class="state-option" :class="{ selected: state.uf === selectedUf }" type="button" @click="selectState(state.uf)"><span class="uf-chip">{{ state.uf }}</span><span>{{ state.name }}</span></button></div></div><section class="result-card"><div class="result-heading"><div><span class="eyebrow">CEP GERADO</span><strong>{{ selectedState.name }} · {{ selectedUf }}</strong></div><span class="state-badge">{{ selectedUf }}</span></div><div class="cep-row"><span class="cep-value">{{ formattedCep }}</span><button class="icon-button" :class="{ copied: copied === 'cep' }" type="button" @click="copy(formattedCep, 'cep', 'CEP copiado!')" v-html="copyButtonIcon"/></div><button class="primary-button" type="button" @click="generateCep">Gerar novo CEP</button></section><div class="format-row"><div><strong>Usar formatação</strong><span>Exibir como 00000-000</span></div><label class="switch"><input v-model="useFormat" type="checkbox" /><span/></label></div><section class="history-section"><div class="section-title"><h2>Gerados recentemente</h2><button v-if="history.length" type="button" @click="clearHistory">Limpar</button></div><div class="history-list"><button v-for="item in history" :key="item.cep" class="history-item" type="button" @click="copy(CepFormatter.format(item.cep, useFormat), `history-${item.cep}`, 'CEP copiado!')"><span class="mini-badge">{{ item.uf }}</span><span><strong>{{ CepFormatter.format(item.cep, useFormat) }}</strong><small>{{ item.name }}</small></span><span class="history-copy" :class="{ copied: copied === `history-${item.cep}` }" v-html="historyCopyIcon"/></button><p v-if="!history.length" class="history-empty">Seus últimos CEPs aparecerão aqui.</p></div></section><section class="custom-section"><div class="section-title"><div><h2>Meus CEPs</h2><span>{{ customCeps.length }} salvos</span></div><button class="add-button" type="button" @click="openModal()">+ Adicionar</button></div><div class="custom-list"><div v-for="item in customCeps" :key="item.id" class="custom-item"><span class="mini-badge">{{ item.uf }}</span><span class="custom-info"><strong>{{ CepFormatter.format(item.cep, useFormat) }}</strong><small>{{ item.label || cepService.getState(item.uf).name }}</small></span><button data-copy type="button" :class="{ copied: copied === `custom-${item.id}` }" @click="copy(CepFormatter.format(item.cep, useFormat), `custom-${item.id}`, 'CEP copiado!')" v-html="copyButtonIcon"/><button type="button" @click="openModal(item)">✎</button><button type="button" @click="removeCep(item.id)">×</button></div><p v-if="!customCeps.length" class="custom-empty">Adicione CEPs que você usa com frequência.</p></div></section></section>
      <section v-show="panel === 'documents'"><div class="panel-intro"><h2>Documentos para testes</h2><p>Gere números válidos com dígitos verificadores.</p></div><div class="document-tabs"><button v-for="kind in ['cpf','cnpj']" :key="kind" class="document-tab" :class="{ active: documentKind === kind }" type="button" @click="documentKind = kind as DocumentKind">{{ kind.toUpperCase() }}</button></div><section class="document-card"><div class="document-heading">{{ documentKind.toUpperCase() }} GERADO</div><div class="document-value-row"><output class="document-value">{{ documentValue }}</output><button class="icon-button document-copy" :class="{ copied: copied === 'document' }" type="button" @click="copy(documentValue, 'document', 'Resultado copiado!')" v-html="copyButtonIcon"/></div><div class="document-format"><div><strong>Usar máscara</strong><span>{{ documentHint }}</span></div><label class="switch"><input v-model="useDocumentFormat" type="checkbox" /><span/></label></div><button class="document-generate" type="button" @click="generateDocument">Gerar {{ documentKind.toUpperCase() }}</button></section></section>
      <section v-show="panel === 'cards'"><div class="panel-intro"><h2>Cartões para testes</h2><p>Use apenas em ambientes de desenvolvimento.</p></div><div class="card-brands"><button v-for="name in ['visa','mastercard','amex','discover']" :key="name" class="card-brand" :class="{ selected: brand === name }" type="button" :aria-label="name" @click="brand = name as CardBrand; generateCard()" v-html="cardBrandIcon(name)"/></div><section class="document-card card-result"><div class="document-heading">{{ cardLabel }}</div><div class="document-value-row"><output class="document-value">{{ card.number }}</output><button class="icon-button document-copy" :class="{ copied: copied === 'card' }" type="button" @click="copy(card.number, 'card', 'Cartão copiado!')" v-html="copyButtonIcon"/></div><div class="card-details"><button type="button" :class="{ copied: copied === 'expiry' }" @click="copy(card.expiry, 'expiry', 'Validade copiada!')"><span>VALIDADE</span><strong>{{ card.expiry }}</strong><span v-html="detailCopyIcon"/></button><button type="button" :class="{ copied: copied === 'cvv' }" @click="copy(card.cvv, 'cvv', 'CVV copiado!')"><span>CVV</span><strong>{{ card.cvv }}</strong><span v-html="detailCopyIcon"/></button></div><button class="document-generate" type="button" @click="generateCard">Gerar novo cartão</button></section></section>
    </section>
    <footer>Dados gerados para testes; não use em cadastros ou transações reais.</footer><div class="toast" :class="{ show: toast }">{{ toast }}</div>
    <div v-if="modalOpen" class="modal open"><div class="modal-backdrop" @click="modalOpen = false"/><form class="modal-card" @submit.prevent="saveCep"><h2>{{ editId ? 'Editar CEP' : 'Adicionar CEP' }}</h2><input v-model="formCep" maxlength="9" placeholder="00000-000" @input="formCep = CepFormatter.digits(formCep).replace(/(\d{5})(\d)/, '$1-$2')" /><input v-model="formLabel" placeholder="Apelido (opcional)" /><p class="form-error">{{ formError }}</p><div class="modal-actions"><button type="button" class="secondary-button" @click="modalOpen = false">Cancelar</button><button class="save-button">Salvar</button></div></form></div>
  </main>
</template>
