<script setup lang="ts">
import type { PlannerDetailVO } from '@/types/home/planner'

defineProps<{
  visible: boolean
  detailData: PlannerDetailVO | null
  formLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'close'): void
}>()

const statusLabel = (status: number) => (status === 1 ? '展示' : '下架')

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="规划师详情"
    width="700px"
    class="detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="detail-content">
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID" :span="1">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item label="职位">{{ detailData.position || '-' }}</el-descriptions-item>
          <el-descriptions-item label="地区">
            <span v-if="detailData.region" class="region-pill">{{ detailData.region }}</span>
            <span v-else class="dim-text">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态" :span="1">
            <span class="status-pill" :class="detailData.status === 1 ? 'status-on' : 'status-off'">
              {{ statusLabel(detailData.status) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="排序">{{ detailData.sortOrder }}</el-descriptions-item>
          <el-descriptions-item label="头像" :span="2" v-if="detailData.avatar">
            <div class="avatar-box">
              <el-image :src="detailData.avatar" class="avatar-img" fit="cover" />
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="专长" :span="2">{{ detailData.specialty || '-' }}</el-descriptions-item>
          <el-descriptions-item label="抖音名称">{{ detailData.douyinName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="抖音链接" v-if="detailData.douyinUrl">
            <el-link :href="detailData.douyinUrl" target="_blank" class="douyin-link">{{ detailData.douyinUrl }}</el-link>
          </el-descriptions-item>
          <el-descriptions-item label="个人简介" :span="2">
            <div class="text-block">{{ detailData.personalDescription || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="工作经历" :span="2">
            <div class="text-block">{{ detailData.experienceJob || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="成就" :span="2">
            <div v-if="detailData.achievements && detailData.achievements.length" class="tag-list">
              <span v-for="(item, i) in detailData.achievements" :key="i" class="tag-pill achievement-tag">{{ item }}</span>
            </div>
            <span v-else class="dim-text">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="擅长领域" :span="2">
            <div v-if="detailData.expertiseAreas && detailData.expertiseAreas.length" class="tag-list">
              <span v-for="(item, i) in detailData.expertiseAreas" :key="i" class="tag-pill expertise-tag">{{ item }}</span>
            </div>
            <span v-else class="dim-text">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">{{ detailData.updatedAt }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </div>
    <template #footer>
      <button type="button" class="close-btn" @click="handleClose">关闭</button>
    </template>
  </el-dialog>
</template>

<style scoped>
.detail-dialog :deep(.el-dialog) { border-radius: 12px; overflow: hidden; }
.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px; margin: 0;
}
.detail-dialog :deep(.el-dialog__title) { font-size: 16px; font-weight: 600; color: #1f2937; }
.detail-dialog :deep(.el-dialog__body) { padding: 24px; }
.detail-dialog :deep(.el-dialog__footer) { border-top: 1px solid #f3f4f6; padding: 16px 24px; }

.detail-content :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}
.detail-content :deep(.el-descriptions__label) {
  font-weight: 600; color: #374151;
  background: rgba(249, 115, 22, 0.06) !important;
}
.detail-content :deep(.el-descriptions__content) { color: #1f2937; }
.detail-content :deep(.el-descriptions__cell) { border-color: rgba(249, 115, 22, 0.1); }
.detail-content :deep(.el-descriptions__body) { border-radius: 8px; overflow: hidden; }

.dim-text { font-size: 13px; color: #9ca3af; }

.text-block {
  max-height: 120px; overflow-y: auto;
  padding: 10px; background: rgba(249, 115, 22, 0.02);
  border-radius: 8px; border: 1px solid rgba(249, 115, 22, 0.08);
  line-height: 1.7; font-size: 14px; color: #374151;
}

.avatar-box {
  display: flex; align-items: center; gap: 12px;
}
.avatar-img {
  width: 72px; height: 72px; border-radius: 50%;
  border: 2px solid rgba(249, 115, 22, 0.15);
}

.region-pill {
  display: inline-flex; align-items: center;
  padding: 2px 10px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(96, 165, 250, 0.12));
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  font-size: 12px; font-weight: 500;
}

.status-pill {
  display: inline-flex; align-items: center;
  padding: 3px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 500; border: 1px solid transparent;
}
.status-on {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C; border-color: rgba(249, 115, 22, 0.2);
}
.status-off { background: #f3f4f6; color: #6b7280; border-color: #e5e7eb; }

.douyin-link { color: #F97316; }

.tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-pill {
  display: inline-flex; align-items: center;
  padding: 3px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 500; border: 1px solid transparent;
}
.achievement-tag {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C; border-color: rgba(249, 115, 22, 0.2);
}
.expertise-tag {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669; border-color: rgba(16, 185, 129, 0.2);
}

.close-btn {
  display: inline-flex; align-items: center;
  padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff; border: none; border-radius: 20px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.close-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
.close-btn:active { transform: translateY(0); }
</style>
