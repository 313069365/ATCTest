<template>
  <footer class="footer">
    <button class="nav-btn prev" :disabled="prevDisabled" @click="$emit('prev')">
      <span class="material-symbols-outlined">chevron_left</span>
      上一题
      <span>　</span>
    </button>

    <button v-if="!isLast" class="nav-btn next" @click="$emit('next')">
      <span>　</span>
      下一题
      <span class="material-symbols-outlined">chevron_right</span>
    </button>

    <button v-else class="nav-btn submit" @click="$emit('submit')">
      {{ submitText }}
      <span class="material-symbols-outlined">check</span>
    </button>
  </footer>
</template>

<script setup>
defineProps({
  prevDisabled: {
    type: Boolean,
    default: false
  },
  isLast: {
    type: Boolean,
    default: false
  },
  submitText: {
    type: String,
    default: '完成'
  }
})

defineEmits(['prev', 'next', 'submit'])
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--background);
  width: 100%;
  max-width: var(--app-max-width);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) 2px;
  z-index: var(--z-fixed);
  box-sizing: border-box;
  overflow: hidden;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
  padding: 10px;
  margin: var(--spacing-mn) var(--spacing-md);
  background: var(--surface-variant);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.nav-btn:active {
  transform: scale(0.96);
  opacity: 0.9;
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
</style>
