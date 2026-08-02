<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
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

const dialogTitle = computed(() => (props.mode === 'add' ? '新增医疗卫生岗位' : '修改医疗卫生岗位'))

const activeTab = ref('basic')
const formData = ref<Record<string, any>>({})

const formRefBasic = ref<FormInstance>()
const formRefLocation = ref<FormInstance>()

// 必填校验（与后端 HealthcarePositionAddDTO @NotBlank 字段对齐）
const basicRules: FormRules = {
  institutionName: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
  institutionType: [{ required: true, message: '请选择机构类型', trigger: 'change' }],
  positionName: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  positionCategory: [{ required: true, message: '请选择岗位类别', trigger: 'change' }],
}
const locationRules: FormRules = {
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
}

const institutionTypeOptions = ['综合医院', '专科医院', '中医医院', '社区卫生服务中心', '疾控中心', '妇幼保健院', '卫生监督所', '急救中心', '血站', '精神卫生中心', '康复中心', '其他']
const institutionLevelOptions = ['三级甲等', '三级乙等', '二级甲等', '二级乙等', '一级', '未定级', '社区']
const institutionNatureOptions = ['公立', '民营']
const positionCategoryOptions = ['临床医师', '护理', '药学', '医技', '公共卫生', '行政后勤', '科研']
const recruitmentTypeOptions = ['编制', '合同制', '人事代理', '规培', '进修']
const educationOptions = ['不限', '大专', '本科', '硕士', '博士']
const degreeOptions = ['不限', '学士', '硕士', '博士']
const provinceOptions = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '香港', '澳门', '台湾']
const titleOptions = ['不限', '初级', '中级', '副高级', '正高级']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']

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

const handleClose = () => { emit('update:visible', false) }

const handleSubmit = async () => {
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
  const data: Record<string, any> = {}
  const stringFields = ['institutionName', 'institutionType', 'institutionLevel', 'institutionNature', 'positionName', 'department', 'positionCategory', 'recruitmentType', 'province', 'city', 'district', 'educationRequirement', 'degreeRequirement', 'majorRequirement', 'workExperience', 'licenseRequirement', 'titleRequirement', 'internshipRequirement', 'researchRequirement', 'salaryRange', 'housingSubsidy', 'benefits', 'examContent', 'regStartDate', 'regEndDate', 'examTime', 'positionStatus', 'applyLink', 'contactPhone', 'contactPerson', 'remark', 'content']
  stringFields.forEach((f) => { if (formData.value[f]) data[f] = formData.value[f] })
  const numberFields = ['ageLimit', 'recruitmentCount', 'sortOrder']
  numberFields.forEach((f) => { if (formData.value[f] !== null && formData.value[f] !== '') data[f] = formData.value[f] })
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
                <el-form-item label="机构类型" prop="institutionType">
                  <el-select v-model="formData.institutionType" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in institutionTypeOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="机构等级">
                  <el-select v-model="formData.institutionLevel" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in institutionLevelOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="机构性质">
                  <el-select v-model="formData.institutionNature" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in institutionNatureOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="岗位名称" prop="positionName">
                  <el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="岗位类别" prop="positionCategory">
                  <el-select v-model="formData.positionCategory" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in positionCategoryOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="科室">
                  <el-input v-model="formData.department" placeholder="科室" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="招聘类型">
                  <el-select v-model="formData.recruitmentType" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in recruitmentTypeOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="地区与报考要求" name="location">
          <el-form ref="formRefLocation" :model="formData" :rules="locationRules" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="省份" prop="province">
                  <el-select v-model="formData.province" placeholder="请选择" clearable filterable allow-create default-first-option style="width: 100%">
                    <el-option v-for="item in provinceOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="城市">
                  <el-input v-model="formData.city" placeholder="城市" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="区县">
                  <el-input v-model="formData.district" placeholder="区县" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
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
            <el-form-item label="专业要求">
              <el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="年龄上限">
                  <el-input-number v-model="formData.ageLimit" :min="18" :max="65" style="width: 100%" />
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

        <el-tab-pane label="资质与待遇" name="cert">
          <el-form :model="formData" label-width="140px" class="mt-2">
            <el-form-item label="执业资格要求">
              <el-input v-model="formData.licenseRequirement" placeholder="执业资格要求" maxlength="500" show-word-limit />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="职称要求">
                  <el-select v-model="formData.titleRequirement" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in titleOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="规培要求">
                  <el-input v-model="formData.internshipRequirement" placeholder="规培要求" maxlength="200" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="科研要求">
              <el-input v-model="formData.researchRequirement" type="textarea" :rows="3" placeholder="科研要求" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="薪资范围">
                  <el-input v-model="formData.salaryRange" placeholder="薪资范围" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="住房补贴">
                  <el-input v-model="formData.housingSubsidy" placeholder="住房补贴" maxlength="100" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="福利待遇">
              <el-input v-model="formData.benefits" type="textarea" :rows="3" placeholder="福利待遇" />
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
                <el-form-item label="考试时间">
                  <el-date-picker v-model="formData.examTime" type="datetime" placeholder="考试时间" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="状态">
                  <el-select v-model="formData.positionStatus" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话">
                  <el-input v-model="formData.contactPhone" placeholder="联系电话" maxlength="200" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系人">
                  <el-input v-model="formData.contactPerson" placeholder="联系人" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="网申链接">
                  <el-input v-model="formData.applyLink" placeholder="网申链接" maxlength="500" />
                </el-form-item>
              </el-col>
            </el-row>
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
