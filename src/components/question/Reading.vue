<template>
  <div class="reading-question">

    <div class="sub-question-section" v-if="question.subs && question.subs.length > 0">
      <div class="reading-section" v-if="question.media?.article">
        <div class="reading-header" @click="toggleReading">
          <span class="material-symbols-outlined">description</span>
          <span>{{ t('readingMaterial') || '' }}</span>
          <span class="material-symbols-outlined expand-icon">{{ readingExpanded ? 'expand_less' : 'expand_more'
          }}</span>
        </div>
        <div class="reading-content" v-show="readingExpanded">
          {{ question.media.article }}
        </div>
      </div>

      <component :is="componentMap[currentSub?.type] || SingleChoice" :question="wrappedSub"
        :user-answer="wrappedUserAnswer" :mode="mode" :show-answer="currentSubShowAnswer"
        :disabled="isSubAnswerDisabled" @answer="handleSubAnswer" />

      <!-- <div class="sub-explanation" v-if="currentSubShowAnswer && currentSub?.explanation">
        <div class="explanation-header">
          <span class="material-symbols-outlined">lightbulb</span>
          <span>{{ t('explanation') }}</span>
        </div>
        <div class="explanation-content">
          {{ currentSub.explanation }}
        </div>
      </div>

      <div class="sub-check-answer"
        v-if="mode !== 'review' && hasCurrentSubAnswer && !currentSubShowAnswer && shouldShowCheckBtn">
        <button class="check-btn" @click="checkSubAnswer(currentSubIndex)">
          <span class="material-symbols-outlined">verified</span>
          {{ t("checkAnswer") }}
        </button>
      </div> -->
    </div>

    <div class="sub-nav" v-if="question.subs && question.subs.length > 1">
      <button v-for="(sub, index) in question.subs" :key="index" class="sub-nav-btn" :class="getSubNavBtnClass(index)"
        @click="goToSub(index)">
        {{ index + 1 }}
      </button>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '@/utils/i18n.js'
import { normalizeStatus, getStatusClass, getCurrentStatusClass } from '@/utils/questionStatus'
import SingleChoice from './SingleChoice.vue'
import MultipleChoice from './MultipleChoice.vue'
import BooleanQuestion from './BooleanQuestion.vue'
import Essay from './Essay.vue'
import FillIn from './FillIn.vue'

const componentMap = {

  single: SingleChoice,
  multiple: MultipleChoice,
  boolean: BooleanQuestion,
  essay: Essay,
  fillin: FillIn
}

