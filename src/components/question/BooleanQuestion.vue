<template>
  <div class="boolean-question">
    <div class="question-stem">
      <h2 class="question-text">{{ question.stem }}</h2>
    </div>

    <div class="options">
      <button class="option-btn" :class="{
        selected: isSelected(0),
        correct: showAnswer && isCorrectOption(0),
        wrong: showAnswer && isWrongOption(0),
        review: mode === 'review'
      }" @click="handleSelect(0)" :disabled="disabled || (showAnswer && mode !== 'review')">
        <span class="option-marker">T</span>
        <span class="option-text">正确</span>
      </button>
      <button class="option-btn" :class="{
        selected: isSelected(1),
        correct: showAnswer && isCorrectOption(1),
        wrong: showAnswer && isWrongOption(1),
        review: mode === 'review'
      }" @click="handleSelect(1)" :disabled="disabled || (showAnswer && mode !== 'review')">
        <span class="option-marker">F</span>
        <span class="option-text">错误</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'answer'
  },
  userAnswer: {
    type: [String, Array, Number],
    default: null
  },
  showAnswer: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['answer'])

const isSelected = (index) => {
  if (props.mode === 'review') return false
  if (Array.isArray(props.userAnswer)) {
    return props.userAnswer.includes(index)
  }
  return props.userAnswer === index
}

const isCorrectOption = (index) => {
  if (!props.question.answer || !props.question.answer[0]) return false
  const answerStr = props.question.answer[0]
  // 检查答案是否包含"正"（中文）或"T"(英文 TRUE)
  const isCorrect = answerStr.includes('正') || answerStr.toUpperCase().includes('T')
  // 正确答案为 index 0，错误答案为 index 1
  const correctIndex = isCorrect ? 0 : 1
  // 背题模式下显示正确答案
  if (props.mode === 'review') {
    return index === correctIndex
  }
  // 答题模式只在 showAnswer 时显示
  return props.showAnswer && index === correctIndex
}

const isWrongOption = (index) => {
  if (!props.showAnswer) return false
  if (props.mode === 'review') return false
  if (!isSelected(index)) return false
  return !isCorrectOption(index)
}

const handleSelect = (index) => {
  if (props.disabled || props.showAnswer) return
  emit('answer', index)
}
</script>

<style scoped>
.boolean-question {
  width: 100%;
}

.question-stem {
  margin-bottom: var(--spacing-lg);
}

.question-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--on-surface);
  line-height: 1.6;
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

.option-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
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

.option-btn.review.correct {
  border-color: var(--success);
  background: #e6f4ea;
}

.option-btn.review.correct .option-marker {
  background: var(--success);
  color: #fff;
}

.option-text {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}
</style>
