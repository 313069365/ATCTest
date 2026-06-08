<template>
  <footer class="footer">
    <div class="sub-pager" v-if="subCount > 0">
      <button class="pager-btn arrow" @click="pagePrev" :class="{ dim: pageIndex === 0 }" v-if="subCount > MAX_VISIBLE">
        <Icon name="chevron-left" />
      </button>
      <button v-for="i in pageSlots" :key="i" class="pager-btn num"
        v-if="subCount > MAX_VISIBLE && pageStart + i - 1 < subCount" :class="subBtnClass(pageStart + i - 1)"
        @click="$emit('goSub', pageStart + i - 1)">
        {{ pageStart + i }}
      </button>
      <button v-for="(_, index) in subCount" :key="index" class="pager-btn num" v-if="subCount <= MAX_VISIBLE"
        :class="subBtnClass(index)" @click="$emit('goSub', index)">
        {{ index + 1 }}
      </button>
      <button class="pager-btn arrow" @click="pageNext" :class="{ dim: pageIndex >= maxPage }"
        v-if="subCount > MAX_VISIBLE">
        <Icon name="chevron-right" />
      </button>
    </div>
    <div class="nav-row">
      <button class="nav-btn prev" :disabled="prevDisabled && !(subCount > 0 && currentSubIndex > 0)"
        @click="handlePrev">
        <Icon name="chevron-left" />
        {{ subCount > 0 && currentSubIndex > 0 ? '上一小题' : '上一题' }}
      </button>
      <button v-if="!isLast || (subCount > 0 && currentSubIndex < subCount - 1)" class="nav-btn next"
        @click="handleNext">
        {{ subCount > 0 && currentSubIndex
          < subCount - 1 ? '下一小题' : '下一题' }} <Icon name="chevron-right" />
      </button>
      <button v-else class="nav-btn submit" @click="$emit('submit')">
        {{ submitText }}
        <Icon name="check" />
      </button>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Icon from '@/presentation/components/ui/Icon.vue'

const props = defineProps({
  prevDisabled: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  submitText: { type: String, default: '完成' },
  subCount: { type: Number, default: 0 },
  currentSubIndex: { type: Number, default: 0 },
  subStatuses: { type: Array, default: () => [] }
})

const emit = defineEmits(['prev', 'next', 'submit', 'goSub'])

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

const MAX_VISIBLE = 5
const pageSlots = 3
const pageIndex = ref(0)
const maxPage = computed(() => Math.max(0, Math.ceil(props.subCount / pageSlots) - 1))
const pageStart = computed(() => pageIndex.value * pageSlots)

const pagePrev = () => {
  if (pageIndex.value > 0) pageIndex.value--
}

const pageNext = () => {
  if (pageIndex.value < maxPage.value) pageIndex.value++
}

watch(() => props.subCount, () => { pageIndex.value = 0 })

watch(() => props.currentSubIndex, (idx) => {
  const newPage = Math.floor(idx / pageSlots)
  if (newPage !== pageIndex.value) pageIndex.value = newPage
})

const subBtnClass = (index) => {
  if (index === props.currentSubIndex) return ['current']
  const status = props.subStatuses[index]
  if (status === 'correct') return ['correct']
  if (status === 'wrong') return ['wrong']
  if (status === 'answered') return ['answered']
  return []
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

.sub-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 6px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-mn);
  flex: 1;
  padding: var(--spacing-smd);
  margin: var(--spacing-sm) var(--spacing-smd);
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
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
  background: var(--color-gray-100);
  box-shadow: var(--shadow-md);
}

.nav-btn.prev:disabled {
  background: var(--color-gray-200);
  color: var(--text-disabled);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.nav-btn.submit {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 91, 191, 0.3);
  border: none;
}

.pager-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.pager-btn.num {
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  cursor: pointer;
}

:global(.dark) .pager-btn.num {
  background: rgba(50, 50, 50, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}

.pager-btn.num:active {
  opacity: 0.8;
}

.pager-btn.num.current {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 91, 191, 0.3);
}

.pager-btn.num.correct {
  background: var(--success);
  color: #fff;
}

.pager-btn.num.wrong {
  background: var(--error);
  color: #fff;
}

.pager-btn.num.answered {
  background: var(--success-light);
  color: var(--success);
}

.pager-btn.arrow {
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.pager-btn.arrow:active {
  opacity: 0.7;
}

.pager-btn.arrow.dim {
  opacity: 0.2;
  pointer-events: none;
}

.pager-btn.arrow svg {
  font-size: 22px;
}
</style>
