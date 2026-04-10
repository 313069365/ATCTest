<template>
  <div class="page">
    <header class="top-bar">
      <div class="top-bar-left" @click="exitExam">
        <button class="back-btn">
          <span class="material-symbols-outlined">close</span>
        </button>
        <div class="header-title">
          <h1>{{ paper?.title || t('examPaper') }}</h1>
        </div>
      </div>
      <div class="top-bar-right">
        <div class="timer-display" :class="{ warning: remainingSeconds < 300 }">
          <span class="material-symbols-outlined">timer</span>
          <span>{{ remainingTimeDisplay }}</span>
        </div>
        <button class="grid-btn" :class="{ active: showAnswerCard }" @click="toggleAnswerCard">
          <span class="material-symbols-outlined">grid_view</span>
        </button>
      </div>
    </header>

    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-text">{{ currentIndex + 1 }}/{{ questions.length }}</span>
    </div>

    <main class="question-container">
      <div v-if="loading" style="text-align: center; padding: 40px">
        <p>{{ t('loadingQuestions') }}</p>
      </div>
      <div v-else-if="!paper" style="text-align: center; padding: 40px">
        <p>{{ t('paperNotFound') }}</p>
      </div>
      <template v-else>
        <div v-if="currentQuestion">
          <QuestionRenderer :question="currentQuestion" mode="exam" :user-answer="userAnswers[currentQuestion?.id]"
            @answer="handleAnswer" />

          <div class="question-actions">
            <button class="mark-btn" :class="{ active: markedQuestions.has(currentQuestion.id) }" @click="toggleMark">
              <span class="material-symbols-outlined">{{ markedQuestions.has(currentQuestion.id) ? 'bookmark' :
                'bookmark_border' }}</span>
              <span class="mark-text">{{ markedQuestions.has(currentQuestion.id) ? t('marked') : t('mark') }}</span>
            </button>
          </div>
        </div>
      </template>
    </main>

    <QustionNavbar :prevDisabled="currentIndex === 0" :isLast="currentIndex === questions.length - 1"
      @prev="prevQuestion" @next="nextQuestion" @submit="submitPaper" />

    <AnswerCard v-if="showAnswerCard" :questions="questions" :currentIndex="currentIndex" :currentSubIndex="0"
      :userAnswers="userAnswers" buttonText="submitPaper" @close="closeAnswerCard" @exit="submitPaper"
      @go="gotoQuestion" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AnswerCard from '@/components/page/AnswerCard.vue'
import QustionNavbar from '@/components/layout/QuestionNavbar.vue'
import QuestionRenderer from '@/components/question/QuestionRenderer.vue'
import { useAppStore } from '@/stores/store'
import { t } from '@/utils/i18n.js'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const paper = ref(null)
const questions = ref([])
const currentIndex = ref(0)
const userAnswers = ref({})
const markedQuestions = ref(new Set())
const showAnswerCard = ref(false)
const loading = ref(true)

// 计时器相关
const duration = ref(0) // 分钟
const elapsedSeconds = ref(0)
const remainingSeconds = ref(0)
let timerInterval = null

const progress = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round(((currentIndex.value + 1) / questions.value.length) * 100)
})

const currentQuestion = computed(() => {
  if (questions.value && questions.value.length > 0 && questions.value[currentIndex.value]) {
    return questions.value[currentIndex.value]
  }
  return null
})

const remainingTimeDisplay = computed(() => {
  const hours = Math.floor(remainingSeconds.value / 3600)
  const minutes = Math.floor((remainingSeconds.value % 3600) / 60)
  const seconds = remainingSeconds.value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

onMounted(async () => {
  const paperId = parseInt(route.query.id)

  if (!paperId) {
    router.push('/exam')
    return
  }

  // 加载试卷列表
  store.loadExamPapers()

  // 查找试卷
  const foundPaper = store.examPapers.find(p => p.id === paperId)

  if (!foundPaper) {
    loading.value = false
    return
  }

  paper.value = foundPaper
  questions.value = foundPaper.questions || []
  duration.value = foundPaper.duration || 120
  remainingSeconds.value = duration.value * 60

  loading.value = false

  // 开始计时
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
    remainingSeconds.value = Math.max(0, duration.value * 60 - elapsedSeconds.value)

    if (remainingSeconds.value === 0) {
      autoSubmit()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const toggleAnswerCard = () => {
  showAnswerCard.value = !showAnswerCard.value
}

const closeAnswerCard = () => {
  showAnswerCard.value = false
}

const toggleMark = () => {
  if (!currentQuestion.value) return
  const id = currentQuestion.value.id
  if (markedQuestions.value.has(id)) {
    markedQuestions.value.delete(id)
  } else {
    markedQuestions.value.add(id)
  }
}

const handleAnswer = (answer) => {
  if (!currentQuestion.value) return
  const question = currentQuestion.value
  userAnswers.value[question.id] = answer
}

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}

const gotoQuestion = (idx) => {
  currentIndex.value = idx
  closeAnswerCard()
}

const exitExam = () => {
  if (confirm(t('confirmExitExam') || '确定要退出考试吗？')) {
    stopTimer()
    router.push('/exam')
  }
}

const submitPaper = () => {
  if (confirm(t('confirmSubmitPaper') || '确定要交卷吗？')) {
    autoSubmit()
  }
}

const autoSubmit = () => {
  stopTimer()

  // 计算得分
  let correctCount = 0
  const totalScore = paper.value?.totalScore || 0
  const questionCount = questions.value.length

  questions.value.forEach((q) => {
    const userAnswer = userAnswers.value[q.id]
    const isCorrect = checkAnswer(q, userAnswer)
    if (isCorrect) {
      correctCount++
    }
  })

  // 每题默认2分，计算用户得分
  const defaultScore = 2
  const userScore = correctCount * defaultScore

  // 跳转到结果页
  router.push({
    path: '/exam/result',
    query: {
      paperId: paper.value.id,
      totalQuestions: questionCount,
      correctCount,
      totalScore,
      userScore,
      elapsedTime: elapsedSeconds.value
    }
  })
}

const checkAnswer = (question, userAnswer) => {
  if (userAnswer === undefined || userAnswer === null) return false

  const correctAnswer = question.answer

  if (question.type === 'multiple') {
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) return false
    const sortedUser = [...userAnswer].sort()
    const sortedCorrect = [...correctAnswer].sort()
    return JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)
  }

  return userAnswer === correctAnswer
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background-secondary);
  max-width: var(--app-max-width);
  margin: 0 auto;
  padding-bottom: 80px;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.back-btn {
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
}

.back-btn .material-symbols-outlined {
  font-size: var(--font-size-3xl);
}

.header-title h1 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.timer-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-mn);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
  font-size: var(--font-size-md);
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}

.timer-display.warning {
  color: var(--error);
  background: var(--error-container);
}

.timer-display .material-symbols-outlined {
  font-size: var(--font-size-2xl);
}

.grid-btn {
  width: 45px;
  height: 45px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.grid-btn .material-symbols-outlined {
  font-size: var(--font-size-3xl);
}

.grid-btn.active .material-symbols-outlined {
  font-variation-settings: 'FILL' 1;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress {
  height: 100%;
  background: var(--success);
  border-radius: var(--radius-full);
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  min-width: 50px;
  text-align: right;
}

.question-container {
  padding: var(--spacing-md);
}

.question-actions {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.mark-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  background: var(--background);
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  transition: all 0.2s;
}

.mark-btn.active {
  color: var(--warning);
  border-color: var(--warning);
  background: var(--warning-container);
}

.mark-btn .material-symbols-outlined {
  font-size: 18px;
}
</style>