<template>
  <div class="multiple-choice">
    <!-- 1. 题目信息区 -->
    <div class="question-meta">
      <span class="question-type-tag">{{ t(question?.type) }}</span>
      <span class="question-id">{{ t('questionId') }}: {{ question?.id }}</span>
      <button class="fav-btn" :class="{ active: isFavorited }" @click="toggleFavorite">
        <span class="material-symbols-outlined">{{ isFavorited ? 'kid_star' : 'star' }}</span>
      </button>
    </div>

    <!-- 2. 题干区 -->
    <div class="question-stem">
      <h2 class="question-text">{{ question?.stem }}</h2>
    </div>

    <!-- 3. 作答区 -->
    <div class="options">
      <button
        v-for="(option, i) in question?.options"
        :key="i"
        class="option-btn"
        :class="{
          selected: isSelected(i),
          correct: shouldShowAnswer && isCorrectOption(i),
          wrong: shouldShowAnswer && isWrongOption(i),
          review: mode === 'review'
        }"
        @click="handleSelect(i)"
        :disabled="disabled || (shouldShowAnswer && mode !== 'review')"
      >
        <span class="option-marker">{{ String.fromCharCode(65 + i) }}</span>
        <span class="option-text" v-if="option">{{ formatOption(option) }}</span>
      </button>
    </div>

    <div class="answer-tip" v-if="mode === 'answer' && !shouldShowAnswer">
      <span class="tip-text">提示：多选题，可选择多个答案</span>
    </div>

    <!-- 检查答案按钮 -->
    <div v-if="shouldShowCheckBtn" class="check-answer">
      <button class="check-btn" @click="$emit('check')">
        <span class="material-symbols-outlined">verified</span>
        {{ t('checkAnswer') }}
      </button>
    </div>

    <!-- 4. 答案解析区 -->
    <div v-if="shouldShowAnswer" class="answer-section">
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
import { useAppStore } from '@/stores/store'
import { useQuestionHandler } from '@/composables/useQuestionHandler'

const store = useAppStore()

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
  }
})

const emit = defineEmits(['answer', 'check'])

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

// 是否已收藏
const isFavorited = computed(() => {
  if (!props.question) return false
  return store.favorites.some(q => q.id === props.question.id)
})

// 切换收藏
const toggleFavorite = () => {
  if (!props.question) return
  if (isFavorited.value) {
    store.removeFavorite(props.question.id)
  } else {
    store.addFavorite(props.question)
  }
}

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
  if (!props.question?.answer || props.question.answer.length === 0) return false
  
  const currentOption = props.question.options?.[index]
  if (!currentOption) return false
  const currentOptionText = currentOption.replace(/^[A-Z]\.\s*/, '')
  
  const hasCorrect = props.question.answer.some(ans => {
    const correctAnswerText = String(ans).replace(/^[A-Z]\.\s*/, '')
    return currentOptionText === correctAnswerText
  })
  
  if (props.mode === 'review') {
    return hasCorrect
  }
  return shouldShowAnswer.value && hasCorrect
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

  // 自动跳转：答题正确后自动跳下一题（多选需要手动检查，这里延迟检查）
  if (props.autoJump && props.showAnswerMode === 'immediate' && !props.mode?.includes('review')) {
    setTimeout(() => {
      const isCorrect = isCorrectOption(index)
      if (isCorrect) {
        emit('next-question')
      }
    }, 300)
  }
}
</script>

<style scoped>
.multiple-choice {
  width: 100%;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.question-type-tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.question-id {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.fav-btn {
  margin-left: auto;
  padding: var(--spacing-xs);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fav-btn.active {
  color: var(--warning);
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
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--primary);
  color: var(--on-primary);
  border: none;
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