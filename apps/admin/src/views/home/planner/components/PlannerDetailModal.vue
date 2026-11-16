<script setup lang="ts">
/**
 * 规划师 - 详情弹窗（按分区展示）
 */
import { computed } from 'vue'
import type { PlannerDetailVO } from '@/types/home/planner'
import { SERVICE_TARGET_TONE } from '../../constants'

const props = defineProps<{
  visible: boolean
  detailData: PlannerDetailVO | null
  formLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const targetTone = computed(() => {
  const key = props.detailData?.serviceTarget || ''
  return SERVICE_TARGET_TONE[key] || 'tone-default'
})
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="规划师详情"
    width="900px"
    top="6vh"
    class="detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="detail-content">
      <template v-if="detailData">
        <!-- 概览头部 -->
        <div class="detail-hero">
          <el-image
            v-if="detailData.avatarUrl"
            :src="detailData.avatarUrl"
            :preview-src-list="[detailData.avatarUrl]"
            preview-teleported
            fit="cover"
            class="hero-avatar"
          />
          <div v-else class="hero-avatar hero-fallback">{{ detailData.name?.slice(0, 1) || '?' }}</div>
          <div class="hero-info">
            <div class="hero-name-row">
              <span class="hero-name">{{ detailData.name }}</span>
              <span class="target-pill" :class="targetTone">{{ detailData.serviceTarget }}</span>
              <span
                class="status-pill"
                :class="detailData.status === 1 ? 'status-on' : 'status-off'"
              >
                {{ detailData.status === 1 ? '在线' : '已下线' }}
              </span>
            </div>
            <div class="hero-meta">
              <span v-if="detailData.position">职位：{{ detailData.position }}</span>
              <span v-if="detailData.province">省份：{{ detailData.province }}</span>
              <span v-if="detailData.teacherUsername">绑定账号：{{ detailData.teacherUsername }}</span>
              <span>排序：{{ detailData.sortOrder }}</span>
            </div>
          </div>
        </div>

        <el-tabs model-value="basic" class="detail-tabs">
          <!-- 基础信息 -->
          <el-tab-pane label="基础信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
              <el-descriptions-item label="姓名">{{ detailData.name }}</el-descriptions-item>
              <el-descriptions-item label="服务对象">{{ detailData.serviceTarget }}</el-descriptions-item>
              <el-descriptions-item label="职位">{{ detailData.position || '-' }}</el-descriptions-item>
              <el-descriptions-item label="省份">{{ detailData.province || '-' }}</el-descriptions-item>
              <el-descriptions-item label="绑定账号">{{ detailData.teacherUsername || '-' }}</el-descriptions-item>
              <el-descriptions-item label="排序值">{{ detailData.sortOrder }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <span class="status-pill" :class="detailData.status === 1 ? 'status-on' : 'status-off'">
                  {{ detailData.status === 1 ? '在线' : '已下线' }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <!-- 展示文案 -->
          <el-tab-pane label="展示文案" name="display">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="列表描述">{{ detailData.listDesc || '-' }}</el-descriptions-item>
              <el-descriptions-item label="列表标签">
                <div v-if="detailData.listTags && detailData.listTags.length" class="tag-row">
                  <span v-for="tag in detailData.listTags" :key="tag" class="tag-pill">{{ tag }}</span>
                </div>
                <span v-else class="dim-text">-</span>
              </el-descriptions-item>
              <el-descriptions-item label="从业年限">{{ detailData.workYears || '-' }}</el-descriptions-item>
              <el-descriptions-item label="服务考生">{{ detailData.servedCount || '-' }}</el-descriptions-item>
              <el-descriptions-item label="初稿时效">{{ detailData.draftSla || '-' }}</el-descriptions-item>
              <el-descriptions-item label="认证描述">{{ detailData.certDesc || '-' }}</el-descriptions-item>
              <el-descriptions-item label="详情介绍">
                <div class="text-block">{{ detailData.description || '-' }}</div>
              </el-descriptions-item>
              <el-descriptions-item label="详情标签">
                <div v-if="detailData.detailTags && detailData.detailTags.length" class="tag-row">
                  <span v-for="tag in detailData.detailTags" :key="tag" class="tag-pill tag-pill-green">{{ tag }}</span>
                </div>
                <span v-else class="dim-text">-</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <!-- 服务内容 -->
          <el-tab-pane label="服务内容" name="services">
            <div v-if="detailData.services && detailData.services.length" class="service-list">
              <div v-for="(item, index) in detailData.services" :key="index" class="service-item">
                <div class="service-head">
                  <span class="service-index">{{ index + 1 }}</span>
                  <span class="service-title">{{ item.title }}</span>
                </div>
                <p class="service-content">{{ item.content }}</p>
              </div>
            </div>
            <el-empty v-else description="暂无服务内容" :image-size="80" />
          </el-tab-pane>

          <!-- 联系方式 -->
          <el-tab-pane label="联系方式" name="contact">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="邮箱">{{ detailData.email || '-' }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ detailData.phone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="地址">{{ detailData.address || '-' }}</el-descriptions-item>
              <el-descriptions-item label="微信二维码">
                <el-image
                  v-if="detailData.wechatQrcodeUrl"
                  :src="detailData.wechatQrcodeUrl"
                  :preview-src-list="[detailData.wechatQrcodeUrl]"
                  preview-teleported
                  fit="contain"
                  class="qrcode-img"
                />
                <span v-else class="dim-text">-</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>

    <template #footer>
      <button type="button" class="close-btn" @click="handleClose">关闭</button>
    </template>
  </el-dialog>
</template>

<style scoped>
.detail-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}
.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}
.detail-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 68vh;
  overflow-y: auto;
}
.detail-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

/* 概览头部 */
.detail-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.05), rgba(251, 146, 60, 0.09));
  border: 1px solid rgba(249, 115, 22, 0.12);
  border-radius: 12px;
}

