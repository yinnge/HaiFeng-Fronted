<!-- apps/user/src/views/profile/components/CommissionPanel.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument, Loading } from '@element-plus/icons-vue'
import type { CommissionVO, ReferrerPreviewVO } from '@/types/member/commission'
import { getCommission, withdraw, previewReferrer, bindReferrer } from '@/api/member/commission'

const commission = ref<CommissionVO | null>(null)
const loading = ref(false)

const withdrawVisible = ref(false)
const withdrawAmount = ref<50 | 100>(50)
const withdrawLoading = ref(false)

const bindVisible = ref(false)
const bindInviteCode = ref('')
const bindLoading = ref(false)
const referrerPreview = ref<ReferrerPreviewVO | null>(null)
const previewLoading = ref(false)

const canWithdraw50 = computed(() => (commission.value?.commissionBalance || 0) >= 50)
const canWithdraw100 = computed(() => (commission.value?.commissionBalance || 0) >= 100)
const hasBound = computed(() => !!commission.value?.referrerInviteCode)

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

function handleCopy() {
  if (!commission.value?.inviteCode) return
  navigator.clipboard.writeText(commission.value.inviteCode)
  ElMessage.success('邀请码已复制')
}

function handleOpenWithdraw() {
  withdrawAmount.value = 50
  withdrawVisible.value = true
}

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

function handleOpenBind() {
  bindInviteCode.value = ''
  referrerPreview.value = null
  bindVisible.value = true
}

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

loadCommission()
</script>

