<template>
  <svg
    v-if="pathData"
    xmlns="http://www.w3.org/2000/svg"
    :height="size"
    :width="size"
    viewBox="0 -960 960 960"
    fill="currentColor"
    style="display: block; transition: fill 0.2s;"
  >
    <path :d="pathData" />
  </svg>
</template>

<script setup>
import { computed } from 'vue';
import { svgTemplates } from '@/assets/icons/icons.js';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: '24px'
  }
});

const pathData = computed(() => svgTemplates[props.name]);
</script>
