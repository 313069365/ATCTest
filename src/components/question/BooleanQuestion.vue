<template>
  <div class="boolean-question">
    <!-- 1. 题目信息区 -->
    <div class="question-meta">
      <span class="question-type-tag">{{ t(question?.type) }}</span>
      <span class="question-id">{{ t('questionId') }}: {{ question?.id }}</span>
      <span class="question-difficulty">{{ t('difficulty') }}: {{ question?.difficulty }}</span>
    </div>

    <!-- 2. 题干区 -->
    <div class="question-stem">
      <h2 class="question-text">{{ question?.stem }}</h2>
    </div>

    <!-- 3. 作答区 -->
    <div class="options">
      <button class="option-btn" :class="{
        selected: isSelected(0),
        correct: shouldShowAnswer && isCorrectOption(0),
        wrong: shouldShowAnswer && isWrongOption(0),
        review: mode === 'review'
      }" @click="handleSelect(0)" :disabled="disabled || (shouldShowAnswer && mode !== 'review')">
        <span class="option-marker"></span>
        <span class="option-text">正确</span>
      </button>
      <button class="option-btn" :class="{
        selected: isSelected(1),
        correct: shouldShowAnswer && isCorrectOption(1),
        wrong: shouldShowAnswer && isWrongOption(1),
        review: mode === 'review'
      }" @click="handleSelect(1)" :disabled="disabled || (shouldShowAnswer && mode !== 'review')">
        <span class="option-marker"></span>
        <span class="option-text">错误</span>
      </button>
    </div>

    <!-- 检查答案按钮 -->
    <div v-if="shouldShowCheckBtn" class="check-answer">
      <button class="check-btn" @click="$emit('check')">
        <span class="material-symbols-outlined">verified</span>
        {{ t('checkAnswer') }}
      </button>
    </div>

    <!-- 4. 答案解析区 -->
    <div v-if="shouldShowAnswer && showExplanation" class="answer-section">
      <div class="explanation-section">
        <div class="explanation-header">
          <span class="material-symbols-outlined">lightbulb</span>
          <span>{{ t('explanation') }}</span>
        </div>
        <div class="explanation-content">
          {{ formattedExplanation }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/utils/i18n.js'
import { useQuestionHandler } from '@/composables/useQuestionHandler'

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
  },
  showAnswerMode: {
    type: String,
    default: 'manual'
  },
  autoJump: {
    type: Boolean,
    default: false
  },
  answerChecked: {
    type: Object,
    default: () => ({})
  },
  answerStatus: {
    type: Object,
    default: () => ({})
  },
  isMarked: {
    type: Boolean,
    default: false
  },
  showExplanation: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['answer', 'check', 'toggle-mark'])

const {
  shouldShowCheckBtn,
  shouldShowAnswer
} = useQuestionHandler({
  question: computed(() => props.question),
  practiceMode: computed(() => props.mode),
  showAnswerMode: computed(() => props.showAnswerMode),
  userAnswer: () => props.userAnswer,
  isChecked: () => props.showAnswer
})


// 格式化解析内容
const formattedExplanation = computed(() => {
  const explanation = props.question?.explanation
  if (explanation && explanation.trim()) {
    return explanation
  }
  return t('explanation') + ': 无'
})

const isSelected = (index) => {
  if (props.mode === 'review') return false
  if (Array.isArray(props.userAnswer)) {
    return props.userAnswer.includes(index)
  }
  return props.userAnswer === index
}

const isCorrectOption = (index) => {
  if (!props.question?.answer || !props.question.answer[0]) return false
  const answerStr = props.question.answer[0]
  const isCorrect = answerStr.includes('正') || answerStr.toUpperCase().includes('T')
  const correctIndex = isCorrect ? 0 : 1

  if (props.mode === 'review') {
    return index === correctIndex
  }
  return shouldShowAnswer.value && index === correctIndex
}

// 直接比较答案是否正确（不依赖 showAnswer 状态）
const checkIsCorrect = (index) => {
  if (!props.question?.answer || !props.question.answer[0]) return false
  const answerStr = props.question.answer[0]
  const isCorrect = answerStr.includes('正') || answerStr.toUpperCase().includes('T')
  const correctIndex = isCorrect ? 0 : 1
  return index === correctIndex
}

const isWrongOption = (index) => {
  if (!shouldShowAnswer.value) return false
  if (props.mode === 'review') return false
  if (!isSelected(index)) return false
  return !isCorrectOption(index)
}

const handleSelect = (index) => {
  if (props.disabled || shouldShowAnswer.value) return
  emit('answer', index)

  // 自动跳转：答题正确后自动跳下一题
  if (props.autoJump && props.showAnswerMode === 'immediate' && !props.mode?.includes('review')) {
    const isCorrect = checkIsCorrect(index)
    if (isCorrect) {
      setTimeout(() => {
        emit('next-question')
      }, 500)
    }
  }
}
</script>

<style scoped>
.boolean-question {
  width: 100%;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background);
  border: 1px solid transparent;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: var(--shadow-md);
}

.question-type-tag {
  padding: var(--spacing-mn) var(--spacing-sm);
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.question-id {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.question-difficulty {
  margin-left: auto;
  padding: var(--spacing-mn) var(--spacing-sm);
  background: var(--color-gray-100);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}


.question-stem {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background);
  border: 1px solid transparent;
  margin-bottom: var(--spacing-md);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  box-shadow: var(--shadow-md);
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
  padding: var(--spacing-md);
  background: var(--background-surface);
  border: 1px solid var(--border-color-strong);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  box-shadow: var(--shadow-md);
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
  background: var(--success-light);
}

.option-btn.wrong {
  border-color: var(--error);
  background: var(--error-light);
}

.option-marker {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--color-gray-500);
  background: var(--background);
  flex-shrink: 0;
  transition: all 0.2s;
}

.option-btn.selected .option-marker {
  background-color: var(--primary);
  border-color: var(--primary);
  box-shadow: inset 0 0 0 3px #fff;
}

.option-btn.correct .option-marker {
  background-color: var(--success);
  border-color: var(--success);
  box-shadow: inset 0 0 0 3px #fff;
}

.option-btn.wrong .option-marker {
  background-color: var(--error);
  border-color: var(--error);
  box-shadow: inset 0 0 0 3px #fff;
}

.option-text {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.answer-section {
  margin-top: var(--spacing-lg);
}

.explanation-section {
  padding: var(--spacing-md);
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}

.explanation-content {
  font-size: var(--font-size-md);
  color: var(--on-surface);
  line-height: 1.6;
}

.check-answer {
  margin-top: var(--spacing-md);
  text-align: center;
}

.check-answer .check-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background);
  color: var(--primary);
  border: var(--primary) 1px solid;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s;
}

.check-answer .check-btn:active {
  transform: scale(0.98);
}
</style>