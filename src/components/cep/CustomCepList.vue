<script setup lang="ts">
import { states } from '../../data/states';
import type { CustomCep } from '../../types';
import { CepFormatter } from '../../utils/CepFormatter';
import CopyButton from '../CopyButton.vue';

const props = defineProps<{ customCeps: CustomCep[]; useFormat: boolean }>();
const emit = defineEmits<{
  add: [];
  edit: [item: CustomCep];
  remove: [id: string];
  feedback: [message: string];
}>();
const stateNames = new Map(states.map((state) => [state.uf, state.name]));

function format(cep: string): string {
  return CepFormatter.format(cep, props.useFormat);
}
function stateName(uf: string): string {
  return stateNames.get(uf) ?? uf;
}
</script>

<template>
  <section class="custom-section">
    <div class="section-title">
      <div>
        <h2>Meus CEPs</h2>
        <span>{{ customCeps.length }} salvos</span>
      </div>
      <button class="add-button" type="button" @click="emit('add')">+ Adicionar</button>
    </div>
    <div class="custom-list">
      <div v-for="item in customCeps" :key="item.id" class="custom-item">
        <span class="mini-badge">{{ item.uf }}</span
        ><span class="custom-info"
          ><strong>{{ format(item.cep) }}</strong
          ><small>{{ item.label || stateName(item.uf) }}</small></span
        ><CopyButton
          :value="format(item.cep)"
          label="Copiar CEP"
          success-message="CEP copiado!"
          @feedback="emit('feedback', $event)"
        /><button type="button" aria-label="Editar CEP" @click="emit('edit', item)">✎</button
        ><button type="button" aria-label="Excluir CEP" @click="emit('remove', item.id)">×</button>
      </div>
      <p v-if="!customCeps.length" class="custom-empty">
        Adicione CEPs que você usa com frequência.
      </p>
    </div>
  </section>
</template>

<style scoped>
.custom-section {
  margin-top: 15px;
  padding-top: 1px;
  border-top: 1px solid #e7e8ed;
}
.custom-section .section-title {
  margin-top: 13px;
}
.custom-section .section-title > div {
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.custom-section .section-title span {
  color: #999eaa;
  font-size: 10px;
}
.add-button {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6251da !important;
}
.custom-list {
  display: grid;
  gap: 6px;
}
.custom-item {
  display: flex;
  align-items: center;
  min-height: 46px;
  gap: 8px;
  padding: 7px 8px;
  border: 1px solid #e3e5eb;
  border-radius: 9px;
  background: #fff;
}
.custom-info {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 1px;
}
.custom-info strong {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 11px;
}
.custom-info small {
  overflow: hidden;
  color: #959aa7;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.custom-item button {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  color: #8c92a0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
}
.custom-item button:hover {
  color: #5f4ed8;
  background: #f0edff;
}
.custom-item button:last-child:hover {
  color: #d9525e;
  background: #fff0f1;
}
.custom-empty {
  margin: 0;
  padding: 13px;
  color: #999eaa;
  border: 1px dashed #dadde4;
  border-radius: 9px;
  text-align: center;
  font-size: 10px;
}
[data-theme='dark'] .custom-section {
  border-color: #2d323d;
}
[data-theme='dark'] .custom-item {
  color: #e8ebf3;
  border-color: #303541;
  background: #20242d;
}
[data-theme='dark'] .custom-info small,
[data-theme='dark'] .section-title span {
  color: #929aab;
}
[data-theme='dark'] .custom-empty {
  color: #858d9e;
  border-color: #363b47;
}
</style>
