/**
 * 应用 Store
 * 统一管理所有状态，遵循: API -> Storage -> Store -> 页面的数据流
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as API from "@/infrastructure/api/dataSource";
import {
  bankStorage,
  storage,
  STORAGE_KEY,
} from "@/infrastructure/storage/useStorage";
import { schemaRead, schemaWrite } from "@/infrastructure/storage/dataSchema";
import { loadPracticeProgress as loadPracticeProgressFromUtil } from "@/infrastructure/storage/progress";
import { APP_VERSION } from "@/infrastructure/utils/version";
import * as userRepository from "@/infrastructure/api/userRepository";

export const useAppStore = defineStore("app", () => {
  // ========== 题库相关 (BANK) ==========

  /** 原始题库数据 */
  const rawQuestions = ref([]);

  /** 题库加载状态 */
  const loading = ref(false);

  /** 题库加载提示文字 */
  const loadingText = ref("");

  /** 题库加载进度 0-100 */
  const loadingProgress = ref(0);

  /** 题库结构（自动发现） */
  const questionBankStructure = ref({});

  /** 题库元数据（预计算的 category/scope/subject 结构） */
  const bankMeta = ref({});

  /** 每个文件的下载状态: { filename: 'idle' | 'cached' | 'downloading' | 'error' } */
  const fileStatus = ref({});

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
   * 扫描 IndexedDB，初始化每个文件的缓存状态
   * 优先读取 downloaded_files 记录，降级到 IndexedDB subject 扫描
   */
  async function initFileStatus() {
    const cachedKeys = await bankStorage.keys();
    const cachedSet = new Set(cachedKeys);
    const downloadedFiles = new Set(storage.getItem("downloaded_files") || []);
    const manifest = API.getFileManifest();
    const status = {};
    for (const file of manifest) {
      // 优先检查显式下载记录
      if (downloadedFiles.has(file.filename)) {
        status[file.filename] = "cached";
        continue;
      }
      // 降级：检查该文件的 subjects 是否有任意已缓存
      const hasCachedSubject = file.subjects.some((s) => cachedSet.has(s));
      status[file.filename] = hasCachedSubject ? "cached" : "idle";
    }
    fileStatus.value = status;
  }

  /** 记录已下载文件到 localStorage */
  function markFileDownloaded(filename) {
    const list = storage.getItem("downloaded_files") || [];
    if (!list.includes(filename)) {
      list.push(filename);
      storage.setItem("downloaded_files", list);
    }
  }

  /** 从 localStorage 移除已下载文件记录 */
  function markFileRemoved(filename) {
    const list = storage.getItem("downloaded_files") || [];
    storage.setItem(
      "downloaded_files",
      list.filter((f) => f !== filename),
    );
  }

  /**
   * 下载单个题库文件并写入 IndexedDB
   */
  async function downloadFile(filename) {
    fileStatus.value[filename] = "downloading";
    try {
      const questions = await API.fetchQuestionFile(filename);
      const grouped = {};
      for (const q of questions) {
        const subject = q.meta?.subject;
        if (!subject) continue;
        if (!grouped[subject]) grouped[subject] = [];
        grouped[subject].push(q);
      }
      for (const [subject, qs] of Object.entries(grouped)) {
        await bankStorage.setBank(subject, qs);
      }
      // 同步内存缓存
      API.populateCache(grouped);
      fileStatus.value[filename] = "cached";
      markFileDownloaded(filename);
      storage.setItem("bank_version", String(API.computeBankHash()));
    } catch (e) {
      console.error(`下载文件失败: ${filename}`, e);
      fileStatus.value[filename] = "error";
    }
  }

  /**
   * 删除单个题库文件的缓存
   */
  async function deleteFile(filename) {
    const manifest = API.getFileManifest();
    const file = manifest.find((f) => f.filename === filename);
    if (file) {
      for (const subject of file.subjects) {
        await bankStorage.removeBank(subject);
      }
    }
    fileStatus.value[filename] = "idle";
    markFileRemoved(filename);
  }

  /**
   * 下载所有未缓存的文件（增量下载）
   */
  async function downloadAllFiles(onProgress, signal) {
    const manifest = API.getFileManifest();
    const uncached = manifest.filter(
      (f) => fileStatus.value[f.filename] !== "cached",
    );
    if (uncached.length === 0) return;
    for (let i = 0; i < uncached.length; i++) {
      if (signal?.aborted) break;
      await downloadFile(uncached[i].filename);
      if (onProgress) onProgress(i + 1, uncached.length);
    }
    storage.setItem("bank_version", String(API.computeBankHash()));
  }

  /**
   * 后台下载所有题目文件并写入 IndexedDB（保留兼容）
   */
  async function downloadAndCacheAll(onProgress, signal) {
    const grouped = await API.fetchAllQuestionFiles(onProgress, signal);
    const promises = Object.entries(grouped).map(([subject, questions]) =>
      bankStorage.setBank(subject, questions),
    );
    await Promise.all(promises);
    // 记录所有文件已下载
    const manifest = API.getFileManifest();
    storage.setItem(
      "downloaded_files",
      manifest.map((f) => f.filename),
    );
    storage.setItem("bank_version", String(API.computeBankHash()));
  }

  /**
   * 阻塞式加载题库（显示全局 loading）
   * 用于首次启动和手动刷新
   */
  async function loadQuestions() {
    loading.value = true;
    loadingText.value = "加载题库...";
    loadingProgress.value = 0;

    try {
      // 检测 file:// 协议，fetch 在该协议下会无限挂起
      if (location.protocol === "file:") {
        throw new Error(
          "不支持 file:// 协议，请使用本地服务器运行 (如: npx vite preview)",
        );
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      await downloadAndCacheAll((cur, total) => {
        loadingText.value = `下载题库 ${cur}/${total}`;
        loadingProgress.value = Math.round((cur / total) * 100);
      }, controller.signal);
      clearTimeout(timeout);
    } catch (e) {
      console.error("加载题库失败:", e);
      if (e.name === "AbortError") {
        loadingText.value = "题库较大，加载超时，请刷新页面";
      } else {
        loadingText.value = e.message || "加载失败";
      }
      await new Promise((r) => setTimeout(r, 3000));
    } finally {
      loading.value = false;
      loadingProgress.value = 0;
      setTimeout(() => {
        loadingText.value = "";
      }, 100);
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
    const storedVer = storage.getItem("bank_version");
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
    storage.removeItem("bank_version");
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
      console.error("后台更新题库失败:", e);
    }
  }

  // ========== 错题本 Actions ==========

  /**
   * 加载错题本
   */
  async function loadWrongBook() {
    try {
      wrongBook.value = await userRepository.getWrongBook();
    } catch (e) {
      console.error("加载错题本失败，降级到本地存储", e);
      wrongBook.value = schemaRead(STORAGE_KEY.USER_WRONG_BOOK) || [];
    }
  }

  /**
   * 添加错题
   */
  async function addWrongQuestion(question) {
    try {
      await userRepository.addWrongQuestion(question);
      wrongBook.value = await userRepository.getWrongBook();
    } catch (e) {
      console.error("添加错题失败，降级到本地存储", e);
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
  }

  /**
   * 移除错题
   */
  async function removeWrongQuestion(questionId) {
    try {
      await userRepository.removeWrongQuestion(questionId);
      wrongBook.value = await userRepository.getWrongBook();
    } catch (e) {
      console.error("移除错题失败，降级到本地存储", e);
      wrongBook.value = wrongBook.value.filter((q) => q.id !== questionId);
      schemaWrite(STORAGE_KEY.USER_WRONG_BOOK, wrongBook.value);
    }
  }

  // ========== 收藏 Actions ==========

  /**
   * 加载收藏
   */
  async function loadFavorites() {
    try {
      favorites.value = await userRepository.getFavorites();
    } catch (e) {
      console.error("加载收藏失败，降级到本地存储", e);
      favorites.value = schemaRead(STORAGE_KEY.USER_FAVORITES) || [];
    }
  }

  /**
   * 添加收藏
   */
  async function addFavorite(question) {
    try {
      await userRepository.addFavorite(question);
      favorites.value = await userRepository.getFavorites();
    } catch (e) {
      console.error("添加收藏失败，降级到本地存储", e);
      const exists = favorites.value.find((q) => q.id === question.id);
      if (!exists) {
        favorites.value.push({
          ...question,
          favoriteTime: Date.now(),
        });
        schemaWrite(STORAGE_KEY.USER_FAVORITES, favorites.value);
      }
    }
  }

  /**
   * 移除收藏
   */
  async function removeFavorite(questionId) {
    try {
      await userRepository.removeFavorite(questionId);
      favorites.value = await userRepository.getFavorites();
    } catch (e) {
      console.error("移除收藏失败，降级到本地存储", e);
      favorites.value = favorites.value.filter((q) => q.id !== questionId);
      schemaWrite(STORAGE_KEY.USER_FAVORITES, favorites.value);
    }
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
  async function savePracticeProgress(key, progress) {
    if (!key) return;
    try {
      await userRepository.savePracticeProgress(key, progress);
      practiceProgress.value = await userRepository.getPracticeProgress();
    } catch (e) {
      console.error("保存练习进度失败，降级到本地存储", e);
      practiceProgress.value[key] = progress;
      schemaWrite(STORAGE_KEY.PRACTICE_PROGRESS, practiceProgress.value);
    }
  }

  /**
   * 清除某科目的练习进度
   * @param {string} key - category_scope_subject
   */
  async function clearPracticeProgress(key) {
    if (!key) return;
    try {
      await userRepository.clearPracticeProgress(key);
      practiceProgress.value = await userRepository.getPracticeProgress();
    } catch (e) {
      console.error("清除练习进度失败，降级到本地存储", e);
      delete practiceProgress.value[key];
      schemaWrite(STORAGE_KEY.PRACTICE_PROGRESS, practiceProgress.value);
    }
  }

  /**
   * 从 localStorage 加载练习进度 map
   */
  async function loadPracticeProgress() {
    try {
      practiceProgress.value = await userRepository.getPracticeProgress();
    } catch (e) {
      console.error("加载练习进度失败，降级到本地存储", e);
      practiceProgress.value = loadPracticeProgressFromUtil();
    }
  }

  // ========== 练习 History Actions ==========

  /**
   * 添加练习历史
   */
  async function addPracticeHistory(history) {
    try {
      await userRepository.addPracticeHistory(history);
      practiceHistory.value = await userRepository.getPracticeHistory();
    } catch (e) {
      console.error("添加练习历史失败，降级到本地存储", e);
      practiceHistory.value.unshift({
        ...history,
        timestamp: Date.now(),
      });
      schemaWrite(STORAGE_KEY.PRACTICE_HISTORY, practiceHistory.value);
    }
  }

  /**
   * 加载练习历史
   */
  async function loadPracticeHistory() {
    try {
      practiceHistory.value = await userRepository.getPracticeHistory();
    } catch (e) {
      console.error("加载练习历史失败，降级到本地存储", e);
      practiceHistory.value = schemaRead(STORAGE_KEY.PRACTICE_HISTORY) || [];
    }
  }

  // ========== 初始化 ==========

  /**
   * 初始化所有数据
   * 扫描已有缓存 → 全部已缓存则直接进入，否则不阻塞（用户手动下载）
   */
  async function init() {
    try {
      await userRepository.initUserRepository();
      const currentUserId = userRepository.getCurrentUserId();
      if (currentUserId) {
        userRepository.setCurrentUser(currentUserId);
      }
    } catch (e) {
      console.error("初始化用户仓库失败:", e);
    }

    loadBankMeta();
    await loadWrongBook();
    await loadFavorites();
    await loadPracticeProgress();
    await loadPracticeHistory();
    await loadExamPapers();
    await loadExamPresets();

    // 应用版本追踪
    const prevAppVer = storage.getItem(STORAGE_KEY.APP_VERSION);
    if (prevAppVer && prevAppVer !== APP_VERSION) {
      console.log(`应用版本更新: ${prevAppVer} → ${APP_VERSION}`);
    }
    storage.setItem(STORAGE_KEY.APP_VERSION, APP_VERSION);

    // 扫描已有缓存，确定每个文件的状态
    await initFileStatus();

    const manifest = API.getFileManifest();
    const allCached = manifest.every(
      (f) => fileStatus.value[f.filename] === "cached",
    );

    if (allCached) {
      // 全部已缓存：填充内存缓存，后台检测更新
      populateCacheFromIndexedDB();
      checkForUpdatesInBackground();
    }
    // 有未缓存文件：不阻塞应用，用户可从数据管理页手动下载
  }

  /**
   * 加载试卷列表
   */
  async function loadExamPapers() {
    try {
      examPapers.value = await userRepository.getExamPapers();
    } catch (e) {
      console.error("加载试卷失败，降级到本地存储", e);
      examPapers.value = schemaRead(STORAGE_KEY.EXAM_PAPERS) || [];
    }
  }

  /**
   * 添加试卷
   */
  async function addExamPaper(paper) {
    try {
      await userRepository.addExamPaper(paper);
      examPapers.value = await userRepository.getExamPapers();
    } catch (e) {
      console.error("添加试卷失败，降级到本地存储", e);
      examPapers.value.unshift(paper);
      schemaWrite(STORAGE_KEY.EXAM_PAPERS, examPapers.value);
    }
  }

  /**
   * 删除试卷
   */
  async function removeExamPaper(paperId) {
    try {
      await userRepository.removeExamPaper(paperId);
      examPapers.value = await userRepository.getExamPapers();
    } catch (e) {
      console.error("删除试卷失败，降级到本地存储", e);
      examPapers.value = examPapers.value.filter((p) => p.id !== paperId);
      schemaWrite(STORAGE_KEY.EXAM_PAPERS, examPapers.value);
    }
  }

  /**
   * 加载预设
   */
  async function loadExamPresets() {
    try {
      examPresets.value = await userRepository.getExamPresets();
    } catch (e) {
      console.error("加载预设失败，降级到本地存储", e);
      examPresets.value = schemaRead(STORAGE_KEY.EXAM_PRESETS) || [];
    }
  }

  /**
   * 保存预设
   */
  async function saveExamPreset(preset) {
    try {
      await userRepository.saveExamPreset(preset);
      examPresets.value = await userRepository.getExamPresets();
    } catch (e) {
      console.error("保存预设失败，降级到本地存储", e);
      const existing = schemaRead(STORAGE_KEY.EXAM_PRESETS) || [];
      existing.push(preset);
      schemaWrite(STORAGE_KEY.EXAM_PRESETS, existing);
      examPresets.value = existing;
    }
  }

  /**
   * 删除预设
   */
  async function deleteExamPreset(presetId) {
    try {
      await userRepository.deleteExamPreset(presetId);
      examPresets.value = await userRepository.getExamPresets();
    } catch (e) {
      console.error("删除预设失败，降级到本地存储", e);
      const existing = schemaRead(STORAGE_KEY.EXAM_PRESETS) || [];
      const filtered = existing.filter((p) => p.id !== presetId);
      schemaWrite(STORAGE_KEY.EXAM_PRESETS, filtered);
      examPresets.value = filtered;
    }
  }

  /**
   * 验证试卷数据结构
   * @param {Object} paper - 试卷对象
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  function validatePaper(paper) {
    const errors = [];

    if (!paper.title || !paper.title.trim()) {
      errors.push("缺少试卷标题");
    }

    if (!paper.questions || !Array.isArray(paper.questions)) {
      errors.push("题目格式无效");
    }

    if (paper.questions && paper.questions.length > 0) {
      paper.questions.forEach((q, index) => {
        if (!q.meta) {
          errors.push(`第${index + 1}题：缺少 meta 信息`);
        } else {
          if (!q.meta.category) {
            errors.push(`第${index + 1}题：缺少 category`);
          }
          if (!q.meta.scope) {
            errors.push(`第${index + 1}题：缺少 scope`);
          }
          if (!q.meta.subject) {
            errors.push(`第${index + 1}题：缺少 subject`);
          }
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 导出试卷为 JSON 文件
   */
  function exportPaper(paper) {
    const json = JSON.stringify(paper, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTitle = paper.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_");
    a.download = `ATCTest考卷_${safeTitle}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 导入试卷
   */
  function importPaper(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const paper = JSON.parse(e.target.result);

          const validation = validatePaper(paper);
          if (!validation.valid) {
            reject(new Error(validation.errors.join("; ")));
            return;
          }

          paper.id = Date.now();
          paper.createdAt = Date.now();

          paper.questions = paper.questions.map((q, index) => ({
            ...q,
            id: paper.id * 1000 + index,
          }));

          addExamPaper(paper);
          resolve(paper);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("文件读取失败"));
      reader.readAsText(file);
    });
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
    fileStatus,
    loadQuestions,
    loadBankMeta,
    loadSubjectQuestions,
    getSubjectQuestions,
    checkForUpdates,
    forceRefreshQuestions,
    initFileStatus,
    downloadFile,
    deleteFile,
    downloadAllFiles,

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
