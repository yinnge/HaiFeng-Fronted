<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps<{
  visible: boolean
  initialData: Record<string, any>
  mode?: 'add' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', data: Record<string, any>): void
}>()

const dialogTitle = computed(() => (props.mode === 'add' ? '新增银行/金融岗位' : '修改银行/金融岗位'))

const activeTab = ref('basic')
const formData = ref<Record<string, any>>({})

const formRefBasic = ref<FormInstance>()

// 必填校验（与后端 FinancePositionAddDTO @NotBlank 字段对齐）
const basicRules: FormRules = {
  institutionName: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
  institutionCategory: [{ required: true, message: '请选择机构大类', trigger: 'change' }],
  positionName: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  recruitmentType: [{ required: true, message: '请选择招聘类型', trigger: 'change' }],
}

const institutionCategoryOptions = ['银行', '证券', '保险', '基金', '信托', '期货', '监管机构', '金融科技']
const recruitmentTypeOptions = ['秋招', '春招', '社招', '实习', '定向']
const educationOptions = ['不限', '大专', '本科', '硕士', '博士']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']

watch(() => props.visible, (val) => {
  if (val) {
    activeTab.value = 'basic'
    formData.value = { ...props.initialData }
    nextTick(() => {
      formRefBasic.value?.clearValidate()
    })
  }
})

const handleClose = () => { emit('update:visible', false) }

