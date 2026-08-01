<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { addCommunity, getCommunityDetail, updateCommunity } from '@/api/employment/community'
import type { CommunityAddDTO } from '@/types/employment/community'

const props = defineProps<{ visible: boolean; initialData: Record<string, any>; mode?: 'add' | 'edit' }>()
const emit = defineEmits<{ 'update:visible': [val: boolean]; submit: [] }>()

const loading = ref(false)
const activeTab = ref('basic')
const formData = ref<Record<string, any>>({})

const formRefBasic = ref<FormInstance>()
const formRefLocation = ref<FormInstance>()

// 必填校验（与后端 CommunityPositionAddDTO @NotBlank 字段对齐）
const basicRules: FormRules = {
  streetOffice: [{ required: true, message: '请输入街道办事处乡镇', trigger: 'blur' }],
  positionName: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  positionType: [{ required: true, message: '请选择岗位类型', trigger: 'change' }],
  employmentType: [{ required: true, message: '请选择用工形式', trigger: 'change' }],
}
const locationRules: FormRules = {
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
}

const dialogTitle = computed(() => (props.mode === 'add' ? '新增社区工作者岗位' : '修改社区工作者岗位'))

const positionTypeOptions = ['社区党务工作者', '社区服务工作者', '社区网格员', '社区调解员', '社区安全员', '社区文化专干', '社会工作师', '综合岗', '其他']
const employmentTypeOptions = ['事业编制', '合同制', '政府购买服务', '公益性岗位']
const educationOptions = ['不限', '高中', '大专', '本科', '硕士']
const socialWorkCertOptions = ['不要求', '初级社工师', '中级社工师', '高级社工师', '优先']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']
const politicalStatusOptions = ['中共党员', '中共预备党员', '共青团员', '群众']
const provinceOptions = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '香港', '澳门', '台湾']

watch(() => props.visible, (val) => {
  if (val) {
    activeTab.value = 'basic'
    formData.value = { ...props.initialData }
    nextTick(() => {
      formRefBasic.value?.clearValidate()
      formRefLocation.value?.clearValidate()
    })
  }
})

const handleSubmit = async () => {
  if (props.mode !== 'add' && !formData.value.id) return
  try {
    await formRefBasic.value?.validate()
  } catch {
    return
  }
  try {
    await formRefLocation.value?.validate()
  } catch {
    activeTab.value = 'location'
    return
  }
  try {
    const data: Record<string, any> = {}
    const stringFields = ['streetOffice', 'communityName', 'supervisingDept', 'district', 'positionName', 'positionType', 'employmentType', 'province', 'city', 'workLocation', 'educationRequirement', 'majorRequirement', 'householdRequirement', 'politicalStatus', 'workExperience', 'socialWorkCert', 'communityExperience', 'residenceRequirement', 'salaryRange', 'salaryComposition', 'benefits', 'examContent', 'interviewForm', 'regStartDate', 'regEndDate', 'examTime', 'positionStatus', 'applyLink', 'applyMethod', 'contactPhone', 'contactAddress', 'remark', 'content']
    stringFields.forEach((f) => { if (formData.value[f]) data[f] = formData.value[f] })
    const numberFields = ['ageLimit', 'recruitmentCount', 'sortOrder']
    numberFields.forEach((f) => { if (formData.value[f] !== null && formData.value[f] !== '') data[f] = formData.value[f] })
    const res = props.mode === 'add' ? await addCommunity(data as CommunityAddDTO) : await updateCommunity(formData.value.id, data)
    if (res.data.code === 200) { ElMessage.success(props.mode === 'add' ? '新增成功' : '修改成功'); emit('update:visible', false); emit('submit') }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || err.message || '操作失败') }
}
</script>

