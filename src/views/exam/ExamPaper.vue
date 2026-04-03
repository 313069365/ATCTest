<template>
  <div class="page">
    <header class="top-bar">
      <div class="top-bar-left">
        <button class="back-btn" @click="exitExam">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="header-title">
          <h1>2024年空管英语模拟考试</h1>
        </div>
      </div>
      <div class="top-bar-right">
        <button class="grid-btn" @click="toggleGrid">
          <span class="material-symbols-outlined">grid_view</span>
        </button>
      </div>
    </header>

    <div class="timer-bar">
      <div class="timer-info">
        <span class="material-symbols-outlined">timer</span>
        <span class="time">01:45:30</span>
      </div>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress" style="width: 35%"></div>
      </div>
      <span class="progress-text">35/100</span>
    </div>

    <main class="content">
      <div class="question-meta">
        <span class="question-type-tag">单选题</span>
        <span class="question-id">题目编号：Q001</span>
        <button class="mark-btn">
          <span class="material-symbols-outlined">bookmark_border</span>
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
        <div class="option-item selected">
          <span class="option-radio selected"></span>
          <span class="option-text">B. 地面</span>
        </div>
        <div class="option-item">
          <span class="option-radio"></span>
          <span class="option-text">C. 进近</span>
        </div>
        <div class="option-item">
          <span class="option-radio"></span>
          <span class="option-text">D. 管制</span>
        </div>
      </div>
    </main>

    <QuestionNavbar />
    <AnswerCard v-if="showGrid" @close="closeGrid" @exit="submitPaper" />

    <!-- <footer class="question-footer">
      <button class="footer-btn prev">
        <span class="material-symbols-outlined">arrow_back</span>
        上一题
      </button>
      <button class="footer-btn next">
        下一题
        <span class="material-symbols-outlined">arrow_forward</span>
      </button>
    </footer> -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import QuestionNavbar from '@/components/layout/QuestionNavbar.vue'
import AnswerCard from '@/components/page/AnswerCard.vue'
const router = useRouter()

const showGrid = ref(false)

const toggleGrid = () => {
  showGrid.value = !showGrid.value
}

const submitPaper = (targetPath = '/exam/result') => {
  try {
    router.push(targetPath)
  } catch (error) {
    console.error('交卷失败:', error)
  }
}
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

.top-bar-right {
  display: flex;
  gap: var(--spacing-sm);
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

.timer-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary);
  color: var(--on-primary);
}

.timer-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.timer-info .time {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.submit-early-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: var(--radius-md);
  color: var(--on-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
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
  background: var(--primary);
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

.mark-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
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
  border-color: var(--primary);
  background: var(--primary-light);
}

.option-radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color-strong);
  border-radius: 50%;
  flex-shrink: 0;
}

.option-radio.selected {
  border-color: var(--primary);
  background: var(--primary);
  box-shadow: inset 0 0 0 3px var(--background);
}

.option-text {
  font-size: var(--font-size-md);
  color: var(--on-surface);
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
  padding: var(--spacing-md) var(--spacing-lg);
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

.footer-btn.next {
  background: var(--primary);
  color: var(--on-primary);
}
</style>