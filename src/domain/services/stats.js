import { normalizeStatus } from '@/domain/config/questionConfig'

function readAnswers(session) {
  return session.answers || session.progress?.answers || {}
}

function readConfig(session, field) {
  const cfg = session.config || {}
  if (cfg.bank) return cfg.bank[field]
  return cfg[field]
}

function readTimestamp(session) {
  const tl = session.timeline || {}
  return tl.startedAt || tl.completedAt || session.meta?.timestamp || session.timestamp || 0
}

function readElapsed(session) {
  const tl = session.timeline || {}
  return tl.elapsedSeconds || session.meta?.elapsedSeconds || 0
}

function countAnswers(answers) {
  let correct = 0, wrong = 0, unknown = 0, unanswered = 0
  Object.values(answers).forEach(answer => {
    if (!answer || !answer.status) { unanswered++; return }
    const status = answer.status
    if (typeof status === 'string') {
      const norm = normalizeStatus(status)
      if (norm === 'correct') correct++
      else if (norm === 'wrong') wrong++
      else if (norm === 'unknown') unknown++
      else unanswered++
    } else if (typeof status === 'object') {
      Object.values(status).forEach(subStatus => {
        const norm = normalizeStatus(subStatus)
        if (norm === 'correct') correct++
        else if (norm === 'wrong') wrong++
        else if (norm === 'unknown') unknown++
        else unanswered++
      })
    }
  })
  return { correct, wrong, unknown, unanswered }
}

export function computeSessionStats(session) {
  if (session.stats && session.answers) {
    return {
      totalQuestions: session.stats.totalQuestions,
      correctCount: session.stats.correctCount,
      wrongCount: session.stats.wrongCount,
      unknownCount: session.stats.unknownCount,
      unansweredCount: session.stats.unansweredCount,
      accuracy: session.stats.accuracy,
      elapsedSeconds: session.timeline?.elapsedSeconds || 0,
      subject: readConfig(session, 'subject') || '',
      category: readConfig(session, 'category') || '',
      scope: readConfig(session, 'scope') || '',
      timestamp: readTimestamp(session),
    }
  }
  const answers = readAnswers(session)
  const { correct, wrong, unknown, unanswered } = countAnswers(answers)
  const total = correct + wrong + unknown + unanswered
  const answered = correct + wrong
  return {
    totalQuestions: total,
    correctCount: correct,
    wrongCount: wrong,
    unknownCount: unknown,
    unansweredCount: unanswered,
    accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    elapsedSeconds: readElapsed(session),
    subject: readConfig(session, 'subject') || '',
    category: readConfig(session, 'category') || '',
    scope: readConfig(session, 'scope') || '',
    timestamp: readTimestamp(session),
  }
}

function readBank(session) {
  const cfg = session.config || {}
  if (cfg.bank) return cfg.bank
  return cfg
}

export function computeSubjectStats(sessions, wrongBook, { category, scope, subject }) {
  const filtered = sessions.filter(s => {
    const bank = readBank(s)
    return bank.category === category && bank.scope === scope && bank.subject === subject
  })
  const sessionCount = filtered.length
  let totalQuestions = 0, correctCount = 0, wrongCount = 0, unknownCount = 0, unansweredCount = 0
  filtered.forEach(s => {
    const st = computeSessionStats(s)
    totalQuestions += st.totalQuestions
    correctCount += st.correctCount
    wrongCount += st.wrongCount
    unknownCount += st.unknownCount
    unansweredCount += st.unansweredCount
  })
  const wrongBookCount = wrongBook.filter(q =>
    q.meta?.category === category &&
    q.meta?.scope === scope &&
    q.meta?.subject === subject
  ).length
  const answered = correctCount + wrongCount
  return {
    sessionCount,
    totalQuestions,
    correctCount,
    wrongCount,
    unknownCount,
    unansweredCount,
    accuracy: answered > 0 ? Math.round((correctCount / answered) * 100) : 0,
    wrongBookCount
  }
}

export function computeOverallStats(sessions, wrongBook) {
  let totalQuestions = 0, correctCount = 0, wrongCount = 0, unknownCount = 0, unansweredCount = 0
  sessions.forEach(s => {
    const st = computeSessionStats(s)
    totalQuestions += st.totalQuestions
    correctCount += st.correctCount
    wrongCount += st.wrongCount
    unknownCount += st.unknownCount
    unansweredCount += st.unansweredCount
  })

  const subjectMap = {}
  sessions.forEach(s => {
    const bank = readBank(s)
    if (!bank.category) return
    const key = `${bank.category}_${bank.scope}_${bank.subject}`
    if (!subjectMap[key]) subjectMap[key] = { category: bank.category, scope: bank.scope, subject: bank.subject }
  })
  const subjectBreakdown = Object.values(subjectMap).map(f =>
    computeSubjectStats(sessions, wrongBook, f)
  )

  const dailyMap = {}
  sessions.forEach(s => {
    const ts = readTimestamp(s)
    if (!ts) return
    const date = new Date(ts).toISOString().split('T')[0]
    if (!dailyMap[date]) dailyMap[date] = []
    dailyMap[date].push(s)
  })
  const dailyActivity = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, daySessions]) => computeDailyStats(daySessions, date))

  const answered = correctCount + wrongCount
  return {
    totalSessions: sessions.length,
    totalQuestions,
    correctCount,
    wrongCount,
    unknownCount,
    unansweredCount,
    accuracy: answered > 0 ? Math.round((correctCount / answered) * 100) : 0,
    subjectBreakdown,
    dailyActivity
  }
}

export function computeDailyStats(sessions, date) {
  const dateStr = date || new Date().toISOString().split('T')[0]
  const filtered = date
    ? sessions.filter(s => {
        const ts = readTimestamp(s)
        return ts && new Date(ts).toISOString().split('T')[0] === dateStr
      })
    : sessions
  let correct = 0, wrong = 0
  filtered.forEach(s => {
    const st = computeSessionStats(s)
    correct += st.correctCount
    wrong += st.wrongCount
  })
  const answered = correct + wrong
  return {
    date: dateStr,
    answered,
    correct,
    wrong,
    accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0
  }
}
