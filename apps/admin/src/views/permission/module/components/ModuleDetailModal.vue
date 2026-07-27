<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { addModule, updateModule } from '@/api/permission/module'
import type { ModuleTreeVO, ModuleAddDTO, ModuleUpdateDTO } from '@/types/permission/module'
import ExitConfirmModal from '@/components/ExitConfirmModal.vue'

const props = defineProps<{
  visible: boolean
  moduleId?: string
  moduleTree: ModuleTreeVO[]
  currentModule?: ModuleTreeVO
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const showExitConfirm = ref(false)
const originalData = ref<string>('')

const isEdit = computed(() => !!props.moduleId)
const title = computed(() => (isEdit.value ? '编辑模块' : '新增模块'))

const form = reactive<ModuleAddDTO & { id?: string }>({
  moduleName: '',
  moduleCode: '',
  parentId: undefined,
  path: '',
  icon: '',
  sortOrder: 0,
  level: 1,
  description: '',
})

const rules: FormRules = {
  moduleName: [
    { required: true, message: '请输入模块名称', trigger: 'blur' },
    { max: 50, message: '模块名称不能超过50个字符', trigger: 'blur' },
  ],
  moduleCode: [
    { required: true, message: '请输入模块编码', trigger: 'blur' },
    { max: 50, message: '模块编码不能超过50个字符', trigger: 'blur' },
  ],
  level: [
    { required: true, message: '请输入层级', trigger: 'blur' },
  ],
  path: [
    { max: 200, message: '路径不能超过200个字符', trigger: 'blur' },
  ],
  icon: [
    { max: 100, message: '图标不能超过100个字符', trigger: 'blur' },
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' },
  ],
}

const parentTreeData = computed(() => {
  if (!isEdit.value) {
    return props.moduleTree
  }
  const filterTree = (nodes: ModuleTreeVO[]): ModuleTreeVO[] => {
    return nodes
      .filter((node) => node.id !== props.moduleId)
      .map((node) => ({
        ...node,
        children: node.children ? filterTree(node.children) : undefined,
      }))
  }
  return filterTree(props.moduleTree)
})

const treeProps = {
  value: 'id',
  label: 'moduleName',
  children: 'children',
}

const hasChanges = computed(() => {
  return JSON.stringify(form) !== originalData.value
})

const initForm = () => {
  if (props.currentModule) {
    const data = props.currentModule
    form.id = data.id
    form.moduleName = data.moduleName
    form.moduleCode = data.moduleCode
    form.parentId = data.parentId
    form.path = data.path || ''
    form.icon = data.icon || ''
    form.sortOrder = data.sortOrder
    form.level = data.level
    form.description = data.description || ''
    originalData.value = JSON.stringify(form)
  } else {
    originalData.value = JSON.stringify(form)
  }
}

const resetForm = () => {
  form.id = undefined
  form.moduleName = ''
  form.moduleCode = ''
  form.parentId = undefined
  form.path = ''
  form.icon = ''
  form.sortOrder = 0
  form.level = 1
  form.description = ''
  originalData.value = ''
  formRef.value?.resetFields()
}

const handleClose = () => {
  if (hasChanges.value) {
    showExitConfirm.value = true
  } else {
    emit('update:visible', false)
    resetForm()
  }
}

const handleDiscard = () => {
  showExitConfirm.value = false
  emit('update:visible', false)
  resetForm()
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  loading.value = true
  try {
    if (isEdit.value && props.moduleId) {
      const data: ModuleUpdateDTO = {
        moduleName: form.moduleName,
        moduleCode: form.moduleCode,
        parentId: form.parentId,
        path: form.path,
        icon: form.icon,
        sortOrder: form.sortOrder,
        level: form.level,
        description: form.description,
      }
      const res = await updateModule(props.moduleId, data)
      if (res.data.code === 200) {
        ElMessage.success('更新成功')
        showExitConfirm.value = false
        emit('update:visible', false)
        emit('success')
        resetForm()
      } else {
        ElMessage.error(res.data.msg || '更新失败')
      }
    } else {
      const data: ModuleAddDTO = {
        moduleName: form.moduleName,
        moduleCode: form.moduleCode,
        parentId: form.parentId,
        path: form.path,
        icon: form.icon,
        sortOrder: form.sortOrder,
        level: form.level,
        description: form.description,
      }
      const res = await addModule(data)
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

const handleSaveAndClose = async () => {
  await handleSave()
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      initForm()
    }
  }
)
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="600px"
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
      <el-form-item label="模块名称" prop="moduleName">
        <el-input v-model="form.moduleName" placeholder="请输入模块名称" />
      </el-form-item>
      <el-form-item label="模块编码" prop="moduleCode">
        <el-input v-model="form.moduleCode" placeholder="请输入模块编码" />
      </el-form-item>
      <el-form-item label="父级模块" prop="parentId">
        <el-tree-select
          v-model="form.parentId"
          :data="parentTreeData"
          :props="treeProps"
          placeholder="请选择父级模块（留空为顶级）"
          clearable
          check-strictly
          :render-after-expand="false"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="路径" prop="path">
        <el-input v-model="form.path" placeholder="请输入路径" />
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <el-input v-model="form.icon" placeholder="请输入图标" />
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
      </el-form-item>
      <el-form-item label="层级" prop="level">
        <el-input-number v-model="form.level" :min="1" :max="10" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入描述"
        />
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

  <ExitConfirmModal
    v-model:visible="showExitConfirm"
    @cancel="showExitConfirm = false"
    @discard="handleDiscard"
    @save="handleSaveAndClose"
  />
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

.detail-dialog :deep(.el-input-number) {
  width: 100%;
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
