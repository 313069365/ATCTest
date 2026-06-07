<template>
  <div class="page">
    <header class="top-bar">
      <h1 class="title">练习题库</h1>
      <div class="header-actions">
        <button class="import-btn" @click="showImportModal = true">
          <i-ms-sync-alt />
        </button>
      </div>
    </header>

    <main class="content">
      <!-- Level 1: 题库选择 -->
      <section class="category-area">
        <div class="bank-grid">
          <button v-for="cat in categoryOptions" :key="cat" class="bank-btn"
            :class="{ active: selectedCategory === cat }" @click="selectedCategory = cat">
            <component :is="iconMap[cat]" />
            <span>{{ t(cat) }}</span>
          </button>
        </div>
      </section>

      <!-- Level 2: 分类Tab -->
      <section class="scope-area" v-if="scopeOptions.length > 0">
        <div class="scope-tabs">
          <button v-for="scope in scopeOptions" :key="scope" class="scope-tab"
            :class="{ active: selectedScope === scope }" @click="selectedScope = scope">
            <component :is="iconMap[scope]" class="tab-icon" />
            <span>{{ t(scope) }}</span>
          </button>
        </div>
      </section>

      <!-- Level 3: 科目卡片 -->
      <section class="level3">
        <div class="subject-list">
          <div class="subject-card" v-for="subject in SubjectsOptions" :key="subject.name"
            :class="{ expanded: expandedSubject === subject.name }">
            <div class="subject-header" @click="toggleExpand(subject)">
              <div class="subject-icon">
                <component :is="iconMap[subject.name]" />
              </div>
              <div class="subject-info">
                <h4>{{ t(subject.name) }}</h4>
                <p>{{ `${t('totally')} ${subject.count} ${t('questions')}` }}</p>
              </div>
              <button v-if="hasProgress(subject)" class="continue-btn" @click.stop="continuePractice(subject)" :disabled="store.loading">
                {{ t('continue') }}
              </button>
              <button v-else class="new-btn" @click.stop="newQuizWith(subject)" :disabled="store.loading">{{ t('new') }}</button>
            </div>

            <div v-if="expandedSubject === subject.name" class="subject-expanded">
              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-value">{{ expandedSubjectStats?.sessionCount ?? 0 }}</span>
                  <span class="stat-label">{{ t('practiceSessions') }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value accent">{{ expandedSubjectStats?.accuracy ?? 0 }}%</span>
                  <span class="stat-label">{{ t('accuracy') }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value warn">{{ expandedSubjectStats?.wrongBookCount ?? 0 }}</span>
                  <span class="stat-label">{{ t('toReview') }}</span>
                </div>
              </div>

              <div class="action-row">
                <button v-if="hasProgress(subject)" class="new-btn" @click.stop="newQuizWith(subject)" :disabled="store.loading">{{ t('new')
                  }}</button>
                <button v-if="(expandedSubjectStats?.wrongBookCount ?? 0) > 0" class="wrong-btn"
                  @click.stop="wrongPractice(subject)" :disabled="store.loading">
                  {{ t('wrongPractice') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


    </main>
    <PracticeSetting :visible="showPracticeSetting" :subject="selectedSubject" @close="showPracticeSetting = false"
      @start="showPracticeSetting = false" />
    <BankImport :visible="showImportModal" @close="showImportModal = false" @import-success="handleImportSuccess" />

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PracticeSetting from '@/presentation/components/page/PracticeSettings.vue'
import BankImport from '@/presentation/components/page/BankImport.vue'
import { iconMap } from '@/assets/fonts/IconMaps.js'
import { t } from '@/infrastructure/utils/i18n.js'
import { useAppStore } from '@/domain/stores/store'
import { usePracticeService } from '@/domain/composables/usePracticeService'
import { computeSubjectStats } from '@/domain/services/stats'
import { getPracticeKey } from '@/infrastructure/storage/progress'
import { getAudioManager } from '@/infrastructure/services/audio-manager'
import { createPracticeSession } from '@/infrastructure/storage/session'

const store = useAppStore()
const pm = usePracticeService()
const router = useRouter()
const manager = getAudioManager()
const soundEnabled = ref(localStorage.getItem('soundEnabled') !== 'false')

const showPracticeSetting = ref(false)
const showImportModal = ref(false)
const selectedSubject = ref(null)
const selectedCategory = ref('atc')
const selectedScope = ref('base')
const expandedSubject = ref(null)

function toggleExpand(subject) {
  expandedSubject.value = expandedSubject.value === subject.name ? null : subject.name
}

const expandedSubjectStats = computed(() => {
  if (!expandedSubject.value) return null
  return computeSubjectStats(store.practiceHistory, store.wrongBook, {
    category: selectedCategory.value,
    scope: selectedScope.value,
    subject: expandedSubject.value
  })
})

const bankMeta = computed(() => store.bankMeta)

onMounted(() => {
  pm.refresh()
  if (soundEnabled.value) manager.preloadAll()
})

// 使用 bankMeta 直接获取选项
const categoryOptions = computed(() => Object.keys(bankMeta.value))

const scopeOptions = computed(() => {
  const catMeta = bankMeta.value[selectedCategory.value]
  return catMeta?.scopes || []
})

const SubjectsOptions = computed(() => {
  const catMeta = bankMeta.value[selectedCategory.value]
  if (!catMeta) return []
  return Object.entries(catMeta.subjects)
    .filter(([_, info]) => info.scope === selectedScope.value)
    .map(([name, info]) => ({ name, count: info.count }))
})

// 首次加载时默认选中第一个 category
watch(bankMeta, (newMeta) => {
  if (newMeta && Object.keys(newMeta).length > 0) {
    const categories = Object.keys(newMeta)
    if (categories.length > 0 && !categories.includes(selectedCategory.value)) {
      selectedCategory.value = categories[0]
    }
  }
}, { immediate: true })

// 选中 category 变化时，默认选中第一个 scope
watch(() => selectedCategory.value, (newCat) => {
  if (newCat && bankMeta.value[newCat]) {
    const scopes = bankMeta.value[newCat].scopes
    if (scopes.length > 0 && !scopes.includes(selectedScope.value)) {
      selectedScope.value = scopes[0]
    }
  }
  expandedSubject.value = null
})

watch(selectedScope, () => {
  expandedSubject.value = null
})

const newQuizWith = (subject) => {
  selectedSubject.value = {
    name: subject.name,
    category: selectedCategory.value,
    scope: selectedScope.value
  }

  const key = getPracticeKey({ bank: { category: selectedCategory.value, scope: selectedScope.value, subject: subject.name } })

  if (hasProgress(subject)) {
    if (confirm('是否清除已有练习进度，开始新的练习？')) {
      store.clearPracticeProgress(key)
      showPracticeSetting.value = true
    }
  } else {
    showPracticeSetting.value = true
  }
}

// 检查是否有保存的进度（且有实际答题记录）
const hasProgress = (subject) => {
  const key = getPracticeKey({ bank: { category: selectedCategory.value, scope: selectedScope.value, subject: subject.name } })
  const progress = store.getPracticeProgress(key)
  if (!progress || !progress.config?.bank) return false

  const answers = progress.progress?.answers
  if (!answers) return false

  const hasUserAnswers = Object.keys(answers).some(qId => {
    const ans = answers[qId]
    if (!ans || !ans.selected) return false
    const selected = ans.selected
    if (Array.isArray(selected)) return selected.length > 0
    if (typeof selected === 'string') return selected.trim().length > 0
    return !!selected
  })

  return hasUserAnswers
}

// 继续练习
const continuePractice = (subject) => {
  const key = getPracticeKey({ bank: { category: selectedCategory.value, scope: selectedScope.value, subject: subject.name } })
  const progress = store.getPracticeProgress(key)
  if (!progress || !progress.config) return

  const practiceData = {
    category: progress.config.bank.category,
    scope: progress.config.bank.scope,
    subject: {
      name: progress.config.bank.subject,
      category: progress.config.bank.category,
      scope: progress.config.bank.scope
    },
    practiceMode: progress.config.mode,
    questionSort: progress.config.questionSort,
    showAnswerMode: progress.config.showAnswerMode,
    autoJump: progress.config.autoJump,
    shuffleSeed: progress.config.shuffleSeed
  }

  const sessionId = createPracticeSession(practiceData)
  router.push({
    path: '/practice/quiz',
    query: {
      sessionId,
      continue: 'true'
    }
  })
}

const handleImportSuccess = (result) => {
  console.log('导入成功:', result)
}

const wrongPractice = (subject) => {
  const wrongQuestions = store.wrongBook.filter(q =>
    q.meta?.category === selectedCategory.value &&
    q.meta?.scope === selectedScope.value &&
    q.meta?.subject === subject.name
  )
  if (wrongQuestions.length === 0) return

  const practiceData = {
    category: selectedCategory.value,
    scope: selectedScope.value,
    subject: {
      name: subject.name,
      category: selectedCategory.value,
      scope: selectedScope.value
    },
    practiceMode: 'answer',
    questionSort: 'sequence',
    showAnswerMode: 'immediate',
    autoJump: false,
    wrongPractice: true,
    wrongQuestionIds: wrongQuestions.map(q => q.id),
    shuffleSeed: Date.now()
  }

  const sessionId = createPracticeSession(practiceData)
  router.push({
    path: '/practice/quiz',
    query: {
      sessionId,
      newPractice: 'true'
    }
  })
}





</script>

<style scoped>
.page {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-gray-100);
  padding-bottom: var(--safe-area);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.top-bar {
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
  flex-shrink: 0;
}

.header-actions {
  position: absolute;
  right: 0px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 8px;
}

.import-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: background 0.2s;
}

.import-btn:active {
  background: var(--color-gray-400);
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-bm);
  -webkit-overflow-scrolling: touch;
}

.category-area {
  /* display: flex; */
  gap: var(--spacing-md);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: var(--spacing-md);
}

.bank-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.bank-btn {
  /* min-width: 110px; */
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl);
  border: 1px solid var(--border-color-strong);
  border-radius: var(--radius-md);
  background: var(--background);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.bank-btn.active {
  background: var(--primary);
  color: var(--on-primary);
  border-color: var(--primary);
}

.bank-btn svg {
  font-size: 24px;
}

.bank-btn span:last-child {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.scope-area {
  margin-bottom: var(--spacing-md);
}

.scope-tabs {
  display: flex;
  gap: var(--spacing-sm);
  /* padding: var(--spacing-md); */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.scope-tab::-webkit-scrollbar {
  display: none;
}

.scope-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: var(--spacing-sm);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--icon-color);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.scope-tab.active {
  color: var(--primary);
}

.scope-tab .tab-icon {
  font-size: 18px;
}

.scope-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary);
  border-radius: 3px;
}

.subject-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.subject-card {
  background: var(--background);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-light);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.subject-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-md);
}

