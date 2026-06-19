<template>
  <BottomSheet :visible="visible" :title="t('practiceSettings')" @close="$emit('close')">
    <section class="settings-section">
      <!-- <span class="section-label">{{ t('practiceMode') }}</span> -->
      <SegmentedControl v-model="settings.practiceMode" :options="modeOptions" variant="primary" size="md" />
    </section>

    <section class="settings-section">
      <!-- <span class="section-label">{{ t('questionOrder') }}</span> -->
      <div class="settings-group">
        <div class="toggle-item">
          <div class="toggle-info">
            <span class="toggle-title">{{ t('sortMode') }}</span>
            <span class="toggle-desc">{{ t('sortModeDesc') }}</span>
          </div>
          <SegmentedControl v-model="settings.questionSort" :options="sortOptions" compact />
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
            <SegmentedControl v-model="settings.showAnswerMode" :options="displayOptions" compact />
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
        <Icon name="arrow-forward" />
      </button>
    </template>
  </BottomSheet>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { watch, reactive, computed } from 'vue'
import Icon from '@/presentation/components/common/Icon.vue'
import { t } from '@/infrastructure/utils/i18n.js'
import { QUESTION_SORT } from '@/domain/config/questionConfig'
import { createPracticeSession } from '@/infrastructure/storage/session'
import BottomSheet from '@/presentation/components/common/BottomSheet.vue'
import SegmentedControl from '@/presentation/components/common/SegmentedControl.vue'

const router = useRouter()

const QUESTIONS_SORT = Object.values(QUESTION_SORT)

const modeOptions = [
  { value: 'review', label: t('reviewMode'), icon: 'menu-book-outline' },
  { value: 'answer', label: t('answerMode'), icon: 'edit-note-outline' },
]

const sortOptions = computed(() => QUESTIONS_SORT.map(sort => ({ value: sort, label: t(sort) })))

const SHOW_ANSWER_MODE = [
  { value: 'immediate', label: 'showImmediately' },
  { value: 'manual', label: 'showOnDemand' }
]

const displayOptions = computed(() => SHOW_ANSWER_MODE.map(opt => ({ value: opt.value, label: t(opt.label) })))

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
  width: 60%;
  margin: 0 auto;
  padding: 12px 24px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s, transform 0.15s;
}

.start-btn:active {
  opacity: 0.85;
  transform: scale(0.97);
}

.start-btn svg {
  font-size: 20px;
}
</style>
