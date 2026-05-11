# ATCTest 题库练习系统 - Code Wiki

## 1. 项目概述

### 1.1 项目简介

**ATCTest** 是一个空管(ATC)题库在线练习与考试系统，基于 Vue 3 + Vite 构建，支持多种题型（单选题、多选题、判断题、填空题、阅读理解等），提供练习模式和考试模式。

### 1.2 核心功能

- **题库管理**: 支持多分类、多范围、多科目的题库结构
- **练习模式**: 答题模式、背题模式、答案即时/手动显示、选项乱序
- **考试模式**: 限时考试、答题卡、标记功能
- **学习辅助**: 错题本、收藏夹、学习进度跟踪
- **多语言**: 中英文切换支持
- **数据持久化**: IndexedDB + localStorage 混合存储

---

## 2. 技术栈

| 分类 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Vue | 3.5.30 | 前端框架 |
| 构建 | Vite | 8.0.1 | 构建工具 |
| 路由 | vue-router | 5.0.4 | 路由管理 |
| 状态 | Pinia | 3.0.4 | 状态管理 |
| 本地存储 | localforage | 1.10.0 | IndexedDB 封装 |
| Excel | xlsx | 0.18.5 | 题库导入 |
| 部署 | Wrangler | 4.81.1 | Cloudflare 部署 |

---

## 3. 目录结构

```
ATCTest/
├── public/
│   ├── data/                    # 静态题库数据
│   │   ├── airport/            # 机场相关数据
│   │   └── atc/                # 空管题库数据
│   │       ├── base.json        # 基础题库
│   │       ├── professional.json # 专业题库
│   │       ├── english_translated.json # 英译中
│   │       └── english_reading.json   # 英语阅读理解
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/                    # API 层
│   │   └── dataSource.js       # 题库数据源
│   ├── assets/                 # 静态资源
│   │   └── fonts/              # 图标字体
│   ├── components/             # 组件库
│   │   ├── layout/             # 布局组件
│   │   │   ├── Navbar.vue       # 底部导航栏
│   │   │   └── QuestionNavbar.vue # 答题底部导航
│   │   ├── page/               # 页面级组件
│   │   │   ├── AnswerCard.vue   # 答题卡
│   │   │   ├── BankImport.vue   # 题库导入
│   │   │   ├── PracticeSettings.vue # 练习设置
│   │   │   └── SubjectPicker.vue    # 科目选择器
│   │   └── question/           # 题型组件
│   │       ├── QuestionRenderer.vue  # 题型渲染器
│   │       ├── SingleChoice.vue      # 单选题
│   │       ├── MultipleChoice.vue    # 多选题
│   │       ├── BooleanQuestion.vue   # 判断题
│   │       ├── FillIn.vue           # 填空题
│   │       ├── Essay.vue            # 简答题
│   │       └── Reading.vue           # 阅读理解
│   ├── composables/             # 组合式函数
│   │   ├── useQuestionHandler.js  # 题型处理逻辑
│   │   └── useStorage.js          # 存储封装
│   ├── router/                 # 路由配置
│   │   └── index.js
│   ├── stores/                  # Pinia 状态管理
│   │   └── store.js
│   ├── utils/                  # 工具函数
│   │   ├── i18n.js             # 国际化
│   │   └── questionConfig.js   # 题型配置
│   ├── views/                  # 页面视图
│   │   ├── Home.vue            # 首页
│   │   ├── practice/           # 练习模块
│   │   ├── exam/               # 考试模块
│   │   └── user/               # 用户模块
│   ├── App.vue                 # 根组件
│   ├── main.js                 # 入口文件
│   └── style.css               # 全局样式
├── package.json
├── vite.config.js
└── wrangler.jsonc              # Cloudflare 配置
```

---

## 4. 核心模块详解

### 4.1 数据层 (API Layer)

#### `src/api/dataSource.js`

**职责**: 统一管理题库数据的获取、过滤和导入

**核心函数**:

```javascript
// 获取所有题目
export function fetchAllQuestions()

// 按科目获取题目
export function fetchQuestionsBySubject(subject)

// 条件过滤获取题目
export function fetchQuestions({ category, scope, subject })

// 生成题库元数据
export function generateBankMeta()

// 计算题库 Hash (用于检测更新)
export async function computeBankHash()

// 导入题库文件
export async function importQuestions(file, options)
```

