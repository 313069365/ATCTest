<template>
  <div class="reading-question">

    <div class="sub-question-section" v-if="question.subs && question.subs.length > 0">
      <div class="reading-section" v-if="question.media?.article">
        <div class="reading-header" @click="toggleReading">
          <span class="material-symbols-outlined">description</span>
          <span>{{ t('readingMaterial') || '' }}</span>
          <span class="material-symbols-outlined expand-icon">{{ readingExpanded ? 'expand_less' : 'expand_more'
          }}</span>
        </div>
        <div class="reading-content" v-show="readingExpanded">
          {{ question.media.article }}
          <br>
          {{ question.translation.article }}
        </div>
      </div>

      <component v-if="wrappedSub" :is="componentMap[currentSub?.type] || SingleChoice" :question="wrappedSub"
        :user-answer="props.userAnswer?.[currentSubIndex]" :mode="mode" :show-answer="currentSubShowAnswer"
        :show-answer-mode="showAnswerMode" :disabled="isSubAnswerDisabled" @answer="handleSubAnswer"
        @check="checkSubAnswer(currentSubIndex)" />

    </div>

    <div class="sub-nav" v-if="question.subs && question.subs.length > 1">
      <button v-for="(sub, index) in question.subs" :key="index" class="sub-nav-btn" :class="getSubNavBtnClass(index)"
        @click="goToSub(index)">
        {{ index + 1 }}
      </button>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '@/utils/i18n.js'
import { getStatusClass, getCurrentStatusClass, getAnswerStatus } from '@/utils/questionConfig'
import { useQuestionHandler, canAutoCheck, normalizeStatus } from '@/composables/useQuestionHandler'
import SingleChoice from './SingleChoice.vue'
import MultipleChoice from './MultipleChoice.vue'
import BooleanQuestion from './BooleanQuestion.vue'
import Essay from './Essay.vue'
import FillIn from './FillIn.vue'

const componentMap = {

  single: SingleChoice,
  multiple: MultipleChoice,
  boolean: BooleanQuestion,
  essay: Essay,
  fillin: FillIn
}

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
  answerChecked: {
    type: Object,
    default: () => ({})
  },
  answerStatus: {
    type: Object,
    default: () => ({})
  },
  currentSubIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['answer', 'checkSub', 'next-question'])

const readingExpanded = ref(false)
const currentSubIndex = ref(0)
const subAnswerChecked = ref({})

const isSubAnswerChecked = (index) => {
  if (props.mode === 'review') return true
  return subAnswerChecked.value[index] === true
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
    explanation: currentSub.value.explanation,
    translation: currentSub.value.translation,
  }
})

const {
  practiceMode,
  showAnswerMode,
  hasUserAnswer,
  answerState,
  displayConfig,
  shouldAutoCheck,
  shouldShowCheckBtn,
  getSubAnswer: useGetSubAnswer,
  getSubStatus: useGetSubStatus,
  isComplex
} = useQuestionHandler({
  question: wrappedSub,
  practiceMode: computed(() => props.mode),
  userAnswer: computed(() => props.userAnswer?.[currentSubIndex.value]),
  isChecked: computed(() => isSubAnswerChecked(currentSubIndex.value)),
  showAnswerMode: computed(() => props.showAnswerMode)
})

const mode = computed(() => practiceMode.value)

const isSubAnswered = (subIndex) => {
  const answer = props.userAnswer?.[subIndex]
  if (answer === null || answer === undefined) return false
  if (Array.isArray(answer)) return answer.length > 0
  if (typeof answer === 'string') return answer.trim().length > 0
  return !!answer
}

const getSubAnswer = (subIndex) => {
  return props.userAnswer?.[subIndex]
}

const getSubStatus = (subIndex) => {
  return useGetSubStatus(subIndex)
}

const getSubNavBtnClass = (subIndex) => {
  const isCurrent = currentSubIndex.value === subIndex
  const currentMode = mode.value || 'answer'

  // 当前题目优先返回
  if (isCurrent) {
    return getCurrentStatusClass('', currentMode)
  }

  // 非当前题目
  const status = normalizeStatus(getSubStatus(subIndex))
  const answered = isSubAnswered(subIndex)

  // 已作答但未检查
  if (answered && !status) {
    return 'answered'
  }

  // 使用标准状态类名
  return getStatusClass(status, { isCurrent, mode: currentMode })
}

const hasCurrentSubAnswer = computed(() => {
  return isSubAnswered(currentSubIndex.value)
})

