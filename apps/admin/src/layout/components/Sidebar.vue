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
  background-color: #FFFFFF;
  overflow: visible;
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
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(249, 115, 22, 0.5) transparent;
  background-color: #FFFFFF !important;
}

.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(249, 115, 22, 0.5);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(249, 115, 22, 0.7);
}

/* ==================== Base Styles (Level 1) ==================== */
.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  transition: background-color 200ms ease;
  color: #FFFFFF !important;
  --el-menu-item-height: 48px;
  --el-menu-item-font-size: 15px;
  --el-menu-base-level-padding: 0px;
  height: 48px;
  line-height: 48px;
  font-size: 15px;
  margin: 8px 12px;
  border-radius: 10px;
  width: calc(100% - 24px);
  display: flex;
  justify-content: center;
  gap: 6px;
  padding-left: 0 !important;
  padding-right: 0 !important;
  border-left: none;
}

.sidebar-menu :deep(.el-sub-menu__title .el-sub-menu__icon-arrow) {
  position: absolute;
  right: 16px;
  color: #FFFFFF;
}

.sidebar-menu :deep(.el-menu) {
  background-color: transparent !important;
  --el-menu-item-height: 48px;
}

/* ==================== Level 1 - Orange #F97316 ==================== */
.sidebar-menu :deep(.el-sub-menu > .el-sub-menu__title) {
  background-color: #F97316 !important;
}

.sidebar-menu :deep(.el-sub-menu > .el-sub-menu__title:hover) {
  background-color: #FB923C !important;
}

.sidebar-menu :deep(.el-menu-item) {
  background-color: #F97316 !important;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #FB923C !important;
}

/* ==================== Level 2 - Deeper Orange #EA580C ==================== */
.sidebar-menu :deep(.el-sub-menu .el-sub-menu > .el-sub-menu__title) {
  background-color: #EA580C !important;
  --el-menu-item-height: 42px;
  --el-menu-item-font-size: 14px;
  --el-menu-base-level-padding: 24px;
  height: 42px;
  line-height: 42px;
  font-size: 14px;
  margin: 4px 12px;
  border-radius: 8px;
  width: calc(100% - 24px);
  justify-content: flex-start;
  padding-left: 24px !important;
  border-left: 2px solid rgba(249, 115, 22, 0.3);
}

.sidebar-menu :deep(.el-sub-menu .el-sub-menu > .el-sub-menu__title:hover) {
  background-color: #F97316 !important;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  background-color: #EA580C !important;
  --el-menu-sub-item-height: 42px;
  --el-menu-item-height: 42px;
  --el-menu-item-font-size: 14px;
  --el-menu-base-level-padding: 24px;
  height: 42px;
  line-height: 42px;
  font-size: 14px;
  margin: 4px 12px;
  border-radius: 8px;
  width: calc(100% - 24px);
  justify-content: flex-start;
  padding-left: 24px !important;
  border-left: 2px solid rgba(249, 115, 22, 0.3);
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background-color: #F97316 !important;
}

/* ==================== Level 3 - Red-Orange #DC2626 ==================== */
.sidebar-menu :deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  background-color: #DC2626 !important;
  --el-menu-sub-item-height: 38px;
  --el-menu-item-height: 38px;
  --el-menu-item-font-size: 13px;
  --el-menu-base-level-padding: 48px;
  height: 38px;
  line-height: 38px;
  font-size: 13px;
  margin: 2px 12px;
  border-radius: 6px;
  width: calc(100% - 24px);
  justify-content: flex-start;
  padding-left: 48px !important;
  border-left: 1px solid rgba(220, 38, 38, 0.25);
}

.sidebar-menu :deep(.el-sub-menu .el-sub-menu .el-menu-item:hover) {
  background-color: #EF4444 !important;
}

/* ==================== Active / Selected - Blue #1D4ED8 ==================== */
.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #1D4ED8 !important;
  color: #FFFFFF !important;
  font-weight: 500;
  position: relative;
  border-left: 3px solid #1E40AF !important;
  justify-content: flex-start;
  padding-left: 16px !important;
}

.sidebar-menu :deep(.el-menu-item.is-active::before) {
  display: none;
}

/* ==================== Collapsed Menu ==================== */
.sidebar-menu :deep(.el-menu--collapse .el-menu-item),
.sidebar-menu :deep(.el-menu--collapse .el-sub-menu__title) {
  padding-left: 0;
  justify-content: center;
  margin: 6px auto;
  width: 48px;
  height: 48px;
  border-left: none;
  --el-menu-item-height: 48px;
  --el-menu-base-level-padding: 0px;
}

.sidebar-menu :deep(.el-menu--collapse .el-menu-item.is-active) {
  border-left: none;
  padding-left: 0;
  background-color: #1D4ED8 !important;
}
</style>