**题库结构**:

```javascript
{
  atc: {
    base: [...],           // 基础题库
    professional: [...],   // 专业题库
    english: [...]         // 英文题库
  }
}
```

**题目数据结构**:

```javascript
{
  id: 1001,
  type: "single",          // single | multiple | boolean | fillin | essay | reading
  stem: "题目标题",
  options: ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
  answer: ["A"],           // 答案数组
  explanation: "解析内容",
  media: {                 // 可选，媒体资源
    type: "image",
    src: "url"
  },
  meta: {                  // 元数据
    category: "atc",        // 题库分类
    scope: "base",         // 范围
    subject: "aviationMeteorology" // 科目
  },
  // 阅读理解特有
  subs: [                  // 子题数组
    { type: "single", stem: "子题1", options: [...], answer: [...] },
    { type: "single", stem: "子题2", options: [...], answer: [...] }
  ]
}
```

---

### 4.2 状态管理 (Store)

#### `src/stores/store.js`

**职责**: 统一管理应用状态，遵循 `API -> Storage -> Store -> 页面` 的数据流

**状态分类**:

| 类别 | 状态 | 说明 |
|------|------|------|
| 题库 | `rawQuestions`, `bankMeta`, `questionBankStructure` | 题目和元数据 |
| 用户 | `wrongBook`, `favorites` | 错题本和收藏 |
| 练习 | `practiceProgress`, `practiceHistory` | 练习进度和历史 |
| 考试 | `examPapers`, `examPresets`, `examHistory` | 试卷管理 |
| 统计 | `statsToday`, `statsTotal`, `statsSubject` | 学习统计 |

**核心方法**:

```javascript
// 题库相关
async loadQuestions()           // 加载题库
async loadSubjectQuestions(sub)  // 按科目加载
async getSubjectQuestions(...)    // 获取指定科目题目
async forceRefreshQuestions()    // 强制刷新

// 错题本
function addWrongQuestion(q)     // 添加错题
function removeWrongQuestion(id) // 移除错题

// 收藏
function addFavorite(q)          // 添加收藏
function removeFavorite(id)      // 移除收藏

// 练习
function savePracticeProgress(p) // 保存进度
function addPracticeHistory(h)   // 添加历史

// 考试
function addExamPaper(p)         // 添加试卷
function removeExamPaper(id)      // 删除试卷
function validatePaper(p)        // 验证试卷
function exportPaper(p)          // 导出试卷
function importPaper(file)       // 导入试卷

// 初始化
async function init()            // 初始化所有数据
```

---

### 4.3 存储封装 (Storage)

#### `src/composables/useStorage.js`

**职责**: 封装 localStorage 和 IndexedDB 操作

**导出对象**:

```javascript
// Storage Key 定义
export const STORAGE_KEY = {
  BANK_HASH: "bank_hash",
  PRACTICE_PROGRESS: "practice_progress",
  PRACTICE_HISTORY: "practice_history",
  EXAM_PAPERS: "exam_papers",
  USER_WRONG_BOOK: "user_wrongbook",
  USER_FAVORITES: "user_favorites",
  // ... 更多 key
}

// localStorage 封装
export const storage = {
  setItem(key, value)
  getItem(key)
  removeItem(key)
  clear()
  setWithExpiry(key, value, ttl)  // 带过期时间
  getWithExpiry(key)
}

// IndexedDB 封装 (用于存储大量题目)
export const bankStorage = {
  async setBank(key, data)
  async getBank(key)
  async removeBank(key)
  async clearBank()
}
```

---

### 4.4 题型处理 (Question Handler)

#### `src/composables/useQuestionHandler.js`

**职责**: 统一处理不同题型的显示逻辑和交互

**使用方式**:

```javascript
const handler = useQuestionHandler({
  question: computed(() => props.question),
  practiceMode: computed(() => props.mode),
  showAnswerMode: computed(() => props.showAnswerMode),
  userAnswer: () => props.userAnswer,
  isChecked: () => props.showAnswer
})

// 返回属性
handler.shouldShowAnswer      // 是否显示答案
handler.shouldShowExplanation // 是否显示解析
handler.isOptionsDisabled    // 选项是否禁用
handler.shouldShowCheckBtn   // 是否显示检查按钮
handler.shouldAutoCheck      // 是否自动批改
```

---

### 4.5 题型配置 (Question Config)

