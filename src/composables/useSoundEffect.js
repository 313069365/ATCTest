export function useSoundEffect() {
  function playAnswerSound(status) {
    if (status === 'correct') {
      tryPlay('/tune/correct.mp3')
    } else if (status === 'wrong' || status === 'partial') {
      tryPlay('/tune/negativebeep.mp3')
    }
  }

  function tryPlay(src) {
    try {
      const audio = new Audio(src)
      audio.play().catch(() => {})
    } catch {}
  }

  return { playAnswerSound }
}
