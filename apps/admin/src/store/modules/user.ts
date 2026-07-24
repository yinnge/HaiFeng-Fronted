// apps/admin/src/store/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAccessToken, setTokens, clearTokens } from '@haifeng/shared'
import { getProfile } from '@/api/profile'
import type { ProfileVO } from '@/types/profile'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getAccessToken())
  const profile = ref<ProfileVO | null>(null)
  const moduleCodes = computed(() => profile.value?.moduleCodes ?? [])

  // 设置 Token
  function setToken(accessToken: string, refreshToken: string) {
    token.value = accessToken
    setTokens(accessToken, refreshToken)
  }

  // 获取个人信息
  async function fetchProfile() {
    try {
      const { data } = await getProfile()
      if (data.code === 200) {
        profile.value = data.data
      } else {
        console.error('获取个人信息失败, 业务错误码:', data.code, data.msg)
        ElMessage.error?.('获取权限信息失败: ' + (data.msg || '未知错误'))
      }
    } catch (error: any) {
      console.error('获取个人信息失败:', error)
      ElMessage.error?.('获取权限信息失败: ' + (error.message || '网络错误'))
    }
  }

  // 更新本地 profile 缓存
  function updateLocalProfile(updates: Partial<ProfileVO>) {
    if (profile.value) {
      profile.value = { ...profile.value, ...updates }
    }
  }

  // 登出
  function logout() {
    token.value = null
    profile.value = null
    clearTokens()
  }

  // 检查是否已登录
  function isLoggedIn(): boolean {
    return !!token.value
  }

  // 获取用户名首字 (用于默认头像)
  function getAvatarText(): string {
    if (profile.value?.username) {
      return profile.value.username.charAt(0).toUpperCase()
    }
    return 'A'
  }

  return {
    token,
    profile,
    moduleCodes,
    setToken,
    fetchProfile,
    updateLocalProfile,
    logout,
    isLoggedIn,
    getAvatarText,
  }
})
