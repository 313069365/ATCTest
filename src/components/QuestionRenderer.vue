<template>
  <div class="question-renderer">
    <div class="question-text">
      <span class="question-id">1.</span>
      <span class="question-content">这是题目内容区域，请在此处显示题目内容...</span>
    </div>

    <div class="options">
      <button class="option-btn">
        <span class="option-marker">A</span>
        <span class="option-text">选项A的内容</span>
      </button>
      <button class="option-btn">
        <span class="option-marker">B</span>
        <span class="option-text">选项B的内容</span>
      </button>
      <button class="option-btn">
        <span class="option-marker">C</span>
        <span class="option-text">选项C的内容</span>
      </button>
      <button class="option-btn">
        <span class="option-marker">D</span>
        <span class="option-text">选项D的内容</span>
      </button>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.question-renderer {
  width: 100%;
}

.question-text {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--on-surface);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
}

.question-id {
  color: var(--primary);
  margin-right: var(--spacing-sm);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--spacing-sm);
  background: #fff;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.option-btn:active {
  transform: scale(0.99);
}

.option-btn.selected {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.08);
}

.option-btn.correct {
  color: var(--success);
  border-color: var(--success);
  background: #e6f4ea;
}

.option-btn.wrong {
  border-color: var(--error);
  background: #fce8e6;
}

.option-marker {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: #f1f4f7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #414754;
  flex-shrink: 0;
}

.option-btn.selected .option-marker {
  background: var(--primary);
  color: #fff;
}

.option-btn.correct .option-marker {
  background: var(--success);
  color: #fff;
}

.option-btn.wrong .option-marker {
  background: var(--error);
  color: #fff;
}

.option-text {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}
</style>
