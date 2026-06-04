/**
 * Storage Key 定义
 * 统一管理所有 localStorage 的 key
 *
 * 命名规则: 大类_小类 (全部大写下划线分隔)
 */

export const STORAGE_KEY = {
  // 应用相关
  APP: "app_setting",

  // 题库相关 (BANK)
  BANK: "bank",
  BANK_DATABASE: "bankDb",
  BANK_TABLE: "bank_table",
  BANK_HASH: "bank_hash",
  BANK_META: "bank_meta",

  // 应用相关 (APP)
  APP_VERSION: "app_version",
  APP_INITIALIZED: "app_initialized",

  // 导入题库配置 (IMPORT)
  IMPORT_CONFIG: "import_config",

  // 练习相关 (PRACTICE)
  PRACTICE_PROGRESS: "practice_progress",
  PRACTICE_HISTORY: "practice_history",

  // 考试相关 (EXAM)
  EXAM_PAPERS: "exam_papers",
  EXAM_PRESETS: "exam_presets",
  EXAM_HISTORY: "exam_history",

  // 用户相关 (USER)
  USER_INFO: "user_info",
  USER_WRONG_BOOK: "user_wrongbook",
  USER_FAVORITES: "user_favorites",

  // 统计相关 (STATS)
  STATS_TODAY: "stats_today",
  STATS_TOTAL: "stats_total",
  STATS_SUBJECT: "stats_subject",
};

import localforage from "localforage";

const bankDb = localforage.createInstance({
  name: STORAGE_KEY.BANK_DATABASE,
  storeName: STORAGE_KEY.BANK_TABLE,
});

export const bankStorage = {
  async setBank(key, data) {
    try {
      await bankDb.setItem(key, data);
    } catch (e) {
      console.error("添加数据失败:", e);
    }
  },
  async getBank(key) {
    try {
      return await bankDb.getItem(key);
    } catch (e) {
      console.error("获取数据失败:", e);
      return null;
    }
  },
  async removeBank(key) {
    try {
      return await bankDb.removeItem(key);
    } catch (e) {
      console.error("移除数据失败:", e);
      return null;
    }
  },
  async clearBank() {
    await bankDb.clear();
  },
};

/**
 * Storage 封装
 * 统一管理 localStorage 操作，自动处理 JSON 转换
 */
export const storage = {
  /**
   * 存储数据
   */
  setItem(key, value) {
    try {
      const data = JSON.stringify(value);
      localStorage.setItem(key, data);
    } catch (e) {
      console.error("Storage setItem 失败:", e);
    }
  },
  /**
   * 获取数据
   */
  getItem(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Storage getItem 失败:", e);
      return null;
    }
  },

  /**
   * 移除数据
   */
  removeItem(key) {
    localStorage.removeItem(key);
  },

  /**
   * 清空所有数据
   */
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
  },

  /**
   * 设置带过期时间的数据
   * @param {string} key - 存储键名
   * @param {any} value - 要存储的数据
   * @param {number} ttl - 过期时间（毫秒）
   */
  setWithExpiry(key, value, ttl) {
    const data = {
      value,
      expiry: Date.now() + ttl,
    };
    this.setItem(key, data);
  },

  /**
   * 获取带过期时间的数据
   * @param {string} key - 存储键名
   * @returns {any} 过期返回 null，否则返回数据
   */
  getWithExpiry(key) {
    const data = this.getItem(key);
    if (!data) return null;

    // 检查是否过期
    if (data.expiry && Date.now() > data.expiry) {
      this.removeItem(key);
      return null;
    }

    return data.value;
  },
};

export default storage;
