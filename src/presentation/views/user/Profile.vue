<template>
  <div class="profile">
    <header class="top-bar">
      <h1 class="title">个人中心</h1>
      <button class="icon-btn">
        <span class="material-symbols-outlined">more_vert</span>
      </button>
    </header>

    <main class="content">
      <section class="user-section">
        <div class="avatar-container">
          <div class="avatar">
            <img
              src="https://ts1.tc.mm.bing.net/th/id/R-C.14eaad76ba079248cac4fdb19dd11951?rik=n2D2PnNwJoLVTA&riu=http%3a%2f%2fn.sinaimg.cn%2fsinacn19%2f442%2fw1846h996%2f20180714%2fd240-hfhfwmv5289140.jpg&ehk=J%2b1i5USaNLpkeaA2ZdSiGujnqZhEogEAWNGdta2paZE%3d&risl=&pid=ImgRaw&r=0"
              alt="头像" />
          </div>
        </div>
        <div class="user-info">
          <h2>{{ user.username }}</h2>
          <p>{{ user.title }}</p>
        </div>
      </section>

      <!-- <section class="performance-section">
        <h3 class="section-title">表现分析</h3>
        <div class="performance-grid">
          <div class="perf-card accuracy-card">
            <div class="card-header">
              <span class="card-label">正确率</span>
              <span class="card-value primary">84.2%</span>
            </div>
            <div class="chart-bars">
              <div class="bar" style="height: 50%"></div>
              <div class="bar" style="height: 75%"></div>
              <div class="bar" style="height: 66%"></div>
              <div class="bar active" style="height: 100%"></div>
              <div class="bar" style="height: 80%"></div>
            </div>
            <p class="card-footer">最近30天提升了 4.5%</p>
          </div>

          <div class="perf-card radar-card">
            <span class="card-label">知识掌握度</span>
            <div class="radar-container">
              <div class="radar radar-1"></div>
              <div class="radar radar-2"></div>
              <div class="radar radar-3"></div>
            </div>
            <p class="radar-text">
              高: 临床理论<br />低: 伦理框架
            </p>
          </div>

          <div class="perf-card streak-card">
            <span class="card-label">总答题</span>
            <span class="card-value tertiary">14 天连续</span>
            <div class="streak-icons">
              <div class="streak-icon fire">
                <span class="material-symbols-outlined">local_fire_department</span>
              </div>
              <div class="streak-icon verified">
                <span class="material-symbols-outlined">verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="history-section">
        <div class="section-header">
          <h3 class="section-title">练习记录</h3>
          <button class="more-btn">查看全部</button>
        </div>
        <div class="empty-history">
          <p>暂无练习记录</p>
        </div>
      </section> -->

      <section class="shortcut-section">
        <h3 class="section-title">快速操作</h3>
        <div class="shortcut-grid">
          <div class="shortcut-grid-item" @click="goToWrongBook">
            <div class="shortcut-icon error-bg">
              <span class="material-symbols-outlined">error_outline</span>
            </div>
            <span class="shortcut-grid-label">错题本</span>
          </div>
          <div class="shortcut-grid-item" @click="goToFavorites">
            <div class="shortcut-icon tertiary-bg">
              <span class="material-symbols-outlined">bookmark</span>
            </div>
            <span class="shortcut-grid-label">收藏本</span>
          </div>
          <div class="shortcut-grid-item" @click="goToPracticeHistory">
            <div class="shortcut-icon primary-bg">
              <span class="material-symbols-outlined">assignment_turned_in</span>
            </div>
            <span class="shortcut-grid-label">练习历史</span>
          </div>
          <div class="shortcut-grid-item" @click="goToExamHistory">
            <div class="shortcut-icon primary-bg">
              <span class="material-symbols-outlined">quiz</span>
            </div>
            <span class="shortcut-grid-label">考试历史</span>
          </div>
        </div>
        <div class="shortcut-list">
          <div class="shortcut-item" @click="goToStats">
            <div class="shortcut-icon primary-bg">
              <span class="material-symbols-outlined">bar_chart</span>
            </div>
            <span class="shortcut-label">统计分析</span>
            <span class="material-symbols-outlined shortcut-arrow">chevron_right</span>
          </div>
          <div class="shortcut-item" @click="goToAviation">
            <div class="shortcut-icon primary-bg">
              <span class="material-symbols-outlined">record_voice_over</span>
            </div>
            <span class="shortcut-label">字母发音</span>
            <span class="material-symbols-outlined shortcut-arrow">chevron_right</span>
          </div>
          <div class="shortcut-item" @click="goToDataManagement">
            <div class="shortcut-icon primary-bg">
              <span class="material-symbols-outlined">storage</span>
            </div>
            <span class="shortcut-label">数据管理</span>
            <span class="material-symbols-outlined shortcut-arrow">chevron_right</span>
          </div>
          <div class="shortcut-item" @click="goToSettings">
            <div class="shortcut-icon primary-bg">
              <span class="material-symbols-outlined">settings</span>
            </div>
            <span class="shortcut-label">系统设置</span>
            <span class="material-symbols-outlined shortcut-arrow">chevron_right</span>
          </div>
        </div>
      </section>

      <section class="action-section">
        <button class="action-btn logout">
          <span class="material-symbols-outlined">logout</span>
          <span>xiaomi 14</span>
        </button>
      </section>

      <div class="version-footer">Version {{ APP_VERSION }}</div>
    </main>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import { APP_VERSION } from '@/infrastructure/utils/version'

