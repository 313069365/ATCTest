<template>
    <Teleport to="body">
        <Transition name="toast-fade">
            <div v-if="visible" class="toast-wrapper" @click="hide">
                <div :class="['toast', `toast-${type}`]" role="alert">
                    <Icon v-if="iconName" :name="iconName" class="toast-icon" />
                    <span class="toast-text">{{ message }}</span>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
    visible: { type: Boolean, default: false },
    message: { type: String, default: '' },
    type: { type: String, default: 'info' }, // info | success | error
})

defineEmits(['hide'])

const iconName = computed(() => {
    switch (props.type) {
        case 'success': return 'check-circle'
        case 'error': return 'error'
        default: return null
    }
})

function hide() {
    // emit hide on click (optional)
}
</script>

<style scoped>
.toast-wrapper {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: var(--app-max-width);
    height: 100%;
    pointer-events: none;
    z-index: var(--z-popup, 1000);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 80px;
}

.toast {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-lg);
    max-width: 85%;
    word-break: break-word;
}

.toast-info {
    background: var(--color-text);
    color: var(--color-background);
}

.toast-success {
    background: var(--color-success, #22c55e);
    color: #fff;
}

.toast-error {
    background: var(--color-destructive, #ef4444);
    color: #fff;
}

.toast-icon {
    font-size: var(--font-size-lg);
    flex-shrink: 0;
}

.toast-text {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    line-height: 1.4;
}

/* Transition */
.toast-fade-enter-active {
    animation: toast-in 0.25s ease-out;
}

.toast-fade-leave-active {
    animation: toast-out 0.2s ease-in forwards;
}

@keyframes toast-in {
    from {
        opacity: 0;
        transform: translateY(-12px) scale(0.95);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes toast-out {
    to {
        opacity: 0;
        transform: translateY(-8px) scale(0.95);
    }
}
</style>
