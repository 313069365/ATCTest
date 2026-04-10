<template>
  <div class="essay-question">
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
    <div class="answer-input" v-if="mode !== 'review'">
      <textarea
        class="textarea-input"
        :class="{
          correct: shouldShowAnswer && isCorrect,
          wrong: shouldShowAnswer && !isCorrect,
          unknown: shouldShowAnswer && !isAutoCheckable
        }"
        :value="userAnswer"
        @input="handleInput"
        :placeholder="placeholder"
        :disabled="disabled || shouldShowAnswer"
        rows="6"
      />
    </div>

    <div class="answer-tip" v-if="mode === 'answer' && !shouldShowAnswer">
      <span class="tip-text">提示：简答题需要人工批改，请输入您的答案</span>
    </div>

    <!-- 检查答案按钮 -->
    <div v-if="shouldShowCheckBtn" class="check-answer">
      <button class="check-btn" @click="$emit('check')">
        <span class="material-symbols-outlined">verified</span>
        {{ t('checkAnswer') }}
      </button>
    </div>

    <!-- 4. 答案解析区 -->
    <div v-if="(shouldShowAnswer || mode === 'review')" class="answer-section">
      <div class="correct-answer" v-if="question?.answer">
        <div class="answer-header">
          <span class="material-symbols-outlined">check_circle</span>
          <span>{{ t('correctAnswer') }}</span>
        </div>
        <div class="answer-content">{{ question.answer }}</div>
      </div>

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
    type: [String, Array],
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

const placeholder = computed(() => props.mode === 'review' ? '' : '请输入您的答案...')

const isCorrect = computed(() => {
  if (!props.question?.answer || !props.userAnswer) return false
  return props.userAnswer.trim() === props.question.answer.trim()
})

const isAutoCheckable = computed(() => {
  return false
})

const handleInput = (e) => {
  if (props.disabled || shouldShowAnswer.value) return
  emit('answer', e.target.value)
}
</script>

<style scoped>
.essay-question {
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

.answer-input {
  margin-bottom: var(--spacing-md);
}

.textarea-input {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--font-size-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: #fff;
  resize: vertical;
  font-family: inherit;
}

.textarea-input:focus {
  outline: none;
  border-color: var(--primary);
}

.textarea-input:disabled {
  background: var(--color-gray-100);
  cursor: not-allowed;
}

.answer-tip {
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

.correct-answer {
  padding: var(--spacing-md);
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.answer-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--success);
  font-weight: var(--font-weight-semibold);
}

.answer-content {
  font-size: var(--font-size-md);
  color: var(--on-surface);
  line-height: 1.6;
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