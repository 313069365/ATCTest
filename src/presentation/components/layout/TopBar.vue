<template>
  <header class="top-bar" :class="variant">
    <div class="left">
      <slot name="left">
        <button v-if="showBack" class="icon-btn" @click="$emit('back')">
          <Icon :name="backIcon" />
        </button>
      </slot>
    </div>
    <slot name="title">
      <h1 class="title">{{ title }}</h1>
    </slot>
    <div class="right">
      <slot name="right" />
    </div>
  </header>
</template>

<script setup>
import Icon from '@/presentation/components/common/Icon.vue'

defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: false },
  backIcon: { type: String, default: 'arrow-back' },
  variant: { type: String, default: 'default' }
})

defineEmits(['back'])
</script>

<style scoped>
.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--topbar-bg, var(--color-background));
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  height: 56px;
  border-bottom: 1px solid var(--color-border);
  box-sizing: border-box;
  flex-shrink: 0;
}

.top-bar.transparent {
  background: transparent;
  backdrop-filter: none;
  border-bottom: none;
}

.top-bar.primary {
  --topbar-color: var(--color-primary-foreground);
  background: var(--color-primary);
  border-bottom: none;
}

.left,
.right {
  min-width: 44px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.left {
  justify-content: flex-start;
  margin-left: 0;
}

.right {
  justify-content: flex-end;
  margin-right: 0;
}

.title {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--topbar-color, var(--color-text));
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--topbar-color, var(--color-text-secondary));
  font-size: var(--font-size-xl);
}

.icon-btn:active {
  background: var(--gray-400);
}

.right :deep(.icon-btn) {
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--topbar-color, var(--color-text-secondary));
  font-size: var(--font-size-xl);
}

.right :deep(.icon-btn:active) {
  background: var(--gray-400);
}
</style>
