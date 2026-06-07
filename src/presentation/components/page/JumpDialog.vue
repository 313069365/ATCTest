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
})

const emit = defineEmits(['close', 'jump'])

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
  emit('jump', idx)
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
  background: rgba(0, 0, 0, 0.4);
  z-index: var(--z-popup);
  display: flex;
  align-items: center;
  justify-content: center;
}

.jump-dialog {
  background: var(--background);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  width: 280px;
  box-shadow: var(--shadow-lg);
}

.jump-dialog-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.jump-dialog-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.jump-dialog-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--border-color-strong);
  border-radius: var(--radius-md);
  font-size: var(--font-size-lg);
  font-weight: 700;
  text-align: center;
  outline: none;
  background: var(--background);
  color: var(--text-primary);
  -moz-appearance: textfield;
  box-sizing: border-box;
}

.jump-dialog-input:focus {
  border-color: var(--primary);
}

.jump-dialog-input::-webkit-outer-spin-button,
.jump-dialog-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.jump-dialog-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

.jump-dialog-btn {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-full);
  border: none;
  font-size: var(--font-size-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.jump-dialog-btn.cancel {
  background: var(--color-gray-200);
  color: var(--text-secondary);
}

.jump-dialog-btn.confirm {
  background: var(--primary);
  color: #fff;
}
</style>
