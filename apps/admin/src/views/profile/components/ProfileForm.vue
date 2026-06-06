<!-- apps/admin/src/views/profile/components/ProfileForm.vue -->
<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { updateProfile } from '@/api/profile'
import { useUserStore } from '@/store'
import type { ProfileVO } from '@/types/profile'
import PasswordModal from './PasswordModal.vue'
import TotpModal from './TotpModal.vue'

const props = defineProps<{
  profile: ProfileVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  phone: '',
  email: '',
})

// 监听 profile 变化，同步到表单
watch(
  () => props.profile,
  (val) => {
    if (val) {
      form.username = val.username || ''
      form.phone = val.phone || ''
      form.email = val.email || ''
    }
  },
  { immediate: true }
)

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度 2-50 位', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
}

// 保存修改
async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const { data } = await updateProfile({
      username: form.username,
      phone: form.phone,
      email: form.email || undefined,
    })
    if (data.code === 200) {
      ElMessage.success('保存成功')
      userStore.updateLocalProfile({
        username: form.username,
        phone: form.phone,
        email: form.email || null,
      })
    } else {
      ElMessage.error(data.msg || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 密码弹窗
const passwordModalVisible = ref(false)

// TOTP 弹窗
const totpModalVisible = ref(false)
const totpMode = ref<'enable' | 'view' | 'disable'>('enable')

function openTotpModal(mode: 'enable' | 'view' | 'disable') {
  totpMode.value = mode
  totpModalVisible.value = true
}

function handleTotpSuccess() {
  emit('refresh')
}
</script>

<template>
  <div class="flex-1 rounded-xl bg-white p-6 shadow-sm">
    <h3 class="mb-5 text-base font-semibold text-gray-800">基本信息</h3>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="max-w-xl"
    >
      <div class="grid grid-cols-2 gap-4">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="角色">
          <el-input
            :model-value="profile?.roleName || '-'"
            disabled
            class="bg-gray-50"
          />
          <template #label>
            <span>
              角色
              <span class="text-xs" style="color: #cc785c;">(不可修改)</span>
            </span>
          </template>
        </el-form-item>
      </div>
    </el-form>

    <!-- 修改密码区域 -->
    <div class="mt-6 border-t border-gray-100 pt-5">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-medium text-gray-800">修改密码</h4>
          <p class="mt-1 text-xs text-gray-500">定期修改密码可以提高账号安全性</p>
        </div>
        <el-button @click="passwordModalVisible = true">修改密码</el-button>
      </div>
    </div>

    <!-- TOTP 区域 -->
    <div class="mt-6 border-t border-gray-100 pt-5">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-medium text-gray-800">TOTP 双因素认证</h4>
          <p class="mt-1 text-xs text-gray-500">
            使用 Google Authenticator 增强账号安全
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="rounded-full px-2.5 py-1 text-xs"
            :class="
              profile?.isTotpEnabled
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            "
          >
            {{ profile?.isTotpEnabled ? '已开启' : '未开启' }}
          </span>
          <template v-if="profile?.isTotpEnabled">
            <el-button size="small" @click="openTotpModal('view')">
              查看二维码
            </el-button>
            <el-button size="small" type="danger" plain @click="openTotpModal('disable')">
              关闭验证
            </el-button>
          </template>
          <template v-else>
            <el-button
              size="small"
              type="primary"
              style="background-color: #cc785c; border-color: #cc785c;"
              @click="openTotpModal('enable')"
            >
              开启验证
            </el-button>
          </template>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="mt-6 flex justify-end">
      <el-button
        type="primary"
        :loading="loading"
        style="background-color: #cc785c; border-color: #cc785c;"
        @click="handleSave"
      >
        保存修改
      </el-button>
    </div>

    <!-- 弹窗 -->
    <PasswordModal v-model:visible="passwordModalVisible" />
    <TotpModal
      v-model:visible="totpModalVisible"
      :mode="totpMode"
      :is-totp-enabled="profile?.isTotpEnabled ?? false"
      @success="handleTotpSuccess"
    />
  </div>
</template>
