/**
 * 答案显示逻辑工具
 * 根据练习模式和答案显示模式，处理答案的显示状态
 *
 * 使用方式：
 * import { useAnswerDisplay, ANSWER_STATUS, canAutoCheck } from '@/composables/useAnswerDisplay'
 */

import { computed } from "vue";

/**
 * 答案状态枚举
 */
export const ANSWER_STATUS = {
  CORRECT: "correct", // 正确
  WRONG: "wrong", // 错误
  PARTIAL: "partial", // 部分正确
  UNCHECKED: "unchecked", // 已答未检查
  UNANSWERED: "unanswered", // 未答
  UNKNOWN: "unknown", // 待定（无法自动批改）
};

/**
 * 练习模式
 */
export const PRACTICE_MODE = {
  ANSWER: "answer", // 答题
  REVIEW: "review", // 背题
};

/**
 * 答案显示模式
 */
export const SHOW_ANSWER_MODE = {
  IMMEDIATE: "immediate", // 立即显示
  MANUAL: "manual", // 按需显示
};

/**
 * 可自动批改的题型
 */
const AUTO_CHECK_TYPES = ["single", "boolean", "media"];

/**
 * 需要手动检查的题型
 */
const MANUAL_CHECK_TYPES = ["multiple", "fillin", "essay", "translation", "reading"];

/**
 * 复合题型列表（包含子题）
 */
const COMPOSITE_TYPES = ["reading"];

/**
 * 判断题型是否可自动批改
 * @param {string} questionType - 题目类型
 * @returns {boolean}
 */
export function canAutoCheck(questionType) {
  return AUTO_CHECK_TYPES.includes(questionType);
}

/**
 * 判断题型是否需要手动检查（需要点击检查按钮）
 * @param {string} questionType - 题目类型
 * @returns {boolean}
 */
export function needsManualCheck(questionType) {
  return MANUAL_CHECK_TYPES.includes(questionType);
}

/**
 * 判断是否为复合题型（包含子题）
 * @param {string} questionType - 题目类型
 * @returns {boolean}
 */
export function isCompositeType(questionType) {
  return COMPOSITE_TYPES.includes(questionType);
}

/**
 * 判断是否为简单题型（不含子题）
 * @param {string} questionType - 题目类型
 * @returns {boolean}
 */
export function isSimpleType(questionType) {
  return !isCompositeType(questionType);
}

/**
 * 创建答案显示逻辑 hook
 * @param {Object} options 配置选项
 * @param {string|ref} options.practiceMode - 练习模式: 'answer' | 'review'
 * @param {string|ref} options.showAnswerMode - 答案显示模式: 'immediate' | 'manual'
 * @param {Object|ref} options.question - 题目对象
 * @param {any|ref} options.userAnswer - 用户答案
 * @param {boolean|ref} options.isChecked - 是否已检查
 * @returns {Object}
 */
