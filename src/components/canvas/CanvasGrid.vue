<script setup lang="ts">
import { useCanvasGrid } from "@/composables/useCanvasGrid";

const { gridStyle } = useCanvasGrid();
</script>

<template>
  <div class="mst-canvas-grid" :style="gridStyle"></div>
</template>

<style scoped>
.mst-canvas-grid {
  position: absolute;
  inset: 0;
}
</style>

