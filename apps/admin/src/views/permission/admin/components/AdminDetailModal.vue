<!-- apps/admin/src/views/permission/admin/components/AdminDetailModal.vue -->
<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getAdminDetail, addAdmin, updateAdmin } from '@/api/permission/admin'
import { getRolePage } from '@/api/permission/role'
import type { AdminAddDTO, AdminUpdateDTO } from '@/types/permission/admin'
import type { RoleVO } from '@/types/permission/role'
import ExitConfirmModal from '@/components/ExitConfirmModal.vue'

const props = defineProps<{
  visible: boolean
  adminId?: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const showExitConfirm = ref(false)
const originalData = ref<string>('')
const roleOptions = ref<RoleVO[]>([])

const isEdit = computed(() => !!props.adminId)
const title = computed(() => (isEdit.value ? '编辑管理员' : '新增管理员'))

const form = reactive<AdminAddDTO & { id?: number; status?: number }>({
  username: '',
  password: '',
  realName: '',
  phone: '',
  email: '',
  avatar: '',
  roleId: 0,
  status: 1,
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度为3-50个字符', trigger: 'blur' },
  ],
  password: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (!isEdit.value && !value) {
          callback(new Error('请输入密码'))
        } else if (value && value.length < 6) {
          callback(new Error('密码长度不能少于6个字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
}

const hasChanges = computed(() => {
  return JSON.stringify(form) !== originalData.value
})

const fetchRoleOptions = async () => {
  try {
    const res = await getRolePage({ page: 1, size: 1000, status: 1 })
    if (res.data.code === 200) {
      roleOptions.value = res.data.data.records
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

const fetchDetail = async () => {
  if (!props.adminId) return
  loading.value = true
  try {
    const res = await getAdminDetail(props.adminId)
    if (res.data.code === 200) {
      const data = res.data.data
      form.id = data.id
      form.username = data.username
      form.password = ''
      form.realName = data.realName || ''
      form.phone = data.phone
      form.email = data.email || ''
      form.avatar = data.avatar || ''
      form.roleId = data.roleId
      form.status = data.status
      originalData.value = JSON.stringify(form)
    }
  } catch (error) {
    ElMessage.error('获取管理员详情失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.id = undefined
  form.username = ''
  form.password = ''
  form.realName = ''
  form.phone = ''
  form.email = ''
  form.avatar = ''
  form.roleId = 0
  form.status = 1
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
    if (isEdit.value && props.adminId) {
      const data: AdminUpdateDTO = {
        username: form.username,
        realName: form.realName,
        phone: form.phone,
        email: form.email,
        avatar: form.avatar,
        roleId: form.roleId,
        status: form.status,
      }
      if (form.password) {
        data.password = form.password
      }
      const res = await updateAdmin(props.adminId, data)
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
      const data: AdminAddDTO = {
        username: form.username,
        password: form.password,
        realName: form.realName,
        phone: form.phone,
        email: form.email,
        avatar: form.avatar,
        roleId: form.roleId,
      }
      const res = await addAdmin(data)
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
    if (val && props.adminId) {
      fetchDetail()
    } else if (val) {
      originalData.value = JSON.stringify(form)
    }
  }
)

onMounted(() => {
  fetchRoleOptions()
})
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
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          :placeholder="isEdit ? '留空则不修改密码' : '请输入密码'"
          show-password
        />
      </el-form-item>
      <el-form-item label="姓名" prop="realName">
        <el-input v-model="form.realName" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="角色" prop="roleId">
        <el-select v-model="form.roleId" placeholder="请选择角色" style="width: 100%">
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.roleName"
            :value="role.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="isEdit" label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
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
