// apps/admin/src/views/login/composables/useCaptcha.ts
import { ref } from 'vue'
import { getAdminCaptcha, getAppCaptcha } from '@/api/auth'
import type { CaptchaVO } from '@/types/auth'

export type UserType = 'user' | 'admin'

export function useCaptcha() {
  const captchaData = ref<CaptchaVO | null>(null)
  const loading = ref(false)

  const fetchCaptcha = async (userType: UserType) => {
    loading.value = true
    try {
      const api = userType === 'admin' ? getAdminCaptcha : getAppCaptcha
      const res = await api()
      if (res.data.code === 200) {
        captchaData.value = res.data.data
      }
    } catch (error) {
      console.error('获取验证码失败:', error)
    } finally {
      loading.value = false
    }
  }

  const refreshCaptcha = (userType: UserType) => {
    fetchCaptcha(userType)
  }

  return {
    captchaData,
    loading,
    fetchCaptcha,
    refreshCaptcha,
  }
}
