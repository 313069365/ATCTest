<template>
    <div class="create-page">
        <TopBar :title="t('createPaper')" showBack backIcon="close" @back="exitCreate" />

        <main class="form-scroll">
            <!-- 基本信息 -->
            <section class="form-card">
                <div class="card-header">
                    <span class="card-bar"></span>
                    <span>考试信息</span>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label>{{ t('paperTitle') }} <span class="req">*</span></label>
                        <input v-model="form.title" type="text" :placeholder="t('paperTitle')"
                            :class="{ error: showErrors && !form.title.trim() }" />
                    </div>

                    <div class="form-group">
                        <label>权限范围</label>
                        <div class="scope-row">
                            <label class="scope-opt" :class="{ on: form.visibility === 'personal' }">
                                <input type="radio" v-model="form.visibility" value="personal" />
                                <span>个人</span>
                            </label>
                            <label class="scope-opt" :class="{ on: form.visibility === 'department' }">
                                <input type="radio" v-model="form.visibility" value="department" />
                                <span>科室</span>
                            </label>
                            <label class="scope-opt" :class="{ on: form.visibility === 'public' }">
                                <input type="radio" v-model="form.visibility" value="public" />
                                <span>公开</span>
                            </label>
                        </div>
                        <input v-if="form.visibility === 'public'" v-model="form.password" type="text"
                            placeholder="设置访问密码" class="password-input" />
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>{{ t('duration') }}</label>
                            <input v-model.number="form.duration" type="number" min="1" placeholder="120" />
                        </div>
                        <div class="form-group">
                            <label>得分率 %</label>
                            <input v-model.number="form.passRate" type="number" min="1" placeholder="80" />
                        </div>
                        <div class="form-group">
                            <label>作答次数限制</label>
                            <input v-model.number="form.maxAttempts" type="number" min="1" placeholder="1" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>截止时间</label>
                        <input v-model="form.expiration" type="datetime-local" />
                    </div>
                </div>
            </section>

            <!-- 科目选择 -->
            <section class="form-card">
                <div class="card-header">
                    <span class="card-bar"></span>
                    <span>{{ t('subjectSelection') }}</span>

                    <button class="header-add" @click="openBankModal">
                        <Icon name="add" />
                        <span>{{ t('add') }}</span>
                    </button>
                </div>

                <div class="card-body">
                    <div v-if="selectedSubjects.length > 0" class="summary-row">
                        <span>已选 <strong>{{ selectedSubjects.length }}</strong> 科</span>
                        <span>共 <strong>{{ totalQuestions }}</strong> 题</span>
                        <span>总分 <strong>{{ totalScore }}分</strong></span>
                    </div>
                    <div v-if="selectedSubjects.length > 0" class="subject-list">
                        <div v-for="(item, i) in selectedSubjects" :key="i" class="subject-card">
                            <div class="subject-top">
                                <span class="subject-name">{{ t(item.subjectName) }}</span>
                                <button class="btn-del" @click="removeSubject(i)">
                                    <Icon name="close" />
                                </button>
                            </div>
                            <div class="subject-info">
                                <span>{{ t(item.category) }}</span>
                                <span class="dot">·</span>
                                <span>{{ item.count }} 题 x {{ item.score }} 分/题 = {{ item.count * item.score }} 分</span>
                            </div>
                        </div>
                    </div>
                    <div v-else class="preset-section">
                        <div v-if="store.examPresets.length > 0" class="preset-list">
                            <button v-for="preset in store.examPresets" :key="preset.id" class="preset-chip"
                                @click="applyPreset(preset)">
                                <span class="preset-chip-name">{{ preset.title }}</span>
                                <span class="preset-chip-count">{{ getPresetTotal(preset) }}题</span>
                                <span class="preset-chip-del" @click.stop="deletePreset(preset.id)">
                                    <Icon name="close" />
                                </span>
                            </button>
                            <button class="preset-chip-add" @click="openPresetDialog">
                                <Icon name="bookmark-add-outline" />
                                <span>添加预设</span>
                            </button>
                        </div>

                        <div v-if="store.examPresets.length === 0" class="preset-empty">
                            <Icon name="bookmark-outline" />
                            <p>添加预设后可快速创建试卷</p>
                        </div>
                    </div>

                </div>
            </section>
        </main>

        <div class="bottom-bar">
            <button class="create-btn" :disabled="!canCreate" @click="createPaper">
                {{ t('createPaper') }}
            </button>
        </div>

        <div class="modal-overlay" v-if="showBankModal">
            <SubjectPicker v-model="showBankModal" :bank-meta="bankMeta" :existing-subjects="selectedSubjects"
                @add-multiple="handleAddMultiple" />
        </div>

        <ConfirmDialog v-bind="confirm.state" />

        <!-- 创建确认对话框 -->
        <div class="confirm-overlay" v-if="showCreateConfirm" @click.self="showCreateConfirm = false">
            <div class="exam-confirm-dialog">
                <div class="exam-confirm-header">
                    <h3>试卷信息确认</h3>
                    <button class="exam-confirm-close" @click="showCreateConfirm = false">
                        <Icon name="close" />
                    </button>
                </div>
                <div class="exam-confirm-body">
                    <div class="exam-confirm-title">{{ form.title }}</div>
                    <div class="exam-confirm-grid">
                        <div class="exam-confirm-item">
                            <span class="exam-confirm-label">权限</span>
                            <span class="exam-confirm-value">{{ {
                                private: '仅自己', department: '科室', public: '公开'
                            }[form.visibility] }}</span>
                        </div>
                        <div class="exam-confirm-item">
                            <span class="exam-confirm-label">时长</span>
                            <span class="exam-confirm-value">{{ form.duration || 120 }} 分钟</span>
                        </div>
                        <div class="exam-confirm-item">
                            <span class="exam-confirm-label">题量</span>
                            <span class="exam-confirm-value">{{ totalQuestions }} 题</span>
                        </div>
                        <div class="exam-confirm-item">
                            <span class="exam-confirm-label">总分</span>
                            <span class="exam-confirm-value">{{ totalScore }} 分</span>
                        </div>
                    </div>
                    <div class="exam-confirm-subjects">
                        <span class="exam-confirm-label">科目</span>
                        <div class="exam-confirm-tags">
                            <span v-for="(s, i) in selectedSubjects" :key="i" class="exam-confirm-tag">
                                {{ t(s.subjectName) }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="exam-confirm-actions">
                    <button class="btn-cancel" @click="showCreateConfirm = false">返回修改</button>
                    <button class="btn-confirm" @click="doCreatePaper">创建</button>
                </div>
            </div>
        </div>

        <div class="preset-dialog-overlay" v-if="showPresetDialog" @click.self="showPresetDialog = false">
            <div class="preset-dialog">
                <div class="preset-dialog-header">
                    <h3 class="preset-dialog-title">添加预设</h3>
                    <button class="preset-dialog-close" @click="showPresetDialog = false">
                        <Icon name="close" />
                    </button>
                </div>
                <input v-model="presetName" type="text" class="preset-dialog-input" placeholder="输入预设名称"
                    @keyup.enter="savePreset" />
                <div class="preset-dialog-picker">
                    <SubjectPicker v-model="showPresetPicker" :bank-meta="bankMeta" :existing-subjects="presetSubjects"
                        @add-multiple="handlePresetSubjects" />
                </div>
                <div class="preset-dialog-info" v-if="presetSubjects.length > 0">
                    <span>{{ presetSubjects.length }} 科</span>
                    <span class="dot">·</span>
                    <span>{{ getPresetSubjectsTotal }} 题</span>
                    <span class="dot">·</span>
                    <span>{{ getPresetSubjectsScore }} 分</span>
                </div>
                <div class="preset-dialog-actions">
                    <button class="btn-cancel" @click="showPresetDialog = false">取消</button>
                    <button class="btn-confirm" :disabled="!presetName.trim() || presetSubjects.length === 0"
                        @click="savePreset">保存</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/domain/stores/store'
import SubjectPicker from '@/presentation/components/business/SubjectPicker.vue'
import { t } from '@/infrastructure/utils/i18n'
import TopBar from '@/presentation/components/layout/TopBar.vue'
import Icon from '@/presentation/components/common/Icon.vue'
import ConfirmDialog from '@/presentation/components/common/ConfirmDialog.vue'
import { useConfirm } from '@/presentation/composables/useConfirm'

const router = useRouter()
const store = useAppStore()
const confirm = useConfirm()

const bankMeta = computed(() => store.bankMeta)
const showBankModal = ref(false)
const showPresetDialog = ref(false)
const showPresetPicker = ref(false)
const showCreateConfirm = ref(false)
const presetName = ref('')
const presetSubjects = ref([])
const showErrors = ref(false)
const selectedSubjects = ref([])

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
const defaultExp = tomorrow.toISOString().slice(0, 16)

const form = reactive({
    title: '',
    visibility: 'private',
    password: '',
    duration: 120,
    maxAttempts: 1,
    expiration: defaultExp,
})

onMounted(() => {
    store.loadBankMeta()
    store.loadExamPresets()
})

const totalQuestions = computed(() =>
    selectedSubjects.value.reduce((s, i) => s + (i.count || 0), 0)
)
const totalScore = computed(() =>
    selectedSubjects.value.reduce((s, i) => s + (i.count || 0) * (i.score || 0), 0)
)
const canCreate = computed(() => form.title.trim() && selectedSubjects.value.length > 0)

const getPresetSubjectsTotal = computed(() =>
    presetSubjects.value.reduce((s, i) => s + (i.count || 0), 0)
)
const getPresetSubjectsScore = computed(() =>
    presetSubjects.value.reduce((s, i) => s + (i.count || 0) * (i.score || 0), 0)
)

async function exitCreate() {
    if (await confirm.show('确定要退出吗？已填写的内容将丢失。')) {
        router.back()
    }
}

function openBankModal() { showBankModal.value = true }

function openPresetDialog() {
    presetName.value = ''
    presetSubjects.value = []
    showPresetDialog.value = true
    showPresetPicker.value = true
}

function handlePresetSubjects(items) {
    presetSubjects.value = items.map(item => ({
        category: item.category,
        scope: item.scope,
        subject: item.subject,
        subjectName: item.subject,
        count: item.pickCount || 10,
        score: item.score || 1,
        maxCount: item.count,
    }))
}

function savePreset() {
    if (!presetName.value.trim() || presetSubjects.value.length === 0) return
    store.saveExamPreset({
        id: Date.now(),
        title: presetName.value.trim(),
        bankInfo: presetSubjects.value.map(s => ({
            category: s.category,
            scope: s.scope,
            subject: s.subject,
            count: s.count,
            score: s.score,
            maxCount: s.maxCount,
        }))
    })
    presetName.value = ''
    presetSubjects.value = []
    showPresetDialog.value = false
    showPresetPicker.value = false
}

async function deletePreset(id) {
    if (await confirm.show('确定要删除这个预设吗？')) {
        store.deleteExamPreset(id)
    }
}

function handleAddMultiple(items) {
    selectedSubjects.value = items.map(item => ({
        category: item.category,
        scope: item.scope,
        subject: item.subject,
        subjectName: item.subject,
        count: item.pickCount || 100,
        score: item.score || 1,
        maxCount: item.count,
    }))
}

function removeSubject(i) {
    selectedSubjects.value.splice(i, 1)
}

function getPresetTotal(preset) {
    return (preset.bankInfo || []).reduce((s, info) => s + (info.count || 0), 0)
}

function applyPreset(preset) {
    selectedSubjects.value = (preset.bankInfo || []).map(info => ({
        category: info.category,
        scope: info.scope,
        subject: info.subject,
        subjectName: info.subject,
        count: info.count || 10,
        score: info.score || 1,
        maxCount: info.maxCount || info.count || 10,
    }))
}

async function createPaper() {
    showErrors.value = true
    if (!canCreate.value) return

    // 显示确认对话框
    const subjectNames = selectedSubjects.value.map(s => t(s.subjectName)).join('、')
    const confirmed = await confirm.show(
        `${form.title}\n\n` +
        `时长: ${form.duration || 120} 分钟，` +
        `题量: ${totalQuestions.value} 题，` +
        `总分: ${totalScore.value} 分，` +
        `截止时间: ${form.expiration || "未设置"}\n` +
        `科目: ${subjectNames}`,
        { title: '试卷信息确认', confirmText: '创建', cancelText: '返回修改' }
    )
    if (!confirmed) return

    const allQuestions = []
    for (const item of selectedSubjects.value) {
        if (item.count <= 0) continue
        const questions = await store.getSubjectQuestions(item.category, item.scope, item.subject, 'shuffle')
        allQuestions.push(...questions.slice(0, item.count))
    }

    const paper = {
        id: Date.now(),
        title: form.title,
        creator: '',
        visibility: form.visibility,
        password: form.visibility === 'public' ? form.password : '',
        expiration: form.expiration ? new Date(form.expiration).getTime() : null,
        duration: form.duration || 120,
        maxAttempts: form.maxAttempts || 1,
        passScore: form.passScore || 80,
        questionCount: allQuestions.length,
        totalScore: totalScore.value || allQuestions.length,
        bankInfo: selectedSubjects.value.map(s => ({
            subject: s.subjectName,
            category: s.category,
            scope: s.scope,
            count: s.count,
            score: s.score,
        })),
        questions: allQuestions,
        createdAt: Date.now(),
    }

    await store.addExamPaper(paper)
    alert(t('createPaperSuccess') || '试卷创建成功')
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
    padding: 12px 16px 88px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Card */
.form-card {
    background: var(--background);
    border-radius: 12px;
    overflow: hidden;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    font-size: 15px;
    font-weight: 600;
    color: var(--on-surface);
    border-bottom: 1px solid var(--border-color-light);
}

.card-bar {
    width: 3px;
    height: 16px;
    background: var(--primary);
    border-radius: 2px;
}

.header-add {
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary);
    border: none;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    color: #fff;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.15s;
}

.header-add:active {
    background: var(--primary);
    color: #fff;
}

.card-body {
    padding: 8px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Form */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
}

.form-group label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
}

