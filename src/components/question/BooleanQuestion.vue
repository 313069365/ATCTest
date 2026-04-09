<template>
  <div class="boolean-question">
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
</style>