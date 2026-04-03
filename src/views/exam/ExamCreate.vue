<template>
  <div class="create-paper-page">
    <header class="top-bar">
      <button class="icon-btn" @click="goBack">
        <span class="material-symbols-outlined">close</span>
      </button>
      <h1 class="title">创建试卷</h1>
      <div class="placeholder"></div>
    </header>

    <div class="stepper-container">
      <div class="stepper">
        <div 
          v-for="(step, index) in steps" 
          :key="step.id" 
          class="stepper-step"
          :class="{
            'active': currentStep === step.id,
            'completed': currentStep > step.id
          }"
          @click="goToStep(step.id)"
        >
          <div class="step-marker">
            <span v-if="currentStep > step.id" class="material-symbols-outlined check-icon">check</span>
            <span v-else class="step-number">{{ step.id }}</span>
          </div>
          <div class="step-label">{{ step.label }}</div>
          <div v-if="index < steps.length - 1" class="step-connector"></div>
        </div>
      </div>
    </div>

    <div class="step-content">
      <div class="steps-wrapper" :style="{ transform: `translateX(${- (currentStep - 1) * 100}%)`, transition: 'transform 0.3s ease' }">
        <div class="step-panel">
          <div class="step-header">
            <h2>基本信息</h2>
            <p>填写试卷的基本信息</p>
          </div>

          <div class="form-section">
            <div class="form-card">
              <div class="form-card-header">
                <span>试卷信息</span>
              </div>
              <div class="form-card-body">
                <div class="form-group">
                  <label>试卷名称 <span class="required">*</span></label>
                  <input v-model="form.title" type="text" placeholder="请填入试卷名称" class="required-input"
                    :class="{ error: currentStep === 1 && !form.title }" />
                </div>

                <div class="form-group">
                  <label>时长 (分钟)</label>
                  <input v-model="form.duration" type="number" min="1" placeholder="120" />
                </div>

                <div class="form-group">
                  <label>试卷类别</label>
                  <input v-model="form.paperCategory" type="text" placeholder="请输入试卷类别" />
                </div>

                <div class="form-group">
                  <label>说明 / 备注</label>
                  <textarea v-model="form.description" placeholder="输入考试的相关说明..." rows="3"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button class="step-btn step-btn-primary" @click="nextStep" :disabled="!canProceed">
              <span>下一步</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        <div class="step-panel">
          <div class="step-header">
            <h2>科目选择</h2>
            <p>选择科目设置抽取数量</p>
          </div>

          <div class="question-select-area">
            <div class="question-select-header">
              <span class="question-select-title">已选科目</span>
            </div>

            <div class="subject-list" v-if="selectedSubjects.length > 0">
              <div class="subject-card" v-for="(item, index) in selectedSubjects" :key="index">
                <div class="subject-card-header">
                  <span class="subject-card-name">{{ item.subjectName }}</span>
                  <span class="subject-card-meta">{{ item.bankName }}</span>
                  <button class="btn-delete" @click="removeSubject(index)">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div class="subject-card-body">
                  <div class="subject-card-field">
                    <span class="field-label">题量</span>
                    <div class="field-input-wrap">
                      <input type="number" class="field-input" v-model="item.count" :max="item.maxCount">
                      <span class="field-suffix">/ {{ item.maxCount }}</span>
                    </div>
                  </div>
                  <div class="subject-card-field">
                    <span class="field-label">每题分数</span>
                    <div class="field-input-wrap">
                      <input type="number" class="field-input" v-model="item.score">
                      <span class="field-suffix">分</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="empty-tip" @click="openBankModal" v-else>
              <span class="material-symbols-outlined">add_circle</span>
              <p>点击添加科目</p>
            </div>
          </div>

          <div class="step-actions">
            <button class="step-btn step-btn-secondary" @click="prevStep">
              <span class="material-symbols-outlined">arrow_back</span>
              <span>上一步</span>
            </button>
            <button class="step-btn step-btn-primary" @click="nextStep" :disabled="!canProceed">
              <span>下一步</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        <div class="step-panel">
          <div class="step-header">
            <h2>预览确认</h2>
            <p>确认考试信息</p>
          </div>

          <div class="review-section">
            <div class="info-card">
              <div class="info-card-header">
                <span>考卷信息</span>
              </div>
              <div class="info-card-body">
                <div class="info-card-title">{{ form.title || '未设置' }}</div>
                <div class="info-card-stats">
                  <div class="info-stat-item">
                    <span class="material-symbols-outlined">schedule</span>
                    <span class="info-stat-value">{{ form.duration || 0 }}</span>
                    <span class="info-stat-label">分钟</span>
                  </div>
                  <div class="info-stat-divider"></div>
                  <div class="info-stat-item">
                    <span class="material-symbols-outlined">quiz</span>
                    <span class="info-stat-value">{{ totalQuestions }}</span>
                    <span class="info-stat-label">题目</span>
                  </div>
                  <div class="info-stat-divider"></div>
                  <div class="info-stat-item">
                    <span class="material-symbols-outlined">grade</span>
                    <span class="info-stat-value">{{ autoTotalScore }}</span>
                    <span class="info-stat-label">总分</span>
                  </div>
                </div>
                <div class="info-card-desc" v-if="form.description">
                  {{ form.description }}
                </div>
              </div>
            </div>

            <div class="rules-card">
              <div class="rules-card-header">
                <span>题目设置</span>
              </div>
              <div class="rules-card-body">
                <div class="rules-list-compact">
                  <div class="rule-item-compact" v-for="(item, index) in selectedSubjects" :key="index">
                    <div class="rule-item-info">
                      <span class="rule-item-subject">{{ item.subjectName }}</span>
                      <span class="rule-item-bank">{{ item.bankName }}</span>
                    </div>
                    <div class="rule-item-count">
                      <span class="count-num">{{ item.count }}</span>
                      <span class="count-unit">题</span>
                    </div>
                  </div>
                </div>
                <div class="rules-card-footer">
                  <span>共 {{ totalQuestions }} 题</span>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button class="step-btn step-btn-secondary" @click="prevStep">
              <span class="material-symbols-outlined">arrow_back</span>
              <span>上一步</span>
            </button>
            <button class="step-btn step-btn-primary" @click="createPaper" :disabled="!canProceed">
              <span>创建试卷</span>
              <span class="material-symbols-outlined">check</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="picker-overlay" v-if="showBankModal" @click="showBankModal = false">
      <div class="picker" @click.stop>
        <div class="picker-header">
          <button class="picker-btn cancel" @click="showBankModal = false">取消</button>
          <span class="picker-title">添加科目</span>
          <button class="picker-btn confirm" @click="addSubject">添加</button>
        </div>
        <div class="picker-body">
          <div class="picker-column">
            <div class="picker-list">
              <div v-for="(bank, key) in banks" :key="key" class="picker-item" :class="{ active: linkage.bank === key }"
                @click="selectBank(key)">
                {{ bank.name }}
              </div>
            </div>
          </div>
          <div class="picker-column">
            <div class="picker-list">
              <div v-for="cat in getBankCategories(linkage.bank)" :key="cat.key" class="picker-item"
                :class="{ active: linkage.category === cat.key }" @click="selectCategory(cat.key)">
                {{ cat.name }}
              </div>
              <div class="picker-placeholder" v-if="!linkage.bank">请先选择题库</div>
            </div>
          </div>
          <div class="picker-column">
            <div class="picker-list">
              <div v-for="subj in getCategorySubjects(linkage.bank, linkage.category)" :key="subj.key" class="picker-item"
                :class="{ active: linkage.subject === subj.key }" @click="selectSubject(subj.key)">
                {{ subj.name }}
              </div>
              <div class="picker-placeholder" v-if="!linkage.category">请先选择分类</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentStep = ref(1)

