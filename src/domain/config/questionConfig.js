/**
 * 题目相关常量配置
 * 统一管理所有题型相关的常量
 */

import { getStrategy } from "@/infrastructure/question-types";

// ==================== 练习模式 ====================

export const PRACTICE_MODE = {
  ANSWER: "answer",
  REVIEW: "review",
  EXAM: "exam",
};

// ==================== 答案显示模式 ====================

export const SHOW_ANSWER_MODE = {
  IMMEDIATE: "immediate",
  MANUAL: "manual",
};

// ==================== 题目排序方式 ====================

export const QUESTION_SORT = {
  SEQUENCE: "sequence",
  REVERSE: "reverse",
  SHUFFLE: "shuffle",
};

// ==================== 模式行为配置 ====================

const MODE_BEHAVIOR = {
  answer: {
    checkBtn: (s) => !s.isChecked && s.hasUserAnswer && (s.showAnswerMode === 'manual' || s.needsManualCheck),
    autoCheck: (s) => s.showAnswerMode === 'immediate' && s.canAutoCheck,
    showAnswer: (s) => s.isChecked || s.practiceMode === 'review',
    showExplanation: (s) => s.isChecked || s.practiceMode === 'review',
    inputDisabled: (s) => s.practiceMode === 'review' || s.practiceMode === 'exam' || s.isChecked,
    showInput: (s) => s.practiceMode !== 'review' && s.practiceMode !== 'exam',
  },
  review: {
    checkBtn: () => false,
    autoCheck: () => false,
    showAnswer: () => true,
    showExplanation: () => true,
    inputDisabled: () => true,
    showInput: () => false,
  },
  exam: {
    checkBtn: () => false,
    autoCheck: () => false,
    showAnswer: () => false,
    showExplanation: () => false,
    inputDisabled: () => true,
    showInput: () => false,
  },
};

// ==================== 类型判断 ====================

/**
 * 判断题型是否可自动批改
 * @param {string} questionType - 题型
 * @returns {boolean}
 */
export function canAutoCheck(questionType) {
  const strategy = getStrategy(questionType);
  return strategy ? strategy.capabilities.canAutoCheck : false;
}

/**
 * 判断是否有用户答案
 * @param {any} userAnswer - 用户答案
 * @returns {boolean}
 */
export function hasUserAnswer(userAnswer) {
  try {
    if (userAnswer === null || userAnswer === undefined) return false;

    if (typeof userAnswer === "object") {
      return Object.values(userAnswer).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === "string") return val.trim().length > 0;
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === "number") return val !== null;
        return !!val;
      });
    }

    if (typeof userAnswer === "string") return userAnswer.trim().length > 0;
    if (typeof userAnswer === "number") return userAnswer !== null && userAnswer !== undefined;
    if (Array.isArray(userAnswer)) return userAnswer.length > 0;

    return !!userAnswer;
  } catch {
    return false;
  }
}

// ==================== 显示配置 ====================

/**
 * 获取题目显示配置（统一入口）
 * @param {string} practiceMode - 练习模式
 * @param {string} showAnswerMode - 答案显示模式
 * @param {string} questionType - 题型
 * @param {Object} options - 其他选项
 * @returns {Object} 完整的显示配置
 */
export function getDisplayConfig(practiceMode, showAnswerMode, questionType, options = {}) {
  const {
    hasUserAnswer = false,
    isChecked = false,
  } = options;

  const cap = getStrategy(questionType)?.capabilities || {};
  const behavior = MODE_BEHAVIOR[practiceMode] || MODE_BEHAVIOR.answer;

  const state = {
    practiceMode,
    showAnswerMode,
    canAutoCheck: cap.canAutoCheck,
    needsManualCheck: cap.needsManualCheck,
    hasUserAnswer,
    isChecked,
  };

  return {
    shouldShowMeta: true,
    shouldShowStem: true,
    shouldShowMedia: true,
    shouldShowOptions: behavior.showInput(state),
    isOptionsDisabled: behavior.inputDisabled(state),
    shouldShowInput: behavior.showInput(state),
    isInputDisabled: behavior.inputDisabled(state),
    shouldShowAnswer: behavior.showAnswer(state),
    shouldShowExplanation: behavior.showExplanation(state),
    shouldShowUserAnswer: behavior.showAnswer(state),
    shouldShowCheckBtn: behavior.checkBtn(state),
    shouldAutoCheck: behavior.autoCheck(state),
    isComponentDisabled: behavior.inputDisabled(state),
  };
}

// ==================== 状态判断 ====================

/**
 * 获取答案状态 - 总入口，自动分发到策略
 * @param {Object} question - 题目对象
 * @param {any} userAnswer - 用户答案
 * @returns {string|Object}
 */
export function getAnswerStatus(question, userAnswer) {
  if (!question) return 'unanswered'
  const strategy = getStrategy(question.type)
  if (!strategy) return 'unknown'
  return strategy.checkAnswer(question, userAnswer)
}

// ==================== 统计 ====================

/**
 * 标准化状态
 * @param {string} status - 原始状态
 * @returns {string}
 */
export function normalizeStatus(status) {
  if (!status) return "unanswered";
  if (status === "partial") return "wrong";
  if (status === "unchecked") return "unanswered";
  return status;
}


