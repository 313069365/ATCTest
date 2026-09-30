/**
 * 数据源层
 * 统一管理题库数据的获取和自动发现
 *
 * 功能:
 * - structure.json 提供元数据/目录（小型，同步可用）
 * - 题目文件按需 fetch，写入 IndexedDB 后通过 store 读取
 * - dataCache 提供内存缓存，供搜索/导入等操作使用
 */

import { storage, STORAGE_KEY } from "@/infrastructure/storage/useStorage";
import structure from "@/../public/data/atc/structure.json";

// ==================== 内存缓存 ====================

/** 运行时题目缓存（fetch 后填充，供搜索等操作使用） */
const dataCache = new Map();

// ==================== 结构/元数据（同步） ====================

/**
 * 生成题库元数据（读自 structure.json）
 */
export function generateBankMeta() {
  return structure.categories;
}

/**
 * 获取题库版本号（用于检测更新）
 */
export function computeBankHash() {
  return structure.version;
}

/**
 * 获取所有 category
 */
export function getAllCategories() {
  return Object.keys(structure.categories);
}

/**
 * 获取题库结构
 */
export function getQuestionBankStructure() {
  const bank = {};
  for (const [category, info] of Object.entries(structure.categories)) {
    bank[category] = {
      scopes: [...info.scopes],
      subjects: Object.keys(info.subjects),
    };
  }
  return bank;
}

/**
 * 获取题库列表
 */
export function getQuestionBanks() {
  return Object.keys(structure.categories);
}

/**
 * 获取某个题库信息
 */
export function getQuestionBankInfo(category) {
  const cat = structure.categories[category];
  if (!cat) return null;
  return { scopes: [...cat.scopes], subjects: Object.keys(cat.subjects) };
}

/**
 * 获取文件清单及其元信息
 * 从 structure.json 反推每个文件包含哪些 subjects
 * @returns {Array<{filename, category, scope, subjects: string[], questionCount: number}>}
 */
export function getFileManifest() {
  return structure.files.map((filename) => {
    const parts = filename.split("/");
    const category = parts[0];
    const baseName = parts[1].replace(".json", "");
    const scope = baseName.split("_")[0];

    const catData = structure.categories[category];
    const subjects = [];
    let questionCount = 0;

    if (catData) {
      for (const [name, info] of Object.entries(catData.subjects)) {
        if (info.scope === scope) {
          subjects.push(name);
          questionCount += info.count || 0;
        }
      }
    }

    return { filename, category, scope, subjects, questionCount };
  });
}

// ==================== 文件下载 ====================

/**
 * 拉取单个题目文件并缓存到内存
 * @param {string} filename - 如 "base.json"
 * @returns {Array} 题目数组
 */
export async function fetchQuestionFile(filename, signal) {
  const resp = await fetch(`/data/${filename}`, { signal });
  const questions = await resp.json();
  dataCache.set(filename, questions);
  return questions;
}

/**
 * 拉取所有题目文件，按 subject 分组返回
 * @param {Function} onProgress - (当前文件序号, 总数) => void
 * @returns {Object} { subjectName: [questions...], ... }
 */
export async function fetchAllQuestionFiles(onProgress, signal) {
  const files = structure.files;
  const total = files.length;
  const groupedBySubject = {};

  for (let i = 0; i < total; i++) {
    const filename = files[i];
    const questions = await fetchQuestionFile(filename, signal);

    for (const q of questions) {
      const subject = q.meta?.subject;
      if (!subject) continue;
      if (!groupedBySubject[subject]) groupedBySubject[subject] = [];
      groupedBySubject[subject].push(q);
    }

    if (onProgress) onProgress(i + 1, total);
  }

  // virtual aggregation: basicCollection = all atc/base subjects
  const basicColl = [];
  for (const [, questions] of Object.entries(groupedBySubject)) {
    for (const q of questions) {
      if (q.meta?.category === "atc" && q.meta?.scope === "base") {
        basicColl.push(q);
      }
    }
  }
  if (basicColl.length > 0) {
    groupedBySubject.basicCollection = basicColl;
  }

  return groupedBySubject;
}

// ==================== 题目查询（内存缓存 / 向后兼容） ====================

/**
 * 将题目数据填入内存缓存（供搜索/导入使用）
 * @param {Object} bySubject - { subjectName: [questions...] }
 */
export function populateCache(bySubject) {
  dataCache.clear();
  for (const [subject, questions] of Object.entries(bySubject)) {
    dataCache.set(subject, questions);
  }
}

/**
 * 按 subject 获取题目（从内存缓存读取）
 */
export function fetchQuestionsBySubject(subject) {
  for (const questions of dataCache.values()) {
    const filtered = questions.filter((q) => q.meta?.subject === subject);
    if (filtered.length > 0) return filtered;
  }
  return [];
}

/**
 * 获取所有题目（从内存缓存读取）
 */
export function fetchAllQuestions() {
  const results = [];
  for (const questions of dataCache.values()) {
    results.push(...questions);
  }
  return results;
}

/**
 * 条件过滤获取题目
 */
export function fetchQuestions({ category, scope, subject } = {}) {
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
 * 搜索题目
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

// ==================== 导入 ====================

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

export default {
  generateBankMeta,
  computeBankHash,
  getAllCategories,
  fetchQuestionFile,
  fetchAllQuestionFiles,
  fetchAllQuestions,
  fetchQuestions,
  fetchQuestionsBySubject,
  getQuestionBankStructure,
  getQuestionBanks,
  getQuestionBankInfo,
  getFileManifest,
  importQuestions,
  searchQuestions,
};
