<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getGrassrootsDetail, updateGrassroots } from '@/api/employment/grassroots'

const props = defineProps<{ visible: boolean; initialData: Record<string, any> }>()
const emit = defineEmits<{ 'update:visible': [val: boolean]; submit: [] }>()

const loading = ref(false)
const activeTab = ref('basic')
const formData = ref<Record<string, any>>({})

const projectTypeOptions = ['三支一扶', '西部计划']
const serviceTypeOptions = ['支教', '支农', '支医', '帮扶乡村振兴', '基础教育', '服务三农', '医疗卫生', '基层青年工作', '基层社会管理', '服务新疆', '服务西藏']
const educationOptions = ['大专', '本科', '硕士', '大专及以上', '本科及以上']
const positionStatusOptions = ['招募中', '已结束', '即将开始']

watch(() => props.visible, (val) => {
  if (val) { activeTab.value = 'basic'; formData.value = { ...props.initialData } }
})

const handleSubmit = async () => {
  if (!formData.value.id) return
  try {
    const data: Record<string, any> = {}
    const stringFields = ['projectType', 'year', 'positionName', 'serviceType', 'organizingDept', 'serviceUnit', 'province', 'city', 'county', 'township', 'servicePeriod', 'serviceStartDate', 'serviceEndDate', 'educationRequirement', 'majorRequirement', 'gradYearRequirement', 'householdRequirement', 'politicalStatus', 'otherRequirement', 'examContent', 'examTime', 'interviewForm', 'monthlySubsidy', 'socialInsurance', 'housingInfo', 'otherBenefits', 'afterServicePolicy', 'examBonusPoints', 'tuitionCompensation', 'postgradBonus', 'regStartDate', 'regEndDate', 'applyLink', 'positionStatus', 'contactPhone', 'remark', 'content']
    stringFields.forEach((f) => { if (formData.value[f]) data[f] = formData.value[f] })
    const numberFields = ['ageLimit', 'recruitmentCount', 'sortOrder']
    numberFields.forEach((f) => { if (formData.value[f] !== null && formData.value[f] !== '') data[f] = formData.value[f] })
    const booleanFields = ['canTransferToCivil', 'canTransferToInstitution']
    booleanFields.forEach((f) => { data[f] = !!formData.value[f] })
    const res = await updateGrassroots(formData.value.id, data)
    if (res.data.code === 200) { ElMessage.success('修改成功'); emit('update:visible', false); emit('submit') }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '操作失败') }
}
</script>

