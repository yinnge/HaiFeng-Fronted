<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, useUserStore } from '@/store'
import { asyncRoutes } from '@/router'
import type { RouteRecordRaw } from 'vue-router'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const userStore = useUserStore()
const isCollapsed = computed(() => appStore.sidebarCollapsed)
const activeMenu = computed(() => route.path)

interface MenuItem {
  path: string
  title: string
  icon?: string
  children?: MenuItem[]
}

function joinPath(parentPath: string, childPath: string): string {
  const parent = parentPath.endsWith('/') ? parentPath.slice(0, -1) : parentPath
  const child = childPath.startsWith('/') ? childPath.slice(1) : childPath
  return `${parent}/${child}`
}

const menuList = computed(() => {
  const topRoutes = asyncRoutes[0]?.children || []

  function buildMenu(route: RouteRecordRaw): MenuItem | null {
    if (route.meta?.hidden) return null
    // profile 已加载时按 moduleCode 过滤
    if (userStore.profile && route.meta?.moduleCode) {
      if (!userStore.moduleCodes.includes(route.meta.moduleCode as string)) {
        return null
      }
    }

    const item: MenuItem = {
      path: route.path,
      title: (route.meta?.title as string) || '',
      icon: route.meta?.icon as string | undefined,
    }

    if (route.children) {
      const visibleChildren = route.children
        .map((child) => buildMenu(child as RouteRecordRaw))
        .filter(Boolean) as MenuItem[]

      if (visibleChildren.length > 0) {
        item.children = visibleChildren
      }
    }

    return item
  }

  return topRoutes.map((r) => buildMenu(r as RouteRecordRaw)).filter(Boolean) as MenuItem[]
})

function getFullPath(menu: MenuItem, parentPath?: string): string {
  if (!parentPath) {
    return menu.path.startsWith('/') ? menu.path : `/${menu.path}`
  }
  return joinPath(parentPath, menu.path)
}

function handleMenuSelect(index: string) {
  router.push(index)
}
</script>

<template>
  <div class="flex h-full flex-col" style="background-color: #001529;">
    <div class="flex h-16 items-center justify-center" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
      <span v-if="!isCollapsed" class="text-sm font-medium text-white">海枫管理后台</span>
      <span v-else class="text-lg font-bold text-white">HF</span>
    </div>

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
        <el-sub-menu v-if="menu.children && menu.children.length" :index="getFullPath(menu)">
          <template #title>
            <el-icon v-if="menu.icon">
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </template>

          <template v-for="child in menu.children" :key="child.path">
            <el-sub-menu v-if="child.children && child.children.length" :index="getFullPath(child, getFullPath(menu))">
              <template #title>
                <el-icon v-if="child.icon">
                  <component :is="child.icon" />
                </el-icon>
                <span>{{ child.title }}</span>
              </template>
              <el-menu-item
                v-for="grandchild in child.children"
                :key="grandchild.path"
                :index="getFullPath(grandchild, getFullPath(child, getFullPath(menu)))"
              >
                <el-icon v-if="grandchild.icon">
                  <component :is="grandchild.icon" />
                </el-icon>
                <span>{{ grandchild.title }}</span>
              </el-menu-item>
            </el-sub-menu>

            <el-menu-item v-else :index="getFullPath(child, getFullPath(menu))">
              <el-icon v-if="child.icon">
                <component :is="child.icon" />
              </el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <el-menu-item v-else :index="getFullPath(menu)">
          <el-icon v-if="menu.icon">
            <component :is="menu.icon" />
          </el-icon>
          <span>{{ menu.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>
