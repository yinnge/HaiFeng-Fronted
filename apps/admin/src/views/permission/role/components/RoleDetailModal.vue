<!-- apps/admin/src/views/permission/role/components/RoleDetailModal.vue -->
<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getRoleDetail, addRole, updateRole } from '@/api/permission/role'
import type { RoleAddDTO, RoleUpdateDTO } from '@/types/permission/role'

const props = defineProps<{
  visible: boolean
  roleId?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const isEdit = computed(() => !!props.roleId)
const title = computed(() => (isEdit.value ? '编辑角色' : '新增角色'))

const form = reactive<RoleAddDTO & { id?: string }>({
  roleName: '',
  roleCode: '',
  description: '',
})

const rules: FormRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { max: 50, message: '角色名称不能超过50个字符', trigger: 'blur' },
  ],
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { max: 50, message: '角色编码不能超过50个字符', trigger: 'blur' },
  ],
  description: [
    { max: 100, message: '描述不能超过100个字符', trigger: 'blur' },
  ],
}

const fetchDetail = async () => {
  if (!props.roleId) return
  loading.value = true
  try {
    const res = await getRoleDetail(props.roleId)
    if (res.data.code === 200) {
      const data = res.data.data
      form.id = data.id
      form.roleName = data.roleName
      form.roleCode = data.roleCode
      form.description = data.description || ''
    }
  } catch (error) {
    ElMessage.error('获取角色详情失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.id = undefined
  form.roleName = ''
  form.roleCode = ''
  form.description = ''
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
    if (isEdit.value && props.roleId) {
      const data: RoleUpdateDTO = {
        roleName: form.roleName,
        roleCode: form.roleCode,
        description: form.description,
      }
      const res = await updateRole(props.roleId, data)
      if (res.data.code === 200) {
        ElMessage.success('更新成功')
        emit('update:visible', false)
        emit('success')
        resetForm()
      } else {
        ElMessage.error(res.data.msg || '更新失败')
      }
    } else {
      const data: RoleAddDTO = {
        roleName: form.roleName,
        roleCode: form.roleCode,
        description: form.description,
      }
      const res = await addRole(data)
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
    if (val && props.roleId) {
      fetchDetail()
    }
  }
)
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      v-loading="loading"
    >
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色编码" prop="roleCode">
        <el-input v-model="form.roleCode" placeholder="请输入角色编码" />
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
</template>
