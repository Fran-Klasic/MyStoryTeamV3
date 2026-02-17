<script setup lang="ts">
import { ref, computed } from "vue";
import MstButton from "@/components/common/MstButton.vue";
import MstInput from "@/components/common/MstInput.vue";

const props = defineProps<{
  onSubmitAuth?: (
    username: string,
    email: string,
    password: string,
    repeatPassword: string,
  ) => Promise<void>;
}>();

const emit = defineEmits<{
  (e: "error", message: string): void;
}>();

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);

const usernameError = computed(() =>
  username.value.trim() ? "" : "Username is required",
);
const emailError = computed(() => {
  if (!email.value.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
    return "Enter a valid email";
  return "";
});
const passwordError = computed(() => {
  if (!password.value) return "Password is required";
  if (password.value.length < 6)
    return "Password must be at least 6 characters";
  return "";
});
const confirmError = computed(() =>
  password.value && password.value !== confirmPassword.value
    ? "Passwords do not match"
    : "",
);
const canSubmit = computed(
  () =>
    !loading.value &&
    !usernameError.value &&
    !emailError.value &&
    !passwordError.value &&
    !confirmError.value,
);

async function onSubmit() {
  if (!canSubmit.value) return;
  const handler = props.onSubmitAuth;
  loading.value = true;
  try {
    if (handler)
      await handler(
        username.value.trim(),
        email.value.trim(),
        password.value,
        confirmPassword.value,
      );
    else emit("error", "No submit handler");
  } catch (err) {
    emit("error", err instanceof Error ? err.message : "Registration failed");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="mst-register-form" @submit.prevent="onSubmit">
    <h2 class="mst-register-form__title">Create account</h2>
    <p class="mst-register-form__subtitle">
      Join My Story Team to start planning.
    </p>
    <div class="mst-register-form__fields">
      <MstInput
        v-model="username"
        type="text"
        label="Username"
        placeholder="John Doe"
        autocomplete="username"
        :error="usernameError"
        :disabled="loading"
      />
      <MstInput
        v-model="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autocomplete="email"
        :error="emailError"
        :disabled="loading"
      />
      <MstInput
        v-model="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autocomplete="new-password"
        :error="passwordError"
        :disabled="loading"
      />
      <MstInput
        v-model="confirmPassword"
        type="password"
        label="Confirm password"
        placeholder="••••••••"
        autocomplete="new-password"
        :error="confirmError"
        :disabled="loading"
      />
    </div>
    <div class="mst-register-form__actions">
      <MstButton type="submit" variant="primary" :disabled="!canSubmit">
        {{ loading ? "Creating account…" : "Register" }}
      </MstButton>
    </div>
  </form>
</template>

<style scoped>
.mst-register-form__title {
  margin: 0 0 0.25rem;
  font-size: var(--mst-font-size-xl);
  font-weight: 700;
  color: var(--mst-color-text);
}
.mst-register-form__subtitle {
  margin: 0 0 1.5rem;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-register-form__fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.mst-register-form__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
