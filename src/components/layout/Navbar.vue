<template>
  <nav class="navbar">
    <router-link v-for="item in navbarItems" 
      :key="item.name" 
      :to="item.link" 
      class="nav-item" 
      active-class="active">
        <span class="material-symbols-outlined icon">{{ item.icon }}</span>
        <span class="label">{{ item.name }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { ref } from 'vue';

const navbarItems = ref([
  { name: '首页', icon: 'home', link: '/' },
  { name: '练习', icon: 'edit_note', link: '/practice' },
  { name: '考试', icon: 'assignment', link: '/exam' },
  { name: '我的', icon: 'person', link: '/profile' },
])

</script>

<style scoped>
.navbar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: calc(400px - (var(--spacing-sm) * 2));
  display: flex;
  justify-content: space-around;
  background: var(--background);
  border-top: 1px solid var(--border-color-light);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
  padding: 0 var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  z-index: var(--z-fixed);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm);
  color: var(--text-secondary);
  transition: color var(--transition-normal);
}

.nav-item .icon {
  font-size: 24px;
}

.nav-item .label {
  font-size: var(--font-size-sm);
  margin-top: 2px;
}

.nav-item.active {
  color: var(--primary);
}

.nav-item.active .material-symbols-outlined {
  transform: scale(1.1);
  font-variation-settings: 'FILL' 1;
  text-shadow: 0 2px 4px rgba(0, 91, 191, 0.3);
}
</style>