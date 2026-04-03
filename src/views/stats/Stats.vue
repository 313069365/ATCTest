<template>
  <div class="stats-page">
    <header class="top-bar">
      <button class="icon-btn" @click="goBack">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="title">用户统计</h1>
      <div class="placeholder"></div>
    </header>

    <main class="content">
      <!-- 总体统计 -->
      <section class="overview-section">
        <div class="overview-card">
          <h2 class="section-title">总体统计</h2>
          <div class="overview-grid">
            <div class="overview-item">
              <span class="overview-value">{{ totalPracticeCount }}</span>
              <span class="overview-label">总练习次数</span>
            </div>
            <div class="overview-item">
              <span class="overview-value">{{ totalExamCount }}</span>
              <span class="overview-label">总考试次数</span>
            </div>
            <div class="overview-item">
              <span class="overview-value">{{ totalQuestionsAnswered }}</span>
              <span class="overview-label">总答题数</span>
            </div>
            <div class="overview-item">
              <span class="overview-value">{{ averageAccuracy }}%</span>
              <span class="overview-label">平均正确率</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 练习统计 -->
      <section class="practice-section">
        <div class="practice-card">
          <h2 class="section-title">练习统计</h2>
          <div class="practice-stats">
            <div class="stat-card">
              <span class="stat-icon material-symbols-outlined">assignment</span>
              <div class="stat-info">
                <span class="stat-value">{{ practiceStats.total }}</span>
                <span class="stat-label">练习次数</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon material-symbols-outlined">check_circle</span>
              <div class="stat-info">
                <span class="stat-value">{{ practiceStats.correct }}</span>
                <span class="stat-label">正确题数</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon material-symbols-outlined">close_circle</span>
              <div class="stat-info">
                <span class="stat-value">{{ practiceStats.incorrect }}</span>
                <span class="stat-label">错误题数</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon material-symbols-outlined">trending_up</span>
              <div class="stat-info">
                <span class="stat-value">{{ practiceStats.accuracy }}%</span>
                <span class="stat-label">正确率</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 考试统计 -->
      <section class="exam-section">
        <div class="exam-card">
          <h2 class="section-title">考试统计</h2>
          <div class="exam-stats">
            <div class="stat-card">
              <span class="stat-icon material-symbols-outlined">quiz</span>
              <div class="stat-info">
                <span class="stat-value">{{ examStats.total }}</span>
                <span class="stat-label">考试次数</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon material-symbols-outlined">check_circle</span>
              <div class="stat-info">
                <span class="stat-value">{{ examStats.passed }}</span>
                <span class="stat-label">通过次数</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon material-symbols-outlined">close_circle</span>
              <div class="stat-info">
                <span class="stat-value">{{ examStats.failed }}</span>
                <span class="stat-label">未通过次数</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon material-symbols-outlined">star</span>
              <div class="stat-info">
                <span class="stat-value">{{ examStats.averageScore }}</span>
                <span class="stat-label">平均分</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 最近记录 -->
      <section class="recent-section">
        <div class="recent-card">
          <h2 class="section-title">最近记录</h2>
          <div class="recent-list" v-if="recentRecords.length > 0">
            <div 
              v-for="record in recentRecords" 
              :key="record.id"
              class="recent-item"
              :class="{ practice: record.type === 'practice', exam: record.type === 'exam' }"
              @click="viewRecord(record)"
            >
              <div class="recent-icon">
                <span class="material-symbols-outlined">{{ record.type === 'practice' ? 'assignment' : 'quiz' }}</span>
              </div>
              <div class="recent-info">
                <h4>{{ record.title }}</h4>
                <div class="recent-meta">
                  <span class="recent-date">{{ formatDate(record.timestamp) }}</span>
                  <span class="recent-type">{{ record.type === 'practice' ? '练习' : '考试' }}</span>
                </div>
                <div class="recent-stats">
                  <span class="score" :class="getScoreClass(record.score, record.totalScore)">
                    {{ record.score }}/{{ record.totalScore }}
                  </span>
                  <span class="accuracy">{{ record.accuracy }}%</span>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else>
            <span class="material-symbols-outlined">history</span>
            <p>暂无记录</p>
          </div>
        </div>
      </section>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="action-btn" @click="goPracticeHistory">
          <span class="material-symbols-outlined">history</span>
          练习记录
        </button>
        <button class="action-btn" @click="goExamHistory">
          <span class="material-symbols-outlined">history</span>
          考试记录
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePracticeHistory, useUserStats, useExamRecords } from '../../composables/useStorage'

const router = useRouter()

// 使用存储 composable
const { getHistory } = usePracticeHistory()
const { getStats } = useUserStats()
const { getAll: getAllExams } = useExamRecords()

const practiceHistory = ref([])
const examRecords = ref([])
const userStats = ref(null)

// 练习统计数据
const practiceStats = computed(() => {
  const history = practiceHistory.value
  const total = history.length
  const correct = history.reduce((sum, item) => sum + item.correct, 0)
  const incorrect = history.reduce((sum, item) => sum + (item.total - item.correct), 0)
  const accuracy = total > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0
  
  return {
    total,
    correct,
    incorrect,
    accuracy
  }
})

// 考试统计数据
const examStats = computed(() => {
  const exams = examRecords.value
  const total = exams.length
  const passed = exams.filter(exam => exam.score >= exam.totalScore * 0.6).length
  const failed = total - passed
  const averageScore = total > 0 ? Math.round(exams.reduce((sum, exam) => sum + exam.score, 0) / total) : 0
  
  return {
    total,
    passed,
    failed,
    averageScore
  }
})

