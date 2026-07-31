<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getWelfareDetail, updateWelfare } from '@/api/employment/welfare'

const props = defineProps<{ visible: boolean; initialData: Record<string, any> }>()
const emit = defineEmits<{ 'update:visible': [val: boolean]; submit: [] }>()

const loading = ref(false)
const activeTab = ref('basic')
const formData = ref<Record<string, any>>({})

const positionCategoryOptions = ['公共管理', '公共服务', '公共环境', '公共安全', '设施维护', '其他']
const educationOptions = ['不限', '初中', '高中', '大专', '本科']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']

watch(() => props.visible, (val) => {
  if (val) { activeTab.value = 'basic'; formData.value = { ...props.initialData } }
})

const handleSubmit = async () => {
  if (!formData.value.id) return
  try {
    const data: Record<string, any> = {}
    const stringFields = ['developingUnit', 'employingUnit', 'positionName', 'positionCategory', 'workContent', 'province', 'city', 'district', 'workLocation', 'educationRequirement', 'ageRange', 'healthRequirement', 'householdRequirement', 'otherRequirement', 'contractPeriod', 'monthlySalary', 'salarySource', 'subsidyStandard', 'socialInsuranceInfo', 'otherBenefits', 'workSchedule', 'regStartDate', 'regEndDate', 'applyMethod', 'applyAddress', 'requiredDocuments', 'positionStatus', 'contactPhone', 'contactPerson', 'remark', 'content']
    stringFields.forEach((f) => { if (formData.value[f]) data[f] = formData.value[f] })
    const numberFields = ['recruitmentCount', 'maxServiceYears', 'sortOrder']
    numberFields.forEach((f) => { if (formData.value[f] !== null && formData.value[f] !== '') data[f] = formData.value[f] })
    const booleanFields = ['employmentDifficultyCert', 'isRenewable', 'isShiftWork']
    booleanFields.forEach((f) => { data[f] = !!formData.value[f] })
    if (formData.value.targetGroup && formData.value.targetGroup.length > 0) data.targetGroup = formData.value.targetGroup
    const res = await updateWelfare(formData.value.id, data)
    if (res.data.code === 200) { ElMessage.success('修改成功'); emit('update:visible', false); emit('submit') }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '操作失败') }
}
</script>

<template>
  <el-dialog class="welfare-form-dialog" :model-value="visible" title="修改公益性岗位" width="1000px" :close-on-click-modal="false" @update:model-value="emit('update:visible', $event)">
    <div v-loading="loading">
      <el-tabs v-model="activeTab" class="welfare-form-tabs">
        <el-tab-pane label="单位与岗位信息" name="basic">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="开发单位"><el-input v-model="formData.developingUnit" placeholder="开发单位" maxlength="200" show-word-limit /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="用工单位"><el-input v-model="formData.employingUnit" placeholder="用工单位" maxlength="200" show-word-limit /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="岗位名称"><el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="岗位类别"><el-select v-model="formData.positionCategory" placeholder="请选择" clearable style="width: 100%"><el-option v-for="item in positionCategoryOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
            </el-row>
            <el-form-item label="工作内容"><el-input v-model="formData.workContent" type="textarea" :rows="2" placeholder="工作内容" /></el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="地区与报名要求" name="location">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="8"><el-form-item label="省份"><el-input v-model="formData.province" placeholder="省份" maxlength="30" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="城市"><el-input v-model="formData.city" placeholder="城市" maxlength="50" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="区域"><el-input v-model="formData.district" placeholder="请输入区域" maxlength="50" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="工作地点"><el-input v-model="formData.workLocation" placeholder="工作地点" maxlength="200" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="面向人群"><el-select v-model="formData.targetGroup" placeholder="请选择" multiple clearable style="width: 100%"><el-option label="低保" value="低保" /><el-option label="残疾" value="残疾" /><el-option label="零就业家庭" value="零就业家庭" /><el-option label="退役军人" value="退役军人" /><el-option label="高校毕业生" value="高校毕业生" /><el-option label="其他" value="其他" /></el-select></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8"><el-form-item label="学历要求"><el-select v-model="formData.educationRequirement" placeholder="请选择" clearable style="width: 100%"><el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="年龄范围"><el-input v-model="formData.ageRange" placeholder="年龄范围" maxlength="50" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="招聘人数"><el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="户籍要求"><el-input v-model="formData.householdRequirement" placeholder="户籍要求" maxlength="100" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="困难认定"><el-switch v-model="formData.employmentDifficultyCert" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="身体条件"><el-input v-model="formData.healthRequirement" placeholder="身体条件" maxlength="200" /></el-form-item>
            <el-form-item label="其他要求"><el-input v-model="formData.otherRequirement" type="textarea" :rows="2" placeholder="其他要求" /></el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="岗位期限与待遇" name="benefits">
          <el-form :model="formData" label-width="140px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="合同期限"><el-input v-model="formData.contractPeriod" placeholder="合同期限" maxlength="30" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="可续期"><el-switch v-model="formData.isRenewable" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="最长服务年限"><el-input-number v-model="formData.maxServiceYears" :min="1" style="width: 100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="月工资"><el-input v-model="formData.monthlySalary" placeholder="月工资" maxlength="50" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="工资来源"><el-input v-model="formData.salarySource" placeholder="工资来源" maxlength="100" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="补贴标准"><el-input v-model="formData.subsidyStandard" placeholder="补贴标准" maxlength="200" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="社保缴纳"><el-input v-model="formData.socialInsuranceInfo" placeholder="社保缴纳" maxlength="200" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="排序"><el-input-number v-model="formData.sortOrder" style="width: 100%" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="其他福利"><el-input v-model="formData.otherBenefits" type="textarea" :rows="2" placeholder="其他福利" /></el-form-item>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="工作时间"><el-input v-model="formData.workSchedule" placeholder="工作时间" maxlength="100" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="是否倒班"><el-switch v-model="formData.isShiftWork" /></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="报名与补录" name="exam">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="报名开始"><el-date-picker v-model="formData.regStartDate" type="datetime" placeholder="报名开始" style="width: 100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="报名截止"><el-date-picker v-model="formData.regEndDate" type="datetime" placeholder="报名截止" style="width: 100%" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="状态"><el-select v-model="formData.positionStatus" placeholder="请选择" style="width: 100%"><el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="联系电话"><el-input v-model="formData.contactPhone" placeholder="联系电话" maxlength="50" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12"><el-form-item label="联系人"><el-input v-model="formData.contactPerson" placeholder="联系人" maxlength="50" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="报名方式"><el-input v-model="formData.applyMethod" placeholder="报名方式" /></el-form-item>
            <el-form-item label="报名地址"><el-input v-model="formData.applyAddress" placeholder="报名地址" maxlength="200" /></el-form-item>
            <el-form-item label="所需材料"><el-input v-model="formData.requiredDocuments" type="textarea" :rows="2" placeholder="所需材料" /></el-form-item>
            <el-form-item label="备注"><el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="备注" /></el-form-item>
            <el-form-item label="详细说明"><el-input v-model="formData.content" type="textarea" :rows="3" placeholder="详细说明" /></el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="exit-btn" @click="emit('update:visible', false)">取消</button>
        <button type="button" class="save-btn" @click="handleSubmit">确定</button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.welfare-form-dialog :deep(.el-dialog) { border-radius:12px; overflow:hidden; }
