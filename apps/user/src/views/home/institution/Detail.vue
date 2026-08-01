<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInstitutionDetail } from '@/api/home'
import type { InstitutionDetailVO } from '@/types/home'

const route = useRoute()
const router = useRouter()
const detail = ref<InstitutionDetailVO | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const id = route.params.id as string
    const res = await getInstitutionDetail(id)
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
        <div class="grid gap-6 md:grid-cols-2">
          <img
            v-for="(img, i) in detail.images"
            :key="i"
            :src="img"
            :alt="`${detail.name} 图片 ${i + 1}`"
            class="h-64 w-full rounded-xl object-cover shadow-lg"
          />
        </div>

        <div class="mt-8">
          <div class="flex items-center gap-4">
            <img
              v-if="detail.logo"
              :src="detail.logo"
              :alt="detail.name"
              class="h-16 w-16 rounded-lg object-cover"
            />
            <div>
              <h1 class="text-3xl font-bold text-gray-800">{{ detail.name }}</h1>
              <span class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">{{ detail.type }}</span>
            </div>
          </div>

          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div class="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-gray-600">{{ detail.phone }}</span>
            </div>
            <div class="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-gray-600">{{ detail.address }}</span>
            </div>
          </div>

          <div class="mt-8 rounded-2xl bg-white p-6 shadow-lg">
            <h2 class="mb-3 text-lg font-bold text-gray-800">机构简介</h2>
            <p class="text-gray-600 leading-relaxed">{{ detail.description }}</p>
          </div>

          <div v-if="detail.courses.length" class="mt-6 rounded-2xl bg-white p-6 shadow-lg">
            <h2 class="mb-3 text-lg font-bold text-gray-800">课程列表</h2>
            <ul class="space-y-2">
              <li
                v-for="(course, i) in detail.courses"
                :key="i"
                class="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-gray-600"
              >
                <span class="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-sm text-orange-600">{{ i + 1 }}</span>
                {{ course }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