// 总体统计数据
const totalPracticeCount = computed(() => practiceStats.value.total)
const totalExamCount = computed(() => examStats.value.total)
const totalQuestionsAnswered = computed(() => {
  const practiceQuestions = practiceHistory.value.reduce((sum, item) => sum + item.total, 0)
  const examQuestions = examRecords.value.reduce((sum, item) => sum + (item.correctCount + item.incorrectCount + item.skippedCount), 0)
  return practiceQuestions + examQuestions
})
const averageAccuracy = computed(() => {
  const practiceAccuracy = practiceStats.value.accuracy
  const examAccuracy = examRecords.value.length > 0 
    ? Math.round(examRecords.value.reduce((sum, exam) => sum + exam.accuracy, 0) / examRecords.value.length)
    : 0
  
  if (practiceStats.value.total === 0 && examRecords.value.length === 0) return 0
  if (practiceStats.value.total === 0) return examAccuracy
  if (examRecords.value.length === 0) return practiceAccuracy
  
  return Math.round((practiceAccuracy + examAccuracy) / 2)
})

// 最近记录
const recentRecords = computed(() => {
  const practiceRecords = practiceHistory.value.map(item => ({
    id: item.id,
    type: 'practice',
    title: item.subjectName,
    score: item.correct,
    totalScore: item.total,
    accuracy: Math.round((item.correct / item.total) * 100),
    timestamp: item.timestamp
  }))
  
  const examRecordsData = examRecords.value.map(item => ({
    id: item.id,
    type: 'exam',
    title: item.title,
    score: item.score,
    totalScore: item.totalScore,
    accuracy: item.accuracy,
    timestamp: item.timestamp
  }))
  
  return [...practiceRecords, ...examRecordsData]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
})

// 格式化日期
function formatDate(timestamp) {
  if (!timestamp) return '未知'
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 获取分数样式类
function getScoreClass(score, totalScore) {
  const ratio = score / totalScore
  if (ratio >= 0.8) return 'good'
  if (ratio >= 0.6) return 'mid'
  return 'low'
}

// 返回上一页
function goBack() {
  router.back()
}

// 查看练习历史
function goPracticeHistory() {
  router.push('/history')
}

// 查看考试历史
function goExamHistory() {
  router.push('/exam-history')
}

// 查看记录详情
function viewRecord(record) {
  if (record.type === 'practice') {
    // 练习记录详情暂不支持
  } else if (record.type === 'exam') {
    router.push(`/exam-result?id=${record.id}`)
  }
}

// 加载数据
function loadData() {
  practiceHistory.value = getHistory()
  examRecords.value = getAllExams()
  userStats.value = getStats()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  background: var(--background-secondary);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  min-height: 56px;
  border-bottom: 1px solid var(--border-color);
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--primary);
  transition: all 0.2s ease;
}

.icon-btn:active {
  background: var(--border-color-strong);
  transform: scale(0.95);
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-black);
  letter-spacing: -0.2px;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  min-height: 56px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--primary);
  transition: all 0.2s ease;
}

.icon-btn:active {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(0.95);
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: #000;
  letter-spacing: -0.2px;
}

.placeholder {
  width: 36px;
}

.content {
  padding: var(--spacing-lg);
  padding-bottom: 100px;
}

.overview-section {
  margin-bottom: 20px;
}

.overview-card {
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-black);
  margin-bottom: 16px;
}

.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-md);
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
}

.overview-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}

.overview-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 16px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-md);
  background: #f2f2f7;
  border-radius: var(--radius-lg);
}

.overview-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}

.overview-label {
  font-size: 12px;
  color: #8e8e93;
  text-align: center;
}

.practice-section {
  margin-bottom: 20px;
}

.practice-card {
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.practice-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--spacing-md);
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-black);
  display: block;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  display: block;
}

.exam-section {
  margin-bottom: 20px;
}

.exam-card {
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.exam-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.recent-section {
  margin-bottom: 30px;
}

.recent-card {
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
  cursor: pointer;
  transition: all 0.2s ease;
}

.recent-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.recent-item.practice {
  border-color: var(--success);
  background: var(--success-light);
}

.recent-item.exam {
  border-color: var(--primary);
  background: var(--primary-light);
}

.recent-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.recent-item.practice .recent-icon {
  background: var(--success-light);
  color: var(--success);
}

.recent-item.exam .recent-icon {
  background: var(--primary-light);
  color: var(--primary);
}

.recent-info {
  flex: 1;
  min-width: 0;
}

.recent-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-black);
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
}

.recent-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.recent-type {
  font-size: 11px;
  color: var(--on-primary);
  padding: 2px 8px;
  border-radius: var(--radius-lg);
}

.recent-item.practice .recent-type {
  background: var(--success);
}

.recent-item.exam .recent-type {
  background: var(--primary);
}

.recent-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.score {
  font-size: 14px;
  font-weight: 600;
}

.score.good {
  color: #4caf50;
}

.score.mid {
  color: #ff9800;
}

.score.low {
  color: #f44336;
}

.accuracy {
  font-size: 12px;
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-state .material-symbols-outlined {
  font-size: 48px;
  color: var(--color-gray-500);
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 14px 20px;
  border-radius: var(--radius-lg);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--primary);
  background: #ffffff;
  color: var(--primary);
}

.action-btn:active {
  transform: scale(0.98);
  background: #f0f8ff;
}

@media (max-width: 768px) {
  .content {
    padding: var(--spacing-md);
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .practice-stats {
    grid-template-columns: 1fr;
  }

  .exam-stats {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>