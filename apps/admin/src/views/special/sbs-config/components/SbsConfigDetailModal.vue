<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getStrongBaseUnivDetail,
  addStrongBaseUniv,
  updateStrongBaseUniv,
} from '@/api/special/strong-base-univ'
import { getUniversityPage } from '@/api/university/info'
import type {
  StrongBaseUnivDetailVO,
  StrongBaseUnivAddDTO,
  StrongBaseUnivUpdateDTO,
} from '@/types/special/strong-base-univ'

const props = defineProps<{
  visible: boolean
  mode: 'detail' | 'add' | 'edit'
  currentId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const formLoading = ref(false)
const detailData = ref<StrongBaseUnivDetailVO | null>(null)

const formData = ref<StrongBaseUnivAddDTO>({
  universityId: '',
  universityName: '',
  isPilot: true,
  pilotYear: undefined,
  officialUrl: '',
  signupUrl: '',
  testBeforeScore: false,
  defaultEntryRatio: '1:5',
  defaultAdmissionFormula: '',
  availableMajors: [],
  specialNotes: '',
})

const availableMajorsStr = ref('')

const universityOptions = ref<{ label: string; value: string }[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

const handleUniversitySearch = (query: string) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    if (!query) {
      universityOptions.value = []
      return
    }
    try {
      const res = await getUniversityPage({ page: 1, size: 100, name: query })
      if (res.data.code === 200) {
        universityOptions.value = res.data.data.records.map((r: any) => ({
          label: r.name,
          value: r.id,
        }))
      }
    } catch { /* ignore */ }
  }, 300)
}

const onUniversityChange = (id: string) => {
  formData.value.universityId = id
  const option = universityOptions.value.find((o) => o.value === id)
  if (option) {
    formData.value.universityName = option.label
  }
}

const dialogTitle = (() => {
  if (props.mode === 'add') return '新增配置'
  if (props.mode === 'edit') return '修改配置'
  return '配置详情'
})()

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      formLoading.value = true
      detailData.value = null

      if (props.mode === 'add') {
        formData.value = {
          universityId: '',
          universityName: '',
          isPilot: true,
          pilotYear: undefined,
          officialUrl: '',
          signupUrl: '',
          testBeforeScore: false,
          defaultEntryRatio: '1:5',
          defaultAdmissionFormula: '',
          availableMajors: [],
          specialNotes: '',
        }
        availableMajorsStr.value = ''
        formLoading.value = false
      } else if (props.mode === 'edit' && props.currentId) {
        try {
          const res = await getStrongBaseUnivDetail(props.currentId)
          if (res.data.code === 200) {
            const d = res.data.data
            formData.value = {
              universityId: d.universityId,
              universityName: d.universityName,
              isPilot: d.isPilot,
              pilotYear: d.pilotYear ?? undefined,
              officialUrl: d.officialUrl || '',
              signupUrl: d.signupUrl || '',
              testBeforeScore: d.testBeforeScore,
              defaultEntryRatio: d.defaultEntryRatio || '1:5',
              defaultAdmissionFormula: d.defaultAdmissionFormula || '',
              availableMajors: d.availableMajors || [],
              specialNotes: d.specialNotes || '',
            }
            availableMajorsStr.value = (d.availableMajors || []).join(', ')
          }
        } catch {
          ElMessage.error('获取详情失败')
        } finally {
          formLoading.value = false
        }
      } else if (props.mode === 'detail' && props.currentId) {
        try {
          const res = await getStrongBaseUnivDetail(props.currentId)
          if (res.data.code === 200) {
            detailData.value = res.data.data
          }
        } catch {
          ElMessage.error('获取详情失败')
        } finally {
          formLoading.value = false
        }
      }
    }
  }
)

