<!-- apps/admin/src/views/profile/components/TotpModal.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { enableTotp, verifyTotp, getTotpQrcode, disableTotp } from '@/api/profile'
import type { TotpEnableVO } from '@/types/profile'

const props = defineProps<{
  visible: boolean
  mode: 'enable' | 'view' | 'disable'
  isTotpEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const loading = ref(false)
const totpData = ref<TotpEnableVO | null>(null)
const verifyCode = ref('')
const disablePassword = ref('')
const disableCode = ref('')

const dialogTitle = computed(() => {
  if (props.mode === 'disable') return '关闭 TOTP 验证'
  if (props.mode === 'view') return '查看 TOTP 二维码'
  return '开启 TOTP 验证'
})

const dialogIcon = computed(() => {
  if (props.mode === 'disable') return 'disable'
  return 'totp'
})

// 打开弹窗时加载数据
async function handleOpen() {
  loading.value = true
  try {
    if (props.mode === 'enable') {
      const { data } = await enableTotp()
      if (data.code === 200) {
        totpData.value = data.data
      }
    } else if (props.mode === 'view') {
      const { data } = await getTotpQrcode()
      if (data.code === 200) {
        totpData.value = data.data
      }
    }
  } catch (error) {
    ElMessage.error('获取二维码失败')
  } finally {
    loading.value = false
  }
}

// 验证 TOTP
async function handleVerify() {
  if (!verifyCode.value || verifyCode.value.length !== 6) {
    ElMessage.warning('请输入 6 位验证码')
    return
  }
  loading.value = true
  try {
    const { data } = await verifyTotp({ code: verifyCode.value, secret: totpData.value!.secret })
    if (data.code === 200) {
      ElMessage.success('TOTP 验证成功')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(data.msg || '验证失败')
    }
  } catch (error) {
    ElMessage.error('验证失败')
  } finally {
    loading.value = false
  }
}

// 关闭 TOTP
async function handleDisable() {
  if (!disablePassword.value) {
    ElMessage.warning('请输入密码')
    return
  }
  if (!disableCode.value || disableCode.value.length !== 6) {
    ElMessage.warning('请输入 6 位验证码')
    return
  }
  loading.value = true
  try {
    const { data } = await disableTotp({ password: disablePassword.value, code: disableCode.value })
    if (data.code === 200) {
      ElMessage.success('TOTP 已关闭')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(data.msg || '关闭失败')
    }
  } catch (error) {
    ElMessage.error('关闭失败')
  } finally {
    loading.value = false
  }
}

function handleClose() {
  verifyCode.value = ''
  disablePassword.value = ''
  disableCode.value = ''
  totpData.value = null
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="460px"
    :close-on-click-modal="false"
    class="totp-dialog"
    @update:model-value="handleClose"
    @open="handleOpen"
  >
    <div v-loading="loading" class="totp-content">
      <!-- 开启/查看模式：显示二维码 -->
      <template v-if="mode !== 'disable'">
        <p class="content-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          使用 Google Authenticator 扫描下方二维码
        </p>

        <div class="qr-box">
          <img
            v-if="totpData?.qrCodeImage"
            :src="totpData.qrCodeImage"
            alt="TOTP 二维码"
            class="qr-img"
          />
          <span v-else class="qr-loading">加载中...</span>
        </div>

        <div v-if="totpData?.secret" class="secret-box">
          <p class="secret-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
            手动输入密钥
          </p>
          <p class="secret-value">{{ totpData.secret }}</p>
        </div>

        <!-- 开启模式需要验证 -->
        <template v-if="mode === 'enable'">
          <div class="verify-section">
            <label class="verify-label">输入 6 位验证码</label>
            <el-input
              v-model="verifyCode"
              placeholder="6 位数字验证码"
              maxlength="6"
              class="verify-input"
              @keyup.enter="handleVerify"
            />
          </div>
        </template>
      </template>

      <!-- 关闭模式：输入密码和验证码 -->
      <template v-else>
        <p class="content-hint danger">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          关闭 TOTP 验证需要输入密码和当前验证码确认
        </p>
        <el-input
          v-model="disablePassword"
          type="password"
          placeholder="请输入当前密码"
          show-password
          class="verify-input mb-3"
        />
        <el-input
          v-model="disableCode"
          placeholder="输入 6 位验证码"
          maxlength="6"
          class="verify-input"
          @keyup.enter="handleDisable"
        />
      </template>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">取消</button>
        <button
          v-if="mode === 'enable'"
          type="button"
          class="submit-btn"
          :disabled="loading"
          @click="handleVerify"
        >
          <span v-if="loading" class="loading-spinner"></span>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {{ loading ? '验证中...' : '已扫描，验证' }}
        </button>
        <button
          v-else-if="mode === 'disable'"
          type="button"
          class="danger-btn"
          :disabled="loading"
          @click="handleDisable"
        >
          <span v-if="loading" class="loading-spinner"></span>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          {{ loading ? '关闭中...' : '确认关闭' }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.totp-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}
.totp-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  margin: 0;
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
}
.totp-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.totp-dialog :deep(.el-dialog__body) {
  padding: 24px;
}
.totp-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.totp-content {
  padding: 4px 0;
}

.content-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: rgba(249, 115, 22, 0.04);
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 8px;
  font-size: 13px;
  color: #C2410C;
  line-height: 1.4;
}
.content-hint.danger {
  background: rgba(239, 68, 68, 0.04);
  border-color: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

.qr-box {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  width: 160px;
  height: 160px;
  background: rgba(249, 115, 22, 0.02);
  border: 2px dashed rgba(249, 115, 22, 0.3);
  border-radius: 12px;
  transition: border-color 0.3s ease;
}
.qr-box:hover {
  border-color: rgba(249, 115, 22, 0.5);
}
.qr-img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
.qr-loading {
  font-size: 13px;
  color: #9ca3af;
}

.secret-box {
  margin-bottom: 16px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 146, 60, 0.04));
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 8px;
}
.secret-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
  font-size: 11px;
  color: #9ca3af;
}
.secret-value {
  font-family: 'SF Mono', 'Consolas', 'Liberation Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  word-break: break-all;
}

.verify-section {
  margin-top: 8px;
}
.verify-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}
.verify-input {
  border-radius: 8px;
}
.verify-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}
.verify-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.verify-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.verify-input.mb-3 {
  margin-bottom: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.cancel-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 24px;
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
.danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.danger-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
.submit-btn:disabled,
.danger-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
</style>