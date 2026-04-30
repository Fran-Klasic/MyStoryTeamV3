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
        <div class="mst-home__feature-grid">
          <article class="mst-home__feature-item">
            <img src="/assets/icons/path.svg" alt="" class="mst-home__feature-icon" />
            <div>
              <h3>Path</h3>
              <p>Turn big ambitions into a clear, practical direction.</p>
            </div>
          </article>
          <article class="mst-home__feature-item">
            <img src="/assets/icons/plan.svg" alt="" class="mst-home__feature-icon" />
            <div>
              <h3>Plan</h3>
              <p>Break goals into milestones and daily actions you can execute.</p>
            </div>
          </article>
          <article class="mst-home__feature-item">
            <img src="/assets/icons/story.svg" alt="" class="mst-home__feature-icon" />
            <div>
              <h3>Story</h3>
              <p>Visualize progress and keep momentum through every chapter.</p>
            </div>
          </article>
          <article class="mst-home__feature-item">
            <img src="/assets/icons/team.svg" alt="" class="mst-home__feature-icon" />
            <div>
              <h3>Team</h3>
              <p>Collaborate with guidance and support along the way.</p>
            </div>
          </article>
        </div>
      </MstCard>
    </PageSection>

    <PageSection id="demo" title="See It In Action">
      <MstCard>
        <p class="mst-home__demo-copy">
          Watch a short demo of My Story Team in action.
        </p>
        <div class="mst-home__video-wrap">
          <iframe
            class="mst-home__video"
            src="https://www.youtube.com/embed/jJNYVoAMA_Y"
            title="My Story Team demo video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          />
        </div>
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

    <PageSection id="achievements" title="Recognition">
      <div class="mst-home__achievements">
        <MstCard class="mst-home__achievement-card">
          <h3>1st Place — National EU Code Week Hackathon (Croatia)</h3>
          <a
            href="https://codeweek.eu/blog/national-eu-code-week-hackathon-croatia/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the official announcement
          </a>
        </MstCard>

        <MstCard class="mst-home__achievement-card">
          <h3>Audience Award — EU Code Week Hackathon Finals</h3>
          <a
            href="https://codeweek.eu/blog/eu-code-week-hackathons-finals/"
            target="_blank"
            rel="noopener noreferrer"
          >
            View the finals recap
          </a>
        </MstCard>

        <MstCard class="mst-home__achievement-card">
          <h3>10th Place — Ideja Godine (Croatian high-school competition)</h3>
          <p>Recognized among top national student entrepreneurship teams.</p>
        </MstCard>
      </div>
    </PageSection>
  </main>
</template>

<style scoped>
.mst-home {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.mst-home__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
}

.mst-home__hero-text h1 {
  margin-top: 0.7rem;
  margin-bottom: 0.9rem;
  line-height: 1.15;
  max-width: 18ch;
}

.mst-home__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.75rem;
  color: var(--mst-color-text-soft);
}

.mst-home__lead {
  max-width: 40rem;
  margin: 0;
  color: var(--mst-color-text-soft);
  font-size: 1.05rem;
  line-height: 1.6;
}

.mst-home__hero-actions {
  margin-top: 1.35rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.mst-home__feature-grid {
  margin-top: 1.1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.mst-home__feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.8rem;
  border-radius: var(--mst-radius-md);
  background: rgba(214, 247, 255, 0.35);
  border: 1px solid rgba(58, 167, 196, 0.28);
}

.mst-home__feature-item:hover {
  border-color: rgba(58, 167, 196, 0.45);
  background: rgba(214, 247, 255, 0.5);
}

.mst-home__feature-icon {
  width: 1.6rem;
  height: 1.6rem;
  object-fit: contain;
  flex-shrink: 0;
}

.mst-home__feature-item h3 {
  margin: 0 0 0.2rem;
  font-size: var(--mst-font-size-md);
  line-height: 1.25;
}

.mst-home__feature-item p {
  margin: 0;
  color: var(--mst-color-text-soft);
}

.mst-home__demo-copy {
  margin: 0;
  color: var(--mst-color-text-soft);
}

.mst-home__video-wrap {
  position: relative;
  width: 100%;
  max-width: 860px;
  margin: 0.9rem auto 0;
  border-radius: var(--mst-radius-md);
  overflow: hidden;
  border: 1px solid rgba(58, 167, 196, 0.35);
  box-shadow: var(--mst-shadow-soft);
  background: #000;
  aspect-ratio: 16 / 9;
}

.mst-home__video {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.mst-home__bullets {
  margin: 1.5rem 0 0;
  padding-left: 1.25rem;
}

.mst-home__bullets li {
  margin-bottom: 0.4rem;
}

.mst-home__achievements {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.mst-home__achievement-card {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.mst-home__achievement-card :deep(h3) {
  margin: 0;
  font-size: var(--mst-font-size-md);
  line-height: 1.35;
}

.mst-home__achievement-card :deep(p) {
  margin: 0;
  color: var(--mst-color-text-soft);
}

.mst-home__achievement-card :deep(a) {
  color: var(--mst-color-bg-elevated);
  font-weight: 600;
  text-decoration: underline;
}

.mst-home__achievement-card :deep(a:hover) {
  color: var(--mst-color-text);
}

@media (max-width: 768px) {
  .mst-home__hero-text h1 {
    font-size: 2.2rem;
    max-width: none;
  }

  .mst-home__feature-grid {
    grid-template-columns: 1fr;
  }

  .mst-home__achievements {
    grid-template-columns: 1fr;
  }
}
</style>
