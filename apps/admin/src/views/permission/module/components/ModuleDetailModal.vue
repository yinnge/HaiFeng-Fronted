<!-- apps/admin/src/views/permission/module/components/ModuleDetailModal.vue -->
<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { addModule, updateModule } from '@/api/permission/module'
import type { ModuleTreeVO, ModuleAddDTO, ModuleUpdateDTO } from '@/types/permission/module'
import ExitConfirmModal from '@/components/ExitConfirmModal.vue'

const props = defineProps<{
  visible: boolean
  moduleId?: number
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

const form = reactive<ModuleAddDTO & { id?: number }>({
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

// Build tree data for parent selection, excluding the current module and its children
const parentTreeData = computed(() => {
  if (!isEdit.value) {
    return props.moduleTree
  }
  // Filter out the current module and its descendants
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
      <el-button @click="handleClose">退出</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>

  <ExitConfirmModal
    v-model:visible="showExitConfirm"
    @cancel="showExitConfirm = false"
    @discard="handleDiscard"
    @save="handleSaveAndClose"
  />
</template>
