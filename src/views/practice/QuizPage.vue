<template>
  <div class="page">
    <header class="top-bar">
      <div class="top-bar-left">
        <div class="header-title">
          <h1>{{ t(subjectDisplay) }}</h1>
          <span class="header-subtitle">{{ t(practiceData?.category) || practiceData?.category || "" }} •
            {{ t(practiceData?.scope) || practiceData?.scope || "" }}</span>
        </div>
      </div>
      <div class="top-bar-right">
        <div class="timer-display">
          <span class="material-symbols-outlined">timer</span>
          <span>{{ elapsedTimeDisplay }}</span>
        </div>
        <button class="grid-btn" @click="showQuizSettings = true">
          <SvgIcon name="settings"></SvgIcon>
        </button>
      </div>
    </header>

    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress" :style="{ width: progress + '%' }"></div>
      </div>
    </div>

    <div class="action-bar">
      <span class="progress-label" @click="openJumpDialog">进度 {{ currentIndex + 1 }}/{{ bank.length }}</span>
      <div class="action-bar-right">
        <button v-for="btn in visibleButtons" :key="btn.key" class="action-btn"
          :class="{ active: btn.active?.value, 'remove-btn': btn.key === 'removeWrong' }"
          @click="btn.action" :title="btn.title">
          <SvgIcon v-if="btn.iconType === 'svg'" size="20px" :name="btn.icon.value || btn.icon" />
          <span v-else class="material-symbols-outlined">{{ btn.icon }}</span>
        </button>
      </div>
    </div>

    <main class="question-container">
      <div v-if="loading" style="text-align: center; padding: 40px">
        <p>{{ t("loadingQuestions") }}</p>
      </div>
      <template v-else>
        <div v-if="currentQuestion">
          <QuestionRenderer :question="currentQuestionWithOptions" :mode="practiceMode"
            :user-answer="userAnswers[currentQuestion?.id]" :show-answer="currentQuestionDisplay.shouldShowAnswer.value"
            :show-answer-mode="practiceData?.showAnswerMode" :auto-jump="practiceData?.autoJump"
            :show-explanation="showAnswerExplanation" :answerChecked="answerChecked" :answerStatus="answerStatus"
            :current-sub-index="currentSubIndex" @answer="handleAnswer" @next-question="nextQuestion"
            @checkSub="handleCheckSub" @check="checkAnswer" @goSub="handleGoSub" />
        </div>

        <div v-else style="text-align: center; padding: 40px">
          <p>{{ bank.length === 0 ? t("noQuestions") : t("loadingQuestions") }}</p>
        </div>
      </template>
    </main>

    <QustionNavbar :prevDisabled="currentIndex === 0" :isLast="currentIndex === bank.length - 1"
      :subCount="currentSubCount" :currentSubIndex="currentSubIndex" :subStatuses="currentSubStatuses"
      @prev="prevQuestion" @next="nextQuestion" @submit="finishQuiz" @goSub="handleGoSub" />

    <AnswerCard v-if="showAnswerCard" :questions="bank" :currentIndex="currentIndex" :currentSubIndex="currentSubIndex"
      :settings="practiceData" :answerChecked="answerChecked" :answerStatus="answerStatus" :userAnswers="userAnswers"
      @close="closeAnswerCard" @go="gotoQuesitonIdx" />

    <PracticeStats v-if="showStatsDialog" :total="liveStats.total" :correct="liveStats.correct" :wrong="liveStats.wrong"
      :unanswered="liveStats.unanswered" :accuracy="liveStats.accuracy" :elapsed="liveStats.elapsed"
      :current="liveStats.current" :totalQ="liveStats.totalQ" :settings="practiceData"
      @close="showStatsDialog = false" />

    <QuizSettings v-if="showQuizSettings" :showExplanation="showExplanationPref"
      :forceExplanationOnWrong="forceExplanationOnWrong"
      :autoJump="practiceData?.autoJump ?? true" :darkMode="darkMode" :soundEnabled="soundEnabled"
      @close="showQuizSettings = false"
      @update:showExplanation="showExplanationPref = $event"
      @update:forceExplanationOnWrong="forceExplanationOnWrong = $event"
      @update:autoJump="practiceData.autoJump = $event" @update:darkMode="darkMode = $event"
      @update:soundEnabled="soundEnabled = $event"
      @exit="exitQuiz" @submit="finishQuiz" />

    <JumpDialog :visible="jumpDialogVisible" :total="bank.length" :current="currentIndex"
      @close="jumpDialogVisible = false" @jump="gotoQuesitonIdx" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, provide, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import AnswerCard from "@/components/page/AnswerCard.vue";
