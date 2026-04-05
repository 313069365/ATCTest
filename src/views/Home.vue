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
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/questions'
import { storeToRefs } from 'pinia'

const router = useRouter()

const answeredToday = ref(0)
const accuracy = ref(0.00)
// 1.从统计信息里面读取今日练习和正确率 stats，Today，作答题目数，正确率
// 2.从上次练习记录里面读取上次练习的科目 ，lastPractice，科目，题目位置，练习设置，上次作答记录

// 跳转，直接跳转，不传递参数
// 跳转到上次练习，传递上次练习的科目
const lastPractice = ref(null)
const pageTo = (path) => {
  router.push(path, {params: lastPractice.value })
}

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
</style>