<template>
  <div class="app-container">
    <RouterView />
    <Navbar v-if="['/','/Home', '/exam', '/practice', '/profile'].includes(route.path)"/>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/layout/Navbar.vue'
import { useRoute } from 'vue-router'
const route = useRoute()

</script>

<style scoped>
.app-container {
  height: 100vh;
  position: relative;
  background: var(--background-secondary);
  max-width: var(--app-max-width);
  margin: 0 auto;
}
</style>