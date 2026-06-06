<!-- apps/admin/src/views/profile/components/AvatarCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import { adminLogout } from '@/api/auth'
import type { ProfileVO } from '@/types/profile'

const props = defineProps<{
  profile: ProfileVO | null
}>()

const router = useRouter()
const userStore = useUserStore()

const avatarText = computed(() => {
  if (props.profile?.username) {
    return props.profile.username.charAt(0).toUpperCase()
  }
  return 'A'
})

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await adminLogout()
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 取消退出
  }
}
</script>

<template>
  <div class="w-60 rounded-xl bg-white p-6 text-center shadow-sm">
    <!-- 头像 -->
    <div
      class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-medium text-white"
      style="background: linear-gradient(135deg, #cc785c, #e8a55a);"
    >
      <img
        v-if="profile?.avatar"
        :src="profile.avatar"
        alt="头像"
        class="h-full w-full rounded-full object-cover"
      />
      <span v-else>{{ avatarText }}</span>
    </div>

    <!-- 用户名 -->
    <div class="mb-1 text-lg font-semibold text-gray-800">
      {{ profile?.username || '加载中...' }}
    </div>

    <!-- 角色 -->
    <div class="mb-5 text-sm text-gray-500">
      {{ profile?.roleName || '-' }}
    </div>

    <!-- TOTP 状态 -->
    <div class="border-t border-gray-100 pt-5">
      <div class="flex items-center justify-center gap-1.5">
        <span
          class="h-2 w-2 rounded-full"
          :class="profile?.isTotpEnabled ? 'bg-green-500' : 'bg-gray-400'"
        ></span>
        <span class="text-xs text-gray-600">
          TOTP {{ profile?.isTotpEnabled ? '已开启' : '未开启' }}
        </span>
      </div>
    </div>

    <!-- 退出登录按钮 -->
    <button
      class="mt-4 w-full rounded-md bg-gray-100 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-200"
      @click="handleLogout"
    >
      退出登录
    </button>
  </div>
</template>
