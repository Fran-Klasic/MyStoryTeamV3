import { ref, onMounted, onBeforeUnmount } from "vue";

export function useMediaQuery(query: string) {
  const matches = ref(false);
  let mql: MediaQueryList | null = null;

  function update() {
    matches.value = mql?.matches ?? false;
  }

  onMounted(() => {
    mql = window.matchMedia(query);
    update();
    mql.addEventListener("change", update);
  });

  onBeforeUnmount(() => {
    mql?.removeEventListener("change", update);
    mql = null;
  });

  return matches;
}

export function useBreakpoint() {
  const isNarrow = useMediaQuery("(max-width: 900px)");
  const isMobile = useMediaQuery("(max-width: 600px)");
  return { isNarrow, isMobile };
}
