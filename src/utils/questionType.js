// ==================== 类型判断 ====================

/**
 * 判断是否为复合题型
 * @param {Object} question - 题目对象
 * @returns {boolean}
 */
export function isCompoundQuestion(question) {
  return question?.type === 'reading' && question?.subs?.length > 0
}

/**
 * 获取题型显示键名
 * @param {string} type - 题型类型
 * @returns {string}
 */
export function getQuestionTypeKey(type) {
  const map = {
    single: 'single',
    multiple: 'multiple',
    boolean: 'boolean',
    fillin: 'fillin',
    essay: 'essay',
    reading: 'reading'
  }
  return map[type] || type
}

// ==================== 题目数量 ====================

/**
 * 计算总题数（展开复合题型）
 * @param {Array} questions - 题目数组
 * @returns {number}
 */
export function countTotalQuestions(questions) {
  if (!Array.isArray(questions)) return 0
  return questions.reduce((total, q) => {
    return total + (isCompoundQuestion(q) ? q.subs.length : 1)
  }, 0)
}

// ==================== 答案扁平化（统计用）====================

/**
 * 扁平化答案数据（用于统计）
 * @param {Object} answers - 答案对象
 * @returns {Array} 扁平化后的数组 [{ questionId, subIndex?, status }]
 */
export function flattenAnswers(answers) {
  const result = []
  if (!answers || typeof answers !== 'object') return result

  Object.entries(answers).forEach(([questionId, data]) => {
    // 判断是否为复合题型（嵌套结构）
    // 复合题型: data 是对象但没有 status 属性，是 { 0: 'correct', 1: 'wrong' }
    // 基础题型: data 是对象且有 status 属性
    if (data && typeof data === 'object' && !Array.isArray(data) && !('status' in data)) {
      // 复合题型：遍历子题状态
      Object.entries(data).forEach(([subIdx, status]) => {
        if (status && typeof status === 'string') {
          result.push({ questionId, subIndex: parseInt(subIdx), status })
        }
      })
    } else {
      // 基础题型
      const status = data?.status || data
      if (status && typeof status === 'string') {
        result.push({ questionId, status })
      }
    }
  })
  return result
}

// ==================== 状态标准化 ====================

/**
 * 标准化答案状态
 * @param {string} status - 原始状态
 * @returns {string} 标准化后的状态
 */
export function normalizeStatus(status) {
  if (!status) return 'unanswered'
  if (status === 'partial') return 'wrong'
  if (status === 'unchecked') return 'unanswered'
  return status
}

// ==================== 数据打包/解包 ====================

/**
 * 打包答案数据（统一存储格式）
 * @param {Object} userAnswers - 用户答案
 * @param {Object} answerChecked - 检查状态
 * @param {Object} answerStatus - 答案状态
 * @returns {Object} 打包后的数据
 */
export function packAnswers(userAnswers, answerChecked, answerStatus) {
  const result = {}
  if (!userAnswers) return result

  Object.keys(userAnswers).forEach(questionId => {
    const userAns = userAnswers[questionId]
    const checked = answerChecked?.[questionId]
    const status = answerStatus?.[questionId]

    // 检测是否为复合题型
    const isCompound = userAns && typeof userAns === 'object' && !Array.isArray(userAns)

    if (isCompound) {
      // 复合题型：保留嵌套结构
      result[questionId] = {
        selected: userAns,
        checked: checked,
        status: status
      }
    } else {
      // 基础题型
      result[questionId] = {
        selected: userAns,
        checked: checked || false,
        status: status || 'unanswered'
      }
    }
  })

  return result
}

/**
 * 解包答案数据（统一读取格式）
 * @param {Object} packedAnswers - 打包后的数据
 * @returns {Object} { userAnswers, answerChecked, answerStatus }
 */
export function unpackAnswers(packedAnswers) {
  const userAnswers = {}
  const answerChecked = {}
  const answerStatus = {}

  if (!packedAnswers) return { userAnswers, answerChecked, answerStatus }

  Object.entries(packedAnswers).forEach(([questionId, data]) => {
    if (data && typeof data === 'object') {
      userAnswers[questionId] = data.selected
      answerChecked[questionId] = data.checked
      answerStatus[questionId] = data.status
    } else {
      userAnswers[questionId] = data
    }
  })

  return { userAnswers, answerChecked, answerStatus }
}