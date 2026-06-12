<template>
  <div class="page">
    <TopBar :title="t('examDetail')" :showBack="true" @back="router.back()" />

    <main class="content" v-if="paper">
      <div class="hero">
        <div class="hero-top">
          <span class="visibility-badge">{{ t(paper.visibility) || t('private') }}</span>
        </div>
        <h1 class="hero-title">{{ paper.title }}</h1>
      </div>

      <div class="meta-section">
        <div class="meta-row">
          <span class="meta-label">{{ t('paperId') }}</span>
          <span class="meta-value-row">
            <span class="meta-value mono id-value">{{ paper.id }}</span>
            <button class="copy-btn" @click="copyId(paper.id)">
              <Icon name="content-copy" />
            </button>
          </span>
        </div>
        <div class="meta-row">
          <span class="meta-label">{{ t('creator') }}</span>
          <span class="meta-value">{{ paper.creator || t('unknown') }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">{{ t('createdAt') }}</span>
          <span class="meta-value">{{ formatDateTime(paper.createdAt) }}</span>
        </div>
        <div class="meta-row" v-if="paper.Expiration">
          <span class="meta-label">{{ t('deadline') }}</span>
          <span class="meta-value">{{ formatDateTime(paper.Expiration) }}</span>
        </div>
      </div>

      <div class="section-block" v-if="paper.bankInfo && paper.bankInfo.length">
        <h2 class="section-title">{{ t('examScope') }}</h2>
        <div class="scope-list">
          <div v-for="(bank, idx) in paper.bankInfo" :key="idx" class="scope-row">
            <span class="scope-subject">{{ t(bank.subject) || t(bank.category) }}</span>
            <span class="scope-detail">{{ bank.count }}{{ t('questions') }} × {{ bank.score }}{{ t('score') }}</span>
          </div>
        </div>
      </div>

      <div class="section-block">
        <h2 class="section-title">{{ t('examParams') }}</h2>
        <div class="param-grid">
          <div class="param-card">
            <span class="param-card-icon">
              <Icon name="timer-outline" />
            </span>
            <div class="param-card-body">
              <span class="param-card-label">{{ t('examDuration') }}</span>
              <span class="param-card-value">{{ paper.duration }}{{ t('minutes') }}</span>
            </div>
          </div>
          <div class="param-card">
            <span class="param-card-icon">
              <Icon name="quiz-outline" />
            </span>
            <div class="param-card-body">
              <span class="param-card-label">{{ t('totalQuestions') }}</span>
              <span class="param-card-value">{{ paper.totalQuestions ?? paper.questionCount }}{{ t('questions')
              }}</span>
            </div>
          </div>
          <div class="param-card">
            <span class="param-card-icon">
              <Icon name="assignment" />
            </span>
            <div class="param-card-body">
              <span class="param-card-label">{{ t('totalScore') }}</span>
              <span class="param-card-value">{{ paper.totalScore }}{{ t('score') }}</span>
            </div>
          </div>
          <div class="param-card">
            <span class="param-card-icon">
              <Icon name="check-circle-outline" />
            </span>
            <div class="param-card-body">
              <span class="param-card-label">{{ t('passScore') }}</span>
              <span class="param-card-value">{{ paper.passScore ?? '—' }}{{ t('score') }}</span>
            </div>
          </div>
          <div class="param-card">
            <span class="param-card-icon">
              <Icon name="refresh" />
            </span>
            <div class="param-card-body">
              <span class="param-card-label">{{ t('maxAttempts') }}</span>
              <span class="param-card-value">{{ paper.maxAttempts ?? 1 }}{{ t('times') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <button class="icon-action-btn" @click="exportPaper(paper)">
          <Icon name="download" />
        </button>
        <button class="icon-action-btn danger" @click="deletePaper(paper.id)">
          <Icon name="delete-outline" />
        </button>
        <button class="icon-action-btn" @click="sharePaper(paper.id)">
          <Icon name="share-outline" />
        </button>
        <button class="start-btn" @click="startExam(paper.id)">
          <Icon name="play-arrow-outline" />
          <span>{{ t('startExam') }}</span>
        </button>
      </div>
    </main>

    <div class="content" v-else>
      <div class="empty">
        <Icon name="description-outline" />
        <p>{{ t('paperNotFound') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import { t } from '@/infrastructure/utils/i18n'
import TopBar from '@/presentation/components/layout/TopBar.vue'
import Icon from '@/presentation/components/ui/Icon.vue'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const paper = computed(() => {
  return store.examPapers.find(p => String(p.id) === route.params.id)
})

function formatDateTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}.${m}.${d} ${h}:${min}`
}

function startExam(paperId) {
  router.push(`/exam/paper?id=${paperId}`)
}

function exportPaper(p) {
  store.exportPaper(p)
}

function deletePaper(paperId) {
  if (confirm(t('confirmDeletePaper'))) {
    store.removeExamPaper(paperId)
    router.push('/exam')
  }
}

function sharePaper(paperId) {
  const url = `${window.location.origin}/#/exam/paper?id=${paperId}`
  if (navigator.share) {
    navigator.share({ url })
  } else {
    navigator.clipboard.writeText(url)
  }
}

function copyId(id) {
  navigator.clipboard.writeText(String(id))
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background-secondary);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.content {
  padding: 0 var(--spacing-lg) 100px;
}

/* Hero */
.hero {
  padding: 10px 0px;
}

.hero-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.visibility-badge {
  font-size: 11px;
  font-weight: 500;
  color: var(--primary);
  padding: 2px 8px;
  background: var(--primary-light);
  border-radius: var(--radius-sm);
}

.hero-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
  line-height: 1.3;
  text-align: center;
}

/* Meta section */
.meta-section {
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: 20px;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.meta-row+.meta-row {
  border-top: 1px solid var(--border-color-light);
}

.meta-label {
  font-size: var(--font-size-sm);
  color: var(--text-disabled);
}

.meta-value {
  font-size: var(--font-size-sm);
  color: var(--on-surface);
}


.meta-value.mono {
  font-family: monospace;
  font-size: 11px;
  color: var(--text-disabled);
}

.meta-value-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.id-value {
  font-size: var(--font-size-sm);
  color: var(--on-surface);
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--on-surface);
  cursor: pointer;
  transition: all 0.15s;
}

.copy-btn svg {
  color: var(--on-surface);
  font-size: 16px;
}

.copy-btn:active {
  background: var(--color-gray-200);
  color: var(--primary);
}

/* Section block */
.section-block {
  margin-bottom: 20px;
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  margin: 0 0 10px;
}

/* Scope list */
.scope-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.scope-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-light);
}

