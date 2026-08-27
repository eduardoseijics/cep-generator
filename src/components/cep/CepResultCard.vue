<script setup lang="ts">
import type { State } from '../../types';
import CopyButton from '../CopyButton.vue';

defineProps<{ state: State; cep: string }>();
const emit = defineEmits<{ generate: []; feedback: [message: string] }>();
</script>

<template>
  <section class="result-card">
    <div class="result-heading">
      <div>
        <span class="eyebrow">CEP GERADO</span><strong>{{ state.name }} · {{ state.uf }}</strong>
      </div>
      <span class="state-badge">{{ state.uf }}</span>
    </div>
    <div class="cep-row">
      <span class="cep-value">{{ cep }}</span>
      <CopyButton
        :value="cep"
        label="Copiar CEP"
        success-message="CEP copiado!"
        @feedback="emit('feedback', $event)"
      />
    </div>
    <button class="primary-button" type="button" @click="emit('generate')">Gerar novo CEP</button>
  </section>
</template>

<style scoped>
.result-card {
  margin-top: 11px;
  padding: 13px 15px;
  color: #fff;
  border-radius: 14px;
  background: linear-gradient(130deg, #6251de 0%, #7767ea 100%);
  box-shadow: 0 8px 20px #5f4fda2d;
}
.result-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.result-heading > div {
  display: grid;
  gap: 2px;
}
.result-heading strong {
  font-size: 13px;
  font-weight: 600;
}
.eyebrow {
  color: #d5cffd;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.15px;
}
.state-badge {
  padding: 5px 8px;
  border: 1px solid #ffffff33;
  border-radius: 7px;
  background: #ffffff18;
  font-size: 11px;
  font-weight: 700;
}
.cep-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
}
.cep-value {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: 1.4px;
}
.primary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 35px;
  gap: 8px;
  color: #5a48d2;
  border: 0;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 4px 10px #392a9c24;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: 0.18s;
}
.primary-button:hover {
  background: #f8f7ff;
  transform: translateY(-1px);
}
.primary-button:active {
  transform: translateY(0);
}
</style>
