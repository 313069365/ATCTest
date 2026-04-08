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
              <span class="info-tag">{{ orderDisplay }}{{ modeDisplay }}</span>
              <span class="info-tag" v-if="settings.practiceMode === 'answer'">
                {{ showAnswerDisplay }}
              </span>
              <span class="info-tag" v-if="settings.practiceMode === 'answer' && settings.optionsSort">
                选项乱序
              </span>
              <span class="info-tag" v-if="settings.practiceMode === 'answer' && settings.autoJump">
                自动跳转
              </span>
            </div>
          </div>

          <div class="legend">
            <div class="legend-item">
              <span class="legend-dot correct"></span>
              <span>正确</span>
            </div>
            <div class="legend-item" v-if="settings?.practiceMode !== 'review'">
              <span class="legend-dot partial"></span>
              <span>部分正确</span>
            </div>
            <div class="legend-item" v-if="settings?.practiceMode !== 'review'">
              <span class="legend-dot unchecked"></span>
              <span>未检查</span>
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
          <template v-for="(q, idx) in questions" :key="idx">
            <template v-if="q.type === 'reading' && q.subs">
              <div class="question-group">
                <div class="group-header">
                  <span class="group-title">{{ t('readingMaterial') || '阅读理解' }}: {{ q.id }}</span>
                </div>
                <div class="sub-question-grid">
                  <button v-for="(sq, sqIdx) in q.subs" :key="sqIdx" class="question-btn"
                    :class="getSubQuestionBtnClass(idx, sqIdx, sq)" @click="$emit('go', idx, sqIdx)">
                    {{ sqIdx + 1 }}
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <button class="question-btn" :class="getQuestionBtnClass(idx, q)" @click="$emit('go', idx)">
                {{ idx + 1 }}
              </button>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/utils/i18n.js'
import { useAnswerDisplay } from '@/composables/useAnswerDisplay'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  currentSubIndex: {
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
  answerStatus: {
    type: Object,
    default: () => ({})
  },
  userAnswers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'go', 'exit'])

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


// 获取按钮状态（简化：直接使用 answerStatus）
function getQuestionBtnClass(idx, q) {
  // 当前题目显示蓝色
  if (idx === props.currentIndex) return 'current'

  // 直接使用 answerStatus
  const status = props.answerStatus[q.id]
  if (!status) return ''

  // 背题模式不显示状态
  if (props.settings?.practiceMode === 'review') return ''

  return status
}

function getSubQuestionBtnClass(qIdx, sqIdx, sq) {
  // 当前题目显示蓝色
  if (props.currentIndex === qIdx && props.currentSubIndex === sqIdx) return 'current'

  const parentId = props.questions[qIdx].id
  const status = props.answerStatus[parentId]?.[sqIdx]
  if (!status) return ''

  if (props.settings?.practiceMode === 'review') return ''

  return status
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

.practice-info {
  padding-bottom: var(--spacing-sm);
}

.tags-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.info-tag {
  font-size: 12px;
  padding: 4px 10px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-lg);
  font-weight: 500;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color-strong);
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

.legend-dot.partial {
  background: var(--partial);
}

.legend-dot.unchecked {
  background: var(--unchecked);
}

.question-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.question-group {
  width: 100%;
  margin-bottom: var(--spacing-sm);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--surface-variant);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}

.group-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--icon-color);
}

.sub-question-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-left: var(--spacing-sm);
}

.sub-question-grid .question-btn {
  min-width: 45px;
  font-size: var(--font-size-md);
  border-radius: 50%;
}

.question-list .question-btn {
  min-width: 50px;
  aspect-ratio: 1;
  margin: 0 auto;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-gray-300);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--icon-color);
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
  background: var(--warning);
  color: #181c1f;
}

.question-btn.current {
  background: var(--primary);
  color: #fff;
}

.question-btn.unchecked {
  background: var(--unchecked);
  color: #fff;
}

.question-btn.partial {
  background: var(--partial);
  color: #fff;
}
</style>
