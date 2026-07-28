<script setup lang="ts">
import { ref, watch } from 'vue'
import { getWelfareDetail } from '@/api/employment/welfare'
import type { WelfareDetailVO } from '@/types/employment/welfare'

const props = defineProps<{ visible: boolean; currentId: string | null }>()
const emit = defineEmits<{ 'update:visible': [val: boolean] }>()

const loading = ref(false)
const detail = ref<WelfareDetailVO | null>(null)
const statusTag: Record<string, string> = { '招聘中': 'success', '已结束': 'info', '即将开始': 'warning' }

watch(() => props.visible, async (val) => {
  if (val && props.currentId) {
    loading.value = true
    try { const res = await getWelfareDetail(props.currentId); if (res.data.code === 200) detail.value = res.data.data } catch { /* ignore */ }
    loading.value = false
  } else { detail.value = null }
})
</script>

<template>
  <el-dialog :model-value="visible" title="公益性岗位详情" width="1000px" :close-on-click-modal="false" @update:model-value="emit('update:visible', $event)">
    <div v-loading="loading">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="开发单位">{{ detail.developingUnit }}</el-descriptions-item>
        <el-descriptions-item label="用工单位">{{ detail.employingUnit || '-' }}</el-descriptions-item>
        <el-descriptions-item label="岗位名称" :span="2">{{ detail.positionName }}</el-descriptions-item>
        <el-descriptions-item label="岗位类别">{{ detail.positionCategory }}</el-descriptions-item>
        <el-descriptions-item label="工作内容" :span="2">{{ detail.workContent || '-' }}</el-descriptions-item>
        <el-descriptions-item label="省份">{{ detail.province }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ detail.city }}</el-descriptions-item>
        <el-descriptions-item label="区域">{{ detail.district || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工作地点" :span="2">{{ detail.workLocation || '-' }}</el-descriptions-item>
        <el-descriptions-item label="面向人群">{{ (detail.targetGroup || []).join('、') || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学历要求">{{ detail.educationRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="年龄范围">{{ detail.ageRange || '-' }}</el-descriptions-item>
        <el-descriptions-item label="身体条件">{{ detail.healthRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="招聘人数">{{ detail.recruitmentCount ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="户籍要求">{{ detail.householdRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="困难认定">{{ detail.employmentDifficultyCert ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="其他要求" :span="2">{{ detail.otherRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="合同期限">{{ detail.contractPeriod || '-' }}</el-descriptions-item>
        <el-descriptions-item label="可续期">{{ detail.isRenewable ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="最长服务年限">{{ detail.maxServiceYears ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="月工资">{{ detail.monthlySalary || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工资来源">{{ detail.salarySource || '-' }}</el-descriptions-item>
        <el-descriptions-item label="补贴标准">{{ detail.subsidyStandard || '-' }}</el-descriptions-item>
        <el-descriptions-item label="社保缴纳">{{ detail.socialInsuranceInfo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="其他福利" :span="2">{{ detail.otherBenefits || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工作时间">{{ detail.workSchedule || '-' }}</el-descriptions-item>
        <el-descriptions-item label="是否倒班">{{ detail.isShiftWork ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="报名开始">{{ detail.regStartDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报名截止">{{ detail.regEndDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报名方式">{{ detail.applyMethod || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报名地址" :span="2">{{ detail.applyAddress || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所需材料" :span="2">{{ detail.requiredDocuments || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态"><span class="status-pill" :class="statusTag[detail.positionStatus] || 'info'">{{ detail.positionStatus }}</span></el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detail.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ detail.contactPerson || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="详细说明" :span="2">{{ detail.content || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ detail.sortOrder ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updatedAt }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <button type="button" class="btn-close" @click="emit('update:visible', false)">关闭</button>
    </template>
  </el-dialog>
</template>

<style scoped>
.status-pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.status-pill.success { background: #dcfce7; color: #16a34a; }
.status-pill.warning { background: #fef3c7; color: #d97706; }
.status-pill.info { background: #f3f4f6; color: #6b7280; }
.btn-close { background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; border: none; border-radius: 20px; padding: 8px 24px; font-size: 14px; cursor: pointer; }
.btn-close:hover { filter: brightness(1.1); }
</style>
