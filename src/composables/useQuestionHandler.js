/**
 * 题型处理 Composable
 * 统一入口，自动分配处理函数
 *
 * @example
 * import { useQuestionHandler } from '@/composables/useQuestionHandler'
 * const { answerState, displayConfig, shouldAutoCheck } = useQuestionHandler(options)
 *
 * @typedef {Object} QuestionHandlerOptions
 * @property {string|ref} [options.practiceMode] - 练习模式: 'answer' | 'review' | 'practice' | 'exam'
 * @property {string|ref} [options.showAnswerMode] - 答案显示模式: 'immediate' | 'manual'
 * @property {Object|ref} [options.question] - 题目对象
 * @property {any|ref} [options.userAnswer] - 用户答案
 * @property {boolean|ref} [options.isChecked] - 是否已检查
 */

import { computed } from "vue";
import {
  isComplexQuestion,
  isComplexType,
  canAutoCheck as checkAutoCheck,
  needsManualCheck as checkManualCheck,
  getAnswerStatus,
  normalizeStatus as normalizeStatusFn,
  getDisplayConfig,
  AUTO_CHECK_TYPES,
  MANUAL_CHECK_TYPES,
} from "@/utils/questionHandlers";

export {
  isComplexQuestion,
  isComplexType,
  getAnswerStatus,
  getDisplayConfig,
  AUTO_CHECK_TYPES,
  MANUAL_CHECK_TYPES,
};

export const ANSWER_STATUS = {
  CORRECT: "correct",
  WRONG: "wrong",
  PARTIAL: "partial",
  UNCHECKED: "unchecked",
  UNANSWERED: "unanswered",
  UNKNOWN: "unknown",
};

export const PRACTICE_MODE = {
  ANSWER: "answer",
  REVIEW: "review",
  EXAM: "exam",
};

export const SHOW_ANSWER_MODE = {
  IMMEDIATE: "immediate",
  MANUAL: "manual",
};

export function isCompositeType(questionType) {
  return questionType === "reading";
}

export function normalizeStatus(status) {
  return normalizeStatusFn(status);
}

export const canAutoCheck = checkAutoCheck;

/**
 * 创建题型处理 hook
 * @param {Object} options 配置选项
 * @returns {Object}
 */
export function useQuestionHandler(options) {
  const practiceMode = computed(
    () => options.practiceMode?.value || options.practiceMode || "answer",
  );
  const showAnswerMode = computed(() => {
    const val = options.showAnswerMode?.value ?? options.showAnswerMode;
    return val || "manual";
  });
  const question = computed(
    () => options.question?.value || options.question || null,
  );
  const userAnswer = computed(() => {
    const val = options.userAnswer;
    if (typeof val === "function") return val();
    return val?.value ?? val ?? null;
  });
  const isChecked = computed(() => {
    const val = options.isChecked;
    if (typeof val === "function") return val();
    return val?.value ?? val ?? false;
  });

  const isReviewMode = computed(
    () => practiceMode.value === PRACTICE_MODE.REVIEW,
  );
  const isExamMode = computed(
    () => practiceMode.value === PRACTICE_MODE.EXAM,
  );
  const isAnswerMode = computed(
    () => practiceMode.value === PRACTICE_MODE.ANSWER,
  );
  const isImmediateMode = computed(
    () => showAnswerMode.value === SHOW_ANSWER_MODE.IMMEDIATE,
  );
  const isComplex = computed(() => isComplexQuestion(question.value));

  const hasUserAnswer = computed(() => {
    try {
      const answer = userAnswer.value;
      if (answer === null || answer === undefined) return false;

      if (typeof answer === "object") {
        return Object.values(answer).some((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === "string") return val.trim().length > 0;
          if (Array.isArray(val)) return val.length > 0;
          if (typeof val === "number") return val !== null;
          return !!val;
        });
      }

      if (typeof answer === "string") return answer.trim().length > 0;
      if (typeof answer === "number") return answer !== null && answer !== undefined;
      if (Array.isArray(answer)) return answer.length > 0;

      return !!answer;
    } catch {
      return false;
    }
  });

  const answerState = computed(() => {
    try {
      const q = question.value;
      const ans = userAnswer.value;
      if (!q) return "unanswered";
      return getAnswerStatus(q, ans);
    } catch {
      return "unknown";
    }
  });

  const shouldShowCheckBtn = computed(() => {
    if (isReviewMode.value) return false;
    if (isExamMode.value) return false;
    if (!hasUserAnswer.value) return false;
    if (isChecked.value) return false;

    const q = question.value;
    if (!q) return false;

    const qType = q.type;

    if (isImmediateMode.value) {
      return false;
    }

    return true;
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

  const shouldShowAnswer = computed(() => {
    if (practiceMode.value === "exam") return false;
    return isReviewMode.value || isChecked.value === true;
  });
  const shouldShowExplanation = computed(
    () => isReviewMode.value || isChecked.value === true,
  );
  const isOptionsDisabled = computed(
    () => isReviewMode.value || isExamMode.value || isChecked.value === true,
  );
  const shouldShowInput = computed(
    () => !isReviewMode.value && !isExamMode.value,
  );
  const isComponentDisabled = computed(
    () => isReviewMode.value || isExamMode.value,
  );

  const shouldAutoCheck = computed(() => {
    if (isReviewMode.value) return false;
    if (!isImmediateMode.value) return false;

    const q = question.value;
    if (!q) return false;

    if (q.type === "reading" && q.subs?.length > 0) {
      return canAutoCheck(q.subs[0].type);
    }

    return canAutoCheck(q.type);
  });

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

  const resetAnswer = () => {
    return null;
  };

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
    normalizeStatus,
    ANSWER_STATUS,
    PRACTICE_MODE,
    SHOW_ANSWER_MODE,
  };
}