const router = useRouter()
const store = useAppStore()

const user = reactive({
  username: "wyd",
  title: "开发者",
})

function goToWrongBook() {
  router.push({ name: 'WrongBook' })
}

function goToFavorites() {
  router.push({ name: 'Favorites' })
}

function goToPracticeHistory() {
  router.push({ name: 'PracticeHistory' })
}

function goToExamHistory() {
  router.push({ name: 'ExamHistory' })
}

function goToStats() {
  router.push({ name: 'Stats' })
}

function goToDataManagement() {
  router.push({ name: 'DataManagement' })
}

function goToAviation() {
  router.push({ name: 'AviationPhonetics' })
}

function goToSettings() {
  router.push({ name: 'Settings' })
}
</script>

<style scoped>
.profile {
  min-height: 100vh;
  background: var(--background);
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
  padding: 12px 16px;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
  position: relative;
}

.icon-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--primary);
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.content {
  padding: var(--spacing-lg);
  padding-bottom: 100px;
}

.user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 128px;
  height: 128px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-full);
}

.user-info {
  text-align: center;
}

.user-info h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
}

.user-info p {
  color: var(--on-surface-variant);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-xs);
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-sm);
}

.performance-section {
  margin-top: var(--spacing-sm);
}

.performance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.perf-card {
  background: var(--background-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  border: 1px solid var(--border-color-light);
}

.accuracy-card {
  grid-column: span 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--spacing-md);
}

.card-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface-variant);
}

.card-value {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
}

.card-value.primary {
  color: var(--primary);
}

.card-value.tertiary {
  color: var(--secondary);
}

.chart-bars {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-end;
  height: 64px;
}

.bar {
  flex: 1;
  background: var(--border-color-strong);
  border-radius: 4px 4px 0 0;
}

.bar.active {
  background: var(--primary);
}

.card-footer {
  font-size: 11px;
  color: var(--on-surface-variant);
  font-style: italic;
  margin-top: var(--spacing-sm);
}

.radar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.radar-container {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--spacing-md) 0;
}

.radar {
  position: absolute;
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.radar-1 {
  inset: 0;
  background: var(--border-color-strong);
  opacity: 0.5;
}

.radar-2 {
  inset: 8px;
  background: var(--primary);
  opacity: 0.4;
}

.radar-3 {
  inset: 16px;
  background: var(--primary);
  opacity: 0.6;
  transform: scale(0.75);
}

.radar-text {
  font-size: 10px;
  color: var(--on-surface-variant);
  text-align: center;
  line-height: 1.5;
}

.streak-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.streak-icons {
  display: flex;
  gap: calc(var(--spacing-sm) * -1);
  margin-top: var(--spacing-sm);
}

.streak-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--background);
}

.streak-icon.fire {
  background: var(--secondary);
}

.streak-icon .material-symbols-outlined {
  font-size: 12px;
  color: var(--on-primary);
}

.streak-icon.verified {
  background: var(--primary);
}

.history-section {
  margin-top: var(--spacing-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.more-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.history-scroll {
  display: flex;
  gap: var(--spacing-md);
  overflow-x: auto;
  padding-bottom: var(--spacing-md);
  margin: 0 calc(var(--spacing-md) * -1);
  padding: 0 var(--spacing-md);
}

.history-scroll::-webkit-scrollbar {
  display: none;
}

.empty-history {
  text-align: center;
  padding: 48px 16px;
  color: var(--on-surface-variant);
  font-size: var(--font-size-sm);
}

.shortcut-section {
  margin-top: var(--spacing-md);
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.shortcut-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-sm);
  background: var(--background-surface);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform 0.1s;
}

.shortcut-grid-item:active {
  transform: scale(0.95);
}

.shortcut-grid-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  text-align: center;
  white-space: nowrap;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background-surface);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform 0.1s;
}

.shortcut-item:active {
  transform: scale(0.98);
}

.shortcut-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcut-icon.error-bg {
  background: var(--error-light);
}

.shortcut-icon.error-bg .material-symbols-outlined {
  color: var(--error);
}

.shortcut-icon.tertiary-bg {
  background: var(--secondary-light);
}

.shortcut-icon.tertiary-bg .material-symbols-outlined {
  color: var(--secondary);
}

.shortcut-icon.primary-bg {
  background: var(--primary-light);
}

.shortcut-icon.primary-bg .material-symbols-outlined {
  color: var(--primary);
}

.shortcut-label {
  flex: 1;
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
}

.shortcut-arrow {
  color: var(--icon-color-secondary);
}

.action-section {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.action-btn {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--background-surface);
  border: none;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:active {
  background: var(--border-color-light);
}

.action-btn.logout {
  background: var(--error-light);
  color: var(--error);
}

.action-btn.logout:active {
  background: var(--error-light);
}

.version-footer {
  text-align: center;
  padding: 24px 16px 32px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
</style>