<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; title: string; hint: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const inputId = `format-toggle-${crypto.randomUUID()}`;
</script>

<template>
  <div class="format-row">
    <label :for="inputId"
      ><strong>{{ title }}</strong
      ><span>{{ hint }}</span></label
    >
    <label class="switch">
      <input
        :id="inputId"
        :checked="props.modelValue"
        type="checkbox"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <span />
    </label>
  </div>
</template>

<style scoped>
.format-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding: 11px 13px;
  border: 1px solid #e2e4ea;
  border-radius: 11px;
  background: #fff;
}
.format-row div {
  display: grid;
  gap: 2px;
}
.format-row > label:first-child {
  display: grid;
  gap: 2px;
}
.format-row strong {
  font-size: 12px;
}
.format-row div span {
  color: #9298a7;
  font-size: 10px;
}
.switch input {
  position: absolute;
  opacity: 0;
}
.switch > span {
  position: relative;
  display: block;
  width: 35px;
  height: 20px;
  border-radius: 20px;
  background: #c7cad2;
  cursor: pointer;
  transition: 0.2s;
}
.switch > span::after {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px #0003;
  content: '';
  transition: 0.2s;
}
.switch input:checked + span {
  background: #6957e4;
}
.switch input:checked + span::after {
  transform: translateX(15px);
}
.switch input:focus-visible + span {
  outline: 3px solid #7564e9;
  outline-offset: 3px;
}
[data-theme='dark'] .format-row {
  border-color: #303541;
  background: #20242d;
}
[data-theme='dark'] .format-row div span {
  color: #929aab;
}
</style>
