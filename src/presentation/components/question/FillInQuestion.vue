<template>
  <div class="fillin-question">
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
    <div class="answer-input" v-if="mode !== 'review'">
      <input
        type="text"
        class="text-input"
        :class="{
          correct: shouldShowAnswer && isCorrect,
          wrong: shouldShowAnswer && !isCorrect,
          unknown: shouldShowAnswer && !isAutoCheckable
        }"
        :value="userAnswer"
        @input="handleInput"
        :placeholder="placeholder"
        :disabled="disabled || shouldShowAnswer"
      />
    </div>

    <!-- 检查答案按钮 -->
    <div v-if="shouldShowCheckBtn" class="check-answer">
      <button class="check-btn" @click="$emit('check')">
        <Icon name="verified-outline" />
        {{ t('checkAnswer') }}
      </button>
    </div>

    <!-- 4. 答案解析区 -->
    <div v-if="(shouldShowAnswer || mode === 'review')" class="answer-section">
      <div class="correct-answer" v-if="question?.answer">
        <span class="label">{{ t('correctAnswer') }}：</span>
        <span class="answer">{{ question.answer }}</span>
      </div>

      <div v-if="showExplanation" class="explanation-section">
        <div v-if="question?.meta?.topic" class="tag-block">
          <span class="tag tag-purple">{{ t('topic') }}</span>
          <span class="tag-text">{{ question.meta.topic }}</span>
        </div>

        <div class="tag-block">
          <span class="tag tag-blue">{{ t('explanation') }}</span>
          <div class="explanation-content">{{ formattedExplanation }}</div>
        </div>

        <div v-if="question?.explanation?.tip" class="tag-block">
          <span class="tag tag-green">{{ t('tip') }}</span>
          <div class="tip-content">{{ question.explanation.tip }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/infrastructure/utils/i18n.js'
import { useQuestionHandler } from '@/application/composables/useQuestionHandler'
import Icon from '@/presentation/components/common/Icon.vue'

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
  const raw = props.question?.explanation
  const explanation = typeof raw === 'string' ? raw : raw?.solution
  if (explanation && explanation.trim()) {
    return explanation
  }
  return t('noExplanation')
})

const placeholder = computed(() => props.mode === 'review' ? '' : '请输入答案...')

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
.fillin-question {
  width: 100%;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.question-type-tag {
  padding: var(--spacing-mn) var(--spacing-sm);
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
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

.answer-input {
  margin-bottom: var(--spacing-md);
}

.text-input {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--font-size-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--background);
}

.text-input:focus {
  outline: none;
  border-color: var(--primary);
}

.text-input.correct {
  border-color: var(--success);
  background: var(--success-light);
}

.text-input.wrong {
  border-color: var(--error);
  background: var(--error-light);
}

.text-input:disabled {
  background: var(--color-gray-100);
  cursor: not-allowed;
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

.correct-answer .label {
  font-weight: var(--font-weight-semibold);
  margin-right: var(--spacing-sm);
}

.correct-answer .answer {
  color: var(--success);
  font-weight: var(--font-weight-medium);
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

.tag-block {
  margin-bottom: var(--spacing-sm);
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  line-height: 1.5;
}

.tag-purple {
  background: var(--tag-purple-bg);
  color: var(--tag-purple-text);
}

.tag-blue {
  background: var(--primary-light);
  color: var(--primary);
}

.tag-green {
  background: var(--tag-green-bg);
  color: var(--tag-green-text);
}

.tag-text {
  margin-left: var(--spacing-sm);
  font-size: var(--font-size-md);
  color: var(--on-surface);
  line-height: 1.6;
}

.explanation-content {
  font-size: var(--font-size-md);
  color: var(--on-surface);
  line-height: 1.6;
}

.tip-content {
  font-size: var(--font-size-md);
  color: var(--on-surface);
  line-height: 1.6;
}

hr {
  margin: var(--spacing-sm) 0;
  border: none;
  border-top: 1px solid var(--border-color);
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