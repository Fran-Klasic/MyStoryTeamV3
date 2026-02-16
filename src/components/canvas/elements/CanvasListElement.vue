<script setup lang="ts">
import type { ListData } from "@/types/canvas/canvas-element";

const MIN_ITEMS = 1;
const MAX_ITEMS = 10;

const props = defineProps<{
  data: ListData;
  editing: boolean;
}>();

const emit = defineEmits<{
  (e: "update:list", listData: string[]): void;
  (e: "blur"): void;
}>();

function addItem() {
  if (props.data.listData.length >= MAX_ITEMS) return;
  emit("update:list", [...props.data.listData, "New item"]);
}

function removeItem() {
  if (props.data.listData.length <= MIN_ITEMS) return;
  emit("update:list", props.data.listData.slice(0, -1));
}

function updateItem(index: number, value: string) {
  const next = [...props.data.listData];
  next[index] = value;
  emit("update:list", next);
}
</script>

<template>
  <div class="mst-canvas-card">
    <ul class="mst-canvas-list">
      <template v-if="editing">
        <li v-for="(item, i) in data.listData" :key="i">
          <input
            :value="item"
            type="text"
            class="mst-canvas-list__input"
            @input="updateItem(i, ($event.target as HTMLInputElement).value)"
          />
        </li>
      </template>
      <li v-else v-for="(item, i) in data.listData" :key="i">{{ item }}</li>
    </ul>
    <div v-if="editing" class="mst-canvas-list__actions">
      <button
        type="button"
        class="mst-canvas-list__btn"
        :disabled="data.listData.length >= MAX_ITEMS"
        @click="addItem"
      >
        +
      </button>
      <button
        type="button"
        class="mst-canvas-list__btn"
        :disabled="data.listData.length <= MIN_ITEMS"
        @click="removeItem"
      >
        −
      </button>
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
}
.mst-canvas-list {
  margin: 0;
  padding-left: 1.25rem;
  list-style: disc;
}
.mst-canvas-list__input {
  width: 100%;
  max-width: 100%;
  border: none;
  background: transparent;
  font: inherit;
  outline: none;
}
.mst-canvas-list__actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
.mst-canvas-list__btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(58, 167, 196, 0.5);
  background: var(--mst-color-bg);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}
.mst-canvas-list__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
