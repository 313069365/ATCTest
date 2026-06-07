<template>
  <div class="exam-page">
    <header class="top-bar">
      <h1 class="title">{{ t('examManagement') }}</h1>
      <button class="icon-btn" @click="$router.push('/exam/history')">
        <Icon name="history" />
      </button>
    </header>

    <main class="content">
      <section class="paper-section">
        <div class="paper-actions">
          <button class="paper-action-btn" @click="$router.push('/exam/create')">
            <Icon name="add" />
            <span>{{ t('createPaper') }}</span>
          </button>
          <button class="paper-action-btn" @click="triggerImport">
            <Icon name="upload" />
            <span>{{ t('importPaper') }}</span>
          </button>
          <input type="file" ref="fileInput" accept=".json" @change="handleImport" style="display: none">
        </div>

        <h2 class="section-title">{{ t('paperList') }}</h2>

        <div class="paper-list" v-if="examPapers.length > 0">
          <div v-for="paper in examPapers" :key="paper.id" class="paper-card">
            <div class="paper-header">
              <span class="paper-tag">{{ paper.paperCategory || t('mockTest') }}</span>
              <div class="paper-actions-btns">
                <button class="icon-btn-sm" @click="exportPaper(paper)">
                  <Icon name="download" />
                </button>
                <button class="icon-btn-sm delete" @click="deletePaper(paper.id)">
                  <Icon name="delete-outline" />
                </button>
              </div>
            </div>

            <h3 class="paper-title">{{ paper.title }}</h3>
            <p class="paper-desc">{{ paper.description || t('noDescription') }}</p>
            <div class="paper-stats">
              <span class="stat-item">
                <Icon name="quiz-outline" />
                {{ paper.questionCount }} {{ t('questions') }}
              </span>
              <span class="stat-item">
                <Icon name="timer-outline" />
                {{ paper.duration }} {{ t('minutes') }}
              </span>
              <span class="stat-item">
                <Icon name="grade-outline" />
                {{ paper.totalScore }} {{ t('score') }}
              </span>
              <span class="stat-item created-time">
                <Icon name="event-outline" />
                {{ formatDate(paper.createdAt) }}
              </span>
            </div>

            <button class="start-btn" @click="startExam(paper.id)">
              {{ t('startExam') }}
              <Icon name="play-arrow-outline" />
            </button>
          </div>
        </div>

        <div class="empty-state" v-else>
          <Icon name="description-outline" />
          <p>{{ t('noPapers') }}</p>
          <p class="empty-hint">{{ t('createFirstPaper') }}</p>
        </div>

        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import { t } from '@/infrastructure/utils/i18n'
import Icon from '@/presentation/components/common/Icon.vue'

const router = useRouter()
const store = useAppStore()

const examPapers = computed(() => store.examPapers)

onMounted(() => {
  store.loadExamPapers()
})

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

const fileInput = ref(null)
</script>

<style scoped>
.exam-page {
  min-height: 100vh;
  background: var(--background-secondary);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--background);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
  position: relative;
}

.icon-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  border: none;
  background: transparent;
  border-radius: 50%;
}

.icon-btn:active {
  background: var(--color-gray-400);
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.content {
  padding: var(--spacing-lg);
  padding-bottom: 100px;
}

.paper-section {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
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
  padding: var(--spacing-sm);
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
  gap: var(--spacing-md);
}

.paper-card {
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color-light);
}

.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.paper-actions-btns {
  display: flex;
  gap: 6px;
}

.icon-btn-sm {
  width: 32px;
  height: 32px;
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}

.icon-btn-sm svg {
  font-size: 18px;
  color: var(--text-secondary);
}

.icon-btn-sm.delete svg {
  color: var(--error);
}

.paper-tag {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--primary);
  background: var(--primary-light);
  padding: var(--spacing-mn) var(--spacing-md);
  border-radius: var(--radius-lg);
}

.paper-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
  margin: var(--spacing-mn);
}

.paper-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: var(--spacing-mn);
}

.paper-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--spacing-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-mn);
  color: var(--text-disabled);
}

.stat-item svg {
  font-size: 12px;
}

.stat-item.created-time {
  background: rgba(0, 91, 191, 0.1);
  color: var(--primary);
}

.start-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.25);
}

.start-btn:active {
  transform: scale(0.98);
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
</style>