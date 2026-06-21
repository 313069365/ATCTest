<template>
  <nav class="navbar">
    <router-link v-slot="{ isActive }" v-for="item in navbarItems" :key="item.name" :to="item.link" class="nav-item"
      active-class="active">
      <Icon :name="isActive ? navIconMap[item.icon].f : navIconMap[item.icon].o" class="icon" />
      <span class="label">{{ item.name }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import Icon from '@/presentation/components/common/Icon.vue'

const navIconMap = {
  home: { o: 'home-outline', f: 'home' },
  edit_note: { o: 'edit-note-outline', f: 'edit-note' },
  assignment: { o: 'assignment-outline', f: 'assignment' },
  person: { o: 'person-outline', f: 'person' },
}

const navbarItems = [
  { name: '首页', icon: 'home', link: '/' },
  { name: '练习', icon: 'edit_note', link: '/practice' },
  { name: '考试', icon: 'assignment', link: '/exam' },
  { name: '我的', icon: 'person', link: '/profile' },
]
</script>

<style scoped>
.navbar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: calc(400px - (var(--space-sm) * 2));
  display: flex;
  justify-content: space-around;
  background: var(--color-background);
  border-top: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
  padding: 0 var(--space-sm);
  margin-bottom: var(--space-sm);
  z-index: var(--z-fixed);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm);
  color: var(--color-text-secondary);
  transition: color var(--transition-normal);
}

.nav-item .icon {
  font-size: var(--font-size-xl);
}

.nav-item .label {
  font-size: var(--font-size-sm);
  margin-top: 2px;
}

.nav-item.active {
  color: var(--color-primary);
}

.nav-item.active .icon {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px var(--color-primary-bg));
}
</style>
