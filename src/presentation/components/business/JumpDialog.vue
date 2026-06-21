<template>
  <div class="jump-dialog-overlay" v-if="visible" @click.self="$emit('close')">
    <div class="jump-dialog">
      <h3 class="jump-dialog-title">跳转题目</h3>
      <p class="jump-dialog-desc">输入题目序号（1-{{ total }}）</p>
      <input ref="inputRef" v-model="inputValue" type="number" :min="1" :max="total"
        class="jump-dialog-input" @keydown.enter="handleConfirm" @keydown.esc="$emit('close')" />
      <div class="jump-dialog-actions">
        <button class="jump-dialog-btn cancel" @click="$emit('close')">取消</button>
        <button class="jump-dialog-btn confirm" @click="handleConfirm">跳转</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  visible: Boolean,
  total: { type: Number, required: true },
  current: { type: Number, required: true },
  onJump: { type: Function, default: null },
})

const emit = defineEmits(['close'])

const inputValue = ref('')
const inputRef = ref(null)

watch(() => props.visible, (val) => {
  if (val) {
    inputValue.value = String(props.current + 1)
    nextTick(() => inputRef.value?.focus())
  }
})

function handleConfirm() {
  const num = parseInt(inputValue.value)
  if (isNaN(num)) {
    emit('close')
    return
  }
  const idx = Math.max(1, Math.min(num, props.total)) - 1
  props.onJump?.(idx)
  emit('close')
}
</script>

<style scoped>
.jump-dialog-overlay {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--app-max-width);
  top: 0;
  bottom: 0;
  background: var(--color-overlay-medium);
  z-index: var(--z-popup);
  display: flex;
  align-items: center;
  justify-content: center;
}

.jump-dialog {
  background: var(--color-background);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  width: 280px;
  box-shadow: var(--shadow-lg);
}

.jump-dialog-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
}

.jump-dialog-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.jump-dialog-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 2px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  text-align: center;
  outline: none;
  background: var(--color-background);
  color: var(--color-text);
  -moz-appearance: textfield;
  box-sizing: border-box;
}

.jump-dialog-input:focus {
  border-color: var(--color-primary);
}

.jump-dialog-input::-webkit-outer-spin-button,
.jump-dialog-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.jump-dialog-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

.jump-dialog-btn {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  border: none;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.15s;
}

.jump-dialog-btn.cancel {
  background: var(--gray-200);
  color: var(--color-text-secondary);
}

.jump-dialog-btn.confirm {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}
</style>
