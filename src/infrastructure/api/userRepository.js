/**
 * 用户数据仓库
 * 统一管理用户相关数据的 CRUD 操作
 * 支持多账户，所有查询自动带上当前 userId
 */

import initSqlJs from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

let SQL = null;
let db = null;
let currentUserId = null;

/**
 * 初始化 SQLite 数据库
 */
export async function initUserRepository(dbPath = "/data/db/accounts.db") {
  if (db) return;

  try {
    SQL = await initSqlJs({
      locateFile: () => sqlWasmUrl,
    });

    try {
      const response = await fetch(dbPath);
      const buffer = await response.arrayBuffer();

      if (buffer.byteLength > 0) {
        db = new SQL.Database(new Uint8Array(buffer));
      } else {
        db = new SQL.Database();
        createTables();
        saveDatabase();
      }
    } catch (error) {
      console.warn("Failed to load database file, creating new one:", error);
      db = new SQL.Database();
      createTables();
      saveDatabase();
    }
  } catch (error) {
    console.error("Failed to initialize SQL.js:", error);
    throw error;
  }
}

/**
 * 创建数据库表结构
 */
function createTables() {
  if (!db) return;

  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      nickname TEXT,
      avatar_url TEXT,
      created_at INTEGER,
      last_login_at INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS wrong_book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      question_id INTEGER NOT NULL,
      question_data TEXT NOT NULL,
      wrong_count INTEGER DEFAULT 1,
      wrong_time INTEGER,
      created_at INTEGER DEFAULT (strftime('%s','now')*1000),
      updated_at INTEGER DEFAULT (strftime('%s','now')*1000),
      FOREIGN KEY (user_id) REFERENCES accounts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      question_id INTEGER NOT NULL,
      question_data TEXT NOT NULL,
      favorite_time INTEGER,
      created_at INTEGER DEFAULT (strftime('%s','now')*1000),
      updated_at INTEGER DEFAULT (strftime('%s','now')*1000),
      FOREIGN KEY (user_id) REFERENCES accounts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS practice_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      progress_key TEXT NOT NULL,
      progress_data TEXT NOT NULL,
      timestamp INTEGER,
      created_at INTEGER DEFAULT (strftime('%s','now')*1000),
      updated_at INTEGER DEFAULT (strftime('%s','now')*1000),
      FOREIGN KEY (user_id) REFERENCES accounts(id),
      UNIQUE(user_id, progress_key)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS practice_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      history_data TEXT NOT NULL,
      timestamp INTEGER,
      created_at INTEGER DEFAULT (strftime('%s','now')*1000),
      updated_at INTEGER DEFAULT (strftime('%s','now')*1000),
      FOREIGN KEY (user_id) REFERENCES accounts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS exam_papers (
      id INTEGER PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_data TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s','now')*1000),
      updated_at INTEGER DEFAULT (strftime('%s','now')*1000),
      FOREIGN KEY (user_id) REFERENCES accounts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS exam_presets (
      id INTEGER PRIMARY KEY,
      user_id TEXT NOT NULL,
      preset_data TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s','now')*1000),
      updated_at INTEGER DEFAULT (strftime('%s','now')*1000),
      FOREIGN KEY (user_id) REFERENCES accounts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      settings_data TEXT NOT NULL,
      updated_at INTEGER DEFAULT (strftime('%s','now')*1000),
      FOREIGN KEY (user_id) REFERENCES accounts(id)
    )
  `);
}

/**
 * 保存数据库到 IndexedDB
 */
function saveDatabase() {
  if (!db || !SQL) return;

  const data = db.export();
  const buffer = data.buffer;
  const array = new Uint8Array(buffer);
  localStorage.setItem("sqlite_db_backup", JSON.stringify(Array.from(array)));
}

/**
 * 设置当前用户 ID
 */
export function setCurrentUser(userId) {
  currentUserId = userId;
}

/**
 * 获取当前活跃账户
 */
export function getCurrentUserId() {
  if (!currentUserId) {
    currentUserId = localStorage.getItem("current_user_id");
  }
  return currentUserId;
}

/**
 * 切换账户
 */
export async function switchAccount(userId) {
  if (!db) {
    throw new Error("Repository not initialized");
  }
  currentUserId = userId;
  localStorage.setItem("current_user_id", userId);
}

// ==================== 账户管理 ====================

/**
 * 获取所有账户列表
 */
export async function getAccounts() {
  if (!db) throw new Error("Repository not initialized");
  const result = db.exec("SELECT * FROM accounts ORDER BY created_at DESC");
  return parseAccountResult(result[0]);
}

/**
 * 创建账户
 */
export async function createAccount(id, username, nickname) {
  if (!db) throw new Error("Repository not initialized");

  const exists = db.exec("SELECT id FROM accounts WHERE id = '" + id + "'");
  if (exists[0]?.values.length > 0) {
    throw new Error("账户已存在");
  }

  const now = Date.now();
  db.run(
    "INSERT INTO accounts (id, username, nickname, created_at, last_login_at) VALUES ('" +
      id +
      "', '" +
      username +
      "', '" +
      (nickname || username) +
      "', " +
      now +
      ", " +
      now +
      ")",
  );
  saveDatabase();
}

/**
 * 获取账户信息
 */
export async function getAccountById(id) {
  if (!db) throw new Error("Repository not initialized");

  const result = db.exec("SELECT * FROM accounts WHERE id = '" + id + "'");
  const accounts = parseAccountResult(result[0]);
  return accounts[0] || null;
}

// ==================== 错题本 ====================

/**
 * 获取用户的错题本
 */
export async function getWrongBook() {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) return [];

  const result = db.exec(
    "SELECT * FROM wrong_book WHERE user_id = '" +
      currentUserId +
      "' ORDER BY wrong_time DESC",
  );

  return parseWrongBookResult(result[0]);
}

/**
 * 添加错题
 */
export async function addWrongQuestion(question) {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) throw new Error("No user logged in");

  const questionData = JSON.stringify(question);
  const questionId = question.id;
  const now = Date.now();

  const existing = db.exec(
    "SELECT id, wrong_count, wrong_time FROM wrong_book WHERE user_id = '" +
      currentUserId +
      "' AND question_id = " +
      questionId,
  );

  if (existing[0]?.values.length > 0) {
    const row = existing[0].values[0];
    const newCount = (row[1] || 0) + 1;
    db.run(
      "UPDATE wrong_book SET wrong_count = " +
        newCount +
        ", wrong_time = " +
        now +
        ", updated_at = " +
        now +
        " WHERE user_id = '" +
        currentUserId +
        "' AND question_id = " +
        questionId,
    );
  } else {
    db.run(
      "INSERT INTO wrong_book (user_id, question_id, question_data, wrong_count, wrong_time, created_at, updated_at) " +
        "VALUES ('" +
        currentUserId +
        "', " +
        questionId +
        ", '" +
        questionData.replace(/'/g, "''") +
        "', 1, " +
        now +
        ", " +
        now +
        ", " +
        now +
        ")",
    );
  }
  saveDatabase();
}

/**
 * 移除错题
 */
export async function removeWrongQuestion(questionId) {
  if (!db || !currentUserId) return;

  db.run(
    "DELETE FROM wrong_book WHERE user_id = '" +
      currentUserId +
      "' AND question_id = " +
      questionId,
  );
  saveDatabase();
}

// ==================== 收藏夹 ====================

/**
 * 获取用户的收藏夹
 */
export async function getFavorites() {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) return [];

  const result = db.exec(
    "SELECT * FROM favorites WHERE user_id = '" +
      currentUserId +
      "' ORDER BY favorite_time DESC",
  );

  return parseFavoritesResult(result[0]);
}

/**
 * 添加收藏
 */
export async function addFavorite(question) {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) throw new Error("No user logged in");

  const questionData = JSON.stringify(question);
  const questionId = question.id;
  const now = Date.now();

  const existing = db.exec(
    "SELECT id FROM favorites WHERE user_id = '" +
      currentUserId +
      "' AND question_id = " +
      questionId,
  );

  if (!existing[0]?.values.length) {
    db.run(
      "INSERT INTO favorites (user_id, question_id, question_data, favorite_time, created_at, updated_at) " +
        "VALUES ('" +
        currentUserId +
        "', " +
        questionId +
        ", '" +
        questionData.replace(/'/g, "''") +
        "', " +
        now +
        ", " +
        now +
        ", " +
        now +
        ")",
    );
    saveDatabase();
  }
}

/**
 * 移除收藏
 */
export async function removeFavorite(questionId) {
  if (!db || !currentUserId) return;

  db.run(
    "DELETE FROM favorites WHERE user_id = '" +
      currentUserId +
      "' AND question_id = " +
      questionId,
  );
  saveDatabase();
}

// ==================== 练习进度 ====================

/**
 * 获取用户的练习进度
 */
export async function getPracticeProgress() {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) return {};

  const result = db.exec(
    "SELECT progress_key, progress_data, timestamp FROM practice_progress WHERE user_id = '" +
      currentUserId +
      "'",
  );

  const progress = {};
  if (result[0]) {
    result[0].values.forEach((row) => {
      progress[row[0]] = JSON.parse(row[1]);
    });
  }
  return progress;
}

/**
 * 保存练习进度
 */
export async function savePracticeProgress(key, data, timestamp) {
  if (!db || !currentUserId) return;

  const progressData = JSON.stringify(data);
  const ts = timestamp || Date.now();

  const existing = db.exec(
    "SELECT id FROM practice_progress WHERE user_id = '" +
      currentUserId +
      "' AND progress_key = '" +
      key +
      "'",
  );

  if (existing[0]?.values.length > 0) {
    db.run(
      "UPDATE practice_progress SET progress_data = '" +
        progressData.replace(/'/g, "''") +
        "', timestamp = " +
        ts +
        ", updated_at = " +
        ts +
        " WHERE user_id = '" +
        currentUserId +
        "' AND progress_key = '" +
        key +
        "'",
    );
  } else {
    db.run(
      "INSERT INTO practice_progress (user_id, progress_key, progress_data, timestamp, created_at, updated_at) " +
        "VALUES ('" +
        currentUserId +
        "', '" +
        key +
        "', '" +
        progressData.replace(/'/g, "''") +
        "', " +
        ts +
        ", " +
        ts +
        ", " +
        ts +
        ")",
    );
  }
  saveDatabase();
}

/**
 * 清除练习进度
 */
export async function clearPracticeProgress(key) {
  if (!db || !currentUserId) return;

  db.run(
    "DELETE FROM practice_progress WHERE user_id = '" +
      currentUserId +
      "' AND progress_key = '" +
      key +
      "'",
  );
  saveDatabase();
}

// ==================== 练习历史 ====================

/**
 * 获取用户的练习历史
 */
export async function getPracticeHistory() {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) return [];

  const result = db.exec(
    "SELECT * FROM practice_history WHERE user_id = '" +
      currentUserId +
      "' ORDER BY timestamp DESC",
  );

  return parsePracticeHistoryResult(result[0]);
}

/**
 * 添加练习历史
 */
export async function addPracticeHistory(record) {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) throw new Error("No user logged in");

  const historyData = JSON.stringify(record);
  const now = Date.now();

  db.run(
    "INSERT INTO practice_history (id, user_id, history_data, timestamp, created_at, updated_at) " +
      "VALUES ('" +
      record.id +
      "', '" +
      currentUserId +
      "', '" +
      historyData.replace(/'/g, "''") +
      "', " +
      now +
      ", " +
      now +
      ", " +
      now +
      ")",
  );
  saveDatabase();
}

// ==================== 考试试卷 ====================

/**
 * 获取用户的考试试卷
 */
export async function getExamPapers() {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) return [];

  const result = db.exec(
    "SELECT * FROM exam_papers WHERE user_id = '" +
      currentUserId +
      "' ORDER BY created_at DESC",
  );

  return parseExamPapersResult(result[0]);
}

/**
 * 添加考试试卷
 */
export async function addExamPaper(paper) {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) throw new Error("No user logged in");

  const paperData = JSON.stringify(paper);
  const now = Date.now();

  db.run(
    "INSERT INTO exam_papers (id, user_id, paper_data, created_at, updated_at) " +
      "VALUES (" +
      paper.id +
      ", '" +
      currentUserId +
      "', '" +
      paperData.replace(/'/g, "''") +
      "', " +
      now +
      ", " +
      now +
      ")",
  );
  saveDatabase();
}

/**
 * 删除考试试卷
 */
export async function removeExamPaper(paperId) {
  if (!db || !currentUserId) return;

  db.run(
    "DELETE FROM exam_papers WHERE user_id = '" +
      currentUserId +
      "' AND id = " +
      paperId,
  );
  saveDatabase();
}

// ==================== 考试预设 ====================

/**
 * 获取用户的考试预设
 */
export async function getExamPresets() {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) return [];

  const result = db.exec(
    "SELECT * FROM exam_presets WHERE user_id = '" +
      currentUserId +
      "' ORDER BY created_at DESC",
  );

  return parseExamPresetsResult(result[0]);
}

/**
 * 保存考试预设
 */
export async function saveExamPreset(preset) {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) throw new Error("No user logged in");

  const presetData = JSON.stringify(preset);
  const now = Date.now();

  db.run(
    "INSERT INTO exam_presets (id, user_id, preset_data, created_at, updated_at) " +
      "VALUES (" +
      preset.id +
      ", '" +
      currentUserId +
      "', '" +
      presetData.replace(/'/g, "''") +
      "', " +
      now +
      ", " +
      now +
      ")",
  );
  saveDatabase();
}

/**
 * 删除考试预设
 */
export async function deleteExamPreset(presetId) {
  if (!db || !currentUserId) return;

  db.run(
    "DELETE FROM exam_presets WHERE user_id = '" +
      currentUserId +
      "' AND id = " +
      presetId,
  );
  saveDatabase();
}

// ==================== 用户设置 ====================

/**
 * 获取用户设置
 */
export async function getUserSettings() {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) return {};

  const result = db.exec(
    "SELECT settings_data FROM user_settings WHERE user_id = '" +
      currentUserId +
      "'",
  );

  if (result[0]?.values.length > 0) {
    return JSON.parse(result[0].values[0][0]);
  }
  return {};
}

/**
 * 保存用户设置
 */
export async function saveUserSettings(settings) {
  if (!db) throw new Error("Repository not initialized");
  if (!currentUserId) return;

  const settingsData = JSON.stringify(settings);
  const now = Date.now();

  const existing = db.exec(
    "SELECT id FROM user_settings WHERE user_id = '" + currentUserId + "'",
  );

  if (existing[0]?.values.length > 0) {
    db.run(
      "UPDATE user_settings SET settings_data = '" +
        settingsData.replace(/'/g, "''") +
        "', updated_at = " +
        now +
        " WHERE user_id = '" +
        currentUserId +
        "'",
    );
  } else {
    db.run(
      "INSERT INTO user_settings (user_id, settings_data, updated_at) " +
        "VALUES ('" +
        currentUserId +
        "', '" +
        settingsData.replace(/'/g, "''") +
        "', " +
        now +
        ")",
    );
  }
  saveDatabase();
}

// ==================== 工具函数 ====================

function parseAccountResult(result) {
  if (!result) return [];
  const columns = result.columns;
  const values = result.values;

  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return {
      id: obj.id,
      username: obj.username,
      nickname: obj.nickname,
      avatar_url: obj.avatar_url,
      createdAt: obj.created_at,
      lastLoginAt: obj.last_login_at,
    };
  });
}

function parseWrongBookResult(result) {
  if (!result) return [];
  const columns = result.columns;
  const values = result.values;

  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return {
      id: obj.id,
      questionId: obj.question_id,
      question: JSON.parse(obj.question_data),
      wrongCount: obj.wrong_count,
      wrongTime: obj.wrong_time,
      createdAt: obj.created_at,
      updatedAt: obj.updated_at,
    };
  });
}

function parseFavoritesResult(result) {
  if (!result) return [];
  const columns = result.columns;
  const values = result.values;

  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return {
      id: obj.id,
      questionId: obj.question_id,
      question: JSON.parse(obj.question_data),
      favoriteTime: obj.favorite_time,
      createdAt: obj.created_at,
      updatedAt: obj.updated_at,
    };
  });
}

function parsePracticeHistoryResult(result) {
  if (!result) return [];
  const columns = result.columns;
  const values = result.values;

  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return {
      id: obj.id,
      history: JSON.parse(obj.history_data),
      timestamp: obj.timestamp,
      createdAt: obj.created_at,
      updatedAt: obj.updated_at,
    };
  });
}

function parseExamPapersResult(result) {
  if (!result) return [];
  const columns = result.columns;
  const values = result.values;

  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return {
      id: obj.id,
      paper: JSON.parse(obj.paper_data),
      createdAt: obj.created_at,
      updatedAt: obj.updated_at,
    };
  });
}

function parseExamPresetsResult(result) {
  if (!result) return [];
  const columns = result.columns;
  const values = result.values;

  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return {
      id: obj.id,
      preset: JSON.parse(obj.preset_data),
      createdAt: obj.created_at,
      updatedAt: obj.updated_at,
    };
  });
}

export default {
  initUserRepository,
  setCurrentUser,
  getCurrentUserId,
  switchAccount,
  getAccounts,
  createAccount,
  getAccountById,
  getWrongBook,
  addWrongQuestion,
  removeWrongQuestion,
  getFavorites,
  addFavorite,
  removeFavorite,
  getPracticeProgress,
  savePracticeProgress,
  clearPracticeProgress,
  getPracticeHistory,
  addPracticeHistory,
  getExamPapers,
  addExamPaper,
  removeExamPaper,
  getExamPresets,
  saveExamPreset,
  deleteExamPreset,
  getUserSettings,
  saveUserSettings,
};
