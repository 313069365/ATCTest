<template>
  <BottomSheet :visible="modelValue" @close="close">
    <template #header>
      <span class="header-title">选择科目</span>
    </template>

    <div class="picker-container">
      <!-- 主体：左右分栏 -->
      <div class="picker-body">
        <!-- 左侧分类导航 -->
        <div class="nav-column">
          <div v-for="cat in categoryList" :key="cat.key" class="nav-item"
            :class="{ active: activeCategory === cat.key }" @click="switchCategory(cat.key)">
            <span class="nav-label">{{ t(cat.key) }}</span>
            <span class="nav-count">{{ cat.total }}</span>
          </div>
        </div>

        <!-- 右侧科目列表 -->
        <div class="content-column">
          <!-- 范围分组 -->
          <template v-for="group in groupedSubjects" :key="group.scope">
            <div class="scope-header">{{ t(group.scope) }}</div>
            <div v-for="subj in group.items" :key="subj.name" class="subject-item"
              :class="{ checked: isChecked(subj), disabled: subj.alreadyAdded }" @click="toggleSubject(subj)">
              <div class="check-box" :class="{ checked: isChecked(subj), disabled: subj.alreadyAdded }">
                <Icon name="check" v-if="isChecked(subj)" />
              </div>
              <div class="subject-info">
                <span class="subject-name">{{ t(subj.name) }}</span>
                <span class="subject-meta">共 {{ subj.count }} 题</span>
              </div>
              <span v-if="subj.alreadyAdded" class="added-tag">已添加</span>
            </div>
          </template>

          <div class="empty-state" v-if="groupedSubjects.length === 0">
            暂无科目
          </div>
        </div>
      </div>

      <!-- 已选科目展开区（只显示 X 按钮） -->
      <div class="selection-bar" v-if="showSelectionPanel && checkedList.length > 0">
        <div v-for="item in checkedList" :key="getKey(item)" class="selection-dot" @click="uncheck(item)"
          :title="t(item.subject)">
          <Icon name="close" />
        </div>
      </div>
    </div>

    <!-- 底部确认按钮 -->
    <template #footer>
      <button class="confirm-btn" :disabled="checkedList.length === 0" @click="handleConfirm">
        确认添加 {{ checkedList.length > 0 ? `(${checkedList.length})` : '' }}
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

const activeCategory = ref('')
const checkedMap = ref(new Map()) // key: "cat|scope|name" -> { category, scope, subject, count }
const showSelectionPanel = ref(false)

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

function getKey(item) {
  return `${activeCategory.value}|${item.scope}|${item.name}`
}

function isChecked(item) {
  return checkedMap.value.has(getKey(item))
}

function toggleSubject(subj) {
  if (subj.alreadyAdded) return
  const key = getKey(subj)
  const newMap = new Map(checkedMap.value)
  if (newMap.has(key)) {
    newMap.delete(key)
  } else {
    newMap.set(key, {
      category: activeCategory.value,
      scope: subj.scope,
      subject: subj.name,
      count: subj.count
    })
  }
  checkedMap.value = newMap
}

function uncheck(item) {
  const newMap = new Map(checkedMap.value)
  newMap.delete(`${item.category}|${item.scope}|${item.subject}`)
  checkedMap.value = newMap
}

function toggleSelectionPanel() {
  if (checkedList.value.length > 0) {
    showSelectionPanel.value = !showSelectionPanel.value
  }
}

function switchCategory(key) {
  activeCategory.value = key
}

function setDefault() {
  const store = useAppStore()
  const meta = store.bankMeta
  activeCategory.value = Object.keys(meta)[0] || ''
  checkedMap.value = new Map()
  showSelectionPanel.value = false
}

watch(() => props.modelValue, (val) => {
  if (val) setDefault()
}, { immediate: true })

function close() {
  emit('update:modelValue', false)
}

function handleConfirm() {
  if (checkedList.value.length === 0) return
  emit('add-multiple', checkedList.value)
  checkedMap.value = new Map()
  showSelectionPanel.value = false
  close()
}
</script>

<style scoped>
.picker-container {
  display: flex;
  flex-direction: column;
  height: 73vh;
  max-height: 70vh;
}

.header-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

/* 主体：左右分栏 */
.picker-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
  background: var(--surface);
  margin: -12px -16px;
}

/* 左侧分类导航（饿了么风格） */
.nav-column {
  width: 90px;
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
  background: var(--surface);
  font-weight: var(--font-weight-semibold);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--primary);
  border-radius: 0 3px 3px 0;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-50%) scaleY(0);
  }

  to {
    transform: translateY(-50%) scaleY(1);
  }
}

.nav-label {
  font-size: var(--font-size-sm);
  color: var(--on-surface);
  text-align: center;
  line-height: 1.2;
}

.nav-item.active .nav-label {
  color: var(--primary);
}

.nav-count {
  font-size: 11px;
  color: var(--text-disabled);
}

/* 右侧科目列表 */
.content-column {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border-left: 1px solid var(--border-color-light);
  padding: 0px 8px;
  background: var(--background-secondary);
}

.scope-header {
  padding: 10px 8px 6px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-semibold);
  position: sticky;
  top: 0;
  background: var(--background-secondary);
  z-index: 1;
}

.subject-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px;
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

.subject-item.disabled {
  opacity: 0.45;
  cursor: default;
}

/* 复选框 */
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
  box-shadow: 0 2px 6px rgba(0, 91, 191, 0.3);
}

.check-box.checked svg {
  color: #fff;
  font-size: 14px;
  animation: checkPop 0.2s ease;
}

@keyframes checkPop {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

/* 科目信息 */
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
  white-space: nowrap;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--text-disabled);
  font-size: var(--font-size-sm);
}

/* 已选科目展开区（只显示 X 按钮） */
.selection-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 16px;
  background: var(--surface);
  border-top: 1px solid var(--border-color-light);
  flex-shrink: 0;
  max-height: 60px;
  overflow-y: auto;
}

.selection-dot {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border: 1px solid var(--primary);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s;
}

.selection-dot svg {
  font-size: 14px;
  color: var(--primary);
}

.selection-dot:active {
  background: var(--error);
  border-color: var(--error);
  transform: scale(0.9);
}

.selection-dot:active svg {
  color: #fff;
}

/* 底部确认按钮（在 BottomSheet footer slot 内） */
.confirm-btn {
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

.confirm-btn:disabled {
  background: var(--color-gray-300, #d1d5db);
  box-shadow: none;
  cursor: default;
}

.confirm-btn:active:not(:disabled) {
  transform: scale(0.96);
  box-shadow: 0 2px 8px rgba(0, 91, 191, 0.3);
}
</style>
