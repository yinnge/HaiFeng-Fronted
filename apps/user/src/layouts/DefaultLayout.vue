<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import TopToolBar from '@/components/TopToolBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import RechargeDialog from '@/views/profile/components/RechargeDialog.vue'
import ExpertContactDialog from '@/components/ExpertContactDialog.vue'
import { useRechargeDialog } from '@/composables/useRechargeDialog'

const route = useRoute()
const recharge = useRechargeDialog()

// 顶部「工具/账号层」新导航仅首页展示；旧导航在其下方，首页时贴住新导航底部（top=64），其余页面顶到 0
const isHome = computed(() => route.path === '/')
const headerTopOffset = computed(() => (isHome.value ? 64 : 0))
</script>

<template>
  <div class="app-shell min-h-screen flex flex-col">
    <TopToolBar v-if="isHome" />
    <AppHeader :top-offset="headerTopOffset" />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <RechargeDialog
      v-model:visible="recharge.visible.value"
      :member-info="recharge.memberInfo.value"
      :site-info="recharge.siteInfo.value"
    />
    <ExpertContactDialog />
  </div>
</template>
