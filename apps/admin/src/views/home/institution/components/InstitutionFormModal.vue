<script setup lang="ts">
/**
 * 培训机构 - 新增 / 修改弹窗
 *
 * 表单分区（el-tabs）：
 *   1. 基础信息：分类 / 名称 / 省份 / 创办时间 / 管理账号 / 排序值
 *   2. 展示信息：标签 / 简介 / 主打方向 / 班级规模 / 师资配置 / 上课形式 / 提示语 / 优势
 *   3. 轮播图：carouselImages 多图
 *   4. 主打班型：classTypes 对象数组（专用子表单）
 *   5. 联系方式：地址 / 微信二维码 / 邮箱 / 电话
 *
 * 校验：el-form rules，镜像后端 InstitutionAddDTO 的约束。
 */
import { computed, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ProvinceOptions } from '@haifeng/shared'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { uploadInstitutionImage } from '@/api/common/upload'
import TagEditor from '@/components/common/TagEditor.vue'
import InstitutionClassTypeEditor from './InstitutionClassTypeEditor.vue'
import { INSTITUTION_CATEGORY_OPTIONS } from '../../constants'
import type {
  InstitutionAddDTO,
  InstitutionClassType,
} from '@/types/home/institution'
import type { TeacherOptionVO } from '@/types/home/planner'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  formLoading: boolean
  initialData?: InstitutionAddDTO | null
  teacherOptions: TeacherOptionVO[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', data: InstitutionAddDTO): void
  /** 真实上传成功（透传给列表页追踪孤儿图，关闭时回收） */
  (e: 'uploaded', url: string): void
}>()

const activeTab = ref('basic')
const formRef = ref<FormInstance>()

const formData = ref<InstitutionAddDTO>({
  category: '',
  userId: '',
  name: '',
  province: '',
  foundedYear: '',
  carouselImages: [],
  tags: [],
  introduction: '',
  mainDirection: '',
  classSize: '',
  teacherConfig: '',
  courseForm: '',
  classTypes: [],
  notice: '',
  advantages: [],
  address: '',
  wechatQrcodeUrl: '',
  email: '',
  phone: '',
  sortOrder: 0,
})

