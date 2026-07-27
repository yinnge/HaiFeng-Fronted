<!-- apps/user/src/views/login/index.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import BrandSection from './components/BrandSection.vue'
import LoginCard from './components/LoginCard.vue'
import ForgotPasswordModal from './components/ForgotPasswordModal.vue'
import DotPattern from '@/components/ui/DotPattern.vue'
import Particles from '@/components/ui/Particles.vue'

const showForgotPassword = ref(false)
</script>

<template>
  <div class="min-h-screen flex relative overflow-hidden login-page">
    <!-- 红橙黄渐变背景 -->
    <div class="absolute inset-0 warm-gradient" />

    <!-- 左上角点阵图案 -->
    <DotPattern
      class="w-[60%] h-[70%] top-0 left-0"
      :dot-size="2.5"
      :spacing="22"
      color="rgba(232, 114, 42, 0.5)"
      :animated="true"
      fade-direction="bottom-right"
    />

    <!-- 粒子效果 -->
    <Particles
      :colors="['#dc2626', '#e8722a', '#f5a54a', '#fbbf24', '#bf8a30']"
      :quantity="60"
      :min-size="4"
      :max-size="12"
      :speed="0.15"
      :interactivity="true"
      :mouse-radius="120"
      :breath-intensity="0.4"
    />

    <!-- 左侧品牌区域 -->
    <div class="flex-1 flex items-center justify-center relative z-10 pl-20 lg:pl-32 animate-fade-in">
      <BrandSection />
    </div>

    <!-- 右侧登录卡片 -->
    <div class="flex-1 flex items-center justify-center relative z-10 pr-8 lg:pr-16 animate-slide-in-right">
      <LoginCard @forgot-password="showForgotPassword = true" />
    </div>

    <!-- 底部协议 -->
    <div class="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 z-10">
      登录即表示已同意
      <span class="text-[#bf8a30] cursor-pointer hover:text-[#a67c28] transition-colors">《用户协议》</span>
      和
      <span class="text-[#bf8a30] cursor-pointer hover:text-[#a67c28] transition-colors">《隐私政策》</span>
    </div>

    <!-- 忘记密码弹窗 -->
    <ForgotPasswordModal v-model:visible="showForgotPassword" />
  </div>
</template>

<style scoped>
.login-page {
  background-color: #fef7ed;
}

.warm-gradient {
  background:
    radial-gradient(ellipse 50% 40% at 0% 0%, rgba(232, 114, 42, 0.28) 0%, rgba(245, 165, 74, 0.18) 50%, transparent 100%),
    radial-gradient(ellipse 80% 70% at 5% 10%, rgba(245, 165, 74, 0.22) 0%, rgba(251, 191, 36, 0.12) 40%, transparent 80%),
    radial-gradient(ellipse 90% 80% at 20% 30%, rgba(251, 191, 36, 0.1) 0%, rgba(254, 243, 226, 0.05) 50%, transparent 90%),
    linear-gradient(to bottom right, #fef7ed 0%, #fef3e2 30%, #fefbf6 60%, #ffffff 100%);
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}

.animate-fade-in {
  animation: fade-in 1.6s ease-out both;
}

.animate-slide-in-right {
  animation: slide-in-right 1.6s ease-out 0.6s both;
}
</style>
