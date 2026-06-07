<template>
  <component :is="rendererComponent" v-bind="$props" @answer="handleAnswer" @next-question="handleNextQuestion"
    @checkSub="handleCheckSub" @check="handleCheck" @toggle-mark="handleToggleMark" @goSub="handleGoSub" />
</template>

<script setup>
import { computed } from 'vue'
import SingleChoiceQuestion from './SingleChoiceQuestion.vue'
import MultipleChoiceQuestion from './MultipleChoiceQuestion.vue'
import BooleanQuestion from './BooleanQuestion.vue'
import FillInQuestion from './FillInQuestion.vue'
import EssayQuestion from './EssayQuestion.vue'
import ReadingQuestion from './ReadingQuestion.vue'

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
  showExplanation: {
    type: Boolean,
    default: true
  },
  currentSubIndex: {
    type: Number,
    default: 0
  },
  isMarked: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['answer', 'next-question', 'checkSub', 'check', 'toggle-mark', 'goSub'])

const componentMap = {
  single: SingleChoiceQuestion,
  multiple: MultipleChoiceQuestion,
  boolean: BooleanQuestion,
  fillin: FillInQuestion,
  essay: EssayQuestion,
  reading: ReadingQuestion
}

const rendererComponent = computed(() => {
  if (!props.question) return SingleChoiceQuestion
  return componentMap[props.question.type] || SingleChoiceQuestion
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

const handleCheck = () => {
  emit('check')
}

const handleToggleMark = () => {
  emit('toggle-mark')
}

const handleGoSub = (index) => {
  emit('goSub', index)
}
</script>