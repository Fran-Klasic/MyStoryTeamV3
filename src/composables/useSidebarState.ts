import { ref, watch } from "vue";
import { useBreakpoint } from "./useMediaQuery";

export function useSidebarState() {
  const { isNarrow } = useBreakpoint();
  const sidebarOpen = ref(false);

  watch(isNarrow, (narrow) => {
    if (!narrow) sidebarOpen.value = false;
  });

  function openSidebar() {
    sidebarOpen.value = true;
  }

  function closeSidebar() {
    sidebarOpen.value = false;
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  return {
    sidebarOpen,
    isNarrow,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  };
}
