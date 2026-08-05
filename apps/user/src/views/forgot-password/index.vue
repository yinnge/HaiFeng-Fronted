<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import logoImage from '@/assets/images/logo-main.png'
import { getCaptcha, sendResetCode, resetPassword } from '@/api/auth/forgot-password'

const router = useRouter()
const step = ref(1)
const sending = ref(false)
const resetting = ref(false)
const cooldown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const form = reactive({
  phone: '',
  captchaCode: '',
  captchaUuid: '',
  captchaImage: '',
  code: '',
  password: '',
  confirmPassword: '',
})

onMounted(() => {
  fetchCaptcha()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

async function fetchCaptcha() {
  try {
    const res = await getCaptcha()
    const data = res.data.data
    form.captchaUuid = data.uuid
    form.captchaImage = data.image
  } catch (e: any) {
    ElMessage.warning(e?.response?.data?.msg || e?.message || '获取验证码失败，请重试')
  }
}

function validatePhone() {
  return /^1[3-9]\d{9}$/.test(form.phone)
}

function validateStep1() {
  if (!validatePhone()) {
    ElMessage.warning('请输入正确的手机号')
    return false
  }
  if (form.captchaCode.length !== 4) {
    ElMessage.warning('请输入4位图形验证码')
    return false
  }
  return true
}

async function handleSendCode() {
  if (!validateStep1()) return
  sending.value = true
  try {
    await sendResetCode({
      phone: form.phone,
      captchaCode: form.captchaCode,
      uuid: form.captchaUuid,
    })
    ElMessage.success('验证码已发送')
    step.value = 2
    startCooldown()
    fetchCaptcha()
  } catch (err: any) {
    ElMessage.warning(err.message || '发送失败')
    fetchCaptcha()
    form.captchaCode = ''
  } finally {
    sending.value = false
  }
}

function startCooldown() {
  cooldown.value = 60
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) {
      if (timer) clearInterval(timer)
    }
  }, 1000)
}

async function handleResend() {
  form.captchaCode = ''
  await fetchCaptcha()
}

async function handleReset() {
  if (!validatePhone()) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (form.code.length !== 6) {
    ElMessage.warning('请输入6位短信验证码')
    return
  }
  const pwdReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/
  if (!pwdReg.test(form.password)) {
    ElMessage.warning('密码必须是字母+数字，长度6-16位')
    return
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.warning('两次密码输入不一致')
    return
  }

  resetting.value = true
  try {
    await resetPassword({
      phone: form.phone,
      code: form.code,
      password: form.password,
    })
    ElMessage.success('密码重置成功，请重新登录')
    router.push('/login')
  } catch (err: any) {
    if (err.message) ElMessage.warning(err.message)
  } finally {
    resetting.value = false
  }
}

function goLogin() {
  router.push('/login')
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <button
        class="mb-4 flex items-center gap-1 text-sm text-gray-400 hover:text-orange-500 transition-colors"
        @click="goLogin"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回登录
      </button>

      <div class="mb-2 flex cursor-pointer items-center justify-center" @click="goHome">
        <img :src="logoImage" alt="海枫未来规划院" class="h-16 w-16 object-contain" />
        <h1 class="ml-2 text-xl font-bold text-gray-800">海枫未来规划院</h1>
      </div>
      <p class="mb-6 text-center text-gray-500">重置密码</p>

      <div class="mb-6 flex items-center justify-center gap-2">
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium"
          :class="step === 1 ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-500'"
        >1</span>
        <span class="h-px w-10 bg-gray-200"></span>
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium"
          :class="step === 2 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'"
        >2</span>
      </div>

      <form @submit.prevent="step === 1 ? handleSendCode() : handleReset()">
        <template v-if="step === 1">
          <div class="mb-4">
            <label class="mb-2 block text-sm text-gray-700">手机号</label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="请输入手机号"
              class="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition-colors focus:border-orange-400"
              required
            />
          </div>

          <div class="mb-6">
            <label class="mb-2 block text-sm text-gray-700">图形验证码</label>
            <div class="flex gap-2">
              <input
                v-model="form.captchaCode"
                type="text"
                placeholder="4位验证码"
                maxlength="4"
                class="flex-1 rounded-lg border border-gray-200 px-4 py-3 outline-none transition-colors focus:border-orange-400"
                required
              />
              <div
                class="relative flex h-[50px] w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                @click="fetchCaptcha"
              >
                <img
                  v-if="form.captchaImage"
                  :src="form.captchaImage"
                  alt="验证码"
                  class="h-full w-full object-contain"
                />
                <svg
                  class="absolute right-1 top-1 h-4 w-4 text-gray-400 hover:text-orange-500 cursor-pointer"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  @click.stop="fetchCaptcha"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="sending"
            class="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-60"
          >
            {{ sending ? '发送中...' : '获取短信验证码' }}
          </button>
        </template>

        <template v-if="step === 2">
          <div class="mb-4">
            <label class="mb-2 block text-sm text-gray-700">手机号</label>
            <input
              :value="form.phone"
              type="tel"
              class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
              disabled
            />
          </div>

          <div class="mb-4">
            <label class="mb-2 block text-sm text-gray-700">短信验证码</label>
            <div class="flex gap-2">
              <input
                v-model="form.code"
                type="text"
                placeholder="6位验证码"
                maxlength="6"
                class="flex-1 rounded-lg border border-gray-200 px-4 py-3 outline-none transition-colors focus:border-orange-400"
                required
              />
              <button
                v-if="cooldown <= 0"
                type="button"
                class="whitespace-nowrap rounded-lg border border-orange-500 px-4 py-3 text-orange-500 hover:bg-orange-50 transition-colors"
                @click="handleResend"
              >
                重新获取
              </button>
              <button
                v-else
                type="button"
                disabled
                class="whitespace-nowrap rounded-lg border border-gray-200 px-4 py-3 text-gray-400 cursor-not-allowed"
              >
                {{ cooldown }}s
              </button>
            </div>
          </div>

          <div class="mb-4">
            <label class="mb-2 block text-sm text-gray-700">新密码</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="字母+数字，6-16位"
              class="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition-colors focus:border-orange-400"
              required
            />
          </div>

          <div class="mb-6">
            <label class="mb-2 block text-sm text-gray-700">确认新密码</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              class="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition-colors focus:border-orange-400"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="resetting"
            class="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-60"
          >
            {{ resetting ? '重置中...' : '重置密码' }}
          </button>
        </template>
      </form>

      <p class="mt-6 text-center text-gray-500">
        已有账号？
        <span class="cursor-pointer text-orange-500 hover:text-orange-600 transition-colors" @click="goLogin">
          立即登录
        </span>
      </p>
    </div>
  </div>
</template>