.hero-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.18);
  object-fit: cover;
  flex-shrink: 0;
}
.hero-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 146, 60, 0.22));
  color: #C2410C;
  font-size: 24px;
  font-weight: 600;
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.hero-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.hero-name {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #6b7280;
}

.detail-tabs :deep(.el-tabs__header) { margin-bottom: 16px; }
.detail-tabs :deep(.el-tabs__item) {
  font-weight: 500;
  color: #6b7280;
}
.detail-tabs :deep(.el-tabs__item.is-active) {
  color: #C2410C;
  font-weight: 600;
}
.detail-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, #F97316, #FB923C);
}
.detail-tabs :deep(.el-tabs__nav-wrap::after) { background-color: #f3f4f6; }

.detail-content :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}
.detail-content :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #374151;
  background: rgba(249, 115, 22, 0.06) !important;
  width: 110px;
}
.detail-content :deep(.el-descriptions__content) { color: #1f2937; }
.detail-content :deep(.el-descriptions__cell) { border-color: rgba(249, 115, 22, 0.1); }
.detail-content :deep(.el-descriptions__body) {
  border-radius: 8px;
  overflow: hidden;
}

.dim-text {
  font-size: 13px;
  color: #9ca3af;
}

.text-block {
  max-height: 160px;
  overflow-y: auto;
  padding: 10px;
  background: rgba(249, 115, 22, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(249, 115, 22, 0.08);
  line-height: 1.7;
  font-size: 14px;
  color: #374151;
  white-space: pre-wrap;
}

.target-pill,
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}
.tone-green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.15));
  color: #047857;
  border-color: rgba(16, 185, 129, 0.25);
}
.tone-indigo {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(129, 140, 248, 0.15));
  color: #4338ca;
  border-color: rgba(99, 102, 241, 0.25);
}
.tone-default {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
}
.status-on {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.15));
  color: #047857;
  border-color: rgba(16, 185, 129, 0.25);
}
.status-off {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}
.tag-pill-green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.15));
  color: #047857;
  border-color: rgba(16, 185, 129, 0.25);
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.service-item {
  padding: 14px 16px;
  background: rgba(249, 115, 22, 0.03);
  border: 1px solid rgba(249, 115, 22, 0.12);
  border-radius: 12px;
}
.service-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.service-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}
.service-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}
.service-content {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
  white-space: pre-wrap;
}

.qrcode-img {
  width: 96px;
  height: 96px;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 8px;
}

.close-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.close-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.close-btn:active { transform: translateY(0); }
</style>
