<script setup lang="ts">
import { ref, watch } from 'vue'
import { getGrassrootsDetail } from '@/api/employment/grassroots'
import type { GrassrootsDetailVO } from '@/types/employment/grassroots'

const props = defineProps<{ visible: boolean; currentId: string | null }>()
const emit = defineEmits<{ 'update:visible': [val: boolean] }>()

const loading = ref(false)
const detail = ref<GrassrootsDetailVO | null>(null)
const statusTag: Record<string, string> = { '招募中': 'success', '已结束': 'info', '即将开始': 'warning' }

watch(() => props.visible, async (val) => {
  if (val && props.currentId) {
    loading.value = true
    try {
      const res = await getGrassrootsDetail(props.currentId)
      if (res.data.code === 200) detail.value = res.data.data
    } catch { /* ignore */ }
    loading.value = false
  } else {
    detail.value = null
  }
})
</script>

<template>
  <el-dialog :model-value="visible" title="基层服务项目详情" width="1000px" :close-on-click-modal="false" class="grassroots-dialog" @update:model-value="emit('update:visible', $event)">
    <div v-loading="loading">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="项目类型">{{ detail.projectType }}</el-descriptions-item>
        <el-descriptions-item label="招募年份">{{ detail.year }}</el-descriptions-item>
        <el-descriptions-item label="岗位名称" :span="2">{{ detail.positionName }}</el-descriptions-item>
        <el-descriptions-item label="服务类型">{{ detail.serviceType }}</el-descriptions-item>
        <el-descriptions-item label="组织单位">{{ detail.organizingDept || '-' }}</el-descriptions-item>
        <el-descriptions-item label="服务单位">{{ detail.serviceUnit || '-' }}</el-descriptions-item>
        <el-descriptions-item label="省份">{{ detail.province }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ detail.city || '-' }}</el-descriptions-item>
        <el-descriptions-item label="区域">{{ detail.county || '-' }}</el-descriptions-item>
        <el-descriptions-item label="乡镇/街道">{{ detail.township || '-' }}</el-descriptions-item>
        <el-descriptions-item label="服务期限">{{ detail.servicePeriod || '-' }}</el-descriptions-item>
        <el-descriptions-item label="服务开始日期">{{ detail.serviceStartDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="服务结束日期">{{ detail.serviceEndDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学历要求">{{ detail.educationRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="专业要求" :span="2">{{ detail.majorRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="年龄上限">{{ detail.ageLimit ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="招募人数">{{ detail.recruitmentCount ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="毕业年份要求">{{ detail.gradYearRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="户籍要求">{{ detail.householdRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="政治面貌">{{ detail.politicalStatus || '-' }}</el-descriptions-item>
        <el-descriptions-item label="其他要求" :span="2">{{ detail.otherRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="笔试内容" :span="2">{{ detail.examContent || '-' }}</el-descriptions-item>
        <el-descriptions-item label="考试时间">{{ detail.examTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="面试形式">{{ detail.interviewForm || '-' }}</el-descriptions-item>
        <el-descriptions-item label="月补贴标准">{{ detail.monthlySubsidy || '-' }}</el-descriptions-item>
        <el-descriptions-item label="社保缴纳">{{ detail.socialInsurance || '-' }}</el-descriptions-item>
        <el-descriptions-item label="住房安排">{{ detail.housingInfo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="其他待遇" :span="2">{{ detail.otherBenefits || '-' }}</el-descriptions-item>
        <el-descriptions-item label="期满政策" :span="2">{{ detail.afterServicePolicy || '-' }}</el-descriptions-item>
        <el-descriptions-item label="可定向考公">{{ detail.canTransferToCivil ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="可转事业编">{{ detail.canTransferToInstitution ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="考试加分">{{ detail.examBonusPoints || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学费补偿">{{ detail.tuitionCompensation || '-' }}</el-descriptions-item>
        <el-descriptions-item label="考研加分">{{ detail.postgradBonus || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报名开始">{{ detail.regStartDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报名截止">{{ detail.regEndDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报名链接">
          <el-link v-if="detail.applyLink" type="primary" :href="detail.applyLink" target="_blank">{{ detail.applyLink }}</el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <span class="status-pill" :class="statusTag[detail.positionStatus] || 'info'">{{ detail.positionStatus }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detail.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="详细说明" :span="2">{{ detail.content || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ detail.sortOrder ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updatedAt }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="exit-btn" @click="emit('update:visible', false)">关闭</button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.status-pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.status-pill.success { background: #dcfce7; color: #16a34a; }
.status-pill.warning { background: #fef3c7; color: #d97706; }
.status-pill.info { background: #f3f4f6; color: #6b7280; }
.grassroots-dialog :deep(.el-dialog) { border-radius: 12px; overflow: hidden; }
.grassroots-dialog :deep(.el-dialog__header) { border-bottom: 2px solid rgba(249,115,22,0.15); padding: 20px 24px; margin: 0; }
.grassroots-dialog :deep(.el-dialog__title) { font-size: 16px; font-weight: 600; color: #1f2937; }
.grassroots-dialog :deep(.el-dialog__body) { padding: 24px; }
.grassroots-dialog :deep(.el-dialog__footer) { border-top: 1px solid #f3f4f6; padding: 16px 24px; }
.grassroots-dialog :deep(.el-input__wrapper), .grassroots-dialog :deep(.el-textarea__inner), .grassroots-dialog :deep(.el-select__wrapper) { border-radius: 8px; transition: all .25s ease; }
.grassroots-dialog :deep(.el-input__wrapper:hover), .grassroots-dialog :deep(.el-textarea__inner:hover), .grassroots-dialog :deep(.el-select__wrapper:hover) { box-shadow: 0 0 0 1px rgba(249,115,22,0.3) inset; }
.grassroots-dialog :deep(.el-input__wrapper.is-focus), .grassroots-dialog :deep(.el-textarea__inner:focus), .grassroots-dialog :deep(.el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #F97316 inset; }
.grassroots-dialog :deep(.el-radio__input.is-checked .el-radio__inner) { background-color: #F97316; border-color: #F97316; }
.grassroots-dialog :deep(.el-radio__input.is-checked + .el-radio__label) { color: #F97316; }
.grassroots-dialog :deep(.el-descriptions__label) { font-weight: 600; color: #374151; background: rgba(249, 115, 22, 0.06) !important; }
.grassroots-dialog :deep(.el-descriptions__content) { color: #1f2937; }
.grassroots-dialog :deep(.el-descriptions__cell) { border-color: rgba(249, 115, 22, 0.1); }
.grassroots-dialog :deep(.el-descriptions__body) { border-radius: 8px; overflow: hidden; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; }
.exit-btn { display: inline-flex; align-items: center; padding: 8px 20px; background: #fff; color: #6b7280; border: 1px solid #d1d5db; border-radius: 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all .25s ease; }
.exit-btn:hover { color: #374151; border-color: #9ca3af; background: #f9fafb; }
</style>
