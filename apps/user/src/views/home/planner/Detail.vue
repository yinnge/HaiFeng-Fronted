<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPlannerDetail } from '@/api/home'
import type { PlannerDetailVO } from '@/types/home'

const route = useRoute()
const router = useRouter()
const detail = ref<PlannerDetailVO | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const res = await getPlannerDetail(id)
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

      <div v-else-if="detail" class="mx-auto max-w-4xl">
        <div class="flex flex-col gap-8 md:flex-row">
          <div class="flex-shrink-0 text-center md:text-left">
            <img
              :src="detail.avatar"
              :alt="detail.name"
              class="mx-auto h-40 w-40 rounded-full border-4 border-orange-100 object-cover md:mx-0"
            />
          </div>
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-800">{{ detail.name }}</h1>
            <div class="mt-2 flex flex-wrap items-center gap-3">
              <span class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">{{ detail.position }}</span>
              <span class="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600">{{ detail.region }}</span>
              <span class="rounded-full bg-green-100 px-3 py-1 text-sm text-green-600">{{ detail.specialty }}</span>
            </div>

            <p class="mt-4 text-gray-600 leading-relaxed">{{ detail.personalDescription }}</p>

            <div v-if="detail.douyinName" class="mt-4">
              <a
                :href="detail.douyinUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.25 7.5h-1.5c-.553 0-1-.447-1-1s.447-1 1-1h1.5c.553 0 1 .447 1 1s-.447 1-1 1zm-4.5 0h-1.5c-.553 0-1-.447-1-1s.447-1 1-1h1.5c.553 0 1 .447 1 1s-.447 1-1 1z" />
                </svg>
                {{ detail.douyinName }}
              </a>
            </div>
          </div>
        </div>

        <div v-if="detail.experienceJob" class="mt-8 rounded-2xl bg-white p-6 shadow-lg">
          <h2 class="mb-3 text-lg font-bold text-gray-800">工作经历</h2>
          <p class="text-gray-600 whitespace-pre-line leading-relaxed">{{ detail.experienceJob }}</p>
        </div>

        <div v-if="detail.achievements.length" class="mt-6 rounded-2xl bg-white p-6 shadow-lg">
          <h2 class="mb-3 text-lg font-bold text-gray-800">个人成就</h2>
          <ul class="list-disc pl-5 space-y-2 text-gray-600">
            <li v-for="(item, i) in detail.achievements" :key="i">{{ item }}</li>
          </ul>
        </div>

        <div v-if="detail.expertiseAreas.length" class="mt-6 rounded-2xl bg-white p-6 shadow-lg">
          <h2 class="mb-3 text-lg font-bold text-gray-800">擅长领域</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(area, i) in detail.expertiseAreas"
              :key="i"
              class="rounded-full bg-orange-50 px-4 py-1.5 text-sm text-orange-600"
            >
              {{ area }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
