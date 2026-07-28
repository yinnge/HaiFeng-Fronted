<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getInstitutionDetail } from '@/api/employment/institution'
import type { InstitutionDetailVO } from '@/types/employment/institution'

const props = defineProps<{
  visible: boolean
  currentId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const formLoading = ref(false)
const detailData = ref<InstitutionDetailVO | null>(null)

const positionStatusPill: Record<string, string> = {
  '在招': 'pill-success',
  '已结束': 'pill-gray',
  '未发布': 'pill-gray',
}

watch(() => props.visible, async (val) => {
  if (val && props.currentId) {
    formLoading.value = true
    try {
      const res = await getInstitutionDetail(props.currentId)
      if (res.data.code === 200) {
        detailData.value = res.data.data
      } else {
        ElMessage.error(res.data.msg || '获取详情失败')
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
  }
})

const handleClose = () => { emit('update:visible', false) }
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="事业单位职位详情"
    width="900px"
    class="detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="dialog-content">
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="职位名称">{{ detailData.positionName }}</el-descriptions-item>
          <el-descriptions-item label="主管单位">{{ detailData.supervisingDept }}</el-descriptions-item>
          <el-descriptions-item label="事业单位">{{ detailData.institution }}</el-descriptions-item>
          <el-descriptions-item label="工作地点">{{ detailData.workLocation || '-' }}</el-descriptions-item>
          <el-descriptions-item label="省份">{{ detailData.province || '-' }}</el-descriptions-item>
          <el-descriptions-item label="考试类别">{{ detailData.examCategory || '-' }}</el-descriptions-item>
          <el-descriptions-item label="职位类型">{{ detailData.positionType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="职位分类">{{ detailData.subCategory || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学位要求">{{ detailData.degreeRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="年龄限制">{{ detailData.ageLimit ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="招录人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="薪资范围">{{ detailData.salaryRange || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报名截止">{{ detailData.regDeadline || '-' }}</el-descriptions-item>
          <el-descriptions-item label="专业要求" :span="2">
            <template v-if="detailData.majorRequirements && detailData.majorRequirements.length">
              {{ detailData.majorRequirements.join('、') }}
            </template>
            <template v-else>-</template>
          </el-descriptions-item>
          <el-descriptions-item label="特殊岗位">{{ detailData.specialPosition || '-' }}</el-descriptions-item>
          <el-descriptions-item label="其他要求">{{ detailData.otherRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="其他要求描述" :span="2">{{ detailData.otherRequirementDesc || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注类型">{{ detailData.remarkType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注描述">{{ detailData.remarkDesc || '-' }}</el-descriptions-item>
          <el-descriptions-item label="咨询电话">{{ detailData.consultationPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="监督电话">{{ detailData.supervisionPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="招聘状态">
            <span :class="['pill', positionStatusPill[detailData.positionStatus] || 'pill-gray']">{{ detailData.positionStatus }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="职位标签">{{ detailData.positionTag || '-' }}</el-descriptions-item>
          <el-descriptions-item label="标签文字">{{ detailData.tagText || '-' }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
        </el-descriptions>
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
  max-height: 65vh;
  overflow-y: auto;
}

.detail-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.dialog-content :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}

.dialog-content :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #374151;
  background: rgba(249, 115, 22, 0.06) !important;
}

.dialog-content :deep(.el-descriptions__content) {
  color: #1f2937;
}

.dialog-content :deep(.el-descriptions__cell) {
  border-color: rgba(249, 115, 22, 0.1);
}

.dialog-content :deep(.el-descriptions__body) {
  border-radius: 8px;
  overflow: hidden;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.pill-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.pill-gray {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.close-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
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
</style>
