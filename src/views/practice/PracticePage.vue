<template>
  <div class="page">
    <header class="top-bar">
      <h1 class="title">练习题库</h1>
      <div class="header-actions">
        <button class="import-btn" @click="showImportModal = true">
          <span class="material-symbols-outlined">import_export</span>
        </button>
      </div>
    </header>

    <main class="content">
      <!-- Level 1: 题库选择 -->
      <section class="category-area">
        <div class="bank-grid">
          <button v-for="cat in categoryOptions" :key="cat" class="bank-btn"
            :class="{ active: selectedCategory === cat }" @click="selectedCategory = cat">
            <span class="material-symbols-outlined">
              {{ iconMap[cat] }}
            </span>
            <span>{{ t(cat) }}</span>
          </button>
        </div>
      </section>

      <!-- Level 2: 分类Tab -->
      <section class="scope-area" v-if="scopeOptions.length > 0">
        <div class="scope-tabs">
          <button v-for="scope in scopeOptions" :key="scope" class="scope-tab"
            :class="{ active: selectedScope === scope }" @click="selectedScope = scope">
            <span class="material-symbols-outlined tab-icon">{{ iconMap[scope] }}</span>
            <span>{{ t(scope) }}</span>
          </button>
        </div>
      </section>

      <!-- Level 3: 科目卡片 -->
      <section class="level3">
        <div class="subject-list">
          <div class="subject-card" v-for="subject in SubjectsOptions" :key="subject.name">
            <div class="subject-header">
              <div class="subject-icon">
                <span class="material-symbols-outlined">{{ iconMap[subject.name] }}</span>
              </div>
              <div class="subject-info">
                <h4>{{ t(subject.name) }}</h4>
                <p>{{ `${t('totally')} ${subject.count} ${t('questions')}` }}</p>
              </div>
              <div class="subject-actions">
                <button v-if="hasProgress(subject)" class="continue-btn" @click="continuePractice(subject)">
                  继续练习
                </button>
                <button class="new-btn" @click="newQuizWith(subject)">{{ t('new') }}</button>
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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import PracticeSetting from '@/components/page/PracticeSettings.vue'
import BankImport from '@/components/page/BankImport.vue'
import { iconMap } from '@/assets/fonts/IconMaps.js'
import { t, setLanguage, getLanguage } from '@/utils/i18n.js'
import { useAppStore } from '@/stores/store'

// 创建 Store 实例
const store = useAppStore()
const router = useRouter()

const showPracticeSetting = ref(false)
const showImportModal = ref(false)
const selectedSubject = ref(null)
const selectedCategory = ref('atc')
const selectedScope = ref('base')

// 从 Store 获取题库元数据
const bankMeta = computed(() => store.bankMeta)

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
})

const newQuizWith = (subject) => {
  selectedSubject.value = {
    name: subject.name,
    category: selectedCategory.value,
    scope: selectedScope.value
  }

  // 检查是否有保存的进度
  if (hasProgress(subject)) {
    if (confirm('已有练习进度，是否重新开始？')) {
      // 清除进度
      store.savePracticeProgress(null)
      showPracticeSetting.value = true
    }
    // 取消则不操作
  } else {
    showPracticeSetting.value = true
  }
}

// 检查是否有保存的进度
const hasProgress = (subject) => {
  const progress = store.practiceProgress
  if (!progress || !progress.config?.bank) return false
  const subjectName = typeof subject === 'object' ? subject.name : subject
  return progress.config.bank.subject === subjectName
}

// 继续练习
const continuePractice = (subject) => {
  const progress = store.practiceProgress
  if (!progress || !progress.config) return

  const practiceData = {
    category: progress.config.bank.category,
    scope: progress.config.bank.scope,
    subject: progress.config.bank.subject,
    practiceMode: progress.config.mode,
    questionSort: progress.config.questionSort,
    optionsSort: progress.config.optionsSort,
    showAnswerMode: progress.config.showAnswerMode,
    autoJump: progress.config.autoJump
  }

  router.push({
    path: '/practice/quiz',
    query: { practiceData: JSON.stringify(practiceData), continue: 'true' }
  })
}

const handleImportSuccess = (result) => {
  console.log('导入成功:', result)
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
  background: rgba(255, 255, 255, 0.95);
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
  right: 16px;
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

.bank-btn .material-symbols-outlined {
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
  padding: var(--spacing-md);
  border: 1px solid var(--border-color-light);
  box-shadow: var(--shadow-sm);
}

.subject-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
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

.subject-icon .material-symbols-outlined {
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

.enter-btn {
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

.subject-actions {
  display: flex;
  gap: 8px;
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
</style>