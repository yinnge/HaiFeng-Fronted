<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '@/assets/images/logo-main.png'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  phone: '',
  password: '',
})

async function handleLogin() {
  loading.value = true
  try {
    // TODO: 调用登录接口
    console.log('登录:', form)
    router.push('/')
  } finally {
    loading.value = false
  }
}

function goRegister() {
  router.push('/register')
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
      <div class="mb-2 flex cursor-pointer items-center justify-center" @click="goHome">
        <img :src="logoImage" alt="海峰未来规划院" class="h-20 w-20 object-contain" />
        <h1 class="ml-2 text-2xl font-bold text-blue-600">海峰未来规划院</h1>
      </div>
      <p class="mb-8 text-center text-gray-500">欢迎登录</p>

      <form @submit.prevent="handleLogin">
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

        <div class="mb-6">
          <label class="mb-2 block text-sm text-gray-700">密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:bg-blue-400"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="mt-6 text-center text-gray-500">
        还没有账号？
        <span class="cursor-pointer text-blue-600 hover:underline" @click="goRegister">
          立即注册
        </span>
      </p>
    </div>
  </div>
</template>
