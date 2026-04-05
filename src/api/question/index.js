const QUESTION_FILES = {
  atc: {
    base: '/data/atc/base.json',
    professional: '/data/atc/professional.json',
    english: '/data/atc/english_translated.json'
  },
  airport:{},
  airlines:{}
}

function transformQuestion(q) {
  const difficultyMap = { 1: 'easy', 2: 'medium', 3: 'hard' }
  
  const getType = (type) => {
    const typeMap = {
      'single': 'single',
      'multiple': 'multiple',
      'reading': 'reading',
      'fill': 'fillin',
      'fillin': 'fillin',
      'essay': 'essay',
      'subjective': 'essay',
      'boolean': 'boolean',
      'judge': 'boolean',
      'translation': 'translation',
      'translate': 'translation'
    }
    return typeMap[type] || 'unknown'
  }

  const transformSub = (sub) => {
    const subType = getType(sub.type)
    const subIsBoolean = subType === 'boolean'
    return {
      id: sub.sid,
      type: subType,
      content: sub.stem,
      options: subIsBoolean
        ? [
            { key: 'A', value: '正确' },
            { key: 'B', value: '错误' }
          ]
        : sub.options?.map((opt, i) => {
            const key = String.fromCharCode(65 + i)
            return { key, value: opt.replace(/^[A-Z]\.\s*/, '') }
          }) || [],
      correctAnswer: sub.answer?.[0]?.replace(/[A-Z]\.\s*/, '').trim() || '',
      explanation: sub.explanation || '',
      difficulty: difficultyMap[sub.difficulty] || 'medium'
    }
  }

  const type = getType(q.type)
  const isBoolean = type === 'boolean'
  const hasOptions = !['boolean', 'fillin', 'essay', 'translation'].includes(type)

  const getOptions = (opts, isBool) => {
    if (isBool) {
      return [
        { key: 'A', value: '正确' },
        { key: 'B', value: '错误' }
      ]
    }
    return opts?.map((opt, i) => {
      const key = String.fromCharCode(65 + i)
      return { key, value: opt.replace(/^[A-Z]\.\s*/, '') }
    }) || []
  }

  return {
    id: q.id,
    subject: q.meta?.subject || 'unknown',
    category: q.meta?.category || 'unknown',
    scope: q.meta?.scope || 'unknown',
    type,
    difficulty: difficultyMap[q.difficulty] || 'unknown',
    content: q.stem,
    options: hasOptions ? getOptions(q.options, isBoolean) : [],
    correctAnswer: q.answer?.[0]?.replace(/[A-Z]\.\s*/, '').trim() || '',
    explanation: q.explanation || '',
    topic: q.meta?.topic || '',
    media: q.media,
    article: q.media?.article || null,
    subs: q.subs?.map(transformSub) || null
  }
}

async function loadQuestions(filePath) {
  const response = await fetch(filePath)
  if (!response.ok) throw new Error(`加载失败: ${filePath}`)
  const data = await response.json()
  return data.map(transformQuestion)
}

