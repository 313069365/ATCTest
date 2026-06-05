<template>
  <BottomSheet :visible="visible" :title="t('practiceSettings')" @close="$emit('close')">
    <section class="settings-section">
      <!-- <span class="section-label">{{ t('practiceMode') }}</span> -->
      <div class="tab-bar" :class="settings.practiceMode">
        <div class="tab-indicator"></div>
        <button class="tab-btn" :class="{ active: settings.practiceMode === 'review' }"
          @click="settings.practiceMode = 'review'">
          <span class="material-symbols-outlined">menu_book</span>
          <span>{{ t('reviewMode') }}</span>
        </button>
        <button class="tab-btn" :class="{ active: settings.practiceMode === 'answer' }"
          @click="settings.practiceMode = 'answer'">
          <span class="material-symbols-outlined">edit_note</span>
          <span>{{ t('answerMode') }}</span>
        </button>
      </div>
    </section>

    <section class="settings-section">
      <!-- <span class="section-label">{{ t('questionOrder') }}</span> -->
      <div class="settings-group">
        <div class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-title">{{ t('sortMode') }}</span>
            <span class="toggle-desc">{{ t('sortModeDesc') }}</span>
          </div>
          <div class="seg-control compact"
            :style="{ '--opt-count': QUESTIONS_SORT.length, '--opt-index': QUESTIONS_SORT.indexOf(settings.questionSort) }">
            <div class="seg-indicator"></div>
            <button v-for="sort in QUESTIONS_SORT" :key="sort" class="seg-option"
              :class="{ active: settings.questionSort === sort }" @click="settings.questionSort = sort">
              {{ t(sort) }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <template v-if="settings.practiceMode === 'answer'">
      <section class="settings-section">
        <!-- <span class="section-label">{{ t('answerDisplay') }}</span> -->
        <div class="settings-group">
          <div class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-title">{{ t('displayMode') }}</span>
              <span class="toggle-desc">{{ t('displayModeDesc') }}</span>
            </div>
            <div class="seg-control compact"
              :style="{ '--opt-count': SHOW_ANSWER_MODE.length, '--opt-index': SHOW_ANSWER_MODE.findIndex(o => o.value === settings.showAnswerMode) }">
              <div class="seg-indicator"></div>
              <button v-for="option in SHOW_ANSWER_MODE" :key="option.value" class="seg-option"
                :class="{ active: settings.showAnswerMode === option.value }"
                @click="settings.showAnswerMode = option.value">
                {{ t(option.label) }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section" v-if="settings.showAnswerMode === 'immediate'">
        <div class="settings-group">
          <div class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-title">{{ t('autoJump') }}</span>
              <span class="toggle-desc">{{ t('autoJumpDesc') }}</span>
            </div>
            <button class="toggle-btn" :class="{ active: settings.autoJump }"
              @click="settings.autoJump = !settings.autoJump">
              <span class="toggle-knob"></span>
            </button>
          </div>
        </div>
      </section>
    </template>

    <template #footer>
      <button class="start-btn" @click="gotopage">
        <span>{{ t('startPractice') }}</span>
        <span class="material-symbols-outlined">arrow_forward</span>
      </button>
    </template>
  </BottomSheet>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { watch, reactive } from 'vue'
import { t } from '@/utils/i18n.js'
import { QUESTION_SORT } from '@/utils/questionConfig'
import { createPracticeSession } from '@/utils/session'
import BottomSheet from '@/components/common/BottomSheet.vue'

const router = useRouter()

const QUESTIONS_SORT = Object.values(QUESTION_SORT)

const SHOW_ANSWER_MODE = [
  { value: 'immediate', label: 'showImmediately' },
  { value: 'manual', label: 'showOnDemand' }
]

const props = defineProps({
  visible: { type: Boolean, default: false },
  subject: { type: Object, default: null }
})

const emit = defineEmits(['close', 'start'])

const DEFAULT_SETTINGS = {
  questionSort: QUESTION_SORT.SEQUENCE,
  practiceMode: 'answer',
  showAnswerMode: 'immediate',
  autoJump: true
}

const settings = reactive({ ...DEFAULT_SETTINGS })

watch(() => props.visible, (newVal) => {
  if (newVal) {
    Object.assign(settings, DEFAULT_SETTINGS)
  }
})

const gotopage = () => {
  const practiceData = {
    subject: props.subject,
    category: props.subject.category,
    scope: props.subject.scope,
    practiceMode: settings.practiceMode,
    questionSort: settings.questionSort,
    showAnswerMode: settings.showAnswerMode,
    autoJump: settings.autoJump,
    shuffleSeed: Date.now()
  }
  emit('close')
  const sessionId = createPracticeSession(practiceData)
  router.push({
    path: '/practice/quiz',
    query: { sessionId, newPractice: 'true' }
  })
}
</script>

<style scoped>
.section-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  padding: 0 4px;
}

.settings-group {
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.seg-control {
  position: relative;
  display: flex;
  background: var(--color-gray-100);
  border-radius: 10px;
  padding: 3px;
}

.seg-indicator {
  position: absolute;
  top: 3px;
  left: calc(3px + (100% - 6px) / var(--opt-count) * var(--opt-index));
  width: calc((100% - 6px) / var(--opt-count));
  height: calc(100% - 6px);
  background: var(--background);
  border-radius: 8px;
  transition: left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  z-index: 0;
}

.seg-control.compact .seg-option {
  padding: 6px 12px;
  font-size: 13px;
}

.seg-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  z-index: 1;
  transition: color 0.25s;
}

.seg-option.active {
  color: var(--primary);
  font-weight: 600;
}

.seg-option:not(.active):active {
  background: var(--color-gray-200);
}

.tab-bar {
  position: relative;
  display: flex;
  background: var(--color-gray-100);
  border-radius: 12px;
  padding: 6px;
  box-shadow: var(--shadow-sm);
}

.tab-indicator {
  position: absolute;
  top: 6px;
  left: 6px;
  width: calc(50% - 6px);
  height: calc(100% - 12px);
  background: var(--primary);
  border-radius: 9px;
  transition: left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.tab-bar.answer .tab-indicator {
  left: calc(50% + 0px);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px;
  border: none;
  background: transparent;
  border-radius: 9px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  z-index: 1;
  transition: color 0.25s;
}

.tab-btn .material-symbols-outlined {
  font-size: 20px;
}

.tab-btn.active {
  color: var(--on-primary);
  font-weight: 600;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
}

.toggle-info {
  display: flex;
  flex-direction: column;
}

.toggle-title {
  font-size: 14px;
  font-weight: 600;
}

.toggle-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.toggle-btn {
  width: 52px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-gray-300);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.25s;
  flex-shrink: 0;
}

.toggle-btn.active {
  background: var(--primary);
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--background);
  transition: transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-btn.active .toggle-knob {
  transform: translateX(24px);
}

.start-btn {
  width: 100%;
  height: 52px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: opacity 0.2s, transform 0.15s;
}

.start-btn:active {
  opacity: 0.85;
  transform: scale(0.97);
}

.start-btn .material-symbols-outlined {
  font-size: 20px;
}
</style>
