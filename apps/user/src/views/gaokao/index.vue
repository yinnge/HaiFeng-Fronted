<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}

function goArchive() {
  router.push('/gaokao/archive')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center justify-between px-6 py-4">
        <button
          class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
          @click="goHome"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="font-medium">首页</span>
        </button>
        <h1 class="text-xl font-bold text-gray-800">高考报志愿</h1>
        <div class="w-20" />
      </div>
    </header>

    <main class="flex-1">
      <div class="container mx-auto px-6 py-12 text-center">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
          <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          选择报考类型
        </div>
        <h2 class="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
          高考志愿填报
        </h2>
        <p class="mx-auto max-w-2xl text-gray-500">
          选择您的报考类型，开始填写高考档案，为志愿填报做好准备
        </p>
      </div>

      <div class="container mx-auto px-6 pb-16">
        <div class="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <!-- 统招高考 -->
          <div
            class="group rounded-2xl bg-white p-8 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all cursor-pointer"
            @click="goArchive"
          >
            <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
              🎓
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-800">统招高考</h3>
            <p class="text-gray-500 leading-relaxed">普通高考统招志愿填报，填写高考档案后开始规划</p>
            <button
              class="mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
            >
              进入填报
            </button>
          </div>

          <!-- 专项计划（占位） -->
          <div class="rounded-2xl bg-gray-50 p-8 border border-gray-200 opacity-60">
            <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200 text-3xl">
              📋
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-400">专项计划</h3>
            <p class="text-gray-400 leading-relaxed">地方专项、高校专项等特殊类型招生</p>
            <button
              class="mt-6 w-full rounded-lg bg-gray-300 py-2.5 text-sm text-white font-medium cursor-not-allowed"
              disabled
            >
              敬请期待
            </button>
          </div>

          <!-- 强基计划（占位） -->
          <div class="rounded-2xl bg-gray-50 p-8 border border-gray-200 opacity-60">
            <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200 text-3xl">
              🏛️
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-400">强基计划</h3>
            <p class="text-gray-400 leading-relaxed">基础学科招生改革试点</p>
            <button
              class="mt-6 w-full rounded-lg bg-gray-300 py-2.5 text-sm text-white font-medium cursor-not-allowed"
              disabled
            >
              敬请期待
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
