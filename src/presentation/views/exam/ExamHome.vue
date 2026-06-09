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
            :class="{ expanded: expandedId === paper.id }" @click="toggleExpand(paper.id)">

            <!-- 收缩行 -->
            <div class="paper-row">
              <div class="paper-row-left">
                <div class="paper-title-row">
                  <h3 class="paper-title">试卷名称: {{ paper.title }}</h3>
                  <!-- <span class="paper-tag">{{ paper.paperCategory || t('mockTest') }}</span> -->
                  <span class="paper-tag">{{ "进行中" }}</span>
                </div>
                <div class="paper-sub-row">
                  <span class="paper-deadline">截止日期: {{ formatDate(paper.Expiration) || 'yyyy-MM-dd' }}</span>
                </div>
              </div>
              <div class="paper-row-right">
                <span class="paper-id">{{ t('creator') }}: {{ paper.creator || '—' }}</span>
                <span class="paper-id">ID: {{ paper.id }}</span>
              </div>
            </div>

            <!-- 展开详情 -->
            <div class="paper-detail" v-if="expandedId === paper.id" @click.stop>

              <!-- 考试范围 -->
              <div class="detail-section">
                <div class="detail-label">{{ t('examScope') }}</div>
                <div class="bank-list" v-if="paper.bankInfo && paper.bankInfo.length">
                  <div class="bank-row" v-for="(bank, idx) in visibleBanks(paper)" :key="idx">
                    <span class="bank-name">{{ bank.subject || bank.category }}</span>
                    <span class="bank-count">{{ bank.count }} {{ t('questions') }}</span>
                    <span class="bank-score">{{ bank.score }} {{ t('score') }}/{{ t('questions') }}</span>
                  </div>
                  <button class="bank-more-btn" v-if="paper.bankInfo.length > 5 && !showAllBanks"
                    @click="showAllBanks = true">
                    <Icon name="expand-more" />
                    {{ t('showAll') }} ({{ paper.bankInfo.length }})
                  </button>
                </div>
                <div class="bank-list" v-else>
                  <div class="bank-row">
                    <span class="bank-name">—</span>
                    <span class="bank-count">{{ paper.questionCount || 0 }} {{ t('questions') }}</span>
                  </div>
                </div>
              </div>

              <!-- 答题时间 & 通过分数 -->
              <div class="detail-meta">
                <span class="meta-item">{{ t('examDuration') }}: {{ paper.duration || '—' }}{{ t('minutes') }}</span>
                <span class="meta-item">{{ t('totalQuestions') }}: {{ paper.totalQuestions ?? '-' }}</span>
                <span class="meta-item">{{ t('totalScore') }}: {{ paper.totalScore ?? '-' }}</span>
                <span class="meta-item">{{ t('passScore') }}: {{ paper.passScore ?? '-' }}</span>


              </div>

              <!-- 底部操作栏 -->
              <div class="detail-actions">
                <button class="action-btn ghost" @click="exportPaper(paper)">
                  <Icon name="download" />
                </button>
                <button class="action-btn ghost danger" @click="deletePaper(paper.id)">
                  <Icon name="delete-outline" />
                </button>
                <button class="action-btn primary" @click="startExam(paper.id)">
                  {{ t('startExam') }}
                  <Icon name="play-arrow-outline" />
                </button>
              </div>
            </div>
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
const expandedId = ref(null)
const showAllBanks = ref(false)

onMounted(() => {
  store.loadExamPapers()
  store.loadExamHistory()
})

function toggleExpand(paperId) {
  expandedId.value = expandedId.value === paperId ? null : paperId
  showAllBanks.value = false
}

function visibleBanks(paper) {
  if (!paper.bankInfo) return []
  return showAllBanks.value ? paper.bankInfo : paper.bankInfo.slice(0, 5)
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
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

function exportPaper(paper) {
  store.exportPaper(paper)
}

function deletePaper(paperId) {
  if (confirm(t('confirmDeletePaper'))) {
    store.removeExamPaper(paperId)
  }
}

function startExam(paperId) {
  router.push(`/exam/paper?id=${paperId}`)
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
  gap: var(--spacing-sm);
}

/* === 卡片整体 === */
.paper-card {
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-lg);
  box-shadow: none;
  border: 1px solid var(--border-color-light);
  overflow: hidden;
  transition: box-shadow 0.25s, border-color 0.25s, background 0.25s;
  cursor: pointer;
}

.paper-card.expanded {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 20px rgba(0, 91, 191, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* === 收缩行 === */
.paper-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  gap: var(--spacing-sm);
}

.paper-row-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.paper-title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.paper-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.paper-sub-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.paper-id {
  font-size: var(--font-size-sm);
  color: var(--text-disabled);
  font-family: monospace;
}

.paper-creator {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.paper-row-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.paper-deadline {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}

.paper-deadline svg {
  font-size: 14px;
}

/* === 展开详情 === */
.paper-detail {
  padding: 0 var(--spacing-md) var(--spacing-md);
  border-top: 1px solid var(--border-color-light);
  animation: fadeSlideIn 0.2s ease;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 考试范围区块 */
.detail-section {
  margin-top: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.detail-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-mn);
}

.bank-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bank-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 6px 10px;
  background: var(--background-secondary);
  border-radius: var(--radius-md);
}

.bank-name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bank-count,
.bank-score {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}

.bank-score {
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}

.bank-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 4px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  color: var(--primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.bank-more-btn:hover {
  background: var(--primary-light);
}

.bank-more-btn svg {
  font-size: 16px;
}

.paper-tag {
  font-size: var(--font-size-mn);
  font-weight: 600;
  color: var(--background);
  background: var(--primary);
  /* border: 1px solid var(--primary); */
  padding: 1px 4px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  flex-shrink: 0;
}

/* 答题时间 & 通过分数 */
.detail-meta {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-top: 1px solid var(--border-color-light);
  margin-bottom: var(--spacing-sm);
}

.meta-item {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 底部操作栏 */
.detail-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 36px;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn svg {
  font-size: 18px;
}

.action-btn:active {
  transform: scale(0.96);
}

.action-btn.ghost {
  width: 36px;
  background: var(--color-gray-100);
  color: var(--text-secondary);
}

.action-btn.ghost.danger {
  color: var(--error);
}

.action-btn.primary {
  flex: 1;
  padding: 0 var(--spacing-md);
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: 0 2px 8px rgba(0, 91, 191, 0.2);
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