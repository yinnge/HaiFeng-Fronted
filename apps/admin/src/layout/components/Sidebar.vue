<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, useUserStore } from '@/store'
import { asyncRoutes } from '@/router'
import type { RouteRecordRaw } from 'vue-router'
import logoMain from '@/assets/images/logo-main.png'

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
  <div class="sidebar-root">
    <!-- Brand Area: white background with logo -->
    <div class="sidebar-brand">
      <template v-if="!isCollapsed">
        <img :src="logoMain" alt="海枫管理后台" class="sidebar-logo" />
        <span class="sidebar-brand-text">海枫管理后台</span>
      </template>
      <template v-else>
        <img :src="logoMain" alt="HF" class="sidebar-logo-collapsed" />
      </template>
    </div>

    <!-- Navigation Menu -->
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapsed"
      :collapse-transition="false"
      background-color="#F97316"
      text-color="#FFFFFF"
      active-text-color="#FFFFFF"
      class="sidebar-menu"
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

<style scoped>
.sidebar-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #F97316;
  overflow-y: scroll;
  overflow-x: hidden;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 64px;
  padding: 0 16px;
  background-color: #FFFFFF;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.sidebar-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-logo-collapsed {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-brand-text {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu :deep(.el-sub-menu__title .el-sub-menu__icon-arrow) {
  color: rgba(255, 255, 255, 0.75);
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  transition: background-color 200ms ease;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  height: 48px;
  line-height: 48px;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.12) !important;
  color: rgba(255, 255, 255, 0.95);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.18) !important;
  color: #FFFFFF;
  font-weight: 500;
  position: relative;
  border-left: 4px solid #FFFFFF;
  padding-left: 12px;
}

.sidebar-menu :deep(.el-menu-item.is-active::before) {
  display: none;
}

.sidebar-menu :deep(.el-menu) {
  transition: height 200ms ease-out;
}

.sidebar-menu :deep(.el-menu--collapse .el-menu-item),
.sidebar-menu :deep(.el-menu--collapse .el-sub-menu__title) {
  padding-left: 0;
  justify-content: center;
}

.sidebar-menu :deep(.el-menu--collapse .el-menu-item.is-active) {
  border-left: none;
  padding-left: 0;
}

.sidebar-menu :deep(.el-sub-menu .el-menu) {
  background-color: rgba(0, 0, 0, 0.06) !important;
}
</style>
