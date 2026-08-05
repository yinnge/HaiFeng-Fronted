<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addEnterpriseIndustry, getEnterprisePage } from '@/api/company'
import { getIndustryPage } from '@/api/industry'
import type { EnterpriseIndustryAddDTO } from '@/types/company'
import type { EnterpriseListVO } from '@/types/company'
import type { IndustryListVO } from '@/types/industry'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const submitting = ref(false)
const enterpriseOptions = ref<EnterpriseListVO[]>([])
const industryOptions = ref<IndustryListVO[]>([])
const enterpriseSearching = ref(false)
const industrySearching = ref(false)

const formData = reactive<EnterpriseIndustryAddDTO>({
  enterpriseId: '',
  industryId: '',
  isPrimary: false,
  sortOrder: 0,
})

const resetForm = () => {
  formData.enterpriseId = ''
  formData.industryId = ''
  formData.isPrimary = false
  formData.sortOrder = 0
  enterpriseOptions.value = []
  industryOptions.value = []
}

watch(
  () => props.visible,
  (val) => {
    if (val) resetForm()
  }
)

const searchEnterprises = async (keyword: string) => {
  enterpriseSearching.value = true
  try {
    const res = await getEnterprisePage({ page: 1, size: 20, enterpriseName: keyword || undefined })
    if (res.data.code === 200) {
      enterpriseOptions.value = res.data.data.records
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取企业列表失败')
  } finally {
    enterpriseSearching.value = false
  }
}

const searchIndustries = async (keyword: string) => {
  industrySearching.value = true
  try {
    const res = await getIndustryPage({ page: 1, size: 20, industryName: keyword || undefined })
    if (res.data.code === 200) {
      industryOptions.value = res.data.data.records
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取行业列表失败')
  } finally {
    industrySearching.value = false
  }
}

const handleEnterpriseFocus = () => {
  if (enterpriseOptions.value.length === 0) searchEnterprises('')
}

const handleIndustryFocus = () => {
  if (industryOptions.value.length === 0) searchIndustries('')
}

const handleSubmit = async () => {
  if (!formData.enterpriseId) { ElMessage.warning('请选择企业'); return }
  if (!formData.industryId) { ElMessage.warning('请选择行业'); return }

  submitting.value = true
  try {
    const res = await addEnterpriseIndustry(formData as EnterpriseIndustryAddDTO)
    if (res.data.code === 200) {
      ElMessage.success('新增成功')
      emit('update:visible', false)
      emit('success')
    } else {
      ElMessage.error(res.data.msg || '新增失败')
    }
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.msg || err?.message || '新增失败')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="新增企业行业关联"
    width="560px"
    class="add-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form label-width="100px" class="add-form">
      <el-form-item label="企业名称" required>
        <el-select
          v-model="formData.enterpriseId"
          filterable
          remote
          reserve-keyword
          :remote-method="searchEnterprises"
          :loading="enterpriseSearching"
          placeholder="输入企业名称搜索"
          style="width: 100%"
          @focus="handleEnterpriseFocus"
        >
          <el-option
            v-for="item in enterpriseOptions"
            :key="item.id"
            :label="item.enterpriseName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="行业名称" required>
        <el-select
          v-model="formData.industryId"
          filterable
          remote
          reserve-keyword
          :remote-method="searchIndustries"
          :loading="industrySearching"
          placeholder="输入行业名称搜索"
          style="width: 100%"
          @focus="handleIndustryFocus"
        >
          <el-option
            v-for="item in industryOptions"
            :key="item.id"
            :label="item.industryName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="是否主行业">
        <div class="switch-row">
          <el-switch
            v-model="formData.isPrimary"
            active-text="主行业"
            inactive-text="普通"
            inline-prompt
          />
        </div>
      </el-form-item>

      <el-form-item label="排序值">
        <el-input-number
          v-model="formData.sortOrder"
          :min="0"
          :max="999"
          :step="1"
          :precision="0"
          controls-position="right"
          style="width: 180px"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">取消</button>
        <button type="button" class="submit-btn" :disabled="submitting" @click="handleSubmit">
          <span v-if="submitting" class="loading-spinner"></span>
          确认新增
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.add-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.add-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.add-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.add-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.add-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.add-form :deep(.el-form-item__label) {
  color: #374151;
  font-weight: 600;
}

.add-form :deep(.el-form-item__label::before) {
  color: #ef4444;
  margin-right: 4px;
}

.add-form :deep(.el-select__wrapper) {
  border-radius: 8px;
}

.add-form :deep(.el-select__wrapper:hover),
.add-form :deep(.el-select__wrapper.is-focused) {
  border-color: #F97316;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3);
}

.add-form :deep(.el-input-number) {
  border-radius: 8px;
}

.add-form :deep(.el-switch.is-checked .el-switch__core) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  border-color: #F97316;
}

.switch-row {
  display: flex;
  align-items: center;
  height: 32px;
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
