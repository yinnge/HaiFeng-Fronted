<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import { asyncRoutes } from '@/router'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const isCollapsed = computed(() => appStore.sidebarCollapsed)
const activeMenu = computed(() => route.path)

// 获取菜单项
const menuList = computed(() => {
  return asyncRoutes
    .filter((item) => !item.meta?.hidden)
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => !child.meta?.hidden),
    }))
})

function handleMenuSelect(index: string) {
  router.push(index)
}
</script>

<template>
  <div class="flex h-full flex-col" style="background-color: #001529;">
    <!-- Logo -->
    <div class="flex h-16 items-center justify-center" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
      <span v-if="!isCollapsed" class="text-sm font-medium text-white">海枫管理后台</span>
      <span v-else class="text-lg font-bold text-white">HF</span>
    </div>

    <!-- 菜单 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapsed"
      :collapse-transition="false"
      background-color="#001529"
      text-color="rgba(255,255,255,0.65)"
      active-text-color="#1890ff"
      class="flex-1 border-none"
      @select="handleMenuSelect"
    >
      <template v-for="menu in menuList" :key="menu.path">
        <!-- 有子菜单 -->
        <el-sub-menu v-if="menu.children && menu.children.length > 1" :index="menu.path">
          <template #title>
            <el-icon v-if="menu.meta?.icon">
              <component :is="menu.meta.icon" />
            </el-icon>
            <span>{{ menu.meta?.title }}</span>
          </template>
          <el-menu-item
            v-for="child in menu.children"
            :key="child.path"
            :index="`${menu.path}/${child.path}`"
          >
            <el-icon v-if="child.meta?.icon">
              <component :is="child.meta.icon" />
            </el-icon>
            <span>{{ child.meta?.title }}</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 单个菜单 -->
        <el-menu-item
          v-else-if="menu.children && menu.children.length === 1"
          :index="`${menu.path}/${menu.children[0].path}`"
        >
          <el-icon v-if="menu.children[0].meta?.icon">
            <component :is="menu.children[0].meta.icon" />
          </el-icon>
          <span>{{ menu.children[0].meta?.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>
