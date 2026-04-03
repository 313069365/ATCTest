<template>
  <div class="page">
    <div class="hero-section">
      <header class="top-bar">
        <button class="home-btn">
          <span class="material-symbols-outlined">home</span>
        </button>
        <h1>考试成绩</h1>
        <button class="share-btn">
          <span class="material-symbols-outlined">share</span>
        </button>
      </header>

      <div class="hero-content">
        <div class="grade-badge" :class="gradeClass">
          <span class="material-symbols-outlined">emoji_events</span>
          <span>优秀</span>
        </div>

        <div class="score-ring">
          <svg viewBox="0 0 120 120">
            <circle class="ring-bg" cx="60" cy="60" r="52" />
            <circle class="ring-progress" cx="60" cy="60" r="52" style="stroke-dasharray: 326.7; stroke-dashoffset: 49;" />
          </svg>
          <div class="score-center">
            <span class="score-main">85%</span>
            <span class="score-sub">正确率</span>
          </div>
        </div>

        <div class="score-detail">
          <span class="score-value">85</span>
          <span class="score-divider">/</span>
          <span class="score-total">100 分</span>
        </div>
      </div>
    </div>

    <main class="content">
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card correct">
            <div class="stat-indicator"></div>
            <div class="stat-info">
              <span class="stat-value">85</span>
              <span class="stat-label">正确</span>
            </div>
          </div>
          <div class="stat-card wrong">
            <div class="stat-indicator"></div>
            <div class="stat-info">
              <span class="stat-value">15</span>
              <span class="stat-label">错误</span>
            </div>
          </div>
          <div class="stat-card total">
            <div class="stat-indicator"></div>
            <div class="stat-info">
              <span class="stat-value">100</span>
              <span class="stat-label">总题数</span>
            </div>
          </div>
        </div>
      </section>

      <section class="meta-section">
        <div class="meta-card">
          <div class="meta-item">
            <span class="material-symbols-outlined">schedule</span>
            <div class="meta-text">
              <span class="meta-label">用时</span>
              <span class="meta-value">01:32:45</span>
            </div>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="material-symbols-outlined">calendar_today</span>
            <div class="meta-text">
              <span class="meta-label">考试日期</span>
              <span class="meta-value">2024年1月15日</span>
            </div>
          </div>
        </div>
      </section>

      <section class="breakdown-section">
        <h3 class="section-title">答题分布</h3>
        <div class="breakdown-card">
          <div class="breakdown-bar">
            <div class="bar-segment correct" style="flex: 85"></div>
            <div class="bar-segment wrong" style="flex: 15"></div>
          </div>
          <div class="breakdown-legend">
            <div class="legend-item">
              <span class="dot correct"></span>
              <span>正确 85%</span>
            </div>
            <div class="legend-item">
              <span class="dot wrong"></span>
              <span>错误 15%</span>
            </div>
          </div>
        </div>
      </section>

      <section class="actions-section">
        <button class="action-btn primary">
          <span class="material-symbols-outlined">visibility</span>
          查看答题详情
        </button>
        <button class="action-btn secondary">
          <span class="material-symbols-outlined">restart_alt</span>
          重新考试
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
const gradeClass = 'excellent'
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.hero-section {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding-bottom: var(--spacing-xl);
  position: relative;
  overflow: hidden;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
}

.home-btn, .share-btn {
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
  color: var(--on-primary);
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
}

.grade-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  color: var(--on-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
}

.score-ring {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: var(--spacing-md);
}

.score-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: var(--on-primary);
  stroke-width: 8;
  stroke-linecap: round;
}

.score-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-main {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--on-primary);
}

.score-sub {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.8);
}

.score-detail {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  color: var(--on-primary);
}

.score-value {
  font-size: var(--font-size-xxl);
  font-weight: 700;
}

.score-divider {
  font-size: var(--font-size-lg);
}

.score-total {
  font-size: var(--font-size-md);
}

.content {
  padding: var(--spacing-md);
  margin-top: -var(--spacing-lg);
}

.stats-section {
  margin-bottom: var(--spacing-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
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

.stat-indicator {
  width: 4px;
  height: 32px;
  border-radius: var(--radius-full);
}

.stat-card.correct .stat-indicator {
  background: var(--success);
}

.stat-card.wrong .stat-indicator {
  background: var(--error);
}

.stat-card.total .stat-indicator {
  background: var(--primary);
}

.stat-value {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--on-surface);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.meta-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.meta-item .material-symbols-outlined {
  color: var(--primary);
}

.meta-text {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.meta-value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
}

.meta-divider {
  width: 1px;
  height: 32px;
  background: var(--border-color-light);
  margin: 0 var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
}

.breakdown-card {
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-md);
}

.breakdown-bar {
  display: flex;
  height: 12px;
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.bar-segment.correct {
  background: var(--success);
}

.bar-segment.wrong {
  background: var(--error);
}

.breakdown-legend {
  display: flex;
  justify-content: space-around;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.correct {
  background: var(--success);
}

.dot.wrong {
  background: var(--error);
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.action-btn.primary {
  background: var(--primary);
  color: var(--on-primary);
}

.action-btn.secondary {
  background: var(--background-surface);
  color: var(--on-surface);
}
</style>