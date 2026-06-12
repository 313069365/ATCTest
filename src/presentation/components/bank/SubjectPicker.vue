<template>
  <BottomSheet :visible="modelValue" @close="close">
    <template #header>
      <div class="header-tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'select' }" @click="activeTab = 'select'">
          选择科目
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'config' }" @click="activeTab = 'config'"
          :disabled="checkedList.length === 0">
          配置参数
          <span class="tab-badge" v-if="checkedList.length > 0">{{ checkedList.length }}</span>
        </button>
      </div>
    </template>

    <div class="picker-container">
      <!-- 选题面板 -->
      <div v-show="activeTab === 'select'" class="picker-body">
        <div class="nav-column">
          <div v-for="cat in categoryList" :key="cat.key" class="nav-item"
            :class="{ active: activeCategory === cat.key }" @click="switchCategory(cat.key)">
            <span class="nav-label">{{ t(cat.key) }}</span>
            <span class="nav-count">{{ cat.total }}</span>
          </div>
        </div>
        <div class="content-column">
          <template v-for="group in groupedSubjects" :key="group.scope">
            <div class="scope-header">{{ t(group.scope) }}</div>
            <div v-for="subj in group.items" :key="subj.name" class="subject-item"
              :class="{ checked: isChecked(subj), added: subj.alreadyAdded }" @click="toggleSubject(subj)">
              <div class="check-box" :class="{ checked: isChecked(subj) }">
                <Icon name="check" v-if="isChecked(subj)" />
              </div>
              <div class="subject-info">
                <span class="subject-name">{{ t(subj.name) }}</span>
                <span class="subject-meta">共 {{ subj.count }} 题</span>
              </div>
              <span v-if="subj.alreadyAdded" class="added-tag">已添加</span>
            </div>
          </template>
          <div class="empty-state" v-if="groupedSubjects.length === 0">暂无科目</div>
        </div>
      </div>

      <!-- 配置面板 -->
      <div v-show="activeTab === 'config'" class="config-panel">
        <div class="config-summary">
          <span>共 {{ totalPickCount }} 题</span>
          <span>总分 {{ totalScore }}</span>
        </div>
        <div v-for="item in checkedList" :key="getItemKey(item)" class="config-card">
          <div class="config-card-header">
            <span class="config-name">{{ t(item.subject) }}
              <span class="stepper-max">共{{ item.count }}题</span>
            </span>
            <span class="config-subtotal">{{ item.pickCount }} 题 · {{ item.pickCount * item.score }} 分</span>
          </div>
          <div class="config-controls">
            <div class="stepper-group">
              <span class="stepper-label">该科题量</span>
              <div class="stepper">
                <button class="stepper-btn" @click="adjustValue(item, 'pickCount', -1)"
                  :disabled="item.pickCount <= 1">−</button>
                <input class="stepper-input" type="number" :value="item.pickCount" @change="setPickCount(item, $event)"
                  :max="item.count" min="1" />
                <button class="stepper-btn" @click="adjustValue(item, 'pickCount', 1)"
                  :disabled="item.pickCount >= item.count">+</button>
              </div>

            </div>
            <div class="stepper-group">
              <span class="stepper-label">每题分值</span>
              <div class="stepper">
                <button class="stepper-btn" @click="adjustValue(item, 'score', -1)"
                  :disabled="item.score <= 1">−</button>
                <input class="stepper-input" type="number" :value="item.score" @change="setScore(item, $event)"
                  min="1" />
                <button class="stepper-btn" @click="adjustValue(item, 'score', 1)">+</button>
              </div>
              <!-- <span class="stepper-max">分/题</span> -->
            </div>
          </div>
        </div>

      </div>
    </div>

    <template #footer>
      <button v-if="activeTab === 'select'" class="action-btn" :disabled="checkedList.length === 0"
        @click="activeTab = 'config'">
        去配置 {{ checkedList.length > 0 ? `(${checkedList.length})` : '' }}
      </button>
      <button v-else class="action-btn confirm" @click="handleConfirm">
        确认添加 ({{ checkedList.length }})
      </button>
    </template>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '@/infrastructure/utils/i18n'
import { useAppStore } from '@/domain/stores/store'
import BottomSheet from '@/presentation/components/ui/BottomSheet.vue'
import Icon from '@/presentation/components/ui/Icon.vue'

const props = defineProps({
  modelValue: Boolean,
  bankMeta: { type: Object, default: () => ({}) },
  existingSubjects: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'add-multiple'])

const activeTab = ref('select')
const activeCategory = ref('')
const checkedMap = ref(new Map())

