<template>
  <div class="page">
    <!-- 顶部栏 -->
    <header class="top-bar">
      <div v-if="isExamMode" class="top-bar-left" @click="exitExam">
        <button class="back-btn">
          <Icon name="close" />
        </button>
        <div class="header-title">
          <h1>{{ paper?.title || t('examPaper') }}</h1>
        </div>
      </div>
      <div v-else class="top-bar-left">
        <div class="header-title">
          <h1>{{ t(subjectDisplay) }}</h1>
          <span class="header-subtitle">{{ t(practiceData?.category) || practiceData?.category || "" }} •
            {{ t(practiceData?.scope) || practiceData?.scope || "" }}</span>
        </div>
      </div>
      <div class="top-bar-right">
        <div class="timer-display" :class="{ warning: isExamMode && remainingSeconds < 300 }">
          <Icon name="timer-outline" />
          <span>{{ isExamMode ? remainingTimeDisplay : elapsedTimeDisplay }}</span>
        </div>
        <button class="grid-btn" @click="showQuizSettings = true">
          <Icon name="settings" />
        </button>

      </div>
    </header>

    <!-- 进度条和操作栏 -->
    <div class="progress-action-bar">
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div class="progress" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
      <div class="action-bar">
        <span class="progress-label" @click="openJumpDialog">进度 {{ currentIndex + 1 }}/{{ isExamMode ? questions.length
          :
          bank.length
        }}</span>
        <div class="action-bar-right">
          <button v-for="btn in visibleButtons" :key="btn.key" class="action-btn"
            :class="{ active: btn.active?.value, 'remove-btn': btn.key === 'removeWrong' }" @click="btn.action"
            :title="btn.title">
            <Icon :name="btn.iconName?.value ?? btn.iconName" />
          </button>
        </div>
      </div>
    </div>

    <!-- 问题容器 -->
    <main class="question-container">
      <div v-if="loading" style="text-align: center; padding: 40px">
        <p>{{ t('loadingQuestions') }}</p>
      </div>
      <div v-else-if="isExamMode && !paper" style="text-align: center; padding: 40px">
        <p>{{ t('paperNotFound') }}</p>
      </div>
      <template v-else-if="currentQuestion">
        <template v-if="isExamMode">
          <QuestionRenderer :question="currentQuestion" mode="exam" :user-answer="userAnswers[currentQuestion?.id]"
            :is-marked="markedQuestions.has(currentQuestion.id)" @answer="handleAnswer" @toggle-mark="toggleMark" />
        </template>
        <template v-else>
          <QuestionRenderer :question="currentQuestionWithOptions" :mode="practiceMode"
            :user-answer="userAnswers[currentQuestion?.id]" :show-answer="currentQuestionDisplay.shouldShowAnswer.value"
            :show-answer-mode="practiceData?.showAnswerMode" :auto-jump="practiceData?.autoJump"
            :show-explanation="showAnswerExplanation" :current-sub-index="currentSubIndex" @answer="handleAnswer"
            @next-question="nextQuestion" @checkSub="handleCheckSub" @check="checkAnswer" @goSub="handleGoSub" />
        </template>
      </template>
      <div v-else style="text-align: center; padding: 40px">
        <p>{{ t('noQuestions') }}</p>
      </div>
    </main>

    <!-- 问题导航栏 -->
    <QuestNav v-if="isExamMode" :prevDisabled="currentIndex === 0" :isLast="currentIndex === questions.length - 1"
      @prev="prevQuestion" @next="nextQuestion" />
    <QuestNav v-else :prevDisabled="currentIndex === 0" :isLast="currentIndex === bank.length - 1"
      :subCount="currentSubCount" :currentSubIndex="currentSubIndex" :subStatuses="currentSubStatuses"
      @prev="prevQuestion" @next="nextQuestion" @goSub="handleGoSub" />

    <!-- 答案概览 -->
    <AnswerOverview v-if="showAnswerCard" v-bind="answerOverviewProps" @close="closeAnswerCard"
      @go="isExamMode ? gotoQuestion : gotoQuesitonIdx" @exit="isExamMode ? submitPaper : undefined" />

    <!-- 统计 -->
    <PracticeStats v-if="showStatsDialog" :total="liveStats.total" :correct="liveStats.correct" :wrong="liveStats.wrong"
      :unanswered="liveStats.unanswered" :accuracy="liveStats.accuracy" :elapsed="liveStats.elapsed"
      :current="liveStats.current" :totalQ="liveStats.totalQ" :settings="practiceData" :is-exam-mode="isExamMode"
      @close="showStatsDialog = false" />

    <!--  quiz 设置 -->
    <QuizSettings v-if="showQuizSettings" :visible="showQuizSettings" :is-exam-mode="isExamMode"
      :showExplanationEnabled="showExplanationPref" :forceExplanationOnWrong="forceExplanationOnWrong"
      :autoJump="practiceData?.autoJump ?? true" :darkMode="darkMode" :soundEnabled="soundEnabled"
      @close="showQuizSettings = false" @update:forceExplanationOnWrong="forceExplanationOnWrong = $event"
      @update:autoJump="practiceData.autoJump = $event" @update:darkMode="darkMode = $event"
      @update:soundEnabled="soundEnabled = $event" @exit="isExamMode ? exitExam : exitQuiz"
      @submit="isExamMode ? submitPaper : finishQuiz" />

    <!-- 跳转对话框 -->
    <JumpDialog v-if="jumpDialogVisible" :visible="jumpDialogVisible"
      :total="isExamMode ? questions.length : bank.length" :current="currentIndex" @close="jumpDialogVisible = false"
      @jump="isExamMode ? gotoQuestion : gotoQuesitonIdx" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, provide, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Icon from '@/presentation/components/ui/Icon.vue'
