<template>
  <div class="create-page">
    <TopBar :title="t('createPaper')" showBack backIcon="close" @back="exitCreate" />

    <main class="form-scroll">
      <!-- 基本信息卡片 -->
      <section class="form-card">
        <div class="card-header">
          <span class="card-header-bar"></span>
          <span>{{ t('examInfo') }}</span>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>{{ t('examName') }} <span class="required">*</span></label>
            <input v-model="form.title" type="text" :placeholder="t('examNamePlaceholder')"
              :class="{ error: submitted && !form.title }" />
          </div>

          <div class="form-group">
            <label>{{ t('visibility') }}</label>
            <div class="scope-options">
              <label class="scope-option" :class="{ active: form.visibility === 'private' }">
                <input type="radio" v-model="form.visibility" value="private" />
                <span>{{ t('private') }}</span>
              </label>
              <label class="scope-option" :class="{ active: form.visibility === 'department' }">
                <input type="radio" v-model="form.visibility" value="department" />
                <span>{{ t('department') }}</span>
              </label>
              <label class="scope-option" :class="{ active: form.visibility === 'public' }">
                <input type="radio" v-model="form.visibility" value="public" />
                <span>{{ t('public') }}</span>
              </label>
            </div>
            <Transition name="fade">
              <input v-if="form.visibility === 'private'" v-model="form.password" type="text"
                :placeholder="t('passwordPlaceholder')" class="password-input" />
            </Transition>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('duration') }}</label>
              <input v-model="form.duration" type="number" min="1" placeholder="120" />
            </div>
            <div class="form-group">
              <label>{{ t('passRate') }}</label>
              <input v-model="form.passRate" type="number" min="0" max="100" step="1" placeholder="80" />
            </div>
            <div class="form-group">
              <label>{{ t('maxAttempts') }}</label>
              <input v-model="form.maxAttempts" type="number" min="1" placeholder="1" />
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('deadline') }}</label>
            <input v-model="form.expiration" type="datetime-local" />
          </div>
        </div>
      </section>

      <!-- 科目选择卡片 -->
      <section class="form-card">
        <div class="card-header">
          <span class="card-header-bar"></span>
          <span>{{ t('subjectSelection') }}</span>
          <button class="header-add-btn" @click="openBankModal">
            <Icon name="add" />
          </button>
        </div>
        <div class="card-body">
          <div v-if="selectedSubjects.length > 0" class="subject-list">
            <div v-for="(item, index) in selectedSubjects" :key="index" class="subject-row">
              <div class="subject-info">
                <span class="subject-name">{{ t(item.subjectName) }}</span>
                <span class="subject-category">{{ t(item.category) }}</span>
              </div>
              <span class="subject-detail">{{ item.count }}{{ t('questions') }} · {{ item.score }}{{ t('score') }}/{{
                t('questions') }}</span>
              <button class="btn-remove" @click="removeSubject(index)">
                <Icon name="close" />
              </button>
            </div>
          </div>
          <div v-else class="presets-section">
            <div class="presets-chips">
              <button class="preset-chip" @click="applyPreset('basic-collection')">
                <Icon name="add" />
                <span>{{ t('presetBasicCollection') }}</span>
                <span class="chip-edit" @click.stop="openPresetConfig('basic-collection')">
                  <Icon name="edit-note" />
                </span>
              </button>
              <button class="preset-chip" @click="applyPreset('airport-control')">
                <Icon name="add" />
                <span>{{ t('presetAirportControl') }}</span>
                <span class="chip-edit" @click.stop="openPresetConfig('airport-control')">
                  <Icon name="edit-note" />
                </span>
              </button>
              <button class="preset-chip" @click="applyPreset('apron-control')">
                <Icon name="add" />
                <span>{{ t('presetApronControl') }}</span>
                <span class="chip-edit" @click.stop="openPresetConfig('apron-control')">
                  <Icon name="edit-note" />
                </span>
              </button>
              <button class="preset-chip outlined" @click="openBankModal">
                <Icon name="add-circle-outline" />
                <span>{{ t('customSelect') }}</span>
              </button>
            </div>
          </div>

          <div v-if="selectedSubjects.length > 0" class="summary-row">
            <span>{{ t('total') }} <strong>{{ totalQuestions }}</strong>{{ t('questions') }}</span>
            <span>{{ t('totalScore') }} <strong>{{ autoTotalScore }}</strong></span>
          </div>
        </div>
      </section>
    </main>

    <!-- 固定底部按钮 -->
    <div class="bottom-bar">
      <button class="create-btn" :disabled="!form.title.trim()" @click="createPaper">
        {{ t('createPaper') }}
      </button>
    </div>

    <div class="picker-overlay" v-if="showBankModal">
      <SubjectPicker v-model="showBankModal" :bank-meta="bankMeta" :existing-subjects="selectedSubjects"
        @add-multiple="handleAddMultiple" />
    </div>

    <PresetConfig :visible="showPresetConfig" :bank-meta="bankMeta" :subjects="configSubjects"
      @close="showPresetConfig = false" @apply="handleConfigApply" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import SubjectPicker from '@/presentation/components/bank/SubjectPicker.vue'
