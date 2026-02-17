<script setup lang="ts">
defineProps<{
  modelValue: string;
  type?: string;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  autocomplete?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <label v-if="label" class="mst-input__label">{{ label }}</label>
  <input
    :type="type ?? 'text'"
    class="mst-input"
    :class="{ 'mst-input--error': error }"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :autocomplete="autocomplete"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
  <p v-if="error" class="mst-input__error">{{ error }}</p>
</template>

<style scoped>
.mst-input__label {
  display: block;
  font-size: var(--mst-font-size-sm);
  font-weight: 600;
  color: var(--mst-color-text);
  margin-bottom: 0.35rem;
}
.mst-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid rgba(58, 167, 196, 0.5);
  border-radius: var(--mst-radius-md);
  font-size: var(--mst-font-size-md);
  background: rgba(255, 255, 255, 0.96);
  outline: none;
  transition: border-color var(--mst-duration-fast) var(--mst-ease-standard);
}
.mst-input:focus {
  border-color: var(--mst-color-accent);
  box-shadow: 0 0 0 2px var(--mst-color-accent-soft);
}
.mst-input--error {
  border-color: #dc2626;
}
.mst-input__error {
  margin: 0.25rem 0 0;
  font-size: var(--mst-font-size-xs);
  color: #dc2626;
}
</style>