#### `src/utils/questionConfig.js`

**常量定义**:

```javascript
// 题型类型
export const QUESTION_TYPES = {
  SINGLE: "single",
  MULTIPLE: "multiple",
  BOOLEAN: "boolean",
  FILLIN: "fillin",
  ESSAY: "essay",
  TRANSLATION: "translation",
  MEDIA: "media",
  READING: "reading"
}

// 答案状态
export const ANSWER_STATUS = {
  CORRECT: "correct",
  WRONG: "wrong",
  PARTIAL: "partial",
  UNCHECKED: "unchecked",
  UNANSWERED: "unanswered",
  UNKNOWN: "unknown"
}

// 练习模式
export const PRACTICE_MODE = {
  ANSWER: "answer",    // 答题模式
  REVIEW: "review",    // 背题模式
  EXAM: "exam"         // 考试模式
}

// 答案显示模式
export const SHOW_ANSWER_MODE = {
  IMMEDIATE: "immediate",  // 立即显示
  MANUAL: "manual"         // 手动显示
}

// 题目排序
export const QUESTION_SORT = {
  SEQUENCE: "sequence",  // 顺序
  REVERSE: "reverse",    // 逆序
  SHUFFLE: "shuffle"     // 乱序
}
```

**题型能力配置**:

| 题型 | canAutoCheck | needsManualCheck |
|------|--------------|------------------|
| single | ✅ | ❌ |
| multiple | ❌ | ✅ |
| boolean | ✅ | ❌ |
| fillin | ❌ | ✅ |
| essay | ❌ | ✅ |
| translation | ❌ | ✅ |
| reading | ❌ | ✅ |

**核心函数**:

```javascript
// 类型判断
isSimpleType(type)           // 是否简单题型
isComplexType(type)          // 是否复合题型（阅读理解）
isComplexQuestion(question)  // 是否为复合题
canAutoCheck(questionType)   // 是否可自动批改

// 答案状态
getAnswerStatus(question, userAnswer)  // 获取答案状态
getSimpleStatus(question, userAnswer)  // 简单题状态
getComplexStatus(question, userAnswer) // 复合题状态

// 显示配置
getDisplayConfig(practiceMode, showAnswerMode, questionType, options)

// 进度管理
packProgress(questions, userAnswers, answerChecked, answerStatus)
unpackProgress(packedAnswers)
savePracticeProgress(...)
loadPracticeProgress()

// 统计
getBatchStats(questions, answers)
```

---

### 4.6 国际化 (i18n)

#### `src/utils/i18n.js`

**职责**: 中英文切换支持

**翻译函数**:

```javascript
import { t, setLanguage, getLanguage } from '@/utils/i18n.js'

t('key')           // 翻译
setLanguage('zh')   // 设置语言
getLanguage()      // 获取当前语言
```

---

## 5. 路由结构

#### `src/router/index.js`

```javascript
// 首页
{ path: "/", name: "Home", component: Home }

// 练习模块
/practice
  ├── ""                    // 练习主页
  ├── "/quiz"               // 答题页
  ├── "/practice-history"   // 练习历史
  └── "/result/:id?"        // 练习结果

// 考试模块
/exam
  ├── ""                    // 考试管理
  ├── "/create"             // 创建试卷
  ├── "/paper/:id?"         // 答题卷
  ├── "/result/:id?"        // 考试成绩
  └── "/exam-history"       // 考试历史

// 用户模块
/user
  ├── "/stats"              // 学习统计
  ├── "/profile"            // 个人中心
  ├── "/wrongbook"          // 错题本
  ├── "/favorites"          // 收藏夹
  └── "/settings"           // 设置
```

---

## 6. 组件体系

### 6.1 布局组件

#### `Navbar.vue`

底部导航栏组件，包含首页、练习、考试、我的四个导航项。

#### `QuestionNavbar.vue`

答题页面底部导航，包含上一题、下一题、交卷按钮。

### 6.2 题型组件

#### `QuestionRenderer.vue`

题型渲染器，根据题目类型动态加载对应组件：

```javascript
const componentMap = {
  single: SingleChoice,      // 单选题
  multiple: MultipleChoice,  // 多选题
  boolean: BooleanQuestion,  // 判断题
  fillin: FillIn,            // 填空题
  essay: Essay,              // 简答题
  reading: Reading           // 阅读理解
}
```

