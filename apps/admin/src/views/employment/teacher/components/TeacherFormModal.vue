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

const schoolTypeOptions = ['幼儿园', '小学', '初中', '高中', '中职', '高职', '大学', '特殊教育学校']
const schoolNatureOptions = ['公办', '民办']
const recruitmentTypeOptions = ['编制', '合同制', '特岗教师', '人事代理', '编外聘用']
const subjectOptions = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '音乐', '美术', '体育', '信息技术', '心理健康', '通用技术', '科学', '道德与法律', '综合实践', '学前教育', '特殊教育', '其他']
const educationOptions = ['不限', '大专', '本科', '硕士', '博士']
const putonghuaOptions = ['不限', '二级乙等', '二级甲等', '一级乙等', '一级甲等']
const normalMajorOptions = ['要求', '优先', '不限']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']

watch(() => props.visible, (val) => {
  if (val) {
    activeTab.value = 'basic'
    formData.value = { ...props.initialData }
  }
})

const handleClose = () => { emit('update:visible', false) }

const handleSubmit = () => {
  const data: Record<string, any> = {}
  const stringFields = ['schoolName', 'schoolType', 'schoolNature', 'supervisingDept', 'positionName', 'subject', 'recruitmentType', 'province', 'city', 'district', 'educationRequirement', 'degreeRequirement', 'majorRequirement', 'teacherCertRequirement', 'teacherCertSubject', 'putonghuaLevel', 'otherCertRequirement', 'workExperience', 'isNormalMajor', 'salaryRange', 'benefits', 'examContent', 'interviewForm', 'regStartDate', 'regEndDate', 'examTime', 'positionStatus', 'applyLink', 'contactPhone', 'remark', 'content']
  stringFields.forEach((f) => { if (formData.value[f]) data[f] = formData.value[f] })
  const numberFields = ['ageLimit', 'recruitmentCount', 'sortOrder']
  numberFields.forEach((f) => { if (formData.value[f] !== null && formData.value[f] !== '') data[f] = formData.value[f] })
  emit('submit', data)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="修改教师岗位"
    width="900px"
    class="form-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="dialog-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="学校与岗位信息" name="basic">
          <el-form :model="formData" label-width="120px" class="mt-2">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学校名称">
                  <el-input v-model="formData.schoolName" placeholder="学校名称" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="学校类型">
                  <el-select v-model="formData.schoolType" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in schoolTypeOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学校性质">
                  <el-select v-model="formData.schoolNature" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in schoolNatureOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="主管部门">
                  <el-input v-model="formData.supervisingDept" placeholder="主管部门" maxlength="100" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="岗位名称">
                  <el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="学科">
                  <el-select v-model="formData.subject" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in subjectOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="招聘类型">
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
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="教师资格证要求">
                  <el-input v-model="formData.teacherCertRequirement" placeholder="教师资格证要求" maxlength="200" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="教师资格证学科">
                  <el-input v-model="formData.teacherCertSubject" placeholder="教师资格证学科" maxlength="100" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="普通话等级">
                  <el-select v-model="formData.putonghuaLevel" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in putonghuaOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="师范专业要求">
                  <el-select v-model="formData.isNormalMajor" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in normalMajorOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="其他证书要求">
              <el-input v-model="formData.otherCertRequirement" placeholder="其他证书要求" maxlength="500" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="薪资范围">
                  <el-input v-model="formData.salaryRange" placeholder="薪资范围" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序">
                  <el-input-number v-model="formData.sortOrder" style="width: 100%" />
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
              <el-col :span="12">
                <el-form-item label="面试形式">
                  <el-input v-model="formData.interviewForm" placeholder="面试形式" maxlength="200" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="考试时间">
                  <el-input v-model="formData.examTime" placeholder="考试时间" maxlength="100" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="报名开始">
                  <el-input v-model="formData.regStartDate" placeholder="报名开始时间" maxlength="30" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="报名截止">
                  <el-input v-model="formData.regEndDate" placeholder="报名截止时间" maxlength="30" />
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
            <el-form-item label="报名链接">
              <el-input v-model="formData.applyLink" placeholder="报名链接" maxlength="500" />
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