const isSubAnswerDisabled = computed(() => {
  // 背题模式禁用交互，只能浏览
  if (props.mode === 'review') return true
  // 当前子题已检查则禁用
  return isSubAnswerChecked(currentSubIndex.value)
})

const toggleReading = () => {
  readingExpanded.value = !readingExpanded.value
}

const goToSub = (index) => {
  currentSubIndex.value = index
}

// 检查子题答案是否正确（立即模式下使用）
// 使用统一入口函数判断答案正确性
const checkSubIsCorrect = (sub, answer) => {
  if (!sub || answer === null || answer === undefined) return false
  const status = getAnswerStatus(sub, answer)
  return status === 'correct'
}

const handleSubAnswer = (answer) => {
  const newAnswer = { ...(props.userAnswer || {}) }
  newAnswer[currentSubIndex.value] = answer
  emit('answer', newAnswer)

  // 立即显示模式下，使用统一入口判断是否自动检查
  if (mode.value !== 'review' && showAnswerMode.value === 'immediate') {
    const subType = currentSub.value?.type
    const canImmediateCheck = subType ? canAutoCheck(subType) : false
    if (canImmediateCheck) {
      subAnswerChecked.value[currentSubIndex.value] = true

      // 自动跳转下一题（只有答案正确才跳转）
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

// 导航到下一个子题或下一题
const goToNextSubOrNextQuestion = () => {
  const subs = props.question?.subs || []
  if (currentSubIndex.value < subs.length - 1) {
    currentSubIndex.value++
  } else {
    emit('next-question')
  }
}

const checkSubAnswer = (index) => {
  subAnswerChecked.value[index] = true
  // 通知 QuizPage 检查子题答案
  emit('checkSub', index)
}

// 获取当前子题的 showAnswer 状态
const currentSubShowAnswer = computed(() => {
  return isSubAnswerChecked(currentSubIndex.value)
})

watch(() => props.question, () => {
  currentSubIndex.value = 0
  readingExpanded.value = false
  subAnswerChecked.value = {}
})

// 监听 userAnswer 变化，自动推断子题检查状态
watch(() => props.userAnswer, (newAnswer) => {
  if (!newAnswer || typeof newAnswer !== 'object') return
  // 背题模式：所有子题都显示答案
  if (props.mode === 'review') {
    const subs = props.question?.subs || []
    subs.forEach((_, index) => {
      subAnswerChecked.value[index] = true
    })
    return
  }
  // 立即显示模式：有答案的子题视为已检查
  if (props.showAnswerMode === 'immediate') {
    Object.keys(newAnswer).forEach(subIndex => {
      const answer = newAnswer[subIndex]
      if (answer !== null && answer !== undefined && answer !== '') {
        if (Array.isArray(answer) && answer.length === 0) return
        subAnswerChecked.value[subIndex] = true
      }
    })
  }
  // 按需显示模式：不自动标记，等待用户点击检查按钮
}, { immediate: true, deep: true })
</script>

<style scoped>
.reading-question {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.reading-section {
  /* border: 0.5px solid var(--border-color-light); */
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.reading-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background);
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  user-select: none;
}

.reading-header .material-symbols-outlined:first-child {
  font-size: 20px;
}

.expand-icon {
  margin-left: auto;
  font-size: 20px;
}

.reading-content {
  padding: 0 var(--spacing-md) var(--spacing-md);
  background: var(--background);
  color: var(--on-surface);
  line-height: 1.8;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}

.sub-nav {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.sub-nav-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  background: #fff;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.sub-nav-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.sub-nav-btn.current {
  background-color: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.sub-nav-btn.correct {
  background: var(--success);
  border-color: var(--success);
  color: #fff;
}

.sub-nav-btn.wrong {
  background: var(--error);
  border-color: var(--error);
  color: #fff;
}

.sub-nav-btn.unknown {
  background: var(--warning);
  border-color: var(--warning);
  color: #181c1f;
}

.sub-nav-btn.answered:not(.active) {
  background: #e8f5e9;
  border-color: var(--success);
  color: var(--success);
}

.sub-nav-btn.no-answer {
  background: var(--color-gray-200);
  border-color: var(--border-color-light);
  color: var(--text-secondary);
}

.sub-question-section {
  display: flex;
  flex-direction: column;
  /* gap: var(--spacing-md); */
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
  border: 1px solid #c1c6d6;
  border-radius: var(--radius-full);
  background: #fff;
  color: var(--primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all 0.2s;
  gap: var(--spacing-mn);
}

.sub-check-answer .check-btn:hover {
  background: #f1f4f7;
}

.sub-check-answer .check-btn:active {
  transform: scale(0.98);
}
</style>
