/**
 * 机坪管制员大赛理论考试 CSV → 题库 JSON 转换脚本
 *
 * 用法:
 *   node scripts/import-apron-csv.cjs [csvPath] [outPath]
 *
 * 默认:
 *   csvPath = ../民航机坪管制员大赛理论考试组卷（12套·严格占比）.csv
 *   outPath = public/data/airport/apron_skills.json
 *
 * 转换规则见 README 注释，核心约束:
 * - id 必须全局唯一：现有题库已占用 1x/2x/4x/7x 开头的 8 位 id，
 *   本题库统一加 "8" 前缀变成 9 位（13105026 -> 813105026）
 * - 判断题 answer[0] 必须是 "A. 正确" 或 "B. 错误"，
 *   BooleanQuestion.vue 依赖 answer 文本里是否含「正」来判定正确项
 * - subs 必须为 null：QuizPage 用 `q.subs.length > 0` 判断组合题，
 *   塞字符串会导致渲染崩溃
 */

const fs = require("fs");
const path = require("path");

const ATC_DIR = path.resolve(__dirname, "..");

const DEFAULT_CSV = path.resolve(
  ATC_DIR,
  "../民航机坪管制员大赛理论考试组卷（12套·严格占比）.csv",
);
const DEFAULT_OUT = path.join(ATC_DIR, "public/data/airport/apron_skills.json");

// ==================== 常量配置 ====================

/** 新题库元信息 */
const CATEGORY = "airport";
const SCOPE = "apronskills";
/** id 前缀，与现有题库（1x/2x/4x/7x）不冲突 */
const ID_PREFIX = "8";
const UPDATED_AT = "2026-09-30";

/** 考核模块编号 → [subject key, 中文名] */
const SUBJECT_MAP = {
  1: ["airportBasicKnowledge", "机场相关基础知识"],
  2: ["atcLicenseManagement", "空中交通管制员执照管理规定"],
  3: ["atcRules", "空中交通管理规定"],
  4: ["atcEnglish", "管制英语"],
  5: ["aircraftMarking", "民用航空器标识"],
  6: ["collaborativeOperations", "协同运行管理"],
  7: ["aircraftPrinciples", "航空器原理"],
  8: ["apronOperationMgmt", "机坪运行管理"],
  9: ["flightSupportCoordination", "航班保障与指挥协调管理"],
  10: ["safetyManagementSystem", "机场安全管理体系"],
  11: ["emergencyRescue", "机场应急救援"],
  12: ["accidentIncidentInvestigation", "航空器事件、征候调查"],
};

/** CSV 题型 → 题目 type */
const TYPE_MAP = {
  单选: "single",
  判断: "boolean",
  多选: "multiple",
};

const OPTION_KEYS = ["A", "B", "C", "D"];
const BOOLEAN_OPTIONS = ["A. 正确", "B. 错误"];
const EMPTY_EXPLANATION = new Set(["", "—", "-", "/", "－", "无"]);

// ==================== CSV 解析 ====================

/**
 * 解析 RFC4180 CSV（支持引号包裹、转义双引号、字段内换行）
 * 自动剥离 UTF-8 BOM
 */
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      // 跳过完全空白的行
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }

  if (rows.length === 0) return { header: [], records: [] };

  const header = rows[0].map((h) => h.trim());
  const records = rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, i) => {
      obj[h] = (r[i] ?? "").trim();
    });
    return obj;
  });

  return { header, records };
}

// ==================== 字段映射 ====================

/** 去掉书名号，得到纯法规名 */
function normalizeTopic(file) {
  return file.replace(/[《》]/g, "").trim();
}

function buildOptions(type, record) {
  if (type === "boolean") return BOOLEAN_OPTIONS.slice();
  return OPTION_KEYS.filter((k) => record[k]).map(
    (k) => `${k}. ${record[k]}`,
  );
}

function buildAnswer(type, record) {
  if (type === "boolean") {
    return [record["题目答案"].toUpperCase() === "T" ? "A. 正确" : "B. 错误"];
  }
  return record["题目答案"]
    .split("")
    .map((letter) => letter.toUpperCase())
    .filter((letter) => OPTION_KEYS.includes(letter))
    .map((letter) => `${letter}. ${record[letter]}`);
}

function buildSolution(raw) {
  const text = (raw || "").trim();
  return EMPTY_EXPLANATION.has(text) ? "" : text;
}

function convertRecord(record, index, errors) {
  const type = TYPE_MAP[record["题型"]];
  if (!type) {
    errors.push(`第 ${index + 2} 行：未知题型「${record["题型"]}」`);
    return null;
  }

  const moduleNo = record["考核模块"];
  const subjectEntry = SUBJECT_MAP[moduleNo];
  if (!subjectEntry) {
    errors.push(`第 ${index + 2} 行：未知考核模块「${moduleNo}」`);
    return null;
  }

  const stem = (record["题目名称"] || "").trim();
  if (!stem) {
    errors.push(`第 ${index + 2} 行：题干为空`);
    return null;
  }

  const options = buildOptions(type, record);
  const answer = buildAnswer(type, record);

  if (answer.length === 0) {
    errors.push(`第 ${index + 2} 行：答案为空`);
    return null;
  }
  const missing = answer.filter((a) => !options.includes(a));
  if (missing.length > 0) {
    errors.push(
      `第 ${index + 2} 行：答案 ${missing.join("/")} 不在选项中`,
    );
    return null;
  }

  const sourceId = record["试题编号"];

  return {
    meta: {
      category: CATEGORY,
      scope: SCOPE,
      subject: subjectEntry[0],
      topic: normalizeTopic(record["所属文件"] || ""),
      sourceId,
      paper: record["试卷号"],
      paperIndex: Number(record["卷内序号"]) || null,
    },
    id: ID_PREFIX + sourceId,
    type,
    stem,
    options,
    answer,
    difficulty: 1,
    shuffle: false,
    degree: null,
    subs: null,
    explanation: { tip: "", solution: buildSolution(record["答案解析"]) },
    updated_at: UPDATED_AT,
    status: "valid",
  };
}

