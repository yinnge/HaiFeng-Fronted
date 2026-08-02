<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { employmentModules } from '@/config/employment'

const props = defineProps<{
  module: string
}>()

const route = useRoute()
const router = useRouter()

const moduleConfig = employmentModules.find((m) => m.id === props.module)

function isActive(routePath: string): boolean {
  return route.path === routePath
}

function onTabClick(routePath: string) {
  if (route.path === routePath) return
  router.push(routePath)
}
</script>

<template>
  <div v-if="moduleConfig" class="pb-6">
    <div class="flex flex-wrap items-center justify-center gap-2">
      <button
        v-for="tab in moduleConfig.tabs"
        :key="tab.route"
        class="rounded-full px-4 py-2 text-sm font-medium transition-all"
        :class="isActive(tab.route)
          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'"
        @click="onTabClick(tab.route)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>
