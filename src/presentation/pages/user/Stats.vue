<template>
  <div class="stats-page">
    <TopBar title="用户统计" showBack @back="goBack" />

    <main class="content">
      <!-- 总体统计 -->
      <section class="performance-section">
        <h3 class="section-title">表现分析</h3>
        <div class="performance-grid">
          <div class="perf-card accuracy-card">
            <div class="card-header">
              <span class="card-label">正确率</span>
              <span class="card-value primary">84.2%</span>
            </div>
            <div class="chart-bars">
              <div class="bar" style="height: 50%"></div>
              <div class="bar" style="height: 75%"></div>
              <div class="bar" style="height: 66%"></div>
              <div class="bar active" style="height: 100%"></div>
              <div class="bar" style="height: 80%"></div>
            </div>
            <p class="card-footer">最近30天提升了 4.5%</p>
          </div>

          <div class="perf-card radar-card">
            <span class="card-label">知识掌握度</span>
            <div class="radar-container">
              <div class="radar radar-1"></div>
              <div class="radar radar-2"></div>
              <div class="radar radar-3"></div>
            </div>
            <p class="radar-text">
              高: 临床理论<br />低: 伦理框架
            </p>
          </div>

          <div class="perf-card streak-card">
            <span class="card-label">总答题</span>
            <span class="card-value tertiary">14 天连续</span>
            <div class="streak-icons">
              <div class="streak-icon fire">
                <Icon name="local-fire-department-outline" />
              </div>
              <div class="streak-icon verified">
                <Icon name="verified-outline" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="history-section">
        <div class="section-header">
          <h3 class="section-title">练习记录</h3>
          <button class="more-btn">查看全部</button>
        </div>
        <div class="empty-history">
          <p>暂无练习记录</p>
        </div>
      </section>

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

.performance-section {
  margin-top: var(--spacing-sm);
}

.performance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.perf-card {
  background: var(--background-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  border: 1px solid var(--border-color-light);
}

.accuracy-card {
  grid-column: span 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--spacing-md);
}

.card-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface-variant);
}

.card-value {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
}

.card-value.primary {
  color: var(--primary);
}

.card-value.tertiary {
  color: var(--secondary);
}

.chart-bars {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-end;
  height: 64px;
}

.bar {
  flex: 1;
  background: var(--border-color-strong);
  border-radius: 4px 4px 0 0;
}

.bar.active {
  background: var(--primary);
}

.card-footer {
  font-size: 11px;
  color: var(--on-surface-variant);
  font-style: italic;
  margin-top: var(--spacing-sm);
}

.radar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.radar-container {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--spacing-md) 0;
}

.radar {
  position: absolute;
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.radar-1 {
  inset: 0;
  background: var(--border-color-strong);
  opacity: 0.5;
}

.radar-2 {
  inset: 8px;
  background: var(--primary);
  opacity: 0.4;
}

.radar-3 {
  inset: 16px;
  background: var(--primary);
  opacity: 0.6;
  transform: scale(0.75);
}

.radar-text {
  font-size: 10px;
  color: var(--on-surface-variant);
  text-align: center;
  line-height: 1.5;
}

.streak-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.streak-icons {
  display: flex;
  gap: calc(var(--spacing-sm) * -1);
  margin-top: var(--spacing-sm);
}

.streak-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--background);
}

.streak-icon.fire {
  background: var(--secondary);
}

.streak-icon svg {
  font-size: 12px;
  color: var(--on-primary);
}

.streak-icon.verified {
  background: var(--primary);
}

.history-section {
  margin-top: var(--spacing-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.more-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.empty-history {
  text-align: center;
  padding: 48px 16px;
  color: var(--on-surface-variant);
  font-size: var(--font-size-sm);
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