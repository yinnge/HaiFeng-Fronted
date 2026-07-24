<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSystemSettings } from '@/api/system/settings'
import type { SystemSettingsVO } from '@/types/system/settings'
import BasicInfoCard from './components/BasicInfoCard.vue'
import PricingCard from './components/PricingCard.vue'
import SeoCard from './components/SeoCard.vue'
import SocialCard from './components/SocialCard.vue'
import ContactCard from './components/ContactCard.vue'
import ProviderCard from './components/ProviderCard.vue'

const loading = ref(false)
const settingsData = ref<SystemSettingsVO | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSystemSettings()
    if (res.data.code === 200) {
      settingsData.value = res.data.data
    }
  } catch (error) {
    console.error('获取系统设置失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div v-loading="loading">
    <BasicInfoCard :data="settingsData" @refresh="fetchData" />
    <PricingCard :data="settingsData" @refresh="fetchData" />
    <SeoCard :data="settingsData" @refresh="fetchData" />
    <SocialCard :data="settingsData" @refresh="fetchData" />
    <ContactCard :data="settingsData" @refresh="fetchData" />
    <ProviderCard :data="settingsData" @refresh="fetchData" />
  </div>
</template>
