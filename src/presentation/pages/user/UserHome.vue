<template>
  <div class="profile">
    <TopBar title="个人中心">
      <template #right>
        <button class="icon-btn">
          <Icon name="more-vert" />
        </button>
      </template>
    </TopBar>

    <main class="content">
      <section class="user-section">
        <div class="avatar-container">
          <div class="avatar">
            <img src="/logo.jpeg" alt="头像" />
          </div>
        </div>
        <div class="user-info">
          <h2>{{ user.username }}</h2>
          <p>{{ user.title }}</p>
        </div>
      </section>

      <section class="shortcut-section">

        <div class="shortcut-grid">
          <div class="shortcut-grid-item" @click="goToWrongBook">
            <div class="shortcut-icon error-bg">
              <Icon name="error-outline" />
            </div>
            <span class="shortcut-grid-label">错题本</span>
          </div>
          <div class="shortcut-grid-item" @click="goToFavorites">
            <div class="shortcut-icon tertiary-bg">
              <Icon name="bookmark-outline" />
            </div>
            <span class="shortcut-grid-label">收藏夹</span>
          </div>
          <div class="shortcut-grid-item" @click="goToPracticeHistory">
            <div class="shortcut-icon practice-bg">
              <Icon name="assignment-turned-in-outline" />
            </div>
            <span class="shortcut-grid-label">练习记录</span>
          </div>
          <div class="shortcut-grid-item" @click="goToExamHistory">
            <div class="shortcut-icon exam-bg">
              <Icon name="quiz-outline" />
            </div>
            <span class="shortcut-grid-label">考试记录</span>
          </div>
        </div>
        <h3 class="section-title">数据管理</h3>
        <div class="shortcut-list">
          <div class="shortcut-item" @click="goToStats">
            <div class="shortcut-icon primary-bg">
              <Icon name="bar-chart" />
            </div>
            <span class="shortcut-label">统计分析</span>
            <Icon name="chevron-right" class="shortcut-arrow" />
          </div>
          <div class="shortcut-item" @click="goToDataManagement">
            <div class="shortcut-icon primary-bg">
              <Icon name="storage" />
            </div>
            <span class="shortcut-label">题库管理</span>
            <Icon name="chevron-right" class="shortcut-arrow" />
          </div>
          <div class="shortcut-item" @click="goToUserData">
            <div class="shortcut-icon primary-bg">
              <Icon name="delete-sweep-outline" />
            </div>
            <span class="shortcut-label">用户数据</span>
            <Icon name="chevron-right" class="shortcut-arrow" />
          </div>
          <div class="shortcut-item" @click="goToSettings">
            <div class="shortcut-icon primary-bg">
              <Icon name="settings" />
            </div>
            <span class="shortcut-label">系统设置</span>
            <Icon name="chevron-right" class="shortcut-arrow" />
          </div>
        </div>
      </section>

      <section class="action-section">
        <button class="action-btn logout">
          <Icon name="logout" />
          <span>退出登录</span>
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
import TopBar from '@/presentation/components/shared/TopBar.vue'
import Icon from '@/presentation/components/ui/Icon.vue'

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

function goToUserData() {
  router.push({ name: 'UserData' })
}

function goToSettings() {
  router.push({ name: 'Settings' })
}
</script>

<style scoped>
.profile {
  min-height: 100vh;
  background: var(--color-muted);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-primary);
  font-size: var(--font-size-xl);
}

.content {
  padding: var(--space-md) var(--space-lg);
  padding-bottom: 100px;
}

.user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
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
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.user-info p {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  margin-top: var(--space-xs);
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.performance-section {
  margin-top: var(--space-sm);
}

.performance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.perf-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  border: 1px solid var(--color-border-light);
}

.accuracy-card {
  grid-column: span 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-md);
}

.card-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}

.card-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}

.card-value.primary {
  color: var(--color-primary);
}

.card-value.tertiary {
  color: var(--color-secondary);
}

.chart-bars {
  display: flex;
  gap: var(--space-md);
  align-items: flex-end;
  height: 64px;
}

.bar {
  flex: 1;
  background: var(--color-border-strong);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.bar.active {
  background: var(--color-primary);
}

.card-footer {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
  margin-top: var(--space-sm);
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
  margin: var(--space-md) 0;
}

.radar {
  position: absolute;
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.radar-1 {
  inset: 0;
  background: var(--color-border-strong);
  opacity: 0.5;
}

.radar-2 {
  inset: 8px;
  background: var(--color-primary);
  opacity: 0.4;
}

.radar-3 {
  inset: 16px;
  background: var(--color-primary);
  opacity: 0.6;
  transform: scale(0.75);
}

.radar-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
  line-height: var(--line-height-normal);
}

.streak-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.streak-icons {
  display: flex;
  gap: calc(var(--space-sm) * -1);
  margin-top: var(--space-sm);
}

.streak-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-background);
}

.streak-icon.fire {
  background: var(--color-secondary);
}

.streak-icon svg {
  font-size: var(--font-size-sm);
  color: var(--color-primary-foreground);
}

.streak-icon.verified {
  background: var(--color-primary);
}

.history-section {
  margin-top: var(--space-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.more-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.history-scroll {
  display: flex;
  gap: var(--space-md);
  overflow-x: auto;
  padding-bottom: var(--space-md);
  margin: 0 calc(var(--space-md) * -1);
  padding: 0 var(--space-md);
}

.history-scroll::-webkit-scrollbar {
  display: none;
}

.empty-history {
  text-align: center;
  padding: 48px 16px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.shortcut-section {
  margin-top: var(--space-md);
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.shortcut-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-sm);
  background: var(--color-card);
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
  color: var(--color-text);
  text-align: center;
  white-space: nowrap;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-card);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform 0.1s;
}

.shortcut-item:active {
  transform: scale(0.98);
}

.shortcut-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcut-icon.error-bg {
  background: var(--color-destructive-light);
}

.shortcut-icon.error-bg svg {
  color: var(--color-destructive);
}

.shortcut-icon.tertiary-bg {
  background: var(--color-secondary-light);
}

.shortcut-icon.tertiary-bg svg {
  color: var(--color-secondary);
}



.shortcut-icon.practice-bg {
  background: var(--color-primary-light);
}

.shortcut-icon.practice-bg svg {
  color: var(--color-primary);
}

.shortcut-icon.exam-bg {
  background: var(--color-success-light);
}

.shortcut-icon.exam-bg svg {
  color: var(--color-success);
}

.shortcut-icon.primary-bg {
  /* background: var(--color-primary-light); */
}

.shortcut-icon.primary-bg svg {
  font-size: var(--font-size-2xl);
  color: var(--color-primary);
}

.shortcut-label {
  flex: 1;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.shortcut-arrow {
  color: var(--color-text-secondary);
}

.action-section {
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.action-btn {
  width: 100%;
  padding: var(--space-md);
  background: var(--color-card);
  border: none;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:active {
  background: var(--color-border-light);
}

.action-btn.logout {
  background: var(--color-destructive-light);
  color: var(--color-destructive);
}

.action-btn.logout:active {
  background: var(--color-destructive-light);
}

.version-footer {
  text-align: center;
  padding: 24px 16px 32px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
</style>