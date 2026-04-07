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
          <span>15:30</span>
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

            <QuestionRenderer :question="currentQuestionWithOptions" :mode="practiceMode" :user-answer="userAnswers[currentQuestion?.id]"
              :show-answer="isCurrentAnswerChecked" :disabled="isCurrentAnswerChecked" @answer="handleAnswer" />

            <div class="check-answer" v-if="showCheckBtn && hasUserAnswer && practiceMode !== 'review'">
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

    <QustionNavbar :prevDisabled="currentIndex === 0" :isLast="currentIndex === bank.length - 1" @prev="
      () => {
        if (currentIndex > 0) {
          currentIndex--;
          resetQuestionState();
        }
      }
    " @next="nextQuestion" @submit="
      () => {
        router.push({
          name: 'PracticeResult',
          query: { practiceData: JSON.stringify(practiceData) },
        });
      }
    " />
    <AnswerCard v-if="showAnswerCard" :questions="bank" :currentIndex="currentIndex" :settings="practiceData"
      @close="closeAnswerCard" @exit="exitQuiz" @go="
        (idx) => {
          currentIndex = idx;
          resetQuestionState();
          closeAnswerCard();
        }
      " />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import AnswerCard from "@/components/page/AnswerCard.vue";
import QustionNavbar from "@/components/layout/QuestionNavbar.vue";
import QuestionRenderer from "@/components/question/QuestionRenderer.vue";
import { useAppStore } from "@/stores/store";
import { t } from "@/utils/i18n.js";

const router = useRouter();
const route = useRoute();
const store = useAppStore();

const showAnswerCard = ref(false);
const showCheckBtn = ref(true);
const showAnswerExplanation = ref(false);
const practiceData = ref(null);
const bank = ref([]);
const currentIndex = ref(0);
const userAnswers = ref({});
const answerChecked = ref({}); // 每个题目的答案检查状态
const shuffledOptionsCache = ref({}); // 缓存选项乱序结果
const loading = ref(true);

onMounted(async () => {
  // 确保 Store 已加载题库数据
  if (store.rawQuestions.length === 0) {
    await store.loadQuestions();
  }

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
      console.log("Store 题库数量:", store.rawQuestions.length);

      // 从 Store 获取题目并过滤
      let filtered = store.rawQuestions.filter(
        (q) =>
          q.meta &&
          q.meta.category === category &&
          q.meta.scope === scope &&
          q.meta.subject === subjectName,
      );

      console.log("过滤后题目数量:", filtered.length);

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
    } catch (e) {
      console.error("解析练习数据失败:", e);
      router.push({ name: "Practice" });
    }
  } else {
    router.push({ name: "Practice" });
  }
  loading.value = false;
});

// 页面卸载时保存进度（刷新、关闭页面等）
onUnmounted(() => {
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

// 练习模式
const practiceMode = computed(() => {
  return practiceData.value?.practiceMode || "answer";
});

// 是否有用户答案（使用题目 ID 查询）
const hasUserAnswer = computed(() => {
  if (!currentQuestion.value) return false;
  const answer = userAnswers.value[currentQuestion.value.id];
  if (answer === null || answer === undefined) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === "string") return answer.trim().length > 0;
  return !!answer;
});

// 当前题目是否已检查答案
const isCurrentAnswerChecked = computed(() => {
  if (!currentQuestion.value) return false;
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
  // 使用题目 ID 存储答案，而非索引
  if (currentQuestion.value) {
    userAnswers.value[currentQuestion.value.id] = answer;
  }

  // 如果是立即显示模式且不是背题模式，自动检查答案
  if (
    practiceData.value?.showAnswerMode === "immediate" &&
    practiceMode.value !== "review"
  ) {
    checkAnswer();
    
    // 自动跳转下一题
    if (practiceData.value?.autoJump) {
      setTimeout(() => {
        nextQuestion();
      }, 500);
    }
  }
};

// 检查答案
const checkAnswer = () => {
  if (currentQuestion.value) {
    answerChecked.value[currentQuestion.value.id] = true;
  }
  showCheckBtn.value = false;
  showAnswerExplanation.value = true;

  // 保存进度
  savePracticeProgress();
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
      Object.keys(answersData).forEach(questionId => {
        userAnswersMap[questionId] = answersData[questionId].selected;
        answerCheckedMap[questionId] = answersData[questionId].checked;
      });
      userAnswers.value = userAnswersMap;
      answerChecked.value = answerCheckedMap;
      
      // 恢复当前题目的答案检查状态
      const currentQ = bank.value[currentIndex.value];
      if (currentQ && answerChecked.value[currentQ.id]) {
        showCheckBtn.value = false;
        showAnswerExplanation.value = true;
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
        checkedCount: Object.keys(answerChecked.value).length
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
      checked: answerChecked.value[questionId] || false
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
      timestamp: Date.now()
    }
  })
};

// 下一题
const nextQuestion = () => {
  if (currentIndex.value < bank.value.length - 1) {
    currentIndex.value++;
    resetQuestionState();
  } else {
    // 已完成所有题目
    router.push({
      name: "PracticeResult",
      query: { practiceData: JSON.stringify(practiceData.value) },
    });
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

.timer-display material .material-symbols-outlined {
  font-size: var(--font-size-md);
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
  font-size: var(--font-size-2xl);
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
  margin-bottom: var(--spacing-md);
}

.question-type-tag {
  padding: var(--spacing-mn) var(--spacing-sm);
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-sm);
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
