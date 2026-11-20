<script setup lang="ts">
/**
 * 规划师 - 新增 / 修改弹窗
 *
 * 表单分区（el-tabs）：
 *   1. 基础信息：姓名 / 服务对象 / 职位 / 省份 / 绑定账号 / 排序值 / 头像
 *   2. 展示文案：列表描述 / 列表标签 / 从业年限 / 服务考生 / 初稿时效 / 认证描述 / 详情介绍 / 详情标签
 *   3. 服务内容：services 对象数组（专用子表单）
 *   4. 联系方式：邮箱 / 手机号 / 地址 / 微信二维码
 *
 * 校验：el-form rules，镜像后端 PlannerAddDTO 的 @NotBlank / @Size / @Pattern 约束。
 */
import { computed, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ProvinceOptions } from '@haifeng/shared'
import ImageUpload from '@/components/common/ImageUpload.vue'
import TagEditor from '@/components/common/TagEditor.vue'
import PlannerServiceEditor from './PlannerServiceEditor.vue'
import { SERVICE_TARGET_OPTIONS } from '../../constants'
import type {
  PlannerAddDTO,
  PlannerServiceItem,
  TeacherOptionVO,
} from '@/types/home/planner'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  formLoading: boolean
  initialData?: PlannerAddDTO | null
  teacherOptions: TeacherOptionVO[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', data: PlannerAddDTO): void
  /** 真实上传成功（透传给列表页追踪孤儿图，关闭时回收） */
  (e: 'uploaded', url: string): void
}>()

const activeTab = ref('basic')
const formRef = ref<FormInstance>()

const formData = ref<PlannerAddDTO>({
  userId: '',
  name: '',
  serviceTarget: '',
  position: '',
  province: '',
  listDesc: '',
  listTags: [],
  avatarUrl: '',
  workYears: '',
  servedCount: '',
  draftSla: '',
  certDesc: '',
  description: '',
  detailTags: [],
  services: [],
  email: '',
  phone: '',
  address: '',
  wechatQrcodeUrl: '',
  sortOrder: 0,
})

