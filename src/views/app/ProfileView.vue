<script setup lang="ts">
import { onMounted, computed } from "vue";
import MstCard from "@/components/common/MstCard.vue";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

const authStore = useAuthStore();
const userStore = useUserStore();

onMounted(async () => {
  await userStore.loadProfile();
  await userStore.loadStats();
});

const user = computed(() => authStore.user ?? userStore.profile);
</script>

<template>
  <div class="mst-profile">
    <header class="mst-profile__header">
      <h1 class="mst-profile__title">Profile</h1>
      <p class="mst-profile__subtitle">Your account and stats.</p>
    </header>

    <MstCard v-if="user" class="mst-profile__card">
      <h3 class="mst-profile__name">{{ user.username }}</h3>
      <p class="mst-profile__email">{{ user.email }}</p>
      <p v-if="user.bio" class="mst-profile__bio">{{ user.bio }}</p>
    </MstCard>

    <MstCard v-if="userStore.stats" class="mst-profile__card">
      <h3 class="mst-profile__stats-title">Stats</h3>
      <ul class="mst-profile__stats">
        <li>Completed tasks: {{ userStore.stats.completedTasks }}</li>
        <li>Streaks: {{ userStore.stats.streaks }}</li>
        <li>Time planned: {{ Math.round(userStore.stats.timePlannedMinutes / 60) }}h</li>
      </ul>
    </MstCard>

    <p v-if="!user" class="mst-profile__empty">Loading profile…</p>
  </div>
</template>

<style scoped>
.mst-profile__header {
  margin-bottom: 1.5rem;
}
.mst-profile__title {
  margin: 0 0 0.25rem;
  font-size: var(--mst-font-size-xl);
  font-weight: 700;
  color: var(--mst-color-text);
}
.mst-profile__subtitle {
  margin: 0;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-profile__card {
  margin-bottom: 1rem;
}
.mst-profile__name {
  margin: 0 0 0.25rem;
  font-size: var(--mst-font-size-lg);
  font-weight: 600;
  color: var(--mst-color-text);
}
.mst-profile__email {
  margin: 0;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text-soft);
}
.mst-profile__bio {
  margin: 0.75rem 0 0;
  font-size: var(--mst-font-size-sm);
  color: var(--mst-color-text);
}
.mst-profile__stats-title {
  margin: 0 0 0.5rem;
  font-size: var(--mst-font-size-md);
  font-weight: 600;
  color: var(--mst-color-text);
}
.mst-profile__stats {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--mst-color-text-soft);
  font-size: var(--mst-font-size-sm);
}
.mst-profile__empty {
  color: var(--mst-color-text-soft);
  margin: 0;
}
</style>
