<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
  initialData: Record<string, any>
  mode?: 'add' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', data: Record<string, any>): void
}>()

const activeTab = ref('basic')
const formData = ref<Record<string, any>>({})

const formRefBasic = ref<FormInstance>()

// 必填校验（与后端 CivilPositionAddDTO @NotBlank 字段对齐）
const basicRules: FormRules = {
  positionName: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
  examType: [{ required: true, message: '请选择考试类型', trigger: 'change' }],
}

const examTypeOptions = ['国考', '省考']
const educationOptions = ['不限', '大专', '本科', '硕士', '博士']
const politicalStatusOptions = ['不限', '中共党员', '共青团员', '群众']
const degreeOptions = ['不限', '学士', '硕士', '博士']
const regStatusOptions = ['报名中', '已结束', '即将开始']

const dialogTitle = computed(() => (props.mode === 'add' ? '新增公务员职位' : '修改公务员职位'))

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
  for (const [key, val] of Object.entries(formData.value)) {
    if (val !== '' && val !== null && val !== undefined) {
      data[key] = val
    }
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
        <el-tab-pane label="基本信息" name="basic">
          <el-form ref="formRefBasic" :model="formData" :rules="basicRules" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="职位名称" prop="positionName">
                  <el-input v-model="formData.positionName" placeholder="职位名称" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="考试类型" prop="examType">
                  <el-select v-model="formData.examType" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in examTypeOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="招录部门">
                  <el-input v-model="formData.recruitingDept" placeholder="招录部门" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="部门代码">
                  <el-input v-model="formData.deptCode" placeholder="部门代码" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="职位代码">
                  <el-input v-model="formData.positionCode" placeholder="职位代码" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属局">
                  <el-input v-model="formData.affiliatedBureau" placeholder="所属局" maxlength="200" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="报考要求" name="requirements">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="最低学历">
                  <el-select v-model="formData.minEducation" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="学位要求">
                  <el-select v-model="formData.degreeRequirement" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in degreeOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="政治面貌">
                  <el-select v-model="formData.politicalStatus" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in politicalStatusOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工作年限">
                  <el-input v-model="formData.workExperience" placeholder="工作年限" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="基层经验要求">
                  <el-input v-model="formData.grassrootsExperience" placeholder="基层经验要求" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="招录人数">
                  <el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="专业要求">
              <el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="考试与地点" name="exam">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="考试类别">
                  <el-input v-model="formData.examCategory" placeholder="考试类别" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="面试比例">
                  <el-input v-model="formData.interviewRatio" placeholder="面试比例" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="专业科目考试">
              <el-switch v-model="formData.hasProfessionalTest" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="工作地点">
                  <el-input v-model="formData.workLocation" placeholder="工作地点" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工作地点详情">
                  <el-input v-model="formData.workLocationDetail" placeholder="工作地点详情" maxlength="200" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="落户要求">
                  <el-input v-model="formData.householdRequirement" placeholder="落户要求" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="落户地点">
                  <el-input v-model="formData.householdLocation" placeholder="落户地点" maxlength="100" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="补充信息" name="extra">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="官方网站">
                  <el-input v-model="formData.officialWebsite" placeholder="官方网站" maxlength="500" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话">
                  <el-input v-model="formData.contactPhone" placeholder="联系电话" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="职位简介">
              <el-input v-model="formData.positionIntro" type="textarea" :rows="3" placeholder="职位简介" maxlength="500" show-word-limit />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="备注" />
            </el-form-item>
            <el-row :gutter="20">
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
              <el-col :span="8">
                <el-form-item label="报名状态">
                  <el-select v-model="formData.regStatus" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in regStatusOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="报名人数">
                  <el-input-number v-model="formData.applicantCount" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序">
                  <el-input-number v-model="formData.sortOrder" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
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
