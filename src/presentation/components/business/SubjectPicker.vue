<template>
  <BottomSheet :visible="modelValue" @close="close">
    <template #header>
      <span class="header-title">选择科目</span>
      <span class="header-count" v-if="checkedList.length > 0">已选 {{ checkedList.length }} 科 · {{ totalPickCount }} 题 ·
        {{ totalScore }} 分</span>
    </template>

    <div class="picker-container">
      <!-- 选题面板 -->
      <div class="select-panel">
        <!-- 题库标签行 -->
        <div class="filter-row">
          <div class="filter-scroll">
            <button v-for="cat in categoryList" :key="cat.key" class="filter-chip"
              :class="{ active: activeCategory === cat.key }" @click="switchCategory(cat.key)">
              {{ t(cat.key) }}
            </button>
          </div>
        </div>

        <!-- 分类标签行 -->
        <div class="filter-row" v-if="scopeList.length > 1">
          <div class="filter-scroll">
            <button v-for="scope in scopeList" :key="scope.name" class="filter-chip"
              :class="{ active: activeScope === scope.name }" @click="activeScope = scope.name">
              {{ t(scope.name) }}
            </button>
          </div>
        </div>

        <!-- 科目列表 -->
        <div class="subject-list">
          <div v-for="subj in filteredSubjects" :key="subj.name" class="subject-card"
            :class="{ checked: isChecked(subj) }">
            <!-- 第一行：选择区 -->
            <div class="card-row-top" @click="toggleSubject(subj)">
              <div class="check-box" :class="{ checked: isChecked(subj) }">
                <Icon name="check" v-if="isChecked(subj)" />
              </div>
              <span class="subject-name">{{ t(subj.name) }}</span>
              <span class="subject-meta">共 {{ subj.count }} 题</span>
            </div>
            <!-- 第二行：配置区（选中时显示） -->
            <div v-if="isChecked(subj)" class="card-row-config" @click.stop>
              <div class="inline-stepper">
                <span class="inline-label">题量</span>
                <div class="stepper">
                  <button class="stepper-btn" @click="adjustValue(getCheckedItem(subj), 'pickCount', -1)"
                    :disabled="getPickCount(subj) <= 1">−</button>
                  <input class="stepper-input" type="number" :value="getPickCount(subj)"
                    @change="setPickCount(getCheckedItem(subj), $event)" :max="subj.count" min="1" />
                  <button class="stepper-btn" @click="adjustValue(getCheckedItem(subj), 'pickCount', 1)"
                    :disabled="getPickCount(subj) >= subj.count">+</button>
                </div>
              </div>
              <div class="config-divider"></div>
              <div class="inline-stepper">
                <span class="inline-label">分值</span>
                <div class="stepper">
                  <button class="stepper-btn" @click="adjustValue(getCheckedItem(subj), 'score', -1)"
                    :disabled="getScore(subj) <= 1">−</button>
                  <input class="stepper-input" type="number" :value="getScore(subj)"
                    @change="setScore(getCheckedItem(subj), $event)" min="1" />
                  <button class="stepper-btn" @click="adjustValue(getCheckedItem(subj), 'score', 1)">+</button>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-state" v-if="filteredSubjects.length === 0">暂无科目</div>
        </div>
      </div>

      <!-- 配置面板已合并到科目列表右侧 -->
    </div>

    <template #footer>
      <button class="action-btn confirm" :disabled="checkedList.length === 0" @click="handleConfirm">
        确认添加 ({{ checkedList.length }})
      </button>
    </template>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '@/infrastructure/utils/i18n'
import { useAppStore } from '@/domain/stores/store'
import BottomSheet from '@/presentation/components/common/BottomSheet.vue'
import Icon from '@/presentation/components/common/Icon.vue'

const props = defineProps({
  modelValue: Boolean,
  bankMeta: { type: Object, default: () => ({}) },
  existingSubjects: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'add-multiple'])

const activeCategory = ref('')
const activeScope = ref('')
const checkedMap = ref(new Map())

const categoryList = computed(() => {
  const store = useAppStore()
  const meta = store.bankMeta
  return Object.entries(meta).map(([key, info]) => {
    const total = Object.values(info.subjects || {}).reduce((sum, s) => sum + (s.count || 0), 0)
    return { key, total }
  })
})

// 当前分类下的范围列表
const scopeList = computed(() => {
  if (!activeCategory.value) return []
  const store = useAppStore()
  const catMeta = store.bankMeta[activeCategory.value]
  if (!catMeta) return []

  const scopes = {}
  for (const [name, info] of Object.entries(catMeta.subjects || {})) {
    const scope = info.scope
    if (!scopes[scope]) scopes[scope] = { name: scope, count: 0 }
    scopes[scope].count += info.count || 0
  }
  return Object.values(scopes)
})