.welfare-form-dialog :deep(.el-dialog__header) { border-bottom:2px solid rgba(249,115,22,0.15); padding:20px 24px; margin:0; }
.welfare-form-dialog :deep(.el-dialog__title) { font-size:16px; font-weight:600; color:#1f2937; }
.welfare-form-dialog :deep(.el-dialog__body) { padding:24px; }
.welfare-form-dialog :deep(.el-dialog__footer) { border-top:1px solid #f3f4f6; padding:16px 24px; }
.welfare-form-dialog :deep(.el-input__wrapper), .welfare-form-dialog :deep(.el-textarea__inner), .welfare-form-dialog :deep(.el-select__wrapper) { border-radius:8px; transition:all .25s ease; }
.welfare-form-dialog :deep(.el-input__wrapper:hover), .welfare-form-dialog :deep(.el-textarea__inner:hover), .welfare-form-dialog :deep(.el-select__wrapper:hover) { box-shadow:0 0 0 1px rgba(249,115,22,0.3) inset; }
.welfare-form-dialog :deep(.el-input__wrapper.is-focus), .welfare-form-dialog :deep(.el-textarea__inner:focus), .welfare-form-dialog :deep(.el-select__wrapper.is-focused) { box-shadow:0 0 0 1px #F97316 inset; }
.welfare-form-dialog :deep(.el-radio__input.is-checked .el-radio__inner) { background-color:#F97316; border-color:#F97316; }
.welfare-form-dialog :deep(.el-radio__input.is-checked + .el-radio__label) { color:#F97316; }
.welfare-form-tabs :deep(.el-tabs__item.is-active) { color:#F97316; }
.welfare-form-tabs :deep(.el-tabs__active-bar) { background-color:#F97316; }
.welfare-form-tabs :deep(.el-tabs__item:hover) { color:#F97316; }
.dialog-footer { display:flex; justify-content:flex-end; gap:12px; }
.exit-btn { display:inline-flex; align-items:center; padding:8px 20px; background:#fff; color:#6b7280; border:1px solid #d1d5db; border-radius:20px; font-size:14px; font-weight:500; cursor:pointer; transition:all .25s ease; }
.exit-btn:hover { color:#374151; border-color:#9ca3af; background:#f9fafb; }
.save-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 24px; background:linear-gradient(135deg,#F97316,#FB923C); color:#fff; border:none; border-radius:20px; font-size:14px; font-weight:600; cursor:pointer; transition:all .25s ease; box-shadow:0 2px 8px rgba(249,115,22,0.3); }
.save-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 12px rgba(249,115,22,0.4); }
.save-btn:disabled { opacity:0.6; cursor:not-allowed; }
</style>
