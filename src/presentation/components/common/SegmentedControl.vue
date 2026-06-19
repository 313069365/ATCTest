<template>
  <div class="seg-control" :class="[variant === 'primary' ? 'variant-primary' : '', compact ? 'compact' : '', `size-${size}`]" :style="cssVars">
    <div class="seg-indicator"></div>
    <button
      v-for="opt in options"
      :key="opt.value"
      class="seg-option"
      :class="{ active: modelValue === opt.value }"
      :disabled="opt.disabled"
      @click="$emit('update:modelValue', opt.value)"
    >
      <Icon v-if="opt.icon" :name="opt.icon" />
      <span>{{ opt.label }}</span>
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
  background: var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: 3px;
}

.seg-indicator {
  position: absolute;
  top: 3px;
  left: calc(3px + (100% - 6px) / var(--opt-count) * var(--opt-index));
  width: calc((100% - 6px) / var(--opt-count));
  height: calc(100% - 6px);
  background: var(--background);
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
  gap: 6px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: transparent;
  border-radius: calc(var(--radius-lg) - 2px);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  cursor: pointer;
  z-index: 1;
  transition: color 0.25s;
}

.seg-option:disabled {
  opacity: 0.35;
  cursor: default;
}

.seg-option.active {
  color: var(--primary);
  font-weight: var(--font-weight-bold);
}

.seg-option svg {
  font-size: 18px;
}

.seg-badge {
  font-size: 11px;
  min-width: 18px;
  text-align: center;
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: var(--font-weight-bold);
  background: var(--primary-light);
  color: var(--primary);
}

.seg-option.active .seg-badge {
  background: rgba(255, 255, 255, 0.25);
  color: inherit;
}

/* compact */
.seg-control.compact .seg-option {
  padding: 6px 12px;
  font-size: 13px;
}

/* size md */
.seg-control.size-md .seg-option {
  font-size: 15px;
  padding: 10px 16px;
}

.seg-control.size-md .seg-option svg {
  font-size: 20px;
}

/* primary variant */
.seg-control.variant-primary {
  background: var(--color-gray-100);
}

.seg-control.variant-primary .seg-indicator {
  background: var(--primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.seg-control.variant-primary .seg-option.active {
  color: var(--on-primary);
  font-weight: 600;
}

.seg-control.variant-primary .seg-option.active .seg-badge {
  background: rgba(255, 255, 255, 0.2);
}
</style>
