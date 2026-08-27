<template>
  <span class="detail-copy-icon" aria-hidden="true" />
  <span class="detail-check-icon" aria-hidden="true" />
</template>

<style scoped>
.detail-copy-icon,
.detail-check-icon {
  position: absolute;
  right: 10px;
  bottom: 11px;
  width: 14px;
  height: 14px;
  background: #fff;
  transition: 0.18s;
}
.detail-copy-icon {
  mask: url('../assets/icons/copy.svg') center / contain no-repeat;
  -webkit-mask: url('../assets/icons/copy.svg') center / contain no-repeat;
}
.detail-check-icon {
  mask: url('../assets/icons/check.svg') center / contain no-repeat;
  -webkit-mask: url('../assets/icons/check.svg') center / contain no-repeat;
  opacity: 0;
  transform: scale(0.55);
}
</style>
