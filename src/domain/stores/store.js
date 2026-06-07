/**
 * 应用 Store
 * 统一管理所有状态，遵循: API -> Storage -> Store -> 页面的数据流
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as API from "@/infrastructure/api/dataSource";
import { bankStorage, storage, STORAGE_KEY } from "@/infrastructure/storage/useStorage";
import { schemaRead, schemaWrite } from "@/infrastructure/storage/dataSchema";
import { loadPracticeProgress as loadPracticeProgressFromUtil } from "@/infrastructure/storage/progress";
import { APP_VERSION } from "@/infrastructure/utils/version";

export const useAppStore = defineStore("app", () => {
  // ========== 题库相关 (BANK) ==========

  /** 原始题库数据 */
  const rawQuestions = ref([]);

  /** 题库加载状态 */
  const loading = ref(false);

  /** 题库加载提示文字 */
  const loadingText = ref('');

  /** 题库加载进度 0-100 */
  const loadingProgress = ref(0);

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

  /** 练习进度 map (PRACTICE_PROGRESS)，key 为 category_scope_subject */
  const practiceProgress = ref({});

  /** 练习历史 (PRACTICE_HISTORY) */
  const practiceHistory = ref([]);

  // ========== 考试相关 (EXAM) ==========

  /** 考试卷 (EXAM_PAPERS) */
  const examPapers = ref([]);

  /** 考试预设 (EXAM_PRESETS) */
  const examPresets = ref([]);

  /** 考试历史 (EXAM_HISTORY) */
  const examHistory = ref([]);

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

  /** 最新一条练习进度（按 timestamp 取） */
  const lastPracticeProgress = computed(() => {
    const map = practiceProgress.value;
    const entries = Object.values(map);
    if (entries.length === 0) return null;
    entries.sort((a, b) => (b.meta?.timestamp || 0) - (a.meta?.timestamp || 0));
    return entries[0];
  });

  // ========== 题库 Actions ==========

  /**
   * 加载题库元数据（从 structure.json 同步读取）
   */
  async function loadBankMeta() {
    bankMeta.value = API.generateBankMeta();
  }

  /**
   * 后台下载所有题目文件并写入 IndexedDB
   */
  async function downloadAndCacheAll(onProgress, signal) {
    const grouped = await API.fetchAllQuestionFiles(onProgress, signal);
    const promises = Object.entries(grouped).map(([subject, questions]) =>
      bankStorage.setBank(subject, questions),
    );
    await Promise.all(promises);
    storage.setItem('bank_version', String(API.computeBankHash()));
  }

  /**
   * 阻塞式加载题库（显示全局 loading）
   * 用于首次启动和手动刷新
   */
  async function loadQuestions() {
    loading.value = true;
    loadingText.value = '加载题库...';
    loadingProgress.value = 0;

    try {
      // 检测 file:// 协议，fetch 在该协议下会无限挂起
      if (location.protocol === 'file:') {
        throw new Error('不支持 file:// 协议，请使用本地服务器运行 (如: npx vite preview)');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      await downloadAndCacheAll(
        (cur, total) => {
          loadingText.value = `下载题库 ${cur}/${total}`;
          loadingProgress.value = Math.round((cur / total) * 100);
        },
        controller.signal,
      );
      clearTimeout(timeout);
    } catch (e) {
      console.error("加载题库失败:", e);
      loadingText.value = e.message || '加载失败';
      await new Promise(r => setTimeout(r, 3000));
    } finally {
      loading.value = false;
      loadingProgress.value = 0;
      setTimeout(() => { loadingText.value = ''; }, 100);
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
   * 优先从 IndexedDB 读取，降级到内存缓存
   */
  async function getSubjectQuestions(
    category,
    scope,
    subject,
    sortType = "sequence",
  ) {
    let questions = await bankStorage.getBank(subject);
    if (!questions || questions.length === 0) {
      questions = API.fetchQuestionsBySubject(subject);
    }

    if (sortType === "shuffle") {
      questions = [...questions].sort(() => Math.random() - 0.5);
    } else if (sortType === "reverse") {
      questions = questions.reverse();
    }

    return questions;
  }

  /**
   * 检查题库是否有更新
   */
  async function checkForUpdates() {
    const currentVer = API.computeBankHash();
    const storedVer = storage.getItem('bank_version');
    return {
      hasUpdate: String(storedVer) !== String(currentVer),
      currentVer,
      storedVer,
    };
  }

  /**
   * 从 IndexedDB 填充内存缓存，供搜索等功能使用
   */
  async function populateCacheFromIndexedDB() {
    const categories = API.getAllCategories();
    const allBySubject = {};
    for (const category of categories) {
      const info = API.getQuestionBankInfo(category);
      if (!info) continue;
      for (const subject of info.subjects) {
        const questions = await bankStorage.getBank(subject);
        if (questions) {
          allBySubject[subject] = questions;
        }
      }
    }
    API.populateCache(allBySubject);
  }

  /**
   * 强制刷新题库
   */
  async function forceRefreshQuestions() {
    storage.removeItem('bank_version');
    await loadQuestions();
  }

  /**
   * 后台检测更新
   */
  async function checkForUpdatesInBackground() {
    const { hasUpdate } = await checkForUpdates();
    if (!hasUpdate) return;
    try {
      await downloadAndCacheAll((cur, total) => {
        console.log(`后台更新题库 ${cur}/${total}`);
      });
    } catch (e) {
      console.error('后台更新题库失败:', e);
    }
  }

  // ========== 错题本 Actions ==========

  /**
   * 加载错题本
   */
  function loadWrongBook() {
    wrongBook.value = schemaRead(STORAGE_KEY.USER_WRONG_BOOK) || [];
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
    schemaWrite(STORAGE_KEY.USER_WRONG_BOOK, wrongBook.value);
  }

  /**
   * 移除错题
   */
  function removeWrongQuestion(questionId) {
    wrongBook.value = wrongBook.value.filter((q) => q.id !== questionId);
    schemaWrite(STORAGE_KEY.USER_WRONG_BOOK, wrongBook.value);
  }

  // ========== 收藏 Actions ==========

  /**
   * 加载收藏
   */
  function loadFavorites() {
    favorites.value = schemaRead(STORAGE_KEY.USER_FAVORITES) || [];
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
      schemaWrite(STORAGE_KEY.USER_FAVORITES, favorites.value);
    }
  }

  /**
   * 移除收藏
   */
  function removeFavorite(questionId) {
    favorites.value = favorites.value.filter((q) => q.id !== questionId);
    schemaWrite(STORAGE_KEY.USER_FAVORITES, favorites.value);
  }

  // ========== 练习 Progress Actions ==========

  /**
   * 按 key 获取某科目的练习进度
   * @param {string} key - category_scope_subject
   * @returns {Object|null}
   */
  function getPracticeProgress(key) {
    return practiceProgress.value?.[key] || null;
  }

  /**
   * 保存某科目的练习进度到 map
   * @param {string} key - category_scope_subject
   * @param {Object} progress - 进度数据
   */
  function savePracticeProgress(key, progress) {
    if (!key) return;
    practiceProgress.value[key] = progress;
    schemaWrite(STORAGE_KEY.PRACTICE_PROGRESS, practiceProgress.value);
  }

  /**
   * 清除某科目的练习进度
   * @param {string} key - category_scope_subject
   */
  function clearPracticeProgress(key) {
    if (!key) return;
    delete practiceProgress.value[key];
    schemaWrite(STORAGE_KEY.PRACTICE_PROGRESS, practiceProgress.value);
  }

  /**
   * 从 localStorage 加载练习进度 map
   */
  function loadPracticeProgress() {
    practiceProgress.value = loadPracticeProgressFromUtil();
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
    schemaWrite(STORAGE_KEY.PRACTICE_HISTORY, practiceHistory.value);
  }

  /**
   * 加载练习历史
   */
  function loadPracticeHistory() {
    practiceHistory.value = schemaRead(STORAGE_KEY.PRACTICE_HISTORY) || [];
  }

  // ========== 初始化 ==========

  /**
   * 初始化所有数据
   * 首次启动阻塞下载，后续启动后台检测
   */
  async function init() {
    loadBankMeta();
    loadWrongBook();
    loadFavorites();
    loadPracticeProgress();
    loadPracticeHistory();
    loadExamPapers();
    loadExamPresets();

    // 应用版本追踪
    const prevAppVer = storage.getItem(STORAGE_KEY.APP_VERSION);
    if (prevAppVer && prevAppVer !== APP_VERSION) {
      console.log(`应用版本更新: ${prevAppVer} → ${APP_VERSION}`);
    }
    storage.setItem(STORAGE_KEY.APP_VERSION, APP_VERSION);

    const storedVer = storage.getItem('bank_version');
    const currentVer = API.computeBankHash();

    if (storedVer && String(storedVer) === String(currentVer)) {
      populateCacheFromIndexedDB();
      checkForUpdatesInBackground();
      return;
    }

    if (!storedVer) {
      await loadQuestions();
      return;
    }

    // 版本不一致：后台静默更新
    checkForUpdatesInBackground();
  }

  /**
   * 加载试卷列表
   */
  function loadExamPapers() {
    examPapers.value = schemaRead(STORAGE_KEY.EXAM_PAPERS) || [];
  }

  /**
   * 添加试卷
   */
  function addExamPaper(paper) {
    examPapers.value.unshift(paper);
    schemaWrite(STORAGE_KEY.EXAM_PAPERS, examPapers.value);
  }

  /**
   * 删除试卷
   */
  function removeExamPaper(paperId) {
    examPapers.value = examPapers.value.filter(p => p.id !== paperId);
    schemaWrite(STORAGE_KEY.EXAM_PAPERS, examPapers.value);
  }

  /**
   * 加载预设
   */
  function loadExamPresets() {
    examPresets.value = schemaRead(STORAGE_KEY.EXAM_PRESETS) || [];
  }

  /**
   * 保存预设
   */
  function saveExamPreset(preset) {
    const existing = schemaRead(STORAGE_KEY.EXAM_PRESETS) || [];
    existing.push(preset);
    schemaWrite(STORAGE_KEY.EXAM_PRESETS, existing);
    examPresets.value = existing;
  }

  /**
   * 删除预设
   */
  function deleteExamPreset(presetId) {
    const existing = schemaRead(STORAGE_KEY.EXAM_PRESETS) || [];
    const filtered = existing.filter(p => p.id !== presetId);
    schemaWrite(STORAGE_KEY.EXAM_PRESETS, filtered);
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
    loadingText,
    loadingProgress,
    questionBankStructure,
    questionBanks,
    questionsBySubject,
    bankMeta,
    loadQuestions,
    loadBankMeta,
    loadSubjectQuestions,
    getSubjectQuestions,
    checkForUpdates,
    forceRefreshQuestions,

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
    lastPracticeProgress,
    practiceHistory,
    savePracticeProgress,
    loadPracticeProgress,
    getPracticeProgress,
    clearPracticeProgress,
    loadPracticeHistory,
    addPracticeHistory,

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