import PracticeStats from "@/components/page/PracticeStats.vue";
import QuizSettings from "@/components/page/QuizSettings.vue";
import QustionNavbar from "@/components/layout/QuestionNavbar.vue";
import QuestionRenderer from "@/components/question/QuestionRenderer.vue";
import JumpDialog from "@/components/page/JumpDialog.vue";
import { useAppStore } from "@/stores/store";
import { usePracticeService } from "@/composables/usePracticeService";
import { t } from "@/utils/i18n.js";
import { useQuestionHandler } from "@/composables/useQuestionHandler";
import { useSoundEffect } from "@/composables/useSoundEffect";
import {
  QUESTION_SORT,
  canAutoCheck,
  getAnswerStatus,
  savePracticeProgress as saveProgress,
  loadPracticeProgress as loadProgress,
  unpackProgress,
  isComplexQuestion,
  packProgress,
  getPracticeKey
} from "@/utils/questionConfig";

const router = useRouter();
const route = useRoute();
const store = useAppStore();
const pm = usePracticeService();
const soundEnabled = ref(localStorage.getItem('soundEnabled') !== 'false');
const { playAnswerSound } = useSoundEffect(soundEnabled);

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

const showAnswerCard = ref(false);
const showCheckBtn = ref(true);
const showAnswerExplanation = ref(false);
const practiceData = ref(null);
const bank = ref([]);
const currentIndex = ref(0);
const currentSubIndex = ref(0); // 阅读理解子题索引
const userAnswers = ref({});
const answerChecked = ref({}); // 每个题目的答案检查状态
const answerStatus = ref({}); // 每个题目的答案状态: correct/wrong/partial/unchecked/unanswered
const shuffledOptionsCache = ref({}); // 缓存选项乱序结果
const showStatsDialog = ref(false);
const showQuizSettings = ref(false);
const jumpDialogVisible = ref(false);
const darkMode = ref(localStorage.getItem('darkMode') === 'true');
const loading = ref(true);

watch(darkMode, (val) => {
  document.documentElement.classList.toggle('dark', val)
  localStorage.setItem('darkMode', val)
}, { immediate: true })

watch(soundEnabled, (val) => {
  localStorage.setItem('soundEnabled', val)
})

const showExplanationPref = ref(localStorage.getItem('showExplanationPref') !== 'false')
watch(showExplanationPref, (val) => {
  localStorage.setItem('showExplanationPref', val)
  if (!val) showAnswerExplanation.value = false
})

const forceExplanationOnWrong = ref(localStorage.getItem('forceExplanationOnWrong') !== 'false')
watch(forceExplanationOnWrong, (val) => {
  localStorage.setItem('forceExplanationOnWrong', val)
})

function isWrongStatus(status) {
  if (typeof status === 'string') return status === 'wrong' || status === 'partial'
  if (typeof status === 'object') return Object.values(status).some(s => s === 'wrong')
  return false
}

// 计时器相关
const elapsedSeconds = ref(0); // 已用时间（秒）
let timerInterval = null; // 计时器 interval

