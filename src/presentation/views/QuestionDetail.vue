<template>
  <div class="page question-detail-page">
    <header class="top-bar">
      <button class="icon-btn" @click="goBack">
        <Icon name="arrow-back" />
      </button>
      <h1 class="title">{{ t('questionDetail') }}</h1>
      <div class="header-action-placeholder"></div>
    </header>

    <div v-if="!question" class="not-found">
      <Icon name="search-off" class="not-found-icon" />
      <p>{{ t('searchNoResults') }}</p>
    </div>

    <div v-else class="detail-content">
      <div class="question-meta-bar">
        <div class="meta-tags">
          <span class="meta-tag tag-category">{{ t(question.meta?.category) }}</span>
          <span class="meta-tag tag-scope">{{ t(question.meta?.scope) }}</span>
          <span class="meta-tag tag-subject">{{ t(question.meta?.subject) }}</span>
        </div>
      </div>

      <div class="question-renderer-wrap">
        <QuestionRenderer :question="question" mode="review" :disabled="true" />
      </div>

      <div v-if="ids.length > 0" class="bottom-nav">
        <button class="nav-btn" :disabled="currentIndex <= 0" @click="goPrev">
          <Icon name="chevron-left" />
          <span>{{ t('prevQuestion') }}</span>
        </button>
        <span class="nav-indicator">{{ currentIndex + 1 }} / {{ ids.length }}</span>
        <button class="nav-btn" :disabled="currentIndex >= ids.length - 1" @click="goNext">
          <span>{{ t('nextQuestion') }}</span>
          <Icon name="chevron-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/presentation/components/common/Icon.vue'
import { useAppStore } from '@/domain/stores/store'
import { t } from '@/infrastructure/utils/i18n.js'
import * as API from '@/infrastructure/api/dataSource'
import QuestionRenderer from '@/presentation/components/question/QuestionRenderer.vue'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const question = ref(null)
const ids = ref([])

const currentIndex = computed(() => {
  return ids.value.indexOf(route.params.id)
})

function parseIds() {
  const raw = route.query.ids
  if (raw) {
    ids.value = raw.split(',').filter(Boolean)
  } else {
    ids.value = []
  }
}

function loadQuestion() {
  const id = route.params.id
  if (!id) return

  const all = API.fetchAllQuestions()
  question.value = all.find((q) => q.id === id) || null
}

function goPrev() {
  const idx = currentIndex.value
  if (idx <= 0) return
  router.replace(`/question/${ids.value[idx - 1]}?ids=${encodeURIComponent(ids.value.join(','))}`)
}

function goNext() {
  const idx = currentIndex.value
  if (idx >= ids.value.length - 1) return
  router.replace(`/question/${ids.value[idx + 1]}?ids=${encodeURIComponent(ids.value.join(','))}`)
}

function goBack() {
  router.back()
}

watch(() => route.params.id, () => {
  parseIds()
  loadQuestion()
}, { immediate: true })
</script>

<style scoped>
.question-detail-page {
  background: var(--color-gray-100);
  min-height: 100vh;
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--background);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  height: 56px;
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
}

.title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
}

.icon-btn:active {
  background: var(--color-gray-400);
}

.header-action-placeholder {
  width: 40px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--app-max-width);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-smd) var(--spacing-lg);
  padding-bottom: calc(var(--spacing-smd) + env(safe-area-inset-bottom, 0px));
  background: var(--background);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-smd) var(--spacing-lg);
  border: none;
  background: var(--color-gray-200);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.nav-btn:active:not(:disabled) {
  opacity: 0.75;
}

.nav-btn:disabled {
  color: var(--text-disabled);
  background: transparent;
  cursor: default;
}

.nav-btn svg {
  font-size: 20px;
}

.nav-indicator {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--text-primary);
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) 0;
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

.not-found-icon {
  font-size: 64px;
  color: var(--text-disabled);
}

.detail-content {
  padding: var(--spacing-lg);
  padding-bottom: 80px;
}

.question-meta-bar {
  margin-bottom: var(--spacing-md);
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.meta-tag {
  font-size: var(--font-size-sm);
  padding: var(--spacing-mn) var(--spacing-md);
  border-radius: var(--radius-full);
  font-weight: 500;
}

.tag-category {
  background: var(--primary-light);
  color: var(--primary);
}

.tag-scope {
  background: var(--secondary-light);
  color: var(--accent);
}

.tag-subject {
  background: var(--color-gray-200);
  color: var(--text-secondary);
}

.question-renderer-wrap {
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-lg);
}

.detail-actions {
  display: flex;
  justify-content: center;
}

.practice-btn {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-md);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: opacity var(--transition-fast);
}

.practice-btn:active {
  opacity: 0.85;
}

.practice-btn svg {
  font-size: 20px;
}
</style>
