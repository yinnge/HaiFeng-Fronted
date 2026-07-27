<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserDetail, getUserWechat } from '@/api/user'
import { MemberTypeLabel } from '@haifeng/shared'
import type { MemberDetailVO, MemberListVO } from '@/types/user'

const props = defineProps<{
  visible: boolean
  user: MemberListVO | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const loading = ref(false)
const detail = ref<MemberDetailVO | null>(null)
const wechatPlaintext = ref<string | null>(null)
const loadingWechat = ref(false)

watch(
  () => props.visible,
  async (val) => {
    if (val && props.user) {
      wechatPlaintext.value = null
      loading.value = true
      try {
        const res = await getUserDetail(props.user.id)
        if (res.data.code === 200) {
          detail.value = res.data.data
        }
      } catch (error) {
        console.error('获取用户详情失败:', error)
      } finally {
        loading.value = false
      }
    }
  }
)

const handleViewWechat = async () => {
  if (!detail.value) return
  loadingWechat.value = true
  try {
    const res = await getUserWechat(detail.value.id)
    if (res.data.code === 200) {
      wechatPlaintext.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取微信号失败')
    }
  } catch (error) {
    console.error('获取微信明文失败:', error)
    ElMessage.error('获取微信号失败')
  } finally {
    loadingWechat.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
  detail.value = null
  wechatPlaintext.value = null
}

const formatMoney = (val: number) => val?.toFixed(2) || '0.00'

const memberTypeStyle: Record<string, { bg: string; color: string; border: string }> = {
  normal: { bg: 'linear-gradient(135deg, rgba(156,163,175,0.1), rgba(156,163,175,0.15))', color: '#6b7280', border: 'rgba(156,163,175,0.3)' },
  pro: { bg: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(251,146,60,0.12))', color: '#C2410C', border: 'rgba(249,115,22,0.2)' },
  vip: { bg: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(167,139,250,0.12))', color: '#7c3aed', border: 'rgba(139,92,246,0.2)' },
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="用户详情"
    width="700px"
    class="detail-dialog"
    @close="handleClose"
  >
    <div v-loading="loading" class="detail-content">
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="用户 ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detail.username }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
        <el-descriptions-item label="邀请码">{{ detail.inviteCode }}</el-descriptions-item>
        <el-descriptions-item label="会员类型">
          <span
            class="member-badge"
            :style="{
              background: memberTypeStyle[detail.memberType]?.bg,
              color: memberTypeStyle[detail.memberType]?.color,
              borderColor: memberTypeStyle[detail.memberType]?.border,
            }"
          >
            {{ MemberTypeLabel[detail.memberType as keyof typeof MemberTypeLabel] }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="到期时间">{{ detail.expireAt || '未开通' }}</el-descriptions-item>
        <el-descriptions-item label="微信号">
          <span class="wechat-value">{{ wechatPlaintext || detail.wechatId || '-' }}</span>
          <button
            v-if="detail.wechatId && !wechatPlaintext"
            type="button"
            class="view-wechat-btn"
            :disabled="loadingWechat"
            @click="handleViewWechat"
          >
            <span v-if="loadingWechat" class="mini-spinner"></span>
            查看明文
          </button>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <span v-if="detail.status === 'active'" class="status-badge status-on">正常</span>
          <span v-else class="status-badge status-off">禁用</span>
        </el-descriptions-item>
        <el-descriptions-item label="推荐人">
          {{ detail.referrerUsername || '-' }}
          <span v-if="detail.referrerId" class="dim-text">(ID: {{ detail.referrerId }})</span>
        </el-descriptions-item>
        <el-descriptions-item label="佣金余额">
          <span class="money-value">¥{{ formatMoney(detail.commissionBalance) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="累计佣金">
          <span class="money-value">¥{{ formatMoney(detail.commissionTotalEarned) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="已提现">
          <span class="money-value">¥{{ formatMoney(detail.commissionTotalPaid) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="最后登录">{{ detail.lastLoginAt }}</el-descriptions-item>
        <el-descriptions-item label="登录 IP">{{ detail.lastLoginIp }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updatedAt }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <button type="button" class="close-btn" @click="handleClose">关闭</button>
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

.detail-content :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}

.detail-content :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #374151;
  background: rgba(249, 115, 22, 0.06) !important;
}

.detail-content :deep(.el-descriptions__content) {
  color: #1f2937;
}

.detail-content :deep(.el-descriptions__cell) {
  border-color: rgba(249, 115, 22, 0.1);
}

.detail-content :deep(.el-descriptions__body) {
  border-radius: 8px;
  overflow: hidden;
}

.member-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border: 1px solid;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.wechat-value {
  font-family: 'SF Mono', 'Consolas', 'Liberation Mono', monospace;
  font-size: 13px;
  color: #6b7280;
}

.view-wechat-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  padding: 2px 10px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-wechat-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
}

.view-wechat-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mini-spinner {
  width: 10px;
  height: 10px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-on {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}

.status-off {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.dim-text {
  font-size: 12px;
  color: #9ca3af;
}

.money-value {
  font-size: 15px;
  font-weight: 700;
  color: #F97316;
}

.close-btn {
  display: inline-flex;
  align-items: center;
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

.close-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.close-btn:active {
  transform: translateY(0);
}
</style>
