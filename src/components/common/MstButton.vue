<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
  }>(),
  {
    variant: "primary",
    type: "button",
    disabled: false,
  },
);
</script>

<template>
  <button
    :type="props.type"
    class="mst-btn"
    :class="{
      'mst-btn--primary': props.variant === 'primary',
      'mst-btn--secondary': props.variant === 'secondary',
      'mst-btn--ghost': props.variant === 'ghost',
    }"
    :disabled="props.disabled"
  >
    <slot />
  </button>
</template>

