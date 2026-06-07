<template>
  <nav class="navbar">
    <router-link v-slot="{ isActive }" v-for="item in navbarItems"
      :key="item.name" :to="item.link" class="nav-item" active-class="active">
      <component :is="isActive ? navIconMap[item.icon].f : navIconMap[item.icon].o" class="icon" />
      <span class="label">{{ item.name }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { markRaw } from 'vue'
import IMsHomeOutline from '~icons/material-symbols/home-outline'
import IMsHome from '~icons/material-symbols/home'
import IMsEditNoteOutline from '~icons/material-symbols/edit-note-outline'
import IMsEditNote from '~icons/material-symbols/edit-note'
import IMsAssignmentOutline from '~icons/material-symbols/assignment-outline'
import IMsAssignment from '~icons/material-symbols/assignment'
import IMsPersonOutline from '~icons/material-symbols/person-outline'
import IMsPerson from '~icons/material-symbols/person'

const navIconMap = {
  home: { o: markRaw(IMsHomeOutline), f: markRaw(IMsHome) },
  edit_note: { o: markRaw(IMsEditNoteOutline), f: markRaw(IMsEditNote) },
  assignment: { o: markRaw(IMsAssignmentOutline), f: markRaw(IMsAssignment) },
  person: { o: markRaw(IMsPersonOutline), f: markRaw(IMsPerson) },
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

.nav-item.active .icon {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(0, 91, 191, 0.3));
}
</style>
