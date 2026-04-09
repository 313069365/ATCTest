/**
 * 题型处理 Composable
 * 统一入口，自动分配处理函数
 * 
 * 使用方式：
 * import { useQuestionHandler } from '@/composables/useQuestionHandler'
 * const { answerState, displayConfig, shouldAutoCheck } = useQuestionHandler(options)
 */

import { computed } from 'vue'
import {
  isComplexQuestion,
  isComplexType,
  canAutoCheck as checkAutoCheck,
  needsManualCheck as checkManualCheck,
  getAnswerStatus,
  normalizeStatus as normalizeStatusFn,
  AUTO_CHECK_TYPES,
  MANUAL_CHECK_TYPES
} from '@/utils/questionHandlers'

export { isComplexQuestion, isComplexType, getAnswerStatus, AUTO_CHECK_TYPES, MANUAL_CHECK_TYPES }

export const ANSWER_STATUS = {
  CORRECT: 'correct',
  WRONG: 'wrong',
  PARTIAL: 'partial',
  UNCHECKED: 'unchecked',
  UNANSWERED: 'unanswered',
  UNKNOWN: 'unknown'
}

export const PRACTICE_MODE = {
  ANSWER: 'answer',
  REVIEW: 'review'
}

export const SHOW_ANSWER_MODE = {
  IMMEDIATE: 'immediate',
  MANUAL: 'manual'
}

export function isCompositeType(questionType) {
  return questionType === 'reading'
}

export function normalizeStatus(status) {
  return normalizeStatusFn(status)
}

export const canAutoCheck = checkAutoCheck
export const needsManualCheck = checkManualCheck

/**
 * 创建题型处理 hook
 * @param {Object} options 配置选项
 * @param {string|ref} options.practiceMode - 练习模式: 'answer' | 'review' | 'practice' | 'exam'
 * @param {string|ref} options.showAnswerMode - 答案显示模式: 'immediate' | 'manual'
 * @param {Object|ref} options.question - 题目对象
 * @param {any|ref} options.userAnswer - 用户答案
 * @param {boolean|ref} options.isChecked - 是否已检查
 * @returns {Object}
 */
export function useQuestionHandler(options) {
  const practiceMode = computed(() => options.practiceMode?.value || options.practiceMode || 'answer')
  const showAnswerMode = computed(() => options.showAnswerMode?.value || options.showAnswerMode || 'manual')
  const question = computed(() => options.question?.value || options.question || null)
  const userAnswer = computed(() => options.userAnswer?.value || options.userAnswer || null)
  const isChecked = computed(() => options.isChecked?.value || options.isChecked || false)

  const isReviewMode = computed(() => practiceMode.value === PRACTICE_MODE.REVIEW)
  const isImmediateMode = computed(() => showAnswerMode.value === SHOW_ANSWER_MODE.IMMEDIATE)
  const isComplex = computed(() => isComplexQuestion(question.value))

  const hasUserAnswer = computed(() => {
    const answer = userAnswer.value
    if (answer === null || answer === undefined) return false

    if (typeof answer === 'object') {
      return Object.values(answer).some(val => {
        if (val === null || val === undefined) return false
        if (typeof val === 'string') return val.trim().length > 0
        if (Array.isArray(val)) return val.length > 0
        return !!val
      })
    }

    if (typeof answer === 'string') return answer.trim().length > 0
    if (typeof answer === 'number') return true
    if (Array.isArray(answer)) return answer.length > 0

    return !!answer
  })

  const answerState = computed(() => {
    const q = question.value
    const ans = userAnswer.value
    if (!q) return 'unanswered'
    return getAnswerStatus(q, ans)
  })

  const displayConfig = computed(() => ({
    shouldShowAnswer: isReviewMode.value || isChecked.value,
    shouldShowExplanation: isReviewMode.value || isChecked.value,
    isDisabled: isReviewMode.value || isChecked.value,
    shouldShowInput: !isReviewMode.value,
    shouldShowCheckBtn: computeShouldShowCheckBtn(),
    isComponentDisabled: isReviewMode.value
  }))

  function computeShouldShowCheckBtn() {
    if (isReviewMode.value) return false
    if (!hasUserAnswer.value) return false
    if (isChecked.value) return false

    const q = question.value
    if (!q) return false

    const qType = q.type

    if (isImmediateMode.value) {
      if (qType === 'reading' && q.subs?.length > 0) {
        return needsManualCheck(q.subs[0].type)
      }
      return false
    }

    if (qType === 'reading' && q.subs?.length > 0) {
      return needsManualCheck(q.subs[0].type)
    }

    return needsManualCheck(qType)
  }

  const shouldShowAnswer = computed(() => isReviewMode.value || isChecked.value === true)
  const shouldShowExplanation = computed(() => isReviewMode.value || isChecked.value === true)
  const isOptionsDisabled = computed(() => isReviewMode.value || isChecked.value === true)
  const shouldShowInput = computed(() => !isReviewMode.value)
  const isComponentDisabled = computed(() => isReviewMode.value)

  const shouldAutoCheck = computed(() => {
    if (isReviewMode.value) return false
    if (!isImmediateMode.value) return false

    const q = question.value
    if (!q) return false

    if (q.type === 'reading' && q.subs?.length > 0) {
      return canAutoCheck(q.subs[0].type)
    }

    return canAutoCheck(q.type)
  })

  const getAnswerCardStatus = (answerStatus, isCurrent = false) => {
    if (isCurrent) return 'current'
    if (isReviewMode.value) return ''

    if (answerStatus && typeof answerStatus === 'string') {
      return answerStatus
    }

    if (!hasUserAnswer.value) return ''

    if (isChecked.value !== true) {
      if (isImmediateMode.value) {
        const q = question.value
        if (q) {
          if (q.type === 'reading' && q.subs?.length > 0) {
            if (canAutoCheck(q.subs[0].type)) return ANSWER_STATUS.UNKNOWN
          } else if (canAutoCheck(q.type)) {
            return ANSWER_STATUS.UNKNOWN
          }
        }
      }
      return ANSWER_STATUS.UNCHECKED
    }

    return answerStatus || ''
  }

  const getSubAnswer = (subIndex) => {
    const ans = userAnswer.value
    if (!ans || typeof ans !== 'object') return null
    return ans[subIndex]
  }

  const getSubStatus = (subIndex) => {
    const state = answerState.value
    if (typeof state === 'object' && state !== null) {
      return state[subIndex] || ''
    }
    return ''
  }

  return {
    practiceMode,
    showAnswerMode,
    question,
    userAnswer,
    isChecked,
    isReviewMode,
    isImmediateMode,
    isComplex,
    hasUserAnswer,
    answerState,
    displayConfig,
    shouldShowAnswer,
    shouldShowExplanation,
    isOptionsDisabled,
    shouldShowInput,
    shouldShowCheckBtn: displayConfig.value.shouldShowCheckBtn,
    isComponentDisabled,
    shouldAutoCheck,
    getAnswerCardStatus,
    getSubAnswer,
    getSubStatus,
    isComplexQuestion,
    isComplexType,
    canAutoCheck: checkAutoCheck,
    needsManualCheck: checkManualCheck,
    normalizeStatus,
    AUTO_CHECK_TYPES,
    MANUAL_CHECK_TYPES
  }
}