// ==================== 校验 ====================

/** 收集现有题库已占用的 id，避免收藏/错题/进度串题。排除自身输出，保证脚本可重复执行 */
function collectExistingIds(outPath) {
  const ids = new Set();
  const dataRoot = path.join(ATC_DIR, "public/data");
  const outReal = path.resolve(outPath);
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".json")) continue;
      if (entry.name === "structure.json") continue;
      if (path.resolve(full) === outReal) continue;
      let data;
      try {
        data = JSON.parse(fs.readFileSync(full, "utf-8"));
      } catch {
        continue;
      }
      if (!Array.isArray(data)) continue;
      for (const q of data) {
        if (q && typeof q === "object" && q.id != null) ids.add(String(q.id));
      }
    }
  };
  if (fs.existsSync(dataRoot)) walk(dataRoot);
  return ids;
}

function validate(questions, existingIds) {
  const errors = [];
  const seen = new Set();

  for (const q of questions) {
    if (seen.has(q.id)) errors.push(`id 重复：${q.id}`);
    if (existingIds.has(q.id)) errors.push(`id 与现有题库冲突：${q.id}`);
    seen.add(q.id);

    if (q.subs !== null) errors.push(`${q.id}：subs 必须为 null`);
    if (!Array.isArray(q.options) || q.options.length === 0) {
      errors.push(`${q.id}：options 为空`);
    }
    if (q.type === "boolean") {
      if (q.options.join("|") !== BOOLEAN_OPTIONS.join("|")) {
        errors.push(`${q.id}：判断题选项不是「正确/错误」`);
      }
      if (!/^A\. 正确$|^B\. 错误$/.test(q.answer[0] || "")) {
        errors.push(`${q.id}：判断题答案格式错误`);
      }
    } else if (q.type === "single" && q.answer.length !== 1) {
      errors.push(`${q.id}：单选题答案数不为 1`);
    } else if (q.type === "multiple" && q.answer.length < 2) {
      errors.push(`${q.id}：多选题答案数小于 2`);
    }
  }

  return errors;
}

// ==================== 主流程 ====================

function main() {
  const csvPath = process.argv[2] || DEFAULT_CSV;
  const outPath = process.argv[3] || DEFAULT_OUT;

  if (!fs.existsSync(csvPath)) {
    console.error(`找不到 CSV 文件：${csvPath}`);
    process.exit(1);
  }

  const { header, records } = parseCsv(fs.readFileSync(csvPath, "utf-8"));

  const required = [
    "试卷号",
    "卷内序号",
    "题型",
    "考核模块",
    "模块名称",
    "试题编号",
    "所属文件",
    "题目名称",
    "题目答案",
    "答案解析",
  ];
  const missingCols = required.filter((c) => !header.includes(c));
  if (missingCols.length > 0) {
    console.error(`CSV 缺少必需列：${missingCols.join(", ")}`);
    process.exit(1);
  }

  const errors = [];
  const questions = [];
  records.forEach((record, i) => {
    const q = convertRecord(record, i, errors);
    if (q) questions.push(q);
  });

  if (errors.length > 0) {
    console.error(`\n转换失败，共 ${errors.length} 处问题：`);
    errors.slice(0, 30).forEach((e) => console.error(`  - ${e}`));
    if (errors.length > 30) console.error(`  ... 其余 ${errors.length - 30} 处省略`);
    process.exit(1);
  }

  const existingIds = collectExistingIds(outPath);
  const validationErrors = validate(questions, existingIds);
  if (validationErrors.length > 0) {
    console.error(`\n校验失败，共 ${validationErrors.length} 处问题：`);
    validationErrors.slice(0, 30).forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(questions, null, 2), "utf-8");

  // ==================== 统计 ====================
  const countBy = (fn) => {
    const map = new Map();
    for (const q of questions) {
      const k = fn(q);
      map.set(k, (map.get(k) || 0) + 1);
    }
    return map;
  };

  console.log(`\n=== 转换完成 ===`);
  console.log(`源文件: ${csvPath}`);
  console.log(`输出:   ${outPath}`);
  console.log(`题目数: ${questions.length}`);
  console.log(`id 前缀: ${ID_PREFIX}（原「试题编号」保留在 meta.sourceId）`);
  console.log(`category=${CATEGORY}  scope=${SCOPE}`);
  console.log(
    `体积:   ${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB`,
  );

  console.log(`\n-- 题型 --`);
  for (const [k, v] of [...countBy((q) => q.type)].sort()) {
    console.log(`  ${k.padEnd(10)} ${v}`);
  }

  console.log(`\n-- 科目 --`);
  const subjectNames = new Map(
    Object.entries(SUBJECT_MAP).map(([no, [key, zh]]) => [key, zh]),
  );
  for (const [k, v] of [...countBy((q) => q.meta.subject)].sort()) {
    console.log(`  ${k.padEnd(30)} ${String(v).padStart(4)}  ${subjectNames.get(k) || ""}`);
  }

  console.log(`\n-- 其它 --`);
  console.log(`  法规(topic)种类: ${countBy((q) => q.meta.topic).size}`);
  console.log(`  无解析题目数:    ${questions.filter((q) => !q.explanation.solution).length}`);
  console.log(`  试卷份数:        ${countBy((q) => q.meta.paper).size}`);
}

main();
