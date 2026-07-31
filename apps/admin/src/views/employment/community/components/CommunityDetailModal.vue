<script setup lang="ts">
import { ref, watch } from 'vue'
import { getCommunityDetail } from '@/api/employment/community'
import type { CommunityDetailVO } from '@/types/employment/community'

const props = defineProps<{ visible: boolean; currentId: string | null }>()
const emit = defineEmits<{ 'update:visible': [val: boolean] }>()

const loading = ref(false)
const detail = ref<CommunityDetailVO | null>(null)
const statusTag: Record<string, string> = { '招聘中': 'success', '已结束': 'info', '即将开始': 'warning' }

watch(() => props.visible, async (val) => {
  if (val && props.currentId) {
    loading.value = true
    try { const res = await getCommunityDetail(props.currentId); if (res.data.code === 200) detail.value = res.data.data } catch { /* ignore */ }
    loading.value = false
  } else { detail.value = null }
})
</script>

<template>
  <el-dialog class="community-dialog" :model-value="visible" title="社区工作者岗位详情" width="1000px" :close-on-click-modal="false" @update:model-value="emit('update:visible', $event)">
    <div v-loading="loading">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="街道办事处乡镇">{{ detail.streetOffice }}</el-descriptions-item>
        <el-descriptions-item label="社区名称">{{ detail.communityName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="主管部门">{{ detail.supervisingDept || '-' }}</el-descriptions-item>
        <el-descriptions-item label="区域">{{ detail.district || '-' }}</el-descriptions-item>
        <el-descriptions-item label="岗位名称" :span="2">{{ detail.positionName }}</el-descriptions-item>
        <el-descriptions-item label="岗位类型">{{ detail.positionType }}</el-descriptions-item>
        <el-descriptions-item label="用工形式">{{ detail.employmentType }}</el-descriptions-item>
        <el-descriptions-item label="省份">{{ detail.province }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ detail.city }}</el-descriptions-item>
        <el-descriptions-item label="工作地点" :span="2">{{ detail.workLocation || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学历要求">{{ detail.educationRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="年龄上限">{{ detail.ageLimit ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="招聘人数">{{ detail.recruitmentCount ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="专业要求" :span="2">{{ detail.majorRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="户籍要求">{{ detail.householdRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="政治面貌">{{ detail.politicalStatus || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工作经验">{{ detail.workExperience || '-' }}</el-descriptions-item>
        <el-descriptions-item label="社工证要求">{{ detail.socialWorkCert || '-' }}</el-descriptions-item>
        <el-descriptions-item label="社区经验要求">{{ detail.communityExperience || '-' }}</el-descriptions-item>
        <el-descriptions-item label="居住地要求" :span="2">{{ detail.residenceRequirement || '-' }}</el-descriptions-item>
        <el-descriptions-item label="薪资待遇">{{ detail.salaryRange || '-' }}</el-descriptions-item>
        <el-descriptions-item label="薪资构成">{{ detail.salaryComposition || '-' }}</el-descriptions-item>
        <el-descriptions-item label="福利待遇" :span="2">{{ detail.benefits || '-' }}</el-descriptions-item>
        <el-descriptions-item label="笔试内容" :span="2">{{ detail.examContent || '-' }}</el-descriptions-item>
        <el-descriptions-item label="面试形式">{{ detail.interviewForm || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报名开始">{{ detail.regStartDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报名截止">{{ detail.regEndDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="考试时间">{{ detail.examTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态"><span class="status-pill" :class="statusTag[detail.positionStatus] || 'info'">{{ detail.positionStatus }}</span></el-descriptions-item>
        <el-descriptions-item label="报名链接">
          <el-link v-if="detail.applyLink" type="primary" :href="detail.applyLink" target="_blank">{{ detail.applyLink }}</el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="报名方式">{{ detail.applyMethod || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detail.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报名地址" :span="2">{{ detail.contactAddress || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="详细说明" :span="2">{{ detail.content || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ detail.sortOrder ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updatedAt }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <button type="button" class="exit-btn" @click="emit('update:visible', false)">关闭</button>
    </template>
  </el-dialog>
</template>

<style scoped>
.status-pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.status-pill.success { background: #dcfce7; color: #16a34a; }
.status-pill.warning { background: #fef3c7; color: #d97706; }
.status-pill.info { background: #f3f4f6; color: #6b7280; }
.community-dialog :deep(.el-dialog) { border-radius: 12px; overflow: hidden; }
.community-dialog :deep(.el-dialog__header) { border-bottom: 2px solid rgba(249,115,22,0.15); padding: 20px 24px; margin: 0; }
.community-dialog :deep(.el-dialog__title) { font-size: 16px; font-weight: 600; color: #1f2937; }
.community-dialog :deep(.el-dialog__body) { padding: 24px; }
.community-dialog :deep(.el-dialog__footer) { border-top: 1px solid #f3f4f6; padding: 16px 24px; }
.community-dialog :deep(.el-descriptions__label) { font-weight: 600; color: #374151; background: rgba(249, 115, 22, 0.06) !important; }
.community-dialog :deep(.el-descriptions__content) { color: #1f2937; }
.community-dialog :deep(.el-descriptions__cell) { border-color: rgba(249, 115, 22, 0.1); }
.community-dialog :deep(.el-descriptions__body) { border-radius: 8px; overflow: hidden; }
.exit-btn { display: inline-flex; align-items: center; padding: 8px 20px; background: #fff; color: #6b7280; border: 1px solid #d1d5db; border-radius: 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all .25s ease; }
.exit-btn:hover { color: #374151; border-color: #9ca3af; background: #f9fafb; }
</style>
