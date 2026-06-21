<template>
  <div class="practice-stats-overlay" @click.self="$emit('close')">
    <div class="practice-stats-card">
      <div class="header">
        <span class="header-title">{{ t('practiceStats') }}</span>
      </div>

      <div class="body">
        <div class="tags-row" v-if="settings && !isExamMode">
          <span class="info-tag">{{ orderDisplay }}·{{ modeDisplay }}</span>
          <span class="info-tag" v-if="settings.practiceMode === 'answer'">{{ showAnswerDisplay }}</span>
          <span class="info-tag" v-if="settings.practiceMode === 'answer' && settings.autoJump">自动跳转</span>
        </div>
        <div v-if="!isExamMode" class="ring-block">
          <svg class="ring" viewBox="0 0 136 136">
            <circle class="ring-bg" cx="68" cy="68" r="58" />
            <circle class="ring-fill" :class="accuracyClass" cx="68" cy="68" r="58" :stroke-dasharray="364.4"
              :stroke-dashoffset="ringOffset" />
          </svg>
          <div class="ring-inner">
            <span class="ring-pct" :class="accuracyClass">{{ accuracy }}%</span>
            <span class="ring-lbl">{{ t('accuracy') }}</span>
          </div>
        </div>

        <div class="stat-cards">
          <div class="stat-card">
            <span class="stat-card-value">{{ total }}</span>
            <span class="stat-card-label">{{ t('totalQuestions') }}</span>
          </div>
          <div class="stat-card accent">
            <span class="stat-card-value answered">{{ correct + wrong }}</span>
            <span class="stat-card-label">{{ t('answered') }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-value muted">{{ unanswered }}</span>
            <span class="stat-card-label">{{ t('unanswered') }}</span>
          </div>
        </div>

        <div v-if="!isExamMode" class="result-bar">
          <div class="result-segment" :style="{ flex: correct + wrong || 1 }">
            <div class="result-track correct" :style="{ flex: correct }"></div>
            <div class="result-track wrong" :style="{ flex: wrong }"></div>
          </div>
        </div>

        <div v-if="!isExamMode" class="result-labels">
          <div class="result-label">
            <span class="result-dot correct"></span>
            <span>{{ t('correct') }}</span>
            <span class="result-count">{{ correct }}</span>
          </div>
          <div class="result-label">
            <span class="result-dot wrong"></span>
            <span>{{ t('wrong') }}</span>
            <span class="result-count">{{ wrong }}</span>
          </div>
        </div>

        <div class="footer">
          <div class="footer-piece">
            <Icon name="list-alt-outline" />
            <span>{{ t('progress') }} {{ current }}/{{ totalQ }}</span>
          </div>
          <div class="footer-piece">
            <Icon name="schedule-outline" />
            <span>{{ formattedTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '@/presentation/components/common/Icon.vue'
import { t } from '@/infrastructure/utils/i18n.js'

const props = defineProps({
  total: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  wrong: { type: Number, default: 0 },
  unanswered: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  elapsed: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  totalQ: { type: Number, default: 0 },
  settings: { type: Object, default: null },
  isExamMode: { type: Boolean, default: false }
})

defineEmits(['close'])

const orderDisplay = computed(() => {
  if (!props.settings) return '顺序'
  const orderMap = { 'sequence': '顺序', 'reverse': '逆序', 'shuffle': '乱序' }
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

const accuracyClass = computed(() => {
  if (props.accuracy >= 80) return 'high'
  if (props.accuracy >= 60) return 'mid'
  return 'low'
})

const ringOffset = computed(() => {
  return 364.4 - (364.4 * props.accuracy) / 100
})

const formattedTime = computed(() => {
  const h = Math.floor(props.elapsed / 3600)
  const m = Math.floor((props.elapsed % 3600) / 60)
  const s = props.elapsed % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
</script>

<style scoped>
.practice-stats-overlay {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--app-max-width);
  top: 0;
  bottom: 0;
  background: var(--color-overlay-medium);
  z-index: var(--z-popup);
  display: flex;
  align-items: center;
  justify-content: center;
}

.practice-stats-card {
  background: var(--color-muted);
  width: calc(100% - 48px);
  max-width: 340px;
  max-height: 80vh;
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* === Header === */
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-ms) var(--space-md);
  background: var(--color-background);
  margin-bottom: var(--space-sm);
}

.header-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}


/* === Tags === */
.tags-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.info-tag {
  font-size: var(--font-size-sm);
  padding: 4px 10px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
}

/* === Body === */
.body {
  background: var(--color-background);
  margin: 0 var(--space-md) var(--space-md);
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
}

/* === Ring === */
.ring-block {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.06));
}

.ring-bg {
  fill: none;
  stroke: var(--gray-100);
  stroke-width: 10;
}

.ring-fill {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}

.ring-fill.high {
  stroke: var(--color-success);
}

.ring-fill.mid {
  stroke: var(--color-warning);
}

.ring-fill.low {
  stroke: var(--color-destructive);
}

.ring-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-pct {
  font-size: 30px;
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
}

.ring-pct.high {
  color: var(--color-success);
}

.ring-pct.mid {
  color: var(--color-warning);
}

.ring-pct.low {
  color: var(--color-destructive);
}

.ring-lbl {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: 5px;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.5px;
}

/* === Stat cards row === */
.stat-cards {
  width: 100%;
  display: flex;
  gap: var(--space-ms);
}

.stat-card {
  flex: 1;
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.stat-card-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text);
  line-height: var(--line-height-tight);
}

.stat-card-value.answered {
  color: var(--color-primary);
}

.stat-card-value.muted {
  color: var(--color-text-secondary);
}

.stat-card-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

/* === Result bar === */
.result-bar {
  width: 100%;
  height: 8px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--gray-200);
  display: flex;
}

.result-segment {
  display: flex;
}

.result-track {
  height: 100%;
  transition: flex 0.4s ease;
}

.result-track.correct {
  background: var(--color-success);
}

.result-track.wrong {
  background: var(--color-destructive);
}

/* === Result labels === */
.result-labels {
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin-top: -8px;
}

.result-label {
  display: flex;
  align-items: center;
  gap: var(--space-2xs);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.result-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.result-dot.correct {
  background: var(--color-success);
}

.result-dot.wrong {
  background: var(--color-destructive);
}

.result-count {
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  min-width: 20px;
  text-align: right;
}

/* === Footer === */
.footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid var(--color-border-light);
  margin-top: auto;
}

.footer-piece {
  display: flex;
  align-items: center;
  gap: var(--space-2xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.footer-piece svg {
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
}
</style>