<template>
  <el-dialog class="community-form-dialog" :model-value="visible" :title="dialogTitle" width="1000px" :close-on-click-modal="false" @update:model-value="emit('update:visible', $event)">
    <div v-loading="loading">
      <el-tabs v-model="activeTab" class="community-form-tabs">
        <el-tab-pane label="单位与岗位信息" name="basic">
          <el-form ref="formRefBasic" :model="formData" :rules="basicRules" label-width="140px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="街道办事处乡镇" prop="streetOffice"><el-input v-model="formData.streetOffice" placeholder="街道办事处乡镇" maxlength="200" show-word-limit /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="社区名称"><el-input v-model="formData.communityName" placeholder="社区名称" maxlength="200" show-word-limit /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="主管部门"><el-input v-model="formData.supervisingDept" placeholder="主管部门" maxlength="200" show-word-limit /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="区域"><el-input v-model="formData.district" placeholder="请输入区域" maxlength="100" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="岗位名称" prop="positionName"><el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="岗位类型" prop="positionType"><el-select v-model="formData.positionType" placeholder="请选择" clearable style="width: 100%"><el-option v-for="item in positionTypeOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="用工形式" prop="employmentType"><el-select v-model="formData.employmentType" placeholder="请选择" clearable style="width: 100%"><el-option v-for="item in employmentTypeOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="地区与报考要求" name="location">
          <el-form ref="formRefLocation" :model="formData" :rules="locationRules" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="8"><el-form-item label="省份" prop="province"><el-select v-model="formData.province" placeholder="请选择" clearable filterable allow-create default-first-option style="width: 100%"><el-option v-for="item in provinceOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="城市" prop="city"><el-input v-model="formData.city" placeholder="城市" maxlength="50" /></el-form-item></el-col>
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
              <el-col :span="8"><el-form-item label="政治面貌"><el-select v-model="formData.politicalStatus" placeholder="请选择" clearable style="width: 100%"><el-option v-for="item in politicalStatusOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
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
      <button type="button" class="exit-btn" @click="emit('update:visible', false)">取消</button>
      <button type="button" class="save-btn" @click="handleSubmit">确定</button>
    </template>
  </el-dialog>
</template>

<style scoped>
.community-form-dialog :deep(.el-dialog) { border-radius: 12px; overflow: hidden; }
.community-form-dialog :deep(.el-dialog__header) { border-bottom: 2px solid rgba(249,115,22,0.15); padding: 20px 24px; margin: 0; }
.community-form-dialog :deep(.el-dialog__title) { font-size: 16px; font-weight: 600; color: #1f2937; }
.community-form-dialog :deep(.el-dialog__body) { padding: 24px; }
.community-form-dialog :deep(.el-dialog__footer) { border-top: 1px solid #f3f4f6; padding: 16px 24px; }
.community-form-dialog :deep(.el-input__wrapper), .community-form-dialog :deep(.el-textarea__inner), .community-form-dialog :deep(.el-select__wrapper) { border-radius: 8px; transition: all .25s ease; }
.community-form-dialog :deep(.el-input__wrapper:hover), .community-form-dialog :deep(.el-textarea__inner:hover), .community-form-dialog :deep(.el-select__wrapper:hover) { box-shadow: 0 0 0 1px rgba(249,115,22,0.3) inset; }
.community-form-dialog :deep(.el-input__wrapper.is-focus), .community-form-dialog :deep(.el-textarea__inner:focus), .community-form-dialog :deep(.el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #F97316 inset; }
.community-form-dialog :deep(.el-radio__input.is-checked .el-radio__inner) { background-color: #F97316; border-color: #F97316; }
.community-form-dialog :deep(.el-radio__input.is-checked + .el-radio__label) { color: #F97316; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; }
.exit-btn { display: inline-flex; align-items: center; padding: 8px 20px; background: #fff; color: #6b7280; border: 1px solid #d1d5db; border-radius: 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all .25s ease; }
.exit-btn:hover { color: #374151; border-color: #9ca3af; background: #f9fafb; }
.save-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 24px; background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; border: none; border-radius: 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .25s ease; box-shadow: 0 2px 8px rgba(249,115,22,0.3); }
.save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249,115,22,0.4); }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.community-form-tabs :deep(.el-tabs__item.is-active) { color: #F97316; }
.community-form-tabs :deep(.el-tabs__active-bar) { background-color: #F97316; }
.community-form-tabs :deep(.el-tabs__item:hover) { color: #F97316; }
</style>
