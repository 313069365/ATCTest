<template>
  <footer class="footer">
    <button class="nav-btn prev" :disabled="prevDisabled" @click="$emit('prev')">
      <span class="material-symbols-outlined">chevron_left</span>
      上一题
    </button>

    <button v-if="!isLast" class="nav-btn next" @click="$emit('next')">
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
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 368px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) 2px;
  z-index: var(--z-fixed);
  box-sizing: border-box;
  overflow: hidden;
}

.nav-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48%;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-full);
  color: var(--primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.nav-btn:active {
  transform: scale(0.96);
  opacity: 0.9;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-btn.prev:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: var(--primary);
  cursor: not-allowed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transform: none;
}

.nav-btn.submit {
  background: rgba(255, 255, 255, 0.2);
  color: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
