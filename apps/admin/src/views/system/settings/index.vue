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
import GaokaoCoefCard from './components/GaokaoCoefCard.vue'

const loading = ref(false)
const settingsData = ref<SystemSettingsVO | null>(null)
const activeTab = ref('basic')

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
  <div v-loading="loading" class="settings-page">
    <div class="settings-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">系统设置</h1>
        <p class="page-subtitle">管理网站的基本信息、价格配置和系统参数</p>
      </div>

      <!-- Tabs 标签页 -->
      <el-card shadow="never" class="settings-tabs-card">
        <el-tabs v-model="activeTab" tab-position="top" class="settings-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <BasicInfoCard :data="settingsData" @refresh="fetchData" />
          </el-tab-pane>
          <el-tab-pane label="会员价格" name="pricing">
            <PricingCard :data="settingsData" @refresh="fetchData" />
          </el-tab-pane>
          <el-tab-pane label="SEO 配置" name="seo">
            <SeoCard :data="settingsData" @refresh="fetchData" />
          </el-tab-pane>
          <el-tab-pane label="社交媒体" name="social">
            <SocialCard :data="settingsData" @refresh="fetchData" />
          </el-tab-pane>
          <el-tab-pane label="联系信息" name="contact">
            <ContactCard :data="settingsData" @refresh="fetchData" />
          </el-tab-pane>
          <el-tab-pane label="服务商与模型配置" name="provider">
            <ProviderCard />
          </el-tab-pane>
          <el-tab-pane label="高考系数设置" name="gaokao">
            <GaokaoCoefCard :data="settingsData" @refresh="fetchData" />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- 品牌装饰：枫叶水印 -->
    <div class="brand-watermark brand-watermark-1"></div>
    <div class="brand-watermark brand-watermark-2"></div>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(255, 247, 237, 0.6) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 247, 237, 0.3) 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.settings-container {
  max-width: 960px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Tabs 卡片容器 */
.settings-tabs-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.settings-tabs-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06);
}

.settings-tabs-card :deep(.el-card__body) {
  padding: 0;
}

/* Tabs 样式 */
.settings-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(249, 115, 22, 0.12);
}

.settings-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.settings-tabs :deep(.el-tabs__item) {
  height: 52px;
  line-height: 52px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.25s ease;
  position: relative;
}

.settings-tabs :deep(.el-tabs__item:hover) {
  color: #F97316;
}

.settings-tabs :deep(.el-tabs__item.is-active) {
  color: #F97316;
  font-weight: 600;
}

.settings-tabs :deep(.el-tabs__item.is-active::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: linear-gradient(90deg, #F97316, #FB923C);
  border-radius: 3px 3px 0 0;
}

.settings-tabs :deep(.el-tabs__content) {
  padding: 24px;
}

/* 品牌装饰：枫叶水印 */
.brand-watermark {
  position: absolute;
  width: 300px;
  height: 300px;
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
}

.brand-watermark-1 {
  top: -50px;
  right: -50px;
  background-image: url('@/assets/images/logo-main.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.brand-watermark-2 {
  bottom: -80px;
  left: -80px;
  background-image: url('@/assets/images/logo-main.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transform: rotate(15deg);
}
</style>
