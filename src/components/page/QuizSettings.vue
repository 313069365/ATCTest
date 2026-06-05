<template>
  <BottomSheet :visible="visible" :title="t('quizSettings')" @close="$emit('close')">
    <div class="action-row">
      <button class="action-btn-secondary" @click="handleSubmit">
        <span class="material-symbols-outlined">check_circle</span>
        {{ t('submitPaper') }}
        <span></span>
      </button>
      <button class="action-btn-secondary" @click="handleExit">
        <span class="material-symbols-outlined">close</span>
        {{ t('exit') }}
        <span></span>
      </button>
    </div>

    <div class="settings-section">
      <span class="section-label">{{ t('answerSettings') }}</span>
      <div class="settings-group">
        <div v-if="!showExplanationEnabled" class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-title">{{ t('forceExplanationOnWrong') }}</span>
            <span class="toggle-desc">{{ t('forceExplanationOnWrongDesc') }}</span>
          </div>
          <button class="toggle-btn" :class="{ active: forceExplanationOnWrong }"
            @click="$emit('update:forceExplanationOnWrong', !forceExplanationOnWrong)">
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

    <div class="settings-section">
      <span class="section-label">{{ t('soundDisplay') }}</span>
      <div class="settings-group">
        <div class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-title">{{ t('sound') }}</span>
            <span class="toggle-desc">{{ t('soundDesc') }}</span>
          </div>
          <button class="toggle-btn" :class="{ active: soundEnabled }"
            @click="$emit('update:soundEnabled', !soundEnabled)">
            <span class="toggle-knob">
              <span class="material-symbols-outlined">{{ soundEnabled ? 'volume_up' : 'volume_off' }}</span>
            </span>
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
      </div>
    </div>
  </BottomSheet>
</template>

<script setup>
import { t } from '@/utils/i18n.js'
import BottomSheet from '@/components/common/BottomSheet.vue'

defineProps({
  visible: { type: Boolean, default: false },
  showExplanationEnabled: { type: Boolean, default: true },
  forceExplanationOnWrong: { type: Boolean, default: true },
  autoJump: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: false },
  soundEnabled: { type: Boolean, default: true },
})

const emit = defineEmits(['close', 'update:forceExplanationOnWrong', 'update:autoJump', 'update:darkMode', 'exit', 'submit'])

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
.action-row {
  display: flex;
  gap: 10px;
}

.action-btn-secondary {
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
  background: var(--background);
  color: var(--text-secondary);
  border: 1px solid var(--border-color-light);
}

.action-btn-secondary:hover {
  background: var(--color-gray-100);
}

.action-btn-secondary .material-symbols-outlined {
  font-size: 18px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 4px;
}

.settings-group {
  background: var(--background);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
}

.toggle-item + .toggle-item {
  border-top: 0.5px solid var(--border-color-light);
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
  transition: background 0.25s;
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
  background: var(--background);
  transition: transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
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
</style>
