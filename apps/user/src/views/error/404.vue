<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-100">
    <h1 class="mb-4 text-9xl font-bold text-gray-300">404</h1>
    <p class="mb-8 text-xl text-gray-600">抱歉，您访问的页面不存在</p>
    <button
      class="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"
      @click="goHome"
    >
      返回首页
    </button>
  </div>
</template>
