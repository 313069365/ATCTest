<template>
  <div class="page">
    <div class="hero-section">
      <TopBar :title="t('examResult')" variant="transparent" style="--topbar-color: var(--on-primary)">
        <template #left>
          <button class="icon-btn" @click="goHome">
            <Icon name="home-outline" />
          </button>
        </template>
        <template #right>
          <button class="icon-btn">
            <Icon name="share-outline" />
          </button>
        </template>
      </TopBar>

      <div class="hero-content" v-if="hasResult">
        <div class="grade-badge" :class="gradeClass">
          <Icon name="trophy-outline" />
          <span>{{ gradeText }}</span>
        </div>

        <div class="score-ring">
          <svg viewBox="0 0 120 120">
            <circle class="ring-bg" cx="60" cy="60" r="52" />
            <circle class="ring-progress" cx="60" cy="60" r="52" :style="ringStyle" />
          </svg>
          <div class="score-center">
            <span class="score-main">{{ correctRate }}</span>
            <span class="score-sub">{{ t('correctRate') }}</span>
          </div>
        </div>

        <div class="score-detail">
          <span class="score-value">{{ userScore }}</span>
          <span class="score-divider">/</span>
          <span class="score-total">{{ totalScore }} {{ t('score') }}</span>
        </div>
      </div>

      <div class="hero-content empty" v-else>
        <Icon name="assignment-outline" />
        <p>{{ t('noExamResult') }}</p>
      </div>
    </div>

    <main class="content">
      <section class="stats-section">
        <div class="stats-grid" v-if="hasResult">
          <div class="stat-card correct">
            <div class="stat-indicator"></div>
            <div class="stat-info">
              <span class="stat-value">{{ correctCount }}</span>
              <span class="stat-label">{{ t('correct') }}</span>
            </div>
          </div>
          <div class="stat-card wrong">
            <div class="stat-indicator"></div>
            <div class="stat-info">
              <span class="stat-value">{{ wrongCount }}</span>
              <span class="stat-label">{{ t('wrong') }}</span>
            </div>
          </div>
          <div class="stat-card total">
            <div class="stat-indicator"></div>
            <div class="stat-info">
              <span class="stat-value">{{ totalQuestions }}</span>
              <span class="stat-label">{{ t('totalQuestions') }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="meta-section" v-if="hasResult">
        <div class="meta-card">
          <div class="meta-item">
            <Icon name="schedule-outline" />
            <div class="meta-text">
              <span class="meta-label">{{ t('timeUsed') }}</span>
              <span class="meta-value">{{ formattedTime }}</span>
            </div>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <Icon name="calendar-today-outline" />
            <div class="meta-text">
              <span class="meta-label">{{ t('examDate') }}</span>
              <span class="meta-value">2024年1月15日</span>
            </div>
          </div>
        </div>
      </section>

      <section class="breakdown-section">
        <h3 class="section-title">答题分布</h3>
        <div class="breakdown-card">
          <div class="breakdown-bar">
            <div class="bar-segment correct" style="flex: 85"></div>
            <div class="bar-segment wrong" style="flex: 15"></div>
          </div>
          <div class="breakdown-legend">
            <div class="legend-item">
              <span class="dot correct"></span>
              <span>正确 85%</span>
            </div>
            <div class="legend-item">
              <span class="dot wrong"></span>
              <span>错误 15%</span>
            </div>
          </div>
        </div>
      </section>

      <section class="actions-section">
        <button class="action-btn primary">
          <Icon name="visibility-outline" />
          查看答题详情
        </button>
        <button class="action-btn secondary">
          <Icon name="restart-alt" />
          重新考试
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Icon from '@/presentation/components/ui/Icon.vue'
import TopBar from '@/presentation/components/layout/TopBar.vue'
import { t } from '@/infrastructure/utils/i18n.js'

const router = useRouter()
const route = useRoute()

const totalQuestions = computed(() => parseInt(route.query.totalQuestions) || 0)
const correctCount = computed(() => parseInt(route.query.correctCount) || 0)
const totalScore = computed(() => parseInt(route.query.totalScore) || 0)
const userScore = computed(() => parseInt(route.query.userScore) || 0)
const elapsedTime = computed(() => parseInt(route.query.elapsedTime) || 0)

const wrongCount = computed(() => totalQuestions.value - correctCount.value)
const correctRate = computed(() => {
  if (totalQuestions.value === 0) return '0%'
  return Math.round(correctCount.value / totalQuestions.value * 100) + '%'
})

const gradeClass = computed(() => {
  const rate = parseInt(correctRate.value)
  if (rate >= 90) return 'excellent'
  if (rate >= 80) return 'good'
  if (rate >= 60) return 'pass'
  return 'fail'
})

const gradeText = computed(() => {
  const map = {
    excellent: t('excellent'),
    good: t('good'),
    pass: t('pass'),
    fail: t('fail')
  }
  return map[gradeClass.value]
})

const ringStyle = computed(() => {
  const rate = correctCount.value / totalQuestions.value
  const circumference = 2 * Math.PI * 52
  const offset = circumference * (1 - rate)
  return {
    strokeDasharray: circumference,
    strokeDashoffset: offset
  }
})

const formattedTime = computed(() => {
  const seconds = elapsedTime.value
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分${secs}秒`
})

const hasResult = computed(() => totalQuestions.value > 0)

const goHome = () => {
  router.push('/exam')
}

const retakeExam = () => {
  const paperId = route.query.paperId
  if (paperId) {
    router.push(`/exam/paper?id=${paperId}`)
  } else {
    router.push('/exam')
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.hero-section {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding-bottom: var(--spacing-xl);
  position: relative;
  overflow: hidden;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
}

.grade-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  color: var(--on-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
}

.score-ring {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: var(--spacing-md);
}

.score-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: var(--on-primary);
  stroke-width: 8;
  stroke-linecap: round;
}

.score-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-main {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--on-primary);
}

.score-sub {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.8);
}

.score-detail {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  color: var(--on-primary);
}

.score-value {
  font-size: var(--font-size-xxl);
  font-weight: 700;
}

.score-divider {
  font-size: var(--font-size-lg);
}

.score-total {
  font-size: var(--font-size-md);
}

.content {
  padding: var(--spacing-md);
  margin-top: -var(--spacing-lg);
}

.stats-section {
  margin-bottom: var(--spacing-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
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

.stat-indicator {
  width: 4px;
  height: 32px;
  border-radius: var(--radius-full);
}

.stat-card.correct .stat-indicator {
  background: var(--success);
}

.stat-card.wrong .stat-indicator {
  background: var(--error);
}

.stat-card.total .stat-indicator {
  background: var(--primary);
}

.stat-value {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--on-surface);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.meta-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.meta-item svg {
  color: var(--primary);
}

.meta-text {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.meta-value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
}

.meta-divider {
  width: 1px;
  height: 32px;
  background: var(--border-color-light);
  margin: 0 var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
}

.breakdown-card {
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-md);
}

.breakdown-bar {
  display: flex;
  height: 12px;
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.bar-segment.correct {
  background: var(--success);
}

.bar-segment.wrong {
  background: var(--error);
}

.breakdown-legend {
  display: flex;
  justify-content: space-around;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.correct {
  background: var(--success);
}

.dot.wrong {
  background: var(--error);
}

.actions-section {
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

.action-btn.secondary {
  background: var(--background-surface);
  color: var(--on-surface);
}
</style>