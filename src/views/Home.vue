<template>
  <div class="home">
    <header class="top-bar">
      <div class="top-bar-left">
        <h1 class="title">学习平台</h1>
      </div>
      <div class="header-actions">
        <button class="icon-btn">
          <span class="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>

    <main class="content">
      <section class="stats-bento">
        <div class="stat-card">
          <span class="stat-label">今日练习</span>
          <div class="stat-value-wrap">
            <span class="stat-value">{{ answeredToday }}</span>
            <span class="stat-unit">题</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-label">正确率</span>
          <div class="stat-value-wrap">
            <span class="stat-value">{{ accuracy }}</span>
            <span class="stat-unit primary">%</span>
          </div>
        </div>
      </section>

      <section class="main-actions">
        <button class="action-btn practice" @click="pageTo('/practice')">
          <div class="action-text">
            <span class="action-title">练习模式</span>
            <span class="action-subtitle">回顾章节重点与小测验</span>
          </div>
          <div class="action-icon-wrap">
            <span class="material-symbols-outlined">menu_book</span>
          </div>
        </button>
        <button class="action-btn exam" @click="pageTo('/exam')">
          <div class="action-text">
            <span class="action-title">模拟考试</span>
            <span class="action-subtitle">模拟执照题库限时考试</span>
          </div>
          <div class="action-icon-wrap">
            <span class="material-symbols-outlined">timer</span>
          </div>
        </button>
      </section>

      <section class="continue-section">
        <h2 class="section-title">上次练习</h2>
        <div class="continue-card">
          <template v-if="lastPractice">
            <div class="continue-inner" @click="continueLastPractice">
              <div class="continue-icon">
                <span class="material-symbols-outlined">menu_book</span>
              </div>
              <div class="continue-info">
                <h3 class="continue-title">{{ lastPractice.subject?.name || '练习' }}</h3>
                <p class="continue-subtitle">{{ lastPractice.category }} • {{ lastPractice.scope }}</p>
                <div class="progress-bar">
                  <div class="progress" :style="{ width: lastPracticeProgress + '%' }"></div>
                </div>
                <span class="progress-text">已练习 {{ lastPractice.currentIndex + 1 }} / {{ totalQuestions }} 题</span>
              </div>
              <button class="continue-action-btn">
                <span class="material-symbols-outlined">play_arrow</span>
              </button>
            </div>
          </template>
          <template v-else>
            <div class="continue-inner placeholder">
              <div class="placeholder-content">
                <div class="placeholder-icon">
                  <span class="material-symbols-outlined">book</span>
                </div>
                <h3 class="placeholder-title">还没有练习记录</h3>
                <p class="placeholder-subtitle">开始你的第一次练习吧</p>
                <button class="continue-btn" @click="pageTo('/practice')">开始练习</button>
              </div>
            </div>
          </template>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/store'

const router = useRouter()
const store = useAppStore()

const answeredToday = ref(0)
const accuracy = ref(0.00)

// 上次练习
const lastPractice = computed(() => {
  return store.practiceProgress
})

// 计算总题数（需要从题库获取）
const totalQuestions = computed(() => {
  if (!lastPractice.value) return 0
  const { category, scope, subject } = lastPractice.value
  const subjectName = typeof subject === 'object' ? subject.name : subject
  return store.rawQuestions.filter(q =>
    q.meta.category === category &&
    q.meta.scope === scope &&
    q.meta.subject === subjectName
  ).length
})

// 练习进度百分比
const lastPracticeProgress = computed(() => {
  if (!lastPractice.value || !totalQuestions.value) return 0
  return Math.round(((lastPractice.value.currentIndex + 1) / totalQuestions.value) * 100)
})

// 继续上次练习
const continueLastPractice = () => {
  if (!lastPractice.value) return
  const practiceData = {
    subject: lastPractice.value.subject,
    category: lastPractice.value.category,
    scope: lastPractice.value.scope,
    practiceMode: lastPractice.value.practiceMode,
    questionSort: lastPractice.value.questionSort,
    optionsSort: lastPractice.value.optionsSort,
    showAnswerMode: lastPractice.value.showAnswerMode,
    autoJump: lastPractice.value.autoJump
  }
  router.push({
    path: '/practice/quiz',
    query: { practiceData: JSON.stringify(practiceData), continue: 'true' }
  })
}

// 页面跳转
const pageTo = (path) => {
  router.push(path)
}

// 加载数据
onMounted(async () => {
  if (store.rawQuestions.length === 0) {
    await store.loadQuestions()
  }
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
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  height: 56px;
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
  position: relative;
}

.top-bar-left {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-actions {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: background 0.2s;
}

.icon-btn:active {
  background: var(--color-gray-400);
}

.content {
  padding: var(--spacing-lg);
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

.action-icon-wrap .material-symbols-outlined {
  font-size: 28px;
  font-variation-settings: 'FILL' 1;
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

.placeholder-icon .material-symbols-outlined {
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

.continue-icon .material-symbols-outlined {
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
  margin-bottom: 2px;
}

.continue-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.progress-bar {
  height: 4px;
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 4px;
}

.progress {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-full);
}

.progress-text {
  font-size: var(--font-size-xs);
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

.continue-action-btn .material-symbols-outlined {
  color: #fff;
  font-size: 24px;
}
</style>