.req {
    color: var(--error);
}

.form-group input {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid var(--border-color-light);
    border-radius: 10px;
    background: var(--background-secondary);
    font-size: 15px;
    color: var(--on-surface);
    transition: border-color 0.15s;
}

.form-group input:focus {
    outline: none;
    border-color: var(--primary);
}

.form-group input.error {
    border-color: var(--error);
}

.form-row {
    display: flex;
    gap: 12px;
}

.scope-row {
    display: flex;
    gap: 8px;
}

.scope-opt {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: 1.5px solid var(--border-color);
    border-radius: 10px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s;
    background: var(--background-secondary);
}

.scope-opt input {
    display: none;
}

.scope-opt.on {
    border-color: var(--primary);
    background: var(--primary-light);
    color: var(--primary);
    font-weight: 600;
}

.password-input {
    margin-top: 4px;
}

/* Subject list */
.subject-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.subject-card {
    background: var(--background-secondary);
    border-radius: 10px;
    padding: 10px 12px;
    border: 1px solid var(--primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subject-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.subject-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--on-surface);
}

.btn-del {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-disabled);
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-del:active {
    background: rgba(255, 59, 48, 0.1);
    color: var(--error);
}

.subject-info {
    display: flex;
    gap: 5px;
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 2px;
}

