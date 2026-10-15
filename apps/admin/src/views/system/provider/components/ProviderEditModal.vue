<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getModelProviderDetail, createModelProvider, updateModelProvider } from '@/api/system/provider'
import type { ModelProviderCreateDTO, ModelProviderUpdateDTO } from '@/types/system/provider'
import { ProviderType, ProviderTypeLabel } from '@/types/system/provider'
const props = defineProps<{
  visible: boolean
  providerId?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const isEdit = computed(() => !!props.providerId)
const title = computed(() => (isEdit.value ? '编辑服务商' : '新增服务商'))

const form = reactive<ModelProviderCreateDTO & { id?: string }>({
  apiKey: '',
  baseUrl: '',
  modelName: '',
  providerName: '',
  type: ProviderType.AI,
  description: '',
  status: 1,
})

const rules: FormRules = {
  apiKey: [
    { required: true, message: '请输入 API Key', trigger: 'blur' },
    { max: 500, message: 'API Key 不能超过500个字符', trigger: 'blur' },
  ],
  modelName: [
    { required: true, message: '请输入模型名称', trigger: 'blur' },
    { max: 100, message: '模型名称不能超过100个字符', trigger: 'blur' },
  ],
  providerName: [
    { required: true, message: '请输入服务商名称', trigger: 'blur' },
    { max: 100, message: '服务商名称不能超过100个字符', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' },
  ],
}

const fetchDetail = async () => {
  if (!props.providerId) return
  loading.value = true
  try {
    const res = await getModelProviderDetail(props.providerId)
    if (res.data.code === 200) {
      const data = res.data.data
      form.id = data.id
      form.apiKey = ''
      form.baseUrl = data.baseUrl || ''
      form.modelName = data.modelName
      form.providerName = data.providerName
      form.type = data.type
      form.description = data.description || ''
      form.status = data.status
    }
  } catch (error) {
    ElMessage.error('获取服务商详情失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.id = undefined
  form.apiKey = ''
  form.baseUrl = ''
  form.modelName = ''
  form.providerName = ''
  form.type = ProviderType.AI
  form.description = ''
  form.status = 1
  formRef.value?.resetFields()
}

const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  loading.value = true
  try {
    if (isEdit.value && props.providerId) {
      const data: ModelProviderUpdateDTO = {
        apiKey: form.apiKey || undefined,
        baseUrl: form.baseUrl,
        modelName: form.modelName,
        providerName: form.providerName,
        type: form.type,
        description: form.description,
        status: form.status,
      }
      const res = await updateModelProvider(props.providerId, data)
      if (res.data.code === 200) {
        ElMessage.success('更新成功')
        emit('update:visible', false)
        emit('success')
        resetForm()
      } else {
        ElMessage.error(res.data.msg || '更新失败')
      }
    } else {
      const data: ModelProviderCreateDTO = {
        apiKey: form.apiKey,
        baseUrl: form.baseUrl,
        modelName: form.modelName,
        providerName: form.providerName,
        type: form.type,
        description: form.description,
        status: form.status,
      }
      const res = await createModelProvider(data)
      if (res.data.code === 200) {
        ElMessage.success('新增成功')
        emit('update:visible', false)
        emit('success')
        resetForm()
      } else {
        ElMessage.error(res.data.msg || '新增失败')
      }
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.msg || '操作失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.visible,
  (val) => {
    if (val && props.providerId) {
      fetchDetail()
    }
  }
)
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="520px"
    :close-on-click-modal="false"
    class="detail-dialog"
    @update:model-value="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      v-loading="loading"
    >
      <el-form-item label="服务商名称" prop="providerName">
        <el-input v-model="form.providerName" placeholder="请输入服务商名称" />
      </el-form-item>
      <el-form-item label="模型名称" prop="modelName">
        <el-input v-model="form.modelName" placeholder="请输入模型名称，如：gpt-4o" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
          <el-option
            v-for="(label, key) in ProviderTypeLabel"
            :key="key"
            :label="label"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="API Key" prop="apiKey">
        <el-input
          v-model="form.apiKey"
          type="password"
          show-password
          :placeholder="isEdit ? '留空则不修改' : '请输入 API Key'"
        />
      </el-form-item>
      <el-form-item label="Base URL" prop="baseUrl">
        <el-input v-model="form.baseUrl" placeholder="请输入 Base URL（可选）" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入描述（可选）"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" style="width: 100%">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="exit-btn" @click="handleClose">退出</button>
        <button type="button" class="save-btn" :disabled="loading" @click="handleSave">
          <svg v-if="!loading" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span v-if="loading" class="loading-spinner"></span>
          保存
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
}

.detail-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.detail-dialog :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.detail-dialog :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.detail-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.detail-dialog :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.detail-dialog :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.detail-dialog :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.detail-dialog :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.detail-dialog :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.detail-dialog :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.exit-btn {
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

.exit-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.save-btn {
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

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.save-btn:disabled {
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
