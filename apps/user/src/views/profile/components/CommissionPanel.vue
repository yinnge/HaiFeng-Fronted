<!-- apps/user/src/views/profile/components/CommissionPanel.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument, Loading } from '@element-plus/icons-vue'
import type { CommissionVO, ReferrerPreviewVO } from '@/types/member/commission'
import { getCommission, withdraw, previewReferrer, bindReferrer } from '@/api/member/commission'

const commission = ref<CommissionVO | null>(null)
const loading = ref(false)

// 提现相关
const withdrawVisible = ref(false)
const withdrawAmount = ref<50 | 100>(50)
const withdrawLoading = ref(false)

// 绑定邀请码相关
const bindVisible = ref(false)
const bindInviteCode = ref('')
const bindLoading = ref(false)
const referrerPreview = ref<ReferrerPreviewVO | null>(null)
const previewLoading = ref(false)

// 是否可提现
const canWithdraw50 = computed(() => (commission.value?.commissionBalance || 0) >= 50)
const canWithdraw100 = computed(() => (commission.value?.commissionBalance || 0) >= 100)

// 是否已绑定推荐人
const hasBound = computed(() => !!commission.value?.referrerInviteCode)

// 加载佣金信息
async function loadCommission() {
  loading.value = true
  try {
    const { data } = await getCommission()
    commission.value = data.data
  } catch (err: any) {
    ElMessage.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 复制邀请码
function handleCopy() {
  if (!commission.value?.inviteCode) return
  navigator.clipboard.writeText(commission.value.inviteCode)
  ElMessage.success('邀请码已复制')
}

// 打开提现弹窗
function handleOpenWithdraw() {
  withdrawAmount.value = 50
  withdrawVisible.value = true
}

// 确认提现
async function handleWithdraw() {
  if (withdrawAmount.value === 50 && !canWithdraw50.value) {
    ElMessage.warning('余额不足50元')
    return
  }
  if (withdrawAmount.value === 100 && !canWithdraw100.value) {
    ElMessage.warning('余额不足100元')
    return
  }

  withdrawLoading.value = true
  try {
    await withdraw({ amount: withdrawAmount.value })
    ElMessage.success('提现申请已提交')
    withdrawVisible.value = false
    loadCommission()
  } catch (err: any) {
    ElMessage.error(err.message || '提现失败')
  } finally {
    withdrawLoading.value = false
  }
}

// 打开绑定弹窗
function handleOpenBind() {
  bindInviteCode.value = ''
  referrerPreview.value = null
  bindVisible.value = true
}

// 预览推荐人
async function handlePreview() {
  if (!bindInviteCode.value) {
    ElMessage.warning('请输入邀请码')
    return
  }
  previewLoading.value = true
  try {
    const { data } = await previewReferrer(bindInviteCode.value)
    referrerPreview.value = data.data
  } catch (err: any) {
    ElMessage.error(err.message || '邀请码无效')
    referrerPreview.value = null
  } finally {
    previewLoading.value = false
  }
}

// 确认绑定
async function handleBind() {
  if (!referrerPreview.value) {
    ElMessage.warning('请先验证邀请码')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认绑定推荐人 ${referrerPreview.value.username}（${referrerPreview.value.phone}）？绑定后不可修改`,
      '确认绑定',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }

  bindLoading.value = true
  try {
    await bindReferrer({ inviteCode: bindInviteCode.value })
    ElMessage.success('绑定成功')
    bindVisible.value = false
    loadCommission()
  } catch (err: any) {
    ElMessage.error(err.message || '绑定失败')
  } finally {
    bindLoading.value = false
  }
}

// 初始加载
loadCommission()
</script>

<template>
  <div class="rounded-lg bg-white p-6">
    <div v-if="loading" class="flex justify-center py-8">
      <el-icon class="is-loading text-2xl"><Loading /></el-icon>
    </div>

    <div v-else-if="commission" class="space-y-6">
      <!-- 邀请码 -->
      <div class="flex items-center gap-4 rounded-lg bg-orange-50 p-4">
        <div>
          <div class="text-sm text-gray-500">我的邀请码</div>
          <div class="text-xl font-bold text-orange-500">{{ commission.inviteCode }}</div>
        </div>
        <el-button type="primary" :icon="CopyDocument" circle @click="handleCopy" />
      </div>

      <!-- 佣金统计 -->
      <div class="grid grid-cols-3 gap-4">
        <div class="rounded-lg bg-gray-50 p-4 text-center">
          <div class="text-2xl font-bold text-green-500">
            ¥{{ commission.commissionBalance.toFixed(2) }}
          </div>
          <div class="text-sm text-gray-500">可提现余额</div>
        </div>
        <div class="rounded-lg bg-gray-50 p-4 text-center">
          <div class="text-2xl font-bold text-orange-500">
            ¥{{ commission.commissionTotalEarned.toFixed(2) }}
          </div>
          <div class="text-sm text-gray-500">累计获得</div>
        </div>
        <div class="rounded-lg bg-gray-50 p-4 text-center">
          <div class="text-2xl font-bold text-blue-500">
            ¥{{ commission.commissionTotalPaid.toFixed(2) }}
          </div>
          <div class="text-sm text-gray-500">累计发放</div>
        </div>
      </div>

      <!-- 邀请人数 -->
      <div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
        <span class="text-gray-600">已邀请人数</span>
        <span class="text-xl font-bold text-orange-500">{{ commission.referralCount }} 人</span>
      </div>

      <!-- 提现按钮 -->
      <el-button type="primary" class="w-full" @click="handleOpenWithdraw">
        申请提现
      </el-button>

      <!-- 推荐人绑定 -->
      <div class="rounded-lg border border-gray-200 p-4">
        <div class="mb-2 text-sm text-gray-500">我的推荐人</div>
        <div v-if="hasBound" class="text-gray-800">
          邀请码：{{ commission.referrerInviteCode }}
        </div>
        <div v-else>
          <span class="text-gray-400">未绑定</span>
          <el-button type="primary" link class="ml-2" @click="handleOpenBind">
            绑定邀请码
          </el-button>
        </div>
      </div>
    </div>

    <!-- 提现弹窗 -->
    <el-dialog v-model="withdrawVisible" title="申请提现" width="400px">
      <div class="space-y-4">
        <p>当前可提现余额：<strong class="text-green-500">¥{{ commission?.commissionBalance.toFixed(2) }}</strong></p>
        <div>
          <span class="mr-4">选择提现金额：</span>
          <el-radio-group v-model="withdrawAmount">
            <el-radio :value="50" :disabled="!canWithdraw50">50元</el-radio>
            <el-radio :value="100" :disabled="!canWithdraw100">100元</el-radio>
          </el-radio-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="withdrawVisible = false">取消</el-button>
        <el-button type="primary" :loading="withdrawLoading" @click="handleWithdraw">
          确认提现
        </el-button>
      </template>
    </el-dialog>

    <!-- 绑定邀请码弹窗 -->
    <el-dialog v-model="bindVisible" title="绑定推荐人" width="400px">
      <div class="space-y-4">
        <el-input
          v-model="bindInviteCode"
          placeholder="请输入邀请码"
          maxlength="8"
          @keyup.enter="handlePreview"
        >
          <template #append>
            <el-button :loading="previewLoading" @click="handlePreview">验证</el-button>
          </template>
        </el-input>

        <div v-if="referrerPreview" class="rounded-lg bg-green-50 p-4">
          <p>推荐人：<strong>{{ referrerPreview.username }}</strong></p>
          <p>手机号：{{ referrerPreview.phone }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="bindVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="bindLoading"
          :disabled="!referrerPreview"
          @click="handleBind"
        >
          确认绑定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
