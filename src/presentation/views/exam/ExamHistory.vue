<template>
  <div class="page">
    <TopBar title="考试记录" showBack variant="primary" @back="$router.back()">
      <template #right>
        <button class="icon-btn">
          <Icon name="delete-sweep-outline" />
        </button>
      </template>
    </TopBar>

    <main class="content">
      <div class="history-list">
        <div v-for="exam in mockExams" :key="exam.id" class="history-card" :class="{ pass: exam.isPass, fail: !exam.isPass }">
          <div class="history-header">
            <div class="history-meta-top">
              <span class="history-subject">{{ exam.title }}</span>
              <span class="history-badge" :class="{ pass: exam.isPass, fail: !exam.isPass }">
                {{ exam.isPass ? '通过' : '未通过' }}
              </span>
            </div>
            <div class="header-actions">
              <button class="card-action-btn">
                <Icon name="visibility-outline" />
              </button>
              <button class="card-action-btn delete">
                <Icon name="delete-outline" />
              </button>
            </div>
          </div>

          <div class="history-content">
            <div class="history-stats">
              <div class="stat-item">
                <span class="stat-label">得分</span>
                <span class="stat-value">{{ exam.score }}/{{ exam.totalScore }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">正确率</span>
                <span class="stat-value">{{ exam.accuracy }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">用时</span>
                <span class="stat-value">{{ exam.elapsedTime }}</span>
              </div>
            </div>

            <div class="history-details">
              <div class="detail-item correct">
                <span class="detail-label">正确</span>
                <span class="detail-number">{{ exam.correctCount }}</span>
              </div>
              <div class="detail-item incorrect">
                <span class="detail-label">错误</span>
                <span class="detail-number">{{ exam.incorrectCount }}</span>
              </div>
              <div class="detail-item skipped">
                <span class="detail-label">未答</span>
                <span class="detail-number">{{ exam.skippedCount }}</span>
              </div>
            </div>
          </div>

          <div class="history-footer">
            <span class="history-date">{{ exam.date }}</span>
          </div>
        </div>
      </div>

      <div class="empty-state" v-if="mockExams.length === 0">
        <Icon name="history" />
        <p>暂无考试记录</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import Icon from '@/presentation/components/ui/Icon.vue'
import TopBar from '@/presentation/components/layout/TopBar.vue'

const mockExams = [
  {
    id: 1,
    title: '2024年空管英语模拟考试',
    score: 85,
    totalScore: 100,
    accuracy: 85,
    isPass: true,
    elapsedTime: '01:32:45',
    correctCount: 85,
    incorrectCount: 15,
    skippedCount: 0,
    date: '2024年1月15日 14:30'
  },
  {
    id: 2,
    title: '专业英语阶段性测试',
    score: 72,
    totalScore: 100,
    accuracy: 72,
    isPass: true,
    elapsedTime: '00:58:20',
    correctCount: 72,
    incorrectCount: 28,
    skippedCount: 0,
    date: '2024年1月10日 10:15'
  },
  {
    id: 3,
    title: '雷达基础模拟考试',
    score: 55,
    totalScore: 100,
    accuracy: 55,
    isPass: false,
    elapsedTime: '01:25:00',
    correctCount: 55,
    incorrectCount: 45,
    skippedCount: 0,
    date: '2024年1月5日 09:00'
  }
]
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background-secondary);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.content {
  padding: var(--spacing-md);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.history-card {
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-md);
  border-left: 4px solid var(--success);
}

.history-card.fail {
  border-left-color: var(--error);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.history-meta-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.history-subject {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
}

.history-badge {
  padding: var(--spacing-mn) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.history-badge.pass {
  background: var(--success-light);
  color: var(--success);
}

.history-badge.fail {
  background: var(--error-light);
  color: var(--error);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.card-action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.card-action-btn svg {
  font-size: 18px;
  color: var(--text-secondary);
}

.card-action-btn.delete svg {
  color: var(--error);
}

.history-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-mn);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
}

.history-details {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--spacing-sm);
}

.detail-item {
  text-align: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
}

.detail-item.correct {
  background: var(--success-light);
}

.detail-item.incorrect {
  background: var(--error-light);
}

.detail-item.skipped {
  background: var(--background-secondary);
}

.detail-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.detail-number {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.detail-item.correct .detail-number {
  color: var(--success);
}

.detail-item.incorrect .detail-number {
  color: var(--error);
}

.history-footer {
  display: flex;
  justify-content: flex-end;
}

.history-date {
  font-size: var(--font-size-sm);
  color: var(--text-disabled);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-state svg {
  font-size: 48px;
  color: var(--text-disabled);
  margin-bottom: var(--spacing-md);
}

.empty-state p {
  color: var(--text-secondary);
}
</style>