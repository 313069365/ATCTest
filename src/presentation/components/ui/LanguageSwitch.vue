<template>
  <div class="settings-section">
    <span class="section-label">{{ t('language') }}</span>
    <div class="settings-group">
      <div class="toggle-item">
        <div class="toggle-info">
          <span class="toggle-title">{{ t('displayLanguage') }}</span>
          <span class="toggle-desc">{{ t('displayLanguageDesc') }}</span>
        </div>
        <div class="seg-control lang" :style="{ '--opt-count': 2, '--opt-index': getLanguage() === 'zh' ? 0 : 1 }">
          <div class="seg-indicator"></div>
          <button class="seg-option" :class="{ active: getLanguage() === 'zh' }" @click="switchLang('zh')">
            中文
          </button>
          <button class="seg-option" :class="{ active: getLanguage() === 'en' }" @click="switchLang('en')">
            EN
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t, setLanguage, getLanguage } from '@/infrastructure/utils/i18n.js'

function switchLang(lang) {
  setLanguage(lang)
  window.location.reload()
}
</script>

<style scoped>
.settings-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 4px;
  margin-bottom: 8px;
}

.settings-group {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
}

.toggle-info {
  display: flex;
  flex-direction: column;
}

.toggle-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.toggle-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.seg-control {
  position: relative;
  display: flex;
  background: var(--gray-100);
  border-radius: var(--radius-md);
  padding: 3px;
}

.seg-indicator {
  position: absolute;
  top: 3px;
  left: calc(3px + (100% - 6px) / var(--opt-count) * var(--opt-index));
  width: calc((100% - 6px) / var(--opt-count));
  height: calc(100% - 6px);
  background: var(--color-background);
  border-radius: var(--radius-md);
  transition: left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  z-index: 0;
}

.seg-option.active {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.seg-control.lang .seg-option {
  padding: var(--space-2xs) var(--space-md);
  font-size: var(--font-size-sm);
}

.seg-option {
  flex: 1;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  z-index: 1;
  transition: color 0.25s;
  white-space: nowrap;
  text-align: center;
}

.seg-option.active {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.seg-option:not(.active):active {
  background: var(--gray-200);
}
</style>
