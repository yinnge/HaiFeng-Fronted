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

/* ==================== Level 1 - Orange Fill Bar ==================== */
/* Level 1 base: both sub-menu titles and leaf items */
.sidebar-menu :deep(> .el-sub-menu > .el-sub-menu__title),
.sidebar-menu :deep(> .el-menu-item) {
  --el-menu-item-height: 48px;
  --el-menu-item-font-size: 15px;
  --el-menu-base-level-padding: 0px;
  height: 48px;
  line-height: 48px;
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF !important;
  margin: 8px 12px;
  border-radius: 10px;
  width: calc(100% - 24px);
  display: flex;
  justify-content: center;
  gap: 6px;
  padding-left: 0 !important;
  padding-right: 0 !important;
  border-left: none;
  transition: background-color 200ms ease;
}

/* Level 1 sub-menu title - orange background */
.sidebar-menu :deep(> .el-sub-menu > .el-sub-menu__title) {
  background-color: #F97316 !important;
}

.sidebar-menu :deep(> .el-sub-menu > .el-sub-menu__title:hover) {
  background-color: #FB923C !important;
}

/* Level 1 leaf item - orange background */
.sidebar-menu :deep(> .el-menu-item) {
  background-color: #F97316 !important;
}

.sidebar-menu :deep(> .el-menu-item:hover) {
  background-color: #FB923C !important;
}

/* Level 1 arrow */
.sidebar-menu :deep(> .el-sub-menu > .el-sub-menu__title .el-sub-menu__icon-arrow) {
  position: absolute;
  right: 16px;
  color: #FFFFFF;
}

/* Level 1 sub-menu container */
.sidebar-menu :deep(> .el-sub-menu > .el-menu) {
  background-color: transparent !important;
}

/* ==================== Level 2 - Transparent + Vertical Guide Line ==================== */
/* Level 2 container: vertical guide line on the left */
.sidebar-menu :deep(> .el-sub-menu > .el-menu) {
  border-left: 2px solid #E5E7EB;
  margin-left: 28px;
}

/* Level 2 sub-menu title */
.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-sub-menu > .el-sub-menu__title) {
  --el-menu-item-height: 40px;
  --el-menu-item-font-size: 14px;
  --el-menu-base-level-padding: 0px;
  --el-menu-level: 0;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  font-weight: 500;
  color: #374151 !important;
  background-color: transparent !important;
  margin: 2px 8px;
  border-radius: 6px;
  width: calc(100% - 8px);
  display: flex;
  justify-content: flex-start;
  gap: 6px;
  padding-left: 16px !important;
  padding-right: 8px !important;
  border-left: none;
  transition: background-color 200ms ease, color 200ms ease;
}

.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-sub-menu > .el-sub-menu__title:hover) {
  background-color: #FFF7ED !important;
  color: #C2410C !important;
}

/* Level 2 arrow */
.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-sub-menu > .el-sub-menu__title .el-sub-menu__icon-arrow) {
  position: absolute;
  right: 12px;
  color: #9CA3AF;
  font-size: 12px;
}

/* Level 2 leaf item */
.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-menu-item) {
  --el-menu-item-height: 40px;
  --el-menu-item-font-size: 14px;
  --el-menu-base-level-padding: 0px;
  --el-menu-level: 0;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  font-weight: 500;
  color: #374151 !important;
  background-color: transparent !important;
  margin: 2px 8px;
  border-radius: 6px;
  width: calc(100% - 8px);
  display: flex;
  justify-content: flex-start;
  gap: 6px;
  padding-left: 16px !important;
  padding-right: 8px !important;
  border-left: none;
  transition: background-color 200ms ease, color 200ms ease;
}

.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-menu-item:hover) {
  background-color: #FFF7ED !important;
  color: #C2410C !important;
}

/* ==================== Level 3 - Transparent + L-Shaped Tree Connector ==================== */
/* Level 3 container: vertical guide line */
.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-sub-menu > .el-menu) {
  border-left: 2px solid #E5E7EB;
  margin-left: 16px;
  background-color: transparent !important;
}

/* Level 3 leaf item */
.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item) {
  --el-menu-item-height: 36px;
  --el-menu-item-font-size: 13px;
  --el-menu-base-level-padding: 0px;
  --el-menu-level: 0;
  height: 36px;
  line-height: 36px;
  font-size: 13px;
  font-weight: 400;
  color: #6B7280 !important;
  background-color: transparent !important;
  margin: 2px 8px;
  border-radius: 6px;
  width: calc(100% - 8px);
  display: flex;
  justify-content: flex-start;
  gap: 6px;
  padding-left: 22px !important;
  padding-right: 8px !important;
  border-left: none;
  position: relative;
  transition: background-color 200ms ease, color 200ms ease;
}

