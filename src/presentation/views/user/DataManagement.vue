<template>
  <div class="data-management">
    <header class="top-bar">
      <button class="icon-btn" @click="goBack">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="title">数据管理</h1>
    </header>

    <main class="content">
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
            <span class="card-value" :class="cached ? 'status-cached' : 'status-uncached'">
              {{ cached ? '已缓存' : '未缓存' }}
            </span>
          </div>
          <div v-if="refreshProgress.visible" class="progress-bar">
            <div class="progress-fill" :class="{ indeterminate: refreshProgress.indeterminate }"></div>
          </div>
          <button class="card-btn" @click="refreshCache" :disabled="store.loading">
            <span class="material-symbols-outlined">refresh</span>
            <span>{{ store.loading ? '更新中...' : '刷新题库缓存' }}</span>
          </button>
        </div>
      </section>

      <section class="section">
        <h3 class="section-title">用户数据</h3>
        <div class="data-list">
          <div v-for="item in dataItems" :key="item.key" class="data-row">
            <div class="data-info">
              <span class="material-symbols-outlined data-icon" :class="item.iconClass">{{ item.icon }}</span>
              <div>
                <span class="data-name">{{ item.name }}</span>
                <span class="data-count">{{ item.count }}条</span>
              </div>
            </div>
            <button class="clear-btn" @click="clearSingle(item.key, item.name)">清除</button>
          </div>
        </div>
        <button class="clear-all-btn" @click="clearAll" :disabled="clearing">
          <span class="material-symbols-outlined">delete_sweep</span>
          <span>{{ clearing ? '清除中...' : '清除所有用户数据' }}</span>
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import { storage, STORAGE_KEY } from '@/infrastructure/storage/useStorage'
import { computeBankHash } from '@/infrastructure/api/dataSource'

const router = useRouter()
const store = useAppStore()

const clearing = ref(false)
const refreshProgress = ref({ visible: false, indeterminate: false })

const cached = computed(() => !!storage.getItem('bank_version'))

const bankVersion = computed(() => computeBankHash())

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

const dataItems = computed(() => [
  { key: STORAGE_KEY.USER_WRONG_BOOK, name: '错题本', count: store.wrongBook.length, icon: 'error_outline', iconClass: 'error-icon' },
  { key: STORAGE_KEY.USER_FAVORITES, name: '收藏本', count: store.favorites.length, icon: 'bookmark', iconClass: 'fav-icon' },
  { key: STORAGE_KEY.PRACTICE_HISTORY, name: '练习记录', count: store.practiceHistory.length, icon: 'assignment_turned_in', iconClass: 'history-icon' },
  { key: STORAGE_KEY.EXAM_PAPERS, name: '考试记录', count: store.examPapers.length, icon: 'quiz', iconClass: 'exam-icon' },
  { key: STORAGE_KEY.EXAM_PRESETS, name: '考试预设', count: store.examPresets.length, icon: 'settings', iconClass: 'preset-icon' },
])

function goBack() {
  router.push({ name: 'Profile' })
}

async function refreshCache() {
  refreshProgress.value = { visible: true, indeterminate: true }
  try {
    await store.forceRefreshQuestions()
  } catch (e) {
    console.error('刷新题库失败:', e)
  } finally {
    refreshProgress.value = { visible: false, indeterminate: false }
  }
}

async function clearSingle(key, name) {
  if (!confirm(`清除${name}？此操作不可撤销。`)) return
  storage.removeItem(key)
  reloadData(key)
}

async function clearAll() {
  const items = dataItems.value
  const detail = items.map(i => `${i.name}(${i.count}条)`).join('、')
  if (!confirm(`将删除以下所有本地数据：\n${detail}\n\n此操作不可撤销。`)) return
  clearing.value = true
  try {
    for (const item of items) {
      storage.removeItem(item.key)
    }
    storage.removeItem(STORAGE_KEY.PRACTICE_PROGRESS)
    for (const item of items) {
      reloadData(item.key)
    }
    store.loadPracticeProgress()
  } catch (e) {
    console.error('清除失败:', e)
  } finally {
    clearing.value = false
  }
}

function reloadData(key) {
  switch (key) {
    case STORAGE_KEY.USER_WRONG_BOOK: store.loadWrongBook(); break
    case STORAGE_KEY.USER_FAVORITES: store.loadFavorites(); break
    case STORAGE_KEY.PRACTICE_HISTORY: store.loadPracticeHistory(); break
    case STORAGE_KEY.EXAM_PAPERS: store.loadExamPapers(); break
    case STORAGE_KEY.EXAM_PRESETS: store.loadExamPresets(); break
  }
}

onMounted(() => {
  store.loadBankMeta()
})
</script>

<style scoped>
.data-management {
  min-height: 100vh;
  background: var(--background);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--background);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--primary);
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

.section {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-sm);
}

.card {
  background: var(--background-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  border: 1px solid var(--border-color-light);
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.card-label {
  font-size: var(--font-size-sm);
  color: var(--on-surface-variant);
}

.card-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
}

.status-cached {
  color: var(--primary);
}

.status-uncached {
  color: var(--error);
}

.progress-bar {
  margin: 8px 0;
  height: 4px;
  background: var(--border-color-light);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
}

.progress-fill.indeterminate {
  width: 30%;
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}

@keyframes progress-indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

.card-btn {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  background: var(--primary);
  border: none;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--on-primary);
  cursor: pointer;
}

.card-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.data-list {
  background: var(--background-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
  overflow: hidden;
}

.data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px var(--spacing-md);
}

.data-row + .data-row {
  border-top: 1px solid var(--border-color-light);
}

.data-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.data-icon {
  font-size: 20px;
}

.data-icon.error-icon { color: var(--error); }
.data-icon.fav-icon { color: var(--secondary); }
.data-icon.history-icon { color: var(--primary); }
.data-icon.exam-icon { color: var(--primary); }
.data-icon.preset-icon { color: var(--on-surface-variant); }

.data-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  display: block;
}

.data-count {
  font-size: 12px;
  color: var(--on-surface-variant);
}

.clear-btn {
  padding: 4px 12px;
  background: var(--background);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--on-surface-variant);
  cursor: pointer;
}

.clear-btn:active {
  background: var(--border-color-light);
}

.clear-all-btn {
  width: 100%;
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--error-light);
  border: none;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--error);
  cursor: pointer;
}

.clear-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
