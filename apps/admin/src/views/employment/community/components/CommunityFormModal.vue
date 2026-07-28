<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getCommunityDetail, updateCommunity } from '@/api/employment/community'

const props = defineProps<{ visible: boolean; initialData: Record<string, any> }>()
const emit = defineEmits<{ 'update:visible': [val: boolean]; submit: [] }>()

const loading = ref(false)
const activeTab = ref('basic')
const formData = ref<Record<string, any>>({})

const positionTypeOptions = ['社区党务工作者', '社区服务工作者', '社区网格', '社区调解', '社区安全', '社区文化专干', '社会工作', '综合', '其他']
const employmentTypeOptions = ['事业编制', '合同制', '政府购买服务', '公益性岗位']
const educationOptions = ['不限', '高中', '大专', '本科', '硕士']
const socialWorkCertOptions = ['不要', '初级社工', '中级社工', '高级社工', '优先']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']

watch(() => props.visible, (val) => {
  if (val) { activeTab.value = 'basic'; formData.value = { ...props.initialData } }
})

const handleSubmit = async () => {
  if (!formData.value.id) return
  try {
    const data: Record<string, any> = {}
    const stringFields = ['streetOffice', 'communityName', 'supervisingDept', 'district', 'positionName', 'positionType', 'employmentType', 'province', 'city', 'workLocation', 'educationRequirement', 'majorRequirement', 'householdRequirement', 'politicalStatus', 'workExperience', 'socialWorkCert', 'communityExperience', 'residenceRequirement', 'salaryRange', 'salaryComposition', 'benefits', 'examContent', 'interviewForm', 'regStartDate', 'regEndDate', 'examTime', 'positionStatus', 'applyLink', 'applyMethod', 'contactPhone', 'contactAddress', 'remark', 'content']
    stringFields.forEach((f) => { if (formData.value[f]) data[f] = formData.value[f] })
    const numberFields = ['ageLimit', 'recruitmentCount', 'sortOrder']
    numberFields.forEach((f) => { if (formData.value[f] !== null && formData.value[f] !== '') data[f] = formData.value[f] })
    const res = await updateCommunity(formData.value.id, data)
    if (res.data.code === 200) { ElMessage.success('修改成功'); emit('update:visible', false); emit('submit') }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '操作失败') }
}
</script>

<template>
  <el-dialog :model-value="visible" title="修改社区工作者岗位" width="1000px" :close-on-click-modal="false" @update:model-value="emit('update:visible', $event)">
    <div v-loading="loading">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="单位与岗位信息" name="basic">
          <el-form :model="formData" label-width="140px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="街道办事处乡镇"><el-input v-model="formData.streetOffice" placeholder="街道办事处乡镇" maxlength="200" show-word-limit /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="社区名称"><el-input v-model="formData.communityName" placeholder="社区名称" maxlength="200" show-word-limit /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="主管部门"><el-input v-model="formData.supervisingDept" placeholder="主管部门" maxlength="200" show-word-limit /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="区域"><el-input v-model="formData.district" placeholder="请输入区域" maxlength="100" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="岗位名称"><el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="岗位类型"><el-select v-model="formData.positionType" placeholder="请选择" clearable style="width: 100%"><el-option v-for="item in positionTypeOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="用工形式"><el-select v-model="formData.employmentType" placeholder="请选择" clearable style="width: 100%"><el-option v-for="item in employmentTypeOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="地区与报考要求" name="location">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="8"><el-form-item label="省份"><el-input v-model="formData.province" placeholder="省份" maxlength="30" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="城市"><el-input v-model="formData.city" placeholder="城市" maxlength="50" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="工作地点"><el-input v-model="formData.workLocation" placeholder="工作地点" maxlength="200" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8"><el-form-item label="学历要求"><el-select v-model="formData.educationRequirement" placeholder="请选择" clearable style="width: 100%"><el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="年龄上限"><el-input-number v-model="formData.ageLimit" :min="18" :max="55" style="width: 100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="招聘人数"><el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="专业要求"><el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit /></el-form-item>
            <el-row :gutter="20">
              <el-col :span="8"><el-form-item label="户籍要求"><el-input v-model="formData.householdRequirement" placeholder="户籍要求" maxlength="100" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="政治面貌"><el-input v-model="formData.politicalStatus" placeholder="政治面貌" maxlength="30" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="工作经验"><el-input v-model="formData.workExperience" placeholder="工作经验" maxlength="50" /></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="特殊要求与待遇" name="cert">
          <el-form :model="formData" label-width="140px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="社工证要求"><el-select v-model="formData.socialWorkCert" placeholder="请选择" clearable style="width: 100%"><el-option v-for="item in socialWorkCertOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="社区经验要求"><el-input v-model="formData.communityExperience" placeholder="社区经验要求" maxlength="100" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="居住地要求"><el-input v-model="formData.residenceRequirement" placeholder="居住地要求" maxlength="200" /></el-form-item>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="薪资待遇"><el-input v-model="formData.salaryRange" placeholder="薪资待遇" maxlength="50" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="薪资构成"><el-input v-model="formData.salaryComposition" placeholder="薪资构成" maxlength="200" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="福利待遇"><el-input v-model="formData.benefits" type="textarea" :rows="2" placeholder="福利待遇" /></el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="考试与报名" name="exam">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-form-item label="笔试内容"><el-input v-model="formData.examContent" type="textarea" :rows="2" placeholder="笔试内容" maxlength="500" show-word-limit /></el-form-item>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="面试形式"><el-input v-model="formData.interviewForm" placeholder="面试形式" maxlength="100" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="排序"><el-input-number v-model="formData.sortOrder" style="width: 100%" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8"><el-form-item label="报名开始"><el-date-picker v-model="formData.regStartDate" type="datetime" placeholder="报名开始" style="width: 100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="报名截止"><el-date-picker v-model="formData.regEndDate" type="datetime" placeholder="报名截止" style="width: 100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="考试时间"><el-date-picker v-model="formData.examTime" type="datetime" placeholder="考试时间" style="width: 100%" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="状态"><el-select v-model="formData.positionStatus" placeholder="请选择" style="width: 100%"><el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="联系电话"><el-input v-model="formData.contactPhone" placeholder="联系电话" maxlength="50" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="报名链接"><el-input v-model="formData.applyLink" placeholder="报名链接" maxlength="500" /></el-form-item>
            <el-form-item label="报名方式"><el-input v-model="formData.applyMethod" placeholder="报名方式" /></el-form-item>
            <el-form-item label="报名地址"><el-input v-model="formData.contactAddress" placeholder="报名地址" maxlength="200" /></el-form-item>
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
