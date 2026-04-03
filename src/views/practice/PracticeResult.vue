<template>
  <div class="page">
    <header class="top-bar">
      <h1>答题结果</h1>
    </header>

    <main class="content">
      <div class="result-card">
        <div class="result-header">
          <div class="result-icon">🎉</div>
          <h2 class="result-title">完成练习</h2>
        </div>

        <div class="accuracy-circle">
          <svg viewBox="0 0 100 100">
            <circle class="bg" cx="50" cy="50" r="45" />
            <circle class="progress" cx="50" cy="50" r="45" style="stroke-dasharray: 282.7; stroke-dashoffset: 42.4;" />
          </svg>
          <span class="accuracy-text">85%</span>
        </div>

        <div class="stats">
          <div class="stat-item">
            <span class="stat-value correct">17</span>
            <span class="stat-label">正确</span>
          </div>
          <div class="stat-item">
            <span class="stat-value wrong">3</span>
            <span class="stat-label">错误</span>
          </div>
          <div class="stat-item">
            <span class="stat-value unknown">0</span>
            <span class="stat-label">待定</span>
          </div>
          <div class="stat-item">
            <span class="stat-value unanswered">0</span>
            <span class="stat-label">未答</span>
          </div>
        </div>

        <div class="time-info">
          <span class="stat-value">15:30</span>
          <span class="stat-label">用时</span>
        </div>
      </div>

      <div class="actions">
        <button class="action-btn primary">
          <span class="material-symbols-outlined">visibility</span>
          查看错题
        </button>
        <div class="action-row">
          <button class="action-btn secondary">
            <span class="material-symbols-outlined">restart_alt</span>
            再练一组
          </button>
          <button class="action-btn outline">
            <span class="material-symbols-outlined">home</span>
            返回首页
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
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
  justify-content: center;
  padding: var(--spacing-md);
  background: var(--primary);
  color: var(--on-primary);
}

.top-bar h1 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.content {
  padding: var(--spacing-md);
}

.result-card {
  background: var(--background);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--spacing-md);
}

.result-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.result-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-sm);
}

.result-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
}

.accuracy-circle {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto var(--spacing-lg);
}

.accuracy-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.accuracy-circle .bg {
  fill: none;
  stroke: var(--color-gray-300);
  stroke-width: 8;
}

.accuracy-circle .progress {
  fill: none;
  stroke: var(--primary);
  stroke-width: 8;
  stroke-linecap: round;
}

.accuracy-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--primary);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--on-surface);
}

.stat-value.correct {
  color: var(--success);
}

.stat-value.wrong {
  color: var(--error);
}

.stat-value.unknown {
  color: var(--warning);
}

.stat-value.unanswered {
  color: var(--text-disabled);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.time-info {
  text-align: center;
  padding-top: var(--spacing-md);
}

.time-info .stat-value {
  display: block;
  font-size: var(--font-size-lg);
  color: var(--on-surface);
  margin-bottom: var(--spacing-mn);
}

.actions {
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

.action-row {
  display: flex;
  gap: var(--spacing-sm);
}

.action-btn.secondary {
  flex: 1;
  background: var(--background-surface);
  color: var(--on-surface);
}

.action-btn.outline {
  flex: 1;
  background: var(--background);
  color: var(--on-surface);
  border: 1px solid var(--border-color-strong);
}
</style>