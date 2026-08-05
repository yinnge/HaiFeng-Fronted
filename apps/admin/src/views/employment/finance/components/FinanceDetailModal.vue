<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getFinanceDetail } from '@/api/employment/finance'
import type { FinanceDetailVO } from '@/types/employment/finance'

const props = defineProps<{
  visible: boolean
  currentId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const formLoading = ref(false)
const detailData = ref<FinanceDetailVO | null>(null)

const statusPill: Record<string, string> = {
  '招聘中': 'pill-success',
  '已结束': 'pill-gray',
  '即将开始': 'pill-warning',
}

watch(() => props.visible, async (val) => {
  if (val && props.currentId) {
    formLoading.value = true
    try {
      const res = await getFinanceDetail(props.currentId)
      if (res.data.code === 200) {
        detailData.value = res.data.data
      } else {
        ElMessage.error(res.data.msg || '获取详情失败')
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
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
    title="银行/金融岗位详情"
    width="900px"
    class="detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="dialog-content">
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="机构名称">{{ detailData.institutionName }}</el-descriptions-item>
          <el-descriptions-item label="机构大类">{{ detailData.institutionCategory }}</el-descriptions-item>
          <el-descriptions-item label="机构类型">{{ detailData.institutionType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="分支机构">{{ detailData.branchName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="岗位名称">{{ detailData.positionName }}</el-descriptions-item>
          <el-descriptions-item label="岗位类别">{{ detailData.positionCategory || '-' }}</el-descriptions-item>
          <el-descriptions-item label="招聘类型">{{ detailData.recruitmentType }}</el-descriptions-item>
          <el-descriptions-item label="是否远程">{{ detailData.isRemote ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="省份">{{ detailData.province || '-' }}</el-descriptions-item>
          <el-descriptions-item label="城市">{{ detailData.city || '-' }}</el-descriptions-item>
          <el-descriptions-item label="工作地点" :span="2">{{ detailData.workLocation || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学位要求">{{ detailData.degreeRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="专业要求" :span="2">{{ detailData.majorRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="优先专业" :span="2">{{ detailData.majorPreference?.join(', ') || '-' }}</el-descriptions-item>
          <el-descriptions-item label="年龄上限">{{ detailData.ageLimit ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="工作经验">{{ detailData.workExperience || '-' }}</el-descriptions-item>
          <el-descriptions-item label="招聘人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="证书要求" :span="2">{{ detailData.certRequirements?.join(', ') || '-' }}</el-descriptions-item>
          <el-descriptions-item label="语言要求">{{ detailData.languageRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计算机要求">{{ detailData.computerRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="其他要求" :span="2">{{ detailData.otherRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="月薪范围">
            {{ detailData.salaryMin != null ? detailData.salaryMin : '-' }} - {{ detailData.salaryMax != null ? detailData.salaryMax : '-' }} k/月
          </el-descriptions-item>
          <el-descriptions-item label="薪资说明">{{ detailData.salaryText || '-' }}</el-descriptions-item>
          <el-descriptions-item label="福利待遇" :span="2">{{ detailData.benefits || '-' }}</el-descriptions-item>
          <el-descriptions-item label="考试内容" :span="2">{{ detailData.examContent || '-' }}</el-descriptions-item>
          <el-descriptions-item label="考试时间">{{ detailData.examTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="面试轮次">{{ detailData.interviewRounds || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报名开始">{{ detailData.regStartDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报名截止">{{ detailData.regEndDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="网申链接" :span="2">
            <el-link v-if="detailData.applyLink" type="primary" :href="detailData.applyLink" target="_blank">{{ detailData.applyLink }}</el-link>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <span :class="['pill', statusPill[detailData.positionStatus] || 'pill-gray']">{{ detailData.positionStatus }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ detailData.contactInfo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="详细说明" :span="2">{{ detailData.content || '-' }}</el-descriptions-item>
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

.pill-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(251, 191, 36, 0.12));
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
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
