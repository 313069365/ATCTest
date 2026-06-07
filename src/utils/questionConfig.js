/**
 * 题目相关常量配置
 * 统一管理所有题型相关的常量
 */

import { STORAGE_KEY, storage } from "@/composables/useStorage";
import { schemaRead, schemaWrite } from "@/utils/dataSchema";
import { getStrategy } from "@/question-types";

// ==================== 题型类型 ====================

export const QUESTION_TYPES = {
  SINGLE: "single",
  MULTIPLE: "multiple",
  BOOLEAN: "boolean",
  FILLIN: "fillin",
  ESSAY: "essay",
  TRANSLATION: "translation",
  MEDIA: "media",
  READING: "reading",
};

// ==================== 答案状态 ====================

export const ANSWER_STATUS = {
  CORRECT: "correct",
  WRONG: "wrong",
  PARTIAL: "partial",
  UNCHECKED: "unchecked",
  UNANSWERED: "unanswered",
  UNKNOWN: "unknown",
};

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

// ==================== 题型能力配置 ====================

export const QUESTION_CAPABILITIES = {
  single: { canAutoCheck: true, needsManualCheck: false },
  multiple: { canAutoCheck: false, needsManualCheck: true },
  boolean: { canAutoCheck: true, needsManualCheck: false },
  fillin: { canAutoCheck: false, needsManualCheck: true },
  essay: { canAutoCheck: false, needsManualCheck: true },
  translation: { canAutoCheck: false, needsManualCheck: true },
  media: { canAutoCheck: true, needsManualCheck: false },
  reading: { canAutoCheck: false, needsManualCheck: true },
};

// ==================== 从能力配置推导 ====================

export const AUTO_CHECK_TYPES = Object.entries(QUESTION_CAPABILITIES)
  .filter(([_, v]) => v.canAutoCheck)
  .map(([k]) => k);

export const MANUAL_CHECK_TYPES = Object.entries(QUESTION_CAPABILITIES)
  .filter(([_, v]) => v.needsManualCheck)
  .map(([k]) => k);

// ==================== 模式行为配置 ====================

