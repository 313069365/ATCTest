<template>
  <div class="reading-question">
    <div class="article-section" v-if="question.article">
      <div class="article-header">
        <span class="material-symbols-outlined">article</span>
        <span>阅读材料</span>
      </div>
      <div class="article-content">{{ question.article }}</div>
    </div>

    <div class="sub-questions" v-if="question.subQuestions && question.subQuestions.length > 0">
      <div v-for="(sub, index) in question.subQuestions" :key="index" class="sub-question">
        <div class="sub-question-header">
          <span class="sub-number">{{ index + 1 }}</span>
          <span class="sub-type">{{ t(sub.type) }}</span>
        </div>
        
        <div class="sub-question-stem">
          <p>{{ sub.question }}</p>
        </div>

        <div class="sub-options" v-if="sub.options">
          <button
            v-for="(option, i) in sub.options"
            :key="i"
            class="option-btn"
            :class="{
              selected: isSubSelected(index, i),
              correct: showAnswer && isSubCorrect(index, i),
              wrong: showAnswer && isSubWrong(index, i)
            }"
            @click="handleSubSelect(index, i)"
            :disabled="disabled || showAnswer"
          >
            <span class="option-marker">{{ String.fromCharCode(65 + i) }}</span>
            <span class="option-text">{{ formatOption(option) }}</span>
          </button>
        </div>

        <div class="sub-answer-tip" v-if="showAnswer && sub.answer">
          <span class="correct-label">正确答案：</span>
          <span class="correct-answer">{{ sub.answer.join(', ') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/utils/i18n.js'

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
    type: [String, Array, Object],
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

const getSubAnswer = (subIndex) => {
  if (!props.userAnswer || typeof props.userAnswer !== 'object') return null
  return props.userAnswer[subIndex]
}

const isSubSelected = (subIndex, optionIndex) => {
  if (props.mode === 'review') return false
  const subAnswer = getSubAnswer(subIndex)
  if (Array.isArray(subAnswer)) {
    return subAnswer.includes(optionIndex)
  }
  return subAnswer === optionIndex
}

const isSubCorrect = (subIndex, optionIndex) => {
  const sub = props.question.subQuestions?.[subIndex]
  if (!sub || !sub.answer || sub.answer.length === 0) return false
  return sub.answer.some(ans => {
    const correctIndex = String(ans).charCodeAt(0) - 65
    return optionIndex === correctIndex
  })
}

const isSubWrong = (subIndex, optionIndex) => {
  if (!isSubSelected(subIndex, optionIndex)) return false
  return !isSubCorrect(subIndex, optionIndex)
}

const formatOption = (option) => {
  return option.replace(/^[A-Z]\.\s*/, '')
}

const handleSubSelect = (subIndex, optionIndex) => {
  if (props.disabled || props.showAnswer) return
  
  let currentSubAnswer = getSubAnswer(subIndex) || []
  if (!Array.isArray(currentSubAnswer)) {
    currentSubAnswer = []
  }
  
  if (currentSubAnswer.includes(optionIndex)) {
    currentSubAnswer = currentSubAnswer.filter(i => i !== optionIndex)
  } else {
    currentSubAnswer = [...currentSubAnswer, optionIndex]
  }
  
  const newAnswer = { ...(props.userAnswer || {}) }
  newAnswer[subIndex] = currentSubAnswer
  emit('answer', newAnswer)
}
</script>

<style scoped>
.reading-question {
  width: 100%;
}

.article-section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-gray-100);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--primary);
}

.article-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}

.article-content {
  color: var(--on-surface);
  line-height: 1.8;
  white-space: pre-wrap;
}

.sub-questions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.sub-question {
  padding: var(--spacing-md);
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
}

.sub-question-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.sub-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--font-size-sm);
}

.sub-type {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.sub-question-stem {
  margin-bottom: var(--spacing-md);
}

.sub-question-stem p {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--on-surface);
  line-height: 1.6;
}

.sub-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--spacing-sm);
  background: #fff;
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
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
  box-shadow: 0 2px 8px rgba(0, 91, 191, 0.1);
}

.option-btn.correct {
  border-color: var(--success);
  background: #e6f4ea;
}

.option-btn.wrong {
  border-color: var(--error);
  background: #fce8e6;
}

.option-marker {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  color: var(--text-secondary);
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
  font-size: var(--font-size-md);
}

.sub-answer-tip {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: #e6f4ea;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.correct-label {
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
}

.correct-answer {
  color: var(--success);
  font-weight: var(--font-weight-bold);
  margin-left: var(--spacing-sm);
}
</style>
