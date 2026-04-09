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
        <button class="grid-btn" @click="toggleAnswerCard">
          <span class="material-symbols-outlined">grid_view</span>
        </button>
      </div>
    </header>

    <main class="content">
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div class="progress" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="progress-text">{{ currentIndex + 1 }}/{{ bank.length }}</span>
      </div>

      <div class="question-container">
        <div v-if="loading" style="text-align: center; padding: 40px">
          <p>{{ t("loadingQuestions") }}</p>
        </div>
        <template v-else>
          <div v-if="currentQuestion">
            <div class="question-meta">
              <span class="question-type-tag">{{
                t(currentQuestion.type)
                }}</span>
              <span class="question-id">{{ t("questionId") }}: {{ currentQuestion.id }}</span>
              <button class="fav-btn" :class="{ active: isFavorited }" @click="toggleFavorite">
                <span class="material-symbols-outlined">{{ isFavorited ? 'kid_star' : 'star' }}</span>
              </button>
            </div>

            <QuestionRenderer :question="currentQuestionWithOptions" :mode="practiceMode"
              :user-answer="userAnswers[currentQuestion?.id]" :show-answer="isCurrentAnswerChecked"
              :disabled="isCurrentAnswerDisabled" :show-answer-mode="practiceData?.showAnswerMode"
              :auto-jump="practiceData?.autoJump" :answerChecked="answerChecked" :answerStatus="answerStatus"
              @answer="handleAnswer" @next-question="nextQuestion" @checkSub="handleCheckSub" />

            <div class="check-answer"
              v-if="showCheckBtn && hasUserAnswer && practiceMode !== 'review' && currentQuestion?.type !== 'reading' && shouldShowCheckBtn">
              <button class="check-btn" @click="checkAnswer">
                <span class="material-symbols-outlined">verified</span>
                {{ t("checkAnswer") }}
              </button>
            </div>
          </div>

          <div v-else style="text-align: center; padding: 40px">
            <p>
              {{ bank.length === 0 ? t("noQuestions") : t("loadingQuestions") }}
            </p>
          </div>
        </template>
      </div>
    </main>

    <QustionNavbar :prevDisabled="currentIndex === 0" :isLast="currentIndex === bank.length - 1" @prev="prevQuestion"
      @next="nextQuestion" @submit="finishQuiz" />
    <AnswerCard v-if="showAnswerCard" :questions="bank" :currentIndex="currentIndex" :currentSubIndex="currentSubIndex"
      :settings="practiceData" :answerChecked="answerChecked" :answerStatus="answerStatus" :userAnswers="userAnswers"
      @close="closeAnswerCard" @exit="exitQuiz" @go="gotoQuesitonIdx" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, toRaw } from "vue";
