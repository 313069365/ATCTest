<template>
  <div class="single-choice">
    <div class="question-stem">
      <h2 class="question-text">{{ question.stem }}</h2>
    </div>

    <div class="options">
      <button v-for="(option, i) in question.options" :key="i" class="option-btn" :class="{
        selected: isSelected(i),
        correct: showAnswer && isCorrectOption(i),
        wrong: showAnswer && isWrongOption(i),
        review: mode === 'review'
      }" @click="handleSelect(i)" :disabled="disabled || (showAnswer && mode !== 'review')">
        <span class="option-marker">{{ String.fromCharCode(65 + i) }}</span>
        <span class="option-text" v-if="option">{{ formatOption(option) }}</span>
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
  // 背题模式不显示选中状态
  if (props.mode === 'review') return false
  if (Array.isArray(props.userAnswer)) {
    return props.userAnswer.includes(index)
  }
  return props.userAnswer === index
}

const isCorrectOption = (index) => {
  if (!props.question.answer || !props.question.answer[0]) return false
  const answerStr = props.question.answer[0]

  // 获取当前选项的原始内容（移除 A. 前缀）
  const currentOption = props.question.options?.[index]
  if (!currentOption) return false
  const currentOptionText = currentOption.replace(/^[A-Z]\.\s*/, '')

  // 获取正确答案的原始内容
  const correctAnswerText = answerStr.replace(/^[A-Z]\.\s*/, '')

  // 比较选项内容（支持乱序）
  const isCorrect = currentOptionText === correctAnswerText

  // 背题模式下所有选项都可以显示正确状态
  if (props.mode === 'review') {
    return isCorrect
  }
  // 答题模式只在 showAnswer 时显示
  return props.showAnswer && isCorrect
}

const isWrongOption = (index) => {
  // 背题模式下不显示错误状态
  if (props.mode === 'review') return false
  if (!isSelected(index)) return false
  return !isCorrectOption(index)
}

const formatOption = (option) => {
  return option.replace(/^[A-Z]\.\s*/, '')
}

const handleSelect = (index) => {
  if (props.disabled || props.showAnswer) return
  emit('answer', index)
}
</script>

<style scoped>
.single-choice {
  width: 100%;
}

.question-stem {
  padding: var(--spacing-sm) var(--spacing-md);
  background: #fff;
  border: 1px solid transparent;
  margin-bottom: var(--spacing-md);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
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
