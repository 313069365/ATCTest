<template>
  <div class="home">
    <header class="top-bar">
      <h1 class="title">{{ t('learningPlatform') }}</h1>
      <div class="header-actions">
        <button class="theme-toggle" :class="{ active: darkMode }" @click="darkMode = !darkMode">
          <Icon name="dark-mode-outline" v-if="darkMode" />
          <Icon name="light-mode-outline" v-else />
        </button>
      </div>
    </header>

    <div class="search-bar" @click="pageTo('/search')">
      <Icon name="search" class="search-icon" />
      <span class="search-placeholder">{{ t('searchTitle') }}</span>
    </div>

    <main class="content">
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
                <div class="progress-bar">
                  <div class="progress" :style="{ width: lastPracticeProgress + '%' }"></div>
                </div>
                <span class="progress-text">{{ t('practiced') }} {{ t(lastPractice.currentIndex + 1) }} / {{
                  t(totalQuestions) }} {{ t('questions') }}</span>
              </div>
              <button class="continue-action-btn">
                <Icon name="play-arrow-outline" style="color:#fff" />
              </button>
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
                <button class="continue-btn" @click="pageTo('/practice')" :disabled="store.loading">{{ t('startPractice') }}</button>
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
  background: var(--color-gray-100);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--background);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  height: 56px;
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
}

.header-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-right: 4px;
}

.title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: background 0.2s;
  flex-shrink: 0;
}

.theme-toggle:hover {
  background: var(--color-gray-100);
}

.theme-toggle svg {
  font-size: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: var(--spacing-md) var(--spacing-lg) 0;
  padding: var(--spacing-smd) var(--spacing-md);
  background: var(--background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.search-bar:active {
  box-shadow: var(--shadow-md);
}

.search-icon {
  color: var(--text-secondary);
  font-size: 20px;
}

.search-placeholder {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

.content {
  padding: var(--spacing-md) var(--spacing-lg);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.stats-bento {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.stat-card {
  background: var(--background);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-md);
}

.stat-card .stat-unit {
  margin-top: var(--spacing-sm);
}

.stat-card:first-child .stat-value-wrap {
  margin-top: auto;
}

.stat-card:last-child .stat-value-wrap {
  margin-top: auto;
}

.stat-label {
  font-size: var(--font-size-sm);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.stat-value-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-height: 44px;
}

.stat-value {
  font-size: var(--font-size-xxl);
  font-weight: 900;
  color: var(--text-primary);
}

.stat-unit {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--success);
}

.stat-unit.primary {
  font-size: var(--font-size-3xl);
  font-weight: 900;
  color: var(--primary);
}

.main-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.action-btn {
  width: 100%;
  padding: var(--spacing-lg) var(--spacing-xl);
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
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-gradient-end) 100%);
  color: var(--on-primary);
}

.action-btn.exam {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-gradient-end) 100%);
  color: var(--on-primary);
}

.action-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.action-title {
  font-size: var(--font-size-3xl);
  font-weight: 900;
}

.action-subtitle {
  font-size: var(--font-size-md);
  color: var(--overlay-white);
  letter-spacing: 0.02em;
}

.action-icon-wrap {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-wrap svg {
  font-size: 28px;
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.continue-section {
  margin-bottom: var(--spacing-lg);
}

.continue-card {
  background: var(--border-color-light);
  padding: 4px;
  border-radius: var(--radius-lg);
}

.continue-inner {
  background: var(--background);
  padding: var(--spacing-md);
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
  padding: var(--spacing-md);
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-gray-400);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  margin: 0 auto 16px;
}

.placeholder-icon svg {
  font-size: var(--font-size-3xl);
}

.placeholder-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.placeholder-subtitle {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.4;
}

.continue-btn {
  width: 100%;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-gray-200);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--icon-color);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.continue-btn:hover {
  background: var(--color-gray-400);
  color: var(--primary-dark);
}

.continue-inner:not(.placeholder) {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
}

.continue-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: rgba(0, 91, 191, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.continue-icon svg {
  font-size: 28px;
}

.continue-info {
  flex: 1;
  min-width: 0;
}

.continue-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.continue-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.progress-bar {
  height: 5px;
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: 4px;
}

.progress {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-full);
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.continue-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.continue-action-btn svg {
  font-size: 24px;
}
</style>