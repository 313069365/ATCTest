<template>
  <div class="page">
    <header class="top-bar">
      <div class="top-bar-left" @click="exitQuiz">
        <button class="back-btn">
          <span class="material-symbols-outlined">close</span>
        </button>
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
        <button class="grid-btn">
          <svg-icon name="settings"></svg-icon>
        </button>
      </div>
    </header>

    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress" :style="{ width: progress + '%' }"></div>
      </div>
    </div>

    <div class="action-bar">
      <span class="progress-label">进度 {{ currentIndex + 1 }}/{{ bank.length }}</span>
      <div class="action-bar-right">
        <button class="action-btn">
          <span class="material-symbols-outlined">mode_night</span>
        </button>
        <button class="action-btn" :class="{ active: showTranslation }" @click="toggleTranslation" title="翻译">
          <svg-icon size="20px" name="translate"></svg-icon>
        </button>
        <!-- <button class="action-btn" :class="{ active: isFavorited }" @click="toggleFavorite" title="收藏">
          <span class="material-symbols-outlined">kid_star</span>
        </button> -->
        <button class="action-btn" :class="{ active: isFavorited }" @click="toggleFavorite" title="收藏">
          <svg-icon v-if="isFavorited" size="20px" name="kidstar_fill"></svg-icon>
          <svg-icon v-else size="20px" name="kidstar"></svg-icon>
        </button>
        <!--  错题集 
        <button class="action-btn" :class="{ active: isInWrongBook }" @click="toggleFavorite" title="错题集">
          <svg-icon v-if="isFavorited" size="20px" name="kidstar_fill"></svg-icon>
          <svg-icon v-else size="20px" name="kidstar"></svg-icon>
        </button>

        答题模式标记
        <button class="action-btn" :class="{ active: isInWrongBook }" @click="toggleFavorite" title="错题集">
          <svg-icon v-if="isFavorited" size="20px" name="kidstar_fill"></svg-icon>
          <svg-icon v-else size="20px" name="kidstar"></svg-icon>
        </button> -->
        <button v-if="isWrongPractice" class="action-btn remove-btn" @click="removeCurrentFromWrong" title="移出错题集">
          <span class="material-symbols-outlined">playlist_remove</span>
        </button>
        <button class="action-btn" :class="{ active: showAnswerCard }" @click="toggleAnswerCard">
          <span class="material-symbols-outlined">grid_view</span>
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
            :answerChecked="answerChecked" :answerStatus="answerStatus" :current-sub-index="currentSubIndex"
            @answer="handleAnswer" @next-question="nextQuestion" @checkSub="handleCheckSub" @check="checkAnswer" />
        </div>

        <div v-else style="text-align: center; padding: 40px">
          <p>{{ bank.length === 0 ? t("noQuestions") : t("loadingQuestions") }}</p>
        </div>
      </template>
    </main>

    <QustionNavbar :prevDisabled="currentIndex === 0" :isLast="currentIndex === bank.length - 1" @prev="prevQuestion"
      @next="nextQuestion" @submit="finishQuiz" />

    <AnswerCard v-if="showAnswerCard" :questions="bank" :currentIndex="currentIndex" :currentSubIndex="currentSubIndex"
      :settings="practiceData" :answerChecked="answerChecked" :answerStatus="answerStatus" :userAnswers="userAnswers"
      @close="closeAnswerCard" @exit="exitQuiz" @go="gotoQuesitonIdx" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, provide } from "vue";
import { useRouter, useRoute } from "vue-router";
import AnswerCard from "@/components/page/AnswerCard.vue";
import QustionNavbar from "@/components/layout/QuestionNavbar.vue";
import QuestionRenderer from "@/components/question/QuestionRenderer.vue";
import { useAppStore } from "@/stores/store";
import { t } from "@/utils/i18n.js";
import { useQuestionHandler } from "@/composables/useQuestionHandler";
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
const loading = ref(true);

// 计时器相关
const elapsedSeconds = ref(0); // 已用时间（秒）
let timerInterval = null; // 计时器 interval

