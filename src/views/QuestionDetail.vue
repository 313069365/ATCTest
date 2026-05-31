<template>
  <div class="page question-detail-page">
    <header class="top-bar">
      <button class="icon-btn" @click="goBack">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="title">{{ t('questionDetail') }}</h1>
      <div class="header-action-placeholder"></div>
    </header>

    <div v-if="!question" class="not-found">
      <span class="material-symbols-outlined not-found-icon">search_off</span>
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

      <!-- <div class="detail-actions">
        <button class="practice-btn" @click="startPractice">
          <span class="material-symbols-outlined">play_arrow</span>
          {{ t('startPracticeWithSubject') }}
        </button>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/store'
import { t } from '@/utils/i18n.js'
import * as API from '@/api/dataSource'
import QuestionRenderer from '@/components/question/QuestionRenderer.vue'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const question = ref(null)

function loadQuestion() {
  const id = route.params.id
  if (!id) return

  const all = API.fetchAllQuestions()
  question.value = all.find((q) => q.id === id) || null
}

function goBack() {
  router.back()
}

function startPractice() {
  if (!question.value?.meta) return
  const meta = question.value.meta
  router.push({
    path: '/practice',
    query: {
      category: meta.category,
      scope: meta.scope,
      subject: meta.subject,
    }
  })
}

onMounted(() => {
  loadQuestion()
})
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

.practice-btn .material-symbols-outlined {
  font-size: 20px;
}
</style>
