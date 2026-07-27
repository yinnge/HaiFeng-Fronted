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
    width="400px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
    @open="handleOpen"
  >
    <div v-loading="loading" class="totp-content text-center">
      <!-- 开启/查看模式：显示二维码 -->
      <template v-if="mode !== 'disable'">
        <p class="mb-4 text-sm text-gray-500">
          使用 Google Authenticator 扫描下方二维码
        </p>

        <div class="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-lg totp-qr-border bg-gray-50">
          <img
            v-if="totpData?.qrCodeImage"
            :src="totpData.qrCodeImage"
            alt="TOTP 二维码"
            class="h-full w-full rounded-lg"
          />
          <span v-else class="text-sm text-gray-400">加载中...</span>
        </div>

        <div v-if="totpData?.secret" class="mb-4 rounded-lg totp-secret-box p-3">
          <p class="mb-1 text-xs text-gray-500">手动输入密钥</p>
          <p class="font-mono text-sm font-medium text-gray-800">{{ totpData.secret }}</p>
        </div>

        <!-- 开启模式需要验证 -->
        <template v-if="mode === 'enable'">
          <el-input
            v-model="verifyCode"
            placeholder="输入 6 位验证码"
            maxlength="6"
            class="totp-input mb-4"
            @keyup.enter="handleVerify"
          />
        </template>
      </template>

      <!-- 关闭模式：输入密码和验证码 -->
      <template v-else>
        <p class="mb-4 text-sm text-gray-500">
          关闭 TOTP 验证需要输入密码和当前验证码确认
        </p>
        <el-input
          v-model="disablePassword"
          type="password"
          placeholder="请输入当前密码"
          show-password
          class="totp-input mb-3"
        />
        <el-input
          v-model="disableCode"
          placeholder="输入 6 位验证码"
          maxlength="6"
          class="totp-input"
          @keyup.enter="handleDisable"
        />
      </template>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        v-if="mode === 'enable'"
        type="primary"
        :loading="loading"
        class="totp-btn-gold"
        @click="handleVerify"
      >
        已扫描，验证
      </el-button>
      <el-button
        v-else-if="mode === 'disable'"
        type="danger"
        :loading="loading"
        @click="handleDisable"
      >
        确认关闭
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.totp-content {
  padding: 8px 0;
}

/* 金色输入框 */
.totp-input :deep(.el-input__wrapper) {
  border: 1.5px solid rgba(191, 138, 48, 0.2);
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.totp-input :deep(.el-input__wrapper:hover) {
  border-color: rgba(191, 138, 48, 0.35);
}

.totp-input :deep(.el-input__wrapper.is-focus) {
  border-color: #bf8a30;
  box-shadow: 0 0 0 3px rgba(191, 138, 48, 0.1);
}

/* QR 码金色边框 */
.totp-qr-border {
  border: 2px dashed rgba(191, 138, 48, 0.3);
  transition: border-color 0.3s ease;
}

.totp-qr-border:hover {
  border-color: rgba(191, 138, 48, 0.5);
}

/* 密钥区域 */
.totp-secret-box {
  background: linear-gradient(135deg, rgba(191, 138, 48, 0.06), rgba(251, 191, 36, 0.04));
  border: 1px solid rgba(191, 138, 48, 0.15);
}

/* 金色按钮 */
.totp-btn-gold {
  background: linear-gradient(
    135deg,
    #d4a85a 0%,
    #bf8a30 30%,
    #a67c28 50%,
    #bf8a30 70%,
    #d4a85a 100%
  ) !important;
  background-size: 200% auto !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(191, 138, 48, 0.35) !important;
  transition: all 0.3s ease !important;
}

.totp-btn-gold:hover {
  background-position: right center !important;
  box-shadow: 0 6px 16px rgba(191, 138, 48, 0.45) !important;
  transform: translateY(-1px);
}
</style>
