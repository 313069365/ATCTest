<template>
  <BottomSheet :visible="visible" :title="t('quizSettings')" @close="$emit('close')">


    <div v-if="!isExamMode" class="settings-section">
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
              <Icon name="volume-up-outline" v-if="soundEnabled" />
              <Icon name="volume-off-outline" v-else />
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
              <Icon name="dark-mode-outline" v-if="darkMode" />
              <Icon name="light-mode-outline" v-else />
            </span>
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="action-btn-primary" @click="isExamMode ? handleSubmit() : handleExit()">
        <Icon :name="isExamMode ? 'assignment-turned-in-outline' : 'logout'" />
        {{ isExamMode ? t('submitPaper') : t('exit') }}
      </button>
    </template>
  </BottomSheet>
</template>

<script setup>
import Icon from '@/presentation/components/common/Icon.vue'
import { t } from '@/infrastructure/utils/i18n.js'
import BottomSheet from '@/presentation/components/common/BottomSheet.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  showExplanationEnabled: { type: Boolean, default: true },
  forceExplanationOnWrong: { type: Boolean, default: true },
  autoJump: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: false },
  soundEnabled: { type: Boolean, default: true },
  isExamMode: { type: Boolean, default: false },
  onExit: { type: Function, default: null },
  onSubmit: { type: Function, default: null },
})

const emit = defineEmits(['close', 'update:forceExplanationOnWrong', 'update:autoJump', 'update:darkMode'])

function handleSubmit() {
  props.onSubmit?.()
}
function handleExit() {
  props.onExit?.()
}


</script>

<style scoped>
.action-btn-primary {
  width: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius-full);
  font-size: 16px;
  font-weight: 600;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.action-btn-primary svg {
  font-size: 20px;
}

.action-btn-primary:active {
  opacity: 0.85;
  transform: scale(0.97);
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

.toggle-item+.toggle-item {
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

.toggle-knob svg {
  font-size: 16px;
  color: var(--color-gray-500);
}

.toggle-btn.active .toggle-knob svg {
  color: var(--primary);
}

.toggle-btn.active .toggle-knob {
  transform: translateX(24px);
}
</style>
