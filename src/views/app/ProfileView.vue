<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import MstCard from "@/components/common/MstCard.vue";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { useCanvasStore } from "@/store/canvas.store";
import * as messageService from "@/api/message.service";
import * as aiService from "@/api/ai.service";

const authStore = useAuthStore();
const userStore = useUserStore();
const canvasStore = useCanvasStore();

const statsLoading = ref(true);
const stats = ref({
  conversations: 0,
  messages: 0,
  aiConversations: 0,
  aiMessages: 0,
  canvases: 0,
  canvasElements: 0,
});
const timeSeriesData = ref<{ date: number; value: number }[]>([]);
const hasTimeData = ref(false);

const timeChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
let timeChartRoot: { dispose: () => void } | null = null;
let pieChartRoot: { dispose: () => void } | null = null;

function toDayStart(iso: string): number {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

onMounted(async () => {
  await userStore.loadProfile();
  await canvasStore.loadCanvases();

  statsLoading.value = true;
  try {
    const [conversations, aiConvs] = await Promise.all([
      messageService.getConversations(),
      aiService.getConversations(),
    ]);

    stats.value.conversations = conversations.length;
    stats.value.aiConversations = aiConvs.length;

    const allMessages = await Promise.all(
      conversations.map((c) => messageService.getMessages(c.id))
    );
    stats.value.messages = allMessages.flat().length;

    const aiMessageLists = await Promise.all(
      aiConvs.map((c) => aiService.getMessages(c.id))
    );
    stats.value.aiMessages = aiMessageLists.flat().length;

    const canvases = canvasStore.myCanvases;
    stats.value.canvases = canvases.length;
    stats.value.canvasElements = canvases.reduce(
      (sum, c) => sum + (c.stats?.elementsCount ?? 0),
      0
    );

    const byDay = new Map<number, number>();
    for (const msgs of allMessages) {
      for (const m of msgs) {
        if (m.createdAt) {
          const t = toDayStart(m.createdAt);
          byDay.set(t, (byDay.get(t) ?? 0) + 1);
        }
      }
    }
    for (const c of canvases) {
      if (c.createdAt) {
        const t = toDayStart(c.createdAt);
        byDay.set(t, (byDay.get(t) ?? 0) + 1);
      }
      if (c.updatedAt && c.updatedAt !== c.createdAt) {
        const t = toDayStart(c.updatedAt);
        byDay.set(t, (byDay.get(t) ?? 0) + 1);
      }
    }
    timeSeriesData.value = [...byDay.entries()]
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date - b.date);
    hasTimeData.value = timeSeriesData.value.length > 0;
  } catch {
    stats.value = {
      conversations: 0,
      messages: 0,
      aiConversations: 0,
      aiMessages: 0,
      canvases: canvasStore.myCanvases.length,
      canvasElements: canvasStore.myCanvases.reduce(
        (s, c) => s + (c.stats?.elementsCount ?? 0),
        0
      ),
    };
    hasTimeData.value = false;
  } finally {
    statsLoading.value = false;
  }
});

async function loadAmCharts() {
  const [am5Mod, am5xyMod, am5percentMod, am5themesMod] = await Promise.all([
    import("@amcharts/amcharts5"),
    import("@amcharts/amcharts5/xy"),
    import("@amcharts/amcharts5/percent"),
    import("@amcharts/amcharts5/themes/Animated"),
  ]);
  const am5 = am5Mod.default ?? am5Mod;
  const am5xy = am5xyMod.default ?? am5xyMod;
  const am5percent = am5percentMod.default ?? am5percentMod;
  const ThemeClass = (am5themesMod as { default?: { new: (r: unknown) => unknown } }).default ?? am5themesMod;
  const am5themes_Animated = ThemeClass as { new: (r: unknown) => unknown };
  return { am5, am5xy, am5percent, am5themes_Animated };
}

watch(
  () => [statsLoading.value, stats.value, timeSeriesData.value, hasTimeData.value],
  async () => {
    if (!statsLoading.value) {
      await nextTick();
      if (pieChartRef.value) await initPieChart();
      if (hasTimeData.value && timeChartRef.value) await initTimeChart();
    }
  },
  { immediate: true }
);

async function initTimeChart() {
  if (!timeChartRef.value || timeSeriesData.value.length === 0) return;
  if (timeChartRoot) {
    timeChartRoot.dispose();
    timeChartRoot = null;
  }
  const { am5, am5xy, am5themes_Animated } = await loadAmCharts();

  const root = am5.Root.new(timeChartRef.value);
  root.setThemes([am5themes_Animated.new(root) as any]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: false,
      wheelX: "panX",
      wheelY: "none",
      layout: root.verticalLayout,
    })
  );

  const xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: "day", count: 1 },
      renderer: am5xy.AxisRendererX.new(root, {}),
    })
  );

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    })
  );

  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      name: "Activity",
      xAxis,
      yAxis,
      valueYField: "value",
      valueXField: "date",
    })
  );
  series.strokes.template.setAll({ strokeWidth: 2 });
  series.fills.template.setAll({ fillOpacity: 0.3, visible: true });
  series.data.setAll(timeSeriesData.value);

  chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "zoomX" }));

  timeChartRoot = root;
}