const props = defineProps({
  question: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'answer'
  },
  userAnswer: {
    type: [String, Array, Object],
    default: null
  },
  showAnswer: {
    type: [Boolean, Object],
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showAnswerMode: {
    type: String,
    default: 'manual'
  },
  autoJump: {
    type: Boolean,
    default: false
  },
  answerChecked: {
    type: Object,
    default: () => ({})
  },
  answerStatus: {
    type: Object,
    default: () => ({})
  },
  currentSubIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['answer', 'checkSub', 'next-question'])

const readingExpanded = ref(false)
// 使用外部传入的子题索引，如果未传入则使用本地状态
const currentSubIndex = ref(0)
const subAnswerChecked = ref({})

// 监听外部传入的子题索引变化
watch(() => props.currentSubIndex, (newVal) => {
  if (newVal !== undefined && newVal !== null) {
    currentSubIndex.value = newVal
  }
}, { immediate: true })

const currentSub = computed(() => {
  if (!props.question.subs || props.question.subs.length === 0) return null
  return props.question.subs[currentSubIndex.value]
})

const wrappedSub = computed(() => {
  if (!currentSub.value) return null
  return {
    id: currentSub.value.sid,
    stem: currentSub.value.stem,
    options: currentSub.value.options,
    answer: currentSub.value.answer,
    type: currentSub.value.type,
    explanation: currentSub.value.explanation
  }
})

const wrappedUserAnswer = computed(() => {
  return getSubAnswer(currentSubIndex.value)
})

const getSubAnswer = (subIndex) => {
  if (!props.userAnswer || typeof props.userAnswer !== 'object') return null
  return props.userAnswer[subIndex]
}

const isSubAnswered = (subIndex) => {
  const answer = getSubAnswer(subIndex)
  if (answer === null || answer === undefined) return false
  if (Array.isArray(answer)) return answer.length > 0
  if (typeof answer === 'string') return answer.trim().length > 0
  return !!answer
}

const getSubStatus = (subIndex) => {
  if (!props.question?.id) return ''
  // 优先使用 props.answerStatus（从答题卡传递）
  if (props.answerStatus && props.answerStatus[props.question.id]) {
    const status = props.answerStatus[props.question.id]
    if (typeof status === 'object') {
      return status[subIndex] || ''
    }
    return status
  }
  // 备用：使用本地 subAnswerChecked
  const isChecked = subAnswerChecked.value[subIndex]
  if (!isChecked) return ''
  // 背题模式不显示状态
  if (props.mode === 'review') return ''
  return 'checked'
}

const getSubNavBtnClass = (subIndex) => {
  const isCurrent = currentSubIndex.value === subIndex
  const mode = props.mode || 'answer'

  // 当前题目优先返回
  if (isCurrent) {
    return getCurrentStatusClass('', mode)
  }

  // 非当前题目
  const status = normalizeStatus(getSubStatus(subIndex))
  const answered = isSubAnswered(subIndex)

  // 已作答但未检查
  if (answered && !status) {
    return 'answered'
  }

  // 使用标准状态类名
  return getStatusClass(status, { isCurrent, mode })
}

const hasCurrentSubAnswer = computed(() => {
  return isSubAnswered(currentSubIndex.value)
})

// 是否应该显示检查答案按钮
// - 背题模式：不需要
// - 按需显示模式：所有题型都需要
// - 直接显示模式：只有不支持自动批改的题型（多选、填空、简答、翻译）需要
const shouldShowCheckBtn = computed(() => {
  if (!currentSub.value) return false
  if (props.mode === 'review') return false
  // 按需显示模式
  if (props.showAnswerMode !== "immediate") return true
  // 直接显示模式：只有不支持自动批改的题型需要
  const needsManualCheck = ['multiple', 'fillin', 'essay', 'translation'].includes(currentSub.value.type);
  return needsManualCheck;
})

const isSubAnswerDisabled = computed(() => {
  // 背题模式禁用交互，只能浏览
  if (props.mode === 'review') return true
  // 当前子题已检查则禁用
  return isSubAnswerChecked(currentSubIndex.value)
})

const toggleReading = () => {
  readingExpanded.value = !readingExpanded.value
}

const goToSub = (index) => {
  currentSubIndex.value = index
}

const handleSubAnswer = (answer) => {
  const newAnswer = { ...(props.userAnswer || {}) }
  newAnswer[currentSubIndex.value] = answer
  emit('answer', newAnswer)

  // 立即显示模式下，仅对单选、判断、媒体题自动标记为已检查
  if (props.mode !== 'review' && props.showAnswerMode === 'immediate') {
    const canImmediateCheck = ['single', 'boolean', 'media'].includes(currentSub.value.type);
    if (canImmediateCheck) {
      subAnswerChecked.value[currentSubIndex.value] = true

      // 自动跳转下一题
      if (props.autoJump) {
        setTimeout(() => {
          goToNextSubOrNextQuestion()
        }, 500);
      }
    }
  }
}

// 导航到下一个子题或下一题
const goToNextSubOrNextQuestion = () => {
  const subs = props.question?.subs || []
  if (currentSubIndex.value < subs.length - 1) {
    currentSubIndex.value++
  } else {
    emit('next-question')
  }
}

const checkSubAnswer = (index) => {
  subAnswerChecked.value[index] = true
}

const isSubAnswerChecked = (index) => {
  // 背题模式：始终显示答案
  if (props.mode === 'review') return true
  return subAnswerChecked.value[index] === true
}

// 获取当前子题的 showAnswer 状态
const currentSubShowAnswer = computed(() => {
  return isSubAnswerChecked(currentSubIndex.value)
})

watch(() => props.question, () => {
  currentSubIndex.value = 0
  readingExpanded.value = true
  subAnswerChecked.value = {}
})

// 监听 userAnswer 变化，自动推断子题检查状态
watch(() => props.userAnswer, (newAnswer) => {
  if (!newAnswer || typeof newAnswer !== 'object') return
  // 背题模式：所有子题都显示答案
  if (props.mode === 'review') {
    const subs = props.question?.subs || []
    subs.forEach((_, index) => {
      subAnswerChecked.value[index] = true
    })
    return
  }
  // 答题模式：有答案的子题视为已检查
  Object.keys(newAnswer).forEach(subIndex => {
    const answer = newAnswer[subIndex]
    if (answer !== null && answer !== undefined && answer !== '') {
      if (Array.isArray(answer) && answer.length === 0) return
      subAnswerChecked.value[subIndex] = true
    }
  })
}, { immediate: true, deep: true })
</script>

<style scoped>
.reading-question {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.reading-section {
  /* border: 0.5px solid var(--border-color-light); */
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.reading-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background);
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  user-select: none;
}

.reading-header .material-symbols-outlined:first-child {
  font-size: 20px;
}

.expand-icon {
  margin-left: auto;
  font-size: 20px;
}

.reading-content {
  padding: 0 var(--spacing-md) var(--spacing-md);
  background: var(--background);
  color: var(--on-surface);
  line-height: 1.8;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}

.sub-nav {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.sub-nav-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  background: #fff;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.sub-nav-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.sub-nav-btn.current {
  background-color: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.sub-nav-btn.correct {
  background: var(--success);
  border-color: var(--success);
  color: #fff;
}

.sub-nav-btn.wrong {
  background: var(--error);
  border-color: var(--error);
  color: #fff;
}

.sub-nav-btn.unknown {
  background: var(--warning);
  border-color: var(--warning);
  color: #181c1f;
}

.sub-nav-btn.answered:not(.active) {
  background: #e8f5e9;
  border-color: var(--success);
  color: var(--success);
}

.sub-nav-btn.no-answer {
  background: var(--color-gray-200);
  border-color: var(--border-color-light);
  color: var(--text-secondary);
}

.sub-question-section {
  display: flex;
  flex-direction: column;
  /* gap: var(--spacing-md); */
}

.sub-question-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-md) 0 var(--spacing-md);
  background: var(--background);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.sub-index {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--primary);
}

.sub-type-tag {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: var(--color-gray-100);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.sub-explanation {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
}

.sub-explanation .explanation-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}

.sub-explanation .explanation-content {
  font-size: var(--font-size-md);
  color: var(--on-surface);
  line-height: 1.6;
}

.sub-check-answer {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.sub-check-answer .check-btn {
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

.sub-check-answer .check-btn:hover {
  background: #f1f4f7;
}

.sub-check-answer .check-btn:active {
  transform: scale(0.98);
}
</style>
