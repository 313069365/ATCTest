<template>
  <div class="settings">
    <TopBar :title="t('systemSettings')" showBack @back="goBack" />

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
import LanguageSwitch from '@/presentation/components/ui/LanguageSwitch.vue'
import TopBar from '@/presentation/components/layout/TopBar.vue'

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
