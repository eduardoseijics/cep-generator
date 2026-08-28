<script setup lang="ts">
defineProps<{ copied: boolean }>();
</script>

<template>
  <span class="detail-copy-status" :class="{ copied }" aria-hidden="true">
    <svg class="detail-copy-icon" viewBox="0 0 24 24">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1" />
    </svg>
    <svg class="detail-check-icon" viewBox="0 0 24 24">
      <path d="m5 12 4 4L19 6" />
    </svg>
  </span>
</template>

<style scoped>
.detail-copy-icon,
.detail-check-icon {
  position: absolute;
  right: 10px;
  bottom: 11px;
  width: 14px;
  height: 14px;
  fill: none;
  stroke: #fff;
  stroke-width: 1.8;
  transition: 0.18s;
}
.detail-check-icon {
  opacity: 0;
  transform: scale(0.55);
}
.detail-copy-status.copied .detail-copy-icon {
  opacity: 0;
  transform: scale(0.55);
}
.detail-copy-status.copied .detail-check-icon {
  opacity: 1;
  transform: scale(1);
}
</style>
