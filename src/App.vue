<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import AppHeader from './components/AppHeader.vue';
import CardPanel from './components/CardPanel.vue';
import CepPanel from './components/CepPanel.vue';
import DocumentPanel from './components/DocumentPanel.vue';
import { StorageService } from './services/StorageService';
import type { Panel, Theme } from './types';

const storage = new StorageService();
const panels: Panel[] = ['cep', 'documents', 'cards'];
const panel = ref<Panel>('cep');
const theme = ref<Theme>('light');
const toast = ref('');
let toastTimer = 0;

function notify(message: string) {
  toast.value = message;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toast.value = ''), 1800);
}
function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  void storage.save({ theme: theme.value });
}
watch(theme, (value) => (document.documentElement.dataset.theme = value), {
  immediate: true
});
watch(panel, (value) => void storage.save({ activePanel: value }));
onMounted(async () => {
  const saved = await storage.load();
  theme.value = saved.theme === 'dark' ? 'dark' : 'light';
  panel.value = saved.activePanel && panels.includes(saved.activePanel) ? saved.activePanel : 'cep';
});
</script>

<template>
  <main class="app">
    <AppHeader
      :theme="theme"
      :panel="panel"
      @toggle-theme="toggleTheme"
      @select-panel="panel = $event"
    />
    <section class="content">
      <CepPanel v-show="panel === 'cep'" @feedback="notify" />
      <DocumentPanel v-show="panel === 'documents'" @feedback="notify" />
      <CardPanel v-show="panel === 'cards'" @feedback="notify" />
    </section>
    <footer>Dados gerados para testes; não use em cadastros ou transações reais.</footer>
    <div class="toast" :class="{ show: toast }">{{ toast }}</div>
  </main>
</template>