const categoryList = computed(() => {
  const store = useAppStore()
  const meta = store.bankMeta
  return Object.entries(meta).map(([key, info]) => {
    const total = Object.values(info.subjects || {}).reduce((sum, s) => sum + (s.count || 0), 0)
    return { key, total }
  })
})

const groupedSubjects = computed(() => {
  if (!activeCategory.value) return []
  const store = useAppStore()
  const catMeta = store.bankMeta[activeCategory.value]
  if (!catMeta) return []

  const groups = {}
  for (const [name, info] of Object.entries(catMeta.subjects || {})) {
    const scope = info.scope
    if (!groups[scope]) groups[scope] = []
    groups[scope].push({
      name,
      count: info.count,
      scope,
      alreadyAdded: props.existingSubjects.some(
        s => s.subject === name && s.category === activeCategory.value && s.scope === scope
      )
    })
  }
  return Object.entries(groups).map(([scope, items]) => ({ scope, items }))
})

const checkedList = computed(() => Array.from(checkedMap.value.values()))

const totalPickCount = computed(() =>
  checkedList.value.reduce((sum, item) => sum + (item.pickCount || 10), 0)
)

const totalScore = computed(() =>
  checkedList.value.reduce((sum, item) => sum + (item.pickCount || 10) * (item.score || 1), 0)
)

function getKey(subj) {
  return `${activeCategory.value}|${subj.scope}|${subj.name}`
}

function getItemKey(item) {
  return `${item.category}|${item.scope}|${item.subject}`
}

function isChecked(subj) {
  return checkedMap.value.has(getKey(subj))
}

function toggleSubject(subj) {
  const key = getKey(subj)
  const newMap = new Map(checkedMap.value)
  if (subj.alreadyAdded && newMap.has(key)) {
    // 已添加的科目点击直接跳到配置页
    activeTab.value = 'config'
    return
  }
  if (newMap.has(key)) {
    newMap.delete(key)
  } else {
    newMap.set(key, {
      category: activeCategory.value,
      scope: subj.scope,
      subject: subj.name,
      count: subj.count,
      pickCount: Math.min(10, subj.count),
      score: 1
    })
  }
  checkedMap.value = newMap
}

function uncheck(item) {
  const newMap = new Map(checkedMap.value)
  newMap.delete(getItemKey(item))
  checkedMap.value = newMap
}

function adjustValue(item, field, delta) {
  const key = getItemKey(item)
  const newMap = new Map(checkedMap.value)
  const entry = { ...newMap.get(key) }
  const current = entry[field] || (field === 'pickCount' ? 10 : 2)
  const newVal = current + delta
  if (field === 'pickCount') {
    entry[field] = Math.max(1, Math.min(newVal, item.count))
  } else {
    entry[field] = Math.max(1, newVal)
  }
  newMap.set(key, entry)
  checkedMap.value = newMap
}

function setPickCount(item, event) {
  const val = parseInt(event.target.value) || 1
  const key = getItemKey(item)
  const newMap = new Map(checkedMap.value)
  const entry = { ...newMap.get(key) }
  entry.pickCount = Math.max(1, Math.min(val, item.count))
  newMap.set(key, entry)
  checkedMap.value = newMap
}

function setScore(item, event) {
  const val = parseInt(event.target.value) || 1
  const key = getItemKey(item)
  const newMap = new Map(checkedMap.value)
  const entry = { ...newMap.get(key) }
  entry.score = Math.max(1, val)
  newMap.set(key, entry)
  checkedMap.value = newMap
}

function switchCategory(key) {
  activeCategory.value = key
}

function setDefault() {
  const store = useAppStore()
  const meta = store.bankMeta
  activeCategory.value = Object.keys(meta)[0] || ''
  checkedMap.value = new Map()
  activeTab.value = 'select'
  // 预加载已有科目到 checkedMap
  for (const subj of props.existingSubjects) {
    const key = `${subj.category}|${subj.scope}|${subj.subject}`
    checkedMap.value.set(key, {
      category: subj.category,
      scope: subj.scope,
      subject: subj.subject,
      count: subj.maxCount || subj.count,
      pickCount: subj.count,
      score: subj.score || 1
    })
  }
}

watch(() => props.modelValue, (val) => {
  if (val) setDefault()
}, { immediate: true })

function close() {
  emit('update:modelValue', false)
}

function handleConfirm() {
  if (checkedList.value.length === 0) return
  emit('add-multiple', checkedList.value.map(item => ({
    category: item.category,
    scope: item.scope,
    subject: item.subject,
    count: item.count,
    pickCount: item.pickCount || 10,
    score: item.score || 1
  })))
  checkedMap.value = new Map()
  activeTab.value = 'select'
  close()
}
</script>

<style scoped>
/* Header tabs */
.header-tabs {
  display: flex;
  gap: 4px;
  background: var(--background-secondary);
  padding: 3px;
  border-radius: 12px;
  width: 100%;
  max-width: 260px;
}

