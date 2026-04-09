<template>
  <div class="multiple-choice">
    <div class="question-stem">
      <h2 class="question-text">{{ question.stem }}</h2>
    </div>

    <div class="options">
      <button
        v-for="(option, i) in question.options"
        :key="i"
        class="option-btn"
        :class="{
          selected: isSelected(i),
          correct: showAnswer && isCorrectOption(i),
          wrong: showAnswer && isWrongOption(i),
          review: mode === 'review'
        }"
        @click="handleSelect(i)"
        :disabled="disabled || (showAnswer && mode !== 'review')"
      >
        <span class="option-marker">{{ String.fromCharCode(65 + i) }}</span>
        <span class="option-text" v-if="option">{{ formatOption(option) }}</span>
      </button>
    </div>

    <div class="answer-tip" v-if="mode === 'answer' && !showAnswer">
      <span class="tip-text">提示：多选题，可选择多个答案</span>
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
  if (!props.question.answer || props.question.answer.length === 0) return false
  
  // 获取当前选项的原始内容
  const currentOption = props.question.options?.[index]
  if (!currentOption) return false
  const currentOptionText = currentOption.replace(/^[A-Z]\.\s*/, '')
  
  // 检查答案是否匹配（支持乱序）
  const hasCorrect = props.question.answer.some(ans => {
    const correctAnswerText = String(ans).replace(/^[A-Z]\.\s*/, '')
    return currentOptionText === correctAnswerText
  })
  
  // 背题模式下显示正确答案
  if (props.mode === 'review') {
    return hasCorrect
  }
  // 答题模式只在 showAnswer 时显示
  return props.showAnswer && hasCorrect
}

const isWrongOption = (index) => {
  if (props.mode === 'review') return false
  if (!isSelected(index)) return false
  return !isCorrectOption(index)
}

const formatOption = (option) => {
  return option.replace(/^[A-Z]\.\s*/, '')
}

const handleSelect = (index) => {
  if (props.disabled || props.showAnswer) return
  
  let newAnswer
  if (Array.isArray(props.userAnswer)) {
    if (props.userAnswer.includes(index)) {
      newAnswer = props.userAnswer.filter(i => i !== index)
    } else {
      newAnswer = [...props.userAnswer, index]
    }
  } else {
    newAnswer = [index]
  }
  
  emit('answer', newAnswer)
}
</script>

<style scoped>
.multiple-choice {
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

.answer-tip {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
}

.tip-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
</style>
