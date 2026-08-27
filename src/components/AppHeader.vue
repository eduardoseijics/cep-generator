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
      <span class="brand-mark-icon" />
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
      <span class="moon-icon" aria-hidden="true" />
      <span class="sun-icon" aria-hidden="true" />
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

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  height: 68px;
  gap: 10px;
  padding: 11px 16px;
  border-bottom: 1px solid #e8eaf0;
  background: #fcfbff;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 37px;
  height: 37px;
  color: #fff;
  border-radius: 11px;
  background: linear-gradient(145deg, #6957e8, #5744d5);
  box-shadow: 0 6px 14px #6553e633;
}
.brand-mark-icon {
  width: 20px;
  height: 20px;
  background: currentColor;
  mask: url('../assets/icons/pin.svg') center / contain no-repeat;
  -webkit-mask: url('../assets/icons/pin.svg') center / contain no-repeat;
}
.topbar h1 {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  letter-spacing: -0.2px;
}
.topbar p {
  margin: 3px 0 0;
  color: #8a91a2;
  font-size: 12px;
}
.theme-toggle {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin-left: auto;
  color: #626a7b;
  border: 1px solid #e2e4ea;
  border-radius: 9px;
  background: #f7f8fa;
  cursor: pointer;
  transition: 0.18s;
}
.theme-toggle:hover {
  color: #5d4bd6;
  border-color: #cdc7f3;
  background: #f1efff;
}
.theme-toggle .moon-icon,
.theme-toggle .sun-icon {
  width: 15px;
  height: 15px;
  grid-area: 1 / 1;
  background: currentColor;
  transition: 0.18s;
}
.moon-icon {
  mask: url('../assets/icons/moon.svg') center / contain no-repeat;
  -webkit-mask: url('../assets/icons/moon.svg') center / contain no-repeat;
}
.sun-icon {
  mask: url('../assets/icons/sun.svg') center / contain no-repeat;
  -webkit-mask: url('../assets/icons/sun.svg') center / contain no-repeat;
  opacity: 0;
  transform: rotate(-45deg) scale(0.6);
}
.status {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  color: #36805b;
  border-radius: 99px;
  background: #eaf8f0;
  font-size: 11px;
  font-weight: 700;
}
.status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4bb878;
}
.main-tabs {
  display: flex;
  gap: 3px;
  padding: 7px 16px;
  border-bottom: 1px solid #e8eaf0;
  background: #fcfbff;
}
.main-tab {
  flex: 1;
  height: 29px;
  color: #7c8495;
  border: 0;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
}
.main-tab.active {
  color: #5d4bd6;
  background: #eeebff;
}
[data-theme='dark'] .topbar,
[data-theme='dark'] .main-tabs {
  border-color: #2b303c;
  background: #1c2029;
}
[data-theme='dark'] .main-tab {
  color: #aeb5c3;
}
[data-theme='dark'] .main-tab.active {
  color: #c8c0ff;
  background: #2d2946;
}
[data-theme='dark'] .topbar p {
  color: #929aab;
}
[data-theme='dark'] .theme-toggle {
  color: #f3c65d;
  border-color: #343a48;
  background: #292e39;
}
[data-theme='dark'] .moon-icon {
  opacity: 0;
  transform: rotate(45deg) scale(0.6);
}
[data-theme='dark'] .sun-icon {
  opacity: 1;
  transform: rotate(0) scale(1);
}
</style>
