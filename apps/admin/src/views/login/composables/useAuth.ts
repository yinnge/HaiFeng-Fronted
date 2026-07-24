// apps/admin/src/views/login/composables/useAuth.ts
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import {
  adminLogin,
  adminTotpLogin,
  appLogin,
  appRegister,
} from '@/api/auth'
import type { LoginDTO, RegisterDTO, TotpLoginDTO, TokenVO, PreAuthVO } from '@/types/auth'
import type { UserType } from './useCaptcha'

// 判断是否需要 TOTP
function isPreAuthResponse(data: TokenVO | PreAuthVO): data is PreAuthVO {
  return 'preAuthToken' in data
}

export function useAuth() {
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()

  const loading = ref(false)
  const showTotpModal = ref(false)
  const preAuthToken = ref('')

  // 登录成功后的处理
  const handleLoginSuccess = async (tokenData: TokenVO) => {
    userStore.setToken(tokenData.accessToken, tokenData.refreshToken)
    await userStore.fetchProfile()
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  }

  // 用户登录
  const userLogin = async (data: LoginDTO) => {
    loading.value = true
    try {
      const res = await appLogin(data)
      if (res.data.code === 200) {
        handleLoginSuccess(res.data.data as TokenVO)
        return true
      } else {
        ElMessage.error(res.data.msg || '登录失败')
        return false
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.msg || '登录失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 用户注册
  const userRegister = async (data: RegisterDTO) => {
    loading.value = true
    try {
      const res = await appRegister(data)
      if (res.data.code === 200) {
        handleLoginSuccess(res.data.data)
        return true
      } else {
        ElMessage.error(res.data.msg || '注册失败')
        return false
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.msg || '注册失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 管理员登录
  const adminLoginHandler = async (data: LoginDTO) => {
    loading.value = true
    try {
      const res = await adminLogin(data)
      if (res.data.code === 200) {
        const responseData = res.data.data
        if (isPreAuthResponse(responseData)) {
          // 需要 TOTP 验证
          preAuthToken.value = responseData.preAuthToken
          showTotpModal.value = true
          return 'totp'
        } else {
          handleLoginSuccess(responseData)
          return true
        }
      } else if (res.data.code === 20001) {
        // 需要 TOTP 验证
        preAuthToken.value = (res.data.data as PreAuthVO).preAuthToken
        showTotpModal.value = true
        return 'totp'
      } else {
        ElMessage.error(res.data.msg || '登录失败')
        return false
      }
    } catch (error: any) {
      const msg = error.response?.data?.msg || '登录失败'
      ElMessage.error(msg)
      return false
    } finally {
      loading.value = false
    }
  }

  // TOTP 验证
  const totpVerify = async (totpCode: string) => {
    loading.value = true
    try {
      const data: TotpLoginDTO = {
        preAuthToken: preAuthToken.value,
        totpCode,
      }
      const res = await adminTotpLogin(data)
      if (res.data.code === 200) {
        showTotpModal.value = false
        handleLoginSuccess(res.data.data)
        return true
      } else {
        ElMessage.error(res.data.msg || 'TOTP 验证失败')
        return false
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.msg || 'TOTP 验证失败')
      return false
    } finally {
      loading.value = false
    }
  }

  const closeTotpModal = () => {
    showTotpModal.value = false
    preAuthToken.value = ''
  }

  return {
    loading,
    showTotpModal,
    userLogin,
    userRegister,
    adminLoginHandler,
    totpVerify,
    closeTotpModal,
  }
}