import AnswerOverview from '@/presentation/components/practice/AnswerOverview.vue'
import PracticeStats from '@/presentation/components/practice/PracticeStats.vue'
import QuizSettings from '@/presentation/components/practice/QuizSettings.vue'
import QuestNav from '@/presentation/components/layout/QuestNav.vue'
import QuestionRenderer from '@/presentation/components/question/QuestionRenderer.vue'
import JumpDialog from '@/presentation/components/practice/JumpDialog.vue'
import { useAppStore } from '@/domain/stores/store'
import { usePracticeService } from '@/domain/composables/usePracticeService'
import { t } from '@/infrastructure/utils/i18n.js'
import { useQuestionHandler } from '@/application/composables/useQuestionHandler'
import { useSoundEffect } from '@/application/composables/useSoundEffect'
import {
  QUESTION_SORT,
  getAnswerStatus,
} from '@/domain/config/questionConfig'
import {
  savePracticeProgress as saveProgress,
  unpackProgress,
  packProgress,
  getPracticeKey,
} from '@/infrastructure/storage/progress'
import { getStrategy } from '@/infrastructure/question-types'
import { getPracticeSession } from '@/infrastructure/storage/session'

const router = useRouter()
const route = useRoute()
const store = useAppStore()
const pm = usePracticeService()

const isExamMode = computed(() => route.name === 'ExamPaper')

// ========== 共享状态 ==========
const currentIndex = ref(0)
const userAnswers = ref({})
const showAnswerCard = ref(false)
const loading = ref(true)

const questions = ref([])
const currentQuestion = computed(() => {
  const list = isExamMode.value ? questions.value : bank.value
  if (list && list.length > 0 && list[currentIndex.value]) {
    return list[currentIndex.value]
  }
  return null
})

const progress = computed(() => {
  const list = isExamMode.value ? questions.value : bank.value
  if (list.length === 0) return 0
  return Math.round(((currentIndex.value + 1) / list.length) * 100)
})

// ========== 计时器 ==========
const elapsedSeconds = ref(0)
const remainingSeconds = ref(0)
let timerInterval = null