#### `SingleChoice.vue`

单选题组件，支持选项选中、答案显示、解析展示、收藏功能。

### 6.3 页面组件

#### `AnswerCard.vue`

答题卡组件，显示所有题目的答题状态和快速跳转功能。

#### `SubjectPicker.vue`

三级联动科目选择器（题库 → 范围 → 科目）。

#### `PracticeSettings.vue`

练习设置弹窗，包含题目顺序、练习模式、答案显示、选项乱序等配置。

#### `BankImport.vue`

题库导入组件，支持 Excel 文件导入。

---

## 7. 核心页面

### 7.1 首页 (Home.vue)

展示今日练习统计、正确率，提供练习和考试入口，显示上次练习进度。

### 7.2 练习页 (PracticePage.vue)

三级导航结构：

```
题库选择 → 范围Tab → 科目卡片
```

### 7.3 答题页 (QuizPage.vue)

核心答题流程：

```javascript
// 状态管理
const userAnswers = ref({})        // 用户答案
const answerChecked = ref({})      // 检查状态
const answerStatus = ref({})       // 答案状态

// 计时器
const elapsedSeconds = ref(0)
const timerInterval = null

// 进度保存
function savePracticeProgress() {
  saveProgress(config, currentIndex, currentSubIndex, questions, userAnswers, ...)
}

// 自动批改
function checkAnswer() {
  const status = getAnswerStatus(question, userAnswer)
  answerStatus.value[questionId] = status
  answerChecked.value[questionId] = true
  
  // 错题自动加入错题本
  if (status === 'wrong') {
    store.addWrongQuestion(question)
  }
}
```

### 7.4 考试页 (ExamPaper.vue)

考试答题流程：

```javascript
// 计时器管理
const remainingSeconds = ref(duration * 60)

// 时间耗尽自动交卷
if (remainingSeconds.value === 0) {
  autoSubmit()
}

// 交卷计算得分
function autoSubmit() {
  questions.forEach(q => {
    if (checkAnswer(q, userAnswers[q.id])) {
      correctCount++
    }
  })
  const userScore = correctCount * defaultScore
}
```

### 7.5 试卷创建页 (ExamCreate.vue)

三步骤创建流程：

```
步骤1: 基本信息 → 标题、时长、类别、描述
步骤2: 科目选择 → 选择科目、设置题量
步骤3: 预览确认 → 确认信息并创建
```

### 7.6 错题本 (WrongBook.vue)

展示错题列表，支持分页加载、错题移除、清空功能。

---

## 8. 数据流

### 8.1 练习流程数据流

```
┌─────────────────────────────────────────────────────────┐
│                     用户交互                              │
│  选择科目 → 设置参数 → 开始练习                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   PracticeSettings.vue                  │
│  收集练习参数（顺序、模式、显示方式等）                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      QuizPage.vue                       │
│  1. 加载题目（从 IndexedDB）                             │
│  2. 用户作答 → 保存答案                                  │
│  3. 检查答案 → 更新状态                                 │
│  4. 自动/手动加入错题本                                 │
│  5. 定时保存进度                                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                       Store                            │
│  userAnswers, answerChecked, answerStatus              │
│  savePracticeProgress() → localStorage                 │
└─────────────────────────────────────────────────────────┘
```

### 8.2 题库加载流程

```
┌─────────────────────────────────────────────────────────┐
│                     应用启动                             │
│  App.vue onMounted → store.init()                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    loadBankMeta()                       │
│  检查 localStorage 是否已有元数据                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   computeBankHash()                     │
│  计算当前题库 SHA-256 哈希                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Hash 一致?                                             │
│  ├── 是 → 使用缓存                                       │
│  └── 否 → 重新加载所有题目到 IndexedDB                  │
└─────────────────────────────────────────────────────────┘
```

---

## 9. 依赖关系图

