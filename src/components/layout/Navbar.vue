<template>
  <nav class="navbar">
    <router-link to="/" class="nav-item" active-class="active">
      <span class="material-symbols-outlined icon">home</span>
      <span class="label">首页</span>
    </router-link>
    <router-link to="/practice" class="nav-item" active-class="active">
      <span class="material-symbols-outlined icon">quiz</span>
      <span class="label">练习</span>
    </router-link>
    <router-link to="/exam" class="nav-item" active-class="active">
      <span class="material-symbols-outlined icon">assignment</span>
      <span class="label">考试</span>
    </router-link>
    <router-link to="/profile" class="nav-item" active-class="active">
      <span class="material-symbols-outlined icon">person</span>
      <span class="label">我的</span>
    </router-link>
  </nav>
</template>

<script setup>


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
</style>