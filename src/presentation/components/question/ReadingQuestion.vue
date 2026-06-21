<template>
  <div class="reading-question">

    <SegmentedControl v-if="question.attachments?.article" v-model="activeTab" :options="articleTabOptions" variant="primary" />

    <template v-if="activeTab === 'question'">
      <div class="sub-question-section" v-if="question.subs && question.subs.length > 0">
        <QuestionRenderer v-if="wrappedSub" :question="wrappedSub"
          :user-answer="props.userAnswer?.[currentSubIndex]" :mode="mode" :show-answer="currentSubShowAnswer"
          :show-answer-mode="showAnswerMode" :show-explanation="showExplanation" :disabled="isSubAnswerDisabled"
          @answer="handleSubAnswer" @check="checkSubAnswer(currentSubIndex)" />
      </div>
    </template>

    <template v-if="activeTab === 'article'">
      <div class="reading-content">
        <template v-if="!showTranslation">
          <div class="reading-article">{{ question.attachments.article }}</div>
        </template>
        <template v-else>
          <div class="reading-divider">
            <span class="reading-divider-label">译文</span>
          </div>
          <div class="reading-translation">{{ question.translation.article }}</div>
          <div class="reading-divider with-top">
            <span class="reading-notch"></span>
            <span class="reading-divider-label">原文</span>
            <span class="reading-notch"></span>
          </div>
          <div class="reading-article">{{ question.attachments.article }}</div>
        </template>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { getAnswerStatus } from '@/domain/config/questionConfig'
import { getStrategy } from '@/infrastructure/question-types'
import QuestionRenderer from './QuestionRenderer.vue'
import Icon from '@/presentation/components/common/Icon.vue'
import SegmentedControl from '@/presentation/components/common/SegmentedControl.vue'

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
    type: [String, Array, Object],
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
  currentSubIndex: {
    type: Number,
    default: 0
  },
  showExplanation: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['answer', 'checkSub', 'next-question', 'goSub'])

const showTranslation = inject('showTranslation', ref(false))

const articleTabOptions = [
  { value: 'question', label: '作答区', icon: 'rate-review-outline' },
  { value: 'article', label: '阅读材料', icon: 'menu-book-outline' },
]

const activeTab = ref('question')
const currentSubIndex = ref(0)

watch(() => props.currentSubIndex, (val) => {
  if (val !== currentSubIndex.value) {
    currentSubIndex.value = val
  }
}, { immediate: true })

const subAnswerChecked = ref({})

const derivedChecked = computed(() => {
  const checked = {}
  if (props.mode === 'review') {
    const subs = props.question?.subs || []
    subs.forEach((_, index) => { checked[index] = true })
    return checked
  }
  if (props.showAnswerMode === 'immediate') {
    const answer = props.userAnswer
    if (answer && typeof answer === 'object') {
      Object.keys(answer).forEach(subIndex => {
        const val = answer[subIndex]
        if (val !== null && val !== undefined && val !== '') {
          if (Array.isArray(val) && val.length === 0) return
          checked[subIndex] = true
        }
      })
    }
    return checked
  }
  return checked
})

const isSubAnswerChecked = (index) => {
  return derivedChecked.value[index] === true || subAnswerChecked.value[index] === true
}

const currentSub = computed(() => {
  if (!props.question.subs || props.question.subs.length === 0) return null
  return props.question.subs[currentSubIndex.value]
})

const wrappedSub = computed(() => {
  if (!currentSub.value) return null
  return {
    id: currentSub.value.sid,
    stem: currentSub.value.stem,
    options: currentSub.value.options,
    answer: currentSub.value.answer,
    type: currentSub.value.type,
    difficulty: currentSub.value.difficulty,
    explanation: currentSub.value.explanation,
    translation: currentSub.value.translation,
  }
})

const mode = computed(() => props.mode)

