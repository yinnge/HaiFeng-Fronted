<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAiBalance } from '@/api/system/provider'
import type { AiBalanceVO } from '@/types/system/provider'

const loading = ref(false)
const balanceList = ref<AiBalanceVO[]>([])

const fetchData = async (refresh = false) => {
  loading.value = true
  try {
    const res = await getAiBalance(refresh)
    if (res.data.code === 200) {
      balanceList.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '查询失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '查询失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="provider-page">
    <!-- 枫叶装饰 -->
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title">AI 厂商管理</div>
      <div class="page-subtitle">查看各 AI 厂商余额及模型配置状态</div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button type="button" class="refresh-btn" @click="fetchData(false)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        刷新
      </button>
      <button type="button" class="force-btn" @click="fetchData(true)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
        强制刷新（跳过缓存）
      </button>
    </div>

    <!-- 卡片列表 -->
    <div class="card-list" v-loading="loading">
      <div v-if="balanceList.length === 0 && !loading" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
        <p>暂未配置 AI 厂商</p>
      </div>

      <div
        v-for="item in balanceList"
        :key="item.providerName"
        class="provider-card"
      >
        <!-- 卡片头部：厂商名 + 状态 + 币种 -->
        <div class="card-header">
          <div class="header-left">
            <span class="provider-name">{{ item.providerName }}</span>
            <span v-if="item.isAvailable" class="status-tag status-available">可用</span>
            <span v-else class="status-tag status-unavailable">不可用</span>
          </div>
          <span class="currency-tag">币种：{{ item.currency }}</span>
        </div>

        <!-- 关联模型标签 -->
        <div class="model-row">
          <span class="field-label">关联模型</span>
          <span
            v-for="model in item.models"
            :key="model"
            class="model-tag"
          >
            {{ model }}
          </span>
        </div>

        <!-- 余额信息：自定义横向药丸标签 + 数值 -->
        <div class="balance-row">
          <div class="balance-item">
            <span class="balance-label">总余额</span>
            <span class="balance-value balance-value-main">
              {{ item.totalBalance != null ? `¥${item.totalBalance}` : '-' }}
            </span>
          </div>
          <div class="balance-item">
            <span class="balance-label">赠送余额</span>
            <span class="balance-value">
              {{ item.grantedBalance != null ? `¥${item.grantedBalance}` : '-' }}
            </span>
          </div>
          <div class="balance-item">
            <span class="balance-label">充值余额</span>
            <span class="balance-value">
              {{ item.toppedUpBalance != null ? `¥${item.toppedUpBalance}` : '-' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== 页面整体 ========== */
.provider-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* 枫叶水印 */
.watermark-left,
.watermark-right {
  position: absolute;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-left {
  top: -60px;
  right: 40px;
  transform: rotate(18deg);
}
.watermark-right {
  bottom: -40px;
  left: 30px;
  transform: rotate(-12deg);
}
.watermark-left img,
.watermark-right img {
  width: 180px;
  height: auto;
}

/* 标题 */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

/* ========== 操作栏 ========== */
.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.refresh-btn,
.force-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.refresh-btn {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.refresh-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.refresh-btn:active {
  transform: translateY(0);
}

.force-btn {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
}
.force-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}
.force-btn:active {
  background: #f3f4f6;
}

/* ========== 空状态 ========== */
.empty-state {
  background: #fff;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  border: 1px dashed #e5e7eb;
}
.empty-state p {
  margin-top: 12px;
  color: #9ca3af;
  font-size: 14px;
}

/* ========== 厂商卡片 ========== */
.provider-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}
.provider-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  transform: translateY(-2px);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.provider-name {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.status-available {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}
.status-unavailable {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.currency-tag {
  font-size: 13px;
  color: #9ca3af;
  background: #f9fafb;
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
}

/* 关联模型行 */
.model-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.field-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  margin-right: 4px;
}
.model-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.model-tag:hover {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 146, 60, 0.2));
}

/* 余额信息行 */
.balance-row {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}
.balance-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.balance-label {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.balance-value {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}
.balance-value-main {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}
</style>
