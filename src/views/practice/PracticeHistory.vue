<template>
  <div class="page">
    <header class="top-bar">
      <button class="back-btn">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1>历史记录</h1>
      <button class="clear-btn">
        <span class="material-symbols-outlined">delete_sweep</span>
      </button>
    </header>

    <main class="content">
      <div class="stats-section">
        <div class="stat-card">
          <span class="material-symbols-outlined stat-icon">assignment</span>
          <div class="stat-info">
            <span class="stat-value">12</span>
            <span class="stat-label">总练习</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="material-symbols-outlined stat-icon">target</span>
          <div class="stat-info">
            <span class="stat-value">78%</span>
            <span class="stat-label">正确率</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="material-symbols-outlined stat-icon">history</span>
          <div class="stat-info">
            <span class="stat-value">12</span>
            <span class="stat-label">记录条数</span>
          </div>
        </div>
      </div>

      <div class="history-list">
        <div v-for="item in mockHistory" :key="item.id" class="history-card" :class="item.class">
          <div class="card-body">
            <div class="card-header">
              <div class="header-main">
                <h3 class="card-title">{{ item.subjectName }}</h3>
                <span class="card-date">{{ item.date }}</span>
              </div>
            </div>

            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-value" :class="item.accuracyClass">{{ item.accuracy }}%</span>
                <span class="stat-label">正确率</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ item.correct }}/{{ item.total }}</span>
                <span class="stat-label">答题</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ item.time }}</span>
                <span class="stat-label">时长</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <button class="action-btn review-btn">
              <span class="material-symbols-outlined">refresh</span>
              <span>复习</span>
            </button>
            <button class="action-btn delete-btn">
              <span class="material-symbols-outlined">delete</span>
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>

      <div class="empty-state" v-if="mockHistory.length === 0">
        <div class="empty-icon-wrapper">
          <span class="material-symbols-outlined">history</span>
        </div>
        <h3>暂无练习记录</h3>
        <p>开始练习后，记录会自动保存</p>
        <button class="start-btn">开始练习</button>
      </div>
    </main>
  </div>
</template>

<script setup>
const mockHistory = [
  {
    id: 1,
    subjectName: '空管英语 - 听力专项',
    date: '2小时前',
    accuracy: 85,
    accuracyClass: 'excellent',
    class: 'excellent',
    correct: 17,
    total: 20,
    time: '15分钟'
  },
  {
    id: 2,
    subjectName: '专业英语 - 词汇练习',
    date: '昨天',
    accuracy: 72,
    accuracyClass: 'good',
    class: 'good',
    correct: 18,
    total: 25,
    time: '20分钟'
  },
  {
    id: 3,
    subjectName: '雷达基础 - 操作流程',
    date: '3天前',
    accuracy: 55,
    accuracyClass: 'needs-work',
    class: 'needs-work',
    correct: 11,
    total: 20,
    time: '18分钟'
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

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--primary);
  color: var(--on-primary);
}

.back-btn, .clear-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--on-primary);
}

.top-bar h1 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.content {
  padding: var(--spacing-md);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 24px;
  color: var(--primary);
}

.stat-value {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--on-surface);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.history-card {
  background: var(--background);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border-left: 4px solid var(--success);
}

.history-card.good {
  border-left-color: var(--primary);
}

.history-card.needs-work {
  border-left-color: var(--warning);
}

.card-body {
  padding: var(--spacing-md);
}

.card-header {
  margin-bottom: var(--spacing-md);
}

.card-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  margin-bottom: var(--spacing-mn);
}

.card-date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-item .stat-value {
  font-size: var(--font-size-md);
}

.stat-item .stat-value.excellent {
  color: var(--success);
}

.stat-item .stat-value.good {
  color: var(--primary);
}

.stat-item .stat-value.needs-work {
  color: var(--warning);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color-light);
}

.card-footer {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background-surface);
  border-top: 1px solid var(--border-color-light);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.review-btn {
  background: var(--primary-light);
  color: var(--primary);
}

.delete-btn {
  background: var(--background-secondary);
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: var(--color-gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.empty-icon-wrapper .material-symbols-outlined {
  font-size: 36px;
  color: var(--text-disabled);
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.start-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
</style>