<!-- 非 scoped 样式：强制覆盖 Element Plus 内置 CSS 变量 -->
<style>
.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  transition: background-color 200ms ease !important;
  color: #FFFFFF !important;
  --el-menu-item-height: 48px !important;
  --el-menu-item-font-size: 15px !important;
  height: 48px !important;
  line-height: 48px !important;
  font-size: 15px !important;
  margin: 8px 12px !important;
  border-radius: 10px !important;
  width: calc(100% - 24px) !important;
  display: flex !important;
  justify-content: center !important;
  gap: 6px !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  border-left: none !important;
}

.sidebar-menu .el-sub-menu__title .el-sub-menu__icon-arrow {
  position: absolute !important;
  right: 16px !important;
  color: #FFFFFF !important;
}

.sidebar-menu .el-menu {
  background-color: transparent !important;
  --el-menu-item-height: 48px !important;
}

/* Level 1 */
.sidebar-menu > .el-sub-menu > .el-sub-menu__title {
  background-color: #F97316 !important;
}
.sidebar-menu > .el-sub-menu > .el-sub-menu__title:hover {
  background-color: #FB923C !important;
}
.sidebar-menu > .el-menu-item {
  background-color: #F97316 !important;
}
.sidebar-menu > .el-menu-item:hover {
  background-color: #FB923C !important;
}

/* Level 2 */
.sidebar-menu .el-sub-menu .el-sub-menu > .el-sub-menu__title {
  background-color: #EA580C !important;
  --el-menu-item-height: 42px !important;
  --el-menu-item-font-size: 14px !important;
  height: 42px !important;
  line-height: 42px !important;
  font-size: 14px !important;
  margin: 4px 12px !important;
  border-radius: 8px !important;
  width: calc(100% - 24px) !important;
  justify-content: flex-start !important;
  padding-left: 24px !important;
  padding-right: 0 !important;
  border-left: 2px solid rgba(249, 115, 22, 0.3) !important;
}
.sidebar-menu .el-sub-menu .el-sub-menu > .el-sub-menu__title:hover {
  background-color: #F97316 !important;
}
.sidebar-menu .el-sub-menu .el-menu-item {
  background-color: #EA580C !important;
  --el-menu-sub-item-height: 42px !important;
  --el-menu-item-height: 42px !important;
  --el-menu-item-font-size: 14px !important;
  height: 42px !important;
  line-height: 42px !important;
  font-size: 14px !important;
  margin: 4px 12px !important;
  border-radius: 8px !important;
  width: calc(100% - 24px) !important;
  justify-content: flex-start !important;
  padding-left: 24px !important;
  padding-right: 0 !important;
  border-left: 2px solid rgba(249, 115, 22, 0.3) !important;
}
.sidebar-menu .el-sub-menu .el-menu-item:hover {
  background-color: #F97316 !important;
}

/* Level 3 */
.sidebar-menu .el-sub-menu .el-sub-menu .el-menu-item {
  background-color: #DC2626 !important;
  --el-menu-sub-item-height: 38px !important;
  --el-menu-item-height: 38px !important;
  --el-menu-item-font-size: 13px !important;
  height: 38px !important;
  line-height: 38px !important;
  font-size: 13px !important;
  margin: 2px 12px !important;
  border-radius: 6px !important;
  width: calc(100% - 24px) !important;
  justify-content: flex-start !important;
  padding-left: 48px !important;
  padding-right: 0 !important;
  border-left: 1px solid rgba(220, 38, 38, 0.25) !important;
}
.sidebar-menu .el-sub-menu .el-sub-menu .el-menu-item:hover {
  background-color: #EF4444 !important;
}

/* Active */
.sidebar-menu .el-menu-item.is-active {
  background-color: #1D4ED8 !important;
  color: #FFFFFF !important;
  font-weight: 500 !important;
  position: relative !important;
  border-left: 3px solid #1E40AF !important;
  justify-content: flex-start !important;
  padding-left: 16px !important;
}
.sidebar-menu .el-menu-item.is-active::before {
  display: none !important;
}

/* Collapsed */
.sidebar-menu.el-menu--collapse .el-menu-item,
.sidebar-menu.el-menu--collapse .el-sub-menu__title {
  padding-left: 0 !important;
  justify-content: center !important;
  margin: 6px auto !important;
  width: 48px !important;
  height: 48px !important;
  border-left: none !important;
  --el-menu-item-height: 48px !important;
}
.sidebar-menu.el-menu--collapse .el-menu-item.is-active {
  border-left: none !important;
  padding-left: 0 !important;
  background-color: #1D4ED8 !important;
}
</style>
