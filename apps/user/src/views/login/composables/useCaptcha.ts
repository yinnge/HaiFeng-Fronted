import { ref } from 'vue'
import { getAppCaptcha } from '@/api/auth'
import type { CaptchaVO } from '@/types/auth'

export function useCaptcha() {
  const captchaData = ref<CaptchaVO | null>(null)
  const loading = ref(false)

  const fetchCaptcha = async () => {
    loading.value = true
    try {
      const res = await getAppCaptcha()
      if (res.data.code === 200) {
        captchaData.value = res.data.data
      }
    } catch (error) {
      console.error('获取验证码失败:', error)
    } finally {
      loading.value = false
    }
  }

  const refreshCaptcha = () => {
    fetchCaptcha()
  }

  return {
    captchaData,
    loading,
    fetchCaptcha,
    refreshCaptcha,
  }
}
