<template>
  <HistoryBase
    title="考试记录"
    topbarVariant="default"
    :topbarStyle="{ '--topbar-bg': 'var(--color-success)', '--topbar-color': '#fff', borderBottom: 'none' }"
    :list="list"
    :avgAccuracy="avgAccuracy"
    emptyTitle="暂无考试记录"
    emptyDesc="参加考试后，记录会自动保存"
    @back="$router.back()"
    @clear="clearAll"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import HistoryBase from '@/presentation/pages/session/components/HistoryBase.vue'

const router = useRouter()

const list = computed(() => [])
const avgAccuracy = computed(() => 0)

function clearAll() {
  // TODO: implement clear exam history
}
</script>
