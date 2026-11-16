<script setup lang="ts">
/**
 * 培训机构 - 详情弹窗（按分区展示）
 */
import { computed } from 'vue'
import type { InstitutionDetailVO } from '@/types/home/institution'
import { INSTITUTION_CATEGORY_TONE } from '../../constants'

const props = defineProps<{
  visible: boolean
  detailData: InstitutionDetailVO | null
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

const categoryTone = computed(() => {
  const key = props.detailData?.category || ''
  return INSTITUTION_CATEGORY_TONE[key] || 'tone-default'
})
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="培训机构详情"
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
          <div class="hero-logo">{{ detailData.name?.slice(0, 1) || '?' }}</div>
          <div class="hero-info">
            <div class="hero-name-row">
              <span class="hero-name">{{ detailData.name }}</span>
              <span class="category-pill" :class="categoryTone">{{ detailData.category }}</span>
              <span class="status-pill" :class="detailData.status === 1 ? 'status-on' : 'status-off'">
                {{ detailData.status === 1 ? '上架' : '下架' }}
              </span>
            </div>
            <div class="hero-meta">
              <span>省份：{{ detailData.province }}</span>
              <span v-if="detailData.foundedYear">创办：{{ detailData.foundedYear }}</span>
              <span v-if="detailData.managerUsername">管理账号：{{ detailData.managerUsername }}</span>
              <span>排序：{{ detailData.sortOrder }}</span>
            </div>
          </div>
        </div>

        <el-tabs model-value="basic" class="detail-tabs">
          <!-- 基础信息 -->
          <el-tab-pane label="基础信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
              <el-descriptions-item label="机构名称">{{ detailData.name }}</el-descriptions-item>
              <el-descriptions-item label="机构分类">{{ detailData.category }}</el-descriptions-item>
              <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
              <el-descriptions-item label="创办时间">{{ detailData.foundedYear || '-' }}</el-descriptions-item>
              <el-descriptions-item label="管理账号">{{ detailData.managerUsername || '-' }}</el-descriptions-item>
              <el-descriptions-item label="排序值">{{ detailData.sortOrder }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <span class="status-pill" :class="detailData.status === 1 ? 'status-on' : 'status-off'">
                  {{ detailData.status === 1 ? '上架' : '下架' }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <!-- 展示信息 -->
          <el-tab-pane label="展示信息" name="display">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="机构标签">
                <div v-if="detailData.tags && detailData.tags.length" class="tag-row">
                  <span v-for="tag in detailData.tags" :key="tag" class="tag-pill">{{ tag }}</span>
                </div>
                <span v-else class="dim-text">-</span>
              </el-descriptions-item>
              <el-descriptions-item label="机构简介">
                <div class="text-block">{{ detailData.introduction || '-' }}</div>
              </el-descriptions-item>
              <el-descriptions-item label="主打方向">{{ detailData.mainDirection || '-' }}</el-descriptions-item>
              <el-descriptions-item label="班级规模">{{ detailData.classSize || '-' }}</el-descriptions-item>
              <el-descriptions-item label="师资配置">{{ detailData.teacherConfig || '-' }}</el-descriptions-item>
              <el-descriptions-item label="上课形式">{{ detailData.courseForm || '-' }}</el-descriptions-item>
              <el-descriptions-item label="提示语">{{ detailData.notice || '-' }}</el-descriptions-item>
              <el-descriptions-item label="机构优势">
                <div v-if="detailData.advantages && detailData.advantages.length" class="advantage-list">
                  <span v-for="(item, i) in detailData.advantages" :key="i" class="advantage-item">{{ item }}</span>
                </div>
                <span v-else class="dim-text">-</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <!-- 轮播图 -->
          <el-tab-pane label="轮播图" name="carousel">
            <div v-if="detailData.carouselImages && detailData.carouselImages.length" class="carousel-grid">
              <el-image
                v-for="(url, index) in detailData.carouselImages"
                :key="url"
                :src="url"
                :preview-src-list="detailData.carouselImages"
                :initial-index="index"
                preview-teleported
                fit="cover"
                class="carousel-img"
              />
            </div>
            <el-empty v-else description="暂无轮播图" :image-size="80" />
          </el-tab-pane>

          <!-- 主打班型 -->
          <el-tab-pane label="主打班型" name="classTypes">
            <div v-if="detailData.classTypes && detailData.classTypes.length" class="class-type-list">
              <div v-for="(item, index) in detailData.classTypes" :key="index" class="class-type-item">
                <div class="item-head">
                  <span class="item-index">{{ index + 1 }}</span>
                  <span class="item-title">{{ item.title }}</span>
                  <span v-if="item.tag" class="item-tag">{{ item.tag }}</span>
                </div>
                <p v-if="item.introduction" class="item-intro">{{ item.introduction }}</p>
              </div>
            </div>
            <el-empty v-else description="暂无班型" :image-size="80" />
          </el-tab-pane>

          <!-- 联系方式 -->
          <el-tab-pane label="联系方式" name="contact">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="地址">{{ detailData.address || '-' }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ detailData.email || '-' }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ detailData.phone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="管理账号手机">{{ detailData.managerPhone || '-' }}</el-descriptions-item>
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

.hero-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 146, 60, 0.22));
  border: 2px solid #fff;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.18);
  color: #C2410C;
  font-size: 26px;
  font-weight: 600;
  flex-shrink: 0;
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

.category-pill,
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}
.tone-orange {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.16));
  color: #c2410c;
  border-color: rgba(249, 115, 22, 0.25);
}
.tone-green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.15));
  color: #047857;
  border-color: rgba(16, 185, 129, 0.25);
}
.tone-red {
  background: linear-gradient(135deg, rgba(225, 29, 72, 0.1), rgba(244, 63, 94, 0.15));
  color: #be123c;
  border-color: rgba(225, 29, 72, 0.25);
}
.tone-cyan {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(34, 211, 238, 0.15));
  color: #0e7490;
  border-color: rgba(6, 182, 212, 0.25);
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

.advantage-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.advantage-item {
  position: relative;
  padding-left: 14px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
}
.advantage-item::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #F97316;
}

.carousel-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.carousel-img {
  width: 100%;
  height: 140px;
  border-radius: 10px;
  border: 1px solid rgba(249, 115, 22, 0.12);
  background: #f9fafb;
}

.class-type-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.class-type-item {
  padding: 14px 16px;
  background: rgba(249, 115, 22, 0.03);
  border: 1px solid rgba(249, 115, 22, 0.12);
  border-radius: 12px;
}
.item-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.item-index {
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
.item-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}
.item-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}
.item-intro {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
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
