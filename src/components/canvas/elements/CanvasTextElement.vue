<script setup lang="ts">
const props = defineProps<{
  text: string;
  editing: boolean;
}>();

const emit = defineEmits<{
  (e: "update:text", value: string): void;
  (e: "blur"): void;
}>();
</script>

<template>
  <div class="mst-canvas-card">
    <textarea
      v-if="props.editing"
      class="mst-canvas-card__input"
      :value="props.text"
      @input="emit('update:text', ($event.target as HTMLTextAreaElement).value)"
      @blur="emit('blur')"
    />
    <p v-else>
      {{ text }}
    </p>
  </div>
</template>

<style scoped>
.mst-canvas-card {
  padding: 0.75rem 0.9rem;
  border-radius: var(--mst-radius-md);
  background-color: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(58, 167, 196, 0.5);
  box-shadow: var(--mst-shadow-soft);
  font-size: 0.95rem;
}

.mst-canvas-card__input {
  width: 100%;
  min-height: 3rem;
  border-radius: inherit;
  border: none;
  resize: none;
  outline: none;
  font: inherit;
  background: transparent;
}
</style>

