<template>
  <div class="page">
    <header class="top-bar">
      <h1 class="title">练习题库</h1>
      <button class="import-btn" @click="showImportModal = true">
        <span class="material-symbols-outlined">import_export</span>
      </button>
    </header>

    <main class="content">
      <!-- Level 1: 题库选择 -->
      <section class="category-area">
        <div class="bank-grid">
          <button 
            v-for="cat in categoryOptions" 
            :key="cat.value"
            class="bank-btn"
            :class="{ active: electedCategory === cat.value }"
            @click="electedCategory = cat.value"
          >
            <span class="material-symbols-outlined">
              {{ subjectIconMap[cat.name] }}
            </span>
            <span>{{ cat.name }}</span>
          </button>
        </div>
      </section>

      <!-- Level 2: 分类Tab -->
      <section class="scope-area" v-if="scopeOptions.length > 0">
        <div class="scope-tabs">
          <button 
            v-for="scope in scopeOptions" 
            :key="scope"
            class="scope-tab"
            :class="{ active: electedScope === scope.value }"
            @click="electedScope = scope.value"
          >
            <span class="material-symbols-outlined tab-icon">{{ subjectIconMap[scope.name] }}</span>
            <span>{{ scope.name }}</span>
          </button>
        </div>
      </section>

      <!-- Level 3: 科目卡片 -->
      <section class="level3">
        <div class="subject-list">
          <div class="subject-card" v-for="subject in SubjectsOptions" :key="subject.name">
            <div class="subject-header">
              <div class="subject-icon">
                <span class="material-symbols-outlined">{{ subjectIconMap[subject.name] }}</span>
              </div>
              <div class="subject-info">
                <h4>{{ subject.name }}</h4>
                <p>{{ subject.count }} 题</p>
              </div>
              <button class="enter-btn" @click="newQuizWith(subject)">新的练习</button>
            </div>
          </div>
        </div>
      </section>

      
    </main>
    <PracticeSetting :visible="showPracticeSetting" :subject="selectedSubject" @close="showPracticeSetting = false" @start="showPracticeSetting = false" />
    <BankImport :visible="showImportModal" @close="showImportModal = false" @import-success="handleImportSuccess" />
      
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import PracticeSetting from '@/components/page/PracticeSettings.vue'
import BankImport from '@/components/page/BankImport.vue'
// import { useQuestionStore } from '@/stores/questions'
// import { storeToRefs } from 'pinia'
import { subjectIconMap } from '@/assets/fonts/IconMaps.js'
import base from '/public/data/atc/base.json'
import professional from '/public/data/atc/professional.json'
import english from '/public/data/atc/english_translated.json'
// const store = useQuestionStore()
// const { questions, categories } = storeToRefs(store)

// 加载题库数据，并初始化题库数据

const showPracticeSetting = ref(false)
const showImportModal = ref(false)
const selectedSubject = ref(null)
const electedCategory = ref('atc')
const electedScope = ref('base')

const bank_atc = reactive([
  ...base,
  ...professional,
  ...english,
])

const categoryOptions = computed(() => [
  { value: 'atc', name: '空管', icon: 'flight'},
  { value: 'airport', name: '机场', icon: 'apartment'},
  { value: 'airline', name: '航司', icon: 'connecting_airports'},
])

const scopeOptions = computed(() => [
  {value: 'base', name: '基础题库', icon: 'flight'},
  {value: 'professional', name: '专业题库', icon: 'work'},
  {value: 'english', name: '英文题库', icon: 'language'},
])

const SubjectsOptions = computed(() => {
  const subjects = new Set()
  bank_atc.forEach(q => {
    if(q.meta.category === electedCategory.value && q.meta.scope === electedScope.value) 
      subjects.add(q.meta.subject)
    })
  console.log(subjects)
  const subjectsOptions = [...subjects].map(subject => ({ name:subject, count: bank_atc.filter(q => q.meta.category === electedCategory.value && q.meta.scope === electedScope.value && q.meta.subject === subject).length }))
  return subjectsOptions
})


const newQuizWith = (subject) => {
  selectedSubject.value = subject
  showPracticeSetting.value = true
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
  padding-bottom: var(--safe-area) ;
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
</style>