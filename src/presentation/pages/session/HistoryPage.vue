<template>
  <div class="page">
    <TopBar :title="isExamMode ? '考试记录' : '练习记录'" showBack variant="primary" @back="$router.back()">
      <template #right>
        <button class="icon-btn">
          <Icon name="delete-sweep-outline" />
        </button>
      </template>
    </TopBar>

    <main class="content">
      <div class="stats-section">
        <div class="stat-card">
          <Icon name="assignment-outline" class="stat-icon" />
          <div class="stat-info">
            <span class="stat-value">{{ list.length }}</span>
            <span class="stat-label">次数</span>
          </div>
        </div>
        <div class="stat-card">
          <Icon name="target" class="stat-icon" />
          <div class="stat-info">
            <span class="stat-value">{{ avgAccuracy }}%</span>
            <span class="stat-label">正确率</span>
          </div>
        </div>
        <div class="stat-card">
          <Icon name="history" class="stat-icon" />
          <div class="stat-info">
            <span class="stat-value">{{ list.length }}</span>
            <span class="stat-label">记录</span>
          </div>
        </div>
      </div>

      <div class="history-list">
        <div v-for="item in list" :key="item.id" class="history-card" :class="item.cardClass">
          <div class="card-accent"></div>
          <div class="card-body">
            <div class="card-top">
              <div class="card-info">
                <h3 class="card-title">{{ item.title }}</h3>
                <span class="card-date">{{ item.date }}</span>
              </div>
              <span class="card-badge" :class="item.badgeClass">{{ item.badge }}</span>
            </div>

            <div class="metrics-row">
              <div class="metric">
                <span class="metric-value" :class="item.cardClass">{{ item.accuracy }}%</span>
                <span class="metric-label">正确率</span>
              </div>
              <span class="metric-divider"></span>
              <div class="metric">
                <span class="metric-value">{{ item.correct }}/{{ item.total }}</span>
                <span class="metric-label">答题</span>
              </div>
              <span class="metric-divider"></span>
              <div class="metric">
                <span class="metric-value">{{ item.time }}</span>
                <span class="metric-label">时长</span>
              </div>
              <span class="metric-divider"></span>
              <div class="metric">
                <span class="metric-value">{{ item.score }}/{{ item.totalScore }}</span>
                <span class="metric-label">得分</span>
              </div>
            </div>

            <div class="card-actions">
              <button class="action-btn secondary">
                <Icon name="delete-outline" />
                删除
              </button>
              <button class="action-btn" :class="item.altClass">
                <Icon name="visibility-outline" />
                回顾
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-if="list.length === 0">
        <div class="empty-icon-wrapper">
          <Icon name="history" />
        </div>
        <h3>{{ isExamMode ? '暂无考试记录' : '暂无练习记录' }}</h3>
        <p>{{ isExamMode ? '参加考试后，记录会自动保存' : '开始练习后，记录会自动保存' }}</p>
        <button v-if="!isExamMode" class="start-btn" @click="$router.push({ name: 'Practice' })">开始练习</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '@/presentation/components/common/Icon.vue'
import TopBar from '@/presentation/components/layout/TopBar.vue'
import { usePracticeService } from '@/domain/composables/usePracticeService'
import { t } from '@/infrastructure/utils/i18n.js'

const route = useRoute()
const isExamMode = computed(() => route.name === 'ExamHistory')

const pm = usePracticeService()

onMounted(() => {
  if (!isExamMode.value) pm.refresh()
})

function getTier(accuracy) {
  if (accuracy >= 80) return 'excellent'
  if (accuracy >= 60) return 'good'
  return 'needs-work'
}

function formatRelativeTime(ts) {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}秒`
  return `${m}分钟${s}秒`
}

const list = computed(() => {
  if (isExamMode.value) return []
  return pm.sessions.value.slice(0, 50).map((s, idx) => {
    const st = pm.getSessionStats(s)
    const altClass = idx % 2 === 0 ? 'alt-blue' : 'alt-amber'
    const total = st.correctCount + st.wrongCount + st.unansweredCount + st.unknownCount
    return {
      id: st.timestamp || Math.random(),
      title: t(st.subject) || st.subject,
      date: st.timestamp ? formatRelativeTime(st.timestamp) : '',
      accuracy: st.accuracy,
      correct: st.correctCount,
      total: st.totalQuestions,
      score: st.correctCount,
      totalScore: total,
      time: formatDuration(st.elapsedSeconds),
      cardClass: ['practice', altClass],
      altClass,
      badge: '练习',
      badgeClass: [altClass],
    }
  })
})

const avgAccuracy = computed(() => {
  if (list.value.length === 0) return 0
  const sum = list.value.reduce((acc, item) => acc + item.accuracy, 0)
  return Math.round(sum / list.value.length)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-muted);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.content {
  padding: var(--space-md);
}

/* ── stats overview ── */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: var(--font-size-2xl);
  color: var(--color-primary);
}

.stat-value {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* ── history list ── */
.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.history-card {
  display: flex;
  background: var(--color-background);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.card-accent {
  width: 5px;
  flex-shrink: 0;
}

.history-card.excellent .card-accent {
  background: var(--color-success);
}

.history-card.practice .card-accent {
  background: var(--color-primary);
}

.history-card.alt-amber .card-accent {
  background: var(--color-warning);
}

.history-card.needs-work .card-accent {
  background: var(--color-destructive);
}

.card-body {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.card-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.card-badge {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.card-badge.alt-blue {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.card-badge.alt-amber {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

/* ── metrics ── */
.metrics-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: var(--space-sm) 0;
}

.metric {
  text-align: center;
}

.metric-value {
  display: block;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.metric-value.excellent {
  color: var(--color-success);
}

.metric-value.practice {
  color: var(--color-primary);
}

.metric-value.practice.alt-amber {
  color: var(--color-warning);
}

.metric-value.needs-work {
  color: var(--color-destructive);
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.metric-divider {
  width: 1px;
  height: 28px;
  background: var(--color-border-light);
}

/* ── actions ── */
.card-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-2xs) 14px;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity 0.15s;
}

.action-btn.alt-blue {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

.action-btn.alt-amber {
  background: var(--color-warning);
  color: var(--color-primary-foreground);
}

.action-btn.secondary {
  background: var(--color-muted);
  color: var(--color-text-secondary);
}

.card-badge.excellent {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.card-badge.needs-work {
  background: var(--color-destructive-bg);
  color: var(--color-destructive);
}

.action-btn svg {
  font-size: var(--font-size-lg);
}

/* ── empty state ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: center;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-md);
}

.empty-icon-wrapper svg {
  font-size: var(--font-size-3xl);
  color: var(--color-disabled);
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.empty-state p {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.start-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
</style>
