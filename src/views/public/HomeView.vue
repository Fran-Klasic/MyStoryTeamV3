<script setup lang="ts">
import { useRouter } from "vue-router";
import MstButton from "@/components/common/MstButton.vue";
import MstCard from "@/components/common/MstCard.vue";
import PageSection from "@/components/common/PageSection.vue";

const router = useRouter();
</script>

<template>
  <main class="mst-home">
    <section class="mst-home__hero" data-mst-reveal>
      <div class="mst-home__hero-text">
        <p class="mst-home__eyebrow">Cinematic planner &amp; helper</p>
        <h1>Turn your life goals into a story worth directing.</h1>
        <p class="mst-home__lead">
          My Story Team helps you break overwhelming ambitions into clear
          scenes, daily shots, and motivating milestones—so the future feels
          directed, not improvised.
        </p>
        <div class="mst-home__hero-actions">
          <MstButton variant="primary" @click="router.push('/discover')">
            Start exploring
          </MstButton>
          <MstButton variant="secondary" @click="router.push('/auth/sign-in')">
            Sign in
          </MstButton>
        </div>
      </div>
    </section>

    <PageSection id="overview" title="Overview">
      <MstCard>
        <p>
          My Story Team helps you turn big, overwhelming goals into clear,
          manageable plans. By organizing your life into daily actions,
          short-term milestones, and long-term ambitions, the planner gives
          structure, clarity, and motivation to move forward, one step at a
          time.
        </p>
      </MstCard>
    </PageSection>

    <PageSection id="about" title="About">
      <MstCard>
        <p>
          Many people have important life goals such as education, career
          growth, health, or personal development, yet they often struggle to
          turn those goals into action. Common obstacles include not knowing
          where to begin, feeling overwhelmed by long-term ambitions, losing
          motivation over time, and neglecting essential daily habits.
        </p>
        <p style="margin-top: 1rem">
          When these challenges persist, stress, anxiety, and burnout increase.
          Talented and motivated individuals may give up on their ambitions,
          leading to lost potential both on a personal level and within society
          as a whole.
        </p>
        <p style="margin-top: 1rem">
          My Story Team was created to address this problem by helping people
          break down complex goals into clear, structured plans. Instead of
          facing the future as a single overwhelming task, users can focus on
          meaningful steps, track their progress, and build momentum over time.
        </p>
        <ul class="mst-home__bullets">
          <li>Turn big goals into manageable steps</li>
          <li>Stay motivated through visible progress</li>
          <li>Plan daily actions alongside short- and long-term ambitions</li>
        </ul>
      </MstCard>
    </PageSection>
  </main>
</template>

<style scoped>
.mst-home {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.mst-home__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
}

.mst-home__hero-text h1 {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.mst-home__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.75rem;
  color: var(--mst-color-text-soft);
}

.mst-home__lead {
  max-width: 40rem;
}

.mst-home__hero-actions {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.mst-home__bullets {
  margin: 1.5rem 0 0;
  padding-left: 1.25rem;
}

.mst-home__bullets li {
  margin-bottom: 0.4rem;
}

@media (max-width: 768px) {
  .mst-home__hero-text h1 {
    font-size: 2.2rem;
  }
}
</style>
