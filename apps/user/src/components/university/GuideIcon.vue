<script setup lang="ts">
import { computed } from 'vue'
import { GUIDE_ICON_PATHS } from './guide-meta'

const props = defineProps<{
  name: string
  size?: number
  strokeWidth?: number
}>()

const paths = computed(() => GUIDE_ICON_PATHS[props.name] ?? [])
</script>

<template>
  <svg
    :width="size ?? 22"
    :height="size ?? 22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth ?? 1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="(d, index) in paths" :key="index" :d="d" />
  </svg>
</template>