.scope-subject {
  font-size: var(--font-size-sm);
  color: var(--on-surface);
  font-weight: var(--font-weight-medium);
}

.scope-detail {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Param grid */
.param-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.param-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-light);
}

.param-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--primary-light);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.param-card-icon svg {
  font-size: 18px;
  color: var(--primary);
}

.param-card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.param-card-label {
  font-size: 10px;
  color: var(--text-disabled);
}

.param-card-value {
  font-size: var(--font-size-sm);
  color: var(--on-surface);
  font-weight: var(--font-weight-semibold);
}

/* Action bar */
.action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--border-color-light);
  border-radius: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.icon-action-btn svg {
  font-size: 20px;
}

.icon-action-btn:active {
  transform: scale(0.94);
}

.icon-action-btn.danger {
  color: var(--error);
}

.start-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 48px;
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: 14px;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 91, 191, 0.25);
  transition: all 0.15s;
}

.start-btn svg {
  font-size: 22px;
}

.start-btn:active {
  transform: scale(0.97);
  box-shadow: 0 1px 4px rgba(0, 91, 191, 0.15);
}

/* Empty */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.empty svg {
  font-size: 48px;
  color: var(--primary);
  margin-bottom: var(--spacing-sm);
  opacity: 0.5;
}

.empty p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
}
</style>
