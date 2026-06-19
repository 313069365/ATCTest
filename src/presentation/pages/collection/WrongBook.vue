<template>
  <QuestionCollection
    :title="t('wrongBook')"
    :hasItems="wrongList.length > 0"
    practiceIcon="rate-review-outline"
    :practiceTitle="t('practiceWrong')"
    :practiceDesc="t('wrongReviewDesc', { count: wrongList.length })"
    :items="paginatedList"
    :loading="false"
    :loaded="true"
    :hasMore="hasMore"
    emptyIcon="check-circle-outline"
    emptyTitle="暂无错题"
    emptyDesc="答错的题目会自动添加到错题本"
    startBtnText="开始练习"
    @back="goBack"
    @clear="clearAll"
    @practice-all="startWrongPractice"
    @start-practice="goPractice"
  >
    <template #card="{ item }">
      <div class="card glass">
        <div class="card-header">
          <div class="meta-top">
            <span class="subject-tag">{{ t(item.meta?.subject) || item.meta?.subject || t('unknown') }}</span>
            <span class="badge">{{ t(item.meta?.category) || item.meta?.category || '' }}</span>
          </div>
          <button class="delete-btn" @click.stop="removeWrong(item.id)">
            <Icon name="close" />
          </button>
        </div>

        <p class="question-text">{{ item.stem }}</p>

        <div class="answer-section">
          <span class="answer-label">{{ t('correctAnswer') }}：</span>
          <span class="answer-value">{{ formatAnswer(item.answer) }}</span>
        </div>

        <div class="card-footer">
          <span class="wrong-count" v-if="getWrongCount(item.id) > 1">
            {{ t('wrongCount') }} {{ getWrongCount(item.id) }} {{ t('times') }}
          </span>
        </div>
      </div>
    </template>
  </QuestionCollection>
  <ConfirmDialog v-bind="confirm.state" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/presentation/components/ui/Icon.vue'
import QuestionCollection from '@/presentation/components/question/QuestionCollection.vue'
import { useAppStore } from '@/domain/stores/store'
import { t } from '@/infrastructure/utils/i18n.js'
import { createPracticeSession } from '@/infrastructure/storage/session'
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog.vue'
import { useConfirm } from '@/presentation/composables/useConfirm'

const router = useRouter()
const store = useAppStore()
const confirm = useConfirm()

const wrongList = computed(() => store.wrongBook)
const pageSize = 20
const currentPage = ref(1)

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = currentPage.value * pageSize
  return wrongList.value.slice(start, end)
})

const hasMore = computed(() => {
  return currentPage.value * pageSize < wrongList.value.length
})

onMounted(() => {
  store.loadWrongBook()
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

function startWrongPractice() {
  const sessionId = createPracticeSession({
    source: 'wrongbook',
    subject: { name: 'practiceWrong' },
    category: 'wrongBook',
    scope: 'wrongBook',
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

async function removeWrong(id) {
  if (await confirm.show(t('confirmRemoveWrong'))) {
    store.removeWrongQuestion(id)
  }
}

async function clearAll() {
  if (await confirm.show(t('confirmClearAll'))) {
    store.wrongBook.forEach(q => store.removeWrongQuestion(q.id))
  }
}

function formatAnswer(answer) {
  if (!answer) return ''
  if (Array.isArray(answer)) {
    return answer.join(', ')
  }
  return answer
}

function getWrongCount(questionId) {
  const item = store.wrongBook.find(q => q.id === questionId)
  return item?.wrongCount || 1
}
</script>

<style scoped>
.glass {
  background: var(--background);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.meta-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.badge {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: rgba(0, 91, 191, 0.1);
  padding: 4px 10px;
  border-radius: var(--radius-md);
}

.subject-tag {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--primary);
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 10px;
  border-radius: var(--radius-md);
}

.delete-btn {
  width: 25px;
  height: 25px;
  border: none;
  background: rgba(211, 47, 47, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--error);
  transition: all 0.2s;
}

.delete-btn:hover {
  background: rgba(211, 47, 47, 0.2);
}

.delete-btn:active {
  transform: scale(0.9);
}

.delete-btn svg {
  font-size: 18px;
}

.question-text {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--on-surface);
  line-height: 1.5;
  margin: 0 0 var(--spacing-sm) 0;
}

.answer-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.answer-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.answer-value {
  font-size: var(--font-size-sm);
  color: var(--success);
  font-weight: var(--font-weight-semibold);
}

.card-footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.wrong-count {
  font-size: var(--font-size-xs);
  color: var(--warning);
  background: var(--warning-container);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
}
</style>
