<script setup lang="ts">
// apps/user/src/views/gaokao/Toolkit.vue
// 高考百宝箱：占位页，功能规划中（入口来自吸附条「高考百宝箱」目录）
import { useRouter } from 'vue-router'
import ArchiveBar from '@/components/gaokao/ArchiveBar.vue'
import { useGaokaoModuleNav } from '@/composables/useGaokaoModuleNav'

const router = useRouter()

/** 与 /gaokao 完全一致的模块导航（含「高中资料」+ 高中身份），保证各处小导航栏统一 */
const { HIGH_IDENTITIES, highIdentity, onHighIdentityChange, gaokaoExtraItems } = useGaokaoModuleNav()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-brand-gray-50 via-orange-50/20 to-white">
    <!-- 档案吸附条：与 /gaokao 完全一致的模块导航，保证各处小导航栏统一 -->
    <ArchiveBar
      :extra-items="gaokaoExtraItems"
      :identity-options="HIGH_IDENTITIES"
      :identity="highIdentity"
      @identity-change="onHighIdentityChange"
    />
    <main class="flex-1 container mx-auto px-6 pb-16 max-w-5xl">
      <!-- 页头 -->
      <div class="pt-10 md:pt-12">
        <div class="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-4 py-1.5 text-sm font-medium text-brand-orange border border-brand-orange/20">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z" />
            <path d="M10 5h4v2h-4z" />
          </svg>
          高考百宝箱
        </div>
        <h1 class="mt-5 text-3xl font-bold tracking-tight text-gray-800">备考工具，一箱搞定</h1>
        <p class="mt-3 text-base text-gray-500">分数线查询、选科测评、志愿参考等实用工具正在整理中</p>
      </div>

      <!-- 建设中占位 -->
      <div class="mt-12 rounded-2xl bg-white p-12 shadow-card border border-gray-100/60 text-center">
        <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-orange/10">
          <svg class="h-10 w-10 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-gray-700 mb-2">功能建设中</h2>
        <p class="text-sm text-gray-500 mb-6">百宝箱工具正在加紧准备，先去专业组查询看看吧</p>
        <button class="toolkit-back-btn" @click="router.push('/gaokao/groups')">前往专业组查询</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.toolkit-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 26px;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.32);
  transition: all 0.25s ease;
}

.toolkit-back-btn:hover {
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
  transform: translateY(-1px);
}

.toolkit-back-btn:active {
  transform: scale(0.98);
}
</style>
