<template>
  <div class="page">
    <div class="hero-section">
      <div class="hero-blur-1"></div>
      <div class="hero-blur-2"></div>
      <header class="top-bar">
        <button class="back-btn" @click="goBack">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>{{ t('wrongBook') }}</h1>
        <button class="clear-btn" @click="clearAll" :disabled="wrongList.length <= 0">
          <span class="material-symbols-outlined">delete_sweep</span>
        </button>
      </header>
    </div>

    <main class="content">
      <!-- 统计信息 -->
      <div class="stats-section" v-if="wrongList.length > 0">
        <div class="stat-card glass">
          <span class="material-symbols-outlined stat-icon">close</span>
          <div class="stat-info">
            <span class="stat-value">{{ wrongList.length }}</span>
            <span class="stat-label">{{ t('wrongQuestions') }}</span>
          </div>
        </div>
        <div class="stat-card glass">
          <span class="material-symbols-outlined stat-icon">repeat</span>
          <div class="stat-info">
            <span class="stat-value">{{ repeatedErrors }}</span>
            <span class="stat-label">{{ t('repeatedErrors') }}</span>
          </div>
        </div>
      </div>

      <!-- 错题巩固 -->
      <button class="practice-all-btn" @click="startWrongPractice" v-if="wrongList.length > 0">
        <div class="practice-all-left">
          <span class="material-symbols-outlined practice-all-icon">rate_review</span>
          <div class="practice-all-text">
            <span class="practice-all-title">{{ t('practiceWrong') }}</span>
            <span class="practice-all-desc">{{ t('wrongReviewDesc', { count: wrongList.length }) }}</span>
          </div>
        </div>
        <span class="material-symbols-outlined practice-all-arrow">chevron_right</span>
      </button>

      <!-- 错题列表 -->
      <div class="wrong-list" v-if="wrongList.length > 0">
        <div class="wrong-card-wrapper" v-for="(item, index) in paginatedList" :key="item.id">
          <div class="wrong-card glass">
            <div class="wrong-header">
              <div class="wrong-meta-top">
                <span class="wrong-subject">{{ t(item.meta?.subject) || item.meta?.subject || t('unknown') }}</span>
                <span class="wrong-badge">{{ t(item.meta?.category) || item.meta?.category || '' }}</span>
              </div>
              <button class="delete-individual-btn" @click.stop="removeWrong(item.id)">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div>
              <p class="wrong-question">{{ item.stem }}</p>
            </div>

            <div class="wrong-answer-section">
              <span class="answer-label">{{ t('correctAnswer') }}：</span>
              <span class="answer-correct">{{ formatAnswer(item.answer) }}</span>
            </div>

            <div class="wrong-answer-section">
              <!-- <span class="answer-correct">{{ item.explanation }}</span> -->
            </div>

            <div class="wrong-footer">
              <span class="wrong-count" v-if="getWrongCount(item.id) > 1">
                {{ t('wrongCount') }} {{ getWrongCount(item.id) }} {{ t('times') }}
              </span>
            </div>
          </div>
        </div>

        <div class="loading-more" v-if="hasMore">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        <div class="loading-complete" v-else-if="!hasMore && wrongList.length > 0">
          <span>没有更多了</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <div class="empty-icon-wrapper">
          <span class="material-symbols-outlined">check_circle</span>
        </div>
        <h3>暂无错题</h3>
        <p>答错的题目会自动添加到错题本</p>
        <button class="start-btn" @click="goPractice">开始练习</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/store'
import { t } from '@/utils/i18n.js'

const router = useRouter()
const store = useAppStore()

const wrongList = computed(() => store.wrongBook)
const pageSize = 20
const currentPage = ref(1)
const containerRef = ref(null)

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = currentPage.value * pageSize
  return wrongList.value.slice(start, end)
})

const hasMore = computed(() => {
  return currentPage.value * pageSize < wrongList.value.length
})

const repeatedErrors = computed(() => {
  return wrongList.value.filter(item => (item.wrongCount || 1) > 1).length
})

onMounted(() => {
  store.loadWrongBook()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  if (!hasMore.value) return
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    currentPage.value++
  }
}

function goBack() {
  router.back()
}

function startWrongPractice() {
  router.push({
    path: '/practice/quiz',
    query: {
      practiceData: JSON.stringify({
        source: 'wrongbook',
        subject: { name: 'practiceWrong' },
        category: 'wrongBook',
        scope: 'wrongBook',
        practiceMode: 'answer',
        questionSort: 'shuffle',
        showAnswerMode: 'immediate',
        autoJump: false
      })
    }
  })
}

