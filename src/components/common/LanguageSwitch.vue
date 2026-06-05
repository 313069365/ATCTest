<template>
  <div class="settings-section">
    <span class="section-label">{{ t('language') }}</span>
    <div class="settings-group">
      <div class="toggle-item">
        <div class="toggle-info">
          <span class="toggle-title">{{ t('displayLanguage') }}</span>
          <span class="toggle-desc">{{ t('displayLanguageDesc') }}</span>
        </div>
        <div class="lang-switch">
          <button class="seg-btn" :class="{ active: getLanguage() === 'zh' }" @click="switchLang('zh')">
            中文
          </button>
          <button class="seg-btn" :class="{ active: getLanguage() === 'en' }" @click="switchLang('en')">
            English
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t, setLanguage, getLanguage } from '@/utils/i18n.js'

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
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 4px;
  margin-bottom: 8px;
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

.lang-switch {
  display: flex;
  background: var(--color-gray-100);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.seg-btn {
  padding: 5px 14px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
}

.seg-btn.active {
  background: var(--background);
  color: var(--primary);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.seg-btn:not(.active):active {
  background: var(--color-gray-200);
}
</style>
