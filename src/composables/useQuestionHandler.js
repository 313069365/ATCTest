/**
 * 题型处理 Composable
 * 统一入口，自动分配处理函数
 *
 * @example
 * import { useQuestionHandler } from '@/composables/useQuestionHandler'
 * const { answerState, displayConfig, shouldAutoCheck } = useQuestionHandler(options)
 */

import { computed, isRef } from "vue";
import {
  isComplexQuestion,
  isComplexType,
  canAutoCheck,
  hasUserAnswer as checkHasUserAnswer,
  getAnswerStatus,
  getDisplayConfig,
  normalizeStatus as normalizeStatusFn,
  PRACTICE_MODE,
  SHOW_ANSWER_MODE,
  ANSWER_STATUS,
} from "@/utils/questionConfig";

export {
  isComplexQuestion,
  isComplexType,
  getAnswerStatus,
  getDisplayConfig,
  PRACTICE_MODE,
  SHOW_ANSWER_MODE,
  ANSWER_STATUS,
  canAutoCheck,
};

export function isCompositeType(questionType) {
  return questionType === "reading";
}

export function normalizeStatus(status) {
  return normalizeStatusFn(status);
}

/**
 * 统一参数提取器
 * 支持 function / Ref / plain value 三种传入方式
 */
function getValue(val) {
  if (typeof val === "function") return val();
  if (isRef(val)) return val.value;
  return val;
}

/**
 * 创建题型处理 hook
 * @param {Object} options 配置选项
 * @returns {Object}
 */
export function useQuestionHandler(options) {
  const practiceMode = computed(
    () => getValue(options.practiceMode) || PRACTICE_MODE.ANSWER,
  );
  const showAnswerMode = computed(
    () => getValue(options.showAnswerMode) || SHOW_ANSWER_MODE.MANUAL,
  );
  const question = computed(() => getValue(options.question) || null);
  const userAnswer = computed(() => getValue(options.userAnswer) ?? null);
  const isChecked = computed(() => getValue(options.isChecked) ?? false);

  const isReviewMode = computed(
    () => practiceMode.value === PRACTICE_MODE.REVIEW,
  );
  const isExamMode = computed(() => practiceMode.value === PRACTICE_MODE.EXAM);
  const isAnswerMode = computed(
    () => practiceMode.value === PRACTICE_MODE.ANSWER,
  );
  const isImmediateMode = computed(
    () => showAnswerMode.value === SHOW_ANSWER_MODE.IMMEDIATE,
  );
  const isComplex = computed(() => isComplexQuestion(question.value));

  const hasUserAnswer = computed(() => checkHasUserAnswer(userAnswer.value));

  const answerState = computed(() => {
    try {
      const q = question.value;
      const ans = userAnswer.value;
      if (!q) return ANSWER_STATUS.UNANSWERED;
      return getAnswerStatus(q, ans);
    } catch {
      return ANSWER_STATUS.UNKNOWN;
    }
  });

  const displayConfig = computed(() => {
    const q = question.value;
    const qType = q?.type || "single";

    const effectiveType = qType === "reading" && q.subs?.length > 0
      ? q.subs[0].type
      : qType;

    return getDisplayConfig(
      practiceMode.value,
      showAnswerMode.value,
      effectiveType,
      {
        hasUserAnswer: hasUserAnswer.value,
        isChecked: isChecked.value,
      }
    );
  });

  const shouldShowAnswer = computed(() => displayConfig.value.shouldShowAnswer);
  const shouldShowExplanation = computed(
    () => displayConfig.value.shouldShowExplanation,
  );
  const isOptionsDisabled = computed(
    () => displayConfig.value.isOptionsDisabled,
  );
  const shouldShowInput = computed(() => displayConfig.value.shouldShowInput);
  const isComponentDisabled = computed(
    () => displayConfig.value.isComponentDisabled,
  );
  const shouldShowCheckBtn = computed(
    () => displayConfig.value.shouldShowCheckBtn,
  );
  const shouldAutoCheck = computed(() => displayConfig.value.shouldAutoCheck);

  const getAnswerCardStatus = (answerStatus, isCurrent = false) => {
    if (isCurrent) return "current";
    if (isReviewMode.value) return "";

    if (answerStatus && typeof answerStatus === "string") {
      return answerStatus;
    }

    if (!hasUserAnswer.value) return "";

    if (isChecked.value !== true) {
      if (isImmediateMode.value) {
        const q = question.value;
        if (q) {
          if (q.type === "reading" && q.subs?.length > 0) {
            if (canAutoCheck(q.subs[0].type)) return ANSWER_STATUS.UNKNOWN;
          } else if (canAutoCheck(q.type)) {
            return ANSWER_STATUS.UNKNOWN;
          }
        }
      }
      return ANSWER_STATUS.UNCHECKED;
    }

    return answerStatus || "";
  };

  const getSubAnswer = (subIndex) => {
    try {
      const ans = userAnswer.value;
      if (!ans || typeof ans !== "object") return null;
      return ans[subIndex];
    } catch {
      return null;
    }
  };

  const getSubStatus = (subIndex) => {
    try {
      const state = answerState.value;
      if (typeof state === "object" && state !== null) {
        return state[subIndex] || "";
      }
      return "";
    } catch {
      return "";
    }
  };

  const handleCheck = () => {
    if (!shouldShowCheckBtn.value) return false;
    return true;
  };

  const resetAnswer = () => null;

  return {
    practiceMode,
    showAnswerMode,
    question,
    userAnswer,
    isChecked,
    isReviewMode,
    isExamMode,
    isAnswerMode,
    isImmediateMode,
    isComplex,
    hasUserAnswer,
    answerState,
    displayConfig,
    shouldShowAnswer,
    shouldShowExplanation,
    isOptionsDisabled,
    shouldShowInput,
    shouldShowCheckBtn,
    isComponentDisabled,
    shouldAutoCheck,
    getAnswerCardStatus,
    getSubAnswer,
    getSubStatus,
    handleCheck,
    resetAnswer,
    isComplexQuestion,
    isComplexType,
    canAutoCheck,
  };
}
