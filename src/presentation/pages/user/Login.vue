<template>
  <div class="login-page">
    <TopBar title="账户登录" />

    <main class="content">
      <div class="login-card">
        <!-- Tab 切换 -->
        <div class="tab-container">
          <button :class="['tab-btn', { active: activeTab === 'login' }]" @click="activeTab = 'login'">
            登录
          </button>
          <button :class="['tab-btn', { active: activeTab === 'register' }]" @click="activeTab = 'register'">
            注册
          </button>
        </div>

        <div class="avatar-container">
          <div class="avatar">
            <img src="/logo.jpeg" alt="ATCTest" />
          </div>
        </div>



        <!-- 登录表单 -->
        <div v-if="activeTab === 'login'">
          <h2 class="title">账户登录</h2>
          <p class="subtitle">登录功能即将上线，敬请期待</p>

          <div class="form-group">
            <label class="form-label">用户名</label>
            <input v-model="loginForm.username" type="text" class="form-input" placeholder="请输入用户名" />
            <label class="form-label">密码</label>
            <input v-model="loginForm.password" type="password" class="form-input" placeholder="请输入密码" />
          </div>

          <button @click="handleLogin" class="login-btn">
            登录
          </button>
          <button @click="goToGuest" class="guest-btn">
            以游客身份使用
          </button>
        </div>

        <!-- 注册表单 -->
        <div v-else>
          <h2 class="title">账户注册</h2>
          <p class="subtitle">创建新账户</p>

          <div class="form-group">
            <label class="form-label">用户名 *</label>
            <input v-model="registerForm.username" type="text" class="form-input" placeholder="请输入用户名"
              @keyup.enter="handleRegister" />
            <label class="form-label">昵称</label>
            <input v-model="registerForm.nickname" type="text" class="form-input" placeholder="请输入昵称（可选）"
              @keyup.enter="handleRegister" />
            <label class="form-label">密码 *</label>
            <input v-model="registerForm.password" type="password" class="form-input" placeholder="请输入密码"
              @keyup.enter="handleRegister" />
          </div>

          <button @click="handleRegister" class="login-btn">
            注册
          </button>
        </div>

        <div class="guest-container">

        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/presentation/components/shared/TopBar.vue'
import Icon from '@/presentation/components/ui/Icon.vue'
import * as userRepository from '@/infrastructure/api/userRepository'

const router = useRouter()
const activeTab = ref('login')
const loginForm = reactive({
  username: '',
  password: ''
})
const registerForm = reactive({
  username: '',
  nickname: ''
})

function handleLogin() {
  alert('登录功能即将上线，请使用游客模式')
}

async function handleRegister() {
  if (!registerForm.username.trim()) {
    alert('请输入用户名')
    return
  }

  try {
    const username = registerForm.username.trim().toLowerCase()
    const nickname = registerForm.nickname.trim() || registerForm.username.trim()

    await userRepository.createAccount(username, registerForm.username.trim(), nickname)

    alert('注册成功！请登录')
    activeTab.value = 'login'
    registerForm.username = ''
    registerForm.nickname = ''
  } catch (e) {
    alert('注册失败: ' + e.message)
  }
}

function goToGuest() {
  router.push('/')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--color-muted);
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.content {
  padding: var(--space-lg);
  display: flex;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: var(--space-xl);
  background: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-lg);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tab-container {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  background: var(--color-muted);
  padding: var(--space-xs);
  border-radius: var(--radius-md);
}

.tab-btn {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--color-card);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  text-align: center;
  margin-bottom: var(--space-xs);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
  margin-bottom: var(--space-lg);
}

.form-group {
  margin-bottom: var(--space-md);
}

.form-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  margin: var(--space-sm) 0 var(--space-xs) 0;
}

.form-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  color: var(--color-text);
  background: var(--color-background);
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.login-btn {
  width: 100%;
  padding: var(--space-md);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity 0.2s;
  margin-bottom: var(--space-sm);
}

.login-btn:active {
  opacity: 0.8;
}

.guest-container {
  display: flex;
  gap: var(--space-sm);
}

.guest-container button {
  flex: 1;
}

.guest-btn {
  width: 100%;
  padding: var(--space-md);
  background: transparent;
  color: var(--color-primary);
  /* border: 1px solid var(--color-primary); */
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background 0.2s;
}

.guest-btn:active {
  background: var(--color-primary-light);
}
</style>
