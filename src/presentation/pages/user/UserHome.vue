<template>
  <div class="profile">
    <TopBar title="个人中心">
      <template #right>
        <button v-if="isGuest" class="icon-btn" @click="goToLogin">
          <Icon name="login" />
        </button>
        <button v-else class="icon-btn" @click="handleLogout">
          <Icon name="logout" />
        </button>
      </template>
    </TopBar>

    <main class="content">
      <section class="user-section">
        <div class="avatar-container">
          <div class="avatar">
            <img src="/logo.jpeg" alt="头像" />
          </div>
          <div v-if="isGuest" class="avatar-badge guest-badge">
            <Icon name="person-outline" />
          </div>
        </div>

        <div class="user-info">
          <h2 v-if="!isGuest">{{ displayName }}</h2>
          <p v-if="!isGuest" class="user-role">{{ currentAccount?.role || '用户' }}</p>
          <p v-else class="user-role guest-role">游客模式</p>
        </div>

        <div v-if="isGuest" class="guest-action-area">
          <button @click="goToLogin" class="login-now-btn">
            <Icon name="login" />
            <span>去登录</span>
          </button>
          <p class="guest-hint">
            <Icon name="info-outline" />
            <span>登录后数据将保存在云端，多设备同步</span>
          </p>
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

      <div class="version-footer">Version {{ APP_VERSION }}</div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import { APP_VERSION } from '@/infrastructure/utils/version'
import TopBar from '@/presentation/components/shared/TopBar.vue'
import Icon from '@/presentation/components/ui/Icon.vue'
import * as userRepository from '@/infrastructure/api/userRepository'

const router = useRouter()
const store = useAppStore()

const currentAccount = ref(null)
const isGuest = ref(true)
const displayName = ref('游客')

onMounted(async () => {
  try {
    const currentId = userRepository.getCurrentUserId()
    if (currentId && !currentId.startsWith('guest_')) {
      isGuest.value = false
      const account = await userRepository.getAccountById(currentId)
      currentAccount.value = account || { id: currentId, username: currentId }
      displayName.value = account?.nickname || account?.username || currentId
    } else {
      isGuest.value = true
      currentAccount.value = null
      displayName.value = '游客'
    }
  } catch (e) {
    console.error('加载账户信息失败:', e)
    isGuest.value = true
    currentAccount.value = null
    displayName.value = '游客'
  }
})

function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    userRepository.setCurrentUser(null)
    localStorage.removeItem('current_user_id')
    router.push('/login')
  }
}

function goToLogin() {
  router.push('/login')
}

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
  gap: var(--space-xs);
}

.avatar-container {
  position: relative;
}

.avatar-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-card);
}

.guest-badge {
  background: var(--color-muted);
  color: var(--color-text-secondary);
}

.guest-badge svg {
  font-size: var(--font-size-md);
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

.user-role {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  margin-top: var(--space-xs);
}

.guest-role {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
}

.guest-action-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
  width: 100%;
}

.guest-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.guest-hint svg {
  font-size: var(--font-size-sm);
}

.login-now-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-now-btn:active {
  opacity: 0.8;
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
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

.version-footer {
  text-align: center;
  padding: 24px 16px 32px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
</style>
