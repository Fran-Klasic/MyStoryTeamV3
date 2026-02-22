<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    content: string;
    animate?: boolean;
    /** Delay in ms between each word. Default 45. */
    wordDelay?: number;
  }>(),
  { animate: true, wordDelay: 45 }
);

const displayed = ref("");
let timerId: ReturnType<typeof setInterval> | null = null;

function startAnimation(newContent: string) {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  displayed.value = "";
  if (!props.animate || !newContent) {
    displayed.value = newContent;
    return;
  }
  const words = newContent.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    displayed.value = newContent;
    return;
  }
  let i = 0;
  timerId = setInterval(() => {
    if (i >= words.length) {
      if (timerId) clearInterval(timerId);
      timerId = null;
      return;
    }
    displayed.value = (displayed.value ? displayed.value + " " : "") + words[i];
    i++;
  }, props.wordDelay);
}

watch(() => props.content, startAnimation, { immediate: true });

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
});
</script>

<template>
  <span>{{ displayed }}</span>
</template>
