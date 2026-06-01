import { computed } from 'vue'
import { useAppStore } from '@/stores/store'
import {
  computeSessionStats,
  computeSubjectStats,
  computeOverallStats,
  computeDailyStats
} from '@/utils/stats'
import { getPracticeKey } from '@/utils/questionConfig'

export function usePracticeService() {
  const store = useAppStore()

  const sessions = computed(() => store.practiceHistory)
  const wrongBook = computed(() => store.wrongBook)
  const progressMap = computed(() => store.practiceProgress)

  function refresh() {
    store.loadPracticeHistory()
    store.loadWrongBook()
    store.loadPracticeProgress()
  }

  function subjectStats(filters) {
    return computed(() => computeSubjectStats(sessions.value, wrongBook.value, filters))
  }

  const overallStats = computed(() => computeOverallStats(sessions.value, wrongBook.value))

  function dailyStats(date) {
    return computed(() => computeDailyStats(sessions.value, date))
  }

  const getSessionStats = computeSessionStats

  function markWrong(question, parentQuestion) {
    const entry = parentQuestion
      ? { ...question, id: question.sid, meta: parentQuestion.meta, parentId: parentQuestion.id }
      : question
    store.addWrongQuestion(entry)
  }

  function removeWrong(id) {
    store.removeWrongQuestion(id)
  }

  function completeSession(config, data) {
    store.addPracticeHistory({
      config,
      progress: {
        answers: data.answers,
        questionIds: data.questionIds,
        currentIndex: data.currentIndex ?? 0
      },
      meta: {
        timestamp: Date.now(),
        elapsedSeconds: data.elapsedSeconds ?? 0
      }
    })
    store.clearPracticeProgress(getPracticeKey({ bank: config.bank }))
  }

  return {
    sessions, wrongBook, progressMap,
    refresh,
    subjectStats, overallStats, dailyStats, getSessionStats,
    markWrong, removeWrong,
    completeSession
  }
}
