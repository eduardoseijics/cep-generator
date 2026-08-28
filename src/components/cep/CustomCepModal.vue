<script setup lang="ts">
import { ref } from 'vue';
import type { CustomCep } from '../../types';
import { CepFormatter } from '../../utils/CepFormatter';

const props = defineProps<{ item?: CustomCep; error: string }>();
const emit = defineEmits<{ close: []; save: [cep: string, label: string] }>();
const formCep = ref(props.item ? CepFormatter.format(props.item.cep) : '');
const formLabel = ref(props.item?.label ?? '');

function formatCepInput(): void {
  formCep.value = formCep.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2');
}
function save(): void {
  emit('save', formCep.value, formLabel.value);
}
</script>

<template>
  <div class="modal open" role="dialog" aria-modal="true" aria-labelledby="customCepModalTitle">
    <div class="modal-backdrop" @click="emit('close')" />
    <form class="modal-card" @submit.prevent="save">
      <h2 id="customCepModalTitle">{{ item ? 'Editar CEP' : 'Adicionar CEP' }}</h2>
      <label for="customCep">CEP</label>
      <input
        id="customCep"
        v-model="formCep"
        maxlength="9"
        placeholder="00000-000"
        @input="formatCepInput"
      />
      <label for="customCepLabel">Apelido (opcional)</label>
      <input id="customCepLabel" v-model="formLabel" placeholder="Ex.: Casa" />
      <p class="form-error">{{ error }}</p>
      <div class="modal-actions">
        <button type="button" class="secondary-button" @click="emit('close')">Cancelar</button
        ><button class="save-button">Salvar</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: grid;
  align-items: end;
}
.modal-backdrop {
  position: absolute;
  inset: 0;
  background: #1f243350;
  opacity: 0;
  transition: 0.18s;
}
.modal-card {
  position: relative;
  z-index: 1;
  padding: 18px;
  border-radius: 17px 17px 0 0;
  background: #fff;
  box-shadow: 0 -10px 35px #20243320;
  opacity: 0;
  transform: translateY(20px);
  transition: 0.2s;
}
.modal.open .modal-backdrop,
.modal.open .modal-card {
  opacity: 1;
}
.modal.open .modal-card {
  transform: translateY(0);
}
.modal-card > input {
  width: 100%;
  height: 39px;
  padding: 0 11px;
  color: #242c3d;
  border: 1px solid #dfe2e8;
  border-radius: 9px;
  outline: none;
  background: #fff;
  font-size: 12px;
}
.modal-card > label {
  display: block;
  margin: 10px 1px 4px;
  font-size: 11px;
  font-weight: 700;
}
.modal-card > input:focus {
  border-color: #7564e9;
  box-shadow: 0 0 0 3px #6655dc12;
}
.modal-card > input:focus-visible {
  outline: 3px solid #6655dc33;
}
.form-error {
  min-height: 15px;
  margin: 5px 1px -3px;
  color: #c93e4b;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
}
.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: 8px;
  margin-top: 16px;
}
.modal-actions button {
  height: 38px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}
.secondary-button {
  border: 1px solid #dde0e6;
  background: #fff;
}
.save-button {
  color: #fff;
  border: 0;
  background: #6654de;
  box-shadow: 0 5px 12px #6654de30;
}
[data-theme='dark'] .modal-card {
  color: #edf0f7;
  background: #20242d;
}
[data-theme='dark'] .modal-card > input {
  color: #edf0f7;
  border-color: #393f4c;
  background: #181b22;
}
[data-theme='dark'] .secondary-button {
  color: #dfe3ec;
  border-color: #3a404c;
  background: #292e38;
}
</style>
