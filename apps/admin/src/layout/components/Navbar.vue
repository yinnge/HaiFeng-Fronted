<!-- apps/admin/src/layout/components/Navbar.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore, useUserStore } from '@/store'
import { ElMessageBox, ElMessage } from 'element-plus'
import { adminLogout } from '@/api/auth'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// 切换侧边栏
function toggleSidebar() {
  appStore.toggleSidebar()
}

// 获取头像文字
const avatarText = computed(() => userStore.getAvatarText())

// 进入个人中心
function goToProfile() {
  router.push('/profile')
}

// 进入后台管理
function goToDashboard() {
  router.push('/dashboard')
}

// 退出登录
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

// 加载用户信息
onMounted(() => {
  if (!userStore.profile && userStore.isLoggedIn()) {
    userStore.fetchProfile()
  }
})
</script>

<template>
  <div class="flex w-full items-center justify-between">
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="flex items-center">
      <el-icon
        class="cursor-pointer text-xl text-gray-600 hover:text-gray-900"
        @click="toggleSidebar"
      >
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>

      <el-breadcrumb separator="/" class="ml-4">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧：用户信息 + 后台管理按钮 -->
    <div class="flex items-center gap-4">
      <!-- 用户卡片 -->
      <el-dropdown trigger="hover">
        <div
          class="flex cursor-pointer items-center gap-2.5 rounded-lg bg-white px-3 py-2 shadow-sm transition hover:shadow-md"
        >
          <!-- 头像 -->
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-white"
            style="background: linear-gradient(135deg, #cc785c, #e8a55a);"
          >
            <img
              v-if="userStore.profile?.avatar"
              :src="userStore.profile.avatar"
              alt="头像"
              class="h-full w-full rounded-full object-cover"
            />
            <span v-else>{{ avatarText }}</span>
          </div>
          <!-- 用户名和角色 -->
          <div>
            <div class="text-sm font-medium text-gray-800">
              {{ userStore.profile?.username || '加载中...' }}
            </div>
            <div class="text-xs text-gray-500">
              {{ userStore.profile?.roleName || '-' }}
            </div>
          </div>
          <el-icon class="ml-1 text-gray-400"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goToProfile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 进入后台管理按钮 -->
      <el-button
        type="primary"
        style="background-color: #cc785c; border-color: #cc785c;"
        @click="goToDashboard"
      >
        进入后台管理
      </el-button>
    </div>
  </div>
</template>
