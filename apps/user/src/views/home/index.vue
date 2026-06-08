<script setup lang="ts">
import { useRouter } from 'vue-router'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'

const router = useRouter()

function goLogin() {
  router.push('/login')
}

function goProfile() {
  router.push('/profile')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <img
            :src="logoMain"
            alt="海枫未来规划院"
            class="h-10 w-10 object-contain"
          />
          <h1 class="text-xl font-bold text-gray-800">海枫未来规划院</h1>
        </div>
        <div class="flex items-center gap-4">
          <button
            class="text-gray-600 hover:text-orange-500 transition-colors font-medium"
            @click="goProfile"
          >
            个人中心
          </button>
          <button
            class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300"
            @click="goLogin"
          >
            登录
          </button>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <main class="flex-1">
      <div class="container mx-auto px-6 py-20 text-center">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
          <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
          专业 · 科学 · 个性化
        </div>
        <h2 class="mb-6 text-4xl font-bold text-gray-800 md:text-5xl lg:text-6xl leading-tight">
          高考志愿填报<br class="md:hidden" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">智能规划平台</span>
        </h2>
        <p class="mx-auto mb-10 max-w-2xl text-lg text-gray-500 leading-relaxed">
          基于大数据分析和AI算法，为您提供科学、精准的高考志愿填报方案，助您圆梦理想大学。从高考志愿到职场上岸，我们全程陪伴。
        </p>
        <div class="flex flex-col items-center justify-center gap-4 md:flex-row">
          <button class="group w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-lg font-semibold text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 md:w-auto flex items-center justify-center gap-2">
            开始规划
            <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button class="w-full rounded-xl border-2 border-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-500 transition-all md:w-auto">
            了解更多
          </button>
        </div>
      </div>

      <!-- Features -->
      <section class="container mx-auto grid gap-8 px-6 py-16 md:grid-cols-3">
        <div class="group rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-orange-200">
          <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
            🎯
          </div>
          <h3 class="mb-3 text-xl font-bold text-gray-800">智能推荐</h3>
          <p class="text-gray-500 leading-relaxed">根据分数、兴趣、职业规划，智能推荐最适合的院校和专业</p>
        </div>
        <div class="group rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-orange-200">
          <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
            📊
          </div>
          <h3 class="mb-3 text-xl font-bold text-gray-800">数据分析</h3>
          <p class="text-gray-500 leading-relaxed">整合历年录取数据，提供精准的录取概率分析</p>
        </div>
        <div class="group rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-orange-200">
          <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
            👨‍🎓
          </div>
          <h3 class="mb-3 text-xl font-bold text-gray-800">专家指导</h3>
          <p class="text-gray-500 leading-relaxed">资深规划师一对一咨询，助您做出最佳选择</p>
        </div>
      </section>

    </main>

    <!-- Footer -->
    <SiteFooter />
  </div>
</template>
