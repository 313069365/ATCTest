import { ref, watch } from 'vue'
import { getAudioManager } from '@/infrastructure/services/audio-manager'

export function useSoundEffect(soundEnabledRef) {
  const manager = getAudioManager()
  let preloaded = false

  watch(soundEnabledRef, (enabled) => {
    if (enabled && !preloaded) {
      preloaded = true
      manager.preloadAll()
    }
  }, { immediate: true })

  function playAnswerSound(status) {
    if (!soundEnabledRef?.value) return
    const key = status === 'correct' ? 'correct'
      : (status === 'wrong' || status === 'partial') ? 'wrong'
      : null
    if (!key) return
    manager.play(key).catch(() => {})
  }

  return { playAnswerSound }
}
