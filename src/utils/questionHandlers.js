/**
 * 题目处理工具函数
 * 统一入口，自动分配处理函数
 *
 * 使用方式：页面按需导入所需函数，无需处理题型判断逻辑
 * 统一入口：
 *   - handleQuestion(question, mode, options) 处理题目
 *   - getAnswerStatus(question, userAnswer) 获取答案状态
 *   - packProgress/unpackProgress 进度打包/解包
 *   - getBatchStats 批量统计
 */

import { STORAGE_KEY, storage } from "@/composables/useStorage";

// ==================== 常量定义 ====================

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

export const AUTO_CHECK_TYPES = ["single", "boolean", "media"];
export const MANUAL_CHECK_TYPES = [
  "multiple",
  "fillin",
  "essay",
  "translation",
  "reading",
];

// ==================== 类型判断（原子函数）====================

/**
 * 判断是否简单题型
 * @param {string} type - 题型类型
 * @returns {boolean}
 */
export function isSimpleType(type) {
  return [
    "single",
    "multiple",
    "boolean",
    "fillin",
    "essay",
    "translation",
    "media",
  ].includes(type);
}

/**
 * 判断是否复合题型
 * @param {string} type - 题型类型
 * @returns {boolean}
 */
export function isComplexType(type) {
  return ["reading"].includes(type);
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
  return AUTO_CHECK_TYPES.includes(questionType);
}

/**
 * 判断题型是否需要手动检查
 * @param {string} questionType - 题型
 * @returns {boolean}
 */
