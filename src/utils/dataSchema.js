import { storage, STORAGE_KEY } from "@/composables/useStorage";

export const SCHEMA_VERSION = 1;

export const SCHEMAS = {
  [STORAGE_KEY.PRACTICE_PROGRESS]: { version: SCHEMA_VERSION },
  [STORAGE_KEY.PRACTICE_HISTORY]: { version: SCHEMA_VERSION },
  [STORAGE_KEY.USER_WRONG_BOOK]: { version: SCHEMA_VERSION },
  [STORAGE_KEY.USER_FAVORITES]: { version: SCHEMA_VERSION },
  [STORAGE_KEY.EXAM_PAPERS]: { version: SCHEMA_VERSION },
  [STORAGE_KEY.EXAM_PRESETS]: { version: SCHEMA_VERSION },
};

/**
 * Migration functions keyed by source version.
 * Each receives the unwrapped data payload and returns the new payload.
 */
const MIGRATIONS = {
  // v0 → v1: raw data without _v wrapper, content stays the same
  0: (data) => data,
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
    if (migrate) data = migrate(data)
  }

  // 写回迁移后的数据
  storage.setItem(key, { _v: SCHEMA_VERSION, data })
  return data
}

export function schemaWrite(key, data) {
  storage.setItem(key, { _v: SCHEMA_VERSION, data })
}
