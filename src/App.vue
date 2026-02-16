<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { RouterView } from "vue-router";
import AiQuickChat from "@/components/ai/AiQuickChat.vue";
import { useAiStore } from "@/store/ai.store";

const aiStore = useAiStore();

function onKeyDown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    aiStore.toggleQuickChat();
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <div class="mst-app-root">
    <RouterView />
    <AiQuickChat />
  </div>
</template>

<style scoped>
.mst-app-root {
  min-height: 100vh;
}
</style>
