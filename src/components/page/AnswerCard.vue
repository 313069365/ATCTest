<template>
  <div class="answer-card-modal" @click.self="$emit('close')">
    <div class="answer-card-content">
      <div class="answer-card-header">
        <button class="close-btn" @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
        <h3>答题卡</h3>
        <button class="submit-btn" @click="$emit('exit')">退出</button>
      </div>

      <div class="answer-card-body">
        <div class="progress-stats">
          <div class="practice-info" v-if="settings">
            <div class="tags-row">
              <span class="info-tag">{{ orderDisplay }} {{ modeDisplay }}</span>
              <span class="info-tag" v-if="settings.mode === 'answer'">
                {{ showAnswerDisplay }}
              </span>
              <span class="info-tag" v-if="settings.mode === 'answer' && settings.autoJump">
                自动跳转
              </span>
            </div>
          </div>

          <div class="legend">
            <div class="legend-item">
              <span class="legend-dot correct"></span>
              <span>正确</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot wrong"></span>
              <span>错误</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot unknown"></span>
              <span>待定</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot"></span>
              <span>未答</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot current"></span>
              <span>当前</span>
            </div>
          </div>
        </div>

        <div class="question-list">
          <button 
            class="question-btn" 
            v-for="(q, i) in questions" 
            :key="i"
            @click="$emit('go', i)"
            :class="[
              getQuestionStatus(q, i),
              { current: currentIndex === i }
            ]"
          >
            {{ i + 1 }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  settings: {
    type: Object,
    default: null
  },
  answerChecked: {
    type: Object,
    default: () => ({})
  },
  userAnswers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'go', 'exit'])

// 格式化显示设置
const orderDisplay = computed(() => {
  if (!props.settings) return '顺序'
  const orderMap = {
    'sequence': '顺序',
    'reverse': '逆序',
    'shuffle': '乱序',
  }
  return orderMap[props.settings.questionSort] || '顺序'
})

const modeDisplay = computed(() => {
  if (!props.settings) return '答题'
  return props.settings.practiceMode === 'review' ? '背题' : '答题'
})

const showAnswerDisplay = computed(() => {
  if (!props.settings) return '立即显示'
  return props.settings.showAnswerMode === 'immediate' ? '立即显示' : '按需显示'
})

// 获取题目的状态：'unanswered' | 'correct' | 'wrong' | 'unknown'
const getQuestionStatus = (question, index) => {
  const isChecked = props.answerChecked[question.id]
  const userAnswer = props.userAnswers[question.id]
  
  // 如果没有检查答案，则未作答
  if (!isChecked) {
    return 'unanswered'
  }
  
  // 背题模式不显示对错状态
  if (props.settings?.practiceMode === 'review') {
    return 'unanswered'
  }
  
  // 判断题型是否可自动判分
  const autoCheckableTypes = ['single', 'boolean', 'multiple']
  if (!autoCheckableTypes.includes(question.type)) {
    return 'unknown'
  }
  
  // 可自动判分的题型，计算正确性
  return isAnswerCorrect(question, userAnswer) ? 'correct' : 'wrong'
}

// 检查答案是否正确
const isAnswerCorrect = (question, userAnswer) => {
  if (!question.answer || userAnswer === undefined || userAnswer === null) {
    return false
  }
  
  if (question.type === 'single' || question.type === 'boolean') {
    // 单选或判断题
    const correctIndex = getCorrectOptionIndex(question)
    return userAnswer === correctIndex
  } else if (question.type === 'multiple') {
    // 多选题
    const correctIndices = getCorrectOptionIndices(question)
    if (!Array.isArray(userAnswer) || userAnswer.length !== correctIndices.length) {
      return false
    }
    return userAnswer.every(index => correctIndices.includes(index)) &&
           correctIndices.every(index => userAnswer.includes(index))
  }
  return false
}

// 获取单选/判断题的正确选项索引
const getCorrectOptionIndex = (question) => {
  if (!question.answer || !question.answer[0] || !question.options) return -1
  
  const answerStr = String(question.answer[0])
  if (question.type === 'boolean') {
    return answerStr.toUpperCase().includes('T') ? 0 : 1
  }
  
  const correctAnswerText = answerStr.replace(/^[A-Z]\.\s*/, '')
  return question.options.findIndex(opt => {
    const optText = opt.replace(/^[A-Z]\.\s*/, '')
    return optText === correctAnswerText
  })
}

// 获取多选题的正确选项索引
const getCorrectOptionIndices = (question) => {
  if (!question.answer || !question.options) return []
  
  return question.answer.reduce((indices, ans) => {
    const correctAnswerText = String(ans).replace(/^[A-Z]\.\s*/, '')
    const idx = question.options.findIndex(opt => {
      const optText = opt.replace(/^[A-Z]\.\s*/, '')
      return optText === correctAnswerText
    })
    if (idx !== -1) indices.push(idx)
    return indices
  }, [])
}
</script>

<style scoped>
.answer-card-modal {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--app-max-width);
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-popup);
  display: flex;
  align-items: flex-end;
}

.answer-card-content {
  background: var(--background-secondary);
  width: 100%;
  max-width: var(--app-max-width);
  max-height: 85vh;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.answer-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--background);
  border-bottom: 1px solid var(--border-color-strong);
}

.close-btn {
  width: 35px;
  height: 35px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn .material-symbols-outlined {
  font-size: 18px;
}

.answer-card-header h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
}

.submit-btn {
  padding: var(--spacing-sm);
  border: none;
  background: transparent;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.answer-card-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md) var(--spacing-lg);
}

.progress-stats {
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-lg);
  background-color: var(--background);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid #ebeef2;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 11px;
  color: var(--icon-color);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-sm);
  background: var(--border-color-strong);
}

.legend-dot.correct {
  background: var(--success);
}

.legend-dot.wrong {
  background: var(--error);
}

.legend-dot.unknown {
  background: var(--warning);
}

.legend-dot.current {
  background: var(--primary);
}

.question-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.question-list .question-btn {
  min-width: 50px;
  aspect-ratio: 1;
  margin: 0 auto;
  border: none;
  border-radius: var(--radius-md);
  background: #e0e3e6;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: #414754;
  cursor: pointer;
}

.question-btn:active {
  transform: scale(0.95);
}

.question-btn.correct {
  background: var(--success);
  color: #fff;
}

.question-btn.wrong {
  background: var(--error);
  color: #fff;
}

.question-btn.unknown {
  background: #fbbc04;
  color: #181c1f;
}

.question-btn.current {
  background: var(--primary);
  color: #fff;
}
</style>
