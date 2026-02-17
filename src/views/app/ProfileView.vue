<script setup lang="ts">
import { onMounted, computed } from "vue";
import MstCard from "@/components/common/MstCard.vue";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { useCanvasStore } from "@/store/canvas.store";

const authStore = useAuthStore();
const userStore = useUserStore();
const canvasStore = useCanvasStore();

onMounted(async () => {
  await userStore.loadProfile();
  await canvasStore.loadCanvases();
});

const user = computed(() => authStore.user ?? userStore.profile);

const canvasStats = computed(() => {
  const canvases = canvasStore.myCanvases;
  const count = canvases.length;
  if (count === 0) {
    return { count: 0, oldestDate: null as Date | null, newestDate: null as Date | null };
  }
  const dates = canvases.flatMap((c) => {
    const created = c.createdAt ? new Date(c.createdAt).getTime() : null;
    const updated = c.updatedAt ? new Date(c.updatedAt).getTime() : null;
    return [created, updated].filter((d): d is number => d != null);
  });
  const oldest = Math.min(...dates);
  const newest = Math.max(...dates);
  return {
    count,
    oldestDate: new Date(oldest),
    newestDate: new Date(newest),
  };
});

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
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

    <MstCard class="mst-profile__card">
      <h3 class="mst-profile__stats-title">Canvas stats</h3>
      <ul class="mst-profile__stats">
        <li>Canvases made: {{ canvasStats.count }}</li>
        <li>Oldest canvas: {{ canvasStats.oldestDate ? formatDate(canvasStats.oldestDate) : "—" }}</li>
        <li>Newest canvas: {{ canvasStats.newestDate ? formatDate(canvasStats.newestDate) : "—" }}</li>
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