/* Level 3 horizontal connector line (L-shape) */
.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item::before) {
  content: '';
  position: absolute;
  left: -2px;
  top: 50%;
  width: 10px;
  height: 1px;
  background-color: #D1D5DB;
  z-index: 1;
}

/* Level 3: last item - clip the vertical line below the horizontal connector */
.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item:last-child::after) {
  content: '';
  position: absolute;
  left: -2px;
  top: 50%;
  width: 2px;
  height: calc(100% - 50%);
  background-color: #FFFFFF;
  z-index: 0;
}

.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item:hover) {
  background-color: #FFF7ED !important;
  color: #C2410C !important;
}

.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item:hover::before) {
  background-color: #F97316;
}

/* ==================== Active States ==================== */
/* Level 1 leaf active - blue background */
.sidebar-menu :deep(> .el-menu-item.is-active) {
  background-color: #1D4ED8 !important;
  color: #FFFFFF !important;
  font-weight: 600;
}

.sidebar-menu :deep(> .el-menu-item.is-active::before) {
  display: none;
}

/* Level 2 leaf active - light blue background + blue text */
.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-menu-item.is-active) {
  background-color: #DBEAFE !important;
  color: #1D4ED8 !important;
  font-weight: 600;
}

/* Level 3 leaf active - light blue background + blue text + blue connector */
.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item.is-active) {
  background-color: #DBEAFE !important;
  color: #1D4ED8 !important;
  font-weight: 500;
}

.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item.is-active::before) {
  background-color: #1D4ED8;
}

/* Parent containing active child - blue text + left border for Level 1 */
.sidebar-menu :deep(> .el-sub-menu.is-active > .el-sub-menu__title) {
  background-color: #F97316 !important;
  color: #FFFFFF !important;
  border-left: 3px solid #1D4ED8;
}

/* Level 2 parent containing active child - blue text */
.sidebar-menu :deep(> .el-sub-menu > .el-menu > .el-sub-menu.is-active > .el-sub-menu__title) {
  color: #1D4ED8 !important;
  font-weight: 600;
}

/* ==================== Collapsed Menu (64px) ==================== */
.sidebar-menu :deep(.el-menu--collapse .el-menu-item),
.sidebar-menu :deep(.el-menu--collapse .el-sub-menu__title) {
  padding-left: 0 !important;
  justify-content: center !important;
  margin: 6px auto !important;
  width: 48px !important;
  height: 48px !important;
  border-left: none !important;
  border-radius: 10px !important;
  --el-menu-item-height: 48px !important;
  --el-menu-base-level-padding: 0px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  color: #FFFFFF !important;
  background-color: #F97316 !important;
  gap: 0 !important;
}

.sidebar-menu :deep(.el-menu--collapse .el-menu-item:hover),
.sidebar-menu :deep(.el-menu--collapse .el-sub-menu__title:hover) {
  background-color: #FB923C !important;
}

.sidebar-menu :deep(.el-menu--collapse .el-menu-item.is-active) {
  border-left: none !important;
  padding-left: 0 !important;
  background-color: #1D4ED8 !important;
  color: #FFFFFF !important;
}

/* Hide guide lines and connectors in collapsed mode */
.sidebar-menu :deep(.el-menu--collapse .el-menu) {
  border-left: none !important;
  margin-left: 0 !important;
}
</style>

