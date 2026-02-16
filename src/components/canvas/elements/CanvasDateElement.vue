<script setup lang="ts">
import type { DateData } from "@/types/canvas/canvas-element";
import { computed } from "vue";

const props = defineProps<{
  data: DateData;
  editing: boolean;
}>();

const emit = defineEmits<{
  (e: "update:date", date: string, data: string): void;
  (e: "blur"): void;
}>();

const daysLeft = computed(() => {
  const d = new Date(props.data.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
});

function updateDate(value: string) {
  emit("update:date", value, props.data.data);
}

function updateGoal(value: string) {
  emit("update:date", props.data.date, value);
}
</script>

<template>
  <div class="mst-canvas-card mst-canvas-date">
    <template v-if="editing">
      <label class="mst-canvas-date__field">
        <span class="mst-canvas-date__label">Date</span>
        <input
          type="date"
          class="mst-canvas-date__input"
          :value="data.date"
          @input="updateDate(($event.target as HTMLInputElement).value)"
        />
      </label>
      <label class="mst-canvas-date__field">
        <span class="mst-canvas-date__label">Goal</span>
        <input
          type="text"
          class="mst-canvas-date__input"
          :value="data.data"
          placeholder="Goal or description"
          @input="updateGoal(($event.target as HTMLInputElement).value)"
          @blur="emit('blur')"
        />
      </label>
    </template>
    <template v-else>
      <p class="mst-canvas-date__date">{{ data.date }}</p>
      <p class="mst-canvas-date__data">{{ data.data }}</p>
      <p class="mst-canvas-date__countdown">
        {{ daysLeft > 0 ? daysLeft + " days left" : daysLeft === 0 ? "Today" : Math.abs(daysLeft) + " days ago" }}
      </p>
    </template>
  </div>
</template>

<style scoped>
.mst-canvas-card {
  padding: 0.75rem 0.9rem;
  border-radius: var(--mst-radius-md);
  background-color: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(58, 167, 196, 0.5);
  box-shadow: var(--mst-shadow-soft);
  font-size: 0.85rem;
}
.mst-canvas-date__date { margin: 0; font-weight: 600; }
.mst-canvas-date__data { margin: 0.25rem 0 0; }
.mst-canvas-date__countdown { margin: 0.25rem 0 0; font-size: 0.75rem; color: var(--mst-color-text-soft); }
.mst-canvas-date__field { display: block; margin-top: 0.5rem; }
.mst-canvas-date__field:first-child { margin-top: 0; }
.mst-canvas-date__label { display: block; font-size: 0.75rem; color: var(--mst-color-text-soft); margin-bottom: 0.2rem; }
.mst-canvas-date__input {
  width: 100%;
  padding: 0.35rem 0.5rem;
  border: 1px solid rgba(58, 167, 196, 0.5);
  border-radius: 6px;
  font-size: 0.85rem;
  outline: none;
  box-sizing: border-box;
}
</style>
