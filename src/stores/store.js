/**
 * 应用 Store
 * 统一管理所有状态，遵循: API -> Storage -> Store -> 页面的数据流
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as API from '@/api/dataSource'
import { storage, STORAGE_KEY } from '@/composables/useStorage'

export const useAppStore = defineStore('app', () => {
  // ========== 题库相关 (BANK) ==========
  
  /** 原始题库数据 */
  const rawQuestions = ref([])
  
  /** 题库加载状态 */
  const loading = ref(false)
  
  /** 题库结构（自动发现） */
  const questionBankStructure = ref({})

  // ========== 用户相关 (USER) ==========
  
  /** 错题本 (USER_WRONG_BOOK) */
  const wrongBook = ref([])
  
  /** 收藏题目 (USER_FAVORITES) */
  const favorites = ref([])
  
  // ========== 练习相关 (PRACTICE) ==========
  
  /** 练习进度 (PRACTICE_PROGRESS) */
  const practiceProgress = ref(null)
  
  /** 练习历史 (PRACTICE_HISTORY) */
  const practiceHistory = ref([])
  
  // ========== 考试相关 (EXAM) ==========
  
  /** 考试卷 (EXAM_PAPERS) */
  const examPapers = ref([])
  
  /** 考试预设 (EXAM_PRESETS) */
  const examPresets = ref([])
  
  /** 考试历史 (EXAM_HISTORY) */
  const examHistory = ref([])
  
  // ========== 统计相关 (STATS) ==========
  
  /** 今日统计 (STATS_TODAY) */
  const statsToday = ref({ count: 0, correct: 0 })
  
  /** 总统计 (STATS_TOTAL) */
  const statsTotal = ref({ days: 0, totalCount: 0, correctCount: 0 })
  
  /** 科目统计 (STATS_SUBJECT) */
  const statsSubject = ref({})
  
  // ========== 计算属性 ==========
  
  /** 按科目分组的题目统计 */
  const questionsBySubject = computed(() => {
    const grouped = {}
    rawQuestions.value.forEach(q => {
      const key = `${q.meta.category}_${q.meta.scope}_${q.meta.subject}`
      if (!grouped[key]) {
        grouped[key] = {
          category: q.meta.category,
          scope: q.meta.scope,
          subject: q.meta.subject,
          count: 0
        }
      }
      grouped[key].count++
    })
    return Object.values(grouped)
  })
  
  /** 题库大类列表 */
  const questionBanks = computed(() => {
    return Object.keys(questionBankStructure.value)
  })
  
  /** 错题数量 */
  const wrongBookCount = computed(() => wrongBook.value.length)
  
  /** 收藏数量 */
  const favoritesCount = computed(() => favorites.value.length)
  
  // ========== 题库 Actions ==========
  
  /**
   * 加载题库数据
   * 优先从 Storage 读取，失败则从 dataSource 获取并存储
   */
  async function loadQuestions() {
    loading.value = true
    
    try {
      // 1. 尝试从 Storage 获取
      const cached = storage.getItem(STORAGE_KEY.BANK)
      
      if (cached && cached.length > 0) {
        console.log('从 Storage 加载题库')
        rawQuestions.value = cached
      } else {
        // 2. 从 dataSource 获取并存储
        console.log('从 dataSource 加载题库')
        const data = await API.fetchAllQuestions()
        rawQuestions.value = data
        storage.setItem(STORAGE_KEY.BANK, data)
      }
      
      // 3. 自动发现题库结构
      questionBankStructure.value = API.getQuestionBankStructure(rawQuestions.value)
    } catch (e) {
      console.error('加载题库失败:', e)
      // 降级：直接获取
      rawQuestions.value = await API.fetchAllQuestions()
      questionBankStructure.value = API.getQuestionBankStructure(rawQuestions.value)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取某个科目下的题目（带排序）
   */
  async function getSubjectQuestions(category, scope, subject, sortType = 'sequence') {
    let questions = await API.fetchSubjectQuestions(category, scope, subject)
    
    if (sortType === 'shuffle') {
      questions = [...questions].sort(() => Math.random() - 0.5)
    } else if (sortType === 'reverse') {
      questions = [...questions].reverse()
    }
    
    return questions
  }
  
  /**
   * 清除题库缓存
   */
  function clearQuestionsCache() {
    storage.removeItem(STORAGE_KEY.BANK)
    rawQuestions.value = []
  }
  
  // ========== 错题本 Actions ==========
  
  /**
   * 加载错题本
   */
  function loadWrongBook() {
    wrongBook.value = storage.getItem(STORAGE_KEY.USER_WRONG_BOOK) || []
  }
  
  /**
   * 添加错题
   */
  function addWrongQuestion(question) {
    const exists = wrongBook.value.find(q => q.id === question.id)
    if (!exists) {
      wrongBook.value.push({
        ...question,
        wrongTime: Date.now(),
        wrongCount: 1
      })
      storage.setItem(STORAGE_KEY.USER_WRONG_BOOK, wrongBook.value)
    }
  }
  
  /**
   * 移除错题
   */
  function removeWrongQuestion(questionId) {
    wrongBook.value = wrongBook.value.filter(q => q.id !== questionId)
    storage.setItem(STORAGE_KEY.USER_WRONG_BOOK, wrongBook.value)
  }
  
  // ========== 收藏 Actions ==========
  
  /**
   * 加载收藏
   */
  function loadFavorites() {
    favorites.value = storage.getItem(STORAGE_KEY.USER_FAVORITES) || []
  }
  
  /**
   * 添加收藏
   */
  function addFavorite(question) {
    const exists = favorites.value.find(q => q.id === question.id)
    if (!exists) {
      favorites.value.push({
        ...question,
        favoriteTime: Date.now()
      })
      storage.setItem(STORAGE_KEY.USER_FAVORITES, favorites.value)
    }
  }
  
  /**
   * 移除收藏
   */
  function removeFavorite(questionId) {
    favorites.value = favorites.value.filter(q => q.id !== questionId)
    storage.setItem(STORAGE_KEY.USER_FAVORITES, favorites.value)
  }
  
  // ========== 练习 Progress Actions ==========
  
  /**
   * 保存练习进度
   */
  function savePracticeProgress(progress) {
    practiceProgress.value = progress
    storage.setItem(STORAGE_KEY.PRACTICE_PROGRESS, progress)
  }
  
  /**
   * 加载练习进度
   */
  function loadPracticeProgress() {
    practiceProgress.value = storage.getItem(STORAGE_KEY.PRACTICE_PROGRESS)
  }
  
  // ========== 练习 History Actions ==========
  
  /**
   * 添加练习历史
   */
  function addPracticeHistory(history) {
    practiceHistory.value.unshift({
      ...history,
      timestamp: Date.now()
    })
    storage.setItem(STORAGE_KEY.PRACTICE_HISTORY, practiceHistory.value)
  }
  
  /**
   * 加载练习历史
   */
  function loadPracticeHistory() {
    practiceHistory.value = storage.getItem(STORAGE_KEY.PRACTICE_HISTORY) || []
  }
  
  // ========== 统计 Actions ==========
  
  /**
   * 更新今日统计
   */
  function updateStatsToday(count, correct) {
    statsToday.value = { count, correct }
    storage.setItem(STORAGE_KEY.STATS_TODAY, statsToday.value)
  }
  
  /**
   * 加载统计
   */
  function loadStats() {
    statsToday.value = storage.getItem(STORAGE_KEY.STATS_TODAY) || { count: 0, correct: 0 }
    statsTotal.value = storage.getItem(STORAGE_KEY.STATS_TOTAL) || { days: 0, totalCount: 0, correctCount: 0 }
    statsSubject.value = storage.getItem(STORAGE_KEY.STATS_SUBJECT) || {}
  }
  
  // ========== 初始化 ==========
  
  /**
   * 初始化所有数据
   */
  function init() {
    loadQuestions()
    loadWrongBook()
    loadFavorites()
    loadPracticeProgress()
    loadPracticeHistory()
    loadStats()
  }
  
  // 导出
  return {
    // 题库状态
    rawQuestions,
    loading,
    questionBankStructure,
    questionBanks,
    questionsBySubject,
    loadQuestions,
    getSubjectQuestions,
    clearQuestionsCache,
    
    // 错题本
    wrongBook,
    wrongBookCount,
    addWrongQuestion,
    removeWrongQuestion,
    
    // 收藏
    favorites,
    favoritesCount,
    addFavorite,
    removeFavorite,
    
    // 练习
    practiceProgress,
    practiceHistory,
    savePracticeProgress,
    addPracticeHistory,
    
    // 统计
    statsToday,
    statsTotal,
    statsSubject,
    updateStatsToday,
    loadStats,
    
    // 初始化
    init
  }
})