.dot {
    color: var(--text-disabled);
}

/* 预设区 */
.preset-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}



.preset-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.preset-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1.5px dashed var(--border-color);
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    transition: all 0.15s;
}

.preset-chip:active {
    border-color: var(--primary);
    border-style: solid;
    background: var(--primary-light);
}

.preset-chip-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--on-surface);
}

.preset-chip-count {
    font-size: 11px;
    color: var(--text-disabled);
}

.preset-chip-del {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--background-secondary);
    color: var(--text-disabled);
    transition: all 0.15s;
    margin-left: 2px;
}

.preset-chip-del svg {
    font-size: 12px;
}

.preset-chip-del:active {
    background: var(--error-light);
    color: var(--error);
}

.preset-chip-add {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1.5px solid var(--primary);
    border-radius: 8px;
    color: var(--primary);
    background: transparent;
    cursor: pointer;
    transition: all 0.15s;
}

.preset-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    color: var(--text-disabled);
}

.preset-empty svg {
    font-size: 32px;
    opacity: 0.4;
    margin-bottom: 6px;
}

.preset-empty p {
    font-size: 13px;
    text-align: center;
    margin: 0;
}

.add-subject-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    border: 1.5px dashed var(--border-color);
    border-radius: 10px;
    background: transparent;
    color: var(--primary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}

