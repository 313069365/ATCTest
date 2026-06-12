<template>
  <BottomSheet :visible="visible" :title="t('configurePreset')" @close="$emit('close')">
    <div class="preset-config">
      <div class="subject-list">
        <div v-for="(item, idx) in localSubjects" :key="idx" class="subject-item">
          <label class="subject-check">
            <input type="checkbox" v-model="item.checked" />
            <span class="check-mark"></span>
          </label>
          <span class="subject-name">{{ t(item.subject) }}</span>
          <input type="number" class="count-input" v-model.number="item.count" min="1" :max="item.maxCount" />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="config-footer">
        <span class="footer-summary">{{ t('total') }} {{ totalChecked }}{{ t('questions') }}</span>
        <button class="apply-btn" @click="apply">{{ t('apply') }}</button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '@/infrastructure/utils/i18n'
import BottomSheet from '@/presentation/components/ui/BottomSheet.vue'
import Icon from '@/presentation/components/ui/Icon.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  bankMeta: { type: Object, default: () => ({}) },
  subjects: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'apply'])

const localSubjects = ref([])

watch(() => props.visible, (v) => {
  if (v) {
    localSubjects.value = props.subjects.map(s => ({
      ...s,
      checked: true,
    }))
  }
})

const totalChecked = computed(() => {
  return localSubjects.value
    .filter(s => s.checked)
    .reduce((sum, s) => sum + (s.count || 0), 0)
})

function apply() {
  const items = localSubjects.value
    .filter(s => s.checked)
    .map(s => ({
      category: s.category,
      scope: s.scope,
      subject: s.subject,
      subjectName: s.subject,
      bankName: s.bankName,
      count: s.count || Math.min(10, s.maxCount),
      score: s.score || 1,
      maxCount: s.maxCount,
    }))
  emit('apply', items)
  emit('close')
}
</script>

<style scoped>
.preset-config {
  padding: 0;
}

.subject-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.subject-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}

.subject-item + .subject-item {
  border-top: 1px solid var(--border-color-light);
}

.subject-check {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.subject-check input {
  display: none;
}

.check-mark {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.subject-check input:checked + .check-mark {
  background: var(--primary);
  border-color: var(--primary);
}

.subject-check input:checked + .check-mark::after {
  content: '';
  width: 6px;
  height: 10px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-top: -2px;
}

.subject-name {
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-sm);
  color: var(--on-surface);
}

.count-input {
  width: 56px;
  padding: 6px 4px;
  text-align: center;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--background);
  font-size: 14px;
  color: var(--on-surface);
  flex-shrink: 0;
}

.count-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 91, 191, 0.12);
}

.config-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.footer-summary {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.apply-btn {
  padding: 10px 28px;
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: 10px;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.15s;
}

.apply-btn:active {
  transform: scale(0.97);
}
</style>