.tab-btn {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}

.tab-btn.active {
  background: var(--primary);
  color: #fff;
  font-weight: var(--font-weight-semibold);
  box-shadow: 0 2px 8px rgba(0, 91, 191, 0.2);
}

.tab-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.tab-badge {
  font-size: 11px;
  min-width: 18px;
  text-align: center;
  background: rgba(255, 255, 255, 0.25);
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: var(--font-weight-bold);
}

.tab-btn:not(.active) .tab-badge {
  background: var(--primary-light);
  color: var(--primary);
}

/* Container */
.picker-container {
  display: flex;
  flex-direction: column;
  height: 62vh;
  max-height: 62vh;
}

.picker-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
  margin: -12px -16px;
}

.nav-column {
  width: 86px;
  flex-shrink: 0;
  background: var(--background-secondary);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.nav-column::-webkit-scrollbar {
  display: none;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 14px 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.18s ease;
}

.nav-item.active {
  background: var(--background);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 22px;
  background: var(--primary);
  border-radius: 0 3px 3px 0;
}

.nav-label {
  font-size: var(--font-size-sm);
  color: var(--on-surface);
  text-align: center;
  line-height: 1.3;
}

.nav-item.active .nav-label {
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}

.nav-count {
  font-size: 11px;
  color: var(--text-disabled);
}

.content-column {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 8px 60px;
  background: var(--background);
}

.scope-header {
  padding: 10px 8px 6px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-semibold);
  position: sticky;
  top: 0;
  background: var(--background);
  z-index: 1;
}

.subject-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 10px;
  margin: 2px 0;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.12s;
}

.subject-item:active:not(.disabled) {
  background: var(--background-secondary);
}

.subject-item.checked {
  background: var(--primary-light);
}

.subject-item.added {
  border-left: 3px solid var(--primary);
  padding-left: 7px;
}

.check-box {
  width: 22px;
  height: 22px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.18s ease;
}

.check-box.checked {
  background: var(--primary);
  border-color: var(--primary);
}

.check-box.checked svg {
  color: #fff;
  font-size: 14px;
}

.subject-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.subject-name {
  font-size: var(--font-size-md);
  color: var(--on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subject-meta {
  font-size: var(--font-size-sm);
  color: var(--text-disabled);
  white-space: nowrap;
  margin-left: 8px;
}

.added-tag {
  font-size: 11px;
  color: var(--text-disabled);
  background: var(--background-secondary);
  padding: 2px 8px;
  border-radius: 10px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--text-disabled);
  font-size: var(--font-size-sm);
}

/* === 配置面板 === */
.config-panel {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 4px 4px 60px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.config-card {
  background: var(--background);
  border-radius: 14px;
  padding: 14px 16px;
  border: 1px solid var(--border-color-light);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.config-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color-light);
}

.config-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  flex: 1;
}

.config-subtotal {
  font-size: 12px;
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
  background: var(--primary-light);
  padding: 3px 10px;
  border-radius: 12px;
  white-space: nowrap;
}

.config-controls {
  display: flex;
  justify-content: space-between;
  /* flex-direction: column; */
  gap: 10px;
}

.stepper-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stepper-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  width: 28px;
  flex-shrink: 0;
  font-weight: var(--font-weight-medium);
}

.stepper {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--background);
  flex-shrink: 0;
}

.stepper-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--background-secondary);
  color: var(--on-surface);
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all 0.12s;
  user-select: none;
}

.stepper-btn:active:not(:disabled) {
  background: var(--primary-light);
  color: var(--primary);
}

.stepper-btn:disabled {
  opacity: 0.25;
  cursor: default;
}

.stepper-input {
  width: 38px;
  height: 32px;
  border: none;
  border-left: 1px solid var(--border-color-light);
  border-right: 1px solid var(--border-color-light);
  text-align: center;
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  color: var(--on-surface);
  background: var(--background);
  -moz-appearance: textfield;
}

.stepper-input::-webkit-outer-spin-button,
.stepper-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.stepper-max {
  font-size: 12px;
  color: var(--text-disabled);
  white-space: nowrap;
}

.config-summary {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 16px;
  background: var(--background-surface);
  border-radius: 12px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.config-summary span {
  color: var(--primary);
  font-weight: var(--font-weight-bold);
}

/* 底部按钮 */
.action-btn {
  width: 100%;
  padding: 14px 24px;
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: 24px;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.25);
}

.action-btn:disabled {
  background: var(--color-gray-300, #d1d5db);
  box-shadow: none;
  cursor: default;
}

.action-btn:active:not(:disabled) {
  transform: scale(0.96);
}
</style>
