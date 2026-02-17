<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AuthCard from "@/components/auth/AuthCard.vue";
import RegisterForm from "@/components/auth/RegisterForm.vue";
import { useAuthStore } from "@/store/auth.store";

const router = useRouter();
const authStore = useAuthStore();
const errorMessage = ref("");

async function handleSubmit(
  username: string,
  email: string,
  password: string,
  repeatPassword: string,
) {
  errorMessage.value = "";
  await authStore.register(username, email, password, repeatPassword);
  // Force a full reload so all auth state and guards pick up the new token
  window.location.href = "/app/dashboard";
}

function handleError(message: string) {
  errorMessage.value = message;
}
</script>

<template>
  <main class="mst-auth-page">
    <AuthCard>
      <RegisterForm
        :on-submit-auth="handleSubmit"
        @error="handleError"
      />
      <p v-if="errorMessage" class="mst-auth-page__error">{{ errorMessage }}</p>
      <p class="mst-auth-page__footer">
        Already have an account?
        <RouterLink to="/auth/sign-in" class="mst-auth-page__link">Sign in</RouterLink>
      </p>
    </AuthCard>
  </main>
</template>

<style scoped>
.mst-auth-page {
  padding: 2rem 1rem 4rem;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mst-auth-page__error {
  margin: 1rem 0 0;
  font-size: var(--mst-font-size-sm);
  color: #dc2626;
}
.mst-auth-page__footer {
  margin: 1.5rem 0 0;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-auth-page__link {
  color: var(--mst-color-accent);
  font-weight: 600;
  margin-left: 0.25rem;
}
</style>