export const questionApi = {
  async getQuestions(scope = 'all') {
    const scopes = scope === 'all' 
      ? Object.keys(QUESTION_FILES)
      : scope.split(',')
    
    const results = await Promise.all(
      scopes.map(s => loadQuestions(QUESTION_FILES[s]).catch(() => []))
    )
    return results.flat()
  },

  async getQuestionsByScope(scope) {
    return loadQuestions(QUESTION_FILES[scope])
  },

  getScopes() {
    return Object.keys(QUESTION_FILES)
  },

  async fetchFromApi(url) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }
    const data = await response.json()
    const questions = data.questions?.map((q, index) => {
      const content = q.content || q.stem || q.question || ''
      const isReading = q.type === 'reading' || (q.subs && q.subs.length > 0)
      return transformQuestion({
        id: q.id || `API_${Date.now()}_${index}`,
        meta: { 
          subject: q.subject || q.subjectName || 'API题库', 
          category: q.category || 'api',
          scope: q.scope || 'api', 
          topic: q.topic || '' 
        },
        type: isReading ? 'reading' : q.type,
        difficulty: { easy: 1, medium: 2, hard: 3, 1: 1, 2: 2, 3: 3 }[q.difficulty] || 2,
        stem: content,
        options: q.options || q.choices || [],
        answer: q.correctAnswer || q.answer ? [q.correctAnswer || q.answer] : [],
        explanation: q.explanation || q.explain || '',
        media: q.article ? { article: q.article } : null,
        subs: q.subs?.map((s, i) => ({
          sid: s.id || s.sid || `SUB_${Date.now()}_${index}_${i}`,
          type: s.type,
          stem: s.content || s.stem || s.question || '',
          options: s.options || s.choices || [],
          answer: s.correctAnswer || s.answer ? [s.correctAnswer || s.answer] : [],
          explanation: s.explanation || s.explain || '',
          difficulty: { easy: 1, medium: 2, hard: 3, 1: 1, 2: 2, 3: 3 }[s.difficulty] || 2
        })) || null
      })
    }) || []
    return questions
  },

  async getCategories(scope = 'all') {
    const questions = await this.getQuestions(scope)
    const categoryMap = new Map()
    questions.forEach(q => {
      if (!categoryMap.has(q.category)) {
        categoryMap.set(q.category, { id: q.category, name: q.subject, count: 0 })
      }
      categoryMap.get(q.category).count++
    })
    return Array.from(categoryMap.values())
  },

  getQuestionById(id, scope = 'all') {
    return this.getQuestions(scope).then(questions => 
      questions.find(q => q.id === id)
    )
  },

  filterQuestions(questions, { subject, category, difficulty, type, keyword }) {
    let result = [...questions]
    if (subject) result = result.filter(q => q.subject === subject)
    if (category) result = result.filter(q => q.category === category)
    if (difficulty) result = result.filter(q => q.difficulty === difficulty)
    if (type) result = result.filter(q => q.type === type)
    if (keyword) {
      const kw = keyword.toLowerCase()
      result = result.filter(q => {
        if (q.type === 'reading') {
          return (q.article || '').toLowerCase().includes(kw) ||
                 q.subs?.some(s => s.content.toLowerCase().includes(kw))
        }
        return (q.content || '').toLowerCase().includes(kw)
      })
    }
    return result
  },

  exportQuestions(questions) {
    const data = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      totalCount: questions.length,
      questions: questions.map(q => {
        const base = {
          id: q.id,
          subject: q.subject,
          category: q.category,
          type: q.type,
          difficulty: q.difficulty
        }
        
        if (q.type === 'reading') {
          return {
            ...base,
            article: q.article,
            subs: q.subs?.map(s => ({
              id: s.id,
              type: s.type,
              content: s.content,
              options: s.type === 'boolean' 
                ? ['A. 正确', 'B. 错误'] 
                : s.options.map(o => `${o.key}. ${o.value}`),
              correctAnswer: s.correctAnswer,
              explanation: s.explanation,
              difficulty: s.difficulty
            }))
          }
        }
        
        if (['boolean', 'fillin', 'essay', 'translation'].includes(q.type)) {
          return {
            ...base,
            content: q.content,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          }
        }
        
        return {
          ...base,
          content: q.content,
          options: q.options.map(o => `${o.key}. ${o.value}`),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        }
      })
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `题库导出_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    return Promise.resolve(true)
  },

  async importQuestions(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (!data.questions || !Array.isArray(data.questions)) {
            reject(new Error('文件格式错误：缺少questions数组'))
            return
          }
          const questions = data.questions.map((q, index) => {
            const content = q.content || q.stem || q.question || ''
            const options = q.options || q.choices || []
            const difficultyVal = q.difficulty || 2
            const difficultyMap = { 1: 'easy', 2: 'medium', 3: 'hard', easy: 'easy', medium: 'medium', hard: 'hard' }
            const difficulty = typeof difficultyVal === 'string' ? (difficultyMap[difficultyVal] || 'medium') : (difficultyMap[difficultyVal] || 'medium')
            
            const isReading = q.type === 'reading' || (q.subs && q.subs.length > 0)
            
            const rawQ = {
              id: q.id || `IMPORT_${Date.now()}_${index}`,
              meta: { 
                subject: q.subject || q.subjectName || '导入题库', 
                category: q.category || 'imported',
                scope: q.scope || 'imported', 
                topic: q.topic || '' 
              },
              type: isReading ? 'reading' : (q.type || 'single'),
              difficulty: { easy: 1, medium: 2, hard: 3 }[difficulty] || 2,
              stem: content,
              options: Array.isArray(options) ? options : [],
              answer: q.correctAnswer || q.answer ? [q.correctAnswer || q.answer] : [],
              explanation: q.explanation || q.explain || '',
              media: q.article ? { article: q.article } : null,
              subs: q.subs?.map((s, i) => {
                const subContent = s.content || s.stem || s.question || ''
                const subOptions = s.options || s.choices || []
                const subDiff = s.difficulty || 2
                const subDiffStr = typeof subDiff === 'string' ? (difficultyMap[subDiff] || 'medium') : (difficultyMap[subDiff] || 'medium')
                return {
                  sid: s.id || s.sid || `SUB_${Date.now()}_${index}_${i}`,
                  type: s.type || 'single',
                  stem: subContent,
                  options: Array.isArray(subOptions) ? subOptions : [],
                  answer: s.correctAnswer || s.answer ? [s.correctAnswer || s.answer] : [],
                  explanation: s.explanation || s.explain || '',
                  difficulty: { easy: 1, medium: 2, hard: 3 }[subDiffStr] || 2
                }
              }) || null
            }
            return transformQuestion(rawQ)
          })
          resolve(questions)
        } catch (err) {
          reject(new Error('文件解析失败：请检查JSON格式'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }
}