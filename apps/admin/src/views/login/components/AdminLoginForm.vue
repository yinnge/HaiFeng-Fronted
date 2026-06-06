<!-- apps/admin/src/views/login/components/AdminLoginForm.vue -->
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useCaptcha } from '../composables/useCaptcha'
import { useAuth } from '../composables/useAuth'
import type { LoginDTO } from '@/types/auth'

const emit = defineEmits<{
  (e: 'forgot-password'): void
  (e: 'need-totp'): void
}>()

const formRef = ref<FormInstance>()
const { captchaData, fetchCaptcha, refreshCaptcha } = useCaptcha()
const { loading, adminLoginHandler } = useAuth()

const form = reactive<LoginDTO>({
  phone: '',
  password: '',
  captchaCode: '',
  uuid: '',
})

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  form.uuid = captchaData.value?.uuid || ''
  const result = await adminLoginHandler(form)

  if (result === 'totp') {
    emit('need-totp')
  } else if (!result) {
    refreshCaptcha('admin')
    form.captchaCode = ''
  }
}

onMounted(() => {
  fetchCaptcha('admin')
})
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="login-form">
    <!-- 手机号 -->
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

    <!-- 密码 -->
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
          placeholder="密码"
          size="large"
          show-password
          class="custom-input"
        />
      </div>
    </el-form-item>

    <!-- 验证码 -->
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
            @keyup.enter="handleSubmit"
          />
        </div>
        <div class="captcha-image-wrapper" @click="refreshCaptcha('admin')">
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

    <!-- 忘记密码 -->
    <div class="flex justify-end mb-5">
      <span class="forgot-link" @click="emit('forgot-password')">
        忘记密码？
      </span>
    </div>

    <!-- 登录按钮 -->
    <el-form-item class="form-item">
      <button
        type="button"
        class="login-btn"
        :disabled="loading"
        @click="handleSubmit"
      >
        <span v-if="loading" class="loading-spinner"></span>
        <span>登 录</span>
      </button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.login-form {
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
  width: 48px;
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
  font-size: 0.95rem;
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

.forgot-link {
  font-size: 0.8rem;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.3s;
}

.forgot-link:hover {
  color: var(--gold-primary);
}

.login-btn {
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

.login-btn:hover:not(:disabled) {
  background-position: right center;
  box-shadow:
    0 6px 20px rgba(191, 138, 48, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
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
