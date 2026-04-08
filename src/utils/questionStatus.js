/**
 * 题型状态工具
 * 统一管理题型分类、状态映射等逻辑
 * 
 * 使用方式：
 * import { canAutoCheck, getStatusClass, getStatusColor } from '@/utils/questionStatus'
 */

/**
 * 可自动批改的题型（立即显示模式下自动检查）
 */
export const AUTO_CHECK_TYPES = ['single', 'boolean', 'media']

/**
 * 需要手动检查的题型（按需显示模式）
 */
export const MANUAL_CHECK_TYPES = ['multiple', 'fillin', 'essay', 'translation', 'reading']

/**
 * 复合题型（包含子题）
 */
export const COMPOSITE_TYPES = ['reading']

/**
 * 状态到 CSS 类名的映射
 */
export const STATUS_CLASS_MAP = {
  correct: 'correct',
  wrong: 'wrong',
  partial: 'wrong',
  unknown: 'unknown',
  unchecked: '',
  unanswered: '',
  '': ''
}

/**
 * 状态到颜色的映射（用于图例）
 */
export const STATUS_COLOR_MAP = {
  correct: 'var(--success)',
  wrong: 'var(--error)',
  partial: 'var(--error)',
  unknown: 'var(--warning)',
  unchecked: 'var(--color-gray-400)',
  unanswered: 'var(--color-gray-400)',
  '': 'var(--color-gray-400)'
}

/**
 * 判断题型是否可自动批改
 * @param {string} questionType - 题型
 * @returns {boolean}
 */
export function canAutoCheck(questionType) {
  return AUTO_CHECK_TYPES.includes(questionType)
}

/**
 * 判断题型是否需要手动检查
 * @param {string} questionType - 题型
 * @returns {boolean}
 */
export function needsManualCheck(questionType) {
  return MANUAL_CHECK_TYPES.includes(questionType)
}

/**
 * 判断是否为复合题型（包含子题）
 * @param {string} questionType - 题型
 * @returns {boolean}
 */
export function isCompositeType(questionType) {
  return COMPOSITE_TYPES.includes(questionType)
}

/**
 * 根据状态获取 CSS 类名
 * @param {string} status - 答案状态
 * @param {object} options - 选项
 * @param {boolean} options.isCurrent - 是否当前题目
 * @param {string} options.mode - 练习模式
 * @returns {string}
 */
export function getStatusClass(status, options = {}) {
  const { isCurrent = false, mode = 'answer' } = options

  // 背题模式
  if (mode === 'review') {
    return isCurrent ? 'current' : ''
  }

  // 未答题
  if (!status || status === 'unanswered') {
    return isCurrent ? 'current' : ''
  }

  // 获取标准类名
  const baseClass = STATUS_CLASS_MAP[status] || ''
  
  // 当前题目 + 有状态 = 返回组合类名
  if (isCurrent && baseClass) {
    return `current-${baseClass}`
  }
  
  // 非当前题目
  return baseClass
}

/**
 * 根据状态获取颜色
 * @param {string} status - 答案状态
 * @returns {string}
 */
export function getStatusColor(status) {
  return STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP['']
}

/**
 * 获取当前题目的组合类名（带边框）
 * @param {string} status - 答案状态
 * @param {string} mode - 练习模式
 * @returns {string}
 */
export function getCurrentStatusClass(status, mode = 'answer') {
  if (mode === 'review') return 'current'
  
  if (!status || status === 'unanswered') return 'current'
  
  const baseClass = STATUS_CLASS_MAP[status] || ''
  return baseClass ? `current-${baseClass}` : 'current'
}

/**
 * 标准化状态（将 partial 归为 wrong 等）
 * @param {string} status - 原始状态
 * @returns {string}
 */
export function normalizeStatus(status) {
  if (!status) return ''
  if (status === 'partial') return 'wrong'
  if (status === 'unchecked') return ''
  return status
}