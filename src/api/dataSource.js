/**
 * 数据源层
 * 统一管理题库数据的获取和自动发现
 *
 * 功能:
 * - 多来源支持: 本地文件 / API / 用户导入
 * - 自动发现题库结构 (category -> scope -> subject)
 */

import { storage, STORAGE_KEY } from "@/composables/useStorage";
import base from "@/../public/data/atc/base.json";
import professional from "@/../public/data/atc/professional.json";
import english_singleChoice from "@/../public/data/atc/english_translated.json";
import enlish_reading from "@/../public/data/atc/english_reading.json";
import base_set from "@/../public/data/atc/base_set.json";

// ==================== 配置 ====================

// 预定义题库数据
const DATA_SOURCES = {
  atc: {
    base: base,
    professional: professional,
    english: [...english_singleChoice, ...enlish_reading],
  },
  base: {
    base_set: base_set,
  },
};

// ==================== 核心功能 ====================

/**
 * 发现题库结构
 * @param {Array} questions - 题目数组
 * @returns {Object} 题库结构
 */
function discover(questions) {
  const bank = {};

  questions.forEach((q) => {
    const { category, scope, subject } = q.meta || {};
    if (!category) return;

    if (!bank[category]) {
      bank[category] = {
        scopes: new Set(),
        subjects: new Set(),
      };
    }
    if (scope) bank[category].scopes.add(scope);
    if (subject) bank[category].subjects.add(subject);
  });

  // Set 转 Array
  Object.values(bank).forEach((item) => {
    item.scopes = [...item.scopes];
    item.subjects = [...item.subjects];
  });

  // 合并导入配置
  const imports = storage.getItem(STORAGE_KEY.IMPORT_CONFIG) || {};
  Object.entries(imports).forEach(([cat, info]) => {
    if (!bank[cat]) {
      bank[cat] = { scopes: [info.scope], subjects: [] };
    }
  });

  return bank;
}

// ==================== 导出函数 ====================

/**
 * 获取所有 category
 */
export function getAllCategories() {
  return Object.keys(DATA_SOURCES);
}

/**
 * 辅助函数：按 key 分组
 */
function groupBy(arr, keyFn) {
  return arr.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
    return result;
  }, {});
}

/**
 * 生成题库元数据
 */
export function generateBankMeta() {
  const meta = {};

  for (const [category, scopes] of Object.entries(DATA_SOURCES)) {
    meta[category] = {
      scopes: [],
      subjects: {},
    };

    for (const [scope, questions] of Object.entries(scopes)) {
      if (!meta[category].scopes.includes(scope)) {
        meta[category].scopes.push(scope);
      }

      const grouped = groupBy(questions, (q) => q.meta?.subject);
      for (const [subject, qs] of Object.entries(grouped)) {
        if (!subject) continue;
        meta[category].subjects[subject] = {
          scope,
          count: qs.length,
        };
      }
    }
  }

  return meta;
}

/**
 * 获取所有题目
 */
export function fetchAllQuestions() {
  const results = [];

  for (const scopes of Object.values(DATA_SOURCES)) {
    for (const data of Object.values(scopes)) {
      results.push(...data);
    }
  }

  return results;
}

/**
 * 按 subject 获取题目
 */
export function fetchQuestionsBySubject(subject) {
  for (const scopes of Object.values(DATA_SOURCES)) {
    for (const questions of Object.values(scopes)) {
      const filtered = questions.filter((q) => q.meta?.subject === subject);
      if (filtered.length > 0) return filtered;
    }
  }
  return [];
}

/**
 * 条件过滤获取题目
 */
export function fetchQuestions({ category, scope, subject }) {
  const all = fetchAllQuestions();
  return all.filter((q) => {
    const m = q.meta || {};
    if (category && m.category !== category) return false;
    if (scope && m.scope !== scope) return false;
    if (subject && m.subject !== subject) return false;
    return true;
  });
}

/**
 * 获取题库结构
 */
export function getQuestionBankStructure(questions) {
  if (!questions || questions.length === 0) {
    questions = fetchAllQuestions();
  }
  return discover(questions);
}

/**
 * 获取题库列表
 */
export function getQuestionBanks() {
  const structure = getQuestionBankStructure();
  return Object.keys(structure);
}

/**
 * 获取某个题库信息
 */
export function getQuestionBankInfo(category) {
  const structure = getQuestionBankStructure();
  return structure[category] || null;
}

/**
 * 计算题库 Hash (SHA-256)
 * 用于检测题库是否发生变化
 */
export async function computeBankHash() {
  const allQuestions = fetchAllQuestions();
  const jsonStr = JSON.stringify(allQuestions);
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonStr);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 导入题库文件
 */
export async function importQuestions(file, options = {}) {
  const { category = "import", scope = "base" } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const questions = (
          Array.isArray(data) ? data : data.questions || []
        ).map((q) => ({ ...q, meta: { ...q.meta, category, scope } }));

        // 保存导入配置
        const imports = storage.getItem(STORAGE_KEY.IMPORT_CONFIG) || {};
        imports[category] = { scope, importTime: Date.now() };
        storage.setItem(STORAGE_KEY.IMPORT_CONFIG, imports);

        resolve(questions);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * 搜索题目
 * @param {Object} params
 * @param {string} params.keyword - 搜索关键词
 * @param {string[]} params.fields - 搜索字段 ['id', 'stem', 'options']
 * @param {string} [params.category] - 按分类过滤
 * @param {string} [params.scope] - 按范围过滤
 * @param {string} [params.subject] - 按科目过滤
 * @returns {Array} 匹配的题目数组
 */
export function searchQuestions({
  keyword,
  fields,
  category,
  scope,
  subject,
} = {}) {
  if (!keyword?.trim()) return [];
  const kw = keyword.toLowerCase().trim();
  const searchFields = fields || ["id", "stem", "options"];

  let questions = fetchAllQuestions();

  if (category)
    questions = questions.filter((q) => q.meta?.category === category);
  if (scope) questions = questions.filter((q) => q.meta?.scope === scope);
  if (subject && subject.length) {
    const subjects = Array.isArray(subject) ? subject : [subject];
    questions = questions.filter((q) => subjects.includes(q.meta?.subject));
  }

  return questions.filter((q) => {
    if (searchFields.includes("id") && q.id?.toLowerCase().includes(kw))
      return true;
    if (searchFields.includes("stem") && q.stem?.toLowerCase().includes(kw))
      return true;
    if (
      searchFields.includes("options") &&
      q.options?.some((o) => o.toLowerCase().includes(kw))
    )
      return true;
    if (
      searchFields.includes("answer") &&
      q.answer?.some((a) => a.toLowerCase().includes(kw))
    )
      return true;
    return false;
  });
}

export default {
  getAllCategories,
  generateBankMeta,
  fetchAllQuestions,
  fetchQuestions,
  fetchQuestionsBySubject,
  getQuestionBankStructure,
  getQuestionBanks,
  getQuestionBankInfo,
  importQuestions,
  computeBankHash,
  searchQuestions,
};
