<script setup lang="ts">
import amexLogo from '../assets/brands/amex.svg';
import discoverLogo from '../assets/brands/discover.svg';
import mastercardLogo from '../assets/brands/mastercard.svg';
import visaLogo from '../assets/brands/visa.svg';
import type { CardBrand } from '../types';

const props = defineProps<{ brand: CardBrand }>();
const logos: Record<CardBrand, string> = {
  visa: visaLogo,
  mastercard: mastercardLogo,
  amex: amexLogo,
  discover: discoverLogo
};
</script>

<template>
  <img class="brand-logo" :class="`${props.brand}-brand-logo`" :src="logos[props.brand]" alt="" />
</template>

<style scoped>
.brand-logo {
  width: 43px;
  height: 25px;
}
.visa-brand-logo {
  width: 47px;
}
.discover-brand-logo {
  width: 52px;
}
</style>
