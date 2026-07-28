<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getScoreDetail,
  addScore,
  updateScore,
} from '@/api/special/strong-base-score'
import type {
  StrongBaseScoreDetailVO,
  StrongBaseScoreAddDTO,
  StrongBaseScoreUpdateDTO,
} from '@/types/special/strong-base-score'

const props = defineProps<{
  visible: boolean
  mode: 'detail' | 'add' | 'edit'
  currentId: string | null
  subjectTypeOptions: { label: string; value: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const formLoading = ref(false)
const detailData = ref<StrongBaseScoreDetailVO | null>(null)

const formData = ref<StrongBaseScoreAddDTO>({
  universityId: '',
  universityName: '',
  year: undefined,
  province: '',
  subjectType: '',
  majorName: '',
  majorCode: '',
  entryScore: undefined,
  entryScoreType: '高考成绩',
  entryFormula: '',
  entryRatio: '',
  admissionScore: undefined,
  admissionFormula: '',
  planCount: undefined,
  admissionCount: undefined,
  remark: '',
})

const dialogTitle = (() => {
  if (props.mode === 'add') return '新增数据'
  if (props.mode === 'edit') return '修改数据'
  return '数据详情'
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
          year: undefined,
          province: '',
          subjectType: '',
          majorName: '',
          majorCode: '',
          entryScore: undefined,
          entryScoreType: '高考成绩',
          entryFormula: '',
          entryRatio: '',
          admissionScore: undefined,
          admissionFormula: '',
          planCount: undefined,
          admissionCount: undefined,
          remark: '',
        }
        formLoading.value = false
      } else if (props.mode === 'edit' && props.currentId) {
        try {
          const res = await getScoreDetail(props.currentId)
          if (res.data.code === 200) {
            const d = res.data.data
            formData.value = {
              universityId: d.universityId,
              universityName: d.universityName,
              year: d.year,
              province: d.province,
              subjectType: d.subjectType,
              majorName: d.majorName,
              majorCode: d.majorCode || '',
              entryScore: d.entryScore ?? undefined,
              entryScoreType: d.entryScoreType || '高考成绩',
              entryFormula: d.entryFormula || '',
              entryRatio: d.entryRatio || '',
              admissionScore: d.admissionScore ?? undefined,
              admissionFormula: d.admissionFormula || '',
              planCount: d.planCount ?? undefined,
              admissionCount: d.admissionCount ?? undefined,
              remark: d.remark || '',
            }
          }
        } catch {
          ElMessage.error('获取详情失败')
        } finally {
          formLoading.value = false
        }
      } else if (props.mode === 'detail' && props.currentId) {
        try {
          const res = await getScoreDetail(props.currentId)
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

const subjectTypeLabel = (val: string) => {
  const opt = props.subjectTypeOptions.find((o) => o.value === val)
  return opt ? opt.label : val
}

const handleSubmit = async () => {
  if (!formData.value.universityId || !formData.value.universityName || !formData.value.year || !formData.value.province || !formData.value.subjectType || !formData.value.majorName) {
    ElMessage.warning('请填写必填字段')
    return
  }

  formLoading.value = true
  try {
    let res: any
    if (props.mode === 'add') {
      res = await addScore(formData.value)
    } else if (props.mode === 'edit' && props.currentId) {
      res = await updateScore(props.currentId, formData.value as StrongBaseScoreUpdateDTO)
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
  } catch {
    ElMessage.error('操作失败')
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
          <el-descriptions-item label="年份" :span="1">{{ detailData.year }}</el-descriptions-item>
          <el-descriptions-item label="省份" :span="1">{{ detailData.province }}</el-descriptions-item>
          <el-descriptions-item label="科类" :span="1">
            <span class="type-pill">{{ subjectTypeLabel(detailData.subjectType) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="专业名称" :span="1">{{ detailData.majorName }}</el-descriptions-item>
          <el-descriptions-item label="专业代码">{{ detailData.majorCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="入围分数类型">{{ detailData.entryScoreType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="入围分数线" :span="1">{{ detailData.entryScore ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="入围公式" :span="1">{{ detailData.entryFormula || '-' }}</el-descriptions-item>
          <el-descriptions-item label="入围比例">{{ detailData.entryRatio || '-' }}</el-descriptions-item>
          <el-descriptions-item label="录取综合分">{{ detailData.admissionScore ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="录取公式" :span="2">{{ detailData.admissionFormula || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计划数">{{ detailData.planCount ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="录取数">{{ detailData.admissionCount ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态" :span="1">
            <span :class="['status-pill', detailData.isActive ? 'status-on' : 'status-off']">
              {{ detailData.isActive ? '启用' : '禁用' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="1">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="1">{{ detailData.updatedAt }}</el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 新增/修改模式 -->
      <template v-if="mode !== 'detail'">
        <el-form :model="formData" label-width="120px">
          <el-form-item label="大学ID" required>
            <el-input v-model="formData.universityId" placeholder="请输入大学ID" />
          </el-form-item>
          <el-form-item label="大学名称" required>
            <el-input v-model="formData.universityName" placeholder="请输入大学名称" maxlength="50" show-word-limit />
          </el-form-item>
          <el-form-item label="年份" required>
            <el-input-number v-model="formData.year" :min="2000" :max="2099" controls-position="right" style="width: 130px" />
          </el-form-item>
          <el-form-item label="省份" required>
            <el-input v-model="formData.province" placeholder="请输入省份" maxlength="20" />
          </el-form-item>
          <el-form-item label="科类" required>
            <el-select v-model="formData.subjectType" placeholder="请选择" style="width: 200px">
              <el-option
                v-for="opt in subjectTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="专业名称" required>
            <el-input v-model="formData.majorName" placeholder="请输入专业名称" maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="专业代码">
            <el-input v-model="formData.majorCode" placeholder="请输入专业代码" maxlength="20" style="width: 200px" />
          </el-form-item>
          <el-form-item label="入围分数线">
            <el-input-number v-model="formData.entryScore" :precision="2" :min="0" :max="750" style="width: 160px" />
          </el-form-item>
          <el-form-item label="入围类型">
            <el-input v-model="formData.entryScoreType" placeholder="默认：高考成绩" maxlength="30" style="width: 200px" />
          </el-form-item>
          <el-form-item label="入围公式">
            <el-input v-model="formData.entryFormula" placeholder="入围计算公式" maxlength="500" />
          </el-form-item>
          <el-form-item label="入围比例">
            <el-input v-model="formData.entryRatio" placeholder="如 1:5" maxlength="20" style="width: 200px" />
          </el-form-item>
          <el-form-item label="录取综合分">
            <el-input-number v-model="formData.admissionScore" :precision="2" :min="0" :max="100" style="width: 160px" />
          </el-form-item>
          <el-form-item label="录取公式">
            <el-input v-model="formData.admissionFormula" placeholder="录取综合分公式" maxlength="500" />
          </el-form-item>
          <el-form-item label="计划数">
            <el-input-number v-model="formData.planCount" :min="0" style="width: 160px" />
          </el-form-item>
          <el-form-item label="录取数">
            <el-input-number v-model="formData.admissionCount" :min="0" style="width: 160px" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="备注信息"
              maxlength="500"
              show-word-limit
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

.dialog-content :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.dialog-content :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-content :deep(.el-input-number .el-input__wrapper) {
  border-radius: 8px;
}

.type-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
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
