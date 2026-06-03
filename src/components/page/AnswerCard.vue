<template>
  <div class="answer-card-modal" @click.self="$emit('close')">
    <div class="answer-card-content">
      <div class="answer-card-header">
        <!-- <button class="close-btn" @click="$emit('close')">
          <span class="material-symbols-outlined">horizontal_rule</span>
        </button> -->
        <div class="header-spacer"></div>
        <span class="header-title">答题卡</span>
        <div class="header-spacer"></div>
      </div>

      <div class="answer-card-body">
        <div class="progress-stats">
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
          <template v-for="(q, idx) in questions" :key="idx">
            <template v-if="isComplexQuestion(q)">
              <div class="question-group">
                <div class="group-header">
                  <span class="group-title">{{ t('questionId') || '' }}: {{ q.id }}</span>
                  <div class="sub-question-grid">
                    <button v-for="(sq, sqIdx) in q.subs" :key="sqIdx" class="sub-question-btn"
                      :class="getSubQuestionBtnClass(idx, sqIdx, sq)" @click="$emit('go', idx, sqIdx)">
                      {{ sqIdx + 1 }}
                    </button>
                  </div>
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
import { isComplexQuestion, normalizeStatus } from '@/utils/questionConfig'

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
  },
})


// 获取按钮状态
function getQuestionBtnClass(idx, q) {
  if (idx === props.currentIndex) {
    var status = props.answerStatus[q.id] || ''
    status = normalizeStatus(status)
    var mode = props.settings ? props.settings.practiceMode : 'answer'
    if (!status || status === 'unanswered') {
      return 'current'
    }
    var baseClass = status === 'wrong' ? 'wrong' : status
    return 'current-' + baseClass
  }
  var status = props.answerStatus[q.id] || ''
  status = normalizeStatus(status)
  if (!status) return ''
  return status === 'wrong' ? 'wrong' : status
}

// 获取子题按钮状态
function getSubQuestionBtnClass(qIdx, sqIdx, sq) {
  if (props.currentIndex === qIdx && props.currentSubIndex === sqIdx) {
    var parentId = props.questions[qIdx].id
    var status = props.answerStatus[parentId] ? props.answerStatus[parentId][sqIdx] : ''
    status = normalizeStatus(status)
    var mode = props.settings ? props.settings.practiceMode : 'answer'
    if (!status || status === 'unanswered') {
      return 'current'
    }
    var baseClass = status === 'wrong' ? 'wrong' : status
    return 'current-' + baseClass
  }
  var parentId = props.questions[qIdx].id
  var status = props.answerStatus[parentId] ? props.answerStatus[parentId][sqIdx] : ''
  status = normalizeStatus(status)
  if (!status) return ''
  return status === 'wrong' ? 'wrong' : status
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
  max-height: 80vh;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.answer-card-header {
  display: flex;
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
  flex-shrink: 0;
}

.close-btn .material-symbols-outlined {
  font-size: 18px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--on-surface);
}

.header-spacer {
  width: 35px;
  flex-shrink: 0;
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
  padding: var(--spacing-sm) var(--spacing-md);
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
  /* padding-top: var(--spacing-md); */
  /* border-top: 1px solid var(--border-color-strong); */
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

.question-group {
  width: 100%;

  /* margin-bottom: var(--spacing-sm); */
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background-color: var(--background);
  border-radius: var(--radius-md);
}

.group-title {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--icon-color);
}

.sub-question-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.sub-question-grid .sub-question-btn {
  min-width: 30px;
  aspect-ratio: 1;
  border-radius: var(--radius-full);
  background: var(--color-gray-300);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--icon-color);
  cursor: pointer;
}

.sub-question-grid .sub-question-btn.correct {
  background: var(--success);
  color: #fff;
}

.sub-question-grid .sub-question-btn.wrong {
  background: var(--error);
  color: #fff;
}

.sub-question-grid .sub-question-btn.unknown {
  background: var(--warning);
  color: #181c1f;
}

.sub-question-grid .sub-question-btn.current {
  background: var(--primary);
  border: 3px solid var(--primary);
  color: #fff;
}

.sub-question-grid .sub-question-btn.current-correct {
  background: var(--success);
  border: 3px solid var(--primary);
  color: #fff;
}

.sub-question-grid .sub-question-btn.current-wrong {
  background: var(--error);
  border: 3px solid var(--primary);
  color: #fff;
}

.sub-question-grid .sub-question-btn.current-unknown {
  background: var(--warning);
  border: 3px solid var(--primary);
  color: #181c1f;
}

.question-list .question-btn {
  min-width: 50px;
  aspect-ratio: 1;
  margin: 0 auto;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-gray-300);
  font-size: var(--font-size-md);
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
  border: 3px solid var(--primary);
  color: #fff;
}

.question-btn.current-correct {
  background: var(--success);
  border: 3px solid var(--primary);
  color: #fff;
}

.question-btn.current-wrong {
  background: var(--error);
  border: 3px solid var(--primary);
  color: #fff;
}

.question-btn.current-unknown {
  background: var(--warning);
  border: 3px solid var(--primary);
  color: #181c1f;
}
</style>
