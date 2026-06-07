<template>
  <div class="create-paper-page">
    <header class="top-bar">
      <button class="icon-btn" @click="exitCreate">
        <span class="material-symbols-outlined">close</span>
      </button>
      <h1 class="title">{{ t('createPaper') }}</h1>
      <div class="placeholder"></div>
    </header>

    <div class="stepper-container">
      <div class="stepper">
        <div v-for="(step, index) in steps" :key="step.id" class="stepper-step" :class="{
          'active': currentStep === step.id,
          'completed': currentStep > step.id
        }">
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
      <div class="steps-wrapper"
        :style="{ transform: `translateX(${- (currentStep - 1) * 100}%)`, transition: 'transform 0.3s ease' }">
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
                  <label>{{ t('paperTitle') }} <span class="required">*</span></label>
                  <input v-model="form.title" type="text" :placeholder="t('paperTitle')" class="required-input"
                    :class="{ error: currentStep === 1 && !form.title }" />
                </div>

                <div class="form-group">
                  <label>{{ t('duration') }}</label>
                  <input v-model="form.duration" type="number" min="1" placeholder="120" />
                </div>

                <div class="form-group">
                  <label>{{ t('paperCategory') }}</label>
                  <input v-model="form.paperCategory" type="text" :placeholder="t('paperCategory')" />
                </div>

                <div class="form-group">
                  <label>{{ t('description') }}</label>
                  <textarea v-model="form.description" :placeholder="t('description')" rows="3"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button class="step-btn step-btn-primary" @click="nextStep" :disabled="!canProceed">
              <span>{{ t('nextStep') }}</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        <div class="step-panel">
          <div class="step-header">
            <h2>{{ t('subjectSelection') }}</h2>
            <p>{{ t('selectSubjectsSetCount') }}</p>
          </div>

          <div class="question-select-area">
            <div class="question-select-header">
              <span class="question-select-title">{{ t('selectedSubjects') }}</span>
            </div>

            <div class="subject-list" v-if="selectedSubjects.length > 0">
              <div class="subject-card" v-for="(item, index) in selectedSubjects" :key="index">
                <div class="subject-card-row subject-card-row-top">
                  <div class="subject-card-main">
                    <span class="subject-card-name">{{ t(item.subjectName) }}</span>
                    <span class="subject-card-meta">{{ t(item.category) }}</span>
                  </div>
                  <button class="btn-delete" @click="removeSubject(index)">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div class="subject-card-row subject-card-row-bottom">
                  <div class="subject-card-field">
                    <span class="field-label">{{ t('questionCount') }}</span>
                    <div class="field-input-wrap">
                      <input type="number" class="field-input" v-model="item.count" :max="item.maxCount">
                      <span class="field-suffix">/ {{ item.maxCount }}</span>
                    </div>
                  </div>
                  <div class="subject-card-field">
                    <span class="field-label">{{ t('scorePerQuestion') }}</span>
                    <div class="field-input-wrap">
                      <input type="number" class="field-input" v-model="item.score">
                      <span class="field-suffix">{{ t('score') }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="add-subject-btn" @click="openBankModal">
                <span class="material-symbols-outlined">add</span>
                <span>{{ t('addSubject') }}</span>
              </div>
            </div>

            <div class="empty-tip" @click="openBankModal" v-else>
              <span class="material-symbols-outlined">add_circle</span>
              <p>{{ t('clickToAddSubject') }}</p>
            </div>
          </div>

          <div class="step-actions">
            <button class="step-btn step-btn-secondary" @click="prevStep">
              <span class="material-symbols-outlined">arrow_back</span>
              <span>{{ t('prevStep') }}</span>
            </button>
            <button class="step-btn step-btn-primary" @click="nextStep" :disabled="!canProceed">
              <span>{{ t('nextStep') }}</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        <div class="step-panel">
          <div class="step-header">
            <h2>{{ t('previewConfirm') }}</h2>
            <p>{{ t('confirmExamInfo') }}</p>
          </div>

          <div class="review-section">
            <div class="info-card">
              <div class="info-card-header">
                <span>{{ t('paperTitle') }}</span>
              </div>
              <div class="info-card-body">
                <div class="info-card-title">{{ form.title || t('paperTitle') }}</div>
                <div class="info-card-stats">
                  <div class="info-stat-item">
                    <span class="material-symbols-outlined">schedule</span>
                    <span class="info-stat-value">{{ form.duration || 0 }}</span>
                    <span class="info-stat-label">{{ t('minutes') }}</span>
                  </div>
                  <div class="info-stat-divider"></div>
                  <div class="info-stat-item">
                    <span class="material-symbols-outlined">quiz</span>
                    <span class="info-stat-value">{{ totalQuestions }}</span>
                    <span class="info-stat-label">{{ t('totalQuestions') }}</span>
                  </div>
                  <div class="info-stat-divider"></div>
                  <div class="info-stat-item">
                    <span class="material-symbols-outlined">grade</span>
                    <span class="info-stat-value">{{ autoTotalScore }}</span>
                    <span class="info-stat-label">{{ t('totalScore') }}</span>
                  </div>
                </div>
                <div class="info-card-desc" v-if="form.description">
                  {{ form.description }}
                </div>
              </div>
            </div>

            <div class="rules-card">
              <div class="rules-card-header">
                <span>{{ t('subjectSetting') }}</span>
              </div>
              <div class="rules-card-body">
                <div class="rules-list-compact">
                  <div class="rule-item-compact" v-for="(item, index) in selectedSubjects" :key="index">
                    <div class="rule-item-info">
                      <span class="rule-item-subject">{{ t(item.subjectName) }}</span>
                      <span class="rule-item-bank">{{ t(item.category) }}</span>
                    </div>
                    <div class="rule-item-count">
                      <span class="count-num">{{ item.count }}</span>
                      <span class="count-unit">{{ t('questions') }}</span>
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
              <span>{{ t('prevStep') }}</span>
            </button>
            <button class="step-btn step-btn-primary" @click="createPaper" :disabled="!canProceed">
              <span>{{ t('createPaper') }}</span>
              <span class="material-symbols-outlined">check</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="picker-container" v-if="showBankModal">
      <SubjectPicker v-model="showBankModal" :bank-meta="bankMeta" @add="handleAddSubject" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import SubjectPicker from '@/presentation/components/page/SubjectPicker.vue'
import { t } from '@/infrastructure/utils/i18n'

const router = useRouter()
const store = useAppStore()

const bankMeta = computed(() => store.bankMeta)

const currentStep = ref(1)

const steps = [
  { id: 1, label: '基本信息' },
  { id: 2, label: '题目选择' },
  { id: 3, label: '预览确认' }
]

const showBankModal = ref(false)

const selectedSubjects = ref([])

const form = reactive({
  title: '',
  duration: 120,
  totalScore: 100,
  description: '',
  paperCategory: ''
})

onMounted(async () => {
  await store.loadBankMeta()
})

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

function exitCreate() {
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

function openBankModal() {
  showBankModal.value = true
}

function handleAddSubject(data) {
  const isDuplicate = selectedSubjects.value.some(item =>
    item.category === data.category &&
    item.scope === data.scope &&
    item.subject === data.subject
  )

  if (isDuplicate) {
    alert('该科目已经添加过了！')
    return
  }

  selectedSubjects.value.push({
    category: data.category,
    scope: data.scope,
    subject: data.subject,
    subjectName: data.subject,
    bankName: data.category,
    count: 10,
    score: 2,
    maxCount: data.count
  })
}

function removeSubject(index) {
  selectedSubjects.value.splice(index, 1)
}

async function createPaper() {
  const allQuestions = []

  for (const item of selectedSubjects.value) {
    if (item.count <= 0) continue

    const questions = await store.getSubjectQuestions(
      item.category,
      item.scope,
      item.subject,
      'shuffle'
    )
    
    const selected = questions.slice(0, item.count)
    allQuestions.push(...selected)
  }

  const paper = {
    id: Date.now(),
    title: form.title,
    description: form.description,
    duration: parseInt(form.duration) || 120,
    paperCategory: form.paperCategory,
    questionCount: allQuestions.length,
    totalScore: autoTotalScore.value || allQuestions.length,
    bankInfo: selectedSubjects.value.map(s => ({
      subject: s.subjectName,
      category: s.category,
      scope: s.scope,
      count: s.count,
      score: s.score
    })),
    questions: allQuestions,
    createdAt: Date.now()
  }

  await store.addExamPaper(paper)
  alert(t('createPaperSuccess') || '试卷创建成功')
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
  background: var(--background);
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
  flex: 0.8;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--radius-full);
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

.add-subject-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--background);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s;
}

.add-subject-btn:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.add-subject-btn:active {
  transform: scale(0.98);
}

.subject-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.subject-card {
  background: var(--background);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.subject-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.subject-card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.subject-card-row-top {
  margin-bottom: 12px;
}

.subject-card-row-bottom {
  gap: 16px;
}

.subject-card-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.subject-card-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.subject-card-meta {
  font-size: 11px;
  color: #8e8e93;
  background: #f2f2f7;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.btn-delete {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  color: #8e8e93;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #ffe5e5;
  color: #ff3b30;
}

.subject-card-field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  color: #8e8e93;
  white-space: nowrap;
}

.field-input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.field-input {
  width: 52px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  color: #1a1a1a;
  background: #f2f2f7;
  transition: all 0.2s;
  -moz-appearance: textfield;
}

.field-input::-webkit-outer-spin-button,
.field-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.field-input:focus {
  outline: none;
  border-color: #007aff;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.field-suffix {
  font-size: 12px;
  color: #8e8e93;
  white-space: nowrap;
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

.picker-container {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--app-max-width);
  height: 100vh;
  z-index: 100;
}
</style>


