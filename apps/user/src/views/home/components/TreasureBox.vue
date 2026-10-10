<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

/**
 * 百宝箱（与核心服务导航同级别的第二导航区块）：
 * 收纳原导航中的查询工具（院校/专业/城市/企业行业/竞赛证书）。
 * Tab 页签式：模块作为页签标题（过多自动换行），下方列表展示该模块的二级目录。
 */

interface BoxItem {
  label: string
  route?: string
}

interface BoxTab {
  key: string
  label: string
  icon: string
  items: BoxItem[]
}

const iconMap: Record<string, string> = {
  university: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>`,
  major: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
  city: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  enterprise: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>`,
  competition: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`,
}

const tabs: BoxTab[] = [
  {
    key: 'university',
    label: '院校查询',
    icon: iconMap.university,
    items: [{ label: '院校列表', route: '/university' }],
  },
  {
    key: 'major',
    label: '专业查询',
    icon: iconMap.major,
    items: [
      { label: '本科专业', route: '/major' },
      { label: '考研专业', route: '/postgrad-major' },
    ],
  },
  {
    key: 'city',
    label: '城市查询',
    icon: iconMap.city,
    items: [{ label: '城市列表', route: '/city' }],
  },
  {
    key: 'enterprise',
    label: '企业行业',
    icon: iconMap.enterprise,
    items: [
      { label: '企业查询', route: '/enterprise' },
      { label: '行业查询', route: '/industry' },
    ],
  },
  {
    key: 'competition',
    label: '竞赛证书',
    icon: iconMap.competition,
    items: [
      { label: '竞赛', route: '/competition' },
      { label: '证书', route: '/certificate' },
    ],
  },
]

const active = ref(tabs[0].key)
const activeTab = computed(() => tabs.find(t => t.key === active.value) ?? tabs[0])

const router = useRouter()

function go(item: BoxItem) {
  if (!item.route) {
    ElMessage.info('该功能正在开发中')
    return
  }
  router.push(item.route)
}
</script>

<template>
  <div class="treasure-box">
    <!-- 页签：模块作为标题，过多自动换行 -->
    <div class="tb-tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="tb-tab"
        :class="{ active: tab.key === active }"
        role="tab"
        :aria-selected="tab.key === active"
        @click="active = tab.key"
      >
        <span class="tb-tab-icon" v-html="tab.icon"></span>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- 内容：该模块的二级目录列表 -->
    <Transition name="tb-fade" mode="out-in">
      <div :key="activeTab.key" class="tb-panel">
        <button
          v-for="item in activeTab.items"
          :key="item.label"
          type="button"
          class="tb-item"
          @click="go(item)"
        >
          <span class="tb-item-icon" v-html="activeTab.icon"></span>
          <span class="tb-item-body">
            <span class="tb-item-label">{{ item.label }}</span>
            <span class="tb-item-sub">{{ activeTab.label }} · 点击进入</span>
          </span>
          <svg class="tb-item-arrow" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.treasure-box {
  max-width: 860px;
  margin: 0 auto;
}

/* 页签（可换行） */
.tb-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem;
  margin-bottom: 1.5rem;
}

.tb-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.35rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #b45309;
  background: rgba(212, 168, 90, 0.12);
  border: 1px solid rgba(212, 168, 90, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.tb-tab:hover {
  background: rgba(212, 168, 90, 0.2);
  transform: translateY(-2px);
}

.tb-tab.active {
  color: #ffffff;
  background: linear-gradient(90deg, #d4a85a, #bf8a30);
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(191, 138, 48, 0.35);
}

.tb-tab-icon {
  display: flex;
  align-items: center;
}

.tb-tab-icon :deep(svg) {
  width: 1rem;
  height: 1rem;
}

/* 目录列表 */
.tb-panel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.85rem;
}

.tb-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.2rem;
  border-radius: 14px;
  background: #ffffff;
  border: none;
  box-shadow: 0 2px 12px rgba(191, 138, 48, 0.08);
  text-align: left;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.tb-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 26px rgba(191, 138, 48, 0.18);
}

.tb-item:active {
  transform: translateY(-1px) scale(0.99);
}

.tb-item-icon {
  width: 2.4rem;
  height: 2.4rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(212, 168, 90, 0.14);
  color: #bf8a30;
}

.tb-item-icon :deep(svg) {
  width: 1.15rem;
  height: 1.15rem;
}

.tb-item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.tb-item-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.tb-item-sub {
  font-size: 0.75rem;
  color: #9ca3af;
}

.tb-item-arrow {
  width: 0.9rem;
  height: 0.9rem;
  color: #d4a85a;
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.tb-item:hover .tb-item-arrow {
  transform: translateX(3px);
}

/* 切换过渡 */
.tb-fade-enter-active,
.tb-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tb-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.tb-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .tb-tab,
  .tb-item,
  .tb-item-arrow {
    transition: none;
  }
}
</style>
