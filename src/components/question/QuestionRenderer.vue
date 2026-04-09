<template>
  <component
    :is="rendererComponent"
    v-bind="$props"
    @answer="handleAnswer"
    @next-question="handleNextQuestion"
    @checkSub="handleCheckSub"
  />
</template>

<script setup>
import { computed } from 'vue'
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

const rendererComponent = computed(() => {
  if (!props.question) return null
  return componentMap[props.question.type] || SingleChoice
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