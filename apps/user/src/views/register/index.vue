<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
})

async function handleRegister() {
  if (form.password !== form.confirmPassword) {
    alert('两次密码输入不一致')
    return
  }

  loading.value = true
  try {
    // TODO: 调用注册接口
    console.log('注册:', form)
    router.push('/login')
  } finally {
    loading.value = false
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
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
      <h1
        class="mb-2 cursor-pointer text-center text-2xl font-bold text-blue-600"
        @click="goHome"
      >
        海峰未来规划院
      </h1>
      <p class="mb-8 text-center text-gray-500">注册新账号</p>

      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="mb-2 block text-sm text-gray-700">手机号</label>
          <input
            v-model="form.phone"
            type="tel"
            placeholder="请输入手机号"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div class="mb-4">
          <label class="mb-2 block text-sm text-gray-700">验证码</label>
          <div class="flex gap-2">
            <input
              v-model="form.code"
              type="text"
              placeholder="请输入验证码"
              class="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              required
            />
            <button
              type="button"
              class="whitespace-nowrap rounded-lg border border-blue-600 px-4 py-3 text-blue-600 hover:bg-blue-50"
            >
              获取验证码
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="mb-2 block text-sm text-gray-700">密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="请设置密码 (至少6位)"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div class="mb-6">
          <label class="mb-2 block text-sm text-gray-700">确认密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:bg-blue-400"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="mt-6 text-center text-gray-500">
        已有账号？
        <span class="cursor-pointer text-blue-600 hover:underline" @click="goLogin">
          立即登录
        </span>
      </p>
    </div>
  </div>
</template>
