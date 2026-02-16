import { ref, computed } from "vue";

export function useCanvasPanZoom() {
  const zoom = ref(1);
  const offsetX = ref(0);
  const offsetY = ref(0);

  const transformStyle = computed(() => {
    return `translate(${offsetX.value}px, ${offsetY.value}px) scale(${zoom.value})`;
  });

  function setZoom(next: number) {
    const clamped = Math.min(2, Math.max(0.5, next));
    zoom.value = clamped;
  }

  function zoomBy(delta: number) {
    setZoom(zoom.value + delta);
  }

  /** Zoom in/out keeping the point (viewportX, viewportY) fixed under the cursor */
  function zoomAt(viewportX: number, viewportY: number, delta: number) {
    const zoomPrev = zoom.value;
    const zoomNext = Math.min(2, Math.max(0.5, zoomPrev + delta));
    if (zoomNext === zoomPrev) return;
    const cx = (viewportX - offsetX.value) / zoomPrev;
    const cy = (viewportY - offsetY.value) / zoomPrev;
    zoom.value = zoomNext;
    offsetX.value = viewportX - cx * zoomNext;
    offsetY.value = viewportY - cy * zoomNext;
  }

  function panBy(dx: number, dy: number) {
    offsetX.value += dx;
    offsetY.value += dy;
  }

  return {
    zoom,
    offsetX,
    offsetY,
    transformStyle,
    setZoom,
    zoomBy,
    zoomAt,
    panBy,
  };
}

