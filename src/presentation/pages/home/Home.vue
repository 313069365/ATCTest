<template>
  <div class="home">
    <!-- 顶栏 -->
    <TopBar :title="t('learningPlatform')">
      <template #right>
        <button class="icon-btn" @click="darkMode = !darkMode">
          <Icon name="dark-mode-outline" v-if="darkMode" />
          <Icon name="light-mode-outline" v-else />
        </button>
      </template>
    </TopBar>

    <!-- 搜索栏 -->
    <div class="search-bar" @click="pageTo('/search')">
      <Icon name="search" class="search-icon" />
      <span class="search-placeholder">{{ t('searchTitle') }}</span>
    </div>

    <!-- 主要内容区 -->
    <main class="content">
      <!-- 统计信息区 -->
      <section class="stats-bento">
        <div class="stat-card">
          <span class="stat-label">{{ t('practiceToday') }}</span>
          <div class="stat-value-wrap">
            <span class="stat-value">{{ answeredToday }}</span>
            <span class="stat-unit">{{ t('questions') }}</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-label">{{ t('accuracy') }}</span>
          <div class="stat-value-wrap">
            <span class="stat-value">{{ accuracy }}</span>
            <span class="stat-unit primary">%</span>
          </div>
        </div>
      </section>

      <!-- 主要操作区 -->
      <section class="main-actions">
        <button class="action-btn practice" @click="pageTo('/practice')" :disabled="store.loading">
          <div class="action-text">
            <span class="action-title">{{ t('practiceMode') }}</span>
            <span class="action-subtitle">{{ t('reviewKeyPoints') }}</span>
          </div>
          <div class="action-icon-wrap">
            <Icon name="menu-book" />
          </div>
        </button>
        <button class="action-btn exam" @click="pageTo('/exam')" :disabled="store.loading">
          <div class="action-text">
            <span class="action-title">{{ t('mockExam') }}</span>
            <span class="action-subtitle">{{ t('timedExam') }}</span>
          </div>
          <div class="action-icon-wrap">
            <Icon name="timer" />
          </div>
        </button>
      </section>

      <!-- 继续上次练习区 -->
      <section class="continue-section">
        <h2 class="section-title">{{ t('lastPractice') }}</h2>
        <div class="continue-card">
          <template v-if="lastPractice">
            <div class="continue-inner" @click="continueLastPractice">
              <div class="continue-icon">
                <Icon name="menu-book-outline" />
              </div>
              <div class="continue-info">
                <h3 class="continue-title">{{ t(lastPractice.subject?.name) || '' }}</h3>
                <p class="continue-subtitle">{{ t(lastPractice.category) }} • {{ t(lastPractice.scope) }}</p>
              </div>
              <div class="circular-progress">
                <svg class="circular-progress-svg" viewBox="0 0 100 100">
                  <circle class="progress-bg" cx="50" cy="50" r="42" />
                  <circle class="progress-fg" cx="50" cy="50" r="42"
                    :style="{ strokeDashoffset: circularProgressOffset }" />
                </svg>
                <div class="circular-progress-content">
                  <span class="progress-text">{{ t(lastPractice.currentIndex + 1) }}/{{ t(totalQuestions) }}</span>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="continue-inner placeholder">
              <div class="placeholder-content">
                <div class="placeholder-icon">
                  <Icon name="book-outline" />
                </div>
                <h3 class="placeholder-title">{{ t('noPracticeRecord') }}</h3>
                <p class="placeholder-subtitle">{{ t('startFirstPractice') }}</p>
                <button class="continue-btn" @click="pageTo('/practice')" :disabled="store.loading">{{
                  t('startPractice') }}</button>
              </div>
            </div>
          </template>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/presentation/components/layout/TopBar.vue'
import Icon from '@/presentation/components/common/Icon.vue'
import { useAppStore } from '@/domain/stores/store'
import { t } from '@/infrastructure/utils/i18n.js'
import { usePracticeService } from '@/domain/composables/usePracticeService'
import { createPracticeSession } from '@/infrastructure/storage/session'

const router = useRouter()
const store = useAppStore()

const pm = usePracticeService()
const todayStats = pm.dailyStats()
const answeredToday = computed(() => todayStats.value.answered || 0)
const accuracy = computed(() => todayStats.value.accuracy ?? 0)

const darkMode = ref(localStorage.getItem('darkMode') === 'true')

watch(darkMode, (val) => {
  if (val) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', val)
}, { immediate: true })