onMounted(async () => {
  if (!route.query.practiceData) {
    router.push({ name: "Practice" })
    loading.value = false
    return
  }

  try {
    practiceData.value = JSON.parse(route.query.practiceData)
    const { category, scope, subject, questionSort, source: dataSource } = practiceData.value
    const source = dataSource || 'bank'
    const subjectName = typeof subject === "object" ? subject.name : subject

    console.log("QuizPage 接收参数:", { category, scope, subject: subjectName, questionSort, source })

    const loader = questionLoaders[source]
    if (!loader) {
      router.push({ name: "Practice" })
      loading.value = false
      return
    }

    let questions = await loader(practiceData.value)

    if (questions.length === 0) {
      if (source === 'wrongbook') router.push({ name: 'WrongBook' })
      else if (source === 'favorites') router.push({ name: 'Favorites' })
      else router.push({ name: 'Practice' })
      loading.value = false
      return
    }

    console.log("题目数量:", questions.length)

    const practiceKey = getPracticeKey({ bank: { category, scope, subject: subjectName } })
    const isContinue = route.query.continue === 'true'

    if (source === 'bank' && isContinue) {
      const savedProgress = store.getPracticeProgress(practiceKey)
      const isSameSubject = savedProgress?.config?.bank?.subject === subjectName
      if (isSameSubject && savedProgress?.progress?.questionIds?.length > 0) {
        const savedQuestionIds = savedProgress.progress.questionIds
        const existingQuestions = new Set(questions.map(q => q.id))
        const validIds = savedQuestionIds.filter(id => existingQuestions.has(id))
        questions = validIds.map(id => questions.find(q => q.id === id)).filter(Boolean)
        console.log("已恢复题目顺序，题数:", questions.length)
      }
    } else if (source === 'bank') {
      if (practiceData.value?.practiceMode !== 'review') {
        if (questionSort === QUESTION_SORT.SHUFFLE) {
          questions = shuffleArray(questions)
        } else if (questionSort === QUESTION_SORT.REVERSE) {
          questions = [...questions].reverse()
        }
      }
    } else {
      questions = [...questions].sort(() => Math.random() - 0.5)
    }

    bank.value = questions

    cacheShuffledOptions()
    console.log("bank.value 长度:", bank.value.length)

    if (source === 'bank') {
      loadPracticeProgress()
    }

    if (practiceData.value?.practiceMode === 'review') {
      showCheckBtn.value = false
      showAnswerExplanation.value = true
    }

    if (source === 'bank' && isContinue && store.practiceProgress?.[practiceKey]?.meta?.elapsedSeconds) {
      elapsedSeconds.value = store.practiceProgress[practiceKey].meta.elapsedSeconds
    } else {
      elapsedSeconds.value = 0
    }
    startTimer()
  } catch (e) {
    console.error("解析练习数据失败:", e)
    router.push({ name: "Practice" })
  }
  loading.value = false
})

// 页面卸载时停止计时并保存进度（刷新、关闭页面等）
onUnmounted(() => {
  stopTimer();
  savePracticeProgress();
});

// 进度计算
const progress = computed(() => {
  if (bank.value.length === 0) return 0;
  return Math.round(((currentIndex.value + 1) / bank.value.length) * 100);
});

// 当前题目
const currentQuestion = computed(() => {
  if (bank.value && bank.value.length > 0 && bank.value[currentIndex.value]) {
    return bank.value[currentIndex.value];
  }
  return null;
});

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

// 科目显示名称
const subjectDisplay = computed(() => {
  if (!practiceData.value) return "练习";
  const subject = practiceData.value.subject;
  return typeof subject === "object" ? subject.name : subject;
});

const isWrongPractice = computed(() => practiceData.value?.wrongPractice)

const showTranslation = ref(false)
provide('showTranslation', showTranslation)

const toggleTranslation = () => {
  showTranslation.value = !showTranslation.value
}

const isFavorited = computed(() => {
  if (!currentQuestion.value) return false
  return store.favorites.some(q => q.id === currentQuestion.value.id)
})

const isInWrongBook = computed(() => {
  if (!currentQuestion.value) return false
  return store.wrongBook.some(q => q.id === currentQuestion.value.id)
})

const toggleFavorite = () => {
  if (!currentQuestion.value) return
  if (isFavorited.value) {
    store.removeFavorite(currentQuestion.value.id)
  } else {
    store.addFavorite(currentQuestion.value)
  }
}

