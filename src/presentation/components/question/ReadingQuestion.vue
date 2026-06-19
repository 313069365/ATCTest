<template>
  <div class="reading-question">

    <div class="reading-tab-bar" v-if="question.attachments?.article">
      <button class="reading-tab" :class="{ active: activeTab === 'question' }" @click="activeTab = 'question'">
        <Icon name="rate-review-outline" />
        作答区
      </button>
      <button class="reading-tab" :class="{ active: activeTab === 'article' }" @click="activeTab = 'article'">
        <Icon name="menu-book-outline" />
        阅读材料
      </button>
    </div>

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
  gap: var(--spacing-md);
}

.reading-tab-bar {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: var(--color-gray-100);
  border-radius: 12px;
}

.reading-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: transparent;
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.reading-tab svg {
  font-size: 20px;
}

.reading-tab.active {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.reading-content {
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--radius-lg);
  color: var(--on-surface);
  line-height: 1.8;
  white-space: pre-wrap;
}

.reading-article {
  white-space: pre-line;
  hyphens: auto;
  overflow-wrap: break-word;
  line-height: 1.8;
  font-size: 15px;
}

.reading-divider {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0 0 var(--spacing-sm);
}

.reading-divider.with-top {
  margin: var(--spacing-sm) 0;
}

.reading-notch {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--background-secondary);
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
  background: var(--border-color-strong);
}

.reading-divider-label {
  font-size: var(--font-size-sm);
  color: var(--text-disabled);
  font-weight: 500;
  flex-shrink: 0;
}

.reading-translation {
  white-space: pre-wrap;
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 16px;
}

.sub-question-section {
  display: flex;
  flex-direction: column;
}

.sub-question-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-md) 0 var(--spacing-md);
  background: var(--background);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.sub-index {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--primary);
}

.sub-type-tag {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: var(--color-gray-100);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.sub-explanation {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
}

.sub-explanation .explanation-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}

.sub-explanation .explanation-content {
  font-size: var(--font-size-md);
  color: var(--on-surface);
  line-height: 1.6;
}

.sub-check-answer {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.sub-check-answer .check-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--color-gray-500);
  border-radius: var(--radius-full);
  background: var(--background);
  color: var(--primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all 0.2s;
}

.sub-check-answer .check-btn:hover {
  background: var(--color-gray-100);
}

.sub-check-answer .check-btn:active {
  transform: scale(0.98);
}
</style>
