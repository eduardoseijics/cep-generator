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
    <span class="copy-icon" aria-hidden="true" />
    <span class="check-icon" aria-hidden="true" />
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
.icon-button .copy-icon,
.icon-button .check-icon {
  position: absolute;
  width: 17px;
  height: 17px;
  background: currentColor;
  transition: 0.18s;
}
.copy-icon {
  mask: url('../assets/icons/copy.svg') center / contain no-repeat;
  -webkit-mask: url('../assets/icons/copy.svg') center / contain no-repeat;
}
.check-icon {
  mask: url('../assets/icons/check.svg') center / contain no-repeat;
  -webkit-mask: url('../assets/icons/check.svg') center / contain no-repeat;
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
</style>
