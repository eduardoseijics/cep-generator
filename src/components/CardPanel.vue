<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { documentService } from '../services/DocumentService';
import { StorageService } from '../services/StorageService';
import type { CardBrand, SavedCard } from '../types';
import CardBrandLogo from './CardBrandLogo.vue';
import CardDetailCopyIcon from './CardDetailCopyIcon.vue';
import CopyButton from './CopyButton.vue';

const emit = defineEmits<{ feedback: [message: string] }>();
const service = documentService;
const storage = new StorageService();
const brands: CardBrand[] = ['visa', 'mastercard', 'amex', 'discover'];
const labels: Record<CardBrand, string> = {
  visa: 'VISA',
  mastercard: 'MASTERCARD',
  amex: 'AMEX',
  discover: 'DISCOVER'
};
const brand = ref<CardBrand>('visa');
const card = ref(service.generateCard('visa'));
const copied = ref('');
let hasInteracted = false;
function generate(hasUserInteraction = false) {
  hasInteracted ||= hasUserInteraction;
  card.value = service.generateCard(brand.value);
}
function selectBrand(nextBrand: CardBrand) {
  hasInteracted = true;
  brand.value = nextBrand;
  generate();
}
function isSavedCard(value: SavedCard | undefined): value is SavedCard {
  return Boolean(
    value &&
    brands.includes(value.brand) &&
    /^\d{15,16}$/.test(value.number) &&
    /^\d{2}\/\d{4}$/.test(value.expiry) &&
    new RegExp(`^\\d{${value.brand === 'amex' ? 4 : 3}}$`).test(value.cvv)
  );
}
async function copy(value: string, key: string, message: string) {
  try {
    await navigator.clipboard.writeText(value);
    copied.value = key;
    emit('feedback', message);
    window.setTimeout(() => (copied.value = ''), 1500);
  } catch {
    emit('feedback', 'Não foi possível copiar');
  }
}
watch(brand, (value) => void storage.save({ selectedCardBrand: value }));
watch(card, (value) => void storage.save({ savedCard: value }));
onMounted(async () => {
  const saved = await storage.load();
  if (hasInteracted) return;
  if (isSavedCard(saved.savedCard)) {
    brand.value = saved.savedCard.brand;
    card.value = saved.savedCard;
  } else {
    if (saved.selectedCardBrand && brands.includes(saved.selectedCardBrand)) {
      brand.value = saved.selectedCardBrand;
    }
    generate();
  }
});
</script>

<template>
  <section class="generator-panel" aria-labelledby="cardsTitle">
    <div class="panel-intro">
      <h2 id="cardsTitle">Cartões para testes</h2>
      <p>Use apenas em ambientes de desenvolvimento.</p>
    </div>
    <div class="card-brands" role="group" aria-label="Bandeira do cartão">
      <button
        v-for="item in brands"
        :key="item"
        class="card-brand"
        :class="{ selected: brand === item }"
        type="button"
        :aria-label="labels[item]"
        @click="selectBrand(item)"
      >
        <CardBrandLogo :brand="item" />
      </button>
    </div>
    <section class="document-card card-result" aria-live="polite">
      <div class="document-heading">{{ labels[brand] }} · CARTÃO DE TESTE</div>
      <div class="document-value-row">
        <output class="document-value">{{ card.number }}</output
        ><CopyButton
          class="document-copy"
          :value="card.number"
          label="Copiar cartão"
          success-message="Cartão copiado!"
          @feedback="emit('feedback', $event)"
        />
      </div>
      <div class="card-details">
        <button
          type="button"
          :class="{ copied: copied === 'expiry' }"
          @click="copy(card.expiry, 'expiry', 'Validade copiada!')"
        >
          <span>VALIDADE</span><strong>{{ card.expiry }}</strong
          ><CardDetailCopyIcon :copied="copied === 'expiry'" /></button
        ><button
          type="button"
          :class="{ copied: copied === 'cvv' }"
          @click="copy(card.cvv, 'cvv', 'CVV copiado!')"
        >
          <span>CVV</span><strong>{{ card.cvv }}</strong
          ><CardDetailCopyIcon :copied="copied === 'cvv'" />
        </button>
      </div>
      <button class="document-generate" type="button" @click="generate(true)">
        Gerar novo cartão
      </button>
    </section>
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
.card-brands {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}
.card-brand {
  display: grid;
  place-items: center;
  flex: 1;
  height: 38px;
  padding: 4px;
  color: #687084;
  border: 1px solid #e0e2e8;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
}
.card-brand.selected {
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
.card-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin: 0 0 12px;
}
.card-details button {
  position: relative;
  display: grid;
  gap: 5px;
  padding: 11px 12px;
  color: #fff;
  border: 1px solid #ffffff2b;
  border-radius: 9px;
  background: #ffffff14;
  cursor: pointer;
  text-align: left;
  transition: 0.18s;
}
.card-details button:hover {
  border-color: #ffffff66;
  background: #ffffff24;
}
.card-details button:not(.copied):hover .detail-copy-icon {
  transform: translateY(-1px);
}
.card-details span {
  color: #dcd7ff;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.7px;
}
.card-details strong {
  color: #fff;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 18px;
  letter-spacing: 0.5px;
}
.card-details button.copied {
  border-color: #ffffff66;
  background: #ffffff2c;
}
.card-details button.copied .detail-copy-icon {
  opacity: 0;
  transform: scale(0.55);
}
.card-details button.copied .detail-check-icon {
  opacity: 1;
  transform: scale(1);
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
[data-theme='dark'] .card-brand {
  color: #b4bac8;
  border-color: #303541;
  background: #20242d;
}
[data-theme='dark'] .card-brand.selected {
  color: #c8c0ff;
  border-color: #514a79;
  background: #2d2946;
}
[data-theme='dark'] .panel-intro p {
  color: #929aab;
}
</style>
