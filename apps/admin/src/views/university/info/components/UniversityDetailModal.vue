<script setup lang="ts">
import type { UniversityDetailVO } from '@/types/university/info'

defineProps<{
  visible: boolean
  detailData: UniversityDetailVO | null
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
    title="院校详情"
    width="850px"
    class="detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="detail-content">
      <template v-if="detailData">
        <el-tabs class="detail-tabs">
          <!-- 基础信息 Tab -->
          <el-tab-pane label="基础信息">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
              <el-descriptions-item label="院校名称">{{ detailData.name }}</el-descriptions-item>
              <el-descriptions-item label="英文名称">{{ detailData.nameEn }}</el-descriptions-item>
              <el-descriptions-item label="省份">{{ detailData.provinceName }}</el-descriptions-item>
              <el-descriptions-item label="城市">{{ detailData.cityName }}</el-descriptions-item>
              <el-descriptions-item label="地区">{{ detailData.region }}</el-descriptions-item>
              <el-descriptions-item label="院校类别">
                <span class="tag-pill">{{ detailData.category }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="专业数量">{{ detailData.majorCount }}</el-descriptions-item>
              <el-descriptions-item label="办学层次">{{ detailData.educationLevel || '-' }}</el-descriptions-item>
              <el-descriptions-item label="院校性质">{{ detailData.nature || '-' }}</el-descriptions-item>
              <el-descriptions-item label="推免率">
                <template v-if="detailData.recommendationRate != null">
                  <span class="value-highlight">{{ detailData.recommendationRate }}%</span>
                  {{ detailData.recommendationYear ? ' (' + detailData.recommendationYear + '年)' : '' }}
                </template>
                <span v-else class="dim-text">-</span>
              </el-descriptions-item>
              <el-descriptions-item label="博士点">
                <span :class="detailData.hasDoctorate ? 'value-true' : 'value-false'">
                  {{ detailData.hasDoctorate ? '有' : '无' }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="硕士点">
                <span :class="detailData.hasMaster ? 'value-true' : 'value-false'">
                  {{ detailData.hasMaster ? '有' : '无' }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="隶属部门">{{ detailData.department || '-' }}</el-descriptions-item>
              <el-descriptions-item label="院校标签" :span="2">
                <div v-if="detailData.tags && detailData.tags.length" class="tag-list">
                  <span v-for="tag in detailData.tags" :key="tag" class="tag-pill">{{ tag }}</span>
                </div>
                <span v-else class="dim-text">-</span>
              </el-descriptions-item>
              <el-descriptions-item label="知名联盟">{{ detailData.famousUnion || '-' }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <span class="status-pill" :class="detailData.status === 1 ? 'status-on' : 'status-off'">
                  {{ statusLabel(detailData.status) }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="院校简介" :span="2">
                <div class="text-block">{{ detailData.introduction || '-' }}</div>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <!-- 详细信息 Tab -->
          <el-tab-pane label="详细信息">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="地址">{{ detailData.address || '-' }}</el-descriptions-item>
              <el-descriptions-item label="招生电话">{{ detailData.admissionPhone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="官方网站">
                <el-link v-if="detailData.website" :href="detailData.website" target="_blank" class="link-text">
                  {{ detailData.website }}
                </el-link>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="历史组分数线">
                <span v-if="detailData.historyGroupScore != null" class="value-highlight">{{ detailData.historyGroupScore }}</span>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="物理组分数线">
                <span v-if="detailData.scienceGroupScore != null" class="value-highlight">{{ detailData.scienceGroupScore }}</span>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="出国比例">{{ detailData.abroadRate || '-' }}</el-descriptions-item>
              <el-descriptions-item label="男女比例">{{ detailData.genderRatio || '-' }}</el-descriptions-item>
              <el-descriptions-item label="软科排名">{{ detailData.rankings?.ruanke ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="校友会排名">{{ detailData.rankings?.xiaoyouhui ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="武书连排名">{{ detailData.rankings?.wushulian ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="QS排名">{{ detailData.rankings?.qs ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="USNEWS排名">{{ detailData.rankings?.usnews ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="轮播图片" :span="2">
                <template v-if="detailData.carouselImages && detailData.carouselImages.length">
                  <el-image
                    v-for="(img, idx) in detailData.carouselImages"
                    :key="idx"
                    :src="img"
                    class="carousel-thumb"
                    :preview-src-list="detailData.carouselImages"
                    preview-teleported
                  />
                </template>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="院校详细介绍" :span="2">
                <div class="text-block">{{ detailData.detailIntroduction || '-' }}</div>
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
.detail-dialog :deep(.el-dialog) { border-radius: 12px; overflow: hidden; }
.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px; margin: 0;
}
.detail-dialog :deep(.el-dialog__title) { font-size: 16px; font-weight: 600; color: #1f2937; }
.detail-dialog :deep(.el-dialog__body) { padding: 24px; }
.detail-dialog :deep(.el-dialog__footer) { border-top: 1px solid #f3f4f6; padding: 16px 24px; }

.detail-tabs :deep(.el-tabs__header) { margin-bottom: 20px; }
.detail-tabs :deep(.el-tabs__item.is-active) { color: #F97316; font-weight: 600; }
.detail-tabs :deep(.el-tabs__active-bar) { background: #F97316; }
.detail-tabs :deep(.el-tabs__item:hover) { color: #F97316; }

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
.value-highlight { font-size: 15px; font-weight: 700; color: #F97316; }
.value-true { color: #059669; font-weight: 600; }
.value-false { color: #9ca3af; }

.text-block {
  max-height: 140px; overflow-y: auto; padding: 10px;
  background: rgba(249, 115, 22, 0.02); border-radius: 8px;
  border: 1px solid rgba(249, 115, 22, 0.08);
  line-height: 1.7; font-size: 14px; color: #374151;
}

.tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-pill {
  display: inline-flex; align-items: center; padding: 3px 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C; border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px; font-size: 12px; font-weight: 500;
}
.status-pill {
  display: inline-flex; align-items: center; padding: 3px 12px;
  border-radius: 20px; font-size: 12px; font-weight: 500; border: 1px solid transparent;
}
.status-on {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C; border-color: rgba(249, 115, 22, 0.2);
}
.status-off { background: #f3f4f6; color: #6b7280; border-color: #e5e7eb; }
.link-text { color: #F97316; }

.carousel-thumb {
  width: 72px; height: 54px; margin-right: 8px; cursor: pointer;
  border-radius: 6px; border: 1px solid rgba(249, 115, 22, 0.1);
  object-fit: cover; transition: all 0.2s ease;
}
.carousel-thumb:hover { border-color: #F97316; transform: scale(1.05); }

.close-btn {
  display: inline-flex; align-items: center; padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C); color: #fff;
  border: none; border-radius: 20px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.close-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
.close-btn:active { transform: translateY(0); }
</style>
