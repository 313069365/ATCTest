import { ref, computed } from 'vue'

export const STORAGE_KEY = {
  // 应用全局通用
  APP: '',
    
  // 题库相关
  BANK: 'bank_',
  BANK_HASH: 'bank_hash_',

  // 练习相关  PRACTICE
  PRACTICE_PROGRESS: 'practice_progress',  // 题库（分类/范围/科目），模式，进度，作答记录
  PRACTICE_HISTORY: 'practice_history',    // 题库（分类/范围/科目），模式，进度，作答记录

  // 考试相关 EXAM
  EXAM_PAPERS: 'exam_papers',        // 考试卷信息：试卷ID，试卷名称，试卷类型，试卷时间，试卷题目数量，试卷题目信息
  EXAM_PRESETS: 'exam_presets',      // 考试预设：  题库范围科目，数量，分值等的组合
  EXAM_HISTORY: 'exam_history',      // 考试历史记录：考试ID，考试时间，考试成绩，考试题目数量，考试题目

  // 用户相关 USER
  USER_INFO: 'user_info',             // 用户信息：用户名，密码，邮箱，手机号，角色，状态
  USER_WRONG_BOOK: 'user_wrongbook',  // 用户错误的题目：题目ID（题干，正确完整答案），错误次数，错误时间
  USER_FAVORITES: 'user_favorites',    // 用户收藏的题目：题目ID（题干，正确答案）收藏时间
  
  // 统计相关 STATS
  STATS_TODAY: 'stats_today',         // 今日统计：今日练习数量， 正确率
  STATS_TOTAL: 'stats_total',         // 总统计：练习天数；练习次数，正确率；考试次数，平均分，通过率; 总做题数量（包含重复）正确题目数量，错误题目数量，总正确率
  STATS_SUBJECT: 'stats_subject',     // 科目统计：科目，正确题目数量，错误题目数量，正确率

}