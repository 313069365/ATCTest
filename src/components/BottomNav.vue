<template>
  <nav class="bottom-nav">
    <div class="nav-item" :class="{ active: route.path === '/' }" @click="navigateTo('/')">
      <span class="material-symbols-outlined">home</span>
      <span>首页</span>
    </div>
    <div class="nav-item" :class="{ active: route.path === '/practice' }" @click="navigateTo('/practice')">
      <span class="material-symbols-outlined">edit_note</span>
      <span>练习</span>
    </div>
    <div class="nav-item" :class="{ active: route.path === '/exam' }" @click="navigateTo('/exam')">
      <span class="material-symbols-outlined">school</span>
      <span>考试</span>
    </div>
    <div class="nav-item" :class="{ active: route.path === '/profile' }" @click="navigateTo('/profile')">
      <span class="material-symbols-outlined">person</span>
      <span>我的</span>
    </div>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function navigateTo(path) {
  router.push(path)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 368px;
  height: 60px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(200%);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.3) inset,
    0 0 0 0.5px rgba(0, 0, 0, 0.05);
  z-index: var(--z-fixed);
  padding: 0 8px;
  overflow: hidden;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
  }
  to {
    transform: translateX(-50%) translateY(0);
  }
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-decoration: none;
  color: #8e8e93;
  font-size: 10px;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: var(--radius-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 56px;
  cursor: pointer;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-item:hover::before {
  left: 100%;
}

.nav-item:active {
  transform: scale(0.94);
}

.nav-item .material-symbols-outlined {
  font-size: 22px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.nav-item.active {
  color: var(--primary);
  font-weight: 700;
  border-radius: var(--radius-lg);
}

.nav-item.active .material-symbols-outlined {
  transform: scale(1.15);
  font-variation-settings: 'FILL' 1;
  text-shadow: 0 2px 4px rgba(0, 91, 191, 0.3);
}

.nav-item span {
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.nav-item.active span {
  transform: translateY(-1px);
}
</style>
