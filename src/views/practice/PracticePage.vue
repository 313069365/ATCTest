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
            v-for="category in categories" 
            :key="category"
            class="bank-btn"
            :class="{ active: electedCategory === category }"
            @click="electedCategory = category"
          >
            <span class="material-symbols-outlined">
              {{ category.value === 'atc' ? 'school' : category.value === 'airport' ? 'work' : 'flight' }}
            </span>
            <span>{{ category.name }}</span>
          </button>
        </div>
      </section>

      <!-- Level 2: 分类Tab -->
      <section class="scope-area">
        <div class="scope-tabs">
          <button 
            v-for="scope in scopes" 
            :key="scope"
            :class="{ 'scope-tab active': electedScope === scope }"
            @click="electedScope = scope"
          >
            <span class="material-symbols-outlined tab-icon">flight</span>
            <span>{{ scope }}</span>
          </button>
        </div>
      </section>

      <!-- Level 3: 科目卡片 -->
      <!-- <section class="level3">
        <div class="subject-list">
          <div class="subject-card" v-for="subject in subjects" :key="subject.name">
            <div class="subject-header">
              <div class="subject-icon" :style="{ background: subject.color }">
                <span class="material-symbols-outlined">{{ subject.icon }}</span>
              </div>
              <div class="subject-info">
                <h4>{{ subject }}</h4>
                <p>{{ }} 题</p>
              </div>
              <button class="enter-btn" @click="newQuizWith(subject)">新的练习</button>
            </div>
          </div>
        </div>
      </section> -->

      <PracticeSetting :visible="showPracticeSetting" @close="showPracticeSetting = false" @start="showPracticeSetting = false" />
      <BankImport :visible="showImportModal" @close="showImportModal = false" @import-success="handleImportSuccess" />
      <!-- <router-view /> -->
      
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import PracticeSetting from '@/components/page/PracticeSettings.vue'
import BankImport from '@/components/page/BankImport.vue'
import baseQuestions from '/public/data/atc/base.json'
import professionalQuestions from '/public/data/atc/professional.json'
import englishQuestions from '/public/data/atc/english.json'

// 这里需要一个 key 或者数据库用来保存一个类别的所有题目，比如 atc 就是所有 atc 的题目，airport 就是所有 airport 的题目
const atcQuestions = [
  ...baseQuestions,
  ...professionalQuestions,
  ...englishQuestions
]

const categories = computed(() => {
  // 返回题库中meta.category中所有的唯一值， atc/airport/airlines/qita 的所有
  return [
    { value: 'atc', name: '空管' },
    { value: 'airport', name: '机场' },
    { value: 'airline', name: '航司' }
  ]
})

// 必须基于三个题库做一个预处理包成一个对象，说明里面的类别，范围和科目
const scopes = computed(() => {
  const scopeMap = new Set()
  
  atcQuestions.forEach(question => {
    if (question.meta && question.meta.scope) {
      scopeMap.add(question.meta.scope)
    }
  })
  
  return [...scopeMap]
})






// const scopes = computed(() => {
//   // 返回题库中meta.scope中所有的唯一值， atc/airport/airlines/qita 的所有
//   // 每个category下，scope是唯一的
//   return categoryScopeMap[electedCategory.value] || []
// })

// const subjects = computed(() => {
//   // 返回题库中meta.subject中所有的唯一值， atc/airport/airlines/qita 的所有
//   // 每个scope下，subject是唯一的
//   return scopeSubjectMap[electedScope.value] || []
// })



const showPracticeSetting = ref(false)
const showImportModal = ref(false)
const selectedSubject = ref(null)
const electedCategory = ref('空管')
const electedScope = ref('base')




const newQuizWith = (subject) => {
  selectedSubject.value = subject
  showPracticeSetting.value = true
}

const handleImportSuccess = (result) => {
  console.log('导入成功:', result)
}

onMounted(async () => {

})

</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-gray-100);
  padding-bottom: 100px;
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.top-bar {
  position: sticky;
  top: 0;
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
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-bm);
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
  font-size: 32px;
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
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}

.scope-tab::-webkit-scrollbar {
  display: none;
}

.scope-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 2px;
  /* padding: var(--spacing-sm); */
  border: none;
  border-radius: var(--radius-lg);
  /* font-size: var(--font-size-md); */
  /* font-weight: var(--font-weight-bold); */
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
  height: 2px;
  background: var(--primary);
  border-radius: 1px;
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