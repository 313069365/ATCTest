<template>
  <div class="settings-modal" v-if="visible" @click.self="$emit('close')">
    <div class="settings-content">
      <header class="settings-header">
        <button class="close-btn" @click="$emit('close')">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h2>练习设置</h2>
        <div class="spacer"></div>
      </header>

      <main class="settings-main">
        <section class="settings-section">
          <h3>习题顺序</h3>
          <div class="order-options">
            <button class="order-btn active">
              <span class="material-symbols-outlined">east</span>
              顺序
            </button>
            <button class="order-btn">
              <span class="material-symbols-outlined">west</span>
              逆序
            </button>
            <button class="order-btn">
              <span class="material-symbols-outlined">shuffle</span>
              乱序
            </button>
          </div>
        </section>

        <section class="settings-section">
          <h3>练习模式</h3>
          <div class="mode-cards">
            <div class="mode-card">
              <div class="mode-icon">
                <span class="material-symbols-outlined">menu_book</span>
              </div>
              <div class="mode-info">
                <h4>背题模式</h4>
                <p>直接显示正确答案和解析</p>
              </div>
              <div class="mode-check">
                <span class="material-symbols-outlined">check</span>
              </div>
            </div>
            <div class="mode-card active">
              <div class="mode-icon">
                <span class="material-symbols-outlined">edit_note</span>
              </div>
              <div class="mode-info">
                <h4>答题模式</h4>
                <p>先作答后看解析</p>
              </div>
              <div class="mode-check">
                <span class="material-symbols-outlined">check</span>
              </div>
            </div>
          </div>
        </section>

        <section class="settings-section">
          <h3>答案显示方式</h3>
          <div class="mode-toggle">
            <button class="mode-toggle-btn active">
              <span class="material-symbols-outlined">bolt</span>
              立即显示
            </button>
            <button class="mode-toggle-btn">
              <span class="material-symbols-outlined">touch_app</span>
              按需显示
            </button>
          </div>
        </section>

        <section class="settings-section">
          <div class="toggle-option">
            <div class="toggle-info">
              <span class="toggle-title">答对自动跳转下一题</span>
              <span class="toggle-desc">减少操作步骤，提升刷题效率</span>
            </div>
            <button class="toggle-btn">
              <span class="toggle-knob"></span>
            </button>
          </div>
        </section>
      </main>

      <footer class="settings-footer">
        <button class="start-btn" @click="gotopage">
          开始练习
          <span class="material-symbols-outlined">play_arrow</span>
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const gotopage = () => {
  // 模拟练习数据
  const mockPracticeData = {
    subject: '航空气象',
    questionCount: 30,
    mode: '答题模式',
    order: '顺序',
    showAnswerMode: '立即显示',
    autoNext: false
  }
  router.push({
    path: '/practice/quiz',
    query: { practiceData: JSON.stringify(mockPracticeData) }
  })
}

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'start'])
</script>

<style scoped>
.settings-modal {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-popup);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.settings-content {
  background: var(--background-secondary);
  width: 100%;
  max-width: 100%;
  max-height: 90%;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: rgba(247, 250, 253, 0.8);
  backdrop-filter: blur(12px);
}

.settings-header .close-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-header h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.settings-header .spacer {
  width: 44px;
}

.settings-main {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--spacing-md);
}

.settings-section {
  max-width: var(--app-max-width);
  margin-bottom: var(--spacing-md);
}

.settings-section h3 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  color: var(--icon-color);
  margin-bottom: var(--spacing-md);
}

.order-options {
  display: flex;
  gap: 8px;
}

.order-btn {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(193, 198, 214, 0.3);
  border-radius: var(--radius-md);
  background: #fff;
  font-size: 16px;
  font-weight: 500;
  color: #414754;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.order-btn .material-symbols-outlined {
  font-size: 16px;
}

.order-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.mode-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-toggle {
  display: flex;
  gap: 4px;
  padding: var(--spacing-mn);
  background: var(--background-surface-dark);
  border-radius: var(--radius-lg);
}

.mode-toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #727785;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-toggle-btn .material-symbols-outlined {
  font-size: 18px;
}

.mode-toggle-btn.active {
  background: var(--on-primary);
  color: var(--primary);
  font-weight: 700;
}

.mode-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--spacing-md);
  background: #fff;
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.mode-card.active {
  border-color: var(--primary);
  background: #d8e2ff;
}

.mode-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background: #f1f4f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-card.active .mode-icon {
  background: rgba(0, 91, 191, 0.1);
}

.mode-icon .material-symbols-outlined {
  font-size: 24px;
  color: #414754;
}

.mode-card.active .mode-icon .material-symbols-outlined {
  color: var(--primary);
}

.mode-info {
  flex: 1;
}

.mode-info h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.mode-info p {
  font-size: 12px;
  color: #414754;
}

.mode-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #c1c6d6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-card.active .mode-check {
  background: var(--primary);
  border-color: var(--primary);
}

.mode-check .material-symbols-outlined {
  font-size: 16px;
  color: #fff;
}

.toggle-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: #fff;
  border-radius: var(--radius-lg);
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
  color: #414754;
  margin-top: 2px;
}

.toggle-btn {
  width: 52px;
  height: 28px;
  border-radius: var(--radius-full);
  background: #e0e3e6;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
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
  background: #fff;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-btn.active .toggle-knob {
  transform: translateX(24px);
}

.settings-footer {
  padding: var(--spacing-md);
  background: #fff;
  border-top: 1px solid #e0e3e6;
}

.start-btn {
  width: 100%;
  height: 56px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-gradient-end) 100%);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.3);
}
</style>