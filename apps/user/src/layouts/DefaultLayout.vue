<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import RechargeDialog from '@/views/profile/components/RechargeDialog.vue'
import { useRechargeDialog } from '@/composables/useRechargeDialog'

const recharge = useRechargeDialog()
</script>

<template>
  <div class="app-shell min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <RechargeDialog
      v-model:visible="recharge.visible.value"
      :member-info="recharge.memberInfo.value"
      :site-info="recharge.siteInfo.value"
    />
  </div>
</template>
