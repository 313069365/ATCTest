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
                        <input v-model="form.title" type="text" :placeholder="t('paperTitlePlaceholder')"
                            :class="{ error: showErrors && !form.title.trim() }" />
                    </div>

                    <div class="form-group">
                        <label>生效范围</label>
                        <div class="scope-row">
                            <label class="scope-opt" :class="{ on: form.visibility === 'private' }">
                                <input type="radio" v-model="form.visibility" value="private" />
                                <span>仅自己</span>
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
                            <label>考试次数</label>
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
                    <span class="header-count">{{ selectedSubjects.length }} 科</span>
                    <button class="header-add" @click="openBankModal">
                        <Icon name="add" />
                    </button>
                </div>
                <div class="card-body">
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
                                <span>{{ item.count }} 题</span>
                                <span class="dot">·</span>
                                <span>{{ item.score }} 分/题</span>
                            </div>
                        </div>
                    </div>
                    <div v-else class="empty-box" @click="openBankModal">
                        <Icon name="add-circle-outline" />
                        <p>{{ t('clickToAddSubject') }}</p>
                    </div>

                    <div v-if="selectedSubjects.length > 0" class="summary-row">
                        <span>共 <strong>{{ totalQuestions }}</strong> 题</span>
                        <span>总分 <strong>{{ totalScore }}</strong></span>
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

onMounted(() => store.loadBankMeta())

const totalQuestions = computed(() =>
    selectedSubjects.value.reduce((s, i) => s + (i.count || 0), 0)
)
const totalScore = computed(() =>
    selectedSubjects.value.reduce((s, i) => s + (i.count || 0) * (i.score || 0), 0)
)
const canCreate = computed(() => form.title.trim() && selectedSubjects.value.length > 0)

async function exitCreate() {
    if (await confirm.show('确定要退出吗？已填写的内容将丢失。')) {
        router.back()
    }
}

function openBankModal() { showBankModal.value = true }

function handleAddMultiple(items) {
    selectedSubjects.value = items.map(item => ({
        category: item.category,
        scope: item.scope,
        subject: item.subject,
        subjectName: item.subject,
        count: item.pickCount || 10,
        score: item.score || 1,
        maxCount: item.count,
    }))
}

function removeSubject(i) {
    selectedSubjects.value.splice(i, 1)
}

async function createPaper() {
    showErrors.value = true
    if (!canCreate.value) return

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
        passScore: 60,
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

.card-header .header-count {
    font-size: 13px;
    font-weight: 400;
    color: var(--text-secondary);
}

.header-add {
    margin-left: auto;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-light);
    border: none;
    border-radius: 50%;
    color: var(--primary);
    cursor: pointer;
    transition: all 0.15s;
}

.header-add:active {
    background: var(--primary);
    color: #fff;
    transform: rotate(90deg);
}

.card-body {
    padding: 14px 16px;
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

.empty-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 36px 20px;
    border: 2px dashed var(--border-color);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.15s;
}

.empty-box:active {
    border-color: var(--primary);
    background: var(--primary-light);
}

.empty-box svg {
    font-size: 36px;
    color: var(--primary);
    opacity: 0.4;
    margin-bottom: 6px;
}

.empty-box p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 12px;
    background: var(--primary-light);
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
}

.create-btn {
    width: 100%;
    height: 48px;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 12px;
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
