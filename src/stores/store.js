/**
 * 应用 Store
 * 统一管理所有状态，遵循: API -> Storage -> Store -> 页面的数据流
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as API from "@/api/dataSource";
import { bankStorage, storage, STORAGE_KEY } from "@/composables/useStorage";

export const useAppStore = defineStore("app", () => {
  // ========== 题库相关 (BANK) ==========

  /** 原始题库数据 */
  const rawQuestions = ref([]);

  /** 题库加载状态 */
  const loading = ref(false);

  /** 题库结构（自动发现） */
  const questionBankStructure = ref({});

  /** 题库元数据（预计算的 category/scope/subject 结构） */
  const bankMeta = ref({});

  // ========== 用户相关 (USER) ==========

  /** 错题本 (USER_WRONG_BOOK) */
  const wrongBook = ref([]);

  /** 收藏题目 (USER_FAVORITES) */
  const favorites = ref([]);

  // ========== 练习相关 (PRACTICE) ==========

  /** 练习进度 (PRACTICE_PROGRESS) */
  const practiceProgress = ref(null);

  /** 练习历史 (PRACTICE_HISTORY) */
  const practiceHistory = ref([]);

  // ========== 考试相关 (EXAM) ==========

  /** 考试卷 (EXAM_PAPERS) */
  const examPapers = ref([]);

  /** 考试预设 (EXAM_PRESETS) */
  const examPresets = ref([]);

  /** 考试历史 (EXAM_HISTORY) */
  const examHistory = ref([]);

  // ========== 统计相关 (STATS) ==========

  /** 今日统计 (STATS_TODAY) */
  const statsToday = ref({ answered: 0, correct: 0 });

  /** 总统计 (STATS_TOTAL) */
  const statsTotal = ref({ days: 0, totalCount: 0, correctCount: 0 });

  /** 科目统计 (STATS_SUBJECT) */
  const statsSubject = ref({});

  // ========== 计算属性 ==========

  /** 按科目分组的题目统计 */
  const questionsBySubject = computed(() => {
    const grouped = {};
    rawQuestions.value.forEach((q) => {
      // 基于题库结构 meta
      const key = `${q.meta.category}_${q.meta.scope}_${q.meta.subject}`;
      if (!grouped[key]) {
        grouped[key] = {
          category: q.meta.category,
          scope: q.meta.scope,
          subject: q.meta.subject,
          number: 0,
        };
      }
      grouped[key].number++;
    });
    return Object.values(grouped);
  });

  /** 题库大类列表 */
  const questionBanks = computed(() => {
    return Object.keys(questionBankStructure.value);
  });

  /** 错题数量 */
  const wrongBookCount = computed(() => wrongBook.value.length);

  /** 收藏数量 */
  const favoritesCount = computed(() => favorites.value.length);

  // ========== 题库 Actions ==========

  /**
   * 加载题库元数据
   */
  async function loadBankMeta() {
    let meta = await bankStorage.getBank(STORAGE_KEY.BANK_META);
    if (!meta) {
      meta = API.generateBankMeta();
      await bankStorage.setBank(STORAGE_KEY.BANK_META, meta);
    }
    bankMeta.value = meta;
  }

  /**
   * 首次启动时，将所有题目按 subject 分块存入 IndexedDB
   */
  async function loadAllQuestionsToIndexedDB() {
    console.log("首次加载，存入 IndexedDB...");

    const allQuestions = API.fetchAllQuestions();

    const grouped = {};
    allQuestions.forEach((q) => {
      const subject = q.meta?.subject;
      if (!subject) return;
      if (!grouped[subject]) grouped[subject] = [];
      grouped[subject].push(q);
    });

    const promises = Object.entries(grouped).map(([subject, questions]) =>
      bankStorage.setBank(subject, questions),
    );

    await Promise.all(promises);
    console.log(`已存入 ${Object.keys(grouped).length} 个科目`);
  }

  /**
   * 加载题库数据
   * 检查是否已初始化，未初始化则存入 IndexedDB
   */
  async function loadQuestions() {
    loading.value = true;

    try {
      await loadBankMeta();

      const isInitialized = storage.getItem(STORAGE_KEY.APP_INITIALIZED);

      if (!isInitialized) {
        await loadAllQuestionsToIndexedDB();
        storage.setItem(STORAGE_KEY.APP_INITIALIZED, true);
      }
    } catch (e) {
      console.error("加载题库失败:", e);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 按 subject 从 IndexedDB 加载题目
   */
  async function loadSubjectQuestions(subject) {
    const questions = await bankStorage.getBank(subject);

    if (!questions || questions.length === 0) {
      throw new Error(`无法从 IndexedDB 加载题目: ${subject}`);
    }

    rawQuestions.value = questions;
  }

  /**
   * 获取某个科目下的题目（带排序）
   */
  async function getSubjectQuestions(
    category,
    scope,
    subject,
    sortType = "sequence",
  ) {
    let questions = await API.fetchQuestionsBySubject(subject);

    if (sortType === "shuffle") {
      questions = [...questions].sort(() => Math.random() - 0.5);
    } else if (sortType === "reverse") {
      questions = questions.reverse();
    }

    return questions;
  }

  /**
   * 清除题库缓存
   */
  async function clearQuestionsCache() {
    await bankStorage.removeBank(STORAGE_KEY.BANK);
    rawQuestions.value = [];
  }

  // ========== 错题本 Actions ==========

  /**
   * 加载错题本
   */
  function loadWrongBook() {
    wrongBook.value = storage.getItem(STORAGE_KEY.USER_WRONG_BOOK) || [];
  }

  /**
   * 添加错题
   */
  function addWrongQuestion(question) {
    const exists = wrongBook.value.find((q) => q.id === question.id);
    if (exists) {
      exists.wrongCount = (exists.wrongCount || 1) + 1;
      exists.wrongTime = Date.now();
    } else {
      wrongBook.value.push({
        ...question,
        wrongTime: Date.now(),
        wrongCount: 1,
      });
    }
    storage.setItem(STORAGE_KEY.USER_WRONG_BOOK, wrongBook.value);
  }

  /**
   * 移除错题
   */
  function removeWrongQuestion(questionId) {
    wrongBook.value = wrongBook.value.filter((q) => q.id !== questionId);
    storage.setItem(STORAGE_KEY.USER_WRONG_BOOK, wrongBook.value);
  }

  // ========== 收藏 Actions ==========

  /**
   * 加载收藏
   */
  function loadFavorites() {
    favorites.value = storage.getItem(STORAGE_KEY.USER_FAVORITES) || [];
  }

  /**
   * 添加收藏
   */
  function addFavorite(question) {
    const exists = favorites.value.find((q) => q.id === question.id);
    if (!exists) {
      favorites.value.push({
        ...question,
        favoriteTime: Date.now(),
      });
      storage.setItem(STORAGE_KEY.USER_FAVORITES, favorites.value);
    }
  }

  /**
   * 移除收藏
   */
  function removeFavorite(questionId) {
    favorites.value = favorites.value.filter((q) => q.id !== questionId);
    storage.setItem(STORAGE_KEY.USER_FAVORITES, favorites.value);
  }

  // ========== 练习 Progress Actions ==========

  /**
   * 保存练习进度
   */
  function savePracticeProgress(progress) {
    practiceProgress.value = progress;
    storage.setItem(STORAGE_KEY.PRACTICE_PROGRESS, progress);
  }

  /**
   * 加载练习进度
   */

  function loadPracticeProgress() {
    practiceProgress.value = storage.getItem(STORAGE_KEY.PRACTICE_PROGRESS);
  }

  // ========== 练习 History Actions ==========

  /**
   * 添加练习历史
   */
  function addPracticeHistory(history) {
    practiceHistory.value.unshift({
      ...history,
      timestamp: Date.now(),
    });
    storage.setItem(STORAGE_KEY.PRACTICE_HISTORY, practiceHistory.value);
  }

  /**
   * 加载练习历史
   */
  function loadPracticeHistory() {
    practiceHistory.value = storage.getItem(STORAGE_KEY.PRACTICE_HISTORY) || [];
  }

  // ========== 统计 Actions ==========

  /**
   * 更新今日统计
   */
  function updateStatsToday(answered, correct) {
    statsToday.value = { answered, correct };
    storage.setItem(STORAGE_KEY.STATS_TODAY, statsToday.value);
  }

  /**
   * 加载统计
   */
  function loadStats() {
    statsToday.value = storage.getItem(STORAGE_KEY.STATS_TODAY) || {
      answered: 0,
      correct: 0,
    };
    statsTotal.value = storage.getItem(STORAGE_KEY.STATS_TOTAL) || {
      days: 0,
      totalCount: 0,
      correctCount: 0,
    };
    statsSubject.value = storage.getItem(STORAGE_KEY.STATS_SUBJECT) || {};
  }

  // ========== 初始化 ==========

  /**
   * 初始化所有数据
   */
  async function init() {
    await loadBankMeta();
    loadWrongBook();
    loadFavorites();
    loadPracticeProgress();
    loadPracticeHistory();
    loadStats();
    loadExamPapers();
  }

  /**
   * 加载试卷列表
   */
  function loadExamPapers() {
    examPapers.value = storage.getItem(STORAGE_KEY.EXAM_PAPERS) || [];
  }

  /**
   * 添加试卷
   */
  function addExamPaper(paper) {
    examPapers.value.unshift(paper);
    storage.setItem(STORAGE_KEY.EXAM_PAPERS, examPapers.value);
  }

  /**
   * 删除试卷
   */
  function removeExamPaper(paperId) {
    examPapers.value = examPapers.value.filter(p => p.id !== paperId);
    storage.setItem(STORAGE_KEY.EXAM_PAPERS, examPapers.value);
  }

  /**
   * 加载预设
   */
  function loadExamPresets() {
    examPresets.value = storage.getItem(STORAGE_KEY.EXAM_PRESETS) || [];
  }

  /**
   * 保存预设
   */
  function saveExamPreset(preset) {
    const existing = storage.getItem(STORAGE_KEY.EXAM_PRESETS) || [];
    existing.push(preset);
    storage.setItem(STORAGE_KEY.EXAM_PRESETS, existing);
    examPresets.value = existing;
  }

  /**
   * 删除预设
   */
  function deleteExamPreset(presetId) {
    const existing = storage.getItem(STORAGE_KEY.EXAM_PRESETS) || [];
    const filtered = existing.filter(p => p.id !== presetId);
    storage.setItem(STORAGE_KEY.EXAM_PRESETS, filtered);
    examPresets.value = filtered;
  }

  /**
   * 验证试卷数据结构
   * @param {Object} paper - 试卷对象
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  function validatePaper(paper) {
    const errors = []

    if (!paper.title || !paper.title.trim()) {
      errors.push('缺少试卷标题')
    }

    if (!paper.questions || !Array.isArray(paper.questions)) {
      errors.push('题目格式无效')
    }

    if (paper.questions && paper.questions.length > 0) {
      paper.questions.forEach((q, index) => {
        if (!q.meta) {
          errors.push(`第${index + 1}题：缺少 meta 信息`)
        } else {
          if (!q.meta.category) {
            errors.push(`第${index + 1}题：缺少 category`)
          }
          if (!q.meta.scope) {
            errors.push(`第${index + 1}题：缺少 scope`)
          }
          if (!q.meta.subject) {
            errors.push(`第${index + 1}题：缺少 subject`)
          }
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 导出试卷为 JSON 文件
   */
  function exportPaper(paper) {
    const json = JSON.stringify(paper, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeTitle = paper.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
    a.download = `ATCTest考卷_${safeTitle}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * 导入试卷
   */
  function importPaper(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const paper = JSON.parse(e.target.result)

          const validation = validatePaper(paper)
          if (!validation.valid) {
            reject(new Error(validation.errors.join('; ')))
            return
          }

          paper.id = Date.now()
          paper.createdAt = Date.now()

          paper.questions = paper.questions.map((q, index) => ({
            ...q,
            id: paper.id * 1000 + index
          }))

          addExamPaper(paper)
          resolve(paper)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }

  // 导出
  return {
    // 题库状态
    rawQuestions,
    loading,
    questionBankStructure,
    questionBanks,
    questionsBySubject,
    bankMeta,
    loadQuestions,
    loadBankMeta,
    loadSubjectQuestions,
    getSubjectQuestions,
    clearQuestionsCache,

    // 错题本
    wrongBook,
    wrongBookCount,
    loadWrongBook,
    addWrongQuestion,
    removeWrongQuestion,

    // 收藏
    favorites,
    favoritesCount,
    loadFavorites,
    addFavorite,
    removeFavorite,

    // 练习
    practiceProgress,
    practiceHistory,
    savePracticeProgress,
    loadPracticeProgress,
    loadPracticeHistory,
    addPracticeHistory,

    // 统计
    statsToday,
    statsTotal,
    statsSubject,
    updateStatsToday,
    loadStats,

    // 考试
    examPapers,
    loadExamPapers,
    addExamPaper,
    removeExamPaper,
    examPresets,
    loadExamPresets,
    saveExamPreset,
    deleteExamPreset,
    validatePaper,
    exportPaper,
    importPaper,

    // 初始化
    init,
  };
});
