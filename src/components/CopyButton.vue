<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  value: string;
  label: string;
  successMessage: string;
  variant?: 'default' | 'compact';
}>();
const emit = defineEmits<{ feedback: [message: string] }>();
const copied = ref(false);

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.value);
    copied.value = true;
    emit('feedback', props.successMessage);
    window.setTimeout(() => (copied.value = false), 1500);
  } catch {
    emit('feedback', 'Não foi possível copiar');
  }
}
</script>

<template>
  <button
    class="icon-button"
    :class="[{ copied }, props.variant === 'compact' && 'compact']"
    type="button"
    :title="label"
    :aria-label="label"
    @click="copy"
  >
    <svg class="copy-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1" />
    </svg>
    <svg class="check-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
  </button>
</template>

<style scoped>
.icon-button {
  position: relative;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  color: #fff;
  border: 1px solid #ffffff3d;
  border-radius: 10px;
  background: #ffffff17;
  cursor: pointer;
  transition: 0.18s;
}
.icon-button:hover {
  background: #ffffff2a;
  transform: translateY(-1px);
}
.icon-button svg {
  position: absolute;
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  transition: 0.18s;
}
.check-icon {
  opacity: 0;
  transform: scale(0.5);
}
.icon-button.copied {
  color: #5d4bd6;
  border-color: #cfc8fa;
  background: #f0eeff;
}
.icon-button.copied .copy-icon {
  opacity: 0;
  transform: scale(0.5);
}
.icon-button.copied .check-icon {
  opacity: 1;
  transform: scale(1);
}
.icon-button.compact {
  width: 26px;
  height: 26px;
  color: #8c92a0;
  border: 0;
  border-radius: 7px;
  background: transparent;
}
.icon-button.compact:hover {
  color: #5f4ed8;
  background: #f0edff;
  transform: none;
}
.icon-button.compact svg {
  width: 13px;
  height: 13px;
}
.icon-button.compact.copied {
  color: #5d4bd6;
  background: #f0edff;
}
</style>
