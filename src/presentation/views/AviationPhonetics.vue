<template>
  <div class="phonetics-page">
    <div id="toast"></div>

    <div class="phonetics-top-bar">
      <button class="back-btn" @click="goBack">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <div class="status-bar">
        <span class="status-dot" :class="statusClass"></span>
        <span>{{ statusText }}</span>
      </div>
      <button class="mode-toggle" @click="toggleMode">
        <span :class="{ active: useLocal }">本地</span>
        <span class="sep">/</span>
        <span :class="{ active: !useLocal }">API</span>
      </button>
    </div>

    <h1>民航陆空通话发音</h1>
    <p class="subtitle">ICAO 标准字母与数字拼读 — 点击卡片试听</p>

    <div class="section-title">数字 0 – 9</div>
    <div class="grid">
      <div v-for="item in digits" :key="item.char" class="card" @click="speak(item.word)">
        <div class="char">{{ item.char }}</div>
        <div class="word">{{ item.word }}</div>
        <div class="phonetic">{{ item.phonetic }}</div>
      </div>
    </div>

    <div class="section-title">字母 A – Z</div>
    <div class="grid">
      <div v-for="item in letters" :key="item.char" class="card" @click="speak(item.word)">
        <div class="char">{{ item.char }}</div>
        <div class="word">{{ item.word }}</div>
        <div class="phonetic">{{ item.phonetic }}</div>
      </div>
    </div>

    <div class="mode-tip">WYD·ZSNB @2026</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}

const digits = [
  { char: '0', word: 'Zero', phonetic: 'ZEE-roh' },
  { char: '1', word: 'One', phonetic: 'WUN' },
  { char: '2', word: 'Two', phonetic: 'TOO' },
  { char: '3', word: 'Tree', phonetic: 'TREE' },
  { char: '4', word: 'Four', phonetic: 'FOW-er' },
  { char: '5', word: 'Five', phonetic: 'FIFE' },
  { char: '6', word: 'Six', phonetic: 'SIX' },
  { char: '7', word: 'Seven', phonetic: 'SEV-en' },
  { char: '8', word: 'Eight', phonetic: 'AIT' },
  { char: '9', word: 'Nine', phonetic: 'NIN-er' },
]

const letters = [
  { char: 'A', word: 'Alpha', phonetic: 'AL-fah' },
  { char: 'B', word: 'Bravo', phonetic: 'BRAH-voh' },
  { char: 'C', word: 'Charlie', phonetic: 'CHAR-lee' },
  { char: 'D', word: 'Delta', phonetic: 'DELL-tah' },
  { char: 'E', word: 'Echo', phonetic: 'ECK-oh' },
  { char: 'F', word: 'Foxtrot', phonetic: 'FOKS-trot' },
  { char: 'G', word: 'Golf', phonetic: 'GOLF' },
  { char: 'H', word: 'Hotel', phonetic: 'hoh-TELL' },
  { char: 'I', word: 'India', phonetic: 'IN-dee-ah' },
  { char: 'J', word: 'Juliet', phonetic: 'JEW-lee-ETT' },
  { char: 'K', word: 'Kilo', phonetic: 'KEY-loh' },
  { char: 'L', word: 'Lima', phonetic: 'LEE-mah' },
  { char: 'M', word: 'Mike', phonetic: 'MIKE' },
  { char: 'N', word: 'November', phonetic: 'no-VEM-ber' },
  { char: 'O', word: 'Oscar', phonetic: 'OSS-kah' },
  { char: 'P', word: 'Papa', phonetic: 'pah-PAH' },
  { char: 'Q', word: 'Quebec', phonetic: 'keh-BECK' },
  { char: 'R', word: 'Romeo', phonetic: 'ROW-me-oh' },
  { char: 'S', word: 'Sierra', phonetic: 'see-AIR-ah' },
  { char: 'T', word: 'Tango', phonetic: 'TANG-go' },
  { char: 'U', word: 'Uniform', phonetic: 'YOU-nee-form' },
  { char: 'V', word: 'Victor', phonetic: 'VIK-tah' },
  { char: 'W', word: 'Whiskey', phonetic: 'WISS-key' },
  { char: 'X', word: 'X-ray', phonetic: 'ECKS-ray' },
  { char: 'Y', word: 'Yankee', phonetic: 'YANG-key' },
  { char: 'Z', word: 'Zulu', phonetic: 'ZOO-loo' },
]