export function needsManualCheck(questionType) {
  return MANUAL_CHECK_TYPES.includes(questionType);
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
 * @param {boolean} options.isCurrent - 是否当前题目
 * @param {string} options.mode - 练习模式
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

// ==================== 模式配置 ====================

function getModeConfig(mode) {
  const config = {
    practice: { isShowAnswer: false, isDisabled: false },
    answer: { isShowAnswer: false, isDisabled: false },
    review: { isShowAnswer: true, isDisabled: true },
    exam: { isShowAnswer: false, isDisabled: false },
  };
  return config[mode] || config.practice;
}

// ==================== 状态判断（原子函数）====================

/**
 * 获取简单题答案状态
 * @param {Object} question - 题目对象
 * @param {any} userAnswer - 用户答案
 * @returns {string} - correct/wrong/unknown/unanswered
 */
export function getSimpleStatus(question, userAnswer) {
  if (!question?.answer?.[0]) return "unknown";

  const correctAnswer = question.answer[0].replace(/^[A-Z]\.\s*/, "");

  if (question.type === "multiple") {
    if (!Array.isArray(userAnswer)) return "wrong";
    const correctSet = new Set(
      question.answer.map((a) => a.replace(/^[A-Z]\.\s*/, "")),
    );
    const userSet = new Set(
      (userAnswer || [])
        .map((i) => question.options?.[i]?.replace(/^[A-Z]\.\s*/, ""))
        .filter(Boolean),
    );

    if (
      correctSet.size === userSet.size &&
      [...correctSet].every((v) => userSet.has(v))
    )
      return "correct";
    if ([...userSet].some((v) => !correctSet.has(v))) return "wrong";
    return "partial";
  } else {
    if (typeof userAnswer !== "number") return "wrong";
    const userText = Array.isArray(question.options)
      ? question.options?.[userAnswer]?.replace(/^[A-Z]\.\s*/, "")
      : question.options?.[String.fromCharCode(65 + userAnswer)]?.replace(
          /^[A-Z]\.\s*/,
          "",
        );
    return userText === correctAnswer ? "correct" : "wrong";
  }
}

/**
 * 获取复合题答案状态（返回子题状态对象）
 * @param {Object} question - 题目对象
 * @param {Object} userAnswer - 用户答案 {0: ans0, 1: ans1}
 * @returns {Object} - { 0: 'correct', 1: 'wrong', ... }
 */
export function getComplexStatus(question, userAnswer) {
  const result = {};
  (question.subs || []).forEach((sub, idx) => {
    result[idx] =
      userAnswer?.[idx] === undefined || userAnswer?.[idx] === null
        ? "unanswered"
        : getSimpleStatus(sub, userAnswer[idx]);
  });
  return result;
}

/**
 * 获取答案状态 - 总入口，自动分发
 * @param {Object} question - 题目对象
 * @param {any} userAnswer - 用户答案
 * @returns {string|Object} - 简单题返回字符串，复合题返回对象
 */
export function getAnswerStatus(question, userAnswer) {
  if (!question) return "unanswered";
  return isComplexType(question.type)
    ? getComplexStatus(question, userAnswer)
    : getSimpleStatus(question, userAnswer);
}

// ==================== 题目处理（原子函数）====================

/**
 * 处理简单题
 * @param {Object} question - 题目对象
 * @param {string} mode - 模式
 * @param {Object} options - 配置 { shuffledOptions, userAnswer, checked, status }
 * @returns {Object} - 处理后的题目数据
 */
export function handleSimpleQuestion(question, mode, options = {}) {
  const { shuffledOptions, userAnswer, checked, status } = options;
  const modeConfig = getModeConfig(mode);

  return {
    id: question.id,
    type: question.type,
    stem: question.stem,
    options: shuffledOptions || question.options,
    answer: question.answer,
    explanation: question.explanation,
    media: question.media,
    meta: question.meta,
    userAnswer,
    checked,
    status,
    isSimple: true,
    isComplex: false,
    isShowAnswer: modeConfig.isShowAnswer,
    isDisabled: modeConfig.isDisabled,
  };
}

/**
 * 处理复合题（子题复用简单题逻辑）
 * @param {Object} question - 题目对象
 * @param {string} mode - 模式
 * @param {Object} options - 配置 { userAnswer, checked, status }
 * @returns {Object} - 处理后的题目数据
 */
export function handleComplexQuestion(question, mode, options = {}) {
  const { userAnswer, checked, status } = options;

  return {
    id: question.id,
    type: "reading",
    article: question.media?.article || "",
    subs: (question.subs || []).map((sub, idx) =>
      handleSimpleQuestion(sub, mode, {
        userAnswer: userAnswer?.[idx],
        checked: checked?.[idx],
        status: status?.[idx],
      }),
    ),
    meta: question.meta,
    userAnswer,
    isSimple: false,
    isComplex: true,
  };
}

/**
 * 处理题目 - 总入口，自动分发
 * @param {Object} question - 题目对象
 * @param {string} mode - 模式
 * @param {Object} options - 配置
 * @returns {Object} - 处理后的题目数据
 */
export function handleQuestion(question, mode, options = {}) {
  if (!question) return null;
  return isComplexType(question.type)
    ? handleComplexQuestion(question, mode, options)
    : handleSimpleQuestion(question, mode, options);
}

// ==================== 数据打包/解包（原子函数）====================

/**
 * 打包简单题进度
 * @param {string} questionId - 题目ID
 * @param {any} userAnswer - 用户答案
 * @param {boolean} checked - 检查状态
 * @param {string} status - 答案状态
 * @returns {Object}
 */
export function packSimpleProgress(questionId, userAnswer, checked, status) {
  return {
    selected: userAnswer,
    checked: checked || false,
    status: status || "unanswered",
  };
}

/**
 * 打包复合题进度
 * @param {string} questionId - 题目ID
 * @param {any} userAnswer - 用户答案
 * @param {Object} checked - 检查状态
 * @param {Object} status - 答案状态
 * @returns {Object}
 */
export function packComplexProgress(questionId, userAnswer, checked, status) {
  return {
    selected: userAnswer,
    checked,
    status,
  };
}

/**
 * 打包进度数据 - 总入口，自动分发
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
    const qId = q.id;
    if (isComplexType(q.type)) {
      result[qId] = packComplexProgress(
        qId,
        userAnswers?.[qId],
        answerChecked?.[qId],
        answerStatus?.[qId],
      );
    } else {
      result[qId] = packSimpleProgress(
        qId,
        userAnswers?.[qId],
        answerChecked?.[qId],
        answerStatus?.[qId],
      );
    }
  });
  return result;
}

/**
 * 解包进度数据
 * @param {Object} packedAnswers - 打包后的数据
 * @returns {Object} - { userAnswers, answerChecked, answerStatus }
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

// ==================== 进度存储（原子函数）====================

/**
 * 保存练习进度
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
) {
  const answers = packProgress(
    questions,
    userAnswers,
    answerChecked,
    answerStatus,
  );

  storage.setItem(STORAGE_KEY.PRACTICE_PROGRESS, {
    config,
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
  });
}

/**
 * 加载练习进度
 * @returns {Object|null}
 */
export function loadPracticeProgress() {
  return storage.getItem(STORAGE_KEY.PRACTICE_PROGRESS);
}

// ==================== 统计（原子函数）====================

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
  return questions.reduce(
    (total, q) => total + (isComplexType(q.type) ? q.subs?.length || 0 : 1),
    0,
  );
}