const isSubAnswered = (subIndex) => {
  const answer = props.userAnswer?.[subIndex]
  if (answer === null || answer === undefined) return false
  if (Array.isArray(answer)) return answer.length > 0
  if (typeof answer === 'string') return answer.trim().length > 0
  return !!answer
}

const hasCurrentSubAnswer = computed(() => {
  return isSubAnswered(currentSubIndex.value)
})

const isSubAnswerDisabled = computed(() => {
  if (props.mode === 'review') return true
  return isSubAnswerChecked(currentSubIndex.value)
})

const checkSubIsCorrect = (sub, answer) => {
  if (!sub || answer === null || answer === undefined) return false
  const status = getAnswerStatus(sub, answer)
  return status === 'correct'
}

const handleSubAnswer = (answer) => {
  const newAnswer = { ...(props.userAnswer || {}) }
  newAnswer[currentSubIndex.value] = answer
  emit('answer', newAnswer)

  if (props.mode !== 'review' && props.showAnswerMode === 'immediate') {
    const subType = currentSub.value?.type
    const canImmediateCheck = subType ? getStrategy(subType)?.capabilities.canAutoCheck : false
    if (canImmediateCheck) {
      emit('checkSub', currentSubIndex.value)
      if (props.autoJump) {
        const isCorrect = checkSubIsCorrect(wrappedSub.value, answer)
        if (isCorrect) {
          setTimeout(() => {
            goToNextSubOrNextQuestion()
          }, 500)
        }
      }
    }
  }
}

const goToNextSubOrNextQuestion = () => {
  const subs = props.question?.subs || []
  if (currentSubIndex.value < subs.length - 1) {
    const next = currentSubIndex.value + 1
    currentSubIndex.value = next
    emit('goSub', next)
  } else {
    emit('next-question')
  }
}

const checkSubAnswer = (index) => {
  subAnswerChecked.value[index] = true
  emit('checkSub', index)
}

const currentSubShowAnswer = computed(() => {
  return isSubAnswerChecked(currentSubIndex.value)
})

watch(() => props.question, () => {
  currentSubIndex.value = 0
  activeTab.value = 'question'
  subAnswerChecked.value = {}
  emit('goSub', 0)
})

</script>

<style scoped>
.reading-question {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.reading-content {
  padding: var(--space-md);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  color: var(--color-text);
  line-height: 1.8;
  white-space: pre-wrap;
}

.reading-article {
  white-space: pre-line;
  hyphens: auto;
  overflow-wrap: break-word;
  line-height: 1.8;
  font-size: var(--font-size-lg);
}

.reading-divider {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin: 0 0 var(--space-sm);
}

.reading-divider.with-top {
  margin: var(--space-sm) 0;
}

.reading-notch {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-muted);
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
}

.reading-notch:first-child {
  left: -23px;
}

.reading-notch:last-child {
  right: -23px;
}

.reading-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border-strong);
}

.reading-divider-label {
  font-size: var(--font-size-sm);
  color: var(--color-disabled);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.reading-translation {
  white-space: pre-wrap;
  color: var(--color-text-secondary);
  line-height: 1.8;
  font-size: var(--font-size-lg);
}

.sub-question-section {
  display: flex;
  flex-direction: column;
}

.sub-question-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-md) 0 var(--space-md);
  background: var(--color-background);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.sub-index {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.sub-type-tag {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--gray-100);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.sub-explanation {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--gray-100);
  border-radius: var(--radius-md);
}

.sub-explanation .explanation-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.sub-explanation .explanation-content {
  font-size: var(--font-size-md);
  color: var(--color-text);
  line-height: var(--line-height-relaxed);
}

.sub-check-answer {
  display: flex;
  justify-content: center;
  margin-top: var(--space-md);
}

.sub-check-answer .check-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid var(--gray-500);
  border-radius: var(--radius-full);
  background: var(--color-background);
  color: var(--color-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all 0.2s;
}

.sub-check-answer .check-btn:hover {
  background: var(--gray-100);
}

.sub-check-answer .check-btn:active {
  transform: scale(0.98);
}
</style>
