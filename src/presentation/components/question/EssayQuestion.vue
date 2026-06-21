<template>
  <div class="essay-question">
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
        <Icon name="verified-outline" />
        {{ t('checkAnswer') }}
      </button>
    </div>

    <!-- 4. 答案解析区 -->
    <div v-if="(shouldShowAnswer || mode === 'review')" class="answer-section">
      <div class="correct-answer" v-if="question?.answer">
        <div class="answer-header">
          <Icon name="check-circle-outline" />
          <span>{{ t('correctAnswer') }}</span>
        </div>
        <div class="answer-content">{{ question.answer }}</div>
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
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.question-type-tag {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.question-id {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.question-difficulty {
  margin-left: auto;
  padding: var(--space-xs) var(--space-sm);
  background: var(--gray-100);
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}


.question-stem {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-background);
  border: 1px solid transparent;
  margin-bottom: var(--space-md);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.question-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  line-height: var(--line-height-relaxed);
}

.answer-input {
  margin-bottom: var(--space-md);
}

.textarea-input {
  width: 100%;
  padding: var(--space-md);
  font-size: var(--font-size-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background);
  resize: vertical;
  font-family: inherit;
}

.textarea-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.textarea-input:disabled {
  background: var(--gray-100);
  cursor: not-allowed;
}

.answer-tip {
  padding: var(--space-sm);
  background: var(--gray-100);
  border-radius: var(--radius-md);
}

.tip-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.answer-section {
  margin-top: var(--space-lg);
}

.correct-answer {
  padding: var(--space-md);
  background: var(--gray-100);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.answer-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  color: var(--color-success);
  font-weight: var(--font-weight-semibold);
}

.answer-content {
  font-size: var(--font-size-md);
  color: var(--color-text);
  line-height: var(--line-height-relaxed);
}

.explanation-section {
  padding: var(--space-md);
  background: var(--gray-100);
  border-radius: var(--radius-md);
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.tag-block {
  margin-bottom: var(--space-sm);
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: 1.5;
}

.tag-purple {
  background: var(--color-tag-purple);
  color: var(--color-tag-purple-foreground);
}

.tag-blue {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.tag-green {
  background: var(--color-tag-green);
  color: var(--color-tag-green-foreground);
}

.tag-text {
  margin-left: var(--space-sm);
  font-size: var(--font-size-md);
  color: var(--color-text);
  line-height: var(--line-height-relaxed);
}

.explanation-content {
  font-size: var(--font-size-md);
  color: var(--color-text);
  line-height: var(--line-height-relaxed);
}

.tip-content {
  font-size: var(--font-size-md);
  color: var(--color-text);
  line-height: var(--line-height-relaxed);
}

hr {
  margin: var(--space-sm) 0;
  border: none;
  border-top: 1px solid var(--color-border);
}

.check-answer {
  margin-top: var(--space-md);
  text-align: center;
}

.check-answer .check-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
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