.add-subject-btn:active {
    border-color: var(--primary);
    background: var(--primary-light);
}

.save-preset-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    border: 1.5px solid var(--primary);
    border-radius: 10px;
    background: var(--primary-light);
    color: var(--primary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}

.save-preset-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.save-preset-btn:active:not(:disabled) {
    background: var(--primary);
    color: #fff;
}

/* 预设对话框 */
.preset-dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.preset-dialog {
    background: var(--background);
    border-radius: 16px;
    padding: 20px;
    width: 100%;
    max-width: 380px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.preset-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

.preset-dialog-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--on-surface);
    margin: 0;
}

.preset-dialog-close {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: var(--background-secondary);
    border-radius: 50%;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.15s;
}

.preset-dialog-close:active {
    background: var(--background);
    color: var(--on-surface);
}

.preset-dialog-input {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid var(--border-color);
    border-radius: 10px;
    font-size: 15px;
    color: var(--on-surface);
    background: var(--background-secondary);
    margin-bottom: 10px;
}

.preset-dialog-input:focus {
    outline: none;
    border-color: var(--primary);
}

.preset-dialog-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 16px;
}

.preset-dialog-picker {
    margin-bottom: 12px;
}

.preset-dialog-actions {
    display: flex;
    gap: 10px;
}

.btn-cancel,
.btn-confirm {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.btn-cancel {
    background: var(--background-secondary);
    color: var(--text-secondary);
}

.btn-confirm {
    background: var(--primary);
    color: #fff;
}

.btn-confirm:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.btn-confirm:active:not(:disabled) {
    transform: scale(0.97);
}

.summary-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 8px 0;
    /* background: var(--secondary); */
    border-radius: 8px;
    font-size: 14px;
    color: var(--text-secondary);
}

.summary-row strong {
    color: var(--primary);
    font-weight: 700;
    font-size: 15px;
}

/* Bottom bar */
.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: var(--app-max-width);
    padding: 10px 16px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
    background: var(--background);
    border-top: 1px solid var(--border-color-light);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
}

.create-btn {

    width: 60%;
    height: 48px;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: var(--radius-full);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 4px 12px rgba(0, 91, 191, 0.2);
}

.create-btn:disabled {
    background: var(--color-gray-300, #d1d5db);
    box-shadow: none;
    cursor: not-allowed;
}

.create-btn:active:not(:disabled) {
    transform: scale(0.97);
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
}
</style>
