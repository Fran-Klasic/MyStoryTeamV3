<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import AuthCard from "@/components/auth/AuthCard.vue";
import SignInForm from "@/components/auth/SignInForm.vue";
import { useAuthStore } from "@/store/auth.store";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const errorMessage = ref("");

async function handleSubmit(email: string, password: string) {
  errorMessage.value = "";
  await authStore.login(email, password);
  const redirect = (route.query.redirect as string) || "/app/dashboard";
  await router.push(redirect);
}

function handleError(message: string) {
  errorMessage.value = message;
}
</script>

<template>
  <main class="mst-auth-page">
    <AuthCard>
      <SignInForm
        :on-submit-auth="handleSubmit"
        @error="handleError"
      />
      <p v-if="errorMessage" class="mst-auth-page__error">{{ errorMessage }}</p>
      <p class="mst-auth-page__footer">
        Don't have an account?
        <RouterLink to="/auth/register" class="mst-auth-page__link">Register</RouterLink>
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