<template>
  <div class="commission-panel">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <el-icon class="is-loading text-3xl text-orange-500"><Loading /></el-icon>
    </div>

    <template v-else-if="commission">
      <!-- 三列统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card stat-card-green">
          <div class="stat-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <div class="stat-value">¥{{ commission.commissionBalance.toFixed(2) }}</div>
          <div class="stat-label">可提现余额</div>
        </div>
        <div class="stat-card stat-card-orange">
          <div class="stat-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="stat-value">¥{{ commission.commissionTotalEarned.toFixed(2) }}</div>
          <div class="stat-label">累计获得</div>
        </div>
        <div class="stat-card stat-card-blue">
          <div class="stat-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="stat-value">¥{{ commission.commissionTotalPaid.toFixed(2) }}</div>
          <div class="stat-label">累计发放</div>
        </div>
      </div>

      <!-- 申请提现按钮 - 居中椭圆 -->
      <div class="withdraw-action">
        <el-button class="withdraw-btn" @click="handleOpenWithdraw">
          申请提现
        </el-button>
      </div>

      <!-- 已邀请人数 -->
      <div class="invite-count-card">
        <div class="invite-count-left">
          <svg class="invite-count-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <span class="invite-count-label">已邀请人数</span>
        </div>
        <span class="invite-count-value">{{ commission.referralCount }} 人</span>
      </div>

      <!-- 我的邀请码 -->
      <div class="section-card">
        <div class="section-header">
          <svg class="section-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clip-rule="evenodd" />
          </svg>
          <span class="section-title">我的邀请码</span>
        </div>
        <div class="section-content">
          <div class="invite-code-row">
            <span class="invite-code-text">{{ commission.inviteCode }}</span>
            <el-button class="copy-btn" :icon="CopyDocument" circle @click="handleCopy" />
          </div>
        </div>
      </div>

      <!-- 我的推荐人 -->
      <div class="section-card">
        <div class="section-header">
          <svg class="section-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <span class="section-title">我的推荐人</span>
        </div>
        <div class="section-content">
          <div v-if="hasBound" class="referrer-bound">
            邀请码：{{ commission.referrerInviteCode }}
          </div>
          <div v-else class="referrer-unbound">
            <span class="text-gray-400">未绑定推荐人</span>
            <el-button type="primary" link @click="handleOpenBind">立即绑定</el-button>
          </div>
        </div>
      </div>
    </template>

    <!-- 提现弹窗 -->
    <el-dialog v-model="withdrawVisible" title="申请提现" width="400px" class="brand-dialog">
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
        <el-button type="primary" :loading="withdrawLoading" class="dialog-btn" @click="handleWithdraw">
          确认提现
        </el-button>
      </template>
    </el-dialog>

    <!-- 绑定邀请码弹窗 -->
    <el-dialog v-model="bindVisible" title="绑定推荐人" width="400px" class="brand-dialog">
      <div class="space-y-4">
        <el-input
          v-model="bindInviteCode"
          placeholder="请输入邀请码"
          maxlength="16"
          @keyup.enter="handlePreview"
        >
          <template #append>
            <el-button :loading="previewLoading" @click="handlePreview">验证</el-button>
          </template>
        </el-input>

        <div v-if="referrerPreview" class="preview-result">
          <div class="preview-avatar">
            {{ referrerPreview.username?.charAt(0) || '?' }}
          </div>
          <div class="preview-info">
            <div class="preview-name">{{ referrerPreview.username }}</div>
            <div class="preview-phone">{{ referrerPreview.phone }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="bindVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="bindLoading"
          :disabled="!referrerPreview"
          class="dialog-btn"
          @click="handleBind"
        >
          确认绑定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.commission-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* 三列统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  border-radius: 0.75rem;
  padding: 1.5rem 1.25rem;
  text-align: center;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card-green {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-color: #bbf7d0;
}

.stat-card-green .stat-icon {
  color: #16a34a;
}

.stat-card-green .stat-value {
  color: #16a34a;
}

.stat-card-orange {
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border-color: #fed7aa;
}

.stat-card-orange .stat-icon {
  color: #ea580c;
}

.stat-card-orange .stat-value {
  color: #ea580c;
}

.stat-card-blue {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #bfdbfe;
}

.stat-card-blue .stat-icon {
  color: #2563eb;
}

.stat-card-blue .stat-value {
  color: #2563eb;
}

.stat-icon {
  width: 2.25rem;
  height: 2.25rem;
  margin: 0 auto 0.5rem;
}

.stat-icon svg {
  width: 100%;
  height: 100%;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
}

/* 提现按钮 - 居中椭圆 */
.withdraw-action {
  display: flex;
  justify-content: center;
}

.withdraw-btn {
  padding: 0.625rem 2.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  background: linear-gradient(135deg, #f5a54a, #e8722a) !important;
  border: none !important;
  border-radius: 9999px;
  color: white !important;
  box-shadow: 0 4px 12px rgba(232, 114, 42, 0.3);
  transition: all 0.2s ease;
}

.withdraw-btn:hover {
  background: linear-gradient(135deg, #e8722a, #d4661a) !important;
  box-shadow: 0 6px 16px rgba(232, 114, 42, 0.4);
  transform: translateY(-1px);
}

/* 已邀请人数 */
.invite-count-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
}

.invite-count-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.invite-count-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #e8722a;
}

.invite-count-label {
  color: #374151;
  font-weight: 500;
}

.invite-count-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e8722a;
}

/* 通用 Section 卡片 */
.section-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.section-header {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  margin: 0;
}

.section-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: white;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
}

.section-content {
  padding: 1rem 1.25rem;
}

/* 邀请码行 */
.invite-code-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.invite-code-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: 0.05em;
}

.copy-btn {
  color: #e8722a !important;
  border: 1px solid #e8722a !important;
  background: white !important;
}

.copy-btn:hover {
  background: #fff7ed !important;
}

/* 推荐人 */
.referrer-bound {
  color: #374151;
  font-weight: 500;
}

.referrer-unbound {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 预览结果 */
.preview-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-radius: 0.5rem;
  border: 1px solid #bbf7d0;
}

.preview-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.preview-info {
  flex: 1;
}

.preview-name {
  font-weight: 600;
  color: #1f2937;
}

.preview-phone {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 弹窗样式 */
.dialog-btn {
  background: linear-gradient(135deg, #f5a54a, #e8722a) !important;
  border: none !important;
}

.dialog-btn:hover {
  background: linear-gradient(135deg, #e8722a, #d4661a) !important;
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
