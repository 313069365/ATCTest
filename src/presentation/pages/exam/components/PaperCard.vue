<template>
  <div class="paper-card" :class="{ expanded }">
    <div class="paper-header" @click="expanded = !expanded" role="button" tabindex="0"
      @keydown.enter="expanded = !expanded">
      <div class="header-left">
        <h3 class="paper-title">{{ paper.title }}</h3>
        <span class="paper-tag">ID: {{ paper.id }}</span>
      </div>
    </div>
    <!-- <div class="meta-row">
      <div class="meta-item">
        <span class="meta-label">创建者</span>
        <span class="meta-value">{{ paper.creator }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">创建时间</span>
        <span class="meta-value">{{ paper.createTime }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">截止时间</span>
        <span class="meta-value" :class="{ expired: isExpired }">{{ deadlineText }}</span>
      </div>
    </div> -->
    <div v-if="expanded" class="expand-section">

      <div class="expand-divider"></div>
      <div class="meta-grid">

        <div class="meta-item">
          <span class="meta-label">时长</span>
          <span class="meta-value">{{ paper.duration }} 分钟</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">题量</span>
          <span class="meta-value">{{ paper.questionCount }} 题</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">总分</span>
          <span class="meta-value">{{ paper.totalScore }} 分</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">及格线</span>
          <span class="meta-value">{{ paper.passScore }} 分</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">允许次数</span>
          <span class="meta-value">{{ paper.maxAttempts }} 次</span>
        </div>


      </div>

      <div class="subject-section" v-if="paper.bankInfo">
        <span class="subject-section-label">科目</span>
        <div class="subject-list">
          <span v-for="info in paper.bankInfo" :key="info.subject" class="subject-chip">
            {{ t(info.subject) }}
          </span>
        </div>
      </div>

      <button class="start-btn" @click.stop="handleStart">
        开始考试
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

const deadlineText = computed(() => {
  if (!props.paper.expiration) return '未设置'
  const d = new Date(props.paper.expiration)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

async function handleStart() {
  const msg = `考试名称：${props.paper.title}\n考试时长：${props.paper.duration} 分钟\n允许次数：${props.paper.maxAttempts} 次`
  const ok = await confirm.show(msg, { title: '确认开始考试' })
  if (ok) emit('start', props.paper.id)
}
</script>

<style scoped>
.paper-card {
  background: var(--color-background);

  padding: var(--space-md);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-light);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.paper-card.expanded {
  border-color: var(--color-primary);
  box-shadow: 0 2px 16px var(--color-primary-bg);
  border-radius: var(--radius-lg);
}

.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: 0;
}

.expand-icon {
  font-size: var(--font-size-2xl);
  color: var(--color-text-secondary);
  flex-shrink: 0;
  transition: transform 0.2s;
}

.paper-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.paper-tag {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.meta-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.meta-cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-2xs);
  padding: var(--space-xs);
  background: var(--color-muted);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.meta-icon {
  color: var(--color-text-tertiary);
}

.meta-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.meta-value {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-bold);
}

.meta-value.expired {
  color: var(--color-destructive);
}

.start-btn {
  width: 100%;
  padding: var(--space-sm);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  box-shadow: 0 2px 8px var(--color-primary-bg);
}

.start-btn:active {
  transform: scale(0.97);
}

.expand-divider {
  height: 1px;
  background: var(--color-border-light);
  margin: var(--space-sm) 0;
}

.expand-section {
  animation: expandIn 0.2s ease-out;
}

@keyframes expandIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-sm);
  background: var(--color-muted);
  border-radius: var(--radius-md);
}

.meta-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.subject-section {
  margin-bottom: var(--space-md);
}

.subject-section-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: var(--space-2xs);
}

.subject-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs);
}

.subject-chip {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  background: var(--color-primary-bg);
  padding: 2px 10px;
  border-radius: var(--radius-sm);
}
</style>