<!-- 非 scoped 样式：强制覆盖 Element Plus 内置 CSS 变量 + 弹出菜单样式 -->
<style>
/* ==================== Level 1 Base ==================== */
.sidebar-menu > .el-sub-menu > .el-sub-menu__title,
.sidebar-menu > .el-menu-item {
  transition: background-color 200ms ease !important;
  --el-menu-item-height: 48px !important;
  --el-menu-item-font-size: 15px !important;
  --el-menu-base-level-padding: 0px !important;
  height: 48px !important;
  line-height: 48px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  color: #FFFFFF !important;
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

.sidebar-menu > .el-sub-menu > .el-sub-menu__title .el-sub-menu__icon-arrow {
  position: absolute !important;
  right: 16px !important;
  color: #FFFFFF !important;
}

.sidebar-menu .el-menu {
  background-color: transparent !important;
}

/* Level 1 orange backgrounds */
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

/* ==================== Level 2 - Transparent + Guide Line ==================== */
/* Level 2 container with vertical guide line */
.sidebar-menu > .el-sub-menu > .el-menu {
  border-left: 2px solid #E5E7EB !important;
  margin-left: 28px !important;
  background-color: transparent !important;
}

/* Level 2 sub-menu title */
.sidebar-menu > .el-sub-menu > .el-menu > .el-sub-menu > .el-sub-menu__title {
  --el-menu-item-height: 40px !important;
  --el-menu-item-font-size: 14px !important;
  --el-menu-base-level-padding: 0px !important;
  --el-menu-level: 0 !important;
  height: 40px !important;
  line-height: 40px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #374151 !important;
  background-color: transparent !important;
  margin: 2px 8px !important;
  border-radius: 6px !important;
  width: calc(100% - 8px) !important;
  display: flex !important;
  justify-content: flex-start !important;
  gap: 6px !important;
  padding-left: 16px !important;
  padding-right: 8px !important;
  border-left: none !important;
  transition: background-color 200ms ease, color 200ms ease !important;
}
.sidebar-menu > .el-sub-menu > .el-menu > .el-sub-menu > .el-sub-menu__title:hover {
  background-color: #FFF7ED !important;
  color: #C2410C !important;
}
.sidebar-menu > .el-sub-menu > .el-menu > .el-sub-menu > .el-sub-menu__title .el-sub-menu__icon-arrow {
  position: absolute !important;
  right: 12px !important;
  color: #9CA3AF !important;
  font-size: 12px !important;
}

/* Level 2 leaf item */
.sidebar-menu > .el-sub-menu > .el-menu > .el-menu-item {
  --el-menu-item-height: 40px !important;
  --el-menu-item-font-size: 14px !important;
  --el-menu-base-level-padding: 0px !important;
  --el-menu-level: 0 !important;
  height: 40px !important;
  line-height: 40px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #374151 !important;
  background-color: transparent !important;
  margin: 2px 8px !important;
  border-radius: 6px !important;
  width: calc(100% - 8px) !important;
  display: flex !important;
  justify-content: flex-start !important;
  gap: 6px !important;
  padding-left: 16px !important;
  padding-right: 8px !important;
  border-left: none !important;
  transition: background-color 200ms ease, color 200ms ease !important;
}
.sidebar-menu > .el-sub-menu > .el-menu > .el-menu-item:hover {
  background-color: #FFF7ED !important;
  color: #C2410C !important;
}

/* ==================== Level 3 - Transparent + L-Shaped Connector ==================== */
.sidebar-menu > .el-sub-menu > .el-menu > .el-sub-menu > .el-menu {
  border-left: 2px solid #E5E7EB !important;
  margin-left: 16px !important;
  background-color: transparent !important;
}

.sidebar-menu > .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item {
  --el-menu-item-height: 36px !important;
  --el-menu-item-font-size: 13px !important;
  --el-menu-base-level-padding: 0px !important;
  --el-menu-level: 0 !important;
  height: 36px !important;
  line-height: 36px !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  color: #6B7280 !important;
  background-color: transparent !important;
  margin: 2px 8px !important;
  border-radius: 6px !important;
  width: calc(100% - 8px) !important;
  display: flex !important;
  justify-content: flex-start !important;
  gap: 6px !important;
  padding-left: 22px !important;
  padding-right: 8px !important;
  border-left: none !important;
  position: relative !important;
  transition: background-color 200ms ease, color 200ms ease !important;
}

/* Level 3 horizontal connector */
.sidebar-menu > .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item::before {
  content: '' !important;
  position: absolute !important;
  left: -2px !important;
  top: 50% !important;
  width: 10px !important;
  height: 1px !important;
  background-color: #D1D5DB !important;
  z-index: 1 !important;
}

/* Level 3 last item: clip vertical line below connector */
.sidebar-menu > .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item:last-child::after {
  content: '' !important;
  position: absolute !important;
  left: -2px !important;
  top: 50% !important;
  width: 2px !important;
  height: calc(100% - 50%) !important;
  background-color: #FFFFFF !important;
  z-index: 0 !important;
}

.sidebar-menu > .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item:hover {
  background-color: #FFF7ED !important;
  color: #C2410C !important;
}
.sidebar-menu > .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item:hover::before {
  background-color: #F97316 !important;
}

/* ==================== Active States ==================== */
/* Level 1 leaf active */
.sidebar-menu > .el-menu-item.is-active {
  background-color: #1D4ED8 !important;
  color: #FFFFFF !important;
  font-weight: 600 !important;
}
.sidebar-menu > .el-menu-item.is-active::before {
  display: none !important;
}

/* Level 2 leaf active */
.sidebar-menu > .el-sub-menu > .el-menu > .el-menu-item.is-active {
  background-color: #DBEAFE !important;
  color: #1D4ED8 !important;
  font-weight: 600 !important;
}

/* Level 3 leaf active */
.sidebar-menu > .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item.is-active {
  background-color: #DBEAFE !important;
  color: #1D4ED8 !important;
  font-weight: 500 !important;
}
.sidebar-menu > .el-sub-menu > .el-menu > .el-sub-menu > .el-menu > .el-menu-item.is-active::before {
  background-color: #1D4ED8 !important;
}

/* Level 1 parent with active child */
.sidebar-menu > .el-sub-menu.is-active > .el-sub-menu__title {
  background-color: #F97316 !important;
  color: #FFFFFF !important;
  border-left: 3px solid #1D4ED8 !important;
}

/* Level 2 parent with active child */
.sidebar-menu > .el-sub-menu > .el-menu > .el-sub-menu.is-active > .el-sub-menu__title {
  color: #1D4ED8 !important;
  font-weight: 600 !important;
}

/* ==================== Collapsed Sidebar ==================== */
.sidebar-menu.el-menu--collapse .el-menu-item,
.sidebar-menu.el-menu--collapse .el-sub-menu__title {
  padding-left: 0 !important;
  justify-content: center !important;
  margin: 6px auto !important;
  width: 48px !important;
  height: 48px !important;
  border-left: none !important;
  border-radius: 10px !important;
  --el-menu-item-height: 48px !important;
  --el-menu-base-level-padding: 0px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  color: #FFFFFF !important;
  background-color: #F97316 !important;
  gap: 0 !important;
}
.sidebar-menu.el-menu--collapse .el-menu-item:hover,
.sidebar-menu.el-menu--collapse .el-sub-menu__title:hover {
  background-color: #FB923C !important;
}
.sidebar-menu.el-menu--collapse .el-menu-item.is-active {
  border-left: none !important;
  padding-left: 0 !important;
  background-color: #1D4ED8 !important;
  color: #FFFFFF !important;
}
.sidebar-menu.el-menu--collapse .el-menu {
  border-left: none !important;
  margin-left: 0 !important;
}

/* ==================== Popup Menu (Collapsed - Teleported to body) ==================== */
.el-menu--popup {
  background-color: #FFFFFF !important;
  border: 1px solid #E5E7EB !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  padding: 4px !important;
}

/* Popup: all items transparent background, no guide lines */
.el-menu--popup .el-menu-item,
.el-menu--popup .el-sub-menu__title {
  background-color: transparent !important;
  color: #374151 !important;
  font-weight: 500 !important;
  border-left: none !important;
  border-radius: 6px !important;
  margin: 2px 4px !important;
  width: calc(100% - 8px) !important;
  height: 40px !important;
  line-height: 40px !important;
  --el-menu-item-height: 40px !important;
  --el-menu-base-level-padding: 0px !important;
  padding-left: 16px !important;
  padding-right: 12px !important;
  justify-content: flex-start !important;
  gap: 6px !important;
  font-size: 14px !important;
  transition: background-color 200ms ease, color 200ms ease !important;
}

.el-menu--popup .el-menu-item:hover,
.el-menu--popup .el-sub-menu__title:hover {
  background-color: #FFF7ED !important;
  color: #C2410C !important;
}

.el-menu--popup .el-menu-item.is-active {
  background-color: #DBEAFE !important;
  color: #1D4ED8 !important;
  font-weight: 600 !important;
}

.el-menu--popup .el-sub-menu__title .el-sub-menu__icon-arrow {
  color: #9CA3AF !important;
  font-size: 12px !important;
}

/* Popup nested menus: no guide lines */
.el-menu--popup .el-menu {
  border-left: none !important;
  margin-left: 0 !important;
  background-color: transparent !important;
}

/* Popup Level 2 items */
.el-menu--popup .el-sub-menu .el-menu-item {
  height: 36px !important;
  line-height: 36px !important;
  --el-menu-item-height: 36px !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  color: #6B7280 !important;
  padding-left: 24px !important;
}

.el-menu--popup .el-sub-menu .el-menu-item::before,
.el-menu--popup .el-sub-menu .el-menu-item::after {
  display: none !important;
}

.el-menu--popup .el-sub-menu .el-menu-item.is-active {
  background-color: #DBEAFE !important;
  color: #1D4ED8 !important;
}
</style>
