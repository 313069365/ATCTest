<template>
  <HistoryBase
    title="练习记录"
    topbarVariant="primary"
    :topbarStyle="{}"
    :list="list"
    :avgAccuracy="avgAccuracy"
    emptyTitle="暂无练习记录"
    emptyDesc="开始练习后，记录会自动保存"
    :showStartBtn="true"
    startBtnText="开始练习"
    @back="$router.back()"
    @clear="clearAll"
    @start-practice="$router.push({ name: 'Practice' })"
  />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HistoryBase from '@/presentation/pages/session/components/HistoryBase.vue'
import { usePracticeService } from '@/domain/composables/usePracticeService'
import { t } from '@/infrastructure/utils/i18n.js'

const router = useRouter()
const pm = usePracticeService()

onMounted(() => {
  pm.refresh()
})

function formatRelativeTime(ts) {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}秒`
  return `${m}分钟${s}秒`
}

const list = computed(() => {
  return pm.sessions.value.slice(0, 50).map((s, idx) => {
    const st = pm.getSessionStats(s)
    const altClass = idx % 2 === 0 ? 'alt-blue' : 'alt-amber'
    const total = st.correctCount + st.wrongCount + st.unansweredCount + st.unknownCount
    return {
      id: st.timestamp || Math.random(),
      title: t(st.subject) || st.subject,
      date: st.timestamp ? formatRelativeTime(st.timestamp) : '',
      accuracy: st.accuracy,
      correct: st.correctCount,
      total: st.totalQuestions,
      score: st.correctCount,
      totalScore: total,
      time: formatDuration(st.elapsedSeconds),
      cardClass: ['practice', altClass],
      altClass,
      badge: '练习',
      badgeClass: [altClass],
    }
  })
})

const avgAccuracy = computed(() => {
  if (list.value.length === 0) return 0
  const sum = list.value.reduce((acc, item) => acc + item.accuracy, 0)
  return Math.round(sum / list.value.length)
})

function clearAll() {
  // TODO: implement clear practice history
}
</script>