function goPractice() {
  router.push('/practice')
}

function removeWrong(id) {
  if (confirm(t('confirmRemoveWrong'))) {
    store.removeWrongQuestion(id)
  }
}

function clearAll() {
  if (confirm(t('confirmClearAll'))) {
    store.wrongBook.forEach(q => store.removeWrongQuestion(q.id))
  }
}

function formatAnswer(answer) {
  if (!answer) return ''
  if (Array.isArray(answer)) {
    return answer.join(', ')
  }
  return answer
}

function getWrongCount(questionId) {
  const item = store.wrongBook.find(q => q.id === questionId)
  return item?.wrongCount || 1
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background-secondary);
}

.glass {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 0 0 0.5px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.glass::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.25) 0%,
      rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.hero-section {
  position: relative;
  background: linear-gradient(165deg, var(--primary-light) 0%, var(--background-secondary) 100%);
  overflow: hidden;
}

.hero-blur-1 {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
}

.hero-blur-2 {
  position: absolute;
  bottom: -40px;
  left: -40px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, var(--primary-light) 0%, transparent 70%);
  filter: blur(30px);
  pointer-events: none;
  opacity: 0.6;
}

.top-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  height: 56px;
}

.back-btn,
.clear-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--on-surface);
  transition: all 0.2s;
  border: 0.5px solid rgba(255, 255, 255, 0.6);
}

.back-btn:active,
.clear-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.7);
}

.top-bar h1 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
  margin: 0;
}

.content {
  padding: var(--spacing-md) var(--spacing-lg);
  position: relative;
  z-index: 1;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  gap: var(--spacing-xs);
  transition: all 0.2s;
  min-height: 100px;
  justify-content: center;
}

.stat-card:hover {
  box-shadow: 0 8px 24px rgba(0, 91, 191, 0.15);
}

.stat-icon {
  font-size: 24px;
  color: var(--primary);
  margin-bottom: 2px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
  line-height: 1;
  letter-spacing: -0.5px;
}

.stat-label {
  font-size: 10px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}



.wrong-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  contain: layout;
}

.loading-more,
.loading-complete {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.wrong-card-wrapper {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wrong-card {
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  transition: all 0.2s;
}

.wrong-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.wrong-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.wrong-meta-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.wrong-badge {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: rgba(0, 91, 191, 0.1);
  padding: 4px 10px;
  border-radius: var(--radius-md);
}

.wrong-subject {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--primary);
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 10px;
  border-radius: var(--radius-md);
}

.delete-individual-btn {
  width: 25px;
  height: 25px;
  border: none;
  background: rgba(211, 47, 47, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--error);
  transition: all 0.2s;
}

.delete-individual-btn:hover {
  background: rgba(211, 47, 47, 0.2);
}

.delete-individual-btn:active {
  transform: scale(0.9);
}

.delete-individual-btn .material-symbols-outlined {
  font-size: 18px;
}

.wrong-question {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--on-surface);
  line-height: 1.5;
  margin: 0 0 var(--spacing-sm) 0;
}

.wrong-answer-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.answer-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.answer-correct {
  font-size: var(--font-size-sm);
  color: var(--success);
  font-weight: var(--font-weight-semibold);
}

.wrong-footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.wrong-count {
  font-size: var(--font-size-xs);
  color: var(--warning);
  background: var(--warning-container);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl) var(--spacing-lg);
  text-align: center;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--success-container);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.empty-icon-wrapper .material-symbols-outlined {
  font-size: 40px;
  color: var(--success);
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
  margin: 0 0 var(--spacing-xs) 0;
}

.empty-state p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xl) 0;
}

.start-btn {
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius-xl);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.25);
  transition: all 0.2s;
}

.start-btn:active {
  transform: scale(0.96);
  box-shadow: 0 2px 8px rgba(0, 91, 191, 0.2);
}

.practice-all-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  background: var(--primary);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform 0.15s;
  color: var(--on-primary);
}

.practice-all-btn:active {
  transform: scale(0.98);
}

.practice-all-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.practice-all-icon {
  font-size: 28px;
  color: var(--on-primary);
}

.practice-all-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.practice-all-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.practice-all-desc {
  font-size: var(--font-size-sm);
  opacity: 0.85;
}

.practice-all-arrow {
  font-size: 24px;
  color: var(--on-primary);
}
</style>
