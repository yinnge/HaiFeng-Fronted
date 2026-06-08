<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAnnouncementDetail } from '@/api/home'
import type { AnnouncementDetailVO } from '@/types/home'

const route = useRoute()
const router = useRouter()
const detail = ref<AnnouncementDetailVO | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const res = await getAnnouncementDetail(id)
    detail.value = res.data.data
  } catch {
    router.replace('/')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <div class="container mx-auto px-6 py-12">
      <button
        class="mb-6 flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors"
        @click="router.push('/')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回首页
      </button>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>

      <article v-else-if="detail" class="mx-auto max-w-3xl">
        <div class="mb-2 flex items-center gap-3">
          <span class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">{{ detail.tag }}</span>
        </div>
        <h1 class="mb-8 text-3xl font-bold text-gray-800">{{ detail.title }}</h1>
        <div class="prose prose-gray max-w-none" v-html="detail.content"></div>
      </article>
    </div>
  </div>
</template>
