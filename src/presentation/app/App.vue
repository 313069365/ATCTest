<template>
  <div class="app-container">
    <div v-if="store.loading" class="app-loading">
      <div class="loading-content">
        <div class="spinner"></div>
        <p class="loading-text">{{ store.loadingText }}</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: store.loadingProgress + '%' }"></div>
        </div>
      </div>
    </div>
    <RouterView v-else />
    <HomeNav v-if="!store.loading && ['/', '/Home', '/exam', '/practice', '/profile'].includes(route.path)" />
    <Toast :visible="toast.state.visible" :message="toast.state.message" :type="toast.state.type" />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import HomeNav from '@/presentation/components/shared/HomeNav.vue'
import Toast from '@/presentation/components/ui/Toast.vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import { useToast } from '@/presentation/composables/useToast'
const route = useRoute()

const store = useAppStore()
const toast = useToast()

onMounted(() => {
  // 只在已登录时初始化数据
  if (route.path !== '/login') {
    store.init()
  }
})

// 登录成功后从 /login 跳转过来时触发
watch(() => route.path, (newPath) => {
  if (newPath !== '/login' && store.loading === false && store.questionBanks.length === 0) {
    store.init()
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  position: relative;
  background: var(--color-muted);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.app-loading {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
}

.loading-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: var(--color-border-light);
  border-radius: var(--radius-xs);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-xs);
  transition: width 0.3s ease;
}
</style>