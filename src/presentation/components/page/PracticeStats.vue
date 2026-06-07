<template>
  <div class="practice-stats-overlay" @click.self="$emit('close')">
    <div class="practice-stats-card">
      <div class="header">
        <span class="header-title">{{ t('practiceStats') }}</span>
      </div>

      <div class="body">
        <div class="tags-row" v-if="settings">
          <span class="info-tag">{{ orderDisplay }}·{{ modeDisplay }}</span>
          <span class="info-tag" v-if="settings.practiceMode === 'answer'">{{ showAnswerDisplay }}</span>
          <span class="info-tag" v-if="settings.practiceMode === 'answer' && settings.autoJump">自动跳转</span>
        </div>
        <div class="ring-block">
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

        <div class="result-bar">
          <div class="result-segment" :style="{ flex: correct + wrong || 1 }">
            <div class="result-track correct" :style="{ flex: correct }"></div>
            <div class="result-track wrong" :style="{ flex: wrong }"></div>
          </div>
        </div>

        <div class="result-labels">
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
            <span class="material-symbols-outlined">list_alt</span>
            <span>{{ t('progress') }} {{ current }}/{{ totalQ }}</span>
          </div>
          <div class="footer-piece">
            <span class="material-symbols-outlined">schedule</span>
            <span>{{ formattedTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
  settings: { type: Object, default: null }
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
  background: rgba(0, 0, 0, 0.45);
  z-index: var(--z-popup);
  display: flex;
  align-items: center;
  justify-content: center;
}

.practice-stats-card {
  background: var(--background-secondary);
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
  padding: var(--spacing-smd) var(--spacing-md);
  background: var(--background);
  margin-bottom: var(--spacing-sm);
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--on-surface);
}


/* === Tags === */
.tags-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.info-tag {
  font-size: 12px;
  padding: 4px 10px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 6px;
  font-weight: 500;
}

/* === Body === */
.body {
  background: var(--background);
  margin: 0 var(--spacing-md) var(--spacing-md);
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
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
  stroke: #f0f0f3;
  stroke-width: 10;
}

.ring-fill {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}

.ring-fill.high {
  stroke: var(--success);
}

.ring-fill.mid {
  stroke: var(--warning);
}

.ring-fill.low {
  stroke: var(--error);
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
  font-weight: 800;
  line-height: 1;
}

.ring-pct.high {
  color: var(--success);
}

.ring-pct.mid {
  color: var(--warning);
}

.ring-pct.low {
  color: var(--error);
}

.ring-lbl {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 5px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* === Stat cards row === */
.stat-cards {
  width: 100%;
  display: flex;
  gap: 10px;
}

.stat-card {
  flex: 1;
  background: var(--background);
  border-radius: 14px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.stat-card-value {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.stat-card-value.answered {
  color: var(--primary);
}

.stat-card-value.muted {
  color: var(--text-secondary);
}

.stat-card-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* === Result bar === */
.result-bar {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--color-gray-200);
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
  background: var(--success);
}

.result-track.wrong {
  background: var(--error);
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
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.result-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.result-dot.correct {
  background: var(--success);
}

.result-dot.wrong {
  background: var(--error);
}

.result-count {
  font-weight: 700;
  color: var(--text-primary);
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
  border-top: 1px solid var(--border-color-light);
  margin-top: auto;
}

.footer-piece {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.footer-piece .material-symbols-outlined {
  font-size: 18px;
  color: var(--icon-color);
}
</style>
