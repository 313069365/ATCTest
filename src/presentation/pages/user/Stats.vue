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
import TopBar from '@/presentation/components/shared/TopBar.vue'

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
  background: var(--color-background);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
}



.content {
  padding: var(--space-lg);
  padding-bottom: 100px;
}

.overview-section {
  margin-bottom: 20px;
}

.overview-card {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: 16px;
}

.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--color-muted);
  border-radius: var(--radius-lg);
}

.overview-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.overview-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: 16px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--color-muted);
  border-radius: var(--radius-lg);
}

.overview-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.overview-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

.practice-section {
  margin-bottom: 20px;
}

.practice-card {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.practice-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-ms);
  padding: var(--space-md);
  background: var(--color-muted);
  border-radius: var(--radius-lg);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  display: block;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  display: block;
}

.exam-section {
  margin-bottom: 20px;
}

.exam-card {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.exam-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.recent-section {
  margin-bottom: 30px;
}

.recent-card {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-ms);
}

.recent-item {
  display: flex;
  align-items: center;
  gap: var(--space-ms);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: all 0.2s ease;
}

.recent-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.recent-item.practice {
  border-color: var(--color-success);
  background: var(--color-success-light);
}

.recent-item.exam {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
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
  background: var(--color-success-light);
  color: var(--color-success);
}

.recent-item.exam .recent-icon {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.recent-info {
  flex: 1;
  min-width: 0;
}

.recent-info h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--space-2xs) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-meta {
  display: flex;
  gap: var(--space-ms);
  margin-bottom: var(--space-2xs);
}

.recent-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.recent-type {
  font-size: var(--font-size-sm);
  color: var(--color-primary-foreground);
  padding: 2px 8px;
  border-radius: var(--radius-lg);
}

.recent-item.practice .recent-type {
  background: var(--color-success);
}

.recent-item.exam .recent-type {
  background: var(--color-primary);
}

.recent-stats {
  display: flex;
  gap: var(--space-ms);
  align-items: center;
}

.score {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.score.good {
  color: var(--color-success);
}

.score.mid {
  color: var(--color-warning);
}

.score.low {
  color: var(--color-destructive);
}

.accuracy {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
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
  color: var(--gray-500);
  margin-bottom: 12px;
}

.empty-state p {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: var(--space-ms);
  margin-top: 20px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 14px 20px;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--color-primary);
  background: var(--color-background);
  color: var(--color-primary);
}

.action-btn:active {
  transform: scale(0.98);
  background: var(--color-primary-light);
}

.performance-section {
  margin-top: var(--space-sm);
}

.performance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.perf-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  border: 1px solid var(--color-border-light);
}

.accuracy-card {
  grid-column: span 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-md);
}

.card-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}

.card-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}

.card-value.primary {
  color: var(--color-primary);
}

.card-value.tertiary {
  color: var(--color-secondary);
}

.chart-bars {
  display: flex;
  gap: var(--space-md);
  align-items: flex-end;
  height: 64px;
}

.bar {
  flex: 1;
  background: var(--color-border-strong);
  border-radius: var(--radius-sm);
}

.bar.active {
  background: var(--color-primary);
}

.card-footer {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
  margin-top: var(--space-sm);
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
  margin: var(--space-md) 0;
}

.radar {
  position: absolute;
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.radar-1 {
  inset: 0;
  background: var(--color-border-strong);
  opacity: 0.5;
}

.radar-2 {
  inset: 8px;
  background: var(--color-primary);
  opacity: 0.4;
}

.radar-3 {
  inset: 16px;
  background: var(--color-primary);
  opacity: 0.6;
  transform: scale(0.75);
}

.radar-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
  line-height: var(--line-height-normal);
}

.streak-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.streak-icons {
  display: flex;
  gap: calc(var(--space-sm) * -1);
  margin-top: var(--space-sm);
}

.streak-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-background);
}

.streak-icon.fire {
  background: var(--color-secondary);
}

.streak-icon svg {
  font-size: var(--font-size-sm);
  color: var(--color-primary-foreground);
}

.streak-icon.verified {
  background: var(--color-primary);
}

.history-section {
  margin-top: var(--space-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.more-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.empty-history {
  text-align: center;
  padding: 48px 16px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .content {
    padding: var(--space-md);
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