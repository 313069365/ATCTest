<template>
  <div class="question-renderer">
    <component
      :is="rendererComponent"
      v-bind="allProps"
      @answer="handleAnswer"
      @next-question="handleNextQuestion"
      @checkSub="handleCheckSub"
    />
    
    <div class="explanation-section" v-if="showExplanation">
      <div class="explanation-header">
        <span class="material-symbols-outlined">lightbulb</span>
        <span>{{ t('explanation') }}</span>
      </div>
      <div class="explanation-content">
        {{ question?.explanation || t('noExplanation') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/utils/i18n.js'
import SingleChoice from './SingleChoice.vue'
import MultipleChoice from './MultipleChoice.vue'
import BooleanQuestion from './BooleanQuestion.vue'
import FillIn from './FillIn.vue'
import Essay from './Essay.vue'
import Reading from './Reading.vue'

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
    type: [String, Array, Object, Number],
    default: null
  },
  showAnswer: {
    type: [Boolean, Object],
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

const emit = defineEmits(['answer', 'next-question', 'checkSub'])

const componentMap = {
  single: SingleChoice,
  multiple: MultipleChoice,
  boolean: BooleanQuestion,
  fillin: FillIn,
  essay: Essay,
  reading: Reading
}

const allProps = computed(() => ({
  question: props.question,
  mode: props.mode,
  userAnswer: props.userAnswer,
  showAnswer: props.showAnswer,
  disabled: props.disabled,
  showAnswerMode: props.showAnswerMode,
  autoJump: props.autoJump,
  answerChecked: props.answerChecked,
  answerStatus: props.answerStatus
}))

const rendererComponent = computed(() => {
  if (!props.question) return null
  return componentMap[props.question.type] || SingleChoice
})

const showExplanation = computed(() => {
  return props.showAnswer && props.question?.explanation
})

const handleAnswer = (answer) => {
  emit('answer', answer)
}

const handleNextQuestion = () => {
  emit('next-question')
}

const handleCheckSub = (index) => {
  emit('checkSub', index)
}
</script>

<style scoped>
.question-renderer {
  width: 100%;
}

.explanation-section {
  margin-top: var(--spacing-lg);
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
