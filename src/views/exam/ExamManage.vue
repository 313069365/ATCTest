<template>
  <div class="exam-page">
    <header class="top-bar">
      <h1 class="title">考试管理</h1>
      <button class="icon-btn" @click="$router.push('/exam/history')">
        <span class="material-symbols-outlined">history</span>
      </button>
    </header>

    <main class="content">
      <section class="paper-section">
        <div class="paper-actions">
        <button class="paper-action-btn" @click="$router.push('/exam/create')">
          <span class="material-symbols-outlined">add</span>
          <span>创建试卷</span>
        </button>
        <button class="paper-action-btn" @click="$router.push('/exam/history')">
          <span class="material-symbols-outlined">history</span>
          <span>考试记录</span>
        </button>
        </div>

        <h2 class="section-title">试卷列表</h2>
        
        <div class="paper-list">
          <div v-for="paper in mockPapers" :key="paper.id" class="paper-card">
            <div class="paper-header">
              <span class="paper-tag">{{ paper.category }}</span>
              <div class="paper-actions-btns">
                <button class="icon-btn-sm">
                  <span class="material-symbols-outlined">file_download</span>
                </button>
                <button class="icon-btn-sm delete">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>

            <h3 class="paper-title">{{ paper.title }}</h3>
            <p class="paper-desc">{{ paper.description }}</p>
            <div class="paper-stats">
              <span class="stat-item">
                <span class="material-symbols-outlined">quiz</span>
                {{ paper.questionCount }} 题
              </span>
              <span class="stat-item">
                <span class="material-symbols-outlined">timer</span>
                {{ paper.duration }} 分钟
              </span>
              <span class="stat-item">
                <span class="material-symbols-outlined">grade</span>
                {{ paper.totalScore }} 分
              </span>
              <span class="stat-item created-time">
                <span class="material-symbols-outlined">event</span>
                {{ paper.createdAt }}
              </span>
            </div>

            <button class="start-btn" @click="$router.push('/exam/paper')">
              开始考试
              <span class="material-symbols-outlined">play_arrow</span>
            </button>
          </div>
        </div>

        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup>
const mockPapers = [
  {
    id: 1,
    title: '2024年空管英语模拟考试',
    description: '综合测试题目',
    category: '模拟测试',
    questionCount: 100,
    duration: 120,
    totalScore: 100,
    createdAt: '1月15日'
  },
  {
    id: 2,
    title: '专业英语阶段性测试',
    description: '专业词汇与阅读理解',
    category: '阶段测试',
    questionCount: 50,
    duration: 60,
    totalScore: 100,
    createdAt: '1月10日'
  },
  {
    id: 3,
    title: '雷达基础模拟考试',
    description: '雷达原理与操作',
    category: '模拟测试',
    questionCount: 80,
    duration: 90,
    totalScore: 100,
    createdAt: '1月5日'
  }
]
</script>

<style scoped>
.exam-page {
  min-height: 100vh;
  background: var(--background-secondary);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
  position: relative;
}

.icon-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  border: none;
  background: transparent;
  border-radius: 50%;
}

.icon-btn:active {
  background: var(--color-gray-400);
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.content {
  padding: var(--spacing-lg);
  padding-bottom: 100px;
}

.paper-section {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
}

.paper-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.paper-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background: rgba(0, 91, 191, 0.1);
  border-radius: var(--radius-md);
  color: var(--primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  border: none;
}

.paper-action-btn:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}

.paper-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.paper-card {
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color-light);
}

.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.paper-actions-btns {
  display: flex;
  gap: 6px;
}

.icon-btn-sm {
  width: 32px;
  height: 32px;
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}

.icon-btn-sm .material-symbols-outlined {
  font-size: 18px;
  color: var(--text-secondary);
}

.icon-btn-sm.delete .material-symbols-outlined {
  color: var(--error);
}

.paper-tag {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--primary);
  background: var(--primary-light);
  padding: var(--spacing-mn) var(--spacing-md);
  border-radius: var(--radius-lg);
}

.paper-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
  margin: var(--spacing-mn);
}

.paper-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: var(--spacing-mn);
}

.paper-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--spacing-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-mn);
  color: var(--text-disabled);
}

.stat-item .material-symbols-outlined {
  font-size: 12px;
}

.stat-item.created-time {
  background: rgba(0, 91, 191, 0.1);
  color: var(--primary);
}

.start-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.25);
}

.start-btn:active {
  transform: scale(0.98);
}
</style>