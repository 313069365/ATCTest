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
    </div>

    <h1>民航空陆通话发音</h1>
    <p class="subtitle">ICAO 标准字母与数字拼读 — 点击卡片试听</p>

    <div class="section-title">数字 0 – 9</div>
    <div class="grid">
      <div
        v-for="item in digits"
        :key="item.char"
        class="card"
        @click="speak(item.word)"
      >
        <div class="char">{{ item.char }}</div>
        <div class="word">{{ item.word }}</div>
        <div class="phonetic">{{ item.phonetic }}</div>
      </div>
    </div>

    <div class="section-title">字母 A – Z</div>
    <div class="grid">
      <div
        v-for="item in letters"
        :key="item.char"
        class="card"
        @click="speak(item.word)"
      >
        <div class="char">{{ item.char }}</div>
        <div class="word">{{ item.word }}</div>
        <div class="phonetic">{{ item.phonetic }}</div>
      </div>
    </div>

    <div class="mode-tip" id="mode-tip">{{ modeTip }}</div>
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
  { char: '1', word: 'One',     phonetic: '/wʌn/',    say: 'Wun'         },
  { char: '2', word: 'Two',     phonetic: '/tuː/',    say: 'Too'         },
  { char: '3', word: 'Three',   phonetic: '/triː/',   say: 'Tree'        },
  { char: '4', word: 'Four',    phonetic: '/ˈfaʊər/', say: 'Fower'       },
  { char: '5', word: 'Five',    phonetic: '/faɪf/',   say: 'Fife'        },
  { char: '6', word: 'Six',     phonetic: '/sɪks/',   say: 'Six'         },
  { char: '7', word: 'Seven',   phonetic: '/ˈsɛvən/', say: 'Seven'       },
  { char: '8', word: 'Eight',   phonetic: '/eɪt/',    say: 'Ait'         },
  { char: '9', word: 'Nine',    phonetic: '/ˈnaɪnər/', say: 'Niner'       },
  { char: '0', word: 'Zero',    phonetic: '/ˈziːroʊ/', say: 'Zee ro'      },
]

const letters = [
  { char: 'A', word: 'Alfa',     phonetic: '/ˈælfə/',      say: 'Alfa'       },
  { char: 'B', word: 'Bravo',    phonetic: '/ˈbrɑːvoʊ/',   say: 'Bravo'      },
  { char: 'C', word: 'Charlie',  phonetic: '/ˈtʃɑːrli/',   say: 'Charlie'    },
  { char: 'D', word: 'Delta',    phonetic: '/ˈdɛltə/',     say: 'Delta'      },
  { char: 'E', word: 'Echo',     phonetic: '/ˈɛkoʊ/',      say: 'Echo'       },
  { char: 'F', word: 'Foxtrot',  phonetic: '/ˈfɒkstrɒt/',  say: 'Foxtrot'    },
  { char: 'G', word: 'Golf',     phonetic: '/ɡɒlf/',       say: 'Golf'       },
  { char: 'H', word: 'Hotel',    phonetic: '/hoʊˈtɛl/',    say: 'Hotel'      },
  { char: 'I', word: 'India',    phonetic: '/ˈɪndiə/',     say: 'India'      },
  { char: 'J', word: 'Juliett',  phonetic: '/ˈdʒuːliɛt/',  say: 'Jew lee ett'},
  { char: 'K', word: 'Kilo',     phonetic: '/ˈkiːloʊ/',    say: 'Kilo'       },
  { char: 'L', word: 'Lima',     phonetic: '/ˈliːmə/',     say: 'Lima'       },
  { char: 'M', word: 'Mike',     phonetic: '/maɪk/',       say: 'Mike'       },
  { char: 'N', word: 'November', phonetic: '/noʊˈvɛmbər/', say: 'November'   },
  { char: 'O', word: 'Oscar',    phonetic: '/ˈɒskər/',     say: 'Oscar'      },
  { char: 'P', word: 'Papa',     phonetic: '/pəˈpɑː/',     say: 'Papa'       },
  { char: 'Q', word: 'Quebec',   phonetic: '/kwɪˈbɛk/',    say: 'Quebec'     },
  { char: 'R', word: 'Romeo',    phonetic: '/ˈroʊmioʊ/',   say: 'Romeo'      },
  { char: 'S', word: 'Sierra',   phonetic: '/siˈɛrə/',     say: 'Sierra'     },
  { char: 'T', word: 'Tango',    phonetic: '/ˈtæŋɡoʊ/',    say: 'Tango'      },
  { char: 'U', word: 'Uniform',  phonetic: '/ˈjuːnɪfɔrm/', say: 'Uniform'    },
  { char: 'V', word: 'Victor',   phonetic: '/ˈvɪktər/',    say: 'Victor'     },
  { char: 'W', word: 'Whiskey',  phonetic: '/ˈwɪski/',     say: 'Whiskey'    },
  { char: 'X', word: 'X-ray',    phonetic: '/ˈɛksreɪ/',    say: 'Ecks ray'   },
  { char: 'Y', word: 'Yankee',   phonetic: '/ˈjæŋki/',     say: 'Yankee'     },
  { char: 'Z', word: 'Zulu',     phonetic: '/ˈzuːluː/',    say: 'Zulu'       },
]

const statusText = ref('检测中...')
const statusClass = ref('')
const modeTip = ref('')
let mode = 0

function setStatus(level, msg) {
  const cls = ['off', 'on', 'local', 'off'][Math.max(0, level + 1)]
  statusClass.value = cls
  statusText.value = msg
}

function toast(msg) {
  const el = document.getElementById('toast')
  if (!el) return
  el.textContent = msg
  el.className = 'show'
  clearTimeout(window._toast)
  window._toast = setTimeout(() => el.className = '', 2000)
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

function playLocal(text) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) return reject('no api')
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.85
    const voices = window.speechSynthesis.getVoices()
    const en = voices.find(v => v.lang.startsWith('en'))
    if (en) u.voice = en
    u.onend = resolve
    u.onerror = () => reject('speech error')
    window.speechSynthesis.speak(u)
  })
}

function speak(text) {
  if (mode === -1) { toast('当前设备无任何可用的发音方式'); return }
  if (mode === 0)  { toast('发音引擎尚未就绪，请稍候'); return }

  if (mode === 1) {
    playOnline(text).catch(() => toast('在线发音失败'))
  } else {
    playLocal(text).catch(() => toast('本地发音失败'))
  }
}

onMounted(() => {
  mode = 1
  setStatus(1, '在线音源 · 已就绪')
  modeTip.value = '当前使用有道词典在线语音'
})
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
  background: rgba(255,255,255,0.08);
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

.back-btn:hover {
  background: rgba(255,255,255,0.15);
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

.status-dot.on { background: #4caf50; box-shadow: 0 0 6px #4caf50; }
.status-dot.off { background: #f44336; box-shadow: 0 0 6px #f44336; }
.status-dot.local { background: #ff9800; box-shadow: 0 0 6px #ff9800; }

#toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.85);
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

#toast.show { opacity: 1; }

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
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
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
  background: rgba(255,255,255,0.12);
  border-color: #4a90d9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74,144,217,0.2);
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
  .card { padding: 12px 6px; }
  .card .char { font-size: 26px; }
}
</style>