```
┌─────────────────────────────────────────────────────────┐
│                        App.vue                          │
│              (根组件，路由视图管理)                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                       Router                           │
│              (路由配置，页面导航)                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌────────────────┬─────────────────┬────────────────────┐
│   Store        │   Views         │    Components       │
│  (Pinia)       │  (页面)          │   (UI组件)          │
│                │                 │                    │
│  useAppStore   │  Home.vue       │  QuestionRenderer   │
│  ┌──────────┐  │  PracticePage   │  ├─ SingleChoice    │
│  │ 题库状态  │  │  QuizPage       │  ├─ MultipleChoice   │
│  │ 用户状态  │  │  ExamPaper      │  ├─ BooleanQuestion │
│  │ 练习状态  │  │  ExamCreate     │  └─ ...             │
│  │ 考试状态  │  │  WrongBook      │                    │
│  │ 统计数据  │  │  ...            │  AnswerCard        │
│  └──────────┘  │                 │  SubjectPicker     │
│       │        │                 │  PracticeSettings   │
│       ↓        │                 │  Navbar             │
│  ┌──────────┐  │                 │  QuestionNavbar    │
│  │ useStorage│  │                 │                    │
│  │ localforage│ │                 │                    │
│  └──────────┘  │                 │                    │
└────────────────┴─────────────────┴────────────────────┘
                          ↑
                          │
┌─────────────────────────────────────────────────────────┐
│                    API Layer                            │
│  dataSource.js (fetchQuestions, generateBankMeta, ...) │
└─────────────────────────────────────────────────────────┘
                          ↑
                          │
┌─────────────────────────────────────────────────────────┐
│                    Static Data                          │
│  public/data/atc/*.json (base, professional, english)   │
└─────────────────────────────────────────────────────────┘
```

---

## 10. 关键工具函数

### 10.1 Fisher-Yates 洗牌算法

```javascript
const shuffleArray = (array) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
```

### 10.2 答案批改逻辑

```javascript
// 单选题批改
function checkSingle(question, userAnswer) {
  const correct = question.answer[0].replace(/^[A-Z]\.\s*/, "")
  const userText = question.options[userAnswer].replace(/^[A-Z]\.\s*/, "")
  return correct === userText
}

// 多选题批改
function checkMultiple(question, userAnswer) {
  const correctSet = new Set(question.answer.map(a => a.replace(...)))
  const userSet = new Set(userAnswer.map(i => question.options[i].replace(...)))
  return correctSet.size === userSet.size && [...correctSet].every(v => userSet.has(v))
}
```

### 10.3 时间格式化

```javascript
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
```

---

## 11. 运行与部署

### 11.1 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 11.2 生产构建

```bash
# 构建生产版本
npm run build

# 本地预览
npm run preview

# 部署到 Cloudflare
npm run deploy
```

### 11.3 项目配置

**vite.config.js**:

```javascript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src"  // 路径别名
    }
  },
  base: "./"  // 相对路径模式
})
```

---

## 12. 最佳实践

### 12.1 组件开发

- 使用 `<script setup>` 语法糖
- Props 使用 `defineProps` 声明
- Emit 使用 `defineEmits` 声明
- 优先使用计算属性而非方法

### 12.2 状态管理

- 遵循 `API → Storage → Store → 页面` 的数据流
- 使用 Pinia 的组合式 API 风格
- 合理使用计算属性缓存派生状态

### 12.3 存储策略

- 频繁读写的小数据 → localStorage
- 大量题目数据 → IndexedDB (via localforage)
- 设置过期时间的数据 → `setWithExpiry`

### 12.4 题型扩展

新增题型步骤：

1. 在 `questionConfig.js` 添加类型常量
2. 在 `QuestionRenderer.vue` 添加组件映射
3. 创建对应组件文件
4. 在 `useQuestionHandler.js` 添加处理逻辑

---

## 13. 常见问题

### Q: 如何添加新题库？

将 JSON 格式题库放入 `public/data/atc/`，在 `dataSource.js` 中引入：

```javascript
import myBank from "@/../public/data/atc/myBank.json"

const DATA_SOURCES = {
  atc: {
    myBank: myBank
  }
}
```

### Q: 如何自定义题型？

在 `questionConfig.js` 的 `QUESTION_CAPABILITIES` 中添加配置：

```javascript
export const QUESTION_CAPABILITIES = {
  // ... 现有配置
  myType: { canAutoCheck: true, needsManualCheck: false }
}
```

### Q: 如何导出/导入试卷？

- **导出**: 在考试管理页面，点击试卷的导出按钮
- **导入**: 在考试管理页面，点击导入按钮，选择 JSON 文件

---

## 14. 版本信息

- **项目版本**: 0.1.1
- **最后更新**: 2024
- **构建工具**: Vite 8.0.1
- **Node 版本**: >= 18.0.0
