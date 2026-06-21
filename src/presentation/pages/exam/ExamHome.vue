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
          <PaperCard v-for="paper in examPapers" :key="paper.id" :paper="paper" @export="exportPaper"
            @delete="deletePaper" @start="startExam" @share="sharePaper" />
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
import TopBar from '@/presentation/components/shared/TopBar.vue'
import Icon from '@/presentation/components/ui/Icon.vue'
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog.vue'
import SegmentedControl from '@/presentation/components/shared/SegmentedControl.vue'
import PaperCard from './components/PaperCard.vue'
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

async function startExam(paperId) {
  const paper = examPapers.value.find(p => p.id === paperId)
  if (!paper) return
  const msg = `考试名称：${paper.title}\n考试时长：${paper.duration} 分钟\n允许次数：${paper.maxAttempts} 次`
  if (await confirm.show(msg, { title: '确认开始考试' })) {
    router.push(`/exam/paper?id=${paperId}`)
  }
}

async function sharePaper(paperId) {
  const text = `${paperId}`
  try {
    await navigator.clipboard.writeText(text)
    alert('试卷ID已复制到剪贴板\n' + text)
  } catch {
    alert(text)
  }
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
  border-radius: var(--radius-lg);
  overflow: hidden;
  gap: var(--space-sm);
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