const handleSubmit = async () => {
  if (!formData.value.universityName) {
    ElMessage.warning('请填写大学名称')
    return
  }

  formLoading.value = true
  const submitData = {
    ...formData.value,
    availableMajors: availableMajorsStr.value
      ? availableMajorsStr.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
      : [],
  }

  try {
    let res: any
    if (props.mode === 'add') {
      res = await addStrongBaseUniv(submitData as StrongBaseUnivAddDTO)
    } else if (props.mode === 'edit' && props.currentId) {
      res = await updateStrongBaseUniv(props.currentId, submitData as StrongBaseUnivUpdateDTO)
    } else {
      return
    }

    if (res.data.code === 200) {
      ElMessage.success(props.mode === 'add' ? '新增成功' : '修改成功')
      emit('update:visible', false)
      emit('success')
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    formLoading.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="750px"
    class="detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="dialog-content">
      <!-- 详情模式：2列布局 -->
      <template v-if="mode === 'detail' && detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="大学ID" :span="1">{{ detailData.universityId }}</el-descriptions-item>
          <el-descriptions-item label="大学名称" :span="1">{{ detailData.universityName }}</el-descriptions-item>
          <el-descriptions-item label="试点校" :span="1">
            <span :class="['status-pill', detailData.isPilot ? 'status-on' : 'status-off']">
              {{ detailData.isPilot ? '是' : '否' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="首次试点年份" :span="1">{{ detailData.pilotYear || '-' }}</el-descriptions-item>
          <el-descriptions-item label="出分前校测" :span="1">
            <span :class="['tag-pill', detailData.testBeforeScore ? 'tag-orange' : 'tag-gray']">
              {{ detailData.testBeforeScore ? '是' : '否' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="官方页面URL" :span="1">
            <a v-if="detailData.officialUrl" :href="detailData.officialUrl" target="_blank" class="link-orange">
              {{ detailData.officialUrl }}
            </a>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="报名入口URL" :span="2">
            <a v-if="detailData.signupUrl" :href="detailData.signupUrl" target="_blank" class="link-orange">
              {{ detailData.signupUrl }}
            </a>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="默认入围比例">{{ detailData.defaultEntryRatio || '-' }}</el-descriptions-item>
          <el-descriptions-item label="默认录取公式">{{ detailData.defaultAdmissionFormula || '-' }}</el-descriptions-item>
          <el-descriptions-item label="可选专业" :span="2">
            <template v-if="detailData.availableMajors && detailData.availableMajors.length > 0">
              <span
                v-for="(m, i) in detailData.availableMajors"
                :key="i"
                class="major-tag"
              >
                {{ m }}
              </span>
            </template>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="特殊说明" :span="2">{{ detailData.specialNotes || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="1">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="1">{{ detailData.updatedAt }}</el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 新增/修改模式 -->
      <template v-if="mode !== 'detail'">
        <el-form :model="formData" label-width="130px">
          <el-form-item label="大学" required>
            <el-select
              v-model="formData.universityId"
              placeholder="请输入大学名称搜索"
              filterable
              remote
              :remote-method="handleUniversitySearch"
              :loading="formLoading"
              style="width: 100%"
              @change="onUniversityChange"
            >
              <el-option v-for="item in universityOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="大学名称">
            <el-input v-model="formData.universityName" disabled placeholder="选择大学后自动填充" />
          </el-form-item>
          <el-form-item label="试点校">
            <el-radio-group v-model="formData.isPilot">
              <el-radio :value="true">是</el-radio>
              <el-radio :value="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="首次试点年份">
            <el-input-number v-model="formData.pilotYear" :min="2000" :max="2099" controls-position="right" style="width: 130px" />
          </el-form-item>
          <el-form-item label="出分前校测">
            <el-radio-group v-model="formData.testBeforeScore">
              <el-radio :value="true">是</el-radio>
              <el-radio :value="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="官方页面URL">
            <el-input v-model="formData.officialUrl" placeholder="https://" maxlength="500" />
          </el-form-item>
          <el-form-item label="报名入口URL">
            <el-input v-model="formData.signupUrl" placeholder="https://" maxlength="500" />
          </el-form-item>
          <el-form-item label="默认入围比例">
            <el-input v-model="formData.defaultEntryRatio" placeholder="默认1:5" maxlength="20" style="width: 200px" />
          </el-form-item>
          <el-form-item label="默认录取公式">
            <el-input v-model="formData.defaultAdmissionFormula" placeholder="录取综合分公式" maxlength="500" />
          </el-form-item>
          <el-form-item label="可选专业">
            <el-input
              v-model="availableMajorsStr"
              type="textarea"
              :rows="3"
              placeholder="多个专业用逗号分隔，如：数学与应用数学, 物理学, 化学"
            />
          </el-form-item>
          <el-form-item label="特殊说明">
            <el-input
              v-model="formData.specialNotes"
              type="textarea"
              :rows="3"
              placeholder="特殊说明"
            />
          </el-form-item>
        </el-form>
      </template>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">
          {{ mode === 'detail' ? '关闭' : '取消' }}
        </button>
        <button v-if="mode !== 'detail'" type="button" class="submit-btn" :disabled="formLoading" @click="handleSubmit">
          <span v-if="formLoading" class="loading-spinner"></span>
          确定
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.detail-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.detail-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 65vh;
  overflow-y: auto;
}

.detail-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.dialog-content :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}

.dialog-content :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #374151;
  background: rgba(249, 115, 22, 0.06) !important;
}

.dialog-content :deep(.el-descriptions__content) {
  color: #1f2937;
}

.dialog-content :deep(.el-descriptions__cell) {
  border-color: rgba(249, 115, 22, 0.1);
}

.dialog-content :deep(.el-descriptions__body) {
  border-radius: 8px;
  overflow: hidden;
}

.dialog-content :deep(.el-input__wrapper),
.dialog-content :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.dialog-content :deep(.el-input__wrapper:hover),
.dialog-content :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.dialog-content :deep(.el-input__wrapper.is-focus),
.dialog-content :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-content :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.dialog-content :deep(.el-select__wrapper) {
  border-radius: 8px;
}

.dialog-content :deep(.el-radio-group) {
  display: flex;
  gap: 20px;
}

.dialog-content :deep(.el-radio__label) {
  color: #374151;
}

.dialog-content :deep(.el-radio__input.is-checked .el-radio__inner) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  border-color: #F97316;
}

.dialog-content :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #F97316;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-on {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-off {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.tag-orange {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.tag-gray {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.link-orange {
  color: #F97316;
  text-decoration: none;
  word-break: break-all;
  font-size: 13px;
}

.link-orange:hover {
  text-decoration: underline;
}

.major-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 6px;
  margin-bottom: 6px;
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

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