async function initPieChart() {
  if (!pieChartRef.value) return;
  if (pieChartRoot) {
    pieChartRoot.dispose();
    pieChartRoot = null;
  }
  const { am5, am5percent, am5themes_Animated } = await loadAmCharts();

  const root = am5.Root.new(pieChartRef.value);
  root.setThemes([am5themes_Animated.new(root) as any]);

  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      radius: am5.percent(90),
      innerRadius: am5.percent(50),
      layout: root.verticalLayout,
    })
  );

  const data = [
    { category: "Chat", value: stats.value.conversations + stats.value.messages, color: am5.color("#3b82f6") },
    { category: "AI", value: stats.value.aiConversations + stats.value.aiMessages, color: am5.color("#44d7ff") },
    { category: "Canvas", value: stats.value.canvases + stats.value.canvasElements, color: am5.color("#22c55e") },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    data.push({ category: "No activity", value: 1, color: am5.color("#94a3b8") });
  }

  const series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: "value",
      categoryField: "category",
    })
  );
  series.slices.template.setAll({
    cornerRadius: 4,
    strokeWidth: 2,
    stroke: am5.color("#fff"),
  });
  series.labels.template.setAll({
    fontSize: 10,
  });
  series.data.setAll(data);

  const legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      layout: root.horizontalLayout,
    })
  );
  legend.data.setAll(series.dataItems);

  series.appear();
  chart.appear();

  pieChartRoot = root;
}

onBeforeUnmount(() => {
  timeChartRoot?.dispose();
  timeChartRoot = null;
  pieChartRoot?.dispose();
  pieChartRoot = null;
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
      <h3 class="mst-profile__stats-title">Statistics</h3>
      <p v-if="statsLoading" class="mst-profile__loading">Loading stats…</p>
      <div v-else class="mst-profile__charts">
        <div v-if="hasTimeData" class="mst-profile__chart-wrap">
          <h4 class="mst-profile__chart-title">Activity over time</h4>
          <p class="mst-profile__chart-desc">
            Messages sent and canvases created or updated, grouped by day.
          </p>
          <div ref="timeChartRef" class="mst-profile__chart" />
        </div>
        <div v-else class="mst-profile__stats-list">
          <h4 class="mst-profile__chart-title">Stats</h4>
          <ul class="mst-profile__stats">
            <li>Conversations: {{ stats.conversations }}</li>
            <li>Messages: {{ stats.messages }}</li>
            <li>AI conversations: {{ stats.aiConversations }}</li>
            <li>AI messages: {{ stats.aiMessages }}</li>
            <li>Canvases: {{ stats.canvases }}</li>
            <li>Canvas elements: {{ stats.canvasElements }}</li>
          </ul>
        </div>
        <div class="mst-profile__chart-wrap">
          <h4 class="mst-profile__chart-title">Activity breakdown</h4>
          <div ref="pieChartRef" class="mst-profile__chart mst-profile__chart--pie" />
        </div>
      </div>
    </MstCard>

    <MstCard class="mst-profile__card">
      <h3 class="mst-profile__stats-title">Canvas activity</h3>
      <ul class="mst-profile__stats">
        <li>Canvases: {{ stats.canvases }}</li>
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
  margin: 0 0 1rem;
  font-size: var(--mst-font-size-md);
  font-weight: 600;
  color: var(--mst-color-text);
}
.mst-profile__loading {
  margin: 0;
  color: var(--mst-color-text-soft);
  font-size: var(--mst-font-size-sm);
}
.mst-profile__charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 768px) {
  .mst-profile__charts {
    grid-template-columns: 1fr;
  }
  .mst-profile__chart-wrap:has(.mst-profile__chart--pie) {
    min-height: 380px;
    display: flex;
    flex-direction: column;
  }
  .mst-profile__chart--pie {
    height: 360px;
    min-height: 360px;
    min-width: 0;
    flex: 1;
  }
}
.mst-profile__chart-wrap,
.mst-profile__stats-list {
  min-height: 280px;
}
.mst-profile__stats-list .mst-profile__stats {
  padding-top: 0;
}
.mst-profile__chart-title {
  margin: 0 0 0.25rem;
  font-size: var(--mst-font-size-sm);
  font-weight: 600;
  color: var(--mst-color-text-soft);
}
.mst-profile__chart-desc {
  margin: 0 0 0.5rem;
  font-size: var(--mst-font-size-xs);
  color: var(--mst-color-text-soft);
}
.mst-profile__chart {
  width: 100%;
  height: 280px;
}
.mst-profile__chart--pie {
  height: 320px;
  min-width: 280px;
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