<template>
  <el-dialog :model-value="visible" title="修改基层服务项目岗位" width="1000px" :close-on-click-modal="false" @update:model-value="emit('update:visible', $event)">
    <div v-loading="loading">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="项目与岗位信息" name="basic">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="项目类型"><el-select v-model="formData.projectType" placeholder="请选择" clearable style="width: 100%"><el-option v-for="item in projectTypeOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="招募年份"><el-input v-model="formData.year" placeholder="招募年份" maxlength="10" show-word-limit /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="岗位名称"><el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="服务类型"><el-select v-model="formData.serviceType" placeholder="请选择" clearable style="width: 100%"><el-option v-for="item in serviceTypeOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="组织单位"><el-input v-model="formData.organizingDept" placeholder="组织单位" maxlength="200" show-word-limit /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="服务单位"><el-input v-model="formData.serviceUnit" placeholder="服务单位" maxlength="200" show-word-limit /></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="服务地点与要求" name="location">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="8"><el-form-item label="省份"><el-input v-model="formData.province" placeholder="省份" maxlength="30" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="城市"><el-input v-model="formData.city" placeholder="城市" maxlength="50" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="区域"><el-input v-model="formData.county" placeholder="请输入区域" maxlength="50" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="乡镇/街道"><el-input v-model="formData.township" placeholder="乡镇/街道" maxlength="100" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="服务期限"><el-input v-model="formData.servicePeriod" placeholder="服务期限" maxlength="30" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="服务开始日期"><el-input v-model="formData.serviceStartDate" placeholder="服务开始日期" maxlength="30" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="服务结束日期"><el-input v-model="formData.serviceEndDate" placeholder="服务结束日期" maxlength="30" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="学历要求"><el-select v-model="formData.educationRequirement" placeholder="请选择" clearable style="width: 100%"><el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="年龄上限"><el-input-number v-model="formData.ageLimit" :min="18" :max="35" style="width: 100%" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="招募人数"><el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="毕业年份要求"><el-input v-model="formData.gradYearRequirement" placeholder="毕业年份要求" maxlength="50" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="专业要求"><el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit /></el-form-item>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="户籍要求"><el-input v-model="formData.householdRequirement" placeholder="户籍要求" maxlength="100" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="政治面貌"><el-input v-model="formData.politicalStatus" placeholder="政治面貌" maxlength="30" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="其他要求"><el-input v-model="formData.otherRequirement" type="textarea" :rows="2" placeholder="其他要求" /></el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="待遇与期满政策" name="benefits">
          <el-form :model="formData" label-width="140px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="月补贴标准"><el-input v-model="formData.monthlySubsidy" placeholder="月补贴标准" maxlength="50" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="社保缴纳"><el-input v-model="formData.socialInsurance" placeholder="社保缴纳" maxlength="200" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="住房安排"><el-input v-model="formData.housingInfo" placeholder="住房安排" maxlength="200" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="考试加分"><el-input v-model="formData.examBonusPoints" placeholder="考试加分" maxlength="50" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="学费补偿"><el-input v-model="formData.tuitionCompensation" placeholder="学费补偿" maxlength="100" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="考研加分"><el-input v-model="formData.postgradBonus" placeholder="考研加分" maxlength="100" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="其他待遇"><el-input v-model="formData.otherBenefits" type="textarea" :rows="2" placeholder="其他待遇" /></el-form-item>
            <el-form-item label="期满政策"><el-input v-model="formData.afterServicePolicy" type="textarea" :rows="2" placeholder="期满政策" /></el-form-item>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="可定向考公"><el-switch v-model="formData.canTransferToCivil" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="可转事业编"><el-switch v-model="formData.canTransferToInstitution" /></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="考试与报名" name="exam">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-form-item label="笔试内容"><el-input v-model="formData.examContent" type="textarea" :rows="2" placeholder="笔试内容" maxlength="500" show-word-limit /></el-form-item>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="考试时间"><el-input v-model="formData.examTime" placeholder="考试时间" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="面试形式"><el-input v-model="formData.interviewForm" placeholder="面试形式" maxlength="100" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8"><el-form-item label="报名开始"><el-date-picker v-model="formData.regStartDate" type="datetime" placeholder="报名开始" style="width: 100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="报名截止"><el-date-picker v-model="formData.regEndDate" type="datetime" placeholder="报名截止" style="width: 100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="排序"><el-input-number v-model="formData.sortOrder" style="width: 100%" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="状态"><el-select v-model="formData.positionStatus" placeholder="请选择" style="width: 100%"><el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="联系电话"><el-input v-model="formData.contactPhone" placeholder="联系电话" maxlength="50" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="报名链接"><el-input v-model="formData.applyLink" placeholder="报名链接" maxlength="500" /></el-form-item>
            <el-form-item label="备注"><el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="备注" /></el-form-item>
            <el-form-item label="详细说明"><el-input v-model="formData.content" type="textarea" :rows="3" placeholder="详细说明" /></el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    <template #footer>
      <button type="button" class="btn-cancel" @click="emit('update:visible', false)">取消</button>
      <button type="button" class="btn-submit" @click="handleSubmit">确定</button>
    </template>
  </el-dialog>
</template>

<style scoped>
.btn-cancel { background: #fff; color: #6b7280; border: 1px solid #d1d5db; border-radius: 20px; padding: 8px 24px; font-size: 14px; cursor: pointer; }
.btn-cancel:hover { border-color: #F97316; color: #F97316; }
.btn-submit { background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; border: none; border-radius: 20px; padding: 8px 24px; font-size: 14px; cursor: pointer; }
.btn-submit:hover { filter: brightness(1.1); }
</style>