const rules = computed<FormRules>(() => ({  userId: [{ required: true, message: '请选择绑定的教师账号', trigger: 'change' }],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { max: 64, message: '姓名最长 64 字符', trigger: 'blur' },
  ],
  serviceTarget: [{ required: true, message: '请选择服务对象', trigger: 'change' }],
  province: [{ max: 30, message: '省份最长 30 字符', trigger: 'blur' }],
  listDesc: [{ max: 512, message: '列表描述最长 512 字符', trigger: 'blur' }],
  workYears: [{ max: 32, message: '从业年限最长 32 字符', trigger: 'blur' }],
  servedCount: [{ max: 32, message: '服务考生最长 32 字符', trigger: 'blur' }],
  draftSla: [{ max: 32, message: '初稿时效最长 32 字符', trigger: 'blur' }],
  certDesc: [{ max: 256, message: '认证描述最长 256 字符', trigger: 'blur' }],
  email: [
    { max: 128, message: '邮箱最长 128 字符', trigger: 'blur' },
    {
      pattern: /^[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(\.[\w-]+)+$/,
      message: '邮箱格式不正确',
      trigger: 'blur',
    },
  ],
  phone: [
    { max: 20, message: '手机号最长 20 字符', trigger: 'blur' },
    { pattern: /^[0-9+()\-\s]{5,20}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  address: [{ max: 256, message: '地址最长 256 字符', trigger: 'blur' }],
}))

function toFormData(d: PlannerAddDTO): PlannerAddDTO {
  return {
    userId: d.userId,
    name: d.name,
    serviceTarget: d.serviceTarget,
    position: d.position || '',
    province: d.province || '',
    listDesc: d.listDesc || '',
    listTags: d.listTags ? [...d.listTags] : [],
    avatarUrl: d.avatarUrl || '',
    workYears: d.workYears || '',
    servedCount: d.servedCount || '',
    draftSla: d.draftSla || '',
    certDesc: d.certDesc || '',
    description: d.description || '',
    detailTags: d.detailTags ? [...d.detailTags] : [],
    services: (d.services || []).map((s) => ({ title: s.title, content: s.content })),
    email: d.email || '',
    phone: d.phone || '',
    address: d.address || '',
    wechatQrcodeUrl: d.wechatQrcodeUrl || '',
    sortOrder: d.sortOrder ?? 0,
  }
}

watch(
  () => [props.visible, props.initialData, props.mode] as const,
  ([visible, initial, mode]) => {
    if (!visible) return
    activeTab.value = 'basic'
    formRef.value?.clearValidate()
    if (mode === 'edit' && initial) {
      formData.value = toFormData(initial)
    } else {
      formData.value = {
        userId: '',
        name: '',
        serviceTarget: '',
        position: '',
        province: '',
        listDesc: '',
        listTags: [],
        avatarUrl: '',
        workYears: '',
        servedCount: '',
        draftSla: '',
        certDesc: '',
        description: '',
        detailTags: [],
        services: [],
        email: '',
        phone: '',
        address: '',
        wechatQrcodeUrl: '',
        sortOrder: 0,
      }
    }
  },
  { immediate: true },
)

/** 字段所属分区（用于校验失败时自动跳到对应 tab） */
const TAB_BY_FIELD: Record<string, string> = {
  userId: 'basic',
  name: 'basic',
  serviceTarget: 'basic',
  position: 'basic',
  province: 'basic',
  sortOrder: 'basic',
  listDesc: 'display',
  listTags: 'display',
  workYears: 'display',
  servedCount: 'display',
  draftSla: 'display',
  certDesc: 'display',
  description: 'display',
  detailTags: 'display',
  email: 'contact',
  phone: 'contact',
  address: 'contact',
}

/** 数组字段的可写代理：formData 里是可选类型，子组件要求必填数组 */
const listTagsProxy = computed<string[]>({
  get: () => formData.value.listTags ?? [],
  set: (v) => { formData.value.listTags = v },
})
const detailTagsProxy = computed<string[]>({
  get: () => formData.value.detailTags ?? [],
  set: (v) => { formData.value.detailTags = v },
})
const servicesProxy = computed<PlannerServiceItem[]>({
  get: () => formData.value.services ?? [],
  set: (v) => { formData.value.services = v },
})

const handleSubmit = async () => {
  if (!formRef.value) return

  // 收集校验失败的字段，用于自动跳转到对应分区
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
    if (firstInvalidField.startsWith('services.')) {
      activeTab.value = 'services'
    } else {
      activeTab.value = TAB_BY_FIELD[firstInvalidField] || 'basic'
    }
    ElMessage.warning('请检查表单填写')
    return
  }

  const d = formData.value
  const payload: PlannerAddDTO = {
    userId: d.userId,
    name: d.name.trim(),
    serviceTarget: d.serviceTarget,
    sortOrder: d.sortOrder ?? 0,
  }
  if (d.position) payload.position = d.position.trim()
  if (d.province) payload.province = d.province
  if (d.listDesc) payload.listDesc = d.listDesc.trim()
  if (d.listTags && d.listTags.length) payload.listTags = [...d.listTags]
  // 图片字段必须显式提交（清空时传空串），否则后端收不到字段、
  // MyBatis-Plus 默认 NOT_NULL 策略不会写入，DB 残留旧 URL 而 OSS 旧图已被删。
  payload.avatarUrl = d.avatarUrl || ''
  if (d.workYears) payload.workYears = d.workYears.trim()
  if (d.servedCount) payload.servedCount = d.servedCount.trim()
  if (d.draftSla) payload.draftSla = d.draftSla.trim()
  if (d.certDesc) payload.certDesc = d.certDesc.trim()
  if (d.description) payload.description = d.description.trim()
  if (d.detailTags && d.detailTags.length) payload.detailTags = [...d.detailTags]
  if (d.services && d.services.length) payload.services = d.services.map((s: PlannerServiceItem) => ({ title: s.title, content: s.content }))
  if (d.email) payload.email = d.email.trim()
  if (d.phone) payload.phone = d.phone.trim()
  if (d.address) payload.address = d.address.trim()
  payload.wechatQrcodeUrl = d.wechatQrcodeUrl?.trim() || ''

  emit('submit', payload)
}

const handleClose = () => {
  emit('update:visible', false)
}

const dialogTitle = computed(() => (props.mode === 'add' ? '新增规划师' : '修改规划师'))
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
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px" class="planner-form">
        <el-tabs v-model="activeTab" class="planner-tabs">
          <!-- 基础信息 -->
          <el-tab-pane label="基础信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="formData.name" placeholder="请输入姓名" maxlength="64" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="服务对象" prop="serviceTarget">
                  <el-select v-model="formData.serviceTarget" placeholder="请选择服务对象" style="width: 100%">
                    <el-option
                      v-for="opt in SERVICE_TARGET_OPTIONS"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="职位" prop="position">
                  <el-input v-model="formData.position" placeholder="如：首席规划师" maxlength="64" />
                </el-form-item>
              </el-col>
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
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="绑定账号" prop="userId">
                  <el-select v-model="formData.userId" placeholder="请选择教师账号" filterable style="width: 100%">
                    <el-option
                      v-for="opt in teacherOptions"
                      :key="opt.id"
                      :label="opt.username"
                      :value="opt.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序值" prop="sortOrder">
                  <el-input-number v-model="formData.sortOrder" :min="0" controls-position="right" class="full-width" />
                  <div class="field-tip">数值越小越靠前</div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="头像">
              <ImageUpload
                v-model="formData.avatarUrl"
                :preview-size="80"
                placeholder="建议上传正方形头像；C 端列表与详情页均使用此图"
                @uploaded="emit('uploaded', $event)"
              />
            </el-form-item>
          </el-tab-pane>

          <!-- 展示文案 -->
          <el-tab-pane label="展示文案" name="display">
            <el-form-item label="列表描述" prop="listDesc">
              <el-input
                v-model="formData.listDesc"
                type="textarea"
                :rows="2"
                placeholder="列表卡片的一句话简介，C 端列表页展示"
                maxlength="512"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="列表标签" prop="listTags">
              <TagEditor v-model="listTagsProxy" :max="10" :max-length="30" placeholder="C 端列表卡片展示的小标签" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="从业年限" prop="workYears">
                  <el-input v-model="formData.workYears" placeholder="如：11年" maxlength="32" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="服务考生" prop="servedCount">
                  <el-input v-model="formData.servedCount" placeholder="如：3200+" maxlength="32" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="初稿时效" prop="draftSla">
                  <el-input v-model="formData.draftSla" placeholder="如：48h" maxlength="32" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="认证描述" prop="certDesc">
              <el-input v-model="formData.certDesc" placeholder="如：持证生涯规划师" maxlength="256" show-word-limit />
            </el-form-item>
            <el-form-item label="详情介绍" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="4"
                placeholder="详情页的大段介绍（纯文本，C 端以段落展示）"
              />
            </el-form-item>
            <el-form-item label="详情标签" prop="detailTags">
              <TagEditor v-model="detailTagsProxy" :max="10" :max-length="30" placeholder="C 端详情页展示的能力标签" />
            </el-form-item>
          </el-tab-pane>

          <!-- 服务内容 -->
          <el-tab-pane label="服务内容" name="services">
            <el-form-item label="服务内容">
              <PlannerServiceEditor v-model="servicesProxy" />
            </el-form-item>
          </el-tab-pane>

          <!-- 联系方式 -->
          <el-tab-pane label="联系方式" name="contact">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="formData.email" placeholder="选填，用于预约联系" maxlength="128" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="formData.phone" placeholder="选填，用于预约联系" maxlength="20" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="地址" prop="address">
              <el-input v-model="formData.address" placeholder="选填，办公或咨询地址" maxlength="256" />
            </el-form-item>
            <el-form-item label="微信二维码">
              <ImageUpload
                v-model="formData.wechatQrcodeUrl"
                :preview-size="80"
                placeholder="选填，C 端预约弹窗中展示，供考生扫码联系"
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

.planner-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
.planner-form :deep(.el-input__wrapper),
.planner-form :deep(.el-textarea__inner),
.planner-form :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}
.planner-form :deep(.el-input__wrapper:hover),
.planner-form :deep(.el-textarea__inner:hover),
.planner-form :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.planner-form :deep(.el-input__wrapper.is-focus),
.planner-form :deep(.el-textarea__inner:focus),
.planner-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.planner-tabs :deep(.el-tabs__header) {
  margin-bottom: 18px;
}
.planner-tabs :deep(.el-tabs__item) {
  font-weight: 500;
  color: #6b7280;
}
.planner-tabs :deep(.el-tabs__item.is-active) {
  color: #C2410C;
  font-weight: 600;
}
.planner-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, #F97316, #FB923C);
}
.planner-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: #f3f4f6;
}

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