// 过滤后的科目列表
const filteredSubjects = computed(() => {
  if (!activeCategory.value) return []
  const store = useAppStore()
  const catMeta = store.bankMeta[activeCategory.value]
  if (!catMeta) return []

  const result = []
  for (const [name, info] of Object.entries(catMeta.subjects || {})) {
    if (activeScope.value && info.scope !== activeScope.value) continue
    result.push({
      name,
      count: info.count,
      scope: info.scope,
    })
  }
  return result
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

function getCheckedItem(subj) {
  return checkedMap.value.get(getKey(subj))
}

function getPickCount(subj) {
  const item = getCheckedItem(subj)
  return item ? item.pickCount : 10
}

function getScore(subj) {
  const item = getCheckedItem(subj)
  return item ? item.score : 1
}

function toggleSubject(subj) {
  const key = getKey(subj)
  const newMap = new Map(checkedMap.value)
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
  // 自动选择第一个范围
  const store = useAppStore()
  const catMeta = store.bankMeta[key]
  if (catMeta) {
    const firstScope = Object.values(catMeta.subjects || {})[0]?.scope
    activeScope.value = firstScope || ''
  }
}

function setDefault() {
  const store = useAppStore()
  const meta = store.bankMeta
  const firstCat = Object.keys(meta)[0] || ''
  activeCategory.value = firstCat
  checkedMap.value = new Map()

  // 设置默认范围
  if (firstCat) {
    const catMeta = meta[firstCat]
    const firstScope = Object.values(catMeta.subjects || {})[0]?.scope
    activeScope.value = firstScope || ''
  }

  // 预加载已有科目
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
  close()
}
</script>

<style scoped>
.picker-container {
  display: flex;
  flex-direction: column;
  height: 62vh;
  max-height: 62vh;
}

/* 选题面板 */
.select-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 筛选行 */
.filter-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 4px;
  flex-shrink: 0;
}

.filter-scroll {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 4px 0;
}

.filter-scroll::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  display: flex;
  align-items: center;
  padding: var(--space-2xs) 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  flex-shrink: 0;
}

.filter-chip:active {
  transform: scale(0.96);
}

.filter-chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-primary-foreground);
  font-weight: var(--font-weight-semibold);
}

/* 科目列表 */
.subject-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 2px var(--space-2xs);
}

/* 科目卡片 */
.subject-card {
  margin: var(--space-2xs) 0;
  border-radius: var(--radius-lg);
  background: var(--color-background);
  border: 1.5px solid var(--color-border-light);
  transition: all 0.2s ease;
  overflow: hidden;
}

.subject-card.checked {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px var(--color-primary-bg);
}

/* 第一行：选择区 */
.card-row-top {
  display: flex;
  align-items: center;
  gap: var(--space-ms);
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.card-row-top:active {
  background: var(--color-muted);
}

.subject-card.checked .card-row-top {
  background: var(--color-primary-bg);
}

/* 复选框 */
.check-box {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.check-box.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 1px 4px var(--color-primary-bg);
}

.check-box.checked svg {
  color: var(--color-primary-foreground);
  font-size: var(--font-size-sm);
}

/* 科目名 */
.subject-name {
  flex: 1;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.subject-meta {
  font-size: var(--font-size-sm);
  color: var(--color-disabled);
  flex-shrink: 0;
}

/* 第二行：配置区 */
.card-row-config {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--color-primary-bg);
  border-top: 1px solid var(--color-border-light);
}

.config-divider {
  width: 1px;
  height: 24px;
  background: var(--color-border-light);
  flex-shrink: 0;
}

.inline-stepper {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.inline-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--color-disabled);
  font-size: var(--font-size-md);
}

/* 步进器 */
.stepper {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-background);
  flex-shrink: 0;
}

.stepper-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--color-muted);
  color: var(--color-text);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all 0.12s;
  user-select: none;
}

.stepper-btn:active:not(:disabled) {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.stepper-btn:disabled {
  opacity: 0.25;
  cursor: default;
}

.stepper-input {
  width: 32px;
  height: 28px;
  border: none;
  border-left: 1px solid var(--color-border-light);
  border-right: 1px solid var(--color-border-light);
  text-align: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  background: var(--color-background);
  -moz-appearance: textfield;
}

.stepper-input::-webkit-outer-spin-button,
.stepper-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

/* Header */
.header-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.header-count {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  margin-left: auto;
}

/* 底部按钮 */
.action-btn {
  width: 60%;
  margin: 0 auto;
  padding: 12px 24px;
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border: none;
  border-radius: 24px;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  transition: opacity 0.2s, transform 0.15s;
}

.action-btn:disabled {
  background: var(--gray-300, #d1d5db);
  cursor: default;
}

.action-btn:active:not(:disabled) {
  opacity: 0.85;
  transform: scale(0.97);
}
</style>
