<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  initialData: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', data: Record<string, any>): void
}>()

const activeTab = ref('basic')
const formData = ref<Record<string, any>>({})

const educationOptions = ['不限', '大专', '本科', '硕士', '博士']
const degreeOptions = ['不限', '学士', '硕士', '博士']
const positionStatusOptions = ['在招', '已结束', '未发布']

watch(() => props.visible, (val) => {
  if (val) {
    activeTab.value = 'basic'
    formData.value = { ...props.initialData }
  }
})

const handleClose = () => { emit('update:visible', false) }

const handleSubmit = () => {
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
    title="修改事业单位职位"
    width="900px"
    class="form-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="dialog-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="职位名称">
                  <el-input v-model="formData.positionName" placeholder="职位名称" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="主管单位">
                  <el-input v-model="formData.supervisingDept" placeholder="主管单位" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="事业单位">
                  <el-input v-model="formData.institution" placeholder="事业单位" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工作地点">
                  <el-input v-model="formData.workLocation" placeholder="工作地点" maxlength="200" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="省份">
                  <el-input v-model="formData.province" placeholder="省份" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="考试类别">
                  <el-input v-model="formData.examCategory" placeholder="考试类别" maxlength="100" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="职位类型">
                  <el-input v-model="formData.positionType" placeholder="职位类型" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="职位分类">
                  <el-input v-model="formData.subCategory" placeholder="职位分类" maxlength="100" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="报考要求" name="requirements">
          <el-form :model="formData" label-width="120px" class="mt-2">
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
                  <el-select v-model="formData.degreeRequirement" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in degreeOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="年龄限制">
                  <el-input-number v-model="formData.ageLimit" :min="18" :max="60" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="招录人数">
                  <el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="薪资范围">
                  <el-input v-model="formData.salaryRange" placeholder="薪资范围" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="报名截止">
                  <el-date-picker v-model="formData.regDeadline" type="datetime" placeholder="报名截止" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="专业要求">
              <el-select
                v-model="formData.majorRequirements"
                multiple
                filterable
                allow-create
                placeholder="输入专业后按回车添加"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="备注信息" name="remarks">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="备注类型">
                  <el-input v-model="formData.remarkType" placeholder="备注类型" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="备注描述">
                  <el-input v-model="formData.remarkDesc" placeholder="备注描述" maxlength="500" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="咨询电话">
                  <el-input v-model="formData.consultationPhone" placeholder="咨询电话" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="监督电话">
                  <el-input v-model="formData.supervisionPhone" placeholder="监督电话" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="特殊岗位">
                  <el-input v-model="formData.specialPosition" placeholder="特殊岗位" maxlength="200" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="其他要求">
                  <el-input v-model="formData.otherRequirement" placeholder="其他要求" maxlength="200" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="其他要求描述">
              <el-input v-model="formData.otherRequirementDesc" type="textarea" :rows="3" placeholder="其他要求描述" maxlength="500" show-word-limit />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="状态与标签" name="status">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="招聘状态">
                  <el-select v-model="formData.positionStatus" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="职位标签">
                  <el-input v-model="formData.positionTag" placeholder="职位标签" maxlength="100" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="标签文字">
                  <el-input v-model="formData.tagText" placeholder="标签文字" maxlength="200" />
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
