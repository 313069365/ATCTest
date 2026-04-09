<template>
  <div class="fillin-question">
    <div class="question-stem">
      <h2 class="question-text">{{ question.stem }}</h2>
    </div>

    <div class="answer-input" v-if="mode !== 'review'">
      <input
        type="text"
        class="text-input"
        :class="{
          correct: showAnswer && isCorrect,
          wrong: showAnswer && !isCorrect,
          unknown: showAnswer && !isAutoCheckable
        }"
        :value="userAnswer"
        @input="handleInput"
        :placeholder="placeholder"
        :disabled="disabled || showAnswer"
      />
    </div>

    <div class="correct-answer" v-if="(showAnswer || mode === 'review') && question.answer">
      <span class="label">正确答案：</span>
      <span class="answer">{{ question.answer }}</span>
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

const placeholder = computed(() => props.mode === 'review' ? '' : '请输入答案...')

const isCorrect = computed(() => {
  if (!props.question.answer || !props.userAnswer) return false
  return props.userAnswer.trim() === props.question.answer.trim()
})

const isAutoCheckable = computed(() => {
  // 填空题视为需要人工判断的题型
  return false
})

const handleInput = (e) => {
  if (props.disabled || props.showAnswer) return
  emit('answer', e.target.value)
}
</script>

<style scoped>
.fillin-question {
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

.text-input {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--font-size-lg);
  border: 2px solid var(--border-color-light);
  border-radius: var(--radius-lg);
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: var(--primary);
}

.text-input:disabled {
  background: var(--color-gray-100);
  cursor: not-allowed;
}

.text-input.correct {
  border-color: var(--success);
  background: #e6f4ea;
}

.text-input.wrong {
  border-color: var(--error);
  background: #fce8e6;
}

.text-input.unknown {
  border-color: var(--warning);
  background: #fff9e6;
}

.correct-answer {
  padding: var(--spacing-md);
  background: var(--color-gray-100);
  border-radius: var(--radius-lg);
}

.correct-answer .label {
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
}

.correct-answer .answer {
  font-weight: var(--font-weight-bold);
  color: var(--success);
  margin-left: var(--spacing-sm);
}
</style>
