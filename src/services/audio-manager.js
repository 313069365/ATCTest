const MANIFEST = {
  correct: { src: '/tune/correct.mp3', volume: 1 },
  wrong: { src: '/tune/negativebeep.mp3', volume: 1 },
}

class AudioManager {
  ctx = null
  buffers = {}
  volumes = {}

  async preloadAll(manifest = MANIFEST) {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()

    const results = await Promise.allSettled(
      Object.entries(manifest).map(async ([key, cfg]) => {
        const resp = await fetch(cfg.src)
        const buf = await resp.arrayBuffer()
        this.volumes[key] = cfg.volume
        this.buffers[key] = await decodeAudioDataSafe(this.ctx, buf)
      })
    )
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === 'rejected') {
        console.warn(`[AudioManager] preload failed`, results[i].reason)
      }
    }
  }

  async play(key) {
    if (!this.buffers[key] || !this.ctx) return
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
    const source = this.ctx.createBufferSource()
    source.buffer = this.buffers[key]
    const gain = this.ctx.createGain()
    gain.gain.value = this.volumes[key] ?? 1
    source.connect(gain).connect(this.ctx.destination)
    source.start()
    return source
  }
}

function decodeAudioDataSafe(ctx, data) {
  return new Promise((resolve, reject) => {
    ctx.decodeAudioData(data, resolve, reject)
  })
}

let instance
export function getAudioManager() {
  return instance || (instance = new AudioManager())
}
