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

            <!-- 区域1：头部标题区（收缩态始终可见） -->
            <div class="paper-header">
              <div class="paper-header-left">
                <div class="paper-title-row">
                  <Icon name="book-outline" />
                  <h3 class="paper-title">{{ paper.title }}</h3>
                </div>
              </div>
              <div class="paper-header-right">
                <div class="paper-title-row">
                  <span class="header-meta">截止日期：{{ formatDate(paper.Expiration) || '无' }}</span>
                  <span class="status-tag" :class="getPaperStatus(paper)">{{ getStatusLabel(paper) }}</span>
                </div>
              </div>
            </div>

            <!-- 展开详情区域 -->
            <div class="paper-detail" v-if="expandedId === paper.id" @click.stop>

              <!-- 区域2：考试范围模块 -->
              <div class="detail-section">
                <div class="detail-label">{{ t('examScope') }}</div>
                <div class="bank-list" v-if="paper.bankInfo && paper.bankInfo.length">
                  <div class="bank-row" v-for="(bank, idx) in visibleBanks(paper)" :key="idx">
                    <span class="bank-name">{{ t(bank.subject) || t(bank.category) }}</span>
                    <span class="bank-info">{{ bank.count }}题 × {{ bank.score }}分</span>
                  </div>
                  <button class="bank-more-btn" v-if="paper.bankInfo.length > 5 && !showAllBanks"
                    @click="showAllBanks = true">
                    <Icon name="expand-more" />
                    展开全部 ({{ paper.bankInfo.length }})
                  </button>
                </div>
                <div class="bank-list" v-else>
                  <div class="bank-row">
                    <span class="bank-name">暂无科目信息</span>
                    <span class="bank-separator">｜</span>
                    <span class="bank-info">{{ paper.questionCount || 0 }}题</span>
                  </div>
                </div>
              </div>

              <!-- 试卷ID + 创建人（展开态可见） -->
              <!-- <div class="paper-id-row">
                <span class="paper-id">ID：{{ paper.id }}</span>
                <span class="paper-creator">创建人：{{ paper.creator || '无' }}</span>
              </div> -->

              <!-- 区域3：考试基础参数区（两行排布） -->
              <div class="detail-params">
                <div class="param-row">
                  <span class="param-item">
                    <span class="param-label">限时时长</span>
                    <span class="param-value">{{ paper.duration ? paper.duration + '分钟' : '无' }}</span>
                  </span>
                  <span class="param-item">
                    <span class="param-label">试卷总分</span>
                    <span class="param-value">{{ paper.totalScore ?? '无' }}</span>
                  </span>
                </div>
                <div class="param-row">
                  <span class="param-item">
                    <span class="param-label">总题量</span>
                    <span class="param-value">{{ paper.totalQuestions ?? '无' }}</span>
                  </span>
                  <span class="param-item">
                    <span class="param-label">合格分数</span>
                    <span class="param-value">{{ paper.passScore ?? '无' }}</span>
                  </span>
                </div>
              </div>

              <!-- 区域4：底部操作区（全部横向一行排列） -->
              <div class="detail-actions">
                <button class="icon-action-btn" @click="exportPaper(paper)" title="下载">
                  <Icon name="download" />
                </button>
                <button class="icon-action-btn danger" @click="deletePaper(paper.id)" title="删除">
                  <Icon name="delete-outline" />
                </button>
                <button class="start-exam-btn" @click="startExam(paper.id)">
                  {{ t('startExam') }}
                  <Icon name="play-arrow-outline" />
                </button>
                <button class="icon-action-btn" @click="sharePaper(paper.id)" title="分享">
                  <Icon name="share-outline" />
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

function getPaperStatus(paper) {
  if (!paper.Expiration) return 'status-ongoing'
  const now = Date.now()
  const exp = new Date(paper.Expiration).getTime()
  if (isNaN(exp)) return 'status-ongoing'
  if (now > exp) return 'status-ended'
  // 如果有开始时间可以判断未开始，目前默认为进行中
  return 'status-ongoing'
}

function getStatusLabel(paper) {
  if (!paper.Expiration) return '进行中'
  const now = Date.now()
  const exp = new Date(paper.Expiration).getTime()
  if (isNaN(exp)) return '进行中'
  if (now > exp) return '已结束'
  return '进行中'
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
  gap: 12px;
}

/* === 卡片整体 === */
.paper-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  box-shadow: none;
  border: 1px solid var(--border-color-light);
  overflow: hidden;
  transition: box-shadow 0.25s, border-color 0.25s, background 0.25s;
  cursor: pointer;
}

.paper-card.expanded {
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 4px 24px rgba(0, 91, 191, 0.10), 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* === 区域1：头部标题区 === */
.paper-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 18px 14px;
  gap: 12px;
}

.paper-header-left {
  flex: 1;
  min-width: 0;
}

.paper-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.paper-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

/* 状态标签 - 三色区分 */
.status-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1.6;
}

.status-tag.status-ongoing {
  color: #fff;
  background: var(--primary, #005bbf);
}

.status-tag.status-not-started {
  color: #666;
  background: #e8e8e8;
}

.status-tag.status-ended {
  color: #fff;
  background: #5a6a6e;
}

.paper-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.header-meta {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}

/* === 展开详情 === */
.paper-detail {
  padding: 0 18px 18px;
  border-top: 1px solid var(--border-color-light);
  animation: fadeSlideIn 0.22s ease;
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

/* === 区域2：考试范围模块 === */
.detail-section {
  margin-top: 14px;
  margin-bottom: 12px;
}

.detail-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.bank-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bank-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--background-secondary);
  border-radius: 10px;
}

.bank-name {
  font-size: var(--font-size-sm);
  color: var(--on-surface);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bank-separator {
  font-size: var(--font-size-sm);
  color: var(--text-disabled);
  margin: 0 8px;
  flex-shrink: 0;
}

.bank-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.bank-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 6px;
  background: none;
  border: none;
  border-radius: 10px;
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

/* 试卷ID + 创建人行 */
.paper-id-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 10px;
}

.paper-id {
  font-size: 11px;
  color: var(--text-disabled);
  font-family: monospace;
}

.paper-creator {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* === 区域3：考试基础参数区（两行排布） === */
.detail-params {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid var(--border-color-light);
  border-bottom: 1px solid var(--border-color-light);
  margin-bottom: 14px;
}

.param-row {
  display: flex;
  gap: 0;
}

.param-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.param-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}

.param-value {
  font-size: var(--font-size-sm);
  color: var(--on-surface);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

/* === 区域4：底部操作区（全部横向一行排列） === */
.detail-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-gray-100, #f2f2f2);
  border: none;
  border-radius: 10px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.icon-action-btn svg {
  font-size: 18px;
}

.icon-action-btn:active {
  transform: scale(0.94);
}

.icon-action-btn.danger {
  color: var(--error);
}

.start-exam-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  padding: 0 24px;
  background: var(--primary, #005bbf);
  color: var(--on-primary, #fff);
  border: none;
  border-radius: 14px;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 91, 191, 0.22);
  transition: all 0.15s;
}

.start-exam-btn svg {
  font-size: 20px;
}

.start-exam-btn:active {
  transform: scale(0.97);
  box-shadow: 0 1px 4px rgba(0, 91, 191, 0.15);
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