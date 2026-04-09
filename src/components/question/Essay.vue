<template>
  <div class="essay-question">
    <div class="question-stem">
      <h2 class="question-text">{{ question.stem }}</h2>
    </div>

    <div class="answer-input" v-if="mode !== 'review'">
      <textarea
        class="textarea-input"
        :class="{
          correct: showAnswer && isCorrect,
          wrong: showAnswer && !isCorrect,
          unknown: showAnswer && !isAutoCheckable
        }"
        :value="userAnswer"
        @input="handleInput"
        :placeholder="placeholder"
        :disabled="disabled || showAnswer"
        rows="6"
      />
    </div>

    <div class="answer-tip" v-if="mode === 'answer' && !showAnswer">
      <span class="tip-text">提示：简答题需要人工批改，请输入您的答案</span>
    </div>

    <div class="correct-answer" v-if="(showAnswer || mode === 'review') && question.answer">
      <div class="answer-header">
        <span class="material-symbols-outlined">check_circle</span>
        <span>参考答案</span>
      </div>
      <div class="answer-content">{{ question.answer }}</div>
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
  }
})

const emit = defineEmits(['answer'])

const placeholder = computed(() => props.mode === 'review' ? '' : '请输入您的答案...')

const isCorrect = computed(() => {
  if (!props.question.answer || !props.userAnswer) return false
  return props.userAnswer.trim() === props.question.answer.trim()
})

const isAutoCheckable = computed(() => {
  // 简答题视为需要人工判断的题型
  return false
})

const handleInput = (e) => {
  if (props.disabled || props.showAnswer) return
  emit('answer', e.target.value)
}
</script>

<style scoped>
.essay-question {
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

.answer-input {
  margin-bottom: var(--spacing-md);
}

.textarea-input {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--font-size-lg);
  border: 2px solid var(--border-color-light);
  border-radius: var(--radius-lg);
  background: #fff;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.textarea-input:focus {
  border-color: var(--primary);
}

.textarea-input:disabled {
  background: var(--color-gray-100);
  cursor: not-allowed;
  opacity: 0.7;
}

.textarea-input.correct {
  border-color: var(--success);
  background: #e6f4ea;
}

.textarea-input.wrong {
  border-color: var(--error);
  background: #fce8e6;
}

.textarea-input.unknown {
  border-color: var(--warning);
  background: #fff9e6;
}

.answer-tip {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
}

.tip-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.correct-answer {
  padding: var(--spacing-md);
  background: var(--color-gray-100);
  border-radius: var(--radius-lg);
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
  color: var(--on-surface);
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