const elapsedTimeDisplay = computed(() => {
  const hours = Math.floor(elapsedSeconds.value / 3600)
  const minutes = Math.floor((elapsedSeconds.value % 3600) / 60)
  const seconds = elapsedSeconds.value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const remainingTimeDisplay = computed(() => {
  const hours = Math.floor(remainingSeconds.value / 3600)
  const minutes = Math.floor((remainingSeconds.value % 3600) / 60)
  const seconds = remainingSeconds.value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  if (isExamMode.value) {
    timerInterval = setInterval(() => {
      elapsedSeconds.value++
      remainingSeconds.value = Math.max(0, remainingSeconds.value - 1)
      if (remainingSeconds.value === 0) {
        autoSubmit()
      }
    }, 1000)
  } else {
    timerInterval = setInterval(() => {
      elapsedSeconds.value++
    }, 1000)
  }
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// ========== 考试模式特定状态 ==========
const paper = ref(null)
const markedQuestions = ref(new Set())

function toggleMark() {
  if (!currentQuestion.value) return
  const id = currentQuestion.value.id
  if (markedQuestions.value.has(id)) {
    markedQuestions.value.delete(id)
  } else {
    markedQuestions.value.add(id)
  }
}

function checkAnswer(question, userAnswer) {
  if (userAnswer === undefined || userAnswer === null) return false
  if (Array.isArray(userAnswer) && Array.isArray(question.answer)) {
    const sortedUser = [...userAnswer].sort()
    const sortedCorrect = [...question.answer].sort()
    return JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)
  }
  return userAnswer === question.answer
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
  let correctCount = 0
  const totalScore = paper.value?.totalScore || 0
  const questionCount = questions.value.length
  questions.value.forEach((q) => {
    const userAnswer = userAnswers.value[q.id]
    if (checkAnswer(q, userAnswer)) {
      correctCount++
    }
  })
  const defaultScore = 2
  const userScore = correctCount * defaultScore
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

// ========== 练习模式特定状态 ==========
const practiceData = ref(null)
const bank = ref([])
const currentSubIndex = ref(0)
const answerChecked = ref({})
const answerStatus = ref({})
const shuffledOptionsCache = ref({})
const showStatsDialog = ref(false)
const showQuizSettings = ref(false)
const jumpDialogVisible = ref(false)
const showExplanationPref = ref(localStorage.getItem('showExplanationPref') !== 'false')
const forceExplanationOnWrong = ref(localStorage.getItem('forceExplanationOnWrong') !== 'false')
const darkMode = ref(localStorage.getItem('darkMode') === 'true')
const soundEnabled = ref(localStorage.getItem('soundEnabled') !== 'false')
const { playAnswerSound } = useSoundEffect(soundEnabled)
const showTranslation = ref(false)
const startedAt = ref(Date.now())

provide('showTranslation', showTranslation)

watch(darkMode, (val) => {
  document.documentElement.classList.toggle('dark', val)
  localStorage.setItem('darkMode', val)
}, { immediate: true })

watch(soundEnabled, (val) => {
  localStorage.setItem('soundEnabled', val)
})

watch(showExplanationPref, (val) => {
  localStorage.setItem('showExplanationPref', val)
})

watch(forceExplanationOnWrong, (val) => {
  localStorage.setItem('forceExplanationOnWrong', val)
})

const practiceMode = computed(() => {
  return practiceData.value?.practiceMode || 'answer'
})

const subjectDisplay = computed(() => {
  if (!practiceData.value) return ''
  const subject = practiceData.value.subject
  return typeof subject === 'object' ? subject.name : subject
})

const isWrongPractice = computed(() => practiceData.value?.wrongPractice)

const showAnswerExplanation = computed(() => {
  const q = bank.value[currentIndex.value]
  if (!q) return false
  if (practiceMode.value === 'review') return true
  const isChecked = answerChecked.value[q.id]
  if (!isChecked) return false
  if (showExplanationPref.value) return true
  if (forceExplanationOnWrong.value) {
    const status = answerStatus.value[q.id]
    if (isWrongStatus(status)) return true
  }
  return false
})

const currentSubCount = computed(() => currentQuestion.value?.subs?.length || 0)

const currentSubStatuses = computed(() => {
  const q = currentQuestion.value
  if (!q || !q.subs) return []
  const status = answerStatus.value[q.id]
  const answers = userAnswers.value[q.id]
  return q.subs.map((_, i) => {
    if (status && status[i] === 'correct') return 'correct'
    if (status && status[i] === 'wrong') return 'wrong'
    if (answers && answers[i] !== undefined && answers[i] !== null && answers[i] !== '') return 'answered'
    return null
  })
})

const isFavorited = computed(() => {
  if (!currentQuestion.value) return false
  return store.favorites.some(q => q.id === currentQuestion.value.id)
})

const isInWrongBook = computed(() => {
  if (!currentQuestion.value) return false
  return store.wrongBook.some(q => q.id === currentQuestion.value.id)
})

const liveStats = computed(() => {
  let correct = 0, wrong = 0, total = 0
  const list = isExamMode.value ? questions.value : bank.value
  if (isExamMode.value) {
    total = list.length
    correct = Object.keys(userAnswers.value).length
  } else {
    list.forEach(q => {
      const status = answerStatus.value[q.id]
      if (q.subs?.length > 0) {
        q.subs.forEach((_, idx) => {
          total++
          const s = status?.[idx]
          if (s === 'correct') correct++
          else if (s === 'wrong') wrong++
        })
      } else {
        total++
        if (status === 'correct') correct++
        else if (status === 'wrong') wrong++
      }
    })
  }
  const unanswered = total - correct - wrong
  return {
    total, correct, wrong, unanswered,
    accuracy: (correct + wrong) > 0 ? Math.round(correct / (correct + wrong) * 100) : 0,
    current: currentIndex.value + 1,
    totalQ: list.length,
    elapsed: elapsedSeconds.value
  }
})

// ========== 选项乱序 ==========
function seededRandom(seed) {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const shuffleArray = (array, rng = Math.random) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const cacheShuffledOptions = () => {
  if (practiceData.value?.practiceMode === 'review') return
  const seed = practiceData.value?.shuffleSeed
  const rng = seed ? seededRandom(seed) : Math.random
  shuffledOptionsCache.value = {}
  bank.value.forEach((question) => {
    if (question && question.options && question.shuffle && getStrategy(question.type)?.capabilities.canShuffle) {
      const indices = question.options.map((_, i) => i)
      const shuffledIndices = shuffleArray(indices, rng)
      shuffledOptionsCache.value[question.id] = {
        options: shuffledIndices.map(i => question.options[i]),
        translationOptions: question.translation?.options
          ? shuffledIndices.map(i => question.translation.options[i])
          : null
      }
    }
  })
}

const getQuestionWithShuffledOptions = (question) => {
  if (!question || !question.options) return question
  if (practiceData.value?.practiceMode === 'review') return question
  if (question.shuffle && getStrategy(question.type)?.capabilities.canShuffle) {
    const cached = shuffledOptionsCache.value[question.id]
    if (cached) {
      return {
        ...question,
        options: cached.options,
        ...(cached.translationOptions && {
          translation: { ...question.translation, options: cached.translationOptions }
        })
      }
    }
    const indices = question.options.map((_, i) => i)
    const shuffledIndices = shuffleArray(indices)
    const result = {
      options: shuffledIndices.map(i => question.options[i]),
      translationOptions: question.translation?.options
        ? shuffledIndices.map(i => question.translation.options[i])
        : null
    }
    shuffledOptionsCache.value[question.id] = result
    return {
      ...question,
      options: result.options,
      ...(result.translationOptions && {
        translation: { ...question.translation, options: result.translationOptions }
      })
    }
  }
  return question
}

const currentQuestionWithOptions = computed(() => {
  if (!currentQuestion.value) return null
  return getQuestionWithShuffledOptions(currentQuestion.value)
})

// ========== AnswerOverview props ==========
const answerOverviewProps = computed(() => {
  if (isExamMode.value) {
    return {
      questions: questions.value,
      currentIndex: currentIndex.value,
      currentSubIndex: 0,
      userAnswers: userAnswers.value,
      buttonText: 'submitPaper'
    }
  }
  return {
    questions: bank.value,
    currentIndex: currentIndex.value,
    currentSubIndex: currentSubIndex.value,
    settings: practiceData.value,
    answerStatus: answerStatus.value,
    userAnswers: userAnswers.value
  }
})

// ========== 导航 ==========
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    if (!isExamMode.value) savePracticeProgress()
  }
}

const nextQuestion = () => {
  const maxIdx = isExamMode.value ? questions.value.length : bank.value.length
  if (currentIndex.value < maxIdx - 1) {
    currentIndex.value++
    if (!isExamMode.value) savePracticeProgress()
  }
}

const gotoQuestion = (idx) => {
  currentIndex.value = idx
  closeAnswerCard()
}

const toggleAnswerCard = () => {
  showAnswerCard.value = !showAnswerCard.value
}

const closeAnswerCard = () => {
  showAnswerCard.value = false
}

// ========== 考试挂载 ==========
async function loadExamPaper() {
  const paperId = parseInt(route.query.id)
  if (!paperId) {
    router.push('/exam')
    return
  }
  store.loadExamPapers()
  const foundPaper = store.examPapers.find(p => p.id === paperId)
  if (!foundPaper) {
    loading.value = false
    return
  }
  paper.value = foundPaper
  questions.value = foundPaper.questions || []
  const duration = foundPaper.duration || 120
  remainingSeconds.value = duration * 60
  loading.value = false
  startTimer()
}

// ========== 练习挂载 ==========
const questionLoaders = {
  bank: async (data) => {
    const subjectName = typeof data.subject === 'object' ? data.subject.name : data.subject
    await store.loadSubjectQuestions(subjectName)
    let questions = [...store.rawQuestions]
    if (data.wrongPractice && data.wrongQuestionIds) {
      const wrongIds = new Set(data.wrongQuestionIds)
      questions = questions.filter(q =>
        wrongIds.has(q.id) || (q.subs && q.subs.some(sub => wrongIds.has(sub.sid)))
      )
    }
    return questions
  },
  wrongbook: () => [...store.wrongBook],
  favorites: () => [...store.favorites],
}

async function loadPracticeSession() {
  if (!route.query.sessionId) {
    router.push({ name: 'Practice' })
    return
  }
  try {
    practiceData.value = getPracticeSession(route.query.sessionId)
    if (!practiceData.value) {
      router.push({ name: 'Practice' })
      return
    }
    const { category, scope, subject, questionSort, source: dataSource } = practiceData.value
    const source = dataSource || 'bank'
    const subjectName = typeof subject === 'object' ? subject.name : subject
    const loader = questionLoaders[source]
    if (!loader) {
      router.push({ name: 'Practice' })
      return
    }
    let rawQuestions = await loader(practiceData.value)
    if (rawQuestions.length === 0) {
      if (source === 'wrongbook') router.push({ name: 'WrongBook' })
      else if (source === 'favorites') router.push({ name: 'Favorites' })
      else router.push({ name: 'Practice' })
      return
    }
    const practiceKey = getPracticeKey({ bank: { category, scope, subject: subjectName } })
    const isContinue = route.query.continue === 'true'
    if (source === 'bank' && isContinue) {
      const savedProgress = store.getPracticeProgress(practiceKey)
      const isSameSubject = savedProgress?.config?.bank?.subject === subjectName
      if (isSameSubject && savedProgress?.progress?.questionIds?.length > 0) {
        const savedQuestionIds = savedProgress.progress.questionIds
        const existingQuestions = new Set(rawQuestions.map(q => q.id))
        const validIds = savedQuestionIds.filter(id => existingQuestions.has(id))
        rawQuestions = validIds.map(id => rawQuestions.find(q => q.id === id)).filter(Boolean)
      }
    } else if (source === 'bank') {
      if (practiceData.value?.practiceMode !== 'review') {
        if (questionSort === QUESTION_SORT.SHUFFLE) {
          rawQuestions = shuffleArray(rawQuestions)
        } else if (questionSort === QUESTION_SORT.REVERSE) {
          rawQuestions = [...rawQuestions].reverse()
        }
      }
    } else {
      rawQuestions = [...rawQuestions].sort(() => Math.random() - 0.5)
    }
    bank.value = rawQuestions
    cacheShuffledOptions()
    if (source === 'bank') {
      loadPracticeProgress()
    }
    if (source === 'bank' && isContinue) {
      const saved = store.practiceProgress?.[practiceKey]
      const tl = saved?.timeline || saved?.meta || {}
      if (tl.elapsedSeconds) elapsedSeconds.value = tl.elapsedSeconds
      if (tl.startedAt) startedAt.value = tl.startedAt
    } else {
      elapsedSeconds.value = 0
      startedAt.value = Date.now()
    }
    startTimer()
  } catch (e) {
    console.error('解析练习数据失败:', e)
    router.push({ name: 'Practice' })
  }
}

onMounted(async () => {
  if (isExamMode.value) {
    await loadExamPaper()
  } else {
    await loadPracticeSession()
  }
  loading.value = false
})

onUnmounted(() => {
  stopTimer()
  if (!isExamMode.value) {
    savePracticeProgress()
  }
})

// ========== 练习模式 - 答题检查 ==========
const isCurrentAnswerChecked = computed(() => {
  if (!currentQuestion.value) return false
  if (practiceMode.value === 'review') return true
  return answerChecked.value[currentQuestion.value.id] || false
})

const currentQuestionDisplay = useQuestionHandler({
  practiceMode,
  showAnswerMode: computed(() => practiceData.value?.showAnswerMode),
  question: currentQuestion,
  userAnswer: computed(() => userAnswers.value[currentQuestion.value?.id]),
  isChecked: isCurrentAnswerChecked
})

const handleAnswer = (answer) => {
  if (!currentQuestion.value) return
  const questionId = currentQuestion.value.id
  userAnswers.value[questionId] = answer
  if (!isExamMode.value && currentQuestionDisplay.shouldAutoCheck.value) {
    const capturedId = questionId
    setTimeout(() => {
      if (currentQuestion.value?.id !== capturedId) return
      checkCurrentAnswer()
    }, 100)
  }
}

const checkCurrentAnswer = () => {
  const question = currentQuestionWithOptions.value || currentQuestion.value
  if (!question) return
  const questionId = question.id
  const userAnswer = userAnswers.value[questionId]
  const status = getAnswerStatus(question, userAnswer)
  answerStatus.value[questionId] = status || 'unanswered'
  answerChecked.value[questionId] = true
  if (typeof status === 'object') {
    question.subs?.forEach((sub, idx) => {
      if (status[idx] === 'wrong') pm.markWrong(sub, question)
    })
  } else if (status === 'wrong') {
    pm.markWrong(question)
  }
  if (soundEnabled.value) {
    const allCorrect = typeof status === 'object'
      ? question.subs?.every((_, idx) => status[idx] === 'correct')
      : status === 'correct'
    playAnswerSound(allCorrect ? 'correct' : 'wrong')
  }
  savePracticeProgress()
  if (practiceData.value?.autoJump) {
    const isAllCorrect = typeof status === 'object'
      ? question.subs?.every((_, idx) => status[idx] === 'correct')
      : status === 'correct'
    if (isAllCorrect) {
      setTimeout(() => {
        if (currentQuestion.value?.id !== questionId) return
        nextQuestion()
      }, 500)
    }
  }
}

const handleCheckSub = (subIndex) => {
  const question = currentQuestion.value
  if (!question) return
  const questionId = question.id
  const userAnswer = userAnswers.value[questionId]
  const subAnswer = userAnswer?.[subIndex]
  const status = getAnswerStatus(question.subs?.[subIndex], subAnswer)
  if (!answerChecked.value[questionId]) answerChecked.value[questionId] = {}
  if (!answerStatus.value[questionId]) answerStatus.value[questionId] = {}
  answerChecked.value[questionId][subIndex] = true
  answerStatus.value[questionId][subIndex] = status
  if (status === 'wrong') pm.markWrong(question.subs?.[subIndex], question)
  if (soundEnabled.value) playAnswerSound(status)
}

const handleGoSub = (index) => {
  currentSubIndex.value = index
}

// ========== 练习模式 - 进度 ==========
const loadPracticeProgress = () => {
  if (!practiceData.value) return
  if (route.query.continue !== 'true') return
  const { category, scope, subject } = practiceData.value
  const subjectName = typeof subject === 'object' ? subject.name : subject
  const key = getPracticeKey({ bank: { category, scope, subject: subjectName } })
  const savedProgress = store.getPracticeProgress(key)
  if (savedProgress && savedProgress.config?.bank) {
    const sameSubject = savedProgress.config.bank.subject === subjectDisplay.value
    if (sameSubject) {
      currentIndex.value = savedProgress.progress.currentIndex || 0
      currentSubIndex.value = savedProgress.progress.currentSubIndex || 0
      const { userAnswers: ua, answerChecked: ac, answerStatus: as } =
        unpackProgress(savedProgress.progress.answers || {})
      Object.entries(ua).forEach(([qId, answer]) => {
        const q = bank.value.find(q => q.id === qId)
        if (!q) return
        const cache = shuffledOptionsCache.value[qId]
        if (cache) {
          const packed = savedProgress.progress.answers?.[qId]
          if (packed?.selectedText !== undefined && typeof packed.selectedText === 'string') {
            const idx = cache.options.indexOf(packed.selectedText)
            if (idx !== -1) ua[qId] = idx
          }
        } else if (q.options && !q.shuffle) {
          const packed = savedProgress.progress.answers?.[qId]
          if (packed?.selectedText !== undefined && typeof packed.selectedText === 'string') {
            const idx = q.options.indexOf(packed.selectedText)
            if (idx !== -1) ua[qId] = idx
          }
        }
        if (q.subs && typeof answer === 'object' && answer !== null) {
          const packed = savedProgress.progress.answers?.[qId]
          const st = packed?.selectedText
          if (st && typeof st === 'object') {
            const newAnswer = { ...answer }
            q.subs.forEach((sub, idx) => {
              if (st[idx] !== undefined && sub.options) {
                const subCache = shuffledOptionsCache.value[qId]?.subOptions?.[idx]
                const opts = subCache || sub.options
                const pos = opts.indexOf(st[idx])
                if (pos !== -1) newAnswer[idx] = pos
              }
            })
            ua[qId] = newAnswer
          }
        }
      })
      userAnswers.value = ua
      answerChecked.value = ac
      answerStatus.value = as
    }
  }
}

const savePracticeProgress = () => {
  if (practiceData.value?.wrongPractice) return
  const source = practiceData.value?.source
  if (source && source !== 'bank') return
  saveProgress(
    {
      bank: {
        subject: practiceData.value?.subject?.name,
        category: practiceData.value?.subject?.category,
        scope: practiceData.value?.subject?.scope
      },
      mode: practiceData.value?.practiceMode,
      questionSort: practiceData.value?.questionSort,
      showAnswerMode: practiceData.value?.showAnswerMode,
      autoJump: practiceData.value?.autoJump
    },
    currentIndex.value,
    currentSubIndex.value,
    bank.value,
    userAnswers.value,
    answerChecked.value,
    answerStatus.value,
    elapsedSeconds.value,
    practiceData.value?.shuffleSeed
  )
  store.loadPracticeProgress()
}

// ========== 练习模式 - 退出/完成 ==========
const exitQuiz = () => {
  if (confirm('确定要退出答题吗？')) {
    savePracticeProgress()
    router.push({ name: 'Practice' })
  }
}

const finishQuiz = () => {
  if (confirm('确定完成答题并退出吗？')) {
    if (isWrongPractice.value) {
      router.push({ name: 'Home' })
      return
    }
    if (practiceMode.value === 'review') {
      const key = getPracticeKey({
        category: practiceData.value?.subject?.category,
        scope: practiceData.value?.subject?.scope,
        subject: practiceData.value?.subject?.name
      })
      store.clearPracticeProgress(key)
      router.push({ name: 'Home' })
      return
    }
    const answers = packProgress(bank.value, userAnswers.value, answerChecked.value, answerStatus.value)
    pm.completeSession(
      {
        bank: {
          subject: practiceData.value?.subject?.name,
          category: practiceData.value?.subject?.category,
          scope: practiceData.value?.subject?.scope
        },
        mode: practiceData.value?.practiceMode,
        questionSort: practiceData.value?.questionSort,
        showAnswerMode: practiceData.value?.showAnswerMode,
        autoJump: practiceData.value?.autoJump
      },
      {
        answers,
        questionIds: bank.value.map(q => q.id),
        currentIndex: currentIndex.value,
        elapsedSeconds: elapsedSeconds.value
      },
      startedAt.value
    )
    router.push({ name: 'PracticeResult' })
  }
}

const gotoQuesitonIdx = (idx, sqIdx) => {
  currentIndex.value = idx
  if (sqIdx !== undefined) currentSubIndex.value = sqIdx
  savePracticeProgress()
  closeAnswerCard()
}

const openJumpDialog = () => {
  jumpDialogVisible.value = true
}

// ========== 练习模式 - 工具栏 ==========
const toggleTranslation = () => {
  showTranslation.value = !showTranslation.value
}

const toggleShowExplanation = () => {
  showExplanationPref.value = !showExplanationPref.value
}

const toggleFavorite = () => {
  if (!currentQuestion.value) return
  if (isFavorited.value) {
    store.removeFavorite(currentQuestion.value.id)
  } else {
    store.addFavorite(currentQuestion.value)
  }
}

const removeCurrentFromWrong = () => {
  if (confirm('将该题从错题集中移除？')) {
    const q = bank.value[currentIndex.value]
    if (!q) return
    store.removeWrongQuestion(q.id)
    if (isWrongPractice.value) {
      bank.value.splice(currentIndex.value, 1)
      if (currentIndex.value >= bank.value.length && currentIndex.value > 0) {
        currentIndex.value--
      }
      savePracticeProgress()
    }
  }
}

function isWrongStatus(status) {
  if (typeof status === 'string') return status === 'wrong' || status === 'partial'
  if (typeof status === 'object') return Object.values(status).some(s => s === 'wrong')
  return false
}

const currentMode = computed(() => isWrongPractice.value ? 'wrong' : practiceMode.value)

const buttonVisibility = computed(() => ({
  translate: currentQuestion.value?.translation,
  explanation: true,
  favorite: currentMode.value !== 'wrong' && currentMode.value !== 'favorites',
  removeWrong: isInWrongBook.value,
  stats: true,
  answerCard: true,
}))

const actionButtons = [
  {
    key: 'translate',
    iconName: 'g-translate',
    title: '翻译',
    active: computed(() => showTranslation.value),
    action: toggleTranslation,
  },
  {
    key: 'explanation',
    iconName: 'rate-review-outline',
    title: '显示解析',
    active: computed(() => showExplanationPref.value),
    action: toggleShowExplanation,
  },
  {
    key: 'favorite',
    iconName: computed(() => isFavorited.value ? 'kid-star' : 'kid-star-outline'),
    title: '收藏',
    active: computed(() => isFavorited.value),
    action: toggleFavorite,
  },
  {
    key: 'removeWrong',
    iconName: 'playlist-remove',
    title: '移出错题集',
    active: computed(() => isInWrongBook.value),
    action: removeCurrentFromWrong,
  },
  {
    key: 'stats',
    iconName: 'bar-chart',
    title: '答题统计',
    active: computed(() => showStatsDialog.value),
    action: () => showStatsDialog.value = true,
  },
  {
    key: 'answerCard',
    iconName: computed(() => showAnswerCard.value ? 'grid-view' : 'grid-view-outline'),
    title: '答题卡',
    active: computed(() => showAnswerCard.value),
    action: toggleAnswerCard,
  },
]

const visibleButtons = computed(() =>
  actionButtons.filter(b => buttonVisibility.value[b.key])
)
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background-secondary);
  max-width: var(--app-max-width);
  margin: 0 auto;
  padding-bottom: 120px;
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

.header-title h1 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.header-subtitle {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
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

.timer-display svg {
  font-size: var(--font-size-2xl);
}

.grid-btn {
  width: 25px;
  height: 25px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.grid-btn svg {
  font-size: var(--font-size-3xl);
}

.grid-btn.active svg {
  color: var(--primary);
}

.progress-action-bar {
  background: var(--background);
  border-bottom: 1px solid var(--border-color-light);
}

.progress-bar-container {
  padding: var(--spacing-sm) var(--spacing-md) 0;
}

.progress-bar {
  height: 6px;
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-full);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  padding: 4px var(--spacing-md) 6px;
}

.action-bar-right {
  display: flex;
  gap: 6px;
}

.progress-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  color: var(--primary);
  background: var(--primary-light);
  padding: 2px 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
  user-select: none;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--icon-color);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-gray-200);
}

.action-btn.active {
  color: var(--accent);
}

.action-btn svg {
  font-size: 18px;
}

.question-container {
  padding: var(--spacing-md);
}
</style>
