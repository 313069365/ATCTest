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
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import HomeNav from '@/presentation/components/layout/HomeNav.vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
const route = useRoute()

const store = useAppStore()

onMounted(() => {
  store.init()
})

</script>

<style scoped>
.app-container {
  min-height: 100vh;
  position: relative;
  background: var(--background-secondary);
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
  background: var(--background);
}

.loading-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary);
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
  color: var(--on-surface-variant);
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: var(--border-color-light);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>