const steps = [
  { id: 1, label: '基本信息' },
  { id: 2, label: '题目选择' },
  { id: 3, label: '预览确认' }
]

function goToStep(stepId) {
  if (stepId < currentStep.value) {
    currentStep.value = stepId
  }
}

const showBankModal = ref(false)

const banks = ref({
  atc: { name: '空管题库', children: {} },
  airport: { name: '机场题库', children: {} }
})

const linkage = reactive({
  bank: 'atc',
  category: 'basic',
  subject: '',
  count: 10
})

const selectedSubjects = ref([])

const form = reactive({
  title: '',
  duration: 120,
  totalScore: 100,
  description: '',
  paperCategory: ''
})

function getBankCategories(bankKey) {
  const bank = banks.value[bankKey]
  if (!bank?.children) return []
  return Object.entries(bank.children).map(([key, cat]) => ({
    key,
    name: cat.name
  }))
}

function getCategorySubjects(bankKey, catKey) {
  const bank = banks.value[bankKey]
  if (!bank?.children?.[catKey]?.children) return []
  return Object.entries(bank.children[catKey].children).map(([key, subj]) => ({
    key: key,
    name: subj.name,
    count: subj.questions?.length || 0
  }))
}

const totalQuestions = computed(() => {
  return selectedSubjects.value.reduce((sum, item) => sum + (item.count || 0), 0)
})

