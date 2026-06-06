<!-- apps/admin/src/views/login/components/UserRegisterForm.vue -->
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useCaptcha } from '../composables/useCaptcha'
import { useAuth } from '../composables/useAuth'
import type { RegisterDTO } from '@/types/auth'

const emit = defineEmits<{
  (e: 'switch-to-login'): void
}>()

const formRef = ref<FormInstance>()
const { captchaData, fetchCaptcha, refreshCaptcha } = useCaptcha()
const { loading, userRegister } = useAuth()

const form = reactive<RegisterDTO>({
  phone: '',
  password: '',
  captchaCode: '',
  uuid: '',
  referrerCode: '',
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
  const success = await userRegister(form)

  if (!success) {
    refreshCaptcha('user')
    form.captchaCode = ''
  }
}

onMounted(() => {
  fetchCaptcha('user')
})
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
    <el-form-item prop="phone">
      <el-input v-model="form.phone" placeholder="手机号" size="large" />
    </el-form-item>

    <el-form-item prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="密码"
        size="large"
        show-password
      />
    </el-form-item>

    <el-form-item prop="captchaCode">
      <div class="flex gap-3 w-full">
        <el-input
          v-model="form.captchaCode"
          placeholder="验证码"
          size="large"
          class="flex-1"
        />
        <img
          v-if="captchaData?.image"
          :src="captchaData.image"
          alt="验证码"
          class="h-10 w-24 cursor-pointer rounded border"
          @click="refreshCaptcha('user')"
        />
        <div v-else class="h-10 w-24 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
          加载中...
        </div>
      </div>
    </el-form-item>

    <el-form-item>
      <el-input v-model="form.referrerCode" placeholder="邀请码（选填）" size="large" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" size="large" class="w-full" :loading="loading" @click="handleSubmit">
        注 册
      </el-button>
    </el-form-item>

    <div class="text-center text-sm text-gray-500">
      已有账号？
      <span class="text-[#1e88e5] cursor-pointer" @click="emit('switch-to-login')">立即登录</span>
    </div>
  </el-form>
</template>
