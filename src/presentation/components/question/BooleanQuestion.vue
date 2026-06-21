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
        <Icon name="verified-outline" />
        {{ t('checkAnswer') }}
      </button>
    </div>

    <!-- 4. 答案解析区 -->
    <div v-if="shouldShowAnswer && showExplanation" class="answer-section">
      <div class="explanation-section">
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
  const raw = props.question?.explanation
  const explanation = typeof raw === 'string' ? raw : raw?.solution
  if (explanation && explanation.trim()) {
    return explanation
  }
  return t('noExplanation')
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
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-background);
  border: 1px solid transparent;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: var(--shadow-md);
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

.options {
  display: flex;
  flex-direction: column;
  gap: var(--space-ms);
}

.option-btn {
  display: flex;
  align-items: center;
  gap: var(--space-ms);
  padding: var(--space-md);
  background: var(--color-card);
  border: 1px solid var(--color-border-strong);
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
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px var(--color-primary-bg);
}

.option-btn.correct {
  color: var(--color-success);
  border-color: var(--color-success);
  background: var(--color-success-light);
}

.option-btn.wrong {
  border-color: var(--color-destructive);
  background: var(--color-destructive-light);
}

.option-marker {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--gray-500);
  background: var(--color-background);
  flex-shrink: 0;
  transition: all 0.2s;
}

.option-btn.selected .option-marker {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: inset 0 0 0 3px var(--color-primary-foreground);
}

.option-btn.correct .option-marker {
  background-color: var(--color-success);
  border-color: var(--color-success);
  box-shadow: inset 0 0 0 3px var(--color-primary-foreground);
}

.option-btn.wrong .option-marker {
  background-color: var(--color-destructive);
  border-color: var(--color-destructive);
  box-shadow: inset 0 0 0 3px var(--color-primary-foreground);
}

.option-text {
  flex: 1;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.answer-section {
  margin-top: var(--space-lg);
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
  padding: var(--space-sm) var(--space-md);
  background: var(--color-background);
  color: var(--color-primary);
  border: var(--color-primary) 1px solid;
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