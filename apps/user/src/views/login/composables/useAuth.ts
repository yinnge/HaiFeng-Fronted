import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import { appLogin, appRegister } from '@/api/auth'
import type { LoginDTO, RegisterDTO, TokenVO } from '@/types/auth'

export function useAuth() {
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()

  const loading = ref(false)

  const handleLoginSuccess = async (tokenData: TokenVO) => {
    userStore.setToken(tokenData.accessToken, tokenData.refreshToken)
    await userStore.fetchUserInfo()
    ElMessage.success('登录成功')
    const redirect = userStore.getRedirectPath() || (route.query.redirect as string) || '/'
    router.push(redirect)
  }

  const login = async (data: LoginDTO) => {
    loading.value = true
    try {
      const res = await appLogin(data)
      if (res.data.code === 200) {
        handleLoginSuccess(res.data.data)
        return true
      } else {
        ElMessage.error(res.data.msg || '登录失败')
        return false
      }
    } catch (error: any) {
      ElMessage.error(error.message || error.response?.data?.msg || '登录失败')
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterDTO) => {
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
      ElMessage.error(error.message || error.response?.data?.msg || '注册失败')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    login,
    register,
  }
}