const autoTotalScore = computed(() => {
  return selectedSubjects.value.reduce((sum, item) => sum + (item.count || 0) * (item.score || 0), 0)
})

const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return form.title && form.title.trim().length > 0
  }
  if (currentStep.value === 2) {
    return selectedSubjects.value.length > 0
  }
  return true
})

function goBack() {
  if (confirm('确定要退出吗？已填写的内容将丢失。')) {
    router.back()
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function nextStep() {
  if (!canProceed.value) return
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    createPaper()
  }
}

function selectBank(key) {
  linkage.bank = key
  linkage.category = ''
  linkage.subject = ''
}

function selectCategory(key) {
  linkage.category = key
  linkage.subject = ''
}

function selectSubject(key) {
  linkage.subject = key
}

function openBankModal() {
  linkage.bank = 'atc'
  linkage.category = 'basic'
  linkage.subject = ''
  showBankModal.value = true
}

function addSubject() {
  if (!linkage.bank || !linkage.category || !linkage.subject) return
  
  const isDuplicate = selectedSubjects.value.some(item => 
    item.bankKey === linkage.bank && 
    item.categoryKey === linkage.category && 
    item.subjectKey === linkage.subject
  )
  
  if (isDuplicate) {
    alert('该科目已经添加过了！');
    return
  }

  const bankName = banks.value[linkage.bank]?.name || ''

  selectedSubjects.value.push({
    bankKey: linkage.bank,
    categoryKey: linkage.category,
    subjectKey: linkage.subject,
    bankName,
    subjectName: linkage.subject,
    count: linkage.count || 10,
    score: 2,
    maxCount: 50
  })

  showBankModal.value = false
}

function removeSubject(index) {
  selectedSubjects.value.splice(index, 1)
}

function createPaper() {
  alert('试卷创建成功')
  router.push('/exam')
}
</script>

<style scoped>
.create-paper-page {
  min-height: 100vh;
  background: var(--background-secondary);
  overflow: hidden;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  height: 56px;
  border-bottom: 1px solid var(--border-color);
}

.icon-btn {
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
}

.icon-btn:active {
  background: #f1f4fa;
  transform: scale(0.95);
}

.icon-btn .material-symbols-outlined {
  font-size: 24px;
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: #181c20;
}

.placeholder {
  width: 40px;
}

.stepper-container {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--background-secondary);
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  cursor: pointer;
  flex: 1;
}

.step-marker {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-sm);
  background: var(--background);
  border: 2px solid var(--border-color-strong);
}

.step-number {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
}

.check-icon {
  font-size: 18px;
  color: var(--success);
}

.step-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-align: center;
}

.step-connector {
  position: absolute;
  top: 18px;
  left: 50%;
  right: -50%;
  height: 2px;
  background: var(--border-color-strong);
  z-index: -1;
}

.stepper-step.active .step-marker {
  background: var(--primary);
  border-color: var(--primary);
}

.stepper-step.active .step-number {
  color: var(--on-primary);
}

.stepper-step.active .step-label {
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}

