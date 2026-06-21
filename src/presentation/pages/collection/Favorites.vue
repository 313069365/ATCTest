<template>
  <QuestionCollection
    :title="t('favorites')"
    :hasItems="favoritesList.length > 0"
    practiceIcon="star-outline"
    :practiceTitle="t('practiceFavorites')"
    :practiceDesc="t('favoritesReviewDesc', { count: favoritesList.length })"
    :items="paginatedList"
    :loading="false"
    :loaded="true"
    :hasMore="hasMore"
    emptyIcon="star-outline"
    :emptyTitle="t('noFavorites')"
    :emptyDesc="t('favoritesDesc')"
    :startBtnText="t('startPractice')"
    :headerBg="'var(--color-warning)'"
    :headerColor="'#fff'"
    @back="goBack"
    @clear="clearAll"
    @practice-all="startFavoritesPractice"
    @start-practice="goPractice"
  >
    <template #card="{ item }">
      <div class="card glass">
        <div class="card-header">
          <div class="meta-top">
            <span class="subject-tag">{{ t(item.meta?.subject) || item.meta?.subject || t('unknown') }}</span>
            <span class="badge">{{ t(item.meta?.category) || item.meta?.category || '' }}</span>
          </div>
          <button class="delete-btn" @click.stop="removeFavorite(item.id)">
            <Icon name="close" />
          </button>
        </div>

        <p class="question-text">{{ item.stem }}</p>

        <div class="card-footer">
          <span class="type-tag">{{ t('answer') }}: {{ formatAnswer(item.answer) }}</span>
        </div>
      </div>
    </template>
  </QuestionCollection>
  <ConfirmDialog v-bind="confirm.state" />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/presentation/components/ui/Icon.vue'
import QuestionCollection from '@/presentation/pages/collection/components/QuestionCollection.vue'
import { useAppStore } from '@/domain/stores/store'
import { t } from '@/infrastructure/utils/i18n.js'
import { createPracticeSession } from '@/infrastructure/storage/session'
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog.vue'
import { useConfirm } from '@/presentation/composables/useConfirm'

const router = useRouter()
const store = useAppStore()
const confirm = useConfirm()

const favoritesList = computed(() => store.favorites)
const pageSize = 20
const currentPage = ref(1)

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = currentPage.value * pageSize
  return favoritesList.value.slice(start, end)
})

const hasMore = computed(() => {
  return currentPage.value * pageSize < favoritesList.value.length
})

onMounted(() => {
  store.loadFavorites()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  if (!hasMore.value) return
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    currentPage.value++
  }
}

function goBack() {
  router.back()
}

function startFavoritesPractice() {
  const sessionId = createPracticeSession({
    source: 'favorites',
    subject: { name: 'practiceFavorites' },
    category: 'favorites',
    scope: 'favorites',
    practiceMode: 'answer',
    questionSort: 'shuffle',
    showAnswerMode: 'immediate',
    autoJump: false
  })
  router.push({
    path: '/practice/quiz',
    query: { sessionId }
  })
}

function goPractice() {
  router.push('/practice')
}

async function removeFavorite(id) {
  if (await confirm.show(t('confirmRemoveFavorite'))) {
    store.removeFavorite(id)
  }
}

async function clearAll() {
  if (await confirm.show(t('confirmClearFavorites'))) {
    store.favorites.forEach(q => store.removeFavorite(q.id))
  }
}

function formatAnswer(answer) {
  if (!answer) return ''
  if (Array.isArray(answer)) {
    return answer.join(', ')
  }
  return answer
}
</script>

<style scoped>
.glass {
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.meta-top {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.badge {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-primary-bg);
  padding: 4px 10px;
  border-radius: var(--radius-md);
}

.subject-tag {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  background: var(--shadow-sm);
  padding: 4px 10px;
  border-radius: var(--radius-md);
}

.delete-btn {
  width: 25px;
  height: 25px;
  border: none;
  background: var(--color-destructive-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-destructive);
  transition: all 0.2s;
}

.delete-btn:hover {
  background: var(--color-destructive-bg-hover);
}

.delete-btn:active {
  transform: scale(0.9);
}

.delete-btn svg {
  font-size: var(--font-size-xl);
}

.question-text {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  line-height: var(--line-height-normal);
  margin: 0 0 var(--space-sm) 0;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.type-tag {
  font-size: var(--font-size-md);
  color: var(--color-warning);
  background: var(--color-warning-bg);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
}
</style>
