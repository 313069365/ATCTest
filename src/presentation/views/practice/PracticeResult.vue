<template>
  <div class="page">
    <header class="top-bar">
      <h1>{{ t('practiceResult') }}</h1>
    </header>

    <main class="content">
      <div class="result-card">
        <div class="result-header">
          <div class="result-icon">{{ accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪' }}</div>
          <h2 class="result-title">{{ accuracy >= 80 ? t('awesome') : accuracy >= 60 ? t('good') : t('keepGoing') }}
          </h2>
        </div>

        <div class="accuracy-circle">
          <svg viewBox="0 0 100 100">
            <circle class="bg" cx="50" cy="50" r="45" />
            <circle class="progress" cx="50" cy="50" r="45"
              :style="{ strokeDasharray: '282.7', strokeDashoffset: 282.7 * (1 - accuracy / 100) }" />
          </svg>
          <span class="accuracy-text">{{ accuracy }}%</span>
        </div>

        <div class="meta-row">
          <div class="meta-item">
            <span class="meta-subject">{{ t(subjectName) }}</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-time">{{ formattedTime }}</span>
            <span class="meta-label">{{ t('timeUsed') }}</span>
          </div>
        </div>

        <div class="stats">
          <div class="stat-item">
            <span class="stat-value correct">{{ correctCount }}</span>
            <span class="stat-label">{{ t('correct') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value wrong">{{ wrongCount }}</span>
            <span class="stat-label">{{ t('wrong') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value unknown">{{ unknownCount }}</span>
            <span class="stat-label">{{ t('pending') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value unanswered">{{ unansweredCount }}</span>
            <span class="stat-label">{{ t('unanswered') }}</span>
          </div>
        </div>


      </div>

      <div class="actions">
        <button class="action-btn primary" @click="goToWrongBook">
          <span class="material-symbols-outlined">visibility</span>
          {{ t('viewWrongQuestions') }}
        </button>
        <div class="action-row">
          <button class="action-btn secondary" @click="practiceAgain">
            <span class="material-symbols-outlined">restart_alt</span>
            {{ t('practiceAgain') }}
          </button>
          <button class="action-btn outline" @click="backToHome">
            <span class="material-symbols-outlined">home</span>
            {{ t('backToHome') }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAppStore } from "@/domain/stores/store";
import { usePracticeService } from "@/domain/composables/usePracticeService";
import { t } from "@/infrastructure/utils/i18n.js";
import { getPracticeKey } from "@/infrastructure/storage/progress";
import { normalizeSession } from "@/infrastructure/storage/sessionAdapter";

const router = useRouter();
const route = useRoute();
const store = useAppStore();
const pm = usePracticeService();

const practiceData = ref(null);
const stats = ref(null);

const formattedTime = computed(() => {
  if (!stats.value) return '00:00';
  const hours = Math.floor(stats.value.elapsedSeconds / 3600);
  const minutes = Math.floor((stats.value.elapsedSeconds % 3600) / 60);
  const seconds = stats.value.elapsedSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const accuracy = computed(() => stats.value?.accuracy ?? 0);
const correctCount = computed(() => stats.value?.correctCount ?? 0);
const wrongCount = computed(() => stats.value?.wrongCount ?? 0);
const unknownCount = computed(() => stats.value?.unknownCount ?? 0);
const unansweredCount = computed(() => stats.value?.unansweredCount ?? 0);
const subjectName = computed(() => stats.value?.subject ?? '');

onMounted(async () => {
  await store.loadPracticeHistory();

  const history = normalizeSession(store.practiceHistory[0]);
  if (!history) {
    router.push({ name: "Home" });
    return;
  }

  practiceData.value = history;
  stats.value = pm.getSessionStats(history);

  const bank = history.config
  if (bank && (bank.category || bank.subject)) {
    const key = getPracticeKey({ bank })
    store.clearPracticeProgress(key)
  }
});

const backToHome = () => {
  router.push({ name: "Home" });
};

const goToWrongBook = () => {
  router.push({ name: "WrongBook" });
};

const practiceAgain = () => {
  const cfg = practiceData.value?.config
  if (cfg && (cfg.category || cfg.subject)) {
    router.push({
      name: "Practice",
      query: {
        category: cfg.category,
        scope: cfg.scope,
        subject: cfg.subject
      }
    });
  } else {
    router.push({ name: "Practice" });
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background-secondary);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background: var(--primary);
  color: var(--on-primary);
}

.top-bar .back-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--on-primary);
}

.top-bar h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

.content {
  padding: var(--spacing-md);
}

.result-card {
  background: var(--background);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--spacing-md);
}

.result-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.result-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-sm);
}

.result-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
}

.accuracy-circle {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto var(--spacing-lg);
}

.accuracy-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.accuracy-circle .bg {
  fill: none;
  stroke: var(--color-gray-300);
  stroke-width: 8;
}

.accuracy-circle .progress {
  fill: none;
  stroke: var(--primary);
  stroke-width: 8;
  stroke-linecap: round;
}

.accuracy-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--primary);
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--background-surface);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.meta-subject {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  text-align: center;
}

.meta-time {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary);
}

.meta-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.meta-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color-light);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color-light);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--on-surface);
}

.stat-value.correct {
  color: var(--success);
}

.stat-value.wrong {
  color: var(--error);
}

.stat-value.unknown {
  color: var(--warning);
}

.stat-value.unanswered {
  color: var(--text-disabled);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.action-btn.primary {
  background: var(--primary);
  color: var(--on-primary);
}

.action-row {
  display: flex;
  gap: var(--spacing-sm);
}

.action-btn.secondary {
  flex: 1;
  background: var(--background-surface);
  color: var(--on-surface);
}

.action-btn.outline {
  flex: 1;
  background: var(--background);
  color: var(--on-surface);
  border: 1px solid var(--border-color-strong);
}
</style>