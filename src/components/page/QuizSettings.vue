<template>
  <div class="quiz-settings-modal" @click.self="$emit('close')">
    <div class="quiz-settings-content">
      <header class="settings-header">
        <!-- <button class="close-btn" @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button> -->
        <div class="header-spacer"></div>
        <span class="header-title">{{ t('quizSettings') }}</span>
        <div class="header-spacer"></div>
      </header>

      <div class="settings-body">
        <div class="action-row">
          <button class="action-btn-secondary" @click="handleSubmit">
            <span class="material-symbols-outlined">check_circle</span>
            {{ t('submitPaper') }}
            <span></span>
          </button>
          <!-- <button class="action-btn-primary">
            <span class="material-symbols-outlined"></span>
            <span></span>
          </button> -->
          <button class="action-btn-secondary" @click="handleExit">
            <span class="material-symbols-outlined">close</span>
            {{ t('exit') }}
            <span></span>
          </button>
        </div>

        <div class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-title">{{ t('darkMode') }}</span>
            <span class="toggle-desc">{{ t('darkModeDesc') }}</span>
          </div>
          <button class="toggle-btn" :class="{ active: darkMode }" @click="$emit('update:darkMode', !darkMode)">
            <span class="toggle-knob">
              <span class="material-symbols-outlined">{{ darkMode ? 'dark_mode' : 'light_mode' }}</span>
            </span>
          </button>
        </div>

        <div class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-title">{{ t('showExplanation') }}</span>
            <span class="toggle-desc">{{ t('showExplanationDesc') }}</span>
          </div>
          <button class="toggle-btn" :class="{ active: showExplanation }"
            @click="$emit('update:showExplanation', !showExplanation)">
            <span class="toggle-knob"></span>
          </button>
        </div>

        <div class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-title">{{ t('autoJump') }}</span>
            <span class="toggle-desc">{{ t('autoJumpDesc') }}</span>
          </div>
          <button class="toggle-btn" :class="{ active: autoJump }" @click="$emit('update:autoJump', !autoJump)">
            <span class="toggle-knob"></span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/utils/i18n.js'

defineProps({
  showExplanation: { type: Boolean, default: true },
  autoJump: { type: Boolean, default: false },
  darkMode: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'update:showExplanation', 'update:autoJump', 'update:darkMode', 'exit', 'submit'])

const handleExit = () => {
  emit('close')
  emit('exit')
}

const handleSubmit = () => {
  emit('close')
  emit('submit')
}
</script>

<style scoped>
.quiz-settings-modal {
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
}

.quiz-settings-content {
  background: var(--background-secondary);
  width: 100%;
  max-width: var(--app-max-width);
  max-height: 80vh;
  min-height: 70vh;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-smd);
  background: var(--background);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: background 0.15s;
}

.close-btn:hover {
  background: var(--color-gray-100);
}

.close-btn .material-symbols-outlined {
  font-size: 22px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: var(--on-surface);
}

.header-spacer {
  width: 32px;
  flex-shrink: 0;
}

.settings-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-row {
  display: flex;
  gap: 10px;
}

.action-btn-secondary,
.action-btn-primary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.action-btn-secondary {
  background: var(--background);
  color: var(--text-secondary);
  border: 1px solid var(--border-color-light);
}

.action-btn-secondary:hover {
  background: var(--color-gray-100);
}

.action-btn-primary {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 91, 191, 0.25);
}

.action-btn-primary:hover {
  background: var(--primary-dark, #004fa8);
}

.action-btn-secondary .material-symbols-outlined,
.action-btn-primary .material-symbols-outlined {
  font-size: 18px;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--background);
  border-radius: var(--radius-lg);
}

.toggle-info {
  display: flex;
  flex-direction: column;
}

.toggle-title {
  font-size: 14px;
  font-weight: 600;
}

.toggle-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.toggle-btn {
  width: 52px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-gray-300);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}

.toggle-btn.active {
  background: var(--primary);
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-knob .material-symbols-outlined {
  font-size: 16px;
  color: var(--color-gray-500);
}

.toggle-btn.active .toggle-knob .material-symbols-outlined {
  color: var(--primary);
}

.toggle-btn.active .toggle-knob {
  transform: translateX(24px);
}

.icon-toggle {
  width: 52px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-gray-300);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.icon-toggle.active {
  background: var(--primary);
}

.icon-toggle .material-symbols-outlined {
  font-size: 18px;
  color: var(--text-secondary);
}

.icon-toggle.active .material-symbols-outlined {
  color: #fff;
}
</style>