onMounted(async () => {
  // 从 query 获取练习数据
  if (route.query.practiceData) {
    try {
      practiceData.value = JSON.parse(route.query.practiceData);
      const { category, scope, subject, questionSort } = practiceData.value;

      // subject 可能是对象 { name, category, scope } 或字符串
      const subjectName = typeof subject === "object" ? subject.name : subject;

      console.log("QuizPage 接收参数:", {
        category,
        scope,
        subject: subjectName,
        questionSort,
      });

      // 加载该科目的题目
      await store.loadSubjectQuestions(subjectName);

      // 使用加载的题目
      let filtered = [...store.rawQuestions];

      // 错题练习模式：仅保留错题
      if (practiceData.value?.wrongPractice && practiceData.value?.wrongQuestionIds) {
        const wrongIds = new Set(practiceData.value.wrongQuestionIds)
        filtered = filtered.filter(q => wrongIds.has(q.id))
      }

      console.log("题目数量:", filtered.length);

      // 加载已保存的进度
      const practiceKey = getPracticeKey({ bank: { category, scope, subject: subjectName } });
      const savedProgress = store.getPracticeProgress(practiceKey);
      const isContinue = route.query.continue === 'true';
      const isNewPractice = route.query.newPractice === 'true';
      const isSameSubject = savedProgress?.config?.bank?.subject === subjectName;

      // 排序逻辑
      if (isContinue && isSameSubject && savedProgress?.progress?.questionIds?.length > 0) {
        // 继续练习：恢复之前保存的顺序
        const savedQuestionIds = savedProgress.progress.questionIds;
        const existingQuestions = new Set(filtered.map(q => q.id));
        const validIds = savedQuestionIds.filter(id => existingQuestions.has(id));

        bank.value = validIds.map(id => filtered.find(q => q.id === id)).filter(Boolean);
        console.log("已恢复题目顺序，题数:", bank.value.length);
      } else if (isNewPractice) {
        // 新的练习：应用新的排序设置（背题模式不乱序）
        if (practiceData.value?.practiceMode !== 'review') {
          if (questionSort === QUESTION_SORT.SHUFFLE) {
            filtered = shuffleArray(filtered);
          } else if (questionSort === QUESTION_SORT.REVERSE) {
            filtered = [...filtered].reverse();
          }
        }
        bank.value = filtered;
      } else {
        // 默认行为（无特殊参数）
        if (practiceData.value?.practiceMode !== 'review') {
          if (questionSort === QUESTION_SORT.SHUFFLE) {
            filtered = shuffleArray(filtered);
          } else if (questionSort === QUESTION_SORT.REVERSE) {
            filtered = [...filtered].reverse();
          }
        }
        bank.value = filtered;
      }

      // 缓存选项乱序
      cacheShuffledOptions();
      console.log("bank.value 长度:", bank.value.length);

      // 加载练习进度（断点续练）
      loadPracticeProgress();

      // 背题模式：初始化时直接显示答案
      if (practiceData.value?.practiceMode === 'review') {
        showCheckBtn.value = false;
        showAnswerExplanation.value = true;
      }

      // 恢复或开始计时
      if (isContinue && store.practiceProgress?.[practiceKey]?.meta?.elapsedSeconds) {
        // 继续练习：恢复之前的计时
        elapsedSeconds.value = store.practiceProgress[practiceKey].meta.elapsedSeconds;
      } else {
        // 新练习：重置计时器
        elapsedSeconds.value = 0;
      }
      startTimer();
    } catch (e) {
      console.error("解析练习数据失败:", e);
      router.push({ name: "Practice" });
    }
  } else {
    router.push({ name: "Practice" });
  }
  loading.value = false;
});

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

// Fisher-Yates 洗牌算法
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// 按每题 shuffle 字段缓存选项乱序结果（背题模式不乱序）
const cacheShuffledOptions = () => {
  if (practiceData.value?.practiceMode === 'review') return;

  shuffledOptionsCache.value = {};
  bank.value.forEach((question) => {
    if (question && question.options && question.shuffle) {
      const indices = question.options.map((_, i) => i);
      const shuffledIndices = shuffleArray(indices);
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
    // 保存当前进度再退出
    addPracticeHistory();
    router.push({
      name: "PracticeResult",
      query: { practiceData: JSON.stringify(practiceData.value) },
    });
  }
};

const gotoQuesitonIdx = (idx, sqIdx) => {
  currentIndex.value = idx;
  if (sqIdx !== undefined) {
    currentSubIndex.value = sqIdx;
  }
  resetQuestionState();
  closeAnswerCard();

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
    setTimeout(() => {
      checkAnswer()
    }, 100)
  }
};

// 检查答案
const checkAnswer = () => {
  const question = currentQuestion.value
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

    // 添加错题
    question.subs?.forEach((sub, idx) => {
      if (status[idx] === 'wrong') {
        store.addWrongQuestion({
          ...sub,
          parentId: questionId,
          type: sub.type
        })
      }
    })
  } else {
    // 简单题型：status 是字符串
    answerStatus.value[questionId] = status || 'unanswered'
    answerChecked.value[questionId] = true

    if (status === 'wrong') {
      store.addWrongQuestion(question)
    }
  }

  showCheckBtn.value = false
  showAnswerExplanation.value = true
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
          showAnswerExplanation.value = true;
        }
      }

      // 根据恢复的练习模式决定是否显示答案
      const mode = progress.config.mode || practiceData.value?.practiceMode;
      if (mode === 'review') {
        showCheckBtn.value = false;
        showAnswerExplanation.value = true;
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
    elapsedSeconds.value
  )
  store.loadPracticeProgress();
};

// 手动添加的
const addPracticeHistory = () => {
  // 使用工具函数打包数据
  const answers = packProgress(bank.value, userAnswers.value, answerChecked.value, answerStatus.value)

  store.addPracticeHistory({
    config: {
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
    progress: {
      currentIndex: currentIndex.value,
      questionIds: bank.value.map(q => q.id),
      answers: answers
    },
    meta: {
      timestamp: Date.now(),
      elapsedSeconds: elapsedSeconds.value
    }
  })
}

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
    showAnswerExplanation.value = true;
  } else {
    // 检查当前题目是否已检查过答案
    const currentQ = bank.value[currentIndex.value];
    if (currentQ && answerChecked.value[currentQ.id]) {
      showCheckBtn.value = false;
      showAnswerExplanation.value = true;
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
    bank.value.splice(currentIndex.value, 1)

    if (currentIndex.value >= bank.value.length && currentIndex.value > 0) {
      currentIndex.value--
    }
    resetQuestionState()
  }
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
  /* border-bottom: 1px solid var(--border-color); */
}

.top-bar-left {
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
  background: #fff;
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
  border: 1px solid #c1c6d6;
  border-radius: var(--radius-full);
  background: #fff;
  color: var(--primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all 0.2s;
  gap: var(--spacing-mn);
}

.check-btn:hover {
  background: #f1f4f7;
}

.check-btn:active {
  transform: scale(0.98);
}

.check-btn .material-symbols-outlined {
  font-size: var(--font-size-xl);
}
</style>
