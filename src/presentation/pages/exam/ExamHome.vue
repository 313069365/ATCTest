<template>
  <div class="exam-page">
    <TopBar :title="t('examManagement')">
      <template #right>
        <button class="icon-btn" @click="triggerImport">
          <Icon name="upload" />
        </button>
      </template>
    </TopBar>

    <main class="content">
      <section class="paper-section">
        <div class="paper-actions">
          <button class="paper-action-btn" @click="$router.push('/exam/create')">
            <Icon name="add" />
            <span>{{ t('createPaper') }}</span>
          </button>
          <button class="paper-action-btn" @click="">
            <Icon name="person" />
            <span>{{ t('joinExam') }}</span>
          </button>
          <input type="file" ref="fileInput" accept=".json" @change="handleImport" style="display: none">
        </div>

        <h2 class="section-title">{{ t('paperList') }}</h2>

        <SegmentedControl v-model="activeFilter" :options="filterOptions" variant="primary" />

        <div class="paper-list" v-if="examPapers.length > 0">
          <div v-for="paper in examPapers" :key="paper.id" class="paper-card">
            <div class="paper-header">
              <h3 class="paper-title">{{ paper.title }}</h3>
              <span class="paper-tag">ID: {{ paper.id }}</span>
            </div>

            <div class="paper-stats">
              <span class="stat-item">
                <Icon name="quiz-outline" />
                {{ paper.questionCount }} {{ t('questions') }}
              </span>
              <span class="stat-item">
                <Icon name="grade-outline" />
                {{ paper.totalScore }} {{ t('score') }}
              </span>
              <span class="stat-item">
                <Icon name="timer-outline" />
                {{ paper.duration }} {{ t('minutes') }}
              </span>
              <span class="stat-item created-time">
                <Icon name="event-outline" />
                {{ formatDate(paper.createdAt) }}
              </span>
            </div>
            <div class="paper-actions">
              <div class="paper-actions-btns">
                <button class="icon-btn-sm" @click="exportPaper(paper)">
                  <Icon name="download" />
                </button>
                <button class="icon-btn-sm delete" @click="deletePaper(paper.id)">
                  <Icon name="delete-outline" />
                </button>
              </div>
              <button class="start-btn" @click="startExam(paper.id)">
                {{ t('startExam') }}
              </button>
            </div>
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
    <ConfirmDialog v-bind="confirm.state" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import { t } from '@/infrastructure/utils/i18n'
import TopBar from '@/presentation/components/layout/TopBar.vue'
import Icon from '@/presentation/components/common/Icon.vue'
import ConfirmDialog from '@/presentation/components/common/ConfirmDialog.vue'
import SegmentedControl from '@/presentation/components/common/SegmentedControl.vue'
import { useConfirm } from '@/presentation/composables/useConfirm'

const router = useRouter()
const store = useAppStore()
const confirm = useConfirm()

const activeFilter = ref('in-progress')

const filterOptions = computed(() => [
  { value: 'in-progress', label: t('inProgress') },
  { value: 'completed', label: t('completed') },
  { value: 'expired', label: t('expired') },
])

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

async function deletePaper(paperId) {
  if (await confirm.show(t('confirmDeletePaper'))) {
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
  background: var(--color-muted);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.content {
  padding: var(--space-md) var(--space-lg);
  padding-bottom: 100px;
}

.paper-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.paper-actions {
  display: flex;
  gap: var(--space-lg);
  align-items: center;
}

.paper-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm);
  background: var(--color-card);
  border-radius: var(--radius-md);
  color: var(--color-primary);
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
  gap: var(--space-md);
}

.paper-card {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-light);
}

.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.paper-actions-btns {
  display: flex;
  gap: var(--space-2xs);
}

.icon-btn-sm {
  width: 32px;
  height: 32px;
  background: var(--gray-100);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}

.icon-btn-sm svg {
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
}

.icon-btn-sm.delete svg {
  color: var(--color-destructive);
}

.paper-tag {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  background: var(--gray-200);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
}

.paper-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: var(--space-xs);
}

.paper-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--space-xs);
}

.paper-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs);
  margin-bottom: var(--space-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 3px 8px;
  background: var(--color-muted);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-xs);
  color: var(--color-disabled);
}

.stat-item svg {
  font-size: var(--font-size-sm);
}

.stat-item.created-time {}

.start-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  box-shadow: 0 4px 12px var(--color-primary-bg);
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
  background: var(--color-background);
  border-radius: var(--radius-lg);
}

.empty-state svg {
  font-size: 48px;
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
  opacity: 0.5;
}

.empty-state p {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: 0;
}

.empty-state .empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-disabled);
  margin-top: var(--space-sm);
}
</style>