<template>
  <div class="single-choice">
    <!-- 1. 题目信息区 -->
    <div class="question-meta">
      <span class="question-type-tag">{{ t(question?.type) }}</span>
      <span class="question-id">{{ t('questionId') }}: {{ question?.id }}</span>
      <button class="fav-btn" :class="{ active: isFavorited }" @click="toggleFavorite">
        <span class="material-symbols-outlined">kid_star</span>
      </button>
    </div>

    <!-- 2. 题干区 -->
    <div class="question-stem">
      <h2 class="question-text">{{ question?.stem }}</h2>
    </div>

    <!-- 3. 作答区 -->
    <div class="options">
      <button v-for="(option, i) in question?.options" :key="i" class="option-btn" :class="{
        selected: isSelected(i),
        correct: showAnswer && isCorrectOption(i),
        wrong: showAnswer && isWrongOption(i),
        review: mode === 'review'
      }" @click="handleSelect(i)" :disabled="disabled || (showAnswer && mode !== 'review')">
        <span class="option-marker">{{ String.fromCharCode(65 + i) }}</span>
        <span class="option-text" v-if="option">{{ formatOption(option) }}</span>
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
    <div v-if="showAnswer" class="answer-section">
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

// 是否需要显示检查按钮
const shouldShowCheckBtn = computed(() => {
  if (props.mode === 'review') return false
  if (!props.question) return false
  if (props.showAnswer) return false

  const hasAnswer = props.userAnswer !== null && props.userAnswer !== undefined
  if (!hasAnswer) return false

  if (props.showAnswerMode !== 'immediate') return true

  const type = props.question.type
  return ['multiple', 'fillin', 'essay'].includes(type)
})

// 格式化解析内容
const formattedExplanation = computed(() => {
  const explanation = props.question?.explanation
  if (explanation && explanation.trim()) {
    return explanation
  }
  return '暂无'
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
  const currentOption = props.question.options?.[index]
  if (!currentOption) return false
  const currentOptionText = currentOption.replace(/^[A-Z]\.\s*/, '')
  const correctAnswerText = answerStr.replace(/^[A-Z]\.\s*/, '')
  const isCorrect = currentOptionText === correctAnswerText

  if (props.mode === 'review') {
    return isCorrect
  }
  return props.showAnswer && isCorrect
}

const isWrongOption = (index) => {
  if (props.mode === 'review') return false
  if (!isSelected(index)) return false
  return !isCorrectOption(index)
}

const formatOption = (option) => {
  return option.replace(/^[A-Z]\.\s*/, '')
}

// 直接比较答案是否正确（不依赖 showAnswer 状态）
const checkIsCorrect = (index) => {
  if (!props.question?.answer || !props.question.answer[0]) return false
  const answerStr = props.question.answer[0]
  const currentOption = props.question.options?.[index]
  if (!currentOption) return false
  const currentOptionText = currentOption.replace(/^[A-Z]\.\s*/, '')
  const correctAnswerText = answerStr.replace(/^[A-Z]\.\s*/, '')
  return currentOptionText === correctAnswerText
}

const handleSelect = (index) => {
  if (props.disabled || props.showAnswer) return
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
.single-choice {
  width: 100%;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: #fff;
  border: 1px solid transparent;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
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

.fav-btn.active .material-symbols-outlined {
  font-variation-settings: 'FILL' 1;
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
  padding: var(--spacing-md);
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
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.08);
}

.option-btn.correct {
  color: var(--success);
  border-color: var(--success);
  background: #e6f4ea;
}

.option-btn.wrong {
  color: var(--error);
  border-color: var(--error);
  background: #fce8e6;
}

.option-marker {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-full);
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

.answer-section {
  margin-top: var(--spacing-md);
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