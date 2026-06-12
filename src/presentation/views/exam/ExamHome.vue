<template>
  <div class="exam-page">
    <TopBar :title="t('examManagement')">
      <template #right>
        <button class="icon-btn" @click="triggerImport">
          <Icon name="upload" />
        </button>
        <input type="file" ref="fileInput" accept=".json" @change="handleImport" style="display: none">
      </template>
    </TopBar>

    <main class="content">
      <section class="paper-section">
        <div class="paper-actions">
          <button class="paper-action-btn" @click="$router.push('/exam/create')">
            <Icon name="add" />
            <span>{{ t('createPaper') }}</span>
          </button>
          <button class="paper-action-btn" @click="showJoinDialog = true">
            <Icon name="person-add-outline" />
            <span>{{ t('joinExam') }}</span>
          </button>
        </div>


        <div class="section-title-row">
          <h2 class="section-title">{{ t('paperList') }}</h2>
          <button class="view-all-btn" @click="$router.push('/exam/papers')">
            {{ t('viewAll') }}
            <Icon name="chevron-right" />
          </button>
        </div>
        <div class="paper-list" v-if="examPapers.length > 0">
          <div v-for="paper in examPapers.slice(0, 5)" :key="paper.id" class="paper-card"
            @click="goToDetail(paper.id)">
            <span class="status-dot" :class="getPaperStatus(paper)"></span>
            <h3 class="paper-title">{{ paper.title }}</h3>
            <span class="card-deadline" v-if="paper.Expiration">{{ formatDate(paper.Expiration) }}</span>
          </div>
        </div>

        <div class="empty-state" v-else>
          <Icon name="description-outline" />
          <p>{{ t('noPapers') }}</p>
          <p class="empty-hint">{{ t('createFirstPaper') }}</p>
        </div>
      </section>

      <!-- 我参加的考试 -->
      <section class="history-section">
        <div class="section-title-row">
          <h2 class="section-title">{{ t('myExams') }}</h2>
          <button class="view-all-btn" @click="$router.push('/exam/history')">
            {{ t('viewAll') }}
            <Icon name="chevron-right" />
          </button>
        </div>
        <div class="empty-state compact" v-if="!examHistory.length">
          <Icon name="history" />
          <p>{{ t('noExamHistory') }}</p>
        </div>
        <div class="history-list" v-else>
          <div v-for="record in examHistory.slice(0, 3)" :key="record.id" class="history-card"
            @click="$router.push(`/exam/result?id=${record.id}`)">
            <div class="history-card-left">
              <h4 class="history-title">{{ record.paperTitle }}</h4>
              <span class="history-date">{{ formatDate(record.completedAt) }}</span>
            </div>
            <div class="history-card-right">
              <span class="history-score" :class="{ passed: record.passed }">
                {{ record.score }}/{{ record.totalScore }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <router-view />
    </main>

    <JoinExamDialog :visible="showJoinDialog" @close="showJoinDialog = false" @join="handleJoinExam" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import { t } from '@/infrastructure/utils/i18n'
import TopBar from '@/presentation/components/layout/TopBar.vue'
import Icon from '@/presentation/components/ui/Icon.vue'
import JoinExamDialog from '@/presentation/components/session/JoinExamDialog.vue'

const router = useRouter()
const store = useAppStore()

const examPapers = computed(() => store.examPapers)
const examHistory = computed(() => store.examHistory)

onMounted(() => {
  store.loadExamPapers()
  store.loadExamHistory()
})

function goToDetail(paperId) {
  router.push(`/exam/detail/${paperId}`)
}

function getPaperStatus(paper) {
  if (!paper.Expiration) return 'unlimited'
  const now = Date.now()
  const exp = new Date(paper.Expiration).getTime()
  if (isNaN(exp)) return 'ongoing'
  if (now > exp) return 'ended'
  return 'ongoing'
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

function triggerImport() {
  fileInput.value.click()
}

async function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    await store.importPaper(file)
    alert(t('importSuccess') || '导入成功')
  } catch (err) {
    alert((t('importFailed') || '导入失败') + ': ' + err.message)
  }

  event.target.value = ''
}

const showJoinDialog = ref(false)

function handleJoinExam(paperId) {
  showJoinDialog.value = false
  router.push(`/exam/paper?id=${paperId}`)
}

const fileInput = ref(null)
</script>

<style scoped>
.exam-page {
  min-height: 100vh;
  background: var(--background-secondary);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.content {
  padding: var(--spacing-md) var(--spacing-lg);
  padding-bottom: 100px;
}

.paper-section {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
  margin: 0;
  margin-bottom: var(--spacing-sm);
}

.paper-actions {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.paper-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-smd);
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  color: var(--primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  border: none;
}

.paper-action-btn:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}

.paper-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* === 卡片样式 === */
.paper-card {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  gap: 10px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  border: 1px solid var(--border-color-light);
  cursor: pointer;
  transition: background 0.15s;
}

.paper-card:active {
  background: rgba(255, 255, 255, 0.95);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.ongoing {
  background: var(--primary, #005bbf);
}

.status-dot.ended {
  background: #5a6a6e;
}

.status-dot.unlimited {
  background: #2e7d32;
}

.paper-title {
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.card-deadline {
  flex-shrink: 0;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  white-space: nowrap;
  margin-left: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  background: var(--background);
  border-radius: var(--radius-lg);
}

.empty-state svg {
  font-size: 48px;
  color: var(--primary);
  margin-bottom: var(--spacing-sm);
  opacity: 0.5;
}

.empty-state p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
}

.empty-state .empty-hint {
  font-size: var(--font-size-sm);
  color: var(--text-disabled);
  margin-top: var(--spacing-sm);
}

.empty-state.compact {
  padding: 32px 24px;
}

.empty-state.compact svg {
  font-size: 36px;
}

/* === 我参加的考试 === */
.history-section {
  margin-bottom: var(--spacing-lg);
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0;
  background: none;
  border: none;
  color: var(--primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.view-all-btn svg {
  font-size: 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.history-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
  cursor: pointer;
  transition: background 0.15s;
}

.history-card:active {
  background: rgba(255, 255, 255, 0.9);
}

.history-card-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-date {
  font-size: var(--font-size-sm);
  color: var(--text-disabled);
}

.history-card-right {
  flex-shrink: 0;
  margin-left: var(--spacing-sm);
}

.history-score {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--error);
}

.history-score.passed {
  color: var(--success, #2e7d32);
}
</style>