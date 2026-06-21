<template>
  <div v-if="visible" class="confirm-overlay" @click.self="onCancel">
    <div class="confirm-dialog">
      <h3 v-if="title" class="confirm-title">{{ title }}</h3>
      <p class="confirm-message" style="white-space: pre-line">{{ message }}</p>
      <div class="confirm-actions">
        <button class="confirm-btn cancel" @click="onCancel">{{ cancelText }}</button>
        <button class="confirm-btn confirm" @click="onConfirm">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  title: { type: String, default: '提示' },
  message: { type: String, required: true },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
  onConfirm: { type: Function, default: null },
  onCancel: { type: Function, default: null },
})
</script>

<style scoped>
.confirm-overlay {
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

.confirm-dialog {
  background: var(--color-background);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  width: 280px;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.confirm-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
}

.confirm-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
  line-height: var(--line-height-normal);
}

.confirm-actions {
  display: flex;
  gap: var(--space-sm);
}

.confirm-btn {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  border: none;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.15s;
}

.confirm-btn.cancel {
  background: var(--gray-200);
  color: var(--color-text-secondary);
}

.confirm-btn.confirm {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}
</style>
