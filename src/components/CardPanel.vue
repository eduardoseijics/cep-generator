<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { DocumentService } from '../services/DocumentService';
import { StorageService } from '../services/StorageService';
import type { CardBrand, SavedCard } from '../types';
import CopyButton from './CopyButton.vue';

const emit = defineEmits<{ feedback: [message: string] }>();
const service = new DocumentService();
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
const detailCopyIcon =
  '<svg class="detail-copy-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"/></svg><svg class="detail-check-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const brandIcons: Record<CardBrand, string> = {
  visa: '<svg class="brand-logo visa-brand-logo" viewBox="0 0 72 28"><text x="2" y="22" fill="#1434cb" font-family="Arial" font-size="23" font-style="italic" font-weight="900">VISA</text></svg>',
  mastercard:
    '<svg class="brand-logo" viewBox="0 0 52 32"><circle cx="18" cy="16" r="13" fill="#eb001b"/><circle cx="34" cy="16" r="13" fill="#f79e1b"/><path d="M26 4.4a13 13 0 0 1 0 23.2 13 13 0 0 1 0-23.2Z" fill="#ff5f00"/></svg>',
  amex: '<svg class="brand-logo" viewBox="0 0 58 30"><rect x="1" y="2" width="56" height="26" rx="3" fill="#2679bd"/><text x="6" y="21" fill="#fff" font-family="Arial" font-size="13" font-weight="900">AMEX</text></svg>',
  discover:
    '<svg class="brand-logo discover-brand-logo" viewBox="0 0 76 32"><rect x="1" y="2" width="74" height="28" rx="4" fill="#fff"/><text x="6" y="19" fill="#252525" font-family="Arial" font-size="10" font-style="italic" font-weight="900">DISCOVER</text><path d="M6 25h64" stroke="#f58220" stroke-linecap="round" stroke-width="3"/></svg>'
};
function generate() {
  card.value = service.generateCard(brand.value);
}
function selectBrand(nextBrand: CardBrand) {
  brand.value = nextBrand;
  generate();
}
function isSavedCard(value: SavedCard | undefined): value is SavedCard {
  return Boolean(
    value &&
    brands.includes(value.brand) &&
    /^\d{15,16}$/.test(value.number) &&
    /^\d{2}\/\d{4}$/.test(value.expiry) &&
    /^\d{3}$/.test(value.cvv)
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
        v-html="brandIcons[item]"
      />
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
          ><span v-html="detailCopyIcon" /></button
        ><button
          type="button"
          :class="{ copied: copied === 'cvv' }"
          @click="copy(card.cvv, 'cvv', 'CVV copiado!')"
        >
          <span>CVV</span><strong>{{ card.cvv }}</strong
          ><span v-html="detailCopyIcon" />
        </button>
      </div>
      <button class="document-generate" type="button" @click="generate">Gerar novo cartão</button>
    </section>
  </section>
</template>
