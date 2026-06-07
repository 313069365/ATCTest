<template>
  <div class="settings">
    <header class="top-bar">
      <button class="icon-btn" @click="goBack">
        <i-ms-arrow-back />
      </button>
      <h1 class="title">{{ t('systemSettings') }}</h1>
      <div class="top-bar-right"></div>
    </header>

    <main class="content">
      <LanguageSwitch />
      <div class="version-footer">Version {{ APP_VERSION }}</div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { t } from '@/infrastructure/utils/i18n.js'
import { APP_VERSION } from '@/infrastructure/utils/version'
import LanguageSwitch from '@/presentation/components/common/LanguageSwitch.vue'

const router = useRouter()

function goBack() {
  router.push({ name: 'Profile' })
}
</script>

<style scoped>
.settings {
  min-height: 100vh;
  background: var(--background-secondary);
  max-width: var(--app-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--background);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
  position: relative;
}

.icon-btn {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--primary);
  transition: background var(--transition-fast);
}

.icon-btn:active {
  background: var(--color-gray-100);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.top-bar-right {
  width: 44px;
}

.content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.version-footer {
  text-align: center;
  padding: 24px 16px 32px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: auto;
}
</style>