const useLocal = ref(true)
const statusText = ref('本地音源 · 已就绪')
const statusClass = ref('local')

function toast(msg) {
  const el = document.getElementById('toast')
  if (!el) return
  el.textContent = msg
  el.className = 'show'
  clearTimeout(window._toast)
  window._toast = setTimeout(() => el.className = '', 2000)
}

const wordToChar = Object.fromEntries(letters.map(l => [l.word, l.char]))

function playLocal(text) {
  const char = wordToChar[text]
  if (!char) return Promise.reject('no local file')
  return new Promise((resolve, reject) => {
    const audio = new Audio('/phonetics/' + char + '.mp3')
    audio.addEventListener('ended', resolve, { once: true })
    audio.addEventListener('error', reject, { once: true })
    audio.play().catch(reject)
  })
}

function playOnline(text) {
  return new Promise((resolve, reject) => {
    const url = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(text) + '&type=2'
    const audio = new Audio(url)
    audio.addEventListener('canplaythrough', () => resolve(audio), { once: true })
    audio.addEventListener('error', reject, { once: true })
    audio.play().catch(reject)
  })
}

function toggleMode() {
  useLocal.value = !useLocal.value
  statusClass.value = useLocal.value ? 'local' : 'on'
  statusText.value = useLocal.value ? '本地音源 · 已就绪' : '在线音源 · 已就绪'
}

function speak(text) {
  if (useLocal.value) {
    playLocal(text).catch(() => playOnline(text)).catch(() => toast('发音失败'))
  } else {
    playOnline(text).catch(() => toast('发音失败'))
  }
}
</script>

<style scoped>
.phonetics-page {
  background: linear-gradient(135deg, #0a1628 0%, #1a2a4a 100%);
  min-height: 100vh;
  color: #fff;
  padding: 30px 20px;
}

.phonetics-top-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  margin-bottom: 6px;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8ab4f8;
  transition: background 0.2s;
}

.mode-toggle {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #8ab4f8;
  transition: background 0.2s;
  line-height: 1;
}

.mode-toggle:hover {
  background: rgba(255, 255, 255, 0.12);
}

.mode-toggle span {
  opacity: 0.35;
  transition: opacity 0.2s;
}

.mode-toggle span.active {
  opacity: 1;
  color: #fff;
}

.mode-toggle .sep {
  opacity: 0.2;
  color: #666;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.back-btn .material-symbols-outlined {
  font-size: 20px;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #8ab4f8;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
  transition: background 0.3s;
  display: inline-block;
}

.status-dot.on {
  background: #2196f3;
  box-shadow: 0 0 6px #2196f3;
}

.status-dot.off {
  background: #f44336;
  box-shadow: 0 0 6px #f44336;
}

.status-dot.local {
  background: #4caf50;
  box-shadow: 0 0 6px #4caf50;
}

#toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 99;
  white-space: nowrap;
}

#toast.show {
  opacity: 1;
}

h1 {
  text-align: center;
  font-size: 28px;
  margin-bottom: 6px;
  letter-spacing: 2px;
}

.subtitle {
  text-align: center;
  color: #8ab4f8;
  font-size: 14px;
  margin-bottom: 30px;
}

.section-title {
  font-size: 20px;
  margin: 30px 0 16px 12px;
  color: #8ab4f8;
  border-left: 4px solid #4a90d9;
  padding-left: 12px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 900px;
  margin: 0 auto;
}

.card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #4a90d9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 217, 0.2);
}

.card:active {
  transform: scale(0.95);
}

.card .char {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.card .phonetic {
  font-size: 12px;
  color: #8ab4f8;
  font-family: "Times New Roman", serif;
}

.card .word {
  font-size: 14px;
  color: #a0c4ff;
  font-weight: 500;
}

.mode-tip {
  text-align: center;
  font-size: 12px;
  color: #667;
  margin-top: 30px;
}

@media (max-width: 480px) {
  .card {
    padding: 12px 6px;
  }

  .card .char {
    font-size: 26px;
  }
}
</style>
