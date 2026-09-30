<template>
  <div class="user-data">
    <TopBar title="用户数据" showBack @back="goBack" />

    <main class="content">
      <section class="section">
        <h3 class="section-title">本地数据</h3>
        <div class="data-list">
          <div v-for="item in dataItems" :key="item.key" class="data-row">
            <div class="data-info">
              <Icon :name="item.iconName" class="data-icon" :class="item.iconClass" />
              <div>
                <span class="data-name">{{ item.name }}</span>
                <span class="data-count">{{ item.count }}条</span>
              </div>
            </div>
            <button class="clear-btn" @click="clearSingle(item.key, item.name)">清除</button>
          </div>
          <div class="data-row">
            <button class="clear-all-btn" @click="clearAll" :disabled="clearing">
              <Icon name="delete-sweep-outline" />
              <span>{{ clearing ? '清除中...' : '清除所有用户数据' }}</span>
            </button>
          </div>
        </div>
      </section>
    </main>
    <ConfirmDialog v-bind="confirm.state" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import { storage, STORAGE_KEY } from '@/infrastructure/storage/useStorage'
import Icon from '@/presentation/components/ui/Icon.vue'
import TopBar from '@/presentation/components/shared/TopBar.vue'
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog.vue'
import { useConfirm } from '@/presentation/composables/useConfirm'

const router = useRouter()
const store = useAppStore()
const confirm = useConfirm()

const clearing = ref(false)

const dataItems = computed(() => [
  { key: STORAGE_KEY.USER_WRONG_BOOK, name: '错题本', count: store.wrongBook.length, iconName: 'error-outline', iconClass: 'error-icon' },
  { key: STORAGE_KEY.USER_FAVORITES, name: '收藏本', count: store.favorites.length, iconName: 'bookmark-outline', iconClass: 'fav-icon' },
  { key: STORAGE_KEY.PRACTICE_HISTORY, name: '练习记录', count: store.practiceHistory.length, iconName: 'assignment-turned-in-outline', iconClass: 'history-icon' },
  { key: STORAGE_KEY.EXAM_PAPERS, name: '考试记录', count: store.examPapers.length, iconName: 'quiz-outline', iconClass: 'exam-icon' },
])

function goBack() {
  router.push({ name: 'Profile' })
}

async function clearSingle(key, name) {
  if (!await confirm.show(`清除${name}？此操作不可撤销。`)) return
  storage.removeItem(key)
  reloadData(key)
}

async function clearAll() {
  const items = dataItems.value
  const detail = items.map(i => `${i.name}(${i.count}条)`).join('、')
  if (!await confirm.show(`将删除以下所有本地数据：\n${detail}\n\n此操作不可撤销。`)) return
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
</script>

<style scoped>
.user-data {
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

.data-list {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
}

.data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px var(--space-md);
}

.data-row + .data-row {
  border-top: 1px solid var(--color-border-light);
}

.data-info {
  display: flex;
  align-items: center;
  gap: var(--space-ms);
}

.data-icon {
  font-size: var(--font-size-xl);
}

.data-icon.error-icon {
  color: var(--color-destructive);
}

.data-icon.fav-icon {
  color: var(--color-secondary);
}

.data-icon.history-icon {
  color: var(--color-primary);
}

.data-icon.exam-icon {
  color: var(--color-success);
}

.data-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  display: block;
}

.data-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.clear-btn {
  background: var(--color-muted);
  padding: var(--space-xs) var(--space-2xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.clear-btn:active {
  background: var(--color-border-light);
}

.clear-all-btn {
  width: 100%;
  padding: var(--space-ms);
  background: var(--color-destructive-light);
  border: none;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-destructive);
  cursor: pointer;
}

.clear-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
