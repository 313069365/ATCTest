import { computed } from 'vue'
import { useAppStore } from '@/domain/stores/store'
import {
  computeSessionStats,
  computeSubjectStats,
  computeOverallStats,
  computeDailyStats
} from '@/domain/services/stats'
import { getPracticeKey } from '@/infrastructure/storage/progress'
import { serializeSession, normalizeSession } from '@/infrastructure/storage/sessionAdapter'

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

  const getSessionStats = (session) => computeSessionStats(normalizeSession(session))

  function markWrong(question, parentQuestion) {
    const entry = parentQuestion
      ? { ...question, id: question.sid, meta: parentQuestion.meta, parentId: parentQuestion.id }
      : question
    store.addWrongQuestion(entry)
  }

  function removeWrong(id) {
    store.removeWrongQuestion(id)
  }

  function completeSession(config, data, startedAt = Date.now()) {
    const bank = config.bank || config
    const session = {
      config: {
        category: bank.category || '',
        scope: bank.scope || '',
        subject: bank.subject || '',
        mode: config.mode || 'answer',
        questionSort: config.questionSort || 'sequence',
        showAnswerMode: config.showAnswerMode || 'manual',
        autoJump: config.autoJump ?? true,
      },
      answers: data.answers,
      timeline: {
        startedAt,
        completedAt: Date.now(),
        lastActivityAt: Date.now(),
        elapsedSeconds: data.elapsedSeconds ?? 0,
      },
      status: 'completed',
    }
    store.addPracticeHistory(serializeSession(session))
    store.clearPracticeProgress(getPracticeKey({ bank: session.config }))
  }

  return {
    sessions, wrongBook, progressMap,
    refresh,
    subjectStats, overallStats, dailyStats, getSessionStats,
    markWrong, removeWrong,
    completeSession
  }
}
