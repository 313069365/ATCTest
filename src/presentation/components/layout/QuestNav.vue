<template>
  <footer class="footer">
    <SubPager :sub-count="subCount" :current-sub-index="currentSubIndex" :sub-statuses="subStatuses"
      @go-sub="(i) => $emit('goSub', i)" />
    <div class="nav-row">
      <button class="nav-btn prev" :disabled="prevDisabled && !(subCount > 0 && currentSubIndex > 0)"
        @click="handlePrev">
        <Icon name="chevron-left" />
        {{ subCount > 0 && currentSubIndex > 0 ? '上一小题' : '上一题' }}
      </button>
      <button class="nav-btn next" :disabled="nextDisabled" @click="handleNext">
        {{ subCount > 0 && currentSubIndex
          < subCount - 1 ? '下一小题' : '下一题' }} <Icon name="chevron-right" />
      </button>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '@/presentation/components/common/Icon.vue'
import SubPager from '@/presentation/components/layout/SubPager.vue'

const props = defineProps({
  prevDisabled: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  subCount: { type: Number, default: 0 },
  currentSubIndex: { type: Number, default: 0 },
  subStatuses: { type: Array, default: () => [] }
})

const emit = defineEmits(['prev', 'next', 'goSub'])

const nextDisabled = computed(() => {
  if (props.isLast) {
    if (props.subCount > 0) return props.currentSubIndex >= props.subCount - 1
    return true
  }
  return false
})

const handlePrev = () => {
  if (props.subCount > 0 && props.currentSubIndex > 0) {
    emit('goSub', props.currentSubIndex - 1)
  } else {
    emit('prev')
  }
}

const handleNext = () => {
  if (props.subCount > 0 && props.currentSubIndex < props.subCount - 1) {
    emit('goSub', props.currentSubIndex + 1)
  } else {
    emit('next')
  }
}

</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--app-max-width);
  display: flex;
  flex-direction: column;
  padding: 0 2px;
  z-index: var(--z-fixed);
  box-sizing: border-box;
}

.nav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-mn);
  background: var(--background);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-mn);
  flex: 1;
  padding: var(--spacing-smd);
  margin: var(--spacing-mn) var(--spacing-smd);
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  color: var(--primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.nav-btn:active {
  opacity: 0.8;
}

.nav-btn:hover {
  background: var(--primary-light);
  box-shadow: var(--shadow-md);
}

.nav-btn:disabled {
  background: var(--color-gray-200);
  color: var(--text-disabled);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
</style>
