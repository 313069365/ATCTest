<template>
  <div class="page">
    <TopBar :title="title" showBack :variant="topbarVariant" :style="topbarStyle" @back="$emit('back')">
      <template #right>
        <button class="icon-btn" @click="$emit('clear')">
          <Icon name="delete-sweep-outline" />
        </button>
      </template>
    </TopBar>

    <main class="content">
      <div class="stats-section">
        <div class="stat-card">
          <Icon name="assignment-outline" class="stat-icon" />
          <div class="stat-info">
            <span class="stat-value">{{ list.length }}</span>
            <span class="stat-label">次数</span>
          </div>
        </div>
        <div class="stat-card">
          <Icon name="target" class="stat-icon" />
          <div class="stat-info">
            <span class="stat-value">{{ avgAccuracy }}%</span>
            <span class="stat-label">正确率</span>
          </div>
        </div>
        <div class="stat-card">
          <Icon name="history" class="stat-icon" />
          <div class="stat-info">
            <span class="stat-value">{{ list.length }}</span>
            <span class="stat-label">记录</span>
          </div>
        </div>
      </div>

      <div class="history-list">
        <div v-for="item in list" :key="item.id" class="history-card" :class="item.cardClass">
          <div class="card-accent"></div>
          <div class="card-body">
            <div class="card-top">
              <div class="card-info">
                <h3 class="card-title">{{ item.title }}</h3>
                <span class="card-date">{{ item.date }}</span>
              </div>
              <span class="card-badge" :class="item.badgeClass">{{ item.badge }}</span>
            </div>

            <div class="metrics-row">
              <div class="metric">
                <span class="metric-value" :class="item.cardClass">{{ item.accuracy }}%</span>
                <span class="metric-label">正确率</span>
              </div>
              <span class="metric-divider"></span>
              <div class="metric">
                <span class="metric-value">{{ item.correct }}/{{ item.total }}</span>
                <span class="metric-label">答题</span>
              </div>
              <span class="metric-divider"></span>
              <div class="metric">
                <span class="metric-value">{{ item.time }}</span>
                <span class="metric-label">时长</span>
              </div>
              <span class="metric-divider"></span>
              <div class="metric">
                <span class="metric-value">{{ item.score }}/{{ item.totalScore }}</span>
                <span class="metric-label">得分</span>
              </div>
            </div>

            <div class="card-actions">
              <button class="action-btn secondary">
                <Icon name="delete-outline" />
                删除
              </button>
              <button class="action-btn" :class="item.altClass">
                <Icon name="visibility-outline" />
                回顾
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-if="list.length === 0">
        <div class="empty-icon-wrapper">
          <Icon name="history" />
        </div>
        <h3>{{ emptyTitle }}</h3>
        <p>{{ emptyDesc }}</p>
        <button v-if="showStartBtn" class="start-btn" @click="$emit('start-practice')">{{ startBtnText }}</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import Icon from '@/presentation/components/ui/Icon.vue'
import TopBar from '@/presentation/components/shared/TopBar.vue'

defineProps({
  title: { type: String, default: '' },
  topbarVariant: { type: String, default: 'default' },
  topbarStyle: { type: Object, default: () => ({}) },
  list: { type: Array, default: () => [] },
  avgAccuracy: { type: Number, default: 0 },
  emptyTitle: { type: String, default: '' },
  emptyDesc: { type: String, default: '' },
  showStartBtn: { type: Boolean, default: false },
  startBtnText: { type: String, default: '' }
})

defineEmits(['back', 'clear', 'start-practice'])
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-muted);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.content {
  padding: var(--space-md);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: var(--font-size-2xl);
  color: var(--color-primary);
}

.stat-value {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.history-card {
  display: flex;
  background: var(--color-background);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.card-accent {
  width: 5px;
  flex-shrink: 0;
}

.history-card.excellent .card-accent {
  background: var(--color-success);
}

.history-card.practice .card-accent {
  background: var(--color-primary);
}

.history-card.alt-amber .card-accent {
  background: var(--color-warning);
}

.history-card.needs-work .card-accent {
  background: var(--color-destructive);
}

.card-body {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.card-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.card-badge {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.card-badge.alt-blue {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.card-badge.alt-amber {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.metrics-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: var(--space-sm) 0;
}

.metric {
  text-align: center;
}

.metric-value {
  display: block;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.metric-value.excellent {
  color: var(--color-success);
}

.metric-value.practice {
  color: var(--color-primary);
}

.metric-value.practice.alt-amber {
  color: var(--color-warning);
}

.metric-value.needs-work {
  color: var(--color-destructive);
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.metric-divider {
  width: 1px;
  height: 28px;
  background: var(--color-border-light);
}

.card-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-2xs) 14px;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity 0.15s;
}

.action-btn.alt-blue {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

.action-btn.alt-amber {
  background: var(--color-warning);
  color: var(--color-primary-foreground);
}

.action-btn.secondary {
  background: var(--color-muted);
  color: var(--color-text-secondary);
}

.card-badge.excellent {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.card-badge.needs-work {
  background: var(--color-destructive-bg);
  color: var(--color-destructive);
}

.action-btn svg {
  font-size: var(--font-size-lg);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: center;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-md);
}

.empty-icon-wrapper svg {
  font-size: var(--font-size-3xl);
  color: var(--color-disabled);
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.empty-state p {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.start-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
</style>
