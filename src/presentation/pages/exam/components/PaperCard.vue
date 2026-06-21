<template>
  <div class="paper-card" :class="{ expanded, 'is-expired': isExpired }">
    <!-- 顶部状态条 -->
    <div class="status-bar" :class="statusClass"></div>

    <div class="paper-header" @click="expanded = !expanded" role="button" tabindex="0"
      @keydown.enter="expanded = !expanded">
      <div class="header-main">
        <h3 class="paper-title">{{ paper.title }}</h3>
        <div class="header-meta">
          <span class="status-badge" :class="statusClass">ID</span>
          <span class="paper-id">{{ paper.id }}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="quick-stats">
          <span class="quick-stat">{{ paper.questionCount }}题</span>
          <span class="quick-stat-dot"></span>
          <span class="quick-stat">{{ paper.duration }}分钟</span>
        </div>
        <Icon name="expand-more" class="expand-icon" :class="{ rotated: expanded }" />
      </div>
    </div>

    <div v-if="expanded" class="expand-section">
      <div class="expand-divider"></div>

      <div class="stats-grid">
        <div class="stat-cell">
          <span class="stat-value">{{ paper.questionCount }}</span>
          <span class="stat-label">题量</span>
        </div>
        <div class="stat-cell">
          <span class="stat-value">{{ paper.duration }}</span>
          <span class="stat-label">时长(分钟)</span>
        </div>
        <div class="stat-cell">
          <span class="stat-value">{{ paper.totalScore }}</span>
          <span class="stat-label">总分</span>
        </div>
        <div class="stat-cell">
          <span class="stat-value">{{ paper.passScore }}</span>
          <span class="stat-label">及格线</span>
        </div>
        <div class="stat-cell">
          <span class="stat-value">{{ paper.maxAttempts }}</span>
          <span class="stat-label">允许次数</span>
        </div>
      </div>

      <div class="subject-section" v-if="paper.bankInfo">
        <span class="section-label">考试科目</span>
        <div class="subject-list">
          <span v-for="info in paper.bankInfo" :key="info.subject" class="subject-chip">
            {{ t(info.subject) }}
          </span>
        </div>
      </div>

      <button class="start-btn" :class="{ disabled: isExpired }" @click.stop="handleStart" :disabled="isExpired">
        <Icon name="play-arrow" class="btn-icon" />
        {{ isExpired ? '考试已结束' : '开始考试' }}
      </button>
    </div>

    <ConfirmDialog v-bind="confirm.state" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Icon from '@/presentation/components/ui/Icon.vue'
import { t } from '@/infrastructure/utils/i18n.js'
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog.vue'
import { useConfirm } from '@/presentation/composables/useConfirm'

const props = defineProps({
  paper: { type: Object, required: true }
})

const emit = defineEmits(['export', 'delete', 'start'])

const expanded = ref(false)
const confirm = useConfirm()

const isExpired = computed(() => {
  return props.paper.expiration && props.paper.expiration < Date.now()
})

const statusClass = computed(() => {
  if (isExpired.value) return 'expired'
  return 'active'
})

const statusText = computed(() => {
  if (isExpired.value) return '已结束'
  return '进行中'
})

async function handleStart() {
  if (isExpired.value) return
  const msg = `考试名称：${props.paper.title}\n考试时长：${props.paper.duration} 分钟\n允许次数：${props.paper.maxAttempts} 次`
  const ok = await confirm.show(msg, { title: '确认开始考试' })
  if (ok) emit('start', props.paper.id)
}
</script>

<style scoped>
.paper-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
}

.paper-card:active {
  transform: scale(0.995);
}

.paper-card.expanded {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
}

.paper-card.is-expired {
  opacity: 0.75;
}

/* 顶部状态条 */
.status-bar {
  height: 3px;
  transition: background 0.2s;
}



/* 头部 */
.paper-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  cursor: pointer;
  user-select: none;
  gap: var(--space-sm);
}

.header-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.paper-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
  line-height: var(--line-height-tight);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.status-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 1px 8px;
  border-radius: var(--radius-full);
  line-height: 1.6;
}

.status-badge.active {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.status-badge.expired {
  color: var(--color-text-secondary);
  background: var(--color-muted);
}

.paper-id {
  font-size: var(--font-size-xs);
  color: var(--color-disabled);
  font-family: 'SF Mono', 'Menlo', monospace;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.quick-stats {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.quick-stat {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.quick-stat-dot {
  width: 3px;
  height: 3px;
  border-radius: var(--radius-full);
  background: var(--color-disabled);
}

.expand-icon {
  font-size: 20px;
  color: var(--color-text-secondary);
  transition: transform 0.25s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

/* 展开区域 */
.expand-section {
  padding: 0 var(--space-md) var(--space-md);
  animation: expandIn 0.25s ease-out;
}

@keyframes expandIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.expand-divider {
  height: 1px;
  background: var(--color-border-light);
  margin-bottom: var(--space-md);
}

/* 数据网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: var(--space-md);
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: var(--space-sm) var(--space-xs);
  background: var(--color-muted);
}

.stat-cell:nth-child(n+4) {
  /* 第二行 */
  padding-top: var(--space-xs);
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  line-height: var(--line-height-tight);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* 科目区域 */
.subject-section {
  margin-bottom: var(--space-md);
}

.section-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: var(--space-xs);
  font-weight: var(--font-weight-medium);
}

.subject-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.subject-chip {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  background: var(--color-primary-bg);
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

/* 开始按钮 */
.start-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-ms);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 91, 191, 0.25);
}

.start-btn:active:not(.disabled) {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 91, 191, 0.2);
}

.start-btn.disabled {
  background: var(--color-disabled);
  box-shadow: none;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 18px;
}
</style>
