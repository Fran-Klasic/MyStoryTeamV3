<script setup lang="ts">
import PageSection from "@/components/common/PageSection.vue";
import MstCard from "@/components/common/MstCard.vue";
</script>

<template>
  <main class="mst-walkthrough">
    <PageSection title="Dashboard">
      <MstCard>
        <p>
          See your favorite canvases, active plans, and recent work at a glance. The dashboard keeps
          your current \"scenes\" front and center so you always know what to focus on next.
        </p>
      </MstCard>
    </PageSection>

    <PageSection title="Canvas editor">
      <MstCard>
        <p>
          Build visual plans on a spacious grid canvas. Add tasks, lists, images, and key dates to
          map out the story of your goals one card at a time.
        </p>
      </MstCard>
    </PageSection>

    <PageSection title="AI helper">
      <MstCard>
        <p>
          Use the AI helper to generate starting canvases, suggest milestones, or fill in missing
          steps when you feel stuck. It acts like a friendly assistant director for your plans.
        </p>
      </MstCard>
    </PageSection>

    <PageSection title="Planning philosophy">
      <MstCard>
        <ol class="mst-walkthrough__list">
          <li>Capture the big goal as a clear headline.</li>
          <li>Break it into arcs: long-term milestones and medium-term chapters.</li>
          <li>Translate chapters into weekly and daily actions.</li>
          <li>Review, adapt, and celebrate visible progress.</li>
        </ol>
      </MstCard>
    </PageSection>
  </main>
</template>

<style scoped>
.mst-walkthrough {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.mst-walkthrough__list {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
}

.mst-walkthrough__list li {
  margin-bottom: 0.4rem;
}
</style>

