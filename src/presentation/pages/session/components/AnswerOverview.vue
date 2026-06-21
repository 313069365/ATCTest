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

    <div class="question-list-wrapper">
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
  padding: var(--space-sm) var(--space-md);
  /* margin-bottom: var(--space-md); */
  box-shadow: var(--shadow-lg);
  background-color: var(--color-background);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  justify-content: center;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-sm);
  background: var(--color-border-strong);
}

.legend-dot.correct {
  background: var(--color-success);
}

.legend-dot.wrong {
  background: var(--color-destructive);
}

.legend-dot.unknown {
  background: var(--color-warning);
}

.legend-dot.current {
  background: var(--color-primary);
}

.question-list-wrapper {
  margin: 0 auto;
}

.question-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-ms);
  justify-content: flex-start;
  margin: 0 auto;
  padding-inline: var(--space-sm);
}

.question-group {
  width: 100%;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
}

.group-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.sub-question-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.sub-question-grid .sub-question-btn {
  min-width: 30px;
  aspect-ratio: 1;
  border-radius: var(--radius-full);
  background: var(--gray-300);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.sub-question-grid .sub-question-btn.correct {
  background: var(--color-success);
  color: var(--color-primary-foreground);
}

.sub-question-grid .sub-question-btn.wrong {
  background: var(--color-destructive);
  color: var(--color-primary-foreground);
}

.sub-question-grid .sub-question-btn.unknown {
  background: var(--color-warning);
  color: var(--color-text);
}

.sub-question-grid .sub-question-btn.current {
  background: var(--color-primary);
  border: 3px solid var(--color-primary);
  color: var(--color-primary-foreground);
}

.sub-question-grid .sub-question-btn.current-correct {
  background: var(--color-success);
  border: 3px solid var(--color-primary);
  color: var(--color-primary-foreground);
}

.sub-question-grid .sub-question-btn.current-wrong {
  background: var(--color-destructive);
  border: 3px solid var(--color-primary);
  color: var(--color-primary-foreground);
}

.sub-question-grid .sub-question-btn.current-unknown {
  background: var(--color-warning);
  border: 3px solid var(--color-primary);
  color: var(--color-text);
}

.question-list .question-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--gray-300);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.question-btn:active {
  transform: scale(0.95);
}

.question-btn.correct {
  background: var(--color-success);
  color: var(--color-primary-foreground);
}

.question-btn.wrong {
  background: var(--color-destructive);
  color: var(--color-primary-foreground);
}

.question-btn.unknown {
  background: var(--color-warning);
  color: var(--color-text);
}

.question-btn.current {
  background: var(--color-primary);
  border: 3px solid var(--color-primary);
  color: var(--color-primary-foreground);
}

.question-btn.current-correct {
  background: var(--color-success);
  border: 3px solid var(--color-primary);
  color: var(--color-primary-foreground);
}

.question-btn.current-wrong {
  background: var(--color-destructive);
  border: 3px solid var(--color-primary);
  color: var(--color-primary-foreground);
}

.question-btn.current-unknown {
  background: var(--color-warning);
  border: 3px solid var(--color-primary);
  color: var(--color-text);
}
</style>