// 上次练习
const lastPractice = computed(() => {
  const progress = store.lastPracticeProgress
  if (!progress || !progress.config?.bank) return null

  return {
    subject: {
      name: progress.config.bank.subject,
      category: progress.config.bank.category,
      scope: progress.config.bank.scope
    },
    category: progress.config.bank.category,
    scope: progress.config.bank.scope,
    currentIndex: progress.progress.currentIndex || 0,
    questionIds: progress.progress.questionIds || []
  }
})

// 计算总题数 - 从保存的 progress 中获取
const totalQuestions = computed(() => {
  return lastPractice.value?.questionIds?.length || 0
})

// 练习进度百分比
const lastPracticeProgress = computed(() => {
  if (!lastPractice.value || !totalQuestions.value) return 0
  return Math.round(((lastPractice.value.currentIndex + 1) / totalQuestions.value) * 100)
})

// 圆形进度 SVG stroke-dashoffset
const circularProgressOffset = computed(() => {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  return circumference * (1 - lastPracticeProgress.value / 100)
})

// 继续上次练习
const continueLastPractice = () => {
  const progress = store.lastPracticeProgress
  if (!progress || !progress.config) return

  const practiceData = {
    category: progress.config.bank.category,
    scope: progress.config.bank.scope,
    subject: {
      name: progress.config.bank.subject,
      category: progress.config.bank.category,
      scope: progress.config.bank.scope
    },
    practiceMode: progress.config.mode,
    questionSort: progress.config.questionSort,
    showAnswerMode: progress.config.showAnswerMode,
    autoJump: progress.config.autoJump
  }

  const sessionId = createPracticeSession(practiceData)
  router.push({
    path: '/practice/quiz',
    query: {
      sessionId,
      continue: 'true'
    }
  })
}

// 页面跳转
const pageTo = (path) => {
  router.push(path)
}

// 加载数据
onMounted(() => {
  pm.refresh()
})


</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--gray-100);
  max-width: var(--app-max-width);
  margin: 0 auto;
}




.search-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin: var(--space-md) var(--space-lg) 0;
  padding: var(--space-ms) var(--space-md);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.search-bar:active {
  box-shadow: var(--shadow-md);
}

.search-icon {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xl);
}

.search-placeholder {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
}

.content {
  padding: var(--space-md) var(--space-lg);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.stats-bento {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.stat-card {
  background: var(--color-background);
  padding: var(--space-lg) var(--space-xl);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-md);
}

.stat-card .stat-unit {
  margin-top: var(--space-sm);
}

.stat-card:first-child .stat-value-wrap {
  margin-top: auto;
}

.stat-card:last-child .stat-value-wrap {
  margin-top: auto;
}

.stat-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.stat-value-wrap {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  min-height: 44px;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-black);
  color: var(--color-text);
}

.stat-unit {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
}

.stat-unit.primary {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-black);
  color: var(--color-primary);
}

.main-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.action-btn {
  width: 100%;
  padding: var(--space-lg) var(--space-xl);
  border: none;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.15s;
}

.action-btn:active {
  transform: scale(0.98);
}

.action-btn.practice {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-gradient) 100%);
  color: var(--color-primary-foreground);
}

.action-btn.exam {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-gradient) 100%);
  color: var(--color-primary-foreground);
}

.action-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.action-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-black);
}

.action-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-overlay-light);
  letter-spacing: 0.02em;
}

.action-icon-wrap {
  width: 56px;
  height: 56px;
  background: var(--color-partial-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-wrap svg {
  font-size: var(--font-size-2xl);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-black);
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.continue-section {
  margin-bottom: var(--space-lg);
}

.continue-card {
  padding: 4px 0;
  border-radius: var(--radius-lg);
}

.continue-inner {
  background: var(--color-background);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
}

.placeholder-content {
  text-align: center;
  padding: var(--space-md);
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--gray-400);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  margin: 0 auto 16px;
}

.placeholder-icon svg {
  font-size: var(--font-size-2xl);
}

.placeholder-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.placeholder-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  line-height: var(--line-height-tight);
}

.continue-btn {
  width: 100%;
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: var(--gray-200);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.continue-btn:hover {
  background: var(--gray-400);
  color: var(--color-primary-dark);
}

.continue-inner:not(.placeholder) {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
}

.continue-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--color-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.continue-icon svg {
  font-size: var(--font-size-2xl);
}

.continue-info {
  flex: 1;
  min-width: 0;
}

.continue-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.continue-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.circular-progress {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circular-progress-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: var(--gray-300);
  stroke-width: 6;
}

.progress-fg {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 263.89;
  transition: stroke-dashoffset 0.4s ease;
}

.circular-progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  z-index: 1;
}

.play-icon {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
}

.circular-progress-content .progress-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
</style>