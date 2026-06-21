<template>
  <div class="seg-control"
    :class="[variant === 'primary' ? 'variant-primary' : '', compact ? 'compact' : '', `size-${size}`]"
    :style="cssVars">
    <div class="seg-indicator"></div>
    <button v-for="opt in options" :key="opt.value" class="seg-option" :class="{ active: modelValue === opt.value }"
      :disabled="opt.disabled" @click="$emit('update:modelValue', opt.value)">
      <Icon v-if="opt.icon" :name="opt.icon" />
      <span class="seg-label">{{ opt.label }}</span>
      <span v-if="opt.badge != null" class="seg-badge">{{ opt.badge }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '@/presentation/components/common/Icon.vue'

const props = defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true },
  variant: { type: String, default: 'pill' },
  compact: { type: Boolean, default: false },
  size: { type: String, default: 'sm' }
})

defineEmits(['update:modelValue'])

const cssVars = computed(() => {
  const index = props.options.findIndex(o => o.value === props.modelValue)
  return {
    '--opt-count': props.options.length,
    '--opt-index': Math.max(0, index)
  }
})
</script>

<style scoped>
.seg-control {
  position: relative;
  display: flex;
  background: var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--space-2xs);
}

.seg-indicator {
  position: absolute;
  top: var(--space-2xs);
  left: calc(var(--space-2xs) + (100% - var(--space-2xs) * 2) / var(--opt-count) * var(--opt-index));
  width: calc((100% - var(--space-2xs) * 2) / var(--opt-count));
  height: calc(100% - var(--space-2xs) * 2);
  background: var(--color-background);
  border-radius: calc(var(--radius-lg) - 2px);
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  z-index: 0;
}

.seg-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2xs);
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  border-radius: calc(var(--radius-lg) - 2px);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  z-index: 1;
  transition: color 0.25s;
}

.seg-option:disabled {
  opacity: 0.35;
  cursor: default;
}

.seg-option.active {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.seg-option svg {
  font-size: var(--font-size-xl);
}

.seg-badge {
  font-size: var(--font-size-sm);
  min-width: 18px;
  text-align: center;
  padding: 1px 5px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-bold);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.seg-option.active .seg-badge {
  background: rgba(255, 255, 255, 0.25);
  color: inherit;
}

/* compact */
.seg-control.compact .seg-option {
  padding: var(--space-2xs) var(--space-ms);
  font-size: var(--font-size-sm);
}

/* size md */
.seg-control.size-md .seg-option {
  font-size: var(--font-size-lg);
  padding: 10px 16px;
}

.seg-control.size-md .seg-option svg {
  font-size: var(--font-size-xl);
}

/* primary variant */
.seg-control.variant-primary {
  background: var(--color-card);
}

.seg-control.variant-primary .seg-indicator {
  background: var(--color-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.seg-control.variant-primary .seg-option.active {
  color: var(--color-primary-foreground);
  font-weight: var(--font-weight-semibold);
}

.seg-control.variant-primary .seg-option.active .seg-badge {
  background: var(--color-partial-bg);
}
</style>
