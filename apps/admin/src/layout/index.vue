<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'

const appStore = useAppStore()
const isCollapsed = computed(() => appStore.sidebarCollapsed)
</script>

<template>
  <el-container class="h-screen">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapsed ? '64px' : '240px'" class="transition-all duration-300">
      <Sidebar />
    </el-aside>

    <el-container>
      <!-- 顶部导航 -->
      <el-header class="flex items-center border-b border-gray-200 bg-white px-4">
        <Navbar />
      </el-header>

      <!-- 主内容区 -->
      <el-main class="p-5" style="background-color: #f0f2f5;">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.el-aside) {
  overflow: hidden;
}
</style>
