<script setup lang="ts">
import type { Panel, Theme } from '../types';

defineProps<{ theme: Theme; panel: Panel }>();
const emit = defineEmits<{ toggleTheme: []; selectPanel: [panel: Panel] }>();

const tabs: Array<{ id: Panel; label: string }> = [
  { id: 'cep', label: 'CEP' },
  { id: 'documents', label: 'Documentos' },
  { id: 'cards', label: 'Cartões' }
];
</script>

<template>
  <header class="topbar">
    <div class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    </div>
    <div>
      <h1>Gerador brasileiro</h1>
      <p>Dados rápidos para testes</p>
    </div>
    <button
      class="theme-toggle"
      type="button"
      :title="theme === 'dark' ? 'Tema claro' : 'Tema escuro'"
      :aria-label="theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'"
      @click="emit('toggleTheme')"
    >
      <svg class="moon-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" /></svg
      ><svg class="sun-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
        />
      </svg>
    </button>
    <span class="status"><i /> Offline</span>
  </header>
  <nav class="main-tabs" aria-label="Geradores">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="main-tab"
      :class="{ active: panel === tab.id }"
      type="button"
      @click="emit('selectPanel', tab.id)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>
