<template>
  <div class="data-management">
    <TopBar title="题库管理" showBack @back="goBack" />

    <main class="content">
      <!-- 题库缓存汇总 -->
      <section class="section">
        <h3 class="section-title">题库缓存</h3>
        <div class="card">
          <div class="card-row">
            <span class="card-label">科目数</span>
            <span class="card-value">{{ totalSubjects }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">总题数</span>
            <span class="card-value">{{ totalQuestions }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">版本</span>
            <span class="card-value">Ver {{ bankVersion }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">缓存状态</span>
            <span class="card-value" :class="allFilesCached ? 'status-cached' : 'status-uncached'">
              {{ cachedFileCount }}/{{ fileManifest.length }} 个文件
            </span>
          </div>
        </div>
      </section>

      <!-- 题库文件列表 -->
      <section class="section">
        <h3 class="section-title">题库文件</h3>
        <div v-for="group in fileGroups" :key="group.category" class="file-group">
          <div class="file-group-header">
            <Icon name="storage" class="file-group-icon" />
            <span class="file-group-title">{{ group.category }}</span>
            <span class="file-group-count">{{ group.cachedCount }}/{{ group.files.length }}</span>
          </div>
          <div class="file-list">
            <div v-for="file in group.files" :key="file.filename" class="file-row">
              <div class="file-info">
                <span class="file-name">{{ getDisplayName(file.filename) }}</span>
                <span class="file-meta">{{ file.subjects.length }}科目 · {{ file.questionCount }}题</span>
              </div>
              <div class="file-actions">
                <span class="file-status" :class="store.fileStatus[file.filename]">
                  {{ statusLabel(store.fileStatus[file.filename]) }}
                </span>
                <button v-if="store.fileStatus[file.filename] === 'idle' || store.fileStatus[file.filename] === 'error'"
                  class="file-btn download" @click="handleDownload(file.filename)">
                  <Icon name="download" />
                </button>
                <button v-else-if="store.fileStatus[file.filename] === 'downloading'" class="file-btn loading" disabled>
                  <div class="btn-spinner"></div>
                </button>
                <button v-else-if="store.fileStatus[file.filename] === 'cached'" class="file-btn cached"
                  @click="handleDelete(file.filename)">
                  <Icon name="delete-outline" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="batch-actions">
          <button class="batch-btn primary" @click="handleDownloadAll" :disabled="allFilesCached || downloading">
            <Icon name="download" />
            <span>{{ downloading ? '下载中...' : '下载全部' }}</span>
          </button>
          <button class="batch-btn danger" @click="handleClearAll" :disabled="!cachedFileCount || downloading">
            <Icon name="delete-outline" />
            <span>清除全部</span>
          </button>
        </div>
      </section>
    </main>
    <ConfirmDialog v-bind="confirm.state" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import { storage } from '@/infrastructure/storage/useStorage'
import { computeBankHash, getFileManifest } from '@/infrastructure/api/dataSource'
import Icon from '@/presentation/components/ui/Icon.vue'
import TopBar from '@/presentation/components/shared/TopBar.vue'
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog.vue'
import { useConfirm } from '@/presentation/composables/useConfirm'

const router = useRouter()
const store = useAppStore()
const confirm = useConfirm()

const downloading = ref(false)

const bankVersion = computed(() => computeBankHash())

const fileManifest = computed(() => getFileManifest())

const fileGroups = computed(() => {
  const groups = {}
  for (const file of fileManifest.value) {
    if (!groups[file.category]) {
      groups[file.category] = { category: file.category, files: [], cachedCount: 0 }
    }
    groups[file.category].files.push(file)
    if (store.fileStatus[file.filename] === 'cached') {
      groups[file.category].cachedCount++
    }
  }
  return Object.values(groups)
})

const cachedFileCount = computed(() => {
  return fileManifest.value.filter(f => store.fileStatus[f.filename] === 'cached').length
})

const allFilesCached = computed(() => cachedFileCount.value === fileManifest.value.length)

const totalSubjects = computed(() => {
  const meta = store.bankMeta
  let count = 0
  for (const category of Object.values(meta)) {
    count += Object.keys(category.subjects || {}).length
  }
  return count
})

const totalQuestions = computed(() => {
  const meta = store.bankMeta
  let count = 0
  for (const category of Object.values(meta)) {
    for (const subject of Object.values(category.subjects || {})) {
      count += subject.count || 0
    }
  }
  return count
})

function getDisplayName(filename) {
  const parts = filename.split('/')
  return parts[parts.length - 1]
}

function statusLabel(status) {
  const map = { cached: '已缓存', idle: '未缓存', downloading: '下载中', error: '失败' }
  return map[status] || '未知'
}

function goBack() {
  router.push({ name: 'Profile' })
}

async function handleDownload(filename) {
  await store.downloadFile(filename)
}

async function handleDelete(filename) {
  const name = getDisplayName(filename)
  if (!await confirm.show(`删除 ${name} 的缓存？需要重新下载才能使用该科目的题目。`)) return
  await store.deleteFile(filename)
}

async function handleDownloadAll() {
  downloading.value = true
  try {
    await store.downloadAllFiles()
  } finally {
    downloading.value = false
  }
}

async function handleClearAll() {
  if (!await confirm.show('清除所有题库缓存？清除后需要重新下载。')) return
  try {
    for (const file of fileManifest.value) {
      if (store.fileStatus[file.filename] === 'cached') {
        await store.deleteFile(file.filename)
      }
    }
    storage.removeItem('bank_version')
  } catch (e) {
    console.error('清除缓存失败:', e)
  }
}

onMounted(() => {
  store.loadBankMeta()
  store.initFileStatus()
})
</script>

<style scoped>
.data-management {
  min-height: 100vh;
  background: var(--color-muted);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.content {
  padding: var(--space-lg);
  padding-bottom: 100px;
}

.section {
  margin-bottom: var(--space-lg);
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  border: 1px solid var(--color-border-light);
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2xs) 0;
}

.card-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.card-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.status-cached {
  color: var(--color-primary);
}

.status-uncached {
  color: var(--color-destructive);
}

/* 文件分组 */
.file-group {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.file-group-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border-light);
}

.file-group-icon {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.file-group-title {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  text-transform: uppercase;
}

.file-group-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: var(--color-card);
  padding: 1px 8px;
  border-radius: var(--radius-full);
}

.file-list {
  display: flex;
  flex-direction: column;
}

.file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
}

.file-row+.file-row {
  border-top: 1px solid var(--color-border-light);
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.file-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  font-family: 'SF Mono', 'Menlo', monospace;
}

.file-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.file-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.file-status {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: 1px 8px;
  border-radius: var(--radius-full);
}

.file-status.cached {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.file-status.idle {
  color: var(--color-text-secondary);
  background: var(--color-muted);
}

.file-status.downloading {
  color: var(--color-warning);
  background: var(--color-warning-bg);
}

.file-status.error {
  color: var(--color-destructive);
  background: var(--color-destructive-bg);
}

.file-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.file-btn.download {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.file-btn.download:active {
  transform: scale(0.92);
}

.file-btn.cached {
  background: var(--color-muted);
  color: var(--color-text-secondary);
}

.file-btn.cached:active {
  background: var(--color-destructive-bg);
  color: var(--color-destructive);
}

.file-btn.loading {
  background: var(--color-warning-bg);
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-warning);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 底部操作栏 */
.batch-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.batch-btn {
  flex: 1;
  padding: var(--space-ms);
  border: none;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.15s;
}

.batch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.batch-btn.primary {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

.batch-btn.primary:active:not(:disabled) {
  transform: scale(0.98);
}

.batch-btn.danger {
  background: var(--color-destructive-light);
  color: var(--color-destructive);
}

.batch-btn.danger:active:not(:disabled) {
  transform: scale(0.98);
}
</style>
