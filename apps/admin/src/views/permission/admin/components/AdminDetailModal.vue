<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getAdminDetail, addAdmin, updateAdmin } from '@/api/permission/admin'
import { getRolePage } from '@/api/permission/role'
import type { AdminAddDTO, AdminUpdateDTO } from '@/types/permission/admin'
import type { RoleVO } from '@/types/permission/role'

const props = defineProps<{
  visible: boolean
  adminId?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const roleOptions = ref<RoleVO[]>([])

const isEdit = computed(() => !!props.adminId)
const title = computed(() => (isEdit.value ? '编辑管理员' : '新增管理员'))

const form = reactive<AdminAddDTO & { id?: string; status?: number }>({
  username: '',
  password: '',
  realName: '',
  phone: '',
  email: '',
  avatar: '',
  roleId: '',
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

const fetchRoleOptions = async () => {
  try {
    const res = await getRolePage({ page: 1, size: 100, status: 1 })
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
  form.roleId = ''
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

watch(
  () => props.visible,
  (val) => {
    if (val && props.adminId) {
      fetchDetail()
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
    class="detail-dialog"
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

.detail-dialog :deep(.el-select) {
  width: 100%;
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

.detail-dialog :deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: #F97316;
  border-color: #F97316;
}

.detail-dialog :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #F97316;
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
