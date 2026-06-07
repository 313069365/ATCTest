import { storage, STORAGE_KEY } from "@/composables/useStorage";

export const SCHEMA_VERSION = 2;

export const SCHEMAS = {
  [STORAGE_KEY.PRACTICE_PROGRESS]: { version: SCHEMA_VERSION },
  [STORAGE_KEY.PRACTICE_HISTORY]: { version: SCHEMA_VERSION },
  [STORAGE_KEY.USER_WRONG_BOOK]: { version: SCHEMA_VERSION },
  [STORAGE_KEY.USER_FAVORITES]: { version: SCHEMA_VERSION },
  [STORAGE_KEY.EXAM_PAPERS]: { version: SCHEMA_VERSION },
  [STORAGE_KEY.EXAM_PRESETS]: { version: SCHEMA_VERSION },
};

const MIGRATIONS = {
  0: (data) => data,

  // v1 → v2: practice_history 结构升级
  // 旧结构: { config: { bank: {...}, ... }, progress: { answers, ... }, meta: {...}, timestamp }
  // 新结构: { id, userId, config: { category, scope, subject, ... }, timeline, status, stats, answers }
  1: (data, key) => {
    if (key === STORAGE_KEY.PRACTICE_HISTORY && Array.isArray(data)) {
      return data.map(s => {
        if (s.id) return s // 已经是 v2
        const config = s.config || {}
        const bank = config.bank || {}
        const answers = s.progress?.answers || {}
        const meta = s.meta || {}
        return {
          id: `sess_${(meta.timestamp || s.timestamp || Date.now())}_${Math.random().toString(36).slice(2, 6)}`,
          userId: 'local',
          config: {
            category: bank.category || '',
            scope: bank.scope || '',
            subject: bank.subject || '',
            mode: config.mode || 'answer',
            questionSort: config.questionSort || 'sequence',
            showAnswerMode: config.showAnswerMode || 'manual',
            autoJump: config.autoJump ?? true,
          },
          timeline: {
            startedAt: meta.timestamp || s.timestamp || Date.now(),
            lastActivityAt: meta.timestamp || s.timestamp || Date.now(),
            completedAt: meta.timestamp || s.timestamp,
            elapsedSeconds: meta.elapsedSeconds || 0,
          },
          status: 'completed',
          answers,
        }
      })
    }
    return data
  },
}

/**
 * 读取存储，自动迁移到最新版本
 * 返回 null 表示数据不存在或格式损坏不可恢复
 */
export function schemaRead(key) {
  const raw = storage.getItem(key)
  if (raw === null || raw === undefined) return null

  let data, ver
  if (raw._v !== undefined) {
    // 已损坏：有 _v 但无 data 字段（旧版 schemaWrite 的产物）
    if (!('data' in raw)) return null
    ver = raw._v
    data = raw.data
  } else {
    ver = 0
    data = raw
  }

  if (ver === SCHEMA_VERSION) return data

  // 未来版本数据，不做迁移
  if (ver > SCHEMA_VERSION) return data

  // 顺序执行迁移
  for (let v = ver; v < SCHEMA_VERSION; v++) {
    const migrate = MIGRATIONS[v]
    if (migrate) data = migrate(data, key)
  }

  // 写回迁移后的数据
  storage.setItem(key, { _v: SCHEMA_VERSION, data })
  return data
}

export function schemaWrite(key, data) {
  storage.setItem(key, { _v: SCHEMA_VERSION, data })
}