const rules = computed<FormRules>(() => ({
  category: [{ required: true, message: '请选择机构分类', trigger: 'change' }],
  userId: [{ required: true, message: '请选择管理账号', trigger: 'change' }],
  name: [
    { required: true, message: '请输入机构名称', trigger: 'blur' },
    { max: 128, message: '机构名称最长 128 字符', trigger: 'blur' },
  ],
  province: [{ required: true, message: '请选择省份', trigger: 'change' }],
  foundedYear: [{ max: 32, message: '创办时间最长 32 字符', trigger: 'blur' }],
  introduction: [{ max: 5000, message: '机构简介最长 5000 字符', trigger: 'blur' }],
  mainDirection: [{ max: 64, message: '主打方向最长 64 字符', trigger: 'blur' }],
  classSize: [{ max: 32, message: '班级规模最长 32 字符', trigger: 'blur' }],
  teacherConfig: [{ max: 256, message: '师资配置最长 256 字符', trigger: 'blur' }],
  courseForm: [{ max: 64, message: '上课形式最长 64 字符', trigger: 'blur' }],
  notice: [{ max: 512, message: '提示语最长 512 字符', trigger: 'blur' }],
  address: [{ max: 256, message: '地址最长 256 字符', trigger: 'blur' }],
  email: [
    { max: 128, message: '邮箱最长 128 字符', trigger: 'blur' },
    {
      pattern: /^[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(\.[\w-]+)+$/,
      message: '邮箱格式不正确',
      trigger: 'blur',
    },
  ],
  phone: [
    { max: 20, message: '联系电话最长 20 字符', trigger: 'blur' },
    { pattern: /^[0-9+()\-\s]{5,20}$/, message: '联系电话格式不正确', trigger: 'blur' },
  ],
}))

/** 数组字段的可写代理：formData 里是可选类型，子组件要求必填数组 */
const tagsProxy = computed<string[]>({
  get: () => formData.value.tags ?? [],
  set: (v) => { formData.value.tags = v },
})
const advantagesProxy = computed<string[]>({
  get: () => formData.value.advantages ?? [],
  set: (v) => { formData.value.advantages = v },
})
const carouselImagesProxy = computed<string[]>({
  get: () => formData.value.carouselImages ?? [],
  set: (v) => { formData.value.carouselImages = v },
})
const classTypesProxy = computed<InstitutionClassType[]>({
  get: () => formData.value.classTypes ?? [],
  set: (v) => { formData.value.classTypes = v },
})

watch(
  () => [props.visible, props.initialData, props.mode] as const,
  ([visible, initial, mode]) => {
    if (!visible) return
    activeTab.value = 'basic'
    formRef.value?.clearValidate()
    if (mode === 'edit' && initial) {
      formData.value = {
        category: initial.category,
        userId: initial.userId,
        name: initial.name,
        province: initial.province,
        foundedYear: initial.foundedYear || '',
        carouselImages: initial.carouselImages ? [...initial.carouselImages] : [],
        tags: initial.tags ? [...initial.tags] : [],
        introduction: initial.introduction || '',
        mainDirection: initial.mainDirection || '',
        classSize: initial.classSize || '',
        teacherConfig: initial.teacherConfig || '',
        courseForm: initial.courseForm || '',
        classTypes: (initial.classTypes || []).map((c) => ({
          title: c.title,
          introduction: c.introduction || '',
          tag: c.tag || '',
        })),
        notice: initial.notice || '',
        advantages: initial.advantages ? [...initial.advantages] : [],
        address: initial.address || '',
        wechatQrcodeUrl: initial.wechatQrcodeUrl || '',
        email: initial.email || '',
        phone: initial.phone || '',
        sortOrder: initial.sortOrder ?? 0,
      }
    } else {
      formData.value = {
        category: '',
        userId: '',
        name: '',
        province: '',
        foundedYear: '',
        carouselImages: [],
        tags: [],
        introduction: '',
        mainDirection: '',
        classSize: '',
        teacherConfig: '',
        courseForm: '',
        classTypes: [],
        notice: '',
        advantages: [],
        address: '',
        wechatQrcodeUrl: '',
        email: '',
        phone: '',
        sortOrder: 0,
      }
    }
  },
  { immediate: true },
)

/** 字段所属分区（用于校验失败时自动跳到对应 tab） */
const TAB_BY_FIELD: Record<string, string> = {
  category: 'basic',
  userId: 'basic',
  name: 'basic',
  province: 'basic',
  foundedYear: 'basic',
  sortOrder: 'basic',
  tags: 'display',
  introduction: 'display',
  mainDirection: 'display',
  classSize: 'display',
  teacherConfig: 'display',
  courseForm: 'display',
  notice: 'display',
  advantages: 'display',
  carouselImages: 'carousel',
  classTypes: 'classTypes',
  address: 'contact',
  wechatQrcodeUrl: 'contact',
  email: 'contact',
  phone: 'contact',
}

const handleSubmit = async () => {
  if (!formRef.value) return

  let firstInvalidField = ''
  let valid = true
  try {
    await formRef.value.validate((invalidFields) => {
      const keys = Object.keys(invalidFields || {})
      if (keys.length) {
        valid = false
        firstInvalidField = keys[0]
      }
    })
  } catch {
    valid = false
  }

  if (!valid) {
    if (firstInvalidField.startsWith('classTypes.')) {
      activeTab.value = 'classTypes'
    } else {
      activeTab.value = TAB_BY_FIELD[firstInvalidField] || 'basic'
    }
    ElMessage.warning('请检查表单填写')
    return
  }

  const d = formData.value
  const payload: InstitutionAddDTO = {
    category: d.category,
    userId: d.userId,
    name: d.name.trim(),
    province: d.province,
    sortOrder: d.sortOrder ?? 0,
  }
  if (d.foundedYear) payload.foundedYear = d.foundedYear.trim()
  // 图片字段必须显式提交（清空时传空串/空数组），否则后端收不到字段、
  // MyBatis-Plus 默认 NOT_NULL 策略不会写入，DB 残留旧 URL 而 OSS 旧图已被删。
  payload.carouselImages = d.carouselImages ? [...d.carouselImages] : []
  if (d.tags && d.tags.length) payload.tags = [...d.tags]
  if (d.introduction) payload.introduction = d.introduction.trim()
  if (d.mainDirection) payload.mainDirection = d.mainDirection.trim()
  if (d.classSize) payload.classSize = d.classSize.trim()
  if (d.teacherConfig) payload.teacherConfig = d.teacherConfig.trim()
  if (d.courseForm) payload.courseForm = d.courseForm.trim()
  if (d.classTypes && d.classTypes.length) {
    payload.classTypes = d.classTypes.map((c) => ({
      title: c.title,
      introduction: c.introduction || '',
      tag: c.tag || '',
    }))
  }
  if (d.notice) payload.notice = d.notice.trim()
  if (d.advantages && d.advantages.length) payload.advantages = [...d.advantages]
  if (d.address) payload.address = d.address.trim()
  payload.wechatQrcodeUrl = d.wechatQrcodeUrl?.trim() || ''
  if (d.email) payload.email = d.email.trim()
  if (d.phone) payload.phone = d.phone.trim()

  emit('submit', payload)
}

const handleClose = () => {
  emit('update:visible', false)
}

const dialogTitle = computed(() => (props.mode === 'add' ? '新增培训机构' : '修改培训机构'))
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="900px"
    top="6vh"
    class="form-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="form-content">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px" class="inst-form">
        <el-tabs v-model="activeTab" class="inst-tabs">
          <!-- 基础信息 -->
          <el-tab-pane label="基础信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="机构分类" prop="category">
                  <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
                    <el-option
                      v-for="opt in INSTITUTION_CATEGORY_OPTIONS"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="机构名称" prop="name">
                  <el-input v-model="formData.name" placeholder="请输入机构名称" maxlength="128" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="省份" prop="province">
                  <el-select v-model="formData.province" placeholder="请选择省份" clearable filterable style="width: 100%">
                    <el-option
                      v-for="opt in ProvinceOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="创办时间" prop="foundedYear">
                  <el-input v-model="formData.foundedYear" placeholder="如：2013年" maxlength="32" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="管理账号" prop="userId">
                  <el-select v-model="formData.userId" placeholder="请选择教师账号" filterable style="width: 100%">
                    <el-option
                      v-for="opt in teacherOptions"
                      :key="opt.id"
                      :label="opt.username"
                      :value="opt.id"
                    />
                  </el-select>
                  <div class="field-tip">一个账号只能绑定一个机构</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序值" prop="sortOrder">
                  <el-input-number v-model="formData.sortOrder" :min="0" :max="999999" controls-position="right" class="full-width" />
                  <div class="field-tip">数值越小越靠前</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <!-- 展示信息 -->
          <el-tab-pane label="展示信息" name="display">
            <el-form-item label="机构标签" prop="tags">
              <TagEditor v-model="tagsProxy" :max="10" :max-length="30" placeholder="C 端机构卡片展示的标签" />
            </el-form-item>
            <el-form-item label="机构简介" prop="introduction">
              <el-input
                v-model="formData.introduction"
                type="textarea"
                :rows="4"
                placeholder="机构简介（纯文本，C 端以段落展示）"
                maxlength="5000"
                show-word-limit
              />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="主打方向" prop="mainDirection">
                  <el-input v-model="formData.mainDirection" placeholder="如：文化课冲刺" maxlength="64" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="班级规模" prop="classSize">
                  <el-input v-model="formData.classSize" placeholder="如：15人以内" maxlength="32" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="师资配置" prop="teacherConfig">
                  <el-input v-model="formData.teacherConfig" placeholder="如：在职名师 30+" maxlength="256" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="上课形式" prop="courseForm">
                  <el-input v-model="formData.courseForm" placeholder="如：全日制+周末班" maxlength="64" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="提示语" prop="notice">
              <el-input
                v-model="formData.notice"
                type="textarea"
                :rows="2"
                placeholder="如：以当期招生简章为准（C 端以琥珀色提示条展示）"
                maxlength="512"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="机构优势" prop="advantages">
              <TagEditor v-model="advantagesProxy" :max="10" :max-length="100" placeholder="C 端详情页「机构优势」列表条目" />
            </el-form-item>
          </el-tab-pane>

          <!-- 轮播图 -->
          <el-tab-pane label="轮播图" name="carousel">
            <el-form-item label="轮播图片">
              <ImageUpload
                v-model:model-values="carouselImagesProxy"
                :upload-fn="uploadInstitutionImage"
                :max="10"
                :preview-size="88"
                placeholder="最多 10 张；C 端机构详情页以画廊形式展示"
                @uploaded="emit('uploaded', $event)"
              />
            </el-form-item>
          </el-tab-pane>

          <!-- 主打班型 -->
          <el-tab-pane label="主打班型" name="classTypes">
            <el-form-item label="主打班型">
              <InstitutionClassTypeEditor v-model="classTypesProxy" />
            </el-form-item>
          </el-tab-pane>

          <!-- 联系方式 -->
          <el-tab-pane label="联系方式" name="contact">
            <el-form-item label="地址" prop="address">
              <el-input v-model="formData.address" placeholder="选填，机构办公地址" maxlength="256" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="formData.email" placeholder="选填，用于咨询联系" maxlength="128" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="phone">
                  <el-input v-model="formData.phone" placeholder="选填，用于电话咨询" maxlength="20" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="微信二维码">
              <ImageUpload
                v-model="formData.wechatQrcodeUrl"
                :upload-fn="uploadInstitutionImage"
                :preview-size="80"
                placeholder="选填，C 端机构详情页展示，供家长扫码咨询"
                @uploaded="emit('uploaded', $event)"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">取消</button>
        <button type="button" class="submit-btn" @click="handleSubmit">
          {{ mode === 'add' ? '确认新增' : '保存修改' }}
        </button>
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
  padding: 16px 24px 24px;
  max-height: 70vh;
  overflow-y: auto;
}
.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.inst-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
.inst-form :deep(.el-input__wrapper),
.inst-form :deep(.el-textarea__inner),
.inst-form :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}
.inst-form :deep(.el-input__wrapper:hover),
.inst-form :deep(.el-textarea__inner:hover),
.inst-form :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.inst-form :deep(.el-input__wrapper.is-focus),
.inst-form :deep(.el-textarea__inner:focus),
.inst-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.inst-tabs :deep(.el-tabs__header) { margin-bottom: 18px; }
.inst-tabs :deep(.el-tabs__item) {
  font-weight: 500;
  color: #6b7280;
}
.inst-tabs :deep(.el-tabs__item.is-active) {
  color: #C2410C;
  font-weight: 600;
}
.inst-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, #F97316, #FB923C);
}
.inst-tabs :deep(.el-tabs__nav-wrap::after) { background-color: #f3f4f6; }

.full-width {
  width: 100%;
}
.full-width :deep(.el-input) {
  width: 100%;
  min-width: 0;
}

.field-tip {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.cancel-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 24px;
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
.cancel-btn:active { background: #f3f4f6; }
.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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
.submit-btn:active { transform: translateY(0); }
</style>