const handleSubmit = async () => {
  try {
    await formRefBasic.value?.validate()
  } catch {
    return
  }
  const data: Record<string, any> = {}
  const stringFields = ['institutionName', 'institutionCategory', 'institutionType', 'institutionLogo', 'branchName', 'positionName', 'positionCategory', 'recruitmentType', 'province', 'city', 'workLocation', 'educationRequirement', 'degreeRequirement', 'majorRequirement', 'workExperience', 'languageRequirement', 'computerRequirement', 'otherRequirement', 'salaryText', 'benefits', 'examContent', 'examTime', 'interviewRounds', 'regStartDate', 'regEndDate', 'applyLink', 'positionStatus', 'contactInfo', 'remark', 'content']
  stringFields.forEach((f) => { if (formData.value[f]) data[f] = formData.value[f] })
  const numberFields = ['ageLimit', 'recruitmentCount', 'salaryMin', 'salaryMax', 'sortOrder']
  numberFields.forEach((f) => { if (formData.value[f] !== null && formData.value[f] !== '') data[f] = formData.value[f] })
  if (formData.value.isRemote) data.isRemote = true
  if (formData.value.majorPreference) {
    data.majorPreference = formData.value.majorPreference.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
  }
  if (formData.value.certRequirements) {
    data.certRequirements = formData.value.certRequirements.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
  }
  emit('submit', data)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="900px"
    class="form-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="dialog-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="机构与岗位信息" name="basic">
          <el-form ref="formRefBasic" :model="formData" :rules="basicRules" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="机构名称" prop="institutionName">
                  <el-input v-model="formData.institutionName" placeholder="机构名称" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="机构大类" prop="institutionCategory">
                  <el-select v-model="formData.institutionCategory" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in institutionCategoryOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="机构细分类型">
                  <el-input v-model="formData.institutionType" placeholder="机构细分类型" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="分支机构名称">
                  <el-input v-model="formData.branchName" placeholder="分支机构名称" maxlength="200" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="机构Logo">
              <el-input v-model="formData.institutionLogo" placeholder="机构Logo URL" maxlength="500" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="岗位名称" prop="positionName">
                  <el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="岗位类别">
                  <el-input v-model="formData.positionCategory" placeholder="岗位类别" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="招聘类型" prop="recruitmentType">
              <el-select v-model="formData.recruitmentType" placeholder="请选择" clearable style="width: 100%">
                <el-option v-for="item in recruitmentTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="地区与报考要求" name="location">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="省份">
                  <el-input v-model="formData.province" placeholder="省份" maxlength="30" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="城市">
                  <el-input v-model="formData.city" placeholder="城市" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="详细工作地点">
                  <el-input v-model="formData.workLocation" placeholder="详细工作地点" maxlength="200" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-checkbox v-model="formData.isRemote" label="支持远程办公" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学历要求">
                  <el-select v-model="formData.educationRequirement" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="学位要求">
                  <el-input v-model="formData.degreeRequirement" placeholder="学位要求" maxlength="30" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="专业要求">
              <el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="年龄上限">
                  <el-input-number v-model="formData.ageLimit" :min="18" :max="45" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="招聘人数">
                  <el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="工作经验">
                  <el-input v-model="formData.workExperience" placeholder="工作经验" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="资质要求" name="cert">
          <el-form :model="formData" label-width="140px" class="mt-2">
            <el-form-item label="优先专业">
              <el-input v-model="formData.majorPreference" placeholder="多个专业用逗号分隔" />
            </el-form-item>
            <el-form-item label="证书要求">
              <el-input v-model="formData.certRequirements" placeholder="多个证书用逗号分隔（如 CFA、CPA）" />
            </el-form-item>
            <el-form-item label="语言要求">
              <el-input v-model="formData.languageRequirement" placeholder="语言要求" maxlength="100" />
            </el-form-item>
            <el-form-item label="计算机要求">
              <el-input v-model="formData.computerRequirement" placeholder="计算机要求" maxlength="100" />
            </el-form-item>
            <el-form-item label="其他要求">
              <el-input v-model="formData.otherRequirement" type="textarea" :rows="3" placeholder="其他要求" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="薪资与福利" name="salary">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="最低月薪(k)">
                  <el-input-number v-model="formData.salaryMin" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最高月薪(k)">
                  <el-input-number v-model="formData.salaryMax" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="薪资文本说明">
              <el-input v-model="formData.salaryText" placeholder="薪资文本说明" maxlength="100" />
            </el-form-item>
            <el-form-item label="福利待遇">
              <el-input v-model="formData.benefits" type="textarea" :rows="3" placeholder="福利待遇" />
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number v-model="formData.sortOrder" style="width: 100%" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="考试与补录" name="exam">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-form-item label="考试内容">
              <el-input v-model="formData.examContent" type="textarea" :rows="3" placeholder="考试内容" maxlength="500" show-word-limit />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="考试时间">
                  <el-date-picker v-model="formData.examTime" type="datetime" placeholder="考试时间" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="报名开始">
                  <el-date-picker v-model="formData.regStartDate" type="datetime" placeholder="报名开始" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="报名截止">
                  <el-date-picker v-model="formData.regEndDate" type="datetime" placeholder="报名截止" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="面试轮次">
              <el-input v-model="formData.interviewRounds" placeholder="面试轮次说明" maxlength="100" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="状态">
                  <el-select v-model="formData.positionStatus" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系方式">
                  <el-input v-model="formData.contactInfo" placeholder="联系方式" maxlength="200" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="网申链接">
              <el-input v-model="formData.applyLink" placeholder="网申链接" maxlength="500" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="备注" />
            </el-form-item>
            <el-form-item label="详细说明">
              <el-input v-model="formData.content" type="textarea" :rows="4" placeholder="详细说明" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">取消</button>
        <button type="button" class="submit-btn" @click="handleSubmit">确定</button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.form-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.form-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 65vh;
  overflow-y: auto;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.dialog-content :deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(249, 115, 22, 0.1);
}

.dialog-content :deep(.el-tabs__item.is-active) {
  color: #F97316;
}

.dialog-content :deep(.el-tabs__active-bar) {
  background-color: #F97316;
}

.dialog-content :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.dialog-content :deep(.el-input__wrapper),
.dialog-content :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.dialog-content :deep(.el-input__wrapper:hover),
.dialog-content :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-content :deep(.el-input__wrapper.is-focus),
.dialog-content :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-content :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.dialog-content :deep(.el-textarea__inner:hover) {
  border-color: #F97316;
}

.dialog-content :deep(.el-textarea__inner:focus) {
  border-color: #F97316;
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-content :deep(.el-switch.is-checked .el-switch__core) {
  background-color: #F97316;
  border-color: #F97316;
}

.dialog-content :deep(.el-date-editor) {
  border-radius: 8px;
}

.dialog-content :deep(.el-input-number .el-input__wrapper) {
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cancel-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 24px;
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

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
</style>