import { useRouter, useRoute } from "vue-router";
import AnswerCard from "@/components/page/AnswerCard.vue";
import QustionNavbar from "@/components/layout/QuestionNavbar.vue";
import QuestionRenderer from "@/components/question/QuestionRenderer.vue";
import { useAppStore } from "@/stores/store";
import { t } from "@/utils/i18n.js";
import { useAnswerDisplay } from "@/composables/useAnswerDisplay";
import { canAutoCheck } from "@/utils/questionStatus";

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

      console.log("题目数量:", filtered.length);

      // 加载已保存的进度
      const savedProgress = store.practiceProgress;
      const isSameSubject = savedProgress?.config?.bank?.subject === subjectName;

      // 排序：优先使用保存的题目顺序
      if (isSameSubject && savedProgress?.progress?.questionIds && savedProgress.progress.questionIds.length > 0) {
        // 按保存的题目 ID 顺序恢复
        const savedQuestionIds = savedProgress.progress.questionIds;
        const existingQuestions = new Set(filtered.map(q => q.id));
        const validIds = savedQuestionIds.filter(id => existingQuestions.has(id));

        bank.value = validIds.map(id => filtered.find(q => q.id === id)).filter(Boolean);
        console.log("已恢复题目顺序，题数:", bank.value.length);
      } else {
        // 新练习：按设置排序
        if (questionSort === "shuffle") {
          filtered = filtered.sort(() => Math.random() - 0.5);
        } else if (questionSort === "reverse") {
          filtered = filtered.reverse();
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
      if (store.practiceProgress?.meta?.elapsedSeconds) {
        elapsedSeconds.value = store.practiceProgress.meta.elapsedSeconds;
      } else {
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

// 缓存选项乱序结果
const cacheShuffledOptions = () => {
  if (!practiceData.value?.optionsSort) return;

  shuffledOptionsCache.value = {};
  bank.value.forEach((question, index) => {
    if (question && question.options) {
      const shuffled = [...question.options].sort(() => Math.random() - 0.5);
      shuffledOptionsCache.value[question.id] = shuffled;
    }
  });
  console.log("已缓存选项乱序，题数:", Object.keys(shuffledOptionsCache.value).length);
};

// 获取带乱序选项的题目（使用缓存）
const getQuestionWithShuffledOptions = (question) => {
  if (!question || !question.options) return question;

  // 如果设置了选项乱序，使用缓存
  if (practiceData.value?.optionsSort) {
    const cached = shuffledOptionsCache.value[question.id];
    if (cached) {
      return { ...question, options: cached };
    }
    // 如果没有缓存，重新打乱并缓存
    const shuffled = [...question.options].sort(() => Math.random() - 0.5);
    shuffledOptionsCache.value[question.id] = shuffled;
    return { ...question, options: shuffled };
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
const currentQuestionDisplay = useAnswerDisplay({
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

// 当前题目是否禁用（Reading 题型由内部管理）
const isCurrentAnswerDisabled = computed(() => {
  if (!currentQuestion.value) return false;
  // 背题模式：禁用交互，只能浏览
  if (practiceMode.value === 'review') return true;
  // Reading 题型由内部组件管理禁用状态
  if (currentQuestion.value.type === 'reading') return false;
  return answerChecked.value[currentQuestion.value.id] || false;
});

// 是否已收藏
const isFavorited = computed(() => {
  if (!currentQuestion.value) return false;
  return store.favorites.some(q => q.id === currentQuestion.value.id);
});

// 切换收藏
const toggleFavorite = () => {
  if (!currentQuestion.value) return;
  if (isFavorited.value) {
    store.removeFavorite(currentQuestion.value.id);
  } else {
    store.addFavorite(currentQuestion.value);
  }
};

// 处理用户作答
const handleAnswer = (answer) => {
  if (!currentQuestion.value) return

  const question = currentQuestion.value
  console.log('[QuizPage handleAnswer] answer:', answer, 'type:', question.type)

  // 保存用户答案 - 过滤并清理旧的对象格式
  if (question.type === 'reading') {
    // Reading 组件已经传入了完整对象 {0: 2}，直接使用
    // 如果 answer 是对象，直接合并；如果是数字才需要构建
    let cleanAnswers = {}

    if (typeof answer === 'object' && answer !== null) {
      // 传入的是完整对象，直接使用
      cleanAnswers = { ...answer }
    } else {
      // 数字格式：构建对象
      const existing = userAnswers.value[question.id] || {}
      console.log('[QuizPage handleAnswer] existing:', existing)

      // 过滤：只保留数字格式的值
      Object.entries(existing).forEach(([key, val]) => {
        if (typeof val === 'number' && !isNaN(val)) {
          cleanAnswers[key] = val
        }
      })

      // 添加当前答案
      cleanAnswers[currentSubIndex.value] = answer
    }

    userAnswers.value[question.id] = cleanAnswers
    console.log('[QuizPage handleAnswer] saved:', userAnswers.value[question.id])
  } else {
    userAnswers.value[question.id] = answer
    console.log('[QuizPage handleAnswer] saved (non-reading):', userAnswers.value[question.id])
  }

  // 是否需要自动检查
  // 条件：不是背题模式 + 立即显示模式 + 题型支持自动批改
  const shouldAutoCheckForQuestion = (q, subQ = null) => {
    if (practiceMode.value === 'review') return false
    if (practiceData.value?.showAnswerMode !== 'immediate') return false

    // 使用子题类型判断（阅读理解），否则使用题目类型
    const checkType = subQ || q
    if (!checkType) return false
    return canAutoCheck(checkType.type)
  }

  // 判断是否需要自动检查
  let autoCheck = false
  if (question.type === 'reading') {
    autoCheck = shouldAutoCheckForQuestion(question, question.subs?.[currentSubIndex.value])
  } else {
    autoCheck = shouldAutoCheckForQuestion(question)
  }

  // 如果需要自动检查，检查答案
  if (autoCheck) {
    checkAnswer()

    // 自动跳转下一题（仅对普通题目）
    if (question.type !== 'reading' && practiceData.value?.autoJump) {
      setTimeout(() => {
        nextQuestion()
      }, 500);
    }
  }
};

// 检查答案
const checkAnswer = () => {
  const question = currentQuestion.value
  if (!question) return

  const questionId = question.id
  const userAnswer = userAnswers.value[questionId]

  // 简单题型：直接使用现有逻辑
  if (question.type !== 'reading') {
    let status = 'unchecked'
    if (userAnswer === undefined || userAnswer === null || (typeof userAnswer === 'number' && isNaN(userAnswer))) {
      status = 'unanswered'
    } else {
      status = getQuestionStatus(question, userAnswer)
    }
    answerStatus.value[questionId] = status
    answerChecked.value[questionId] = true

    if (status === 'wrong') {
      store.addWrongQuestion(question)
    }
  } else {
    // 复合题型（阅读理解）：检查所有子题
    const subs = question.subs || []

    // 保存嵌套结构
    if (!answerStatus.value[questionId]) answerStatus.value[questionId] = {}
    if (!answerChecked.value[questionId]) answerChecked.value[questionId] = {}

    // 遍历所有子题
    subs.forEach((sub, idx) => {
      const subAnswer = userAnswer?.[idx]
      let status = 'unanswered'
      if (subAnswer !== undefined && subAnswer !== null) {
        status = getSubQuestionStatus(sub, subAnswer)
        
        if (status === 'wrong') {
          store.addWrongQuestion({
            ...sub,
            parentId: questionId,
            type: sub.type
          })
        }
      }
      answerStatus.value[questionId][idx] = status
      answerChecked.value[questionId][idx] = true
    })
  }

  showCheckBtn.value = false
  showAnswerExplanation.value = true
  savePracticeProgress()
}

// 判断普通题目的答案状态
const getQuestionStatus = (question, userAnswer) => {
  if (!question.answer || !question.answer[0]) return 'unknown'

  const correctAnswer = question.answer[0].replace(/^[A-Z]\.\s*/, '')

  if (question.type === 'multiple') {
    // 多选题：比较选项内容
    if (!Array.isArray(userAnswer)) return 'wrong'
    const correctSet = new Set(question.answer.map(a => a.replace(/^[A-Z]\.\s*/, '')))
    const userSet = new Set((userAnswer || []).map(i => {
      return question.options?.[i]?.replace(/^[A-Z]\.\s*/, '')
    }).filter(Boolean))

    if (correctSet.size === userSet.size && [...correctSet].every(v => userSet.has(v))) {
      return 'correct'
    }
    if ([...userSet].some(v => !correctSet.has(v))) {
      return 'wrong'
    }
    return 'partial'
  } else {
    // 单选、判断、媒体题
    // options 可能是数组或对象
    if (typeof userAnswer !== 'number') return 'wrong'
    let userText
    if (Array.isArray(question.options)) {
      userText = question.options?.[userAnswer]?.replace(/^[A-Z]\.\s*/, '')
    } else {
      const userOptionKey = String.fromCharCode(65 + userAnswer)
      userText = question.options?.[userOptionKey]?.replace(/^[A-Z]\.\s*/, '')
    }
    return userText === correctAnswer ? 'correct' : 'wrong'
  }
}

// 判断阅读理解子题的答案状态
const getSubQuestionStatus = (subQuestion, userAnswer) => {
  if (!subQuestion?.answer || !subQuestion.answer[0]) return 'unknown'

  const correctAnswer = subQuestion.answer[0].replace(/^[A-Z]\.\s*/, '')

  if (subQuestion.type === 'multiple') {
    if (!Array.isArray(userAnswer)) return 'wrong'
    const correctSet = new Set(subQuestion.answer.map(a => a.replace(/^[A-Z]\.\s*/, '')))
    const userSet = new Set((userAnswer || []).map(i => {
      return subQuestion.options?.[i]?.replace(/^[A-Z]\.\s*/, '')
    }).filter(Boolean))

    if (correctSet.size === userSet.size && [...correctSet].every(v => userSet.has(v))) {
      return 'correct'
    }
    if ([...userSet].some(v => !correctSet.has(v))) {
      return 'wrong'
    }
    return 'partial'
  } else {
    // 单选、判断、媒体题
    if (typeof userAnswer !== 'number') return 'wrong'
    let userText
    if (Array.isArray(subQuestion.options)) {
      userText = subQuestion.options?.[userAnswer]?.replace(/^[A-Z]\.\s*/, '')
    } else {
      const userOptionKey = String.fromCharCode(65 + userAnswer)
      userText = subQuestion.options?.[userOptionKey]?.replace(/^[A-Z]\.\s*/, '')
    }
    return userText === correctAnswer ? 'correct' : 'wrong'
  }
}

// 处理子题检查事件
const handleCheckSub = (subIndex) => {
  const question = currentQuestion.value
  if (question?.type === 'reading') {
    const questionId = question.id
    const userAnswer = userAnswers.value[questionId]
    const subAnswer = userAnswer?.[subIndex]

    // 判断子题答案状态
    let status = 'unanswered'
    if (subAnswer !== undefined && subAnswer !== null) {
      status = getSubQuestionStatus(question.subs?.[subIndex], subAnswer)
    }

    // 保存状态
    if (!answerChecked.value[questionId]) {
      answerChecked.value[questionId] = {}
    }
    if (!answerStatus.value[questionId]) {
      answerStatus.value[questionId] = {}
    }
    answerChecked.value[questionId][subIndex] = true
    answerStatus.value[questionId][subIndex] = status
  }
};

// 加载练习进度（断点续练）
const loadPracticeProgress = () => {
  const progress = store.practiceProgress;
  if (progress && progress.config?.bank) {
    // 检查是否是同一个练习
    const sameSubject = progress.config.bank.subject === subjectDisplay.value;
    if (sameSubject) {
      currentIndex.value = progress.progress.currentIndex || 0;

      // 恢复 answers 数据
      const answersData = progress.progress.answers || {};
      const userAnswersMap = {};
      const answerCheckedMap = {};
      const answerStatusMap = {};
      Object.keys(answersData).forEach(questionId => {
        const data = answersData[questionId];
        userAnswersMap[questionId] = data.selected;

        const checked = data.checked;
        const status = data.status;

        // 判断是否为复合题型（从当前题库中查找）
        const question = bank.value.find(q => q.id === questionId);
        if (question?.type === 'reading') {
          // 复合题型：保持嵌套结构
          // checked/status 可能是 { 0: true/false, 1: 'correct/wrong' }
          answerCheckedMap[questionId] = checked;
          answerStatusMap[questionId] = status;
        } else {
          // 简单题型：扁平结构
          answerCheckedMap[questionId] = checked;
          answerStatusMap[questionId] = status;
        }
      });
      userAnswers.value = userAnswersMap;
      answerChecked.value = answerCheckedMap;
      answerStatus.value = answerStatusMap;

      // 恢复当前题目的答案检查状态
      const currentQ = bank.value[currentIndex.value];
      if (currentQ) {
        const isChecked = currentQ.type === 'reading'
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
        // 背题模式：所有题目都显示答案
        showCheckBtn.value = false;
        showAnswerExplanation.value = true;
      }

      console.log('已恢复练习进度:', {
        currentIndex: currentIndex.value,
        answeredCount: Object.keys(userAnswers.value).length,
        checkedCount: Object.keys(answerChecked.value).length,
        elapsedSeconds: progress.meta?.elapsedSeconds || 0
      });
    }
  }
};

// 保存练习进度
const savePracticeProgress = () => {
  const answers = {}
  Object.keys(userAnswers.value).forEach(questionId => {
    answers[questionId] = {
      selected: userAnswers.value[questionId],
      checked: answerChecked.value[questionId] || false,
      status: answerStatus.value[questionId] || 'unanswered'
    }
  })

  store.savePracticeProgress({
    config: {
      bank: {
        subject: practiceData.value?.subject?.name,
        category: practiceData.value?.subject?.category,
        scope: practiceData.value?.subject?.scope
      },
      mode: practiceData.value?.practiceMode,
      questionSort: practiceData.value?.questionSort,
      optionsSort: practiceData.value?.optionsSort,
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
};

// 手动添加的
const addPracticeHistory = () => {
  const answers = {}
  Object.keys(userAnswers.value).forEach(questionId => {
    answers[questionId] = {
      selected: userAnswers.value[questionId],
      checked: answerChecked.value[questionId] || false,
      status: answerStatus.value[questionId] || 'unanswered'
    }
  })

  store.addPracticeHistory({
    config: {
      bank: {
        subject: practiceData.value?.subject?.name,
        category: practiceData.value?.subject?.category,
        scope: practiceData.value?.subject?.scope
      },
      mode: practiceData.value?.practiceMode,
      questionSort: practiceData.value?.questionSort,
      optionsSort: practiceData.value?.optionsSort,
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

.content {
  /* padding: var(--spacing-md); */
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
