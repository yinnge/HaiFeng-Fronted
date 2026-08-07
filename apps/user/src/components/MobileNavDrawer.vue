<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { navItems, type NavItem, type NavSubItem } from '@/config/navigation'
import { pushNavItem } from '@/utils/navAnchor'

const router = useRouter()
const route = useRoute()
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const expandedId = ref<string | null>(null)

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function handleNavClick(item: NavItem) {
  if (item.route) {
    emit('update:open', false)
    router.push(item.route)
  } else if (!item.subItems) {
    ElMessage.info('该功能正在开发中')
  } else {
    toggleExpand(item.id)
  }
}

function handleSubClick(sub: NavSubItem) {
  if (sub.route) {
    emit('update:open', false)
    // 兼容 /path#anchor 锚点路由（如「直通院校」→ /gaokao#exams）
    void pushNavItem(router, route.path, sub)
  } else {
    ElMessage.info('该功能正在开发中')
  }
}

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <!-- 遮罩层 -->
    <Transition name="fade">
      <div v-if="props.open" class="mobile-nav-overlay" @click="close" />
    </Transition>

    <!-- 抽屉 -->
    <Transition name="slide-right">
      <aside v-if="props.open" class="mobile-nav-drawer">
        <div class="drawer-header">
          <span class="drawer-title">导航菜单</span>
          <button class="drawer-close" @click="close">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <nav class="drawer-nav">
          <template v-for="item in navItems" :key="item.id">
            <div class="nav-item-wrapper">
              <button
                class="nav-item-btn"
                :class="{ 'has-children': item.subItems, 'nav-item-home': item.id === 'home' }"
                @click="handleNavClick(item)"
              >
                <span>{{ item.label }}</span>
                <svg
                  v-if="item.subItems"
                  class="chevron-icon"
                  :class="{ expanded: expandedId === item.id }"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>

              <Transition name="expand">
                <div v-if="item.subItems && expandedId === item.id" class="sub-nav">
                  <button
                    v-for="sub in item.subItems"
                    :key="sub.label"
                    class="sub-nav-btn"
                    @click="handleSubClick(sub)"
                  >
                    {{ sub.label }}
                  </button>
                </div>
              </Transition>
            </div>
          </template>
        </nav>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mobile-nav-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 60;
}

.mobile-nav-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20rem;
  background: white;
  z-index: 60;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.drawer-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  color: #6b7280;
  transition: all 0.2s ease;
}

.drawer-close:hover {
  background: rgba(245, 165, 74, 0.08);
  color: #e8722a;
}

.drawer-close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.drawer-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.nav-item-wrapper {
  border-bottom: 1px solid #f9fafb;
}

.nav-item-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.875rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  text-align: left;
  transition: all 0.15s ease;
}

.nav-item-btn:hover {
  background: rgba(245, 165, 74, 0.06);
  color: #e8722a;
}

.nav-item-home {
  color: #e8722a;
  background: rgba(245, 165, 74, 0.08);
}

.nav-item-home:hover {
  background: rgba(245, 165, 74, 0.15);
  color: #e8722a;
}

.chevron-icon {
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.chevron-icon.expanded {
  transform: rotate(180deg);
}

.sub-nav {
  overflow: hidden;
}

.sub-nav-btn {
  display: block;
  width: 100%;
  padding: 0.625rem 1.25rem 0.625rem 2.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  text-align: left;
  transition: all 0.15s ease;
}

.sub-nav-btn:hover {
  background: rgba(245, 165, 74, 0.06);
  color: #e8722a;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>