export const MODE_BEHAVIOR = {
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
 * 判断是否复合题型
 * @param {string} type - 题型类型
 * @returns {boolean}
 */
export function isComplexType(type) {
  const strategy = getStrategy(type);
  return strategy ? strategy.capabilities.isComposite : false;
}

/**
 * 判断题目是否为复合题
 * @param {Object} question - 题目对象
 * @returns {boolean}
 */
export function isComplexQuestion(question) {
  return question && isComplexType(question.type);
}

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

/**
 * 判断题型是否需要手动检查
 * @param {string} questionType - 题型
 * @returns {boolean}
 */
export function needsManualCheck(questionType) {
  const strategy = getStrategy(questionType);
  return strategy ? strategy.capabilities.needsManualCheck : true;
}

/**
 * 获取题型显示键名
 * @param {string} type - 题型类型
 * @returns {string}
 */
export function getQuestionTypeKey(type) {
  const map = {
    single: "single",
    multiple: "multiple",
    boolean: "boolean",
    fillin: "fillin",
    essay: "essay",
    reading: "reading",
  };
  return map[type] || type;
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

  const cap = QUESTION_CAPABILITIES[questionType] || {};
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

// ==================== 状态样式映射 ====================

export const STATUS_CLASS_MAP = {
  correct: "correct",
  wrong: "wrong",
  partial: "partial",
  unknown: "unknown",
  unchecked: "unknown",
  unanswered: "unanswered",
  "": "",
};

export const STATUS_COLOR_MAP = {
  correct: "var(--success)",
  wrong: "var(--error)",
  partial: "var(--error)",
  unknown: "var(--warning)",
  unchecked: "var(--color-gray-400)",
  unanswered: "var(--color-gray-400)",
  "": "var(--color-gray-400)",
};

/**
 * 根据状态获取 CSS 类名
 * @param {string} status - 答案状态
 * @param {object} options - 选项
 * @returns {string}
 */
export function getStatusClass(status, options = {}) {
  const { isCurrent = false, mode = "answer" } = options;
  if (mode === "review") return isCurrent ? "current" : "";
  if (!status || status === "unanswered") return isCurrent ? "current" : "";
  const baseClass = STATUS_CLASS_MAP[status] || "";
  if (isCurrent && baseClass) return `current-${baseClass}`;
  return baseClass;
}

/**
 * 获取当前题目的组合类名（带边框）
 * @param {string} status - 答案状态
 * @param {string} mode - 练习模式
 * @returns {string}
 */
export function getCurrentStatusClass(status, mode = "answer") {
  if (mode === "review") return "current";
  if (!status || status === "unanswered") return "current";
  const baseClass = STATUS_CLASS_MAP[status] || "";
  return baseClass ? `current-${baseClass}` : "current";
}

/**
 * 根据状态获取颜色
 * @param {string} status - 答案状态
 * @returns {string}
 */
export function getStatusColor(status) {
  return STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP[""];
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

// ==================== 数据打包/解包 ====================

/**
 * 打包进度数据 - 总入口，自动分发到策略
 * @param {Array} questions - 题目数组
 * @param {Object} userAnswers - 用户答案
 * @param {Object} answerChecked - 检查状态
 * @param {Object} answerStatus - 答案状态
 * @returns {Object}
 */
export function packProgress(
  questions,
  userAnswers,
  answerChecked,
  answerStatus,
) {
  const result = {};
  questions.forEach((q) => {
    const strategy = getStrategy(q.type);
    result[q.id] = strategy?.pack
      ? strategy.pack(q.id, userAnswers?.[q.id], answerChecked?.[q.id], answerStatus?.[q.id], q)
      : { selected: userAnswers?.[q.id], checked: answerChecked?.[q.id] || false, status: answerStatus?.[q.id] || 'unanswered' };
  });
  return result;
}

/**
 * 解包进度数据
 * @param {Object} packedAnswers - 打包后的数据
 * @returns {Object}
 */
export function unpackProgress(packedAnswers) {
  const userAnswers = {};
  const answerChecked = {};
  const answerStatus = {};

  if (packedAnswers) {
    Object.entries(packedAnswers).forEach(([qId, data]) => {
      userAnswers[qId] = data?.selected;
      answerChecked[qId] = data?.checked;
      answerStatus[qId] = data?.status;
    });
  }

  return { userAnswers, answerChecked, answerStatus };
}

// ==================== 进度存储 ====================

/**
 * 生成练习进度的唯一 key
 * @param {Object} config - 配置（含 bank.category/scope/subject）
 * @returns {string}
 */
export function getPracticeKey(config) {
  const bank = config?.bank || config || {};
  return `${bank.category || ''}_${bank.scope || ''}_${bank.subject || ''}`;
}

/**
 * 保存练习进度（按科目存入 map）
 * @param {Object} config - 配置
 * @param {number} currentIndex - 当前题目索引
 * @param {number} currentSubIndex - 当前子题索引
 * @param {Array} questions - 题目数组
 * @param {Object} userAnswers - 用户答案
 * @param {Object} answerChecked - 检查状态
 * @param {Object} answerStatus - 答案状态
 * @param {number} elapsedSeconds - 已用时间
 */
export function savePracticeProgress(
  config,
  currentIndex,
  currentSubIndex,
  questions,
  userAnswers,
  answerChecked,
  answerStatus,
  elapsedSeconds,
  shuffleSeed,
) {
  const answers = packProgress(
    questions,
    userAnswers,
    answerChecked,
    answerStatus,
  );

  const key = getPracticeKey(config);
  const map = schemaRead(STORAGE_KEY.PRACTICE_PROGRESS) || {};

  map[key] = {
    config: { ...config, shuffleSeed },
    progress: {
      currentIndex,
      currentSubIndex,
      questionIds: questions.map((q) => q.id),
      answers,
    },
    meta: {
      timestamp: Date.now(),
      elapsedSeconds,
    },
  };

  schemaWrite(STORAGE_KEY.PRACTICE_PROGRESS, map);
}

/**
 * 加载练习进度 map
 * @returns {Object} 以 key 为键的进度 map
 */
export function loadPracticeProgress() {
  const data = schemaRead(STORAGE_KEY.PRACTICE_PROGRESS);

  if (!data) return {};

  if (data.config) {
    const key = getPracticeKey(data.config);
    const map = { [key]: data };
    schemaWrite(STORAGE_KEY.PRACTICE_PROGRESS, map);
    return map;
  }

  return data;
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

/**
 * 计算总题数（展开复合题）
 * @param {Array} questions - 题目数组
 * @returns {number}
 */
export function countQuestions(questions) {
  if (!Array.isArray(questions)) return 0;
  return questions.reduce((total, q) => {
    const strategy = getStrategy(q.type);
    return total + (strategy?.capabilities.isComposite ? (q.subs?.length || 0) : 1);
  }, 0);
}

/**
 * 批量统计 - 总入口
 * @param {Array} questions - 题目数组
 * @param {Object} answers - 答案数据
 * @returns {Object}
 */
export function getBatchStats(questions, answers) {
  let correct = 0, wrong = 0, unknown = 0, unanswered = 0;

  questions.forEach((q) => {
    const answerData = answers?.[q.id];
    if (!answerData) {
      const strategy = getStrategy(q.type);
      unknown += strategy?.capabilities.isComposite ? (q.subs?.length || 0) : 1;
      return;
    }

    const status = answerData.status;
    if (typeof status === 'string') {
      const s = normalizeStatus(status);
      if (s === 'correct') correct++;
      else if (s === 'wrong') wrong++;
      else if (s === 'unknown') unknown++;
      else unanswered++;
    } else if (typeof status === 'object') {
      Object.values(status).forEach((subStatus) => {
        const s = normalizeStatus(subStatus);
        if (s === 'correct') correct++;
        else if (s === 'wrong') wrong++;
        else if (s === 'unknown') unknown++;
        else unanswered++;
      });
    }
  });

  return {
    totalCount: correct + wrong + unknown + unanswered,
    correctCount: correct,
    wrongCount: wrong,
    unknownCount: unknown,
    unansweredCount: unanswered,
  };
}
