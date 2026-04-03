<template>
  <div class="page">
    <header class="top-bar">
      <div class="top-bar-left" @click="exitQuiz">
        <button class="back-btn">
          <span class="material-symbols-outlined">close</span>
        </button>
        <div class="header-title">
          <h1>空管英语 - 听力专项</h1>
          <span class="header-subtitle">空管题库 • 基础题库</span>
        </div>
      </div>
      <div class="top-bar-right">
        <div class="timer-display">
          <span class="material-symbols-outlined">timer</span>
          <span>15:30</span>
        </div>
        <button class="grid-btn" @click="toggleAnswerCard">
          <span class="material-symbols-outlined">grid_view</span>
        </button>
      </div>
    </header>

    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress" style="width: 85%"></div>
      </div>
      <span class="progress-text">17/20</span>
    </div>

    <main class="content">
      <div class="question-meta">
        <span class="question-type-tag">单选题</span>
        <span class="question-id">题目编号：Q001</span>
        <button class="fav-btn">
          <span class="material-symbols-outlined">kid_star</span>
        </button>
      </div>

      <div class="question-section">
        <h2 class="question-text">
          在无线电话中，机场管制服务管制员的呼号是__________。
        </h2>
      </div>

      <div class="options-list">
        <div class="option-item">
          <span class="option-radio"></span>
          <span class="option-text">A. 塔台</span>
        </div>
        <div class="option-item">
          <span class="option-radio"></span>
          <span class="option-text">B. 地面</span>
        </div>
        <div class="option-item selected">
          <span class="option-radio selected"></span>
          <span class="option-text">C. 进近</span>
        </div>
        <div class="option-item">
          <span class="option-radio"></span>
          <span class="option-text">D. 管制</span>
        </div>
      </div>

      <div class="explanation-section" v-if="showExplanation">
        <div class="explanation-header">
          <span class="material-symbols-outlined">lightbulb</span>
          <span>解析</span>
        </div>
        <div class="explanation-content">
          在无线电话通讯中，机场管制服务管制员的呼号是"Tower"。
        </div>
      </div>
    </main>

    <AnswerCard v-if="showExplanation" @close="closeAnswerCard" @exit="exitQuiz" />

    <QustionNavbar />
    <!-- <footer class="question-footer">
      <button class="footer-btn prev">
        <span class="material-symbols-outlined">arrow_back</span>
        上一题
      </button>
      <button class="footer-btn check" @click="showExplanation = !showExplanation">
        <span class="material-symbols-outlined">check_circle</span>
        确认答案
      </button>
      <button class="footer-btn next">
        下一题
        <span class="material-symbols-outlined">arrow_forward</span>
      </button>
    </footer> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AnswerCard from '@/components/page/AnswerCard.vue'
import QustionNavbar from '@/components/layout/QuestionNavbar.vue'

const router = useRouter()
const route = useRoute()

const showExplanation = ref(false)
const practiceData = ref(null)

const toggleAnswerCard = () => {
  showExplanation.value = !showExplanation.value
}

const closeAnswerCard = () => {
  showExplanation.value = false
}

const exitQuiz = () => {
  if (confirm('确定要退出答题吗？')) {
    router.back()
  }
}



onMounted(() => {
  // 从路由参数中获取练习数据
  const practiceDataStr = route.query.practiceData
  if (practiceDataStr) {
    try {
      practiceData.value = JSON.parse(practiceDataStr)
      console.log('练习数据:', practiceData.value)
    } catch (error) {
      console.error('解析练习数据失败:', error)
      // 使用默认mock数据
      practiceData.value = {
        subject: '航空气象',
        questionCount: 30,
        mode: '答题模式',
        order: '顺序',
        showAnswerMode: '立即显示',
        autoNext: false
      }
    }
  } else {
    // 使用默认mock数据
    practiceData.value = {
      subject: '航空气象',
      questionCount: 30,
      mode: '答题模式',
      order: '顺序',
      showAnswerMode: '立即显示',
      autoNext: false
    }
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background);
  max-width: var(--app-max-width);
  margin: 0 auto;
  padding-bottom: 80px;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.back-btn {
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
}

.header-title h1 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.header-subtitle {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.timer-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-mn);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}

.grid-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress {
  height: 100%;
  background: var(--success);
  border-radius: var(--radius-full);
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  min-width: 50px;
  text-align: right;
}

.content {
  padding: var(--spacing-md);
}

.question-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.question-type-tag {
  padding: var(--spacing-mn) var(--spacing-sm);
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.question-id {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  flex: 1;
}

.fav-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--warning);
}

.question-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--on-surface);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--background-surface);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.option-item.selected {
  border-color: var(--success);
  background: var(--success-light);
}

.option-item.correct {
  border-color: var(--success);
  background: var(--success-light);
}

.option-item.wrong {
  border-color: var(--error);
  background: var(--error-light);
}

.option-radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color-strong);
  border-radius: 50%;
  flex-shrink: 0;
}

.option-radio.selected {
  border-color: var(--success);
  background: var(--success);
  box-shadow: inset 0 0 0 3px var(--background);
}

.option-text {
  font-size: var(--font-size-md);
  color: var(--on-surface);
}

.explanation-section {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}

.explanation-content {
  font-size: var(--font-size-md);
  color: var(--on-surface);
  line-height: 1.6;
}

.question-footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--app-max-width);
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background);
  border-top: 1px solid var(--border-color-light);
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.footer-btn.prev {
  background: var(--background-surface);
  color: var(--on-surface);
}

.footer-btn.check {
  background: var(--success);
  color: var(--on-primary);
}

.footer-btn.next {
  background: var(--primary);
  color: var(--on-primary);
}
</style>