<template>
  <div class="progress-container">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: percent + '%' }"></div>
    </div>
    <div class="progress-info">
      <span>第 {{ currentIndex + 1 }} 题 / 共 {{ total }} 题</span>
      <span class="progress-percent">{{ percent }}%</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentIndex: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  percent: {
    type: [String, Number],
    default: 0
  }
})
</script>

<style scoped>
.progress-container {
  padding: 12px 16px;
  background: var(--background);
}

.progress-bar {
  height: 4px;
  background: var(--color-gray-200);
  border-radius: var(--radius-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-dark), var(--primary));
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-sm);
  font-size: 12px;
  color: var(--text-secondary);
}

.progress-percent {
  color: var(--primary);
  font-weight: 600;
}
</style>