import PresetConfig from '@/presentation/components/session/PresetConfig.vue'
import { t } from '@/infrastructure/utils/i18n'
import TopBar from '@/presentation/components/layout/TopBar.vue'
import Icon from '@/presentation/components/ui/Icon.vue'

const router = useRouter()
const store = useAppStore()

const bankMeta = computed(() => store.bankMeta)
const showBankModal = ref(false)
const selectedSubjects = ref([])
const submitted = ref(false)
const showPresetConfig = ref(false)
const configSubjects = ref([])

// 默认截止时间：明天此时
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
const fmt = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

// 转为 YYYY-MM-DDTHH:mm
const defaultExpiration = fmt.format(tomorrow).replace(/\//g, '-').replace(' ', 'T');

const form = reactive({
  title: '',
  visibility: 'department',
  password: '',
  expiration: defaultExpiration,
  duration: 120,
  passRate: 80,
  maxAttempts: 1
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

function exitCreate() {
  if (confirm(t('confirmExitCreate'))) {
    router.back()
  }
}

function openBankModal() {
  showBankModal.value = true
}

function handleAddMultiple(items) {
  // SubjectPicker 现在预加载已有科目并统一提交，直接替换
  selectedSubjects.value = items.map(item => ({
    category: item.category,
    scope: item.scope,
    subject: item.subject,
    subjectName: item.subject,
    bankName: item.category,
    count: item.pickCount || Math.min(10, item.count),
    score: item.score || 1,
    maxCount: item.count
  }))
}

function removeSubject(index) {
  selectedSubjects.value.splice(index, 1)
}

function makeSubject(cat, scope, subj, count) {
  return {
    category: cat,
    scope,
    subject: subj,
    subjectName: subj,
    bankName: cat,
    count,
    score: 1,
    maxCount: 9999,
  }
}

const presets = {
  'basic-collection': [
    makeSubject('atc', 'base', 'basicCollection', 105),
  ],
  'airport-control': [
    makeSubject('atc', 'base', 'basicCollection', 105),
    makeSubject('atc', 'professional', 'aerodromeControl', 120),
    makeSubject('atc', 'english', 'singleChoice', 65),
    { ...makeSubject('atc', 'english', 'readingComprehension', 2), score: 5 },
  ],
  'apron-control': [
    makeSubject('atc', 'professional', 'apronControl', 200),
  ],
}

function applyPreset(key) {
  const items = presets[key]
  if (!items) return
  selectedSubjects.value = items.map(s => ({ ...s }))
}

function openPresetConfig(key) {
  configSubjects.value = presets[key]?.map(s => ({ ...s })) || []
  showPresetConfig.value = true
}

function handleConfigApply(items) {
  selectedSubjects.value = items
}

async function createPaper() {
  submitted.value = true
  if (!form.title.trim()) return

  const allQuestions = []
  let actualTotalScore = 0

  for (const item of selectedSubjects.value) {
    if (item.count <= 0) continue
    const questions = await store.getSubjectQuestions(
      item.category, item.scope, item.subject, 'shuffle'
    )
    const picked = questions.slice(0, item.count)

    if (item.subject === 'readingComprehension') {
      const totalSubs = picked.reduce((sum, q) => sum + (q.subs?.length || 0), 0)
      actualTotalScore += totalSubs
      item.score = picked.length > 0 ? Math.round(totalSubs / picked.length * 10) / 10 : 1
    } else {
      actualTotalScore += picked.length * (item.score || 1)
    }

    allQuestions.push(...picked)
  }

  const paper = {
    id: Date.now(),
    title: form.title,
    creator: '', // 待用户系统接入后自动填充
    visibility: form.visibility,
    password: form.visibility === 'public' ? form.password : '',
    Expiration: form.expiration ? new Date(form.expiration).getTime() : null,
    duration: parseInt(form.duration) || 120,
    maxAttempts: parseInt(form.maxAttempts) || 1,
    passScore: Math.round(actualTotalScore * 0.8),
    questionCount: allQuestions.length,
    totalScore: actualTotalScore,
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
  alert(t('createPaperSuccess'))
  router.push('/exam')
}
</script>

<style scoped>
.create-page {
  min-height: 100vh;
  background: var(--background-secondary);
  display: flex;
  flex-direction: column;
}

.form-scroll {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md) var(--spacing-lg);
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* === 卡片容器 === */
.form-card {
  background: var(--background);
  border-radius: 14px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  border-bottom: 1px solid var(--border-color);
}

.card-header-bar {
  width: 4px;
  height: 16px;
  background: var(--primary);
  border-radius: 2px;
  flex-shrink: 0;
}

.card-header-count {
  margin-left: 4px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
}

.card-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* === 表单控件 === */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.required {
  color: var(--error);
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="datetime-local"],
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid transparent;
  border-radius: 10px;
  background: var(--background-secondary);
  font-size: 15px;
  color: var(--on-surface);
  transition: border-color 0.15s, box-shadow 0.15s;
  -moz-appearance: textfield;
}

.form-group input[type="number"]::-webkit-outer-spin-button,
.form-group input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 91, 191, 0.12);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-disabled);
}