.stepper-step.completed .step-marker {
  background: var(--success-light);
  border-color: var(--success);
}

.stepper-step.completed .step-label {
  color: var(--success);
}

.stepper-step.completed .step-connector {
  background: var(--success);
}

.step-content {
  margin: var(--spacing-sm) var(--spacing-lg);
  overflow: hidden;
}

.steps-wrapper {
  display: flex;
  transition: transform 0.3s ease;
}

.step-panel {
  flex: 0 0 100%;
  min-height: 100%;
}

.step-header {
  margin-bottom: var(--spacing-sm);
}

.step-header h2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  margin: 0;
}

.step-header p {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 18px 0 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-card {
  background: var(--background);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.form-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  border-bottom: 1px solid var(--border-color);
}

.form-card-header::before {
  content: '';
  width: 4px;
  height: 18px;
  background: var(--primary);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.form-card-body {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.required {
  color: var(--error);
}

.required-input.error {
  box-shadow: inset 0 0 0 2px var(--error);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--radius-lg);
  background: var(--background-secondary);
  font-size: 16px;
  color: var(--on-surface);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  background: var(--background);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.25);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.step-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.step-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.step-btn-primary {
  background: var(--primary);
  color: var(--on-primary);
}

.step-btn-primary:disabled {
  background: var(--color-gray-300);
  cursor: not-allowed;
}

.step-btn-secondary {
  background: var(--background);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.question-select-area {
  margin-top: var(--spacing-md);
}

.question-select-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.question-select-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.subject-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.subject-card {
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.subject-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.subject-card-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.subject-card-meta {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.btn-delete {
  margin-left: auto;
  width: 28px;
  height: 28px;
  border: none;
  background: var(--color-gray-100);
  border-radius: 50%;
  cursor: pointer;
}

.subject-card-body {
  display: flex;
  gap: var(--spacing-md);
}

.subject-card-field {
  flex: 1;
}

.field-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.field-input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.field-input {
  width: 60px;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
}

.field-suffix {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  background: var(--background);
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.empty-tip .material-symbols-outlined {
  font-size: 48px;
  color: var(--primary);
  margin-bottom: var(--spacing-sm);
  opacity: 0.5;
}

.empty-tip p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

.review-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.info-card {
  background: var(--background);
  border-radius: var(--radius-lg);
}

.info-card-header {
  padding: var(--spacing-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  border-bottom: 1px solid var(--border-color);
}

.info-card-body {
  padding: var(--spacing-md);
}

.info-card-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
}

.info-card-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.info-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.info-stat-item .material-symbols-outlined {
  font-size: 20px;
  color: var(--primary);
}

.info-stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary);
}

.info-stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.info-stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color);
}

.info-card-desc {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.rules-card {
  background: var(--background);
  border-radius: var(--radius-lg);
}

.rules-card-header {
  padding: var(--spacing-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  border-bottom: 1px solid var(--border-color);
}

.rules-card-body {
  padding: var(--spacing-md);
}

.rules-list-compact {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.rule-item-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-item-info {
  display: flex;
  flex-direction: column;
}

.rule-item-subject {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
}

.rule-item-bank {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.rule-item-count {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.count-num {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary);
}

.count-unit {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.rules-card-footer {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  text-align: right;
  color: var(--text-secondary);
}

.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.picker {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--background);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  max-height: 70vh;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.picker-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: transparent;
  font-size: var(--font-size-md);
  cursor: pointer;
}

.picker-btn.cancel {
  color: var(--text-secondary);
}

.picker-btn.confirm {
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}

.picker-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.picker-body {
  display: flex;
  overflow-x: auto;
  max-height: 60vh;
}

.picker-column {
  flex: 1;
  min-width: 120px;
  border-right: 1px solid var(--border-color);
}

.picker-column:last-child {
  border-right: none;
}

.picker-list {
  padding: var(--spacing-sm);
}

.picker-item {
  padding: var(--spacing-md);
  text-align: center;
  cursor: pointer;
  border-radius: var(--radius-md);
}

.picker-item.active {
  background: var(--primary-light);
  color: var(--primary);
}

.picker-placeholder {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
</style>
