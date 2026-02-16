<script setup lang="ts">
import type { TaskData } from "@/types/canvas/canvas-element";

const props = defineProps<{
  data: TaskData;
  editing: boolean;
}>();

const emit = defineEmits<{
  (e: "update:task", data: string, checked: boolean): void;
  (e: "blur"): void;
}>();

function toggleChecked() {
  emit("update:task", props.data.data, !props.data.checked);
}

function updateText(value: string) {
  emit("update:task", value, props.data.checked);
}
</script>

<template>
  <div class="mst-canvas-card">
    <div class="mst-canvas-task">
      <label class="mst-canvas-task__row">
        <input
          type="checkbox"
          class="mst-canvas-task__check"
          :checked="data.checked"
          @change="toggleChecked"
        />
        <input
          v-if="editing"
          type="text"
          class="mst-canvas-task__input"
          :value="data.data"
          @input="updateText(($event.target as HTMLInputElement).value)"
          @blur="emit('blur')"
        />
        <span v-else class="mst-canvas-task__text" :class="{ 'mst-canvas-task__text--done': data.checked }">
          {{ data.data }}
        </span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.mst-canvas-card {
  padding: 0.75rem 0.9rem;
  border-radius: var(--mst-radius-md);
  background-color: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(58, 167, 196, 0.5);
  box-shadow: var(--mst-shadow-soft);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.mst-canvas-task {
  width: 100%;
}
.mst-canvas-task__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: default;
}
.mst-canvas-task__check {
  width: 1.1rem;
  height: 1.1rem;
  cursor: pointer;
  flex-shrink: 0;
}
.mst-canvas-task__input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font: inherit;
  outline: none;
}
.mst-canvas-task__text--done {
  text-decoration: line-through;
  color: var(--mst-color-text-soft);
}
</style>
