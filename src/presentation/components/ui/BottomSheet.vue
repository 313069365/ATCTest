<template>
  <div class="sheet-overlay" v-if="visible" @click.self="$emit('close')">
    <div class="sheet-slider">
      <div class="drag-handle"></div>
      <div class="sheet-content">
        <header class="sheet-header">
          <slot name="header">
            <span class="sheet-title">{{ title }}</span>
          </slot>
        </header>

        <main class="sheet-body">
          <slot />
        </main>

        <footer class="sheet-footer" v-if="$slots.footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' }
})

defineEmits(['close'])
</script>

<style scoped>
.sheet-overlay {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--app-max-width);
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: var(--z-popup);
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.15s ease;
}

:global(.dark) .sheet-overlay {
  background: rgba(255, 255, 255, 0.12);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.sheet-slider {
  position: relative;
  width: 100%;
  animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-content {
  background: var(--background-secondary);
  width: 100%;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  min-height: 70vh;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

.sheet-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px 12px;
  background: var(--background);
}

.drag-handle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -12px;
  width: 36px;
  height: 5px;
  border-radius: 3px;
  background: var(--color-gray-300);
}

.sheet-title {
  margin-top: 10px;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.sheet-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sheet-footer {
  padding: 16px 16px 20px;
  background: var(--background);
  border-top: 1px solid var(--border-color-light);
}
</style>
