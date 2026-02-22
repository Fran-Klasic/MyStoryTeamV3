<script setup lang="ts">
import PageSection from "@/components/common/PageSection.vue";
import MstCard from "@/components/common/MstCard.vue";
</script>

<template>
  <main class="mst-demos">
    <PageSection title="Example statistics">
      <section class="mst-demos__stats">
        <MstCard>
          <h3>90 day streak</h3>
          <p>Consistent daily planning sessions.</p>
        </MstCard>
        <MstCard>
          <h3>240 tasks completed</h3>
          <p>Visible proof that micro-actions add up.</p>
        </MstCard>
        <MstCard>
          <h3>6 active canvases</h3>
          <p>Career, health, study, relationships, and more.</p>
        </MstCard>
      </section>
    </PageSection>

    <PageSection title="Example public canvases">
      <section class="mst-demos__grid">
        <MstCard>
          <h3>Career reset – 12 month arc</h3>
          <p class="mst-demos__label">AI Generated – Temporary</p>
        </MstCard>
        <MstCard>
          <h3>Study sprint – exam season</h3>
          <p class="mst-demos__label">AI Generated – Temporary</p>
        </MstCard>
        <MstCard>
          <h3>Health reboot – 90 day plan</h3>
          <p class="mst-demos__label">AI Generated – Temporary</p>
        </MstCard>
      </section>
    </PageSection>

    <PageSection title="Starter templates">
      <section class="mst-demos__grid">
        <MstCard>
          <h3>Career</h3>
          <p>Map roles, skills, and networking actions.</p>
        </MstCard>
        <MstCard>
          <h3>Study</h3>
          <p>Organize courses, revisions, and practice exams.</p>
        </MstCard>
        <MstCard>
          <h3>Health</h3>
          <p>Balance movement, nutrition, rest, and recovery.</p>
        </MstCard>
      </section>
    </PageSection>
  </main>
</template>

<style scoped>
.mst-demos {
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
}

.mst-demos__stats,
.mst-demos__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.mst-demos__label {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: var(--mst-color-text-soft);
}

@media (max-width: 600px) {
  .mst-demos {
    gap: 1.5rem;
  }
  .mst-demos__stats,
  .mst-demos__grid {
    gap: 0.75rem;
  }
}
</style>

