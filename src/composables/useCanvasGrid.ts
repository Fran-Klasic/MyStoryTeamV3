import { computed } from "vue";

export function useCanvasGrid() {
  const gridStyle = computed(() => {
    const dot = "rgba(148, 163, 184, 0.55)";
    const size = 24;
    const backgroundImage = `
      radial-gradient(circle, ${dot} 1px, transparent 0)
    `;
    const backgroundSize = `${size}px ${size}px`;

    return {
      backgroundImage,
      backgroundSize,
    };
  });

  return { gridStyle };
}

