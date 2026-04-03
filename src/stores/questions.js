import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questionApi } from '@/api/question'

export const useQuestionStore = defineStore('questions', () => {
  const questions = ref([])
  const importedQuestions = ref([])
  const categories = ref([])
  const loadedScopes = ref([])
  const loading = ref(false)
  const currentFilter = ref({
    subject: '',
    category: '',
    difficulty: '',
    type: '',
    keyword: ''
  })

  const allQuestions = computed(() => [
    ...questions.value,
    ...importedQuestions.value
  ])

  const filteredQuestions = computed(() => {
    return questionApi.filterQuestions(allQuestions.value, currentFilter.value)
  })

  const questionCount = computed(() => allQuestions.value.length)

  const questionsByCategory = computed(() => {
    const map = {}
    allQuestions.value.forEach(q => {
      if (!map[q.category]) map[q.category] = []
      map[q.category].push(q)
    })
    return map
  })

  const questionsByDifficulty = computed(() => ({
    easy: allQuestions.value.filter(q => q.difficulty === 'easy').length,
    medium: allQuestions.value.filter(q => q.difficulty === 'medium').length,
    hard: allQuestions.value.filter(q => q.difficulty === 'hard').length
  }))

  const questionsByScope = computed(() => {
    const map = {}
    questions.value.forEach(q => {
      if (!map[q.category]) map[q.category] = 0
      map[q.category]++
    })
    return map
  })

  const questionTypeStats = computed(() => {
    const stats = { single: 0, multiple: 0, reading: 0, fillin: 0, essay: 0, boolean: 0, translation: 0 }
    allQuestions.value.forEach(q => {
      if (stats.hasOwnProperty(q.type)) {
        stats[q.type]++
      } else {
        stats.single++
      }
    })
    return stats
  })

  const totalSubQuestions = computed(() => {
    return allQuestions.value
      .filter(q => q.type === 'reading')
      .reduce((sum, q) => sum + (q.subs?.length || 0), 0)
  })

  async function loadQuestions(scope = 'all') {
    loading.value = true
    try {
      const [loadedQuestions, cats] = await Promise.all([
        questionApi.getQuestions(scope),
        questionApi.getCategories(scope)
      ])
      questions.value = loadedQuestions
      categories.value = cats
      loadedScopes.value = scope === 'all' 
        ? questionApi.getScopes()
        : scope.split(',')
    } finally {
      loading.value = false
    }
  }

  async function fetchFromApi(url) {
    loading.value = true
    try {
      const fetched = await questionApi.fetchFromApi(url)
      questions.value = [...questions.value, ...fetched]
      return { success: true, count: fetched.length }
    } finally {
      loading.value = false
    }
  }

  async function loadScope(scope) {
    if (loadedScopes.value.includes(scope)) return
    loading.value = true
    try {
      const newQuestions = await questionApi.getQuestionsByScope(scope)
      questions.value = [...questions.value, ...newQuestions]
      loadedScopes.value.push(scope)
      const cats = await questionApi.getCategories(scope)
      categories.value = [...categories.value, ...cats].reduce((acc, c) => {
        const exist = acc.find(e => e.id === c.id)
        if (exist) exist.count += c.count
        else acc.push(c)
        return acc
      }, [])
    } finally {
      loading.value = false
    }
  }

  async function importFromFile(file) {
    loading.value = true
    try {
      const imported = await questionApi.importQuestions(file)
      importedQuestions.value = [...importedQuestions.value, ...imported]
      return { success: true, count: imported.length }
    } finally {
      loading.value = false
    }
  }

  function exportToFile(questionsToExport) {
    const exportData = questionsToExport || allQuestions.value
    return questionApi.exportQuestions(exportData)
  }

  function setFilter(filter) {
    currentFilter.value = { ...currentFilter.value, ...filter }
  }

  function clearFilter() {
    currentFilter.value = { subject: '', category: '', difficulty: '', type: '', keyword: '' }
  }

  function removeImportedQuestion(id) {
    importedQuestions.value = importedQuestions.value.filter(q => q.id !== id)
  }

  function clearImportedQuestions() {
    importedQuestions.value = []
  }

  function getRandomQuestions(count = 10) {
    const shuffled = [...allQuestions.value].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  return {
    questions,
    importedQuestions,
    categories,
    loadedScopes,
    loading,
    currentFilter,
    allQuestions,
    filteredQuestions,
    questionCount,
    questionsByCategory,
    questionsByDifficulty,
    questionsByScope,
    questionTypeStats,
    totalSubQuestions,
    loadQuestions,
    loadScope,
    fetchFromApi,
    importFromFile,
    exportToFile,
    setFilter,
    clearFilter,
    removeImportedQuestion,
    clearImportedQuestions,
    getRandomQuestions
  }
})