/**
 * 简单题统计
 * @param {string} status - 答案状态
 * @returns {Object} - { correct, wrong, unknown, unanswered }
 */
export function getSimpleStats(status) {
  const s = normalizeStatus(status);
  return {
    correct: s === "correct" ? 1 : 0,
    wrong: s === "wrong" ? 1 : 0,
    unknown: s === "unknown" ? 1 : 0,
    unanswered: s === "unanswered" ? 1 : 0,
  };
}

/**
 * 复合题统计
 * @param {Object|Array} subs - 答案状态（对象或数组）
 * @returns {Object}
 */
export function getComplexStats(subs) {
  const stats = { correct: 0, wrong: 0, unknown: 0, unanswered: 0 };

  // 处理对象格式: { 0: "correct", 1: "wrong" }
  if (subs && typeof subs === "object" && !Array.isArray(subs)) {
    Object.values(subs).forEach((status) => {
      const s = normalizeStatus(status);
      if (s === "correct") stats.correct++;
      else if (s === "wrong") stats.wrong++;
      else if (s === "unknown") stats.unknown++;
      else stats.unanswered++;
    });
    return stats;
  }

  // 处理数组格式: [{ status: "correct" }, ...]
  subs?.forEach((sub) => {
    const s = normalizeStatus(sub.status);
    if (s === "correct") stats.correct++;
    else if (s === "wrong") stats.wrong++;
    else if (s === "unknown") stats.unknown++;
    else stats.unanswered++;
  });
  return stats;
}

/**
 * 批量统计 - 总入口，返回完整统计结果
 * @param {Array} questions - 题目数组
 * @param {Object} answers - 答案数据
 * @returns {Object} - { totalCount, correctCount, wrongCount, unknownCount, unansweredCount }
 */
export function getBatchStats(questions, answers) {
  let correct = 0,
    wrong = 0,
    unknown = 0,
    unanswered = 0;

  questions.forEach((q) => {
    const answerData = answers?.[q.id];
    if (!answerData) {
      if (isComplexType(q.type)) {
        unknown += q.subs?.length || 0;
      } else {
        unanswered++;
      }
      return;
    }

    if (isComplexType(q.type)) {
      const subStats = getComplexStats(answerData.status);
      correct += subStats.correct;
      wrong += subStats.wrong;
      unknown += subStats.unknown;
      unanswered += subStats.unanswered;
    } else {
      const subStats = getSimpleStats(answerData.status);
      correct += subStats.correct;
      wrong += subStats.wrong;
      unknown += subStats.unknown;
      unanswered += subStats.unanswered;
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
