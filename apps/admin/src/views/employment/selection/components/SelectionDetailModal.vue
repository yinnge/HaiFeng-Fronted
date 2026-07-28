<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getSelectionDetail } from '@/api/employment/selection'
import type { SelectionDetailVO } from '@/types/employment/selection'

const props = defineProps<{
  visible: boolean
  currentId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const formLoading = ref(false)
const detailData = ref<SelectionDetailVO | null>(null)

const positionStatusPill: Record<string, string> = {
  '在招': 'pill-success',
  '已结束': 'pill-gray',
  '未发布': 'pill-gray',
}

watch(() => props.visible, async (val) => {
  if (val && props.currentId) {
    formLoading.value = true
    try {
      const res = await getSelectionDetail(props.currentId)
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
    title="选调生职位详情"
    width="900px"
    class="detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="dialog-content">
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="职位名称">{{ detailData.positionName }}</el-descriptions-item>
          <el-descriptions-item label="选调类型">{{ detailData.selectionType }}</el-descriptions-item>
          <el-descriptions-item label="年份">{{ detailData.year }}</el-descriptions-item>
          <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
          <el-descriptions-item label="组织部门">{{ detailData.organizingDept }}</el-descriptions-item>
          <el-descriptions-item label="用人单位">{{ detailData.targetUnit }}</el-descriptions-item>
          <el-descriptions-item label="工作地点">{{ detailData.workLocation || '-' }}</el-descriptions-item>
          <el-descriptions-item label="培养方向">{{ detailData.trainingDirection || '-' }}</el-descriptions-item>
          <el-descriptions-item label="基层服务年限">{{ detailData.grassrootsServiceYears || '-' }}</el-descriptions-item>
          <el-descriptions-item label="培养计划" :span="2">{{ detailData.trainingPlan || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学位要求">{{ detailData.degreeRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="专业要求" :span="2">{{ detailData.majorRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="专业类别">
            {{ detailData.majorCategories?.length ? detailData.majorCategories.join('、') : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="院校要求">{{ detailData.universityRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="目标院校" :span="2">
            {{ detailData.targetUniversities?.length ? detailData.targetUniversities.join('、') : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="政治面貌">{{ detailData.politicalStatus || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学生干部要求">{{ detailData.studentCadreRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="获奖要求">{{ detailData.awardsRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="年龄限制">{{ detailData.ageLimit ? detailData.ageLimit + ' 周岁' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="招录人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="考试科目">{{ detailData.examSubjects || '-' }}</el-descriptions-item>
          <el-descriptions-item label="面试形式">{{ detailData.interviewForm || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报名开始">{{ detailData.regStartDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报名截止">{{ detailData.regEndDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="考试时间">{{ detailData.examTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="职位状态">
            <span :class="['pill', positionStatusPill[detailData.positionStatus] || 'pill-gray']">{{ detailData.positionStatus }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="报名链接">
            <template v-if="detailData.applyLink">
              <el-link type="primary" :href="detailData.applyLink" target="_blank">{{ detailData.applyLink }}</el-link>
            </template>
            <template v-else>-</template>
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="官方网站">
            <template v-if="detailData.officialLink">
              <el-link type="primary" :href="detailData.officialLink" target="_blank">{{ detailData.officialLink }}</el-link>
            </template>
            <template v-else>-</template>
          </el-descriptions-item>
          <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="内容" :span="2">{{ detailData.content || '-' }}</el-descriptions-item>
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
