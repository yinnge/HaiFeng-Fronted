<!-- apps/user/src/views/register/index.vue -->
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { useCaptcha } from '../login/composables/useCaptcha'
import { useAuth } from '../login/composables/useAuth'
import type { RegisterDTO } from '@/types/auth'
import BorderBeam from '@/components/ui/BorderBeam.vue'
import DotPattern from '@/components/ui/DotPattern.vue'
import Particles from '@/components/ui/Particles.vue'

const router = useRouter()
const formRef = ref<FormInstance>()
const { captchaData, fetchCaptcha, refreshCaptcha } = useCaptcha()
const { loading, register } = useAuth()

const form = reactive<RegisterDTO & { confirmPassword: string }>({
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
  captchaCode: '',
  uuid: '',
  referrerCode: '',
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度必须在2-50之间', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value !== form.password) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  referrerCode: [
    { min: 8, max: 8, message: '邀请码必须是8位', trigger: 'blur' },
  ],
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  form.uuid = captchaData.value?.uuid || ''
  const { confirmPassword, referrerCode, ...rest } = form
  const data = { ...rest, ...(referrerCode ? { referrerCode } : {}) }
  const result = await register(data)

  if (!result) {
    refreshCaptcha()
    form.captchaCode = ''
  }
}

onMounted(() => {
  fetchCaptcha()
})
</script>

<template>
  <div class="min-h-screen flex relative overflow-hidden login-page">
    <!-- 渐变背景 -->
    <div class="absolute inset-0 warm-gradient" />

    <!-- 点阵图案 -->
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

    <!-- 中间注册卡片 -->
    <div class="flex-1 flex items-center justify-center relative z-10 animate-fade-in">
      <div class="register-card-wrapper relative">
        <div class="absolute -inset-4 bg-gradient-to-br from-brand-gold/20 via-brand-orange/10 to-brand-gold/20 rounded-3xl blur-2xl opacity-60" />

        <div class="register-card relative w-[420px] rounded-2xl p-8">
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

          <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/50 to-transparent" />
            <div class="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-white/30 to-transparent" />
          </div>

          <div class="mb-8 pb-6 relative z-10 text-center">
            <div class="inline-flex items-center justify-center gap-2 mb-2">
              <svg class="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <h2 class="card-title text-xl font-bold">用户注册</h2>
            </div>
            <p class="mt-2 text-sm text-gray-400">创建您的账号，开始规划未来</p>
            <div class="mt-4 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />
          </div>

          <div class="relative z-10">
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="register-form">
              <el-form-item prop="username" class="form-item">
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <el-input v-model="form.username" placeholder="用户名" size="large" class="custom-input" />
                </div>
              </el-form-item>

              <el-form-item prop="phone" class="form-item">
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <el-input v-model="form.phone" placeholder="手机号" size="large" class="custom-input" />
                </div>
              </el-form-item>

              <el-form-item prop="captchaCode" class="form-item">
                <div class="captcha-wrapper">
                  <div class="input-wrapper flex-1">
                    <div class="input-icon">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <el-input
                      v-model="form.captchaCode"
                      placeholder="验证码"
                      size="large"
                      class="custom-input"
                    />
                  </div>
                  <div class="captcha-image-wrapper" @click="refreshCaptcha">
                    <img
                      v-if="captchaData?.image"
                      :src="captchaData.image"
                      alt="验证码"
                      class="captcha-image"
                    />
                    <div v-else class="captcha-loading">
                      加载中...
                    </div>
                  </div>
                </div>
              </el-form-item>

              <el-form-item prop="password" class="form-item">
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <el-input
                    v-model="form.password"
                    type="password"
                    placeholder="密码（至少6位）"
                    size="large"
                    show-password
                    class="custom-input"
                  />
                </div>
              </el-form-item>

              <el-form-item prop="confirmPassword" class="form-item">
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <el-input
                    v-model="form.confirmPassword"
                    type="password"
                    placeholder="确认密码"
                    size="large"
                    show-password
                    class="custom-input"
                  />
                </div>
              </el-form-item>

              <el-form-item prop="referrerCode" class="form-item">
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <el-input
                    v-model="form.referrerCode"
                    placeholder="邀请码（选填）"
                    size="large"
                    maxlength="16"
                    class="custom-input"
                  />
                </div>
              </el-form-item>

              <el-form-item class="form-item">
                <button
                  type="button"
                  class="register-btn"
                  :disabled="loading"
                  @click="handleSubmit"
                >
                  <span v-if="loading" class="loading-spinner"></span>
                  <span>注 册</span>
                </button>
              </el-form-item>
            </el-form>

            <div class="mt-6 text-center text-sm text-gray-500 relative z-10">
              已有账号？
              <router-link to="/login" class="text-[#bf8a30] hover:text-[#a67c28] font-medium transition-colors">
                立即登录
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部协议 -->
    <div class="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 z-10">
      注册即表示已同意
      <span class="text-[#bf8a30] cursor-pointer hover:text-[#a67c28] transition-colors">《用户协议》</span>
      和
      <span class="text-[#bf8a30] cursor-pointer hover:text-[#a67c28] transition-colors">《隐私政策》</span>
    </div>
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

.animate-fade-in {
  animation: fade-in 1.6s ease-out both;
}

.register-card {
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

.register-form {
  --input-bg: #f8f6f3;
  --input-border: rgba(191, 138, 48, 0.15);
  --gold-primary: #bf8a30;
  --gold-light: #d4a85a;
}

.form-item {
  margin-bottom: 1.25rem;
}

.form-item :deep(.el-form-item__error) {
  padding-top: 4px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: var(--gold-primary);
  box-shadow: 0 0 0 3px rgba(191, 138, 48, 0.1);
}

.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  color: #9ca3af;
  flex-shrink: 0;
}

.input-wrapper:focus-within .input-icon {
  color: var(--gold-primary);
}

.custom-input :deep(.el-input__wrapper) {
  background: transparent;
  box-shadow: none !important;
  padding-left: 0;
}

.custom-input :deep(.el-input__inner) {
  color: #374151;
  font-size: 0.9rem;
}

.custom-input :deep(.el-input__inner::placeholder) {
  color: #9ca3af;
}

.captcha-wrapper {
  display: flex;
  align-items: stretch;
  gap: 12px;
  width: 100%;
}

.captcha-wrapper .input-wrapper {
  flex: 1;
  min-width: 0;
}

.captcha-image-wrapper {
  width: 120px;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.captcha-image-wrapper:hover {
  border-color: var(--gold-primary);
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

.register-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: white;
  cursor: pointer;
  background: linear-gradient(
    135deg,
    #d4a85a 0%,
    #bf8a30 30%,
    #a67c28 50%,
    #bf8a30 70%,
    #d4a85a 100%
  );
  background-size: 200% auto;
  box-shadow:
    0 4px 15px rgba(191, 138, 48, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.register-btn:hover:not(:disabled) {
  background-position: right center;
  box-shadow:
    0 6px 20px rgba(191, 138, 48, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.register-btn:active:not(:disabled) {
  transform: translateY(0);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