.subject-icon {
  width: 48px;
  height: 48px;
  background: var(--secondary);
  color: var(--on-primary);
  font-size: 24px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.subject-icon svg {
  font-size: 24px;
}

.subject-info {
  flex: 1;
}

.subject-info h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
}

.subject-info p {
  font-size: var(--font-size-md);
  color: var(--icon-color);
}

.subject-expanded {
  border-top: 1px solid var(--border-color-light);
  padding: var(--spacing-md);
  animation: slideDown 0.25s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-row {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--spacing-sm) 0;
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
}

.stat-value {
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.stat-value.accent {
  color: var(--primary);
}

.stat-value.warn {
  color: var(--color-error);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--icon-color);
}

.action-row {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.continue-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  padding: 6px 14px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  white-space: nowrap;
}

.new-btn {
  background: rgba(0, 91, 191, 0.1);
  color: var(--primary);
  border: none;
  border-radius: var(--radius-full);
  padding: 6px 14px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  white-space: nowrap;
}

.wrong-btn {
  background: rgba(211, 47, 47, 0.1);
  color: var(--error);
  border: none;
  border-radius: var(--radius-full);
  padding: 6px 14px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  white-space: nowrap;
}

.wrong-btn:active {
  background: rgba(211, 47, 47, 0.2);
}
</style>