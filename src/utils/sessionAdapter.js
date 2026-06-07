import { computeSessionStats } from './stats'

function generateId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function normalizeSession(raw) {
  if (!raw) return null

  const answers = raw.answers || raw.progress?.answers || {}
  const config = { mode: 'answer', source: 'bank', ...raw.config }

  const timeline = raw.timeline || {
    startedAt: raw.meta?.timestamp || raw.timestamp || Date.now(),
    lastActivityAt: raw.timeline?.lastActivityAt || raw.meta?.timestamp || raw.timestamp || Date.now(),
    completedAt: raw.timeline?.completedAt || raw.meta?.timestamp || raw.timestamp,
    elapsedSeconds: raw.meta?.elapsedSeconds || raw.timeline?.elapsedSeconds || 0,
  }

  return {
    id: raw.id || generateId(),
    userId: raw.userId || 'local',
    config,
    timeline,
    status: raw.status || 'completed',
    stats: raw.stats || computeSessionStats({ answers, config, meta: timeline }),
    answers,
  }
}

export function serializeSession(data) {
  return {
    id: data.id,
    userId: data.userId,
    config: data.config,
    timeline: data.timeline,
    status: data.status,
    stats: data.stats,
    answers: data.answers,
  }
}
