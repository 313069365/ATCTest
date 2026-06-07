<template>
  <div class="picker-wrapper" v-if="modelValue">
    <div class="picker-backdrop" @click="close"></div>
    <div class="picker" @click.stop>
      <div class="picker-header">
        <button class="picker-btn cancel" @click="close">{{ t('cancel') }}</button>
        <span class="picker-title">{{ defaultTitle }}</span>
        <button class="picker-btn confirm" @click="handleConfirm" :disabled="!canConfirm">{{ t('add') }}</button>
      </div>
      <div class="picker-body">
        <div class="picker-column">
          <!-- <div class="picker-column-header">{{ t('questionBank') }}</div> -->
          <div class="picker-list">
            <div v-for="(info, key) in categories" :key="key" class="picker-item"
              :class="{ active: selection.category === key }" @click="selectCategory(key)">
              {{ t(key) }}
            </div>
          </div>
        </div>
        <div class="picker-column">
          <!-- <div class="picker-column-header">{{ t('scope') }}</div> -->
          <div class="picker-list">
            <div v-for="scope in getScopes(selection.category)" :key="scope" class="picker-item"
              :class="{ active: selection.scope === scope }" @click="selectScope(scope)">
              {{ t(scope) }}
            </div>
            <div class="picker-placeholder" v-if="!selection.category">{{ t('selectCategoryFirst') }}</div>
          </div>
        </div>
        <div class="picker-column">
          <!-- <div class="picker-column-header">{{ t('subject') }}</div> -->
          <div class="picker-list">
            <div v-for="subj in getSubjects(selection.category, selection.scope)" :key="subj.name" class="picker-item"
              :class="{ active: selection.subject === subj.name }" @click="selectSubject(subj.name)">
              <span class="subject-name">{{ t(subj.name) }}</span>
            </div>
            <div class="picker-placeholder" v-if="!selection.scope">{{ t('selectScopeFirst') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { t } from '@/infrastructure/utils/i18n'
import { useAppStore } from '@/domain/stores/store'

const props = defineProps({
  modelValue: Boolean,
  bankMeta: {
    type: Object,
    default: () => ({})
  },
  title: {
    type: String,
    default: ''
  }
})

const defaultTitle = computed(() => props.title || t('addSubject'))

const emit = defineEmits(['update:modelValue', 'add'])

const selection = reactive({
  category: '',
  scope: '',
  subject: ''
})

const categories = computed(() => {
  return props.bankMeta || {}
})

const canConfirm = computed(() => {
  return selection.category && selection.scope && selection.subject
})

async function loadBankMetaIfNeeded() {
  const store = useAppStore()
  if (!store.bankMeta || Object.keys(store.bankMeta).length === 0) {
    await store.loadBankMeta()
  }
}

function setDefaultSelection() {
  const store = useAppStore()
  const meta = store.bankMeta

  const firstCategory = Object.keys(meta)[0]
  if (firstCategory) {
    selection.category = firstCategory
    const firstScope = meta[firstCategory]?.scopes?.[0]
    if (firstScope) {
      selection.scope = firstScope
    }
  }
  selection.subject = ''
}

watch(() => props.modelValue, async (val) => {
  if (val) {
    await loadBankMetaIfNeeded()
    setDefaultSelection()
  }
}, { immediate: true })

function getScopes(category) {
  const store = useAppStore()
  const catMeta = store.bankMeta[category]
  return catMeta?.scopes || []
}

function getSubjects(category, scope) {
  const store = useAppStore()
  const catMeta = store.bankMeta[category]
  if (!catMeta) return []
  return Object.entries(catMeta.subjects)
    .filter(([_, info]) => info.scope === scope)
    .map(([name, info]) => ({ name, count: info.count }))
}


function selectCategory(key) {
  const store = useAppStore()
  selection.category = key
  const firstScope = store.bankMeta[key]?.scopes?.[0]
  selection.scope = firstScope || ''
  selection.subject = ''
}

function selectScope(scope) {
  selection.scope = scope
  selection.subject = ''
}

function selectSubject(name) {
  selection.subject = name
}

function close() {
  emit('update:modelValue', false)
}

function handleConfirm() {
  if (!canConfirm.value) return

  const subjectInfo = getSubjects(selection.category, selection.scope)
    .find(s => s.name === selection.subject)

  emit('add', {
    category: selection.category,
    scope: selection.scope,
    subject: selection.subject,
    count: subjectInfo?.count || 0
  })
  close()
}
</script>

<style scoped>
.picker-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

.picker-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
  padding: var(--spacing-sm);
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

.picker-btn.confirm:disabled {
  color: var(--text-secondary);
  opacity: 0.5;
}

.picker-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.picker-body {
  display: flex;
  overflow-x: auto;
  max-height: 60vh;
  min-height: 50vh;
}

.picker-column {
  flex: 1;
  min-width: 100px;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.picker-column:last-child {
  border-right: none;
}

.picker-column-header {
  text-align: center;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.picker-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-mn);
  padding: var(--spacing-mn);
  overflow-y: auto;
}

.picker-item {
  padding: var(--spacing-sm);
  text-align: center;
  cursor: pointer;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.picker-item.active {
  background: var(--primary-light);
  color: var(--primary);
}

.subject-name {
  font-size: var(--font-size-md);
}

.subject-count {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.picker-placeholder {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
</style>