<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

type FontMode = "default" | "dyslexic" | "readable";

type AccessibilityPrefs = {
  fontMode: FontMode;
  highLetterSpacing: boolean;
  highLineHeight: boolean;
  highWordSpacing: boolean;
  largerText: boolean;
  highContrast: boolean;
};

const STORAGE_KEY = "mst_accessibility_prefs";

const isOpen = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const buttonRef = ref<HTMLButtonElement | null>(null);

const prefs = ref<AccessibilityPrefs>({
  fontMode: "default",
  highLetterSpacing: false,
  highLineHeight: false,
  highWordSpacing: false,
  largerText: false,
  highContrast: false,
});

function applyPrefs(next: AccessibilityPrefs) {
  const body = document.body;
  const html = document.documentElement;

  body.classList.toggle("mst-a11y-font-dyslexic", next.fontMode === "dyslexic");
  body.classList.toggle("mst-a11y-font-readable", next.fontMode === "readable");
  body.classList.toggle("mst-a11y-letter-spacing", next.highLetterSpacing);
  body.classList.toggle("mst-a11y-line-height", next.highLineHeight);
  body.classList.toggle("mst-a11y-word-spacing", next.highWordSpacing);
  body.classList.toggle("mst-a11y-high-contrast", next.highContrast);
  html.classList.toggle("mst-a11y-larger-text", next.largerText);
}

function savePrefs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs.value));
}

function updatePrefs(partial: Partial<AccessibilityPrefs>) {
  prefs.value = { ...prefs.value, ...partial };
  applyPrefs(prefs.value);
  savePrefs();
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<AccessibilityPrefs>;
    prefs.value = {
      ...prefs.value,
      ...parsed,
      fontMode:
        parsed.fontMode === "dyslexic" || parsed.fontMode === "readable"
          ? parsed.fontMode
          : "default",
    };
  } catch {
    // ignore malformed storage and keep defaults
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!isOpen.value) return;
  const target = event.target as Node;
  if (panelRef.value?.contains(target) || buttonRef.value?.contains(target)) return;
  isOpen.value = false;
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    isOpen.value = false;
  }
}

onMounted(() => {
  loadPrefs();
  applyPrefs(prefs.value);
  document.addEventListener("pointerdown", onDocumentPointerDown);
  document.addEventListener("keydown", onDocumentKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  document.removeEventListener("keydown", onDocumentKeydown);
});
</script>

<template>
  <div class="mst-a11y-widget">
    <button
      ref="buttonRef"
      type="button"
      class="mst-a11y-widget__button"
      aria-label="Open readability accessibility settings"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      Aa
    </button>

    <transition name="mst-a11y-fade">
      <section
        v-if="isOpen"
        ref="panelRef"
        class="mst-a11y-widget__panel"
        role="dialog"
        aria-label="Readability settings"
      >
        <h3>Reading mode</h3>
        <div class="mst-a11y-widget__field">
          <label for="mst-a11y-font-select">Font</label>
          <select
            id="mst-a11y-font-select"
            :value="prefs.fontMode"
            @change="updatePrefs({ fontMode: ($event.target as HTMLSelectElement).value as FontMode })"
          >
            <option value="default">Default</option>
            <option value="dyslexic">OpenDyslexic style</option>
            <option value="readable">Readable sans-serif</option>
          </select>
        </div>

        <div class="mst-a11y-widget__toggles">
          <label>
            <input
              type="checkbox"
              :checked="prefs.highLetterSpacing"
              @change="updatePrefs({ highLetterSpacing: ($event.target as HTMLInputElement).checked })"
            />
            Increase letter spacing
          </label>
          <label>
            <input
              type="checkbox"
              :checked="prefs.highLineHeight"
              @change="updatePrefs({ highLineHeight: ($event.target as HTMLInputElement).checked })"
            />
            Increase line height
          </label>
          <label>
            <input
              type="checkbox"
              :checked="prefs.highWordSpacing"
              @change="updatePrefs({ highWordSpacing: ($event.target as HTMLInputElement).checked })"
            />
            Increase word spacing
          </label>
          <label>
            <input
              type="checkbox"
              :checked="prefs.largerText"
              @change="updatePrefs({ largerText: ($event.target as HTMLInputElement).checked })"
            />
            Slightly larger text
          </label>
          <label>
            <input
              type="checkbox"
              :checked="prefs.highContrast"
              @change="updatePrefs({ highContrast: ($event.target as HTMLInputElement).checked })"
            />
            Higher contrast
          </label>
        </div>
      </section>
    </transition>
  </div>
</template>

<style scoped>
.mst-a11y-widget {
  position: fixed;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1200;
}

.mst-a11y-widget__button {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 999px;
  border: 1px solid rgba(58, 167, 196, 0.6);
  background: var(--mst-color-bg-elevated);
  color: var(--mst-color-text-inverse);
  box-shadow: var(--mst-shadow-soft);
  font-weight: 700;
  cursor: pointer;
}

.mst-a11y-widget__button:focus-visible {
  outline: 2px solid var(--mst-color-accent);
  outline-offset: 2px;
}

.mst-a11y-widget__panel {
  position: absolute;
  right: 3.3rem;
  top: 50%;
  transform: translateY(-50%);
  width: min(320px, calc(100vw - 5rem));
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(58, 167, 196, 0.35);
  border-radius: var(--mst-radius-md);
  padding: 0.9rem;
  box-shadow: var(--mst-shadow-soft);
}

.mst-a11y-widget__panel h3 {
  margin: 0 0 0.75rem;
  font-size: var(--mst-font-size-md);
}

.mst-a11y-widget__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.mst-a11y-widget__field select {
  border: 1px solid rgba(58, 167, 196, 0.45);
  border-radius: var(--mst-radius-sm);
  padding: 0.5rem;
  background: #fff;
}

.mst-a11y-widget__toggles {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: var(--mst-font-size-sm);
}

.mst-a11y-widget__toggles label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.mst-a11y-fade-enter-active,
.mst-a11y-fade-leave-active {
  transition: opacity var(--mst-duration) var(--mst-ease-standard), transform var(--mst-duration) var(--mst-ease-standard);
}

.mst-a11y-fade-enter-from,
.mst-a11y-fade-leave-to {
  opacity: 0;
  transform: translateY(-48%) scale(0.98);
}

@media (max-width: 600px) {
  .mst-a11y-widget {
    right: 0.5rem;
  }

  .mst-a11y-widget__panel {
    right: 3rem;
    width: min(300px, calc(100vw - 4.25rem));
  }
}
</style>