// 计时器相关
const elapsedTimeDisplay = computed(() => {
  const hours = Math.floor(elapsedSeconds.value / 3600);
  const minutes = Math.floor((elapsedSeconds.value % 3600) / 60);
  const seconds = elapsedSeconds.value % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

// 实时答题统计
const liveStats = computed(() => {
  let correct = 0, wrong = 0, total = 0
  bank.value.forEach(q => {
    const status = answerStatus.value[q.id]
    if (isComplexQuestion(q)) {
      const subs = q.subs || []
      subs.forEach((_, idx) => {
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
  const unanswered = total - correct - wrong
  return {
    total,
    correct,
    wrong,
    unanswered,
    accuracy: (correct + wrong) > 0 ? Math.round(correct / (correct + wrong) * 100) : 0,
    current: currentIndex.value + 1,
    totalQ: bank.value.length,
    elapsed: elapsedSeconds.value
  }
})

// 开始计时
const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedSeconds.value++;
  }, 1000);
};

// 停止计时
const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// 种子随机数生成器（mulberry32）
function seededRandom(seed) {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Fisher-Yates 洗牌算法
const shuffleArray = (array, rng = Math.random) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// 按每题 shuffle 字段缓存选项乱序结果（背题模式不乱序）
const cacheShuffledOptions = () => {
  if (practiceData.value?.practiceMode === 'review') return;

  const seed = practiceData.value?.shuffleSeed
  const rng = seed ? seededRandom(seed) : Math.random

  shuffledOptionsCache.value = {};
  bank.value.forEach((question) => {
    if (question && question.options && question.shuffle) {
      const indices = question.options.map((_, i) => i);
      const shuffledIndices = shuffleArray(indices, rng);
      shuffledOptionsCache.value[question.id] = {
        options: shuffledIndices.map(i => question.options[i]),
        translationOptions: question.translation?.options
          ? shuffledIndices.map(i => question.translation.options[i])
          : null
      };
    }
  });
  console.log("已缓存选项乱序，题数:", Object.keys(shuffledOptionsCache.value).length);
};

// 获取带乱序选项的题目（按每题 shuffle 字段，背题模式不乱序）
const getQuestionWithShuffledOptions = (question) => {
  if (!question || !question.options) return question;
  if (practiceData.value?.practiceMode === 'review') return question;

  if (question.shuffle) {
    const cached = shuffledOptionsCache.value[question.id];
    if (cached) {
      return {
        ...question,
        options: cached.options,
        ...(cached.translationOptions && {
          translation: { ...question.translation, options: cached.translationOptions }
        })
      };
    }
    const indices = question.options.map((_, i) => i);
    const shuffledIndices = shuffleArray(indices);
    const result = {
      options: shuffledIndices.map(i => question.options[i]),
      translationOptions: question.translation?.options
        ? shuffledIndices.map(i => question.translation.options[i])
        : null
    };
    shuffledOptionsCache.value[question.id] = result;
    return {
      ...question,
      options: result.options,
      ...(result.translationOptions && {
        translation: { ...question.translation, options: result.translationOptions }
      })
    };
  }
  return question;
};

// 当前题目（带乱序选项）
const currentQuestionWithOptions = computed(() => {
  if (!currentQuestion.value) return null;
  return getQuestionWithShuffledOptions(currentQuestion.value);
});

// 用户答案（简化：直接返回，不做额外处理）
const userAnswerForRenderer = computed(() => {
  if (!currentQuestion.value) return null;
  return userAnswers.value[currentQuestion.value.id] ?? null;
})

// 切换答案卡片
const toggleAnswerCard = () => {
  showAnswerCard.value = !showAnswerCard.value;
};

const closeAnswerCard = () => {
  showAnswerCard.value = false;
};

// 退出答题
const exitQuiz = () => {
  if (confirm("确定要退出答题吗？")) {
    // 保存当前进度再退出
    savePracticeProgress();
    router.push({ name: "Practice" });
  }
};

const finishQuiz = () => {
  if (confirm("确定完成答题并退出吗？")) {
    if (isWrongPractice.value) {
      router.push({ name: "Home" })
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
      }
    )
    router.push({
      name: "PracticeResult",
      query: { practiceData: JSON.stringify(practiceData.value) },
    });
  }
};

const handleGoSub = (index) => {
  currentSubIndex.value = index
}

const gotoQuesitonIdx = (idx, sqIdx) => {
  currentIndex.value = idx;
  if (sqIdx !== undefined) {
    currentSubIndex.value = sqIdx;
  }
  resetQuestionState();
  closeAnswerCard();

}

const openJumpDialog = () => {
  jumpDialogVisible.value = true
}

// 练习模式
const practiceMode = computed(() => {
  return practiceData.value?.practiceMode || "answer";
});

// 当前题目是否已检查答案（需要先定义）
const isCurrentAnswerChecked = computed(() => {
  if (!currentQuestion.value) return false;
  // 背题模式：直接显示答案
  if (practiceMode.value === 'review') return true;
  return answerChecked.value[currentQuestion.value.id] || false;
});

// 当前题目的答案显示逻辑
const currentQuestionDisplay = useQuestionHandler({
  practiceMode,
  showAnswerMode: computed(() => practiceData.value?.showAnswerMode),
  question: currentQuestion,
  userAnswer: computed(() => userAnswers.value[currentQuestion.value?.id]),
  isChecked: isCurrentAnswerChecked
})

// 是否应该显示检查答案按钮
const shouldShowCheckBtn = computed(() => currentQuestionDisplay.shouldShowCheckBtn.value)

// 是否有用户答案（使用题目 ID 查询）
const hasUserAnswer = computed(() => currentQuestionDisplay.hasUserAnswer.value)

// 当前题目是否禁用（由 QuestionRenderer 内部管理）
const isCurrentAnswerDisabled = computed(() => false)

// 处理用户作答 - 直接保存，不做题型判断
const handleAnswer = (answer) => {
  if (!currentQuestion.value) return
  const question = currentQuestion.value
  console.log('[QuizPage handleAnswer] answer:', answer, 'questionId:', question.id)
  userAnswers.value[question.id] = answer
  // 自动检查答案（立即显示模式）
  if (currentQuestionDisplay.shouldAutoCheck.value) {
    const capturedId = question.id
    setTimeout(() => {
      if (currentQuestion.value?.id !== capturedId) return
      checkAnswer()
    }, 100)
  }
};

// 检查答案
const checkAnswer = () => {
  const question = currentQuestionWithOptions.value || currentQuestion.value
  if (!question) return

  const questionId = question.id
  const userAnswer = userAnswers.value[questionId]

  // 使用统一入口函数获取状态
  const status = getAnswerStatus(question, userAnswer)

  // 根据题型处理
  if (isComplexQuestion(question)) {
    // 复合题型：status 是对象 { 0: 'correct', 1: 'wrong' }
    answerStatus.value[questionId] = status
    answerChecked.value[questionId] = true

    question.subs?.forEach((sub, idx) => {
      if (status[idx] === 'wrong') {
        pm.markWrong(sub, question)
      }
    })
  } else {
    // 简单题型：status 是字符串
    answerStatus.value[questionId] = status || 'unanswered'
    answerChecked.value[questionId] = true

    if (status === 'wrong') {
      pm.markWrong(question)
    }
  }

  // 播放音效
  if (soundEnabled.value) {
    if (isComplexQuestion(question)) {
      const allCorrect = question.subs?.every((_, idx) => status[idx] === 'correct')
      playAnswerSound(allCorrect ? 'correct' : 'wrong')
    } else {
      playAnswerSound(status)
    }
  }

  showCheckBtn.value = false
  if (showExplanationPref.value || (forceExplanationOnWrong.value && isWrongStatus(status))) showAnswerExplanation.value = true
  savePracticeProgress()
}

// 加载练习进度（断点续练）
const handleCheckSub = (subIndex) => {
  const question = currentQuestion.value
  if (!question) return

  const questionId = question.id
  const userAnswer = userAnswers.value[questionId]
  const subAnswer = userAnswer?.[subIndex]

  // 使用工具函数获取子题状态
  const status = getAnswerStatus(question.subs?.[subIndex], subAnswer)

  // 保存状态
  if (!answerChecked.value[questionId]) {
    answerChecked.value[questionId] = {}
  }
  if (!answerStatus.value[questionId]) {
    answerStatus.value[questionId] = {}
  }
  answerChecked.value[questionId][subIndex] = true
  answerStatus.value[questionId][subIndex] = status
};

// 加载练习进度（断点续练）
const loadPracticeProgress = () => {
  if (!practiceData.value) return
  if (route.query.continue !== 'true') return
  const { category, scope, subject } = practiceData.value
  const subjectName = typeof subject === 'object' ? subject.name : subject
  const key = getPracticeKey({ bank: { category, scope, subject: subjectName } })
  const progress = store.getPracticeProgress(key);
  if (progress && progress.config?.bank) {
    // 检查是否是同一个练习
    const sameSubject = progress.config.bank.subject === subjectDisplay.value;
    if (sameSubject) {
      currentIndex.value = progress.progress.currentIndex || 0;
      currentSubIndex.value = progress.progress.currentSubIndex || 0;

      // 使用工具函数解包数据
      const { userAnswers: ua, answerChecked: ac, answerStatus: as } =
        unpackProgress(progress.progress.answers || {})

      // 用 selectedText 重映射索引（适应当前打乱顺序）
      Object.entries(ua).forEach(([qId, answer]) => {
        const q = bank.value.find(q => q.id === qId)
        if (!q) return
        const cache = shuffledOptionsCache.value[qId]
        if (cache) {
          // 简单题：selectedText → 当前打乱后的索引
          const packed = progress.progress.answers?.[qId]
          if (packed?.selectedText !== undefined && typeof packed.selectedText === 'string') {
            const idx = cache.options.indexOf(packed.selectedText)
            if (idx !== -1) ua[qId] = idx
          }
        } else if (q.options && !q.shuffle) {
          // 未打乱的题：直接取 selectedText 在原始选项中的索引
          const packed = progress.progress.answers?.[qId]
          if (packed?.selectedText !== undefined && typeof packed.selectedText === 'string') {
            const idx = q.options.indexOf(packed.selectedText)
            if (idx !== -1) ua[qId] = idx
          }
        }
        // 复合题：selectedText 是对象，对每个子题做相同映射
        if (q.subs && typeof answer === 'object' && answer !== null) {
          const packed = progress.progress.answers?.[qId]
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
      userAnswers.value = ua;
      answerChecked.value = ac;
      answerStatus.value = as;

      // 恢复当前题目的答案检查状态
      const currentQ = bank.value[currentIndex.value];
      if (currentQ) {
        const isChecked = isComplexQuestion(currentQ)
          ? answerChecked.value[currentQ.id]?.[currentSubIndex.value]
          : answerChecked.value[currentQ.id]
        if (isChecked) {
          showCheckBtn.value = false;
          const status = answerStatus.value[currentQ.id]
          if (showExplanationPref.value || (forceExplanationOnWrong.value && isWrongStatus(status))) showAnswerExplanation.value = true;
        }
      }

      // 根据恢复的练习模式决定是否显示答案
      const mode = progress.config.mode || practiceData.value?.practiceMode;
      if (mode === 'review') {
        showCheckBtn.value = false;
        if (showExplanationPref.value) showAnswerExplanation.value = true;
      }

      console.log('已恢复练习进度:', {
        currentIndex: currentIndex.value,
        currentSubIndex: currentSubIndex.value,
        answeredCount: Object.keys(userAnswers.value).length,
        elapsedSeconds: progress.meta?.elapsedSeconds || 0
      });
    }
  }
};

// 保存练习进度
const savePracticeProgress = () => {
  if (practiceData.value?.wrongPractice) return
  // 错题本/收藏本练习不保存进度（无法通过题库继续）
  const source = practiceData.value?.source
  if (source && source !== 'bank') return

  // 使用工具函数保存进度
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
  store.loadPracticeProgress();
};

// 上一题
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    resetQuestionState();
  }
};

// 下一题
const nextQuestion = () => {
  if (currentIndex.value < bank.value.length - 1) {
    currentIndex.value++;
    resetQuestionState();
  }
};

// 重置题目状态
const resetQuestionState = () => {
  // 背题模式：所有题目都显示答案
  if (practiceMode.value === "review") {
    showCheckBtn.value = false;
    if (showExplanationPref.value) showAnswerExplanation.value = true;
  } else {
    // 检查当前题目是否已检查过答案
    const currentQ = bank.value[currentIndex.value];
    if (currentQ && answerChecked.value[currentQ.id]) {
      showCheckBtn.value = false;
      const status = answerStatus.value[currentQ.id]
      if (showExplanationPref.value || (forceExplanationOnWrong.value && isWrongStatus(status))) showAnswerExplanation.value = true;
    } else {
      showCheckBtn.value = true;
      showAnswerExplanation.value = false;
    }
  }

  // 保存进度
  savePracticeProgress();
};

// 移除当前题目出错的题集
const removeCurrentFromWrong = () => {
  if (confirm("将该题从错题集中移除？")) {
    const q = bank.value[currentIndex.value]
    if (!q) return

    store.removeWrongQuestion(q.id)

    if (isWrongPractice.value) {
      bank.value.splice(currentIndex.value, 1)
      if (currentIndex.value >= bank.value.length && currentIndex.value > 0) {
        currentIndex.value--
      }
      resetQuestionState()
    }
  }
}

// 动作栏按钮配置
const currentMode = computed(() => isWrongPractice.value ? 'wrong' : practiceMode.value)

const buttonVisibility = computed(() => ({
  translate: true,
  favorite: currentMode.value !== 'wrong' && currentMode.value !== 'favorites',
  removeWrong: isInWrongBook.value,
  stats: true,
  answerCard: true,
}))

const actionButtons = [
  {
    key: 'translate',
    icon: 'translate',
    iconType: 'svg',
    title: '翻译',
    active: computed(() => showTranslation.value),
    action: toggleTranslation,
  },
  {
    key: 'favorite',
    icon: computed(() => isFavorited.value ? 'kidstar_fill' : 'kidstar'),
    iconType: 'svg',
    title: '收藏',
    active: computed(() => isFavorited.value),
    action: toggleFavorite,
  },
  {
    key: 'removeWrong',
    icon: 'playlist_remove',
    iconType: 'material',
    title: '移出错题集',
    active: computed(() => isInWrongBook.value),
    action: removeCurrentFromWrong,
  },
  {
    key: 'stats',
    icon: 'bar_chart',
    iconType: 'material',
    title: '答题统计',
    action: () => showStatsDialog.value = true,
  },
  {
    key: 'answerCard',
    icon: 'grid_view',
    iconType: 'material',
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
  /* border-bottom: 1px solid var(--border-color); */
}

.top-bar-left {
  margin-left: 10px;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.back-btn {
  /* width: 40px;
  height: 40px; */
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

.timer-display .material-symbols-outlined {
  font-size: var(--font-size-2xl);
}

.grid-btn {
  width: 45px;
  height: 45px;
  border: none;
  /* background: var(--color-gray-100); */
  /* border-radius: var(--radius-full); */
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
  padding: 0 var(--spacing-md);
  background: var(--background);
}

.progress-bar {
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

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  padding: 6px var(--spacing-md);
  background: var(--background);
  border-bottom: 1px solid var(--border-color-light);
}

.action-bar-right {
  display: flex;
  gap: 6px;
}

.progress-label {
  font-size: var(--font-size-sm);
  color: var(--success);
  background: var(--success-light);
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
  background: var(--accent-light);
}

.action-btn .material-symbols-outlined {
  font-size: 18px;
}

.question-container {
  padding: var(--spacing-md);
}

.question-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background);
  border: 1px solid transparent;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.question-type-tag {
  padding: var(--spacing-mn) var(--spacing-sm);
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.question-id {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  flex: 1;
}

.fav-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.fav-btn:active {
  transform: scale(0.95);
}

.fav-btn.active {
  color: var(--warning);
}

.fav-btn .material-symbols-outlined {
  font-size: 20px;
}

.question-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--on-surface);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}

/* 检查答案按钮 */
.check-answer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.check-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--color-gray-500);
  border-radius: var(--radius-full);
  background: var(--background);
  color: var(--primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all 0.2s;
}

.check-btn:hover {
  background: var(--color-gray-100);
}

.check-btn:active {
  transform: scale(0.98);
}

.check-btn .material-symbols-outlined {
  font-size: var(--font-size-xl);
}

svg-icon {
  display: inline-block;
  /* 让它变成一个有面积的盒子 */
  width: 20px;
  /* 必须给明确的宽度 */
  height: 20px;
  /* 必须给明确的高度 */
}
</style>