export function useAnswerDisplay(options) {
  const practiceMode = computed(
    () => options.practiceMode?.value || options.practiceMode || "answer",
  );
  const showAnswerMode = computed(
    () => options.showAnswerMode?.value || options.showAnswerMode || "manual",
  );
  const question = computed(
    () => options.question?.value || options.question || null,
  );
  const userAnswer = computed(
    () => options.userAnswer?.value || options.userAnswer || null,
  );
  const isChecked = computed(
    () => options.isChecked?.value || options.isChecked || false,
  );

  /**
   * 是否是背题模式
   */
  const isReviewMode = computed(
    () => practiceMode.value === PRACTICE_MODE.REVIEW,
  );

  /**
   * 是否是立即显示模式
   */
  const isImmediateMode = computed(
    () => showAnswerMode.value === SHOW_ANSWER_MODE.IMMEDIATE,
  );

  /**
   * 是否有用户答案
   */
  const hasUserAnswer = computed(() => {
    const answer = userAnswer.value;
    if (answer === null || answer === undefined) return false;

    // 阅读理解（对象格式）
    if (typeof answer === "object") {
      return Object.values(answer).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === "string") return val.trim().length > 0;
        if (Array.isArray(val)) return val.length > 0;
        return !!val;
      });
    }

    // 字符串
    if (typeof answer === "string") return answer.trim().length > 0;
    // 数字
    if (typeof answer === "number") return true;
    // 数组
    if (Array.isArray(answer)) return answer.length > 0;

    return !!answer;
  });

  /**
   * 是否应该显示答案（对错）
   * - 背题模式：始终显示
   * - 答题模式：已检查时显示
   */
  const shouldShowAnswer = computed(() => {
    if (isReviewMode.value) return true;
    return isChecked.value === true;
  });

  /**
   * 是否应该显示解析
   * - 背题模式：始终显示
   * - 答题模式：已检查时显示
   */
  const shouldShowExplanation = computed(() => {
    if (isReviewMode.value) return true;
    return isChecked.value === true;
  });

  /**
   * 是否禁用选项交互
   * - 背题模式：始终禁用
   * - 答题模式：已检查时禁用
   */
  const isOptionsDisabled = computed(() => {
    if (isReviewMode.value) return true;
    return isChecked.value === true;
  });

  /**
   * 是否显示输入框（填空/简答等）
   * - 背题模式：不显示
   * - 答题模式：显示
   */
  const shouldShowInput = computed(() => {
    return !isReviewMode.value;
  });

  /**
   * 是否显示检查按钮
   * - 背题模式：不显示
   * - 答题+立即模式：reading 根据子题类型判断，其他不支持的显示
   * - 答题+按需模式：有用户答案且未检查时显示
   */
  const shouldShowCheckBtn = computed(() => {
    // 背题模式不显示检查按钮
    if (isReviewMode.value) return false;

    // 没有用户答案不显示
    if (!hasUserAnswer.value) return false;

    // 已检查不显示
    if (isChecked.value === true) return false;

    const q = question.value;
    if (!q) return false;

    // 立即显示模式
    if (isImmediateMode.value) {
      // reading 题型：根据子题类型判断
      if (q.type === 'reading' && q.subs && q.subs.length > 0) {
        const subType = q.subs[0].type;
        return needsManualCheck(subType);
      }
      // 其他题型：立即显示模式不显示检查按钮
      return false;
    }

    // 按需显示模式：题型需要手动检查则显示
    if (needsManualCheck(q.type)) return true;

    return true;
  });

  /**
   * 是否禁用组件（背题模式禁用全部）
   */
  const isComponentDisabled = computed(() => {
    return isReviewMode.value;
  });

  /**
   * 获取答题卡状态
   * @param {any} answerStatus - 答案状态（外部传入）
   * @param {boolean} isCurrent - 是否是当前题目
   * @returns {string} 状态字符串
   */
  const getAnswerCardStatus = (answerStatus, isCurrent = false) => {
    // 当前题目始终显示蓝色
    if (isCurrent) return "current";

    // 背题模式：不显示对错状态
    if (isReviewMode.value) return "";

    // 优先使用传入的状态（正确/错误/partial），忽略 isChecked 检查
    if (answerStatus && typeof answerStatus === "string") {
      return answerStatus;
    }

    // 如果没有用户答案
    if (!hasUserAnswer.value) return "";

    // 未检查状态
    if (isChecked.value !== true) {
      // 立即显示模式下
      if (isImmediateMode.value) {
        const q = question.value;
        if (q) {
          // reading 题型：根据子题类型判断
          if (q.type === 'reading' && q.subs && q.subs.length > 0) {
            const subType = q.subs[0].type;
            if (canAutoCheck(subType)) {
              return ANSWER_STATUS.UNKNOWN;
            }
          } else if (canAutoCheck(q.type)) {
            return ANSWER_STATUS.UNKNOWN;
          }
        }
      }
      return ANSWER_STATUS.UNCHECKED;
    }

    return answerStatus || "";
  };

  /**
   * 是否需要在答题后自动检查（立即显示模式）
   * 用于 handleAnswer 中判断是否立即调用 checkAnswer
   */
  const shouldAutoCheck = computed(() => {
    if (isReviewMode.value) return false;
    if (!isImmediateMode.value) return false;

    const q = question.value;
    if (!q) return false;

    // reading 题型：根据子题类型判断
    if (q.type === 'reading' && q.subs && q.subs.length > 0) {
      const subType = q.subs[0].type;
      return canAutoCheck(subType);
    }

    return canAutoCheck(q.type);
  });

  return {
    // 状态
    isReviewMode,
    isImmediateMode,
    hasUserAnswer,
    // 显示控制
    shouldShowAnswer,
    shouldShowExplanation,
    isOptionsDisabled,
    shouldShowInput,
    shouldShowCheckBtn,
    isComponentDisabled,
    // 答题卡
    getAnswerCardStatus,
    // 自动检查
    shouldAutoCheck,
  };
}
