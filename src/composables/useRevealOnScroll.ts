import { onMounted, onBeforeUnmount } from "vue";

export function useRevealOnScroll(selector = "[data-mst-reveal]") {
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("mst-fade-slide-up--visible");
            observer?.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.15,
      },
    );

    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      el.classList.add("mst-fade-slide-up");
      observer?.observe(el);
    });
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });
}

