<template>
  <div class="answer-card-modal" @click.self="$emit('close')">
    <div class="answer-card-content">
      <div class="answer-card-header">
        <button class="close-btn" @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
        <h3>答题卡</h3>
        <button class="submit-btn" @click="$emit('exit')">退出</button>
      </div>

      <div class="answer-card-body">
        <div class="progress-stats">
          <div class="practice-info" v-if="settings">
            <div class="tags-row">
              <span class="info-tag">{{ settings.order }} {{ settings.mode === 'study' ? '背题' : '答题'
                }}</span>
              <span class="info-tag" v-if="settings.mode === 'practice'">
                {{ settings.showAnswer === 'immediate' ? '立即显示' : '按需显示' }}
              </span>
              <span class="info-tag" v-if="settings.mode === 'practice' && settings.autoJump">
                自动跳转
              </span>
            </div>
          </div>

          <div class="legend">
            <div class="legend-item">
              <span class="legend-dot correct"></span>
              <span>正确</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot wrong"></span>
              <span>错误</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot unknown"></span>
              <span>待定</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot"></span>
              <span>未答</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot current"></span>
              <span>当前</span>
            </div>
          </div>
        </div>

        <div class="question-list">
          <button class="question-btn" v-for="i in 10" :key="i">
            {{ i }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  questions: Array,
  currentIndex: Number
})

const settings = ref({
  order: '随机',
  mode: 'study',
  showAnswer: 'immediate',
  autoJump: true
})

defineEmits(['close', 'go', 'exit'])
</script>

<style scoped>
.answer-card-modal {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--app-max-width);
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-popup);
  display: flex;
  align-items: flex-end;
}

.answer-card-content {
  background: var(--background-secondary);
  width: 100%;
  max-width: var(--app-max-width);
  max-height: 85vh;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.answer-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--background);
  border-bottom: 1px solid var(--border-color-strong);
}

.close-btn {
  width: 35px;
  height: 35px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn .material-symbols-outlined {
  font-size: 18px;
}

.answer-card-header h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
}

.submit-btn {
  padding: var(--spacing-sm);
  border: none;
  background: transparent;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.answer-card-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md) var(--spacing-lg);
}

.progress-stats {
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-lg);
  background-color: var(--background);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid #ebeef2;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 11px;
  color: var(--icon-color);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-sm);
  background: var(--border-color-strong);
}

.legend-dot.correct {
  background: var(--success);
}

.legend-dot.wrong {
  background: var(--error);
}

.legend-dot.unknown {
  background: var(--warning);
}

.legend-dot.current {
  background: var(--primary);
}

.question-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.question-list .question-btn {
  min-width: 50px;
  aspect-ratio: 1;
  margin: 0 auto;
  border: none;
  border-radius: var(--radius-md);
  background: #e0e3e6;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: #414754;
  cursor: pointer;
}

.question-btn:active {
  transform: scale(0.95);
}

.question-btn.correct {
  background: var(--success);
  color: #fff;
}

.question-btn.wrong {
  background: var(--error);
  color: #fff;
}

.question-btn.unknown {
  background: #fbbc04;
  color: #181c1f;
}

.question-btn.current {
  background: var(--primary);
  color: #fff;
}
</style>