.form-group input.error {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.12);
}

.form-group textarea {
  resize: vertical;
  min-height: 56px;
}

/* 生效范围选项 */
.scope-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.scope-option {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 6px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s ease;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  user-select: none;
}


.scope-option input {
  display: none;
}

.scope-option.active {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
  box-shadow: 0 2px 8px rgba(0, 91, 191, 0.15);
}

.password-input {
  margin-top: 8px;
}

/* 多列行 */
.form-row {
  display: flex;
  gap: 10px;
}

@media (max-width: 380px) {
  .form-row {
    flex-direction: column;
    gap: 8px;
  }
}

/* === 科目列表 === */
.subject-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subject-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--background-secondary);
  border-radius: 10px;
}

.subject-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.subject-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subject-category {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--background);
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.subject-detail {
  font-size: var(--font-size-sm);
  color: var(--primary);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-remove {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--text-disabled);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-remove:active {
  background: rgba(255, 59, 48, 0.1);
  color: var(--error);
  transform: scale(0.9);
}

/* 头部添加按钮 */
.header-add-btn {
  margin-left: auto;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border: none;
  border-radius: 50%;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.18s ease;
}

.header-add-btn:active {
  background: var(--primary);
  color: var(--on-primary);
  transform: rotate(90deg);
}

.header-add-btn svg {
  font-size: 18px;
}

/* 汇总行 */
.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 12px;
  background: var(--primary-light);
  border-radius: 8px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.summary-row strong {
  color: var(--primary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
}

/* 预设快捷填入 */
.presets-section {
  padding: 4px 0;
}

.presets-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: var(--primary-light);
  border: 1px solid transparent;
  border-radius: 20px;
  color: var(--primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.preset-chip svg {
  font-size: 16px;
}

.preset-chip:active {
  background: var(--primary);
  color: var(--on-primary);
  transform: scale(0.96);
}

.preset-chip.outlined {
  background: transparent;
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.preset-chip.outlined:active {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.chip-edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--text-tertiary);
  margin-left: 2px;
  cursor: pointer;
  transition: all 0.15s;
}

.chip-edit svg {
  font-size: 14px;
}

.chip-edit:active {
  background: rgba(0, 0, 0, 0.08);
  color: var(--primary);
}

/* === 固定底部按钮 === */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--app-max-width);
  padding: 12px var(--spacing-lg);
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: var(--background);
  border-top: 1px solid var(--border-color-light);
  z-index: 50;
}

.create-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, var(--primary) 0%, #0070d9 100%);
  color: var(--on-primary);
  border: none;
  border-radius: 14px;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 91, 191, 0.25);
  transition: all 0.18s ease;
}

.create-btn:disabled {
  background: var(--color-gray-300, #d1d5db);
  box-shadow: none;
  cursor: not-allowed;
}

.create-btn:active:not(:disabled) {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(0, 91, 191, 0.3);
}

/* SubjectPicker 覆盖层 */
/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
}
</style>
