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
  <div class="profile-form-card">
    <!-- 基本信息区 -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">
          <span class="title-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          基本信息
        </div>
        <div class="section-subtitle">维护个人资料，联系方式便于通知送达</div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="110px"
        class="profile-form"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱（选填）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-input
                :model-value="profile?.roleName || '-'"
                disabled
              />
              <template #label>
                <span>角色 <span class="label-tip">(不可修改)</span></span>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 修改密码区 -->
    <div class="section">
      <div class="section-divider"></div>
      <div class="action-card">
        <div class="action-left">
          <div class="action-icon icon-password">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="action-info">
            <div class="action-title">修改密码</div>
            <div class="action-desc">定期修改密码可以提高账号安全性</div>
          </div>
        </div>
        <button class="action-btn btn-outline" @click="passwordModalVisible = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          修改密码
        </button>
      </div>
    </div>

    <!-- TOTP 双因素认证区 -->
    <div class="section">
      <div class="action-card">
        <div class="action-left">
          <div class="action-icon icon-totp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="action-info">
            <div class="action-title-row">
              <span class="action-title">TOTP 双因素认证</span>
              <span
                class="status-pill"
                :class="profile?.isTotpEnabled ? 'status-on' : 'status-off'"
              >
                {{ profile?.isTotpEnabled ? '已开启' : '未开启' }}
              </span>
            </div>
            <div class="action-desc">使用 Google Authenticator 增强账号安全</div>
          </div>
        </div>
        <div class="action-right">
          <template v-if="profile?.isTotpEnabled">
            <button class="action-btn btn-outline" @click="openTotpModal('view')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              查看二维码
            </button>
            <button class="action-btn btn-danger" @click="openTotpModal('disable')">
              关闭验证
            </button>
          </template>
          <template v-else>
            <button class="action-btn btn-primary" @click="openTotpModal('enable')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              开启验证
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="form-footer">
      <button class="action-btn btn-primary" :disabled="loading" @click="handleSave">
        <span v-if="loading" class="loading-spinner"></span>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        {{ loading ? '保存中...' : '保存修改' }}
      </button>
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

<style scoped>
.profile-form-card {
  flex: 1;
  padding: 2rem;
  background: #fff;
  border-radius: 0.75rem;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}
.profile-form-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

/* Section */
.section {
  margin-bottom: 1.5rem;
}
.section:last-of-type {
  margin-bottom: 0;
}
.section-header {
  margin-bottom: 1.5rem;
}
.section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 20px;
}
.title-icon {
  display: flex;
  align-items: center;
}
.section-subtitle {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: #9ca3af;
}
.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.15), transparent);
  margin-bottom: 1.25rem;
}

/* Form */
.profile-form :deep(.el-form-item) {
  margin-bottom: 1.5rem;
}
.profile-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
.profile-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}
.profile-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.profile-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.profile-form :deep(.el-input.is-disabled .el-input__wrapper) {
  background: #f9fafb;
}
.label-tip {
  font-size: 0.75rem;
  color: #C2410C;
  font-weight: 500;
  white-space: nowrap;
}

/* Action Card */
.action-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  background: rgba(249, 115, 22, 0.02);
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-radius: 12px;
  transition: all 0.25s ease;
}
.action-card:hover {
  background: rgba(249, 115, 22, 0.04);
  border-color: rgba(249, 115, 22, 0.2);
}
.action-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}
.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
}
.icon-password {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.15));
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.icon-totp {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
}
.action-info {
  flex: 1;
  min-width: 0;
}
.action-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}
.action-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
}
.action-desc {
  font-size: 0.8125rem;
  color: #6b7280;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid transparent;
}
.status-pill.status-on {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669;
  border-color: rgba(16, 185, 129, 0.2);
}
.status-pill.status-off {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Buttons */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-outline {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}
.btn-outline:hover:not(:disabled) {
  color: #F97316;
  border-color: #F97316;
  background: rgba(249, 115, 22, 0.04);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.loading-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
.form-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
}
</style>