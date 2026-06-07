<template>
  <div class="page">
    <header class="top-bar">
      <button class="back-btn" @click="$router.back()">
        <Icon name="arrow-back" />
      </button>
      <h1>历史记录</h1>
      <button class="clear-btn">
        <Icon name="delete-sweep-outline" />
      </button>
    </header>

    <main class="content">
      <div class="stats-section">
        <div class="stat-card">
          <Icon name="assignment-outline" class="stat-icon" />
          <div class="stat-info">
            <span class="stat-value">{{ pm.sessions.value.length }}</span>
            <span class="stat-label">总练习</span>
          </div>
        </div>
        <div class="stat-card">
          <Icon name="target" class="stat-icon" />
          <div class="stat-info">
            <span class="stat-value">{{ pm.overallStats.value.accuracy }}%</span>
            <span class="stat-label">正确率</span>
          </div>
        </div>
        <div class="stat-card">
          <Icon name="history" class="stat-icon" />
          <div class="stat-info">
            <span class="stat-value">{{ pm.sessions.value.length }}</span>
            <span class="stat-label">记录条数</span>
          </div>
        </div>
      </div>

      <div class="history-list">
        <div v-for="item in list" :key="item.id" class="history-card" :class="item.class">
          <div class="card-body">
            <div class="card-header">
              <div class="header-main">
                <h3 class="card-title">{{ item.subjectName }}</h3>
                <span class="card-date">{{ item.date }}</span>
              </div>
            </div>

            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-value" :class="item.accuracyClass">{{ item.accuracy }}%</span>
                <span class="stat-label">正确率</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ item.correct }}/{{ item.total }}</span>
                <span class="stat-label">答题</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ item.time }}</span>
                <span class="stat-label">时长</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-if="list.length === 0">
        <div class="empty-icon-wrapper">
          <Icon name="history" />
        </div>
        <h3>暂无练习记录</h3>
        <p>开始练习后，记录会自动保存</p>
        <button class="start-btn">开始练习</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import Icon from '@/presentation/components/common/Icon.vue'
import { usePracticeService } from '@/domain/composables/usePracticeService'
import { t } from '@/infrastructure/utils/i18n.js'

const pm = usePracticeService()

onMounted(() => {
  pm.refresh()
})

const list = computed(() =>
  pm.sessions.value.slice(0, 50).map(s => {
    const st = pm.getSessionStats(s)
    const date = st.timestamp ? formatRelativeTime(st.timestamp) : ''
    const cls = st.accuracy >= 80 ? 'excellent' : st.accuracy >= 60 ? 'good' : 'needs-work'
    const timeStr = formatDuration(st.elapsedSeconds)
    return {
      id: st.timestamp || Math.random(),
      subjectName: t(st.subject) || st.subject,
      date,
      accuracy: st.accuracy,
      class: cls,
      accuracyClass: cls,
      correct: st.correctCount,
      total: st.totalQuestions,
      time: timeStr
    }
  })
)

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
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--primary);
  color: var(--on-primary);
}

.back-btn, .clear-btn {
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
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.content {
  padding: var(--spacing-md);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 24px;
  color: var(--primary);
}

.stat-value {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--on-surface);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.history-card {
  background: var(--background);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border-left: 4px solid var(--success);
}

.history-card.good {
  border-left-color: var(--primary);
}

.history-card.needs-work {
  border-left-color: var(--warning);
}

.card-body {
  padding: var(--spacing-md);
}

.card-header {
  margin-bottom: var(--spacing-md);
}

.card-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  margin-bottom: var(--spacing-mn);
}

.card-date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-item .stat-value {
  font-size: var(--font-size-md);
}

.stat-item .stat-value.excellent {
  color: var(--success);
}

.stat-item .stat-value.good {
  color: var(--primary);
}

.stat-item .stat-value.needs-work {
  color: var(--warning);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color-light);
}

.card-footer {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background-surface);
  border-top: 1px solid var(--border-color-light);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.review-btn {
  background: var(--primary-light);
  color: var(--primary);
}

.delete-btn {
  background: var(--background-secondary);
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: var(--color-gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.empty-icon-wrapper svg {
  font-size: 36px;
  color: var(--text-disabled);
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.start-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
</style>