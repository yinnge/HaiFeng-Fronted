<!-- apps/admin/src/views/login/components/LoginCard.vue -->
<script setup lang="ts">
import AdminLoginForm from './AdminLoginForm.vue'
import BorderBeam from '@/components/ui/BorderBeam.vue'

const props = defineProps<{
  loading: boolean
  adminLoginHandler: (data: any) => Promise<any>
}>()

const emit = defineEmits<{
  (e: 'need-totp'): void
}>()
</script>

<template>
  <div class="login-card-wrapper relative">
    <!-- 外层光晕 -->
    <div class="absolute -inset-4 bg-gradient-to-br from-brand-gold/20 via-brand-orange/10 to-brand-gold/20 rounded-3xl blur-2xl opacity-60" />

    <!-- 主卡片 -->
    <div class="login-card relative w-[420px] rounded-2xl p-8">
      <!-- 动态流光边框 - 金黄色双层效果 -->
      <BorderBeam
        :size="220"
        :duration="5"
        :border-width="2"
        color-from="#fbbf24"
        color-to="#fde68a"
        :delay="0"
      />
      <BorderBeam
        :size="220"
        :duration="5"
        :border-width="2"
        color-from="#f59e0b"
        color-to="#fbbf24"
        :delay="2.5"
      />

      <!-- 内部高光 -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/50 to-transparent" />
        <div class="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-white/30 to-transparent" />
      </div>

      <!-- 标题 -->
      <div class="mb-8 pb-6 relative z-10 text-center">
        <div class="inline-flex items-center justify-center gap-2 mb-2">
          <svg class="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 class="card-title text-xl font-bold">管理员登录</h2>
        </div>
        <p class="mt-2 text-sm text-gray-400">请使用管理员账号登录系统</p>
        <div class="mt-4 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />
      </div>

      <!-- 表单区域 -->
      <div class="relative z-10">
        <AdminLoginForm
          :loading="props.loading"
          :admin-login-handler="props.adminLoginHandler"
          @need-totp="emit('need-totp')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-card {
  /* 磨砂玻璃效果 */
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.96) 0%,
    rgba(254, 252, 250, 0.94) 30%,
    rgba(253, 248, 242, 0.92) 60%,
    rgba(252, 245, 235, 0.94) 100%
  );
  backdrop-filter: blur(20px);
  box-shadow:
    0 25px 50px -15px rgba(191, 138, 48, 0.25),
    0 15px 30px -10px rgba(232, 114, 42, 0.15),
    inset 0 2px 6px rgba(255, 255, 255, 0.9),
    inset 0 -1px 4px rgba(191, 138, 48, 0.05);
  /* 静态金色边框作为底色 */
  border: 1px solid rgba(212, 168, 90, 0.3);
}

.card-title {
  background: linear-gradient(
    135deg,
    #9a7a2e 0%,
    #bf8a30 25%,
    #d4a85a 50%,
    #fbbf24 75%,
    #d4a85a 100%
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: title-gradient 4s ease infinite;
}

@keyframes title-gradient {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}
</style>
