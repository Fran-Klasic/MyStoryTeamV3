<script setup lang="ts">
import { ref, computed } from "vue";
import MstButton from "@/components/common/MstButton.vue";
import MstInput from "@/components/common/MstInput.vue";

const props = defineProps<{
  onSubmitAuth?: (email: string, password: string) => Promise<void>;
}>();

const emit = defineEmits<{
  (e: "error", message: string): void;
}>();

const email = ref("");
const password = ref("");
const loading = ref(false);

const emailError = computed(() => {
  if (!email.value.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return "Enter a valid email";
  return "";
});
const passwordError = computed(() => (password.value ? "" : "Password is required"));
const canSubmit = computed(() => !loading.value && !emailError.value && !passwordError.value);

async function onSubmit() {
  if (!canSubmit.value) return;
  const handler = props.onSubmitAuth;
  loading.value = true;
  try {
    if (handler) await handler(email.value.trim(), password.value);
    else emit("error", "No submit handler");
  } catch (err) {
    emit("error", err instanceof Error ? err.message : "Sign in failed");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="mst-sign-in-form" @submit.prevent="onSubmit">
    <h2 class="mst-sign-in-form__title">Sign in</h2>
    <p class="mst-sign-in-form__subtitle">Welcome back to My Story Team</p>
    <div class="mst-sign-in-form__fields">
      <MstInput
        v-model="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        :error="emailError"
        :disabled="loading"
      />
      <MstInput
        v-model="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        :error="passwordError"
        :disabled="loading"
      />
    </div>
    <div class="mst-sign-in-form__actions">
      <MstButton type="submit" variant="primary" :disabled="!canSubmit">
        {{ loading ? "Signing in…" : "Sign in" }}
      </MstButton>
    </div>
  </form>
</template>


<style scoped>
.mst-sign-in-form__title {
  margin: 0 0 0.25rem;
  font-size: var(--mst-font-size-xl);
  font-weight: 700;
  color: var(--mst-color-text);
}
.mst-sign-in-form__subtitle {
  margin: 0 0 1.5rem;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-sign-in-form__fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.mst-sign-in-form__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
