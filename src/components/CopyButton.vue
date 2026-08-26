<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ value: string; label: string; successMessage: string }>();
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
    :class="{ copied }"
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
