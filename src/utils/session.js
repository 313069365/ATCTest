export function createPracticeSession(practiceData) {
  const sessionId = Math.random().toString(36).substr(2, 9)
  sessionStorage.setItem(`practice_${sessionId}`, JSON.stringify(practiceData))
  return sessionId
}

export function getPracticeSession(sessionId) {
  const raw = sessionStorage.getItem(`practice_${sessionId}`)
  if (!raw) return null
  return JSON.parse(raw)
}
