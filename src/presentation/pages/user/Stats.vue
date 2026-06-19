<template>
  <div class="stats-page">
    <TopBar title="用户统计" showBack @back="goBack" />

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
              <Icon name="assignment-outline" class="stat-icon" />
              <div class="stat-info">
                <span class="stat-value">{{ practiceStats.total }}</span>
                <span class="stat-label">练习次数</span>
              </div>
            </div>
            <div class="stat-card">
              <Icon name="check-circle-outline" class="stat-icon" />
              <div class="stat-info">
                <span class="stat-value">{{ practiceStats.correct }}</span>
                <span class="stat-label">正确题数</span>
              </div>
            </div>
            <div class="stat-card">
              <Icon name="cancel-outline" class="stat-icon" />
              <div class="stat-info">
                <span class="stat-value">{{ practiceStats.incorrect }}</span>
                <span class="stat-label">错误题数</span>
              </div>
            </div>
            <div class="stat-card">
              <Icon name="trending-up" class="stat-icon" />
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
              <Icon name="quiz-outline" class="stat-icon" />
              <div class="stat-info">
                <span class="stat-value">{{ examStats.total }}</span>
                <span class="stat-label">考试次数</span>
              </div>
            </div>
            <div class="stat-card">
              <Icon name="check-circle-outline" class="stat-icon" />
              <div class="stat-info">
                <span class="stat-value">{{ examStats.passed }}</span>
                <span class="stat-label">通过次数</span>
              </div>
            </div>
            <div class="stat-card">
              <Icon name="cancel-outline" class="stat-icon" />
              <div class="stat-info">
                <span class="stat-value">{{ examStats.failed }}</span>
                <span class="stat-label">未通过次数</span>
              </div>
            </div>
            <div class="stat-card">
              <Icon name="star-outline" class="stat-icon" />
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
                <Icon name="assignment-outline" v-if="record.type === 'practice'" />
                <Icon name="quiz-outline" v-else />
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
<Icon name="history" />
            <p>暂无记录</p>
          </div>
        </div>
      </section>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="action-btn" @click="goPracticeHistory">
          <IconHistory />
          练习记录
        </button>
        <button class="action-btn" @click="goExamHistory">
          <IconHistory />
          考试记录
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePracticeService } from '@/domain/composables/usePracticeService'
import Icon from '@/presentation/components/ui/Icon.vue'
import TopBar from '@/presentation/components/layout/TopBar.vue'

const router = useRouter()
const pm = usePracticeService()

onMounted(() => {
  pm.refresh()
})

const overallStats = pm.overallStats
const todayStats = pm.dailyStats()

const totalPracticeCount = computed(() => overallStats.value.totalSessions)
const totalExamCount = ref(0)
const totalQuestionsAnswered = computed(() => overallStats.value.totalQuestions)
const averageAccuracy = computed(() => overallStats.value.accuracy)

const practiceStats = computed(() => ({
  total: overallStats.value.totalSessions,
  correct: overallStats.value.correctCount,
  incorrect: overallStats.value.wrongCount,
  accuracy: overallStats.value.accuracy
}))

const examStats = computed(() => ({
  total: 0,
  passed: 0,
  failed: 0,
  averageScore: 0
}))

const recentRecords = computed(() =>
  pm.sessions.value.slice(0, 5).map(s => {
    const st = pm.getSessionStats(s)
    return {
      id: st.timestamp,
      type: 'practice',
      title: st.subject,
      score: st.correctCount,
      totalScore: st.totalQuestions,
      accuracy: st.accuracy,
      timestamp: st.timestamp
    }
  })
)

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

function getScoreClass(score, totalScore) {
  const ratio = totalScore > 0 ? score / totalScore : 0
  if (ratio >= 0.8) return 'good'
  if (ratio >= 0.6) return 'mid'
  return 'low'
}

function goBack() {
  router.back()
}

function goPracticeHistory() {
  router.push('/practice/practice-history')
}

function goExamHistory() {}
function viewRecord(record) {}
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  background: var(--background-secondary);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
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

.empty-state svg {
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