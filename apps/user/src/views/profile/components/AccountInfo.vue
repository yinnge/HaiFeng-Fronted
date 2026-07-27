<!-- apps/user/src/views/profile/components/AccountInfo.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { MemberInfoVO, MemberInfoUpdateDTO, PasswordUpdateDTO } from '@/types/member/info'
import { updateMemberInfo, getWechatId, updateWechatId, updatePassword } from '@/api/member/info'

const props = defineProps<{
  memberInfo: MemberInfoVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref<MemberInfoUpdateDTO>({
  username: '',
  phone: '',
})

const wechatVisible = ref(false)
const wechatId = ref('')
const wechatLoading = ref(false)
const wechatEditing = ref(false)
const newWechatId = ref('')

const passwordVisible = ref(false)
const passwordForm = ref<PasswordUpdateDTO>({
  oldPassword: '',
  newPassword: '',
})
const passwordLoading = ref(false)

watch(
  () => props.memberInfo,
  (val) => {
    if (val) {
      form.value = {
        username: val.username || '',
        phone: val.phone || '',
      }
    }
  },
  { immediate: true }
)

async function handleSave() {
  loading.value = true
  try {
    await updateMemberInfo(form.value)
    ElMessage.success('保存成功')
    emit('refresh')
  } catch (err: any) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    loading.value = false
  }
}

async function handleViewWechat() {
  wechatLoading.value = true
  try {
    const { data } = await getWechatId()
    wechatId.value = data.data
    wechatVisible.value = true
    wechatEditing.value = false
  } catch (err: any) {
    ElMessage.error(err.message || '获取失败')
  } finally {
    wechatLoading.value = false
  }
}

async function handleSaveWechat() {
  if (!newWechatId.value) {
    ElMessage.warning('请输入微信号')
    return
  }
  wechatLoading.value = true
  try {
    await updateWechatId(newWechatId.value)
    ElMessage.success('微信号修改成功')
    wechatVisible.value = false
    emit('refresh')
  } catch (err: any) {
    ElMessage.error(err.message || '修改失败')
  } finally {
    wechatLoading.value = false
  }
}

function handleOpenPassword() {
  passwordForm.value = { oldPassword: '', newPassword: '' }
  passwordVisible.value = true
}

async function handleSavePassword() {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    ElMessage.warning('请填写完整')
    return
  }
  if (passwordForm.value.newPassword.length < 6 || passwordForm.value.newPassword.length > 20) {
    ElMessage.warning('新密码长度需为6-20位')
    return
  }
  passwordLoading.value = true
  try {
    await updatePassword(passwordForm.value)
    ElMessage.success('密码修改成功')
    passwordVisible.value = false
  } catch (err: any) {
    ElMessage.error(err.message || '修改失败')
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <div class="account-info">
    <!-- 账号信息卡片 -->
    <div class="info-card">
      <h3 class="card-title">
        <svg class="card-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
        </svg>
        账号信息
      </h3>
      <el-form :model="form" class="account-form">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" maxlength="50" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="save-btn"
            @click="handleSave"
          >
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 安全设置卡片 -->
    <div class="info-card">
      <h3 class="card-title">
        <svg class="card-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
        </svg>
        安全设置
      </h3>
      <div class="setting-list">
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">微信号</div>
            <div class="setting-desc">用于微信登录和找回密码</div>
          </div>
          <div class="setting-action">
            <span v-if="memberInfo?.hasWechat" class="status-badge status-bound">已绑定</span>
            <span v-else class="status-badge status-unbound">未绑定</span>
            <el-button type="primary" link @click="handleViewWechat">
              {{ memberInfo?.hasWechat ? '修改' : '绑定' }}
            </el-button>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">登录密码</div>
            <div class="setting-desc">建议定期修改密码以保障账号安全</div>
          </div>
          <div class="setting-action">
            <el-button type="primary" link @click="handleOpenPassword">修改密码</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 微信号弹窗 -->
    <el-dialog v-model="wechatVisible" title="微信号" width="400px" class="brand-dialog">
      <div v-if="!wechatEditing">
        <p class="mb-4">当前微信号：<strong>{{ wechatId || '未绑定' }}</strong></p>
        <el-button type="primary" class="dialog-btn" @click="wechatEditing = true; newWechatId = wechatId">
          修改微信号
        </el-button>
      </div>
      <div v-else>
        <el-input v-model="newWechatId" placeholder="请输入新微信号" maxlength="50" />
        <div class="mt-4 flex gap-2">
          <el-button type="primary" class="dialog-btn" :loading="wechatLoading" @click="handleSaveWechat">
            保存
          </el-button>
          <el-button @click="wechatEditing = false">取消</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="passwordVisible" title="修改密码" width="400px" class="brand-dialog">
      <el-form :model="passwordForm" label-width="80px">
        <el-form-item label="旧密码">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码（6-20位）"
            show-password
            maxlength="20"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" class="dialog-btn" @click="handleSavePassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.account-info {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #f3f4f6;
}

.card-title {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  border-radius: 6px;
  margin-bottom: 1rem;
  color: white;
}

.card-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: white;
}

.account-form {
  max-width: 360px;
  margin-left: 0;
  padding-left: 0;
}

:deep(.account-form .el-form-item) {
  margin-left: 0;
  margin-bottom: 1.25rem;
}

:deep(.account-form .el-form-item__label) {
  padding-left: 0;
  width: auto !important;
  min-width: 4rem;
  text-align: left;
  color: #374151;
  font-weight: 500;
}

:deep(.account-form .el-form-item__content) {
  margin-left: 0;
  flex: 1;
}

:deep(.account-form .el-select) {
  width: 100%;
}

:deep(.account-form .el-input) {
  width: 100%;
}

.setting-list {
  display: flex;
  flex-direction: column;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f9fafb;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.setting-desc {
  font-size: 0.8rem;
  color: #9ca3af;
}

.setting-action {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

.status-bound {
  background-color: #dcfce7;
  color: #16a34a;
}

.status-unbound {
  background-color: #f3f4f6;
  color: #6b7280;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  font-weight: 500;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(232, 114, 42, 0.25);
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: linear-gradient(135deg, #e8722a, #d4661a);
  box-shadow: 0 6px 16px rgba(232, 114, 42, 0.35);
  transform: translateY(-1px);
}

.dialog-btn {
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  border: none;
}

.dialog-btn:hover {
  background: linear-gradient(135deg, #e8722a, #d4661a);
}

/* Element Plus 表单项样式覆盖 */
:deep(.el-form-item__label) {
  color: #374151;
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #d1d5db inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #e8722a inset;
}

:deep(.el-dialog) {
  border-radius: 0.75rem;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 1rem;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
}
</style>
