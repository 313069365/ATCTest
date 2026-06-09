<template>
    <div class="dialog-overlay" v-if="visible" @click.self="$emit('close')">
        <div class="dialog">
            <h3 class="dialog-title">{{ t('joinExam') }}</h3>
            <p class="dialog-desc">{{ t('joinExamHint') }}</p>

            <div class="dialog-field">
                <label>{{ t('examId') }}</label>
                <input ref="idInputRef" v-model="examId" type="text" :placeholder="t('examIdPlaceholder')"
                    class="dialog-input" @keydown.enter="$refs.pwInput?.focus()" />
            </div>

            <div class="dialog-field">
                <label>{{ t('examPassword') }}</label>
                <input ref="pwInput" v-model="password" type="password" :placeholder="t('examPasswordPlaceholder')"
                    class="dialog-input" @keydown.enter="handleConfirm" />
            </div>

            <p class="dialog-error" v-if="errorMsg">{{ errorMsg }}</p>

            <div class="dialog-actions">
                <button class="dialog-btn cancel" @click="$emit('close')">{{ t('cancel') }}</button>
                <button class="dialog-btn confirm" :disabled="!canSubmit" @click="handleConfirm">{{ t('joinExam')
                    }}</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { t } from '@/infrastructure/utils/i18n'
import { useAppStore } from '@/domain/stores/store'

const props = defineProps({
    visible: Boolean,
})

const emit = defineEmits(['close', 'join'])

const store = useAppStore()
const examId = ref('')
const password = ref('')
const errorMsg = ref('')
const idInputRef = ref(null)

const canSubmit = computed(() => examId.value.trim().length > 0)

watch(() => props.visible, (val) => {
    if (val) {
        examId.value = ''
        password.value = ''
        errorMsg.value = ''
        nextTick(() => idInputRef.value?.focus())
    }
})

function handleConfirm() {
    errorMsg.value = ''
    const id = examId.value.trim()

    if (!id) {
        errorMsg.value = t('examIdRequired')
        return
    }

    // 查找试卷
    store.loadExamPapers()
    const paperId = parseInt(id)
    const paper = store.examPapers.find(p => String(p.id) === id || p.id === paperId)

    if (!paper) {
        errorMsg.value = t('examNotFound')
        return
    }

    // 验证密码（如果试卷设置了密码）
    if (paper.password && paper.password !== password.value) {
        errorMsg.value = t('wrongPassword')
        return
    }

    emit('join', paper.id)
    emit('close')
}
</script>

<style scoped>
.dialog-overlay {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: var(--app-max-width);
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: var(--z-popup);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
}

.dialog {
    background: var(--background);
    border-radius: var(--radius-xl);
    padding: var(--spacing-lg);
    width: 100%;
    max-width: 340px;
    box-shadow: var(--shadow-lg);
}

.dialog-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--on-surface);
    margin: 0 0 var(--spacing-mn);
}

.dialog-desc {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--spacing-lg);
    line-height: 1.4;
}

.dialog-field {
    margin-bottom: var(--spacing-md);
}

.dialog-field label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-mn);
}

.dialog-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 2px solid var(--border-color-strong);
    border-radius: var(--radius-md);
    font-size: var(--font-size-md);
    outline: none;
    background: var(--background);
    color: var(--on-surface);
    box-sizing: border-box;
    transition: border-color 0.2s;
}

.dialog-input:focus {
    border-color: var(--primary);
}

.dialog-error {
    font-size: var(--font-size-sm);
    color: var(--error);
    margin: var(--spacing-mn) 0;
}

.dialog-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-lg);
}

.dialog-btn {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-full);
    border: none;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: all 0.15s;
}

.dialog-btn.cancel {
    background: var(--color-gray-200);
    color: var(--text-secondary);
}

.dialog-btn.confirm {
    background: var(--primary);
    color: var(--on-primary);
}

.dialog-btn.confirm:disabled {
    background: var(--color-gray-300);
    color: var(--text-disabled);
    cursor: not-allowed;
}
</style>
