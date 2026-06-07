<template>
  <div class="page">
    <div class="hero-section">
      <div class="hero-blur-1"></div>
      <div class="hero-blur-2"></div>
      <TopBar :title="title" showBack @back="$emit('back')" :style="topbarStyle">
        <template #right>
          <button class="clear-btn" @click="$emit('clear')" :disabled="!hasItems">
            <Icon name="delete-sweep-outline" />
          </button>
        </template>
      </TopBar>
    </div>

    <main class="content">
      <button class="practice-all-btn" @click="$emit('practice-all')" v-if="hasItems">
        <div class="practice-all-left">
          <Icon :name="practiceIcon" class="practice-all-icon" />
          <div class="practice-all-text">
            <span class="practice-all-title">{{ practiceTitle }}</span>
            <span class="practice-all-desc">{{ practiceDesc }}</span>
          </div>
        </div>
        <Icon name="chevron-right" class="practice-all-arrow" />
      </button>

      <div class="item-list">
        <div v-for="item in items" :key="item.id" class="item-wrapper">
          <slot name="card" :item="item" />
        </div>
      </div>

      <div v-if="loading" class="loading-more">
        <div class="loading-spinner"></div>
        <span>{{ loadingText }}</span>
      </div>
      <div v-if="loaded && !hasMore && hasItems" class="loading-complete">
        <Icon name="check-circle-outline" />
        <span>{{ loadedText }}</span>
      </div>

      <div class="empty-state" v-if="!hasItems && !loading">
        <div class="empty-icon-wrapper">
          <Icon :name="emptyIcon" />
        </div>
        <h3>{{ emptyTitle }}</h3>
        <p>{{ emptyDesc }}</p>
        <button class="start-btn" @click="$emit('start-practice')">{{ startBtnText }}</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '@/presentation/components/ui/Icon.vue'
import TopBar from '@/presentation/components/layout/TopBar.vue'

const props = defineProps({
  title: { type: String, default: '' },
  hasItems: { type: Boolean, default: false },
  practiceIcon: { type: String, default: 'rate-review-outline' },
  practiceTitle: { type: String, default: '' },
  practiceDesc: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  loaded: { type: Boolean, default: false },
  hasMore: { type: Boolean, default: false },
  loadingText: { type: String, default: '加载中...' },
  loadedText: { type: String, default: '已加载全部' },
  emptyIcon: { type: String, default: 'check-circle-outline' },
  emptyTitle: { type: String, default: '' },
  emptyDesc: { type: String, default: '' },
  startBtnText: { type: String, default: '开始练习' },
  headerBg: { type: String, default: '' },
  headerColor: { type: String, default: '' }
})

defineEmits(['back', 'clear', 'practice-all', 'start-practice'])

const topbarStyle = computed(() => {
  const style = {}
  if (props.headerBg) style['--topbar-bg'] = props.headerBg
  if (props.headerColor) style['--topbar-color'] = props.headerColor
  return style
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background-secondary);
}

.hero-section {
  position: relative;
  background: linear-gradient(165deg, var(--hero-color, var(--primary-light)) 0%, var(--background-secondary) 100%);
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
  background: radial-gradient(circle, var(--hero-color, var(--primary-light)) 0%, transparent 70%);
  filter: blur(30px);
  pointer-events: none;
  opacity: 0.6;
}

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
  font-size: var(--font-size-xl);
}

.clear-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.7);
}

.content {
  padding: var(--spacing-md) var(--spacing-lg);
  position: relative;
  z-index: 1;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  contain: layout;
}

.item-wrapper {
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

.empty-icon-wrapper svg {
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
</style>
