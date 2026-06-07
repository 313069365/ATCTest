<template>
  <BottomSheet :visible="true" title="答题卡" @close="$emit('close')">
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
        <template v-if="q.subs && q.subs.length > 0">
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
  </BottomSheet>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/infrastructure/utils/i18n.js'
import { normalizeStatus } from '@/domain/config/questionConfig'
import BottomSheet from '@/presentation/components/ui/BottomSheet.vue'

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
  answerStatus: {
    type: Object,
    default: () => ({})
  },
  userAnswers: {
    type: Object,
    default: () => ({})
  },
})

defineEmits(['close', 'go'])

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
.progress-stats {
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  /* margin-bottom: var(--spacing-md); */
  box-shadow: var(--shadow-lg);
  background-color: var(--background);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
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
  width: 44px;
  height: 44px;
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
