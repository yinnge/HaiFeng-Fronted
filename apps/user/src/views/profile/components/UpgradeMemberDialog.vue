<!-- apps/user/src/views/profile/components/UpgradeMemberDialog.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { MemberType, MemberTypeLabel } from '@haifeng/shared'
import type { MemberInfoVO } from '@/types/member/info'
import type { SiteInfoVO } from '@/types/home'

const props = defineProps<{
  visible: boolean
  memberInfo: MemberInfoVO | null
  siteInfo: SiteInfoVO | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const router = useRouter()

/** 升级类型 */
type UpgradeType = 'pro' | 'vip' | 'renew_pro' | 'renew_vip'

/** 步骤: 1=选择类型, 2=选择时长, 3=确认 */
const step = ref<1 | 2 | 3>(1)

/** 用户选择的目标类型 */
const targetType = ref<'pro' | 'vip'>('pro')

/** 是否为续费操作 */
const isRenewal = ref(false)

/** 时长选项（月） */
const durationOptions = [1, 3, 6, 12, 24, 36]
const selectedMonths = ref(12)

/** 当前会员类型 */
const currentType = computed(() => props.memberInfo?.memberType || MemberType.NORMAL)

/** 是否为 Pro→VIP 升级（需要暂存 Pro 时间） */
const isProToVipUpgrade = computed(() => currentType.value === MemberType.PRO && targetType.value === 'vip' && !isRenewal.value)

/** 根据当前会员类型计算可用的升级选项 */
const upgradeOptions = computed(() => {
  const options: Array<{
    type: UpgradeType
    targetType: 'pro' | 'vip'
    isRenewal: boolean
    label: string
    desc: string
  }> = []

  switch (currentType.value) {
    case MemberType.NORMAL:
      options.push({
        type: 'pro',
        targetType: 'pro',
        isRenewal: false,
        label: '升级专业版',
        desc: '解锁专业功能',
      })
      options.push({
        type: 'vip',
        targetType: 'vip',
        isRenewal: false,
        label: '升级VIP会员',
        desc: '享全部尊享权益',
      })
      break
    case MemberType.PRO:
      options.push({
        type: 'vip',
        targetType: 'vip',
        isRenewal: false,
        label: '升级VIP会员',
        desc: '享全部尊享权益',
      })
      options.push({
        type: 'renew_pro',
        targetType: 'pro',
        isRenewal: true,
        label: '续费专业版',
        desc: '延长会员有效期',
      })
      break
    case MemberType.VIP:
      options.push({
        type: 'renew_vip',
        targetType: 'vip',
        isRenewal: true,
        label: '续费VIP会员',
        desc: '延长会员有效期',
      })
      break
  }
  return options
})

/** 年价格 */
const yearPrice = computed(() => {
  if (!props.siteInfo) return 0
  return targetType.value === 'pro' ? (props.siteInfo.proPrice ?? 0) : (props.siteInfo.vipPrice ?? 0)
})

/** 计算金额 */
const calculatedAmount = computed(() => {
  if (yearPrice.value <= 0) return '0.00'
  return ((yearPrice.value / 12) * selectedMonths.value).toFixed(2)
})

/** 微信二维码 */
const wechatQr = computed(() => props.siteInfo?.contactUrl?.wechat || '')

/** 会员到期时间展示 */
const expireDisplay = computed(() => {
  if (!props.memberInfo?.expireAt) return '暂无有效期'
  const date = new Date(props.memberInfo.expireAt)
  const now = new Date()
  if (date <= now) return '已过期'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} 到期`
})

/** 选择升级类型 */
function handleSelectOption(option: (typeof upgradeOptions.value)[number]) {
  targetType.value = option.targetType
  isRenewal.value = option.isRenewal
  step.value = 2
}

/** 点击确认（进入步骤3） */
function handleConfirm() {
  step.value = 3
}

/** 点击"我知道了"关闭弹窗 */
function handleClose() {
  emit('update:visible', false)
  resetState()
}

/** 跳转到账号安全 */
function goToAccountSecurity() {
  emit('update:visible', false)
  resetState()
  router.push({ path: '/profile', query: { tab: 'account' } })
}

/** 重置状态 */
function resetState() {
  step.value = 1
  targetType.value = 'pro'
  isRenewal.value = false
  selectedMonths.value = 12
}

/** 监听 visible 变化，打开时检查微信号 */
watch(
  () => props.visible,
  (val) => {
    if (val) {
      resetState()
      step.value = 1
    }
  }
)
</script>

<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    width="480px"
    :show-close="false"
    center
    class="upgrade-dialog"
  >
    <!-- 步骤1: 检查微信号 + 选择类型 -->
    <template v-if="step === 1">
      <!-- 微信号为空提示 -->
      <div v-if="!memberInfo?.hasWechat" class="wechat-hint">
        <div class="hint-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div class="hint-text">请先在「账号安全」中填写微信号</div>
        <button class="btn-primary" @click="goToAccountSecurity">前往填写</button>
      </div>

      <!-- 已填写微信号，展示升级选项 -->
      <template v-else>
        <div class="dialog-header">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div class="header-title">升级会员</div>
          <div class="header-sub">当前：{{ MemberTypeLabel[currentType] }} · {{ expireDisplay }}</div>
        </div>

        <div class="upgrade-options">
          <div
            v-for="option in upgradeOptions"
            :key="option.type"
            class="upgrade-option"
            @click="handleSelectOption(option)"
          >
            <div class="option-icon" :class="option.targetType">
              <svg v-if="option.targetType === 'pro'" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21H20ZM12 3C8.69 3 6 5.69 6 9C6 12.31 8.69 15 12 15C15.31 15 18 12.31 18 9C18 5.69 15.31 3 12 3Z" />
              </svg>
            </div>
            <div class="option-info">
              <div class="option-label">{{ option.label }}</div>
              <div class="option-desc">{{ option.desc }}</div>
            </div>
            <div class="option-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- 步骤2: 选择时长 + 确认金额 -->
    <template v-if="step === 2">
      <div class="dialog-header">
        <button class="back-btn" @click="step = 1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div class="header-title">
          {{ isRenewal ? '续费' : '升级' }}{{ targetType === 'pro' ? '专业版' : 'VIP会员' }}
        </div>
      </div>

      <div class="duration-section">
        <div class="section-label">选择时长</div>
        <div class="duration-grid">
          <div
            v-for="months in durationOptions"
            :key="months"
            class="duration-item"
            :class="{ active: selectedMonths === months }"
            @click="selectedMonths = months"
          >
            <div class="duration-value">{{ months }}</div>
            <div class="duration-unit">个月</div>
          </div>
        </div>
      </div>

      <div class="price-section">
        <div class="price-row">
          <span class="price-label">年价格</span>
          <span class="price-value">¥{{ yearPrice }}/年</span>
        </div>
        <div class="price-row">
          <span class="price-label">月均</span>
          <span class="price-value">¥{{ (yearPrice / 12).toFixed(2) }}/月</span>
        </div>
        <div class="price-divider"></div>
        <div class="price-row total">
          <span class="price-label">合计</span>
          <span class="price-value total">¥{{ calculatedAmount }}</span>
        </div>
      </div>

      <!-- Pro→VIP 升级说明 -->
      <div v-if="isProToVipUpgrade" class="upgrade-notice">
        <div class="notice-header">
          <svg viewBox="0 0 24 24" fill="currentColor" class="notice-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span class="notice-title">升级说明</span>
        </div>
        <div class="notice-content">
          <p>升级VIP后，您的<strong>专业版剩余时间将被暂时保存</strong>。</p>
          <p>VIP到期后会<strong>自动恢复专业版</strong>，届时专业版有效期将顺延。</p>
        </div>
      </div>

      <button class="btn-primary" @click="handleConfirm">确认选择</button>
    </template>

    <!-- 步骤3: 展示微信二维码 -->
    <template v-if="step === 3">
      <div class="dialog-header">
        <div class="header-icon success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div class="header-title">订单信息</div>
      </div>

      <div class="order-summary">
        <div class="order-row">
          <span class="order-label">升级类型</span>
          <span class="order-value">{{ isRenewal ? '续费' : '升级' }}{{ targetType === 'pro' ? '专业版' : 'VIP会员' }}</span>
        </div>
        <div class="order-row">
          <span class="order-label">时长</span>
          <span class="order-value">{{ selectedMonths }} 个月</span>
        </div>
        <div class="order-row">
          <span class="order-label">金额</span>
          <span class="order-value price">¥{{ calculatedAmount }}</span>
        </div>
      </div>

      <!-- Pro→VIP 升级说明 -->
      <div v-if="isProToVipUpgrade" class="upgrade-notice">
        <div class="notice-header">
          <svg viewBox="0 0 24 24" fill="currentColor" class="notice-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span class="notice-title">升级说明</span>
        </div>
        <div class="notice-content">
          <p>升级VIP后，您的<strong>专业版剩余时间将被暂时保存</strong>。</p>
          <p>VIP到期后会<strong>自动恢复专业版</strong>，届时专业版有效期将顺延。</p>
        </div>
      </div>

      <div v-if="wechatQr" class="qr-section">
        <div class="qr-label">扫码添加管理员微信</div>
        <div class="qr-wrapper">
          <img :src="wechatQr" alt="管理员微信二维码" class="qr-image" />
        </div>
        <div class="qr-hint">请联系管理员充值，有优惠</div>
      </div>

      <button class="btn-primary" @click="handleClose">我知道了</button>
    </template>
  </el-dialog>
</template>

<style scoped>
.upgrade-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.upgrade-dialog :deep(.el-dialog__header) {
  display: none;
}

.upgrade-dialog :deep(.el-dialog__body) {
  padding: 2rem;
}

/* 微信号为空提示 */
.wechat-hint {
  text-align: center;
  padding: 1rem 0;
}

.hint-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: #f59e0b;
}

.hint-icon svg {
  width: 100%;
  height: 100%;
}

.hint-text {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* 对话框头部 */
.dialog-header {
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.header-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 0.75rem;
  background: linear-gradient(135deg, #f97316, #fb923c);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-icon.success {
  background: linear-gradient(135deg, #22c55e, #4ade80);
}

.header-icon svg {
  width: 28px;
  height: 28px;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.header-sub {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

/* 升级选项 */
.upgrade-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upgrade-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #f3f4f6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.upgrade-option:hover {
  border-color: #f97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), rgba(251, 146, 60, 0.04));
}

.option-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-icon.pro {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: white;
}

.option-icon.vip {
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  color: white;
}

.option-icon svg {
  width: 24px;
  height: 24px;
}

.option-info {
  flex: 1;
  min-width: 0;
}

.option-label {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.option-desc {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 0.125rem;
}

.option-arrow {
  color: #d1d5db;
  flex-shrink: 0;
}

.option-arrow svg {
  width: 20px;
  height: 20px;
}

/* 时长选择 */
.duration-section {
  margin-bottom: 1.5rem;
}

.section-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.duration-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.duration-item {
  text-align: center;
  padding: 0.75rem 0.5rem;
  border: 2px solid #f3f4f6;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.duration-item:hover {
  border-color: #f97316;
}

.duration-item.active {
  border-color: #f97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.08));
}

.duration-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.duration-item.active .duration-value {
  color: #f97316;
}

.duration-unit {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.125rem;
}

/* 价格展示 */
.price-section {
  background: #fafafa;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0;
}

.price-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.price-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.price-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
}

.price-row.total .price-label {
  font-weight: 700;
  color: #1f2937;
}

.price-row.total .price-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f97316;
}

/* 主按钮 */
.btn-primary {
  display: block;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

/* 订单摘要 */
.order-summary {
  background: #fafafa;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.order-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.order-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.order-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.order-value.price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f97316;
}

/* 二维码区域 */
.qr-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.qr-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 1rem;
}

.qr-wrapper {
  display: inline-block;
  padding: 0.5rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #f3f4f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.qr-image {
  width: 160px;
  height: 160px;
  object-fit: contain;
  border-radius: 8px;
}

.qr-hint {
  font-size: 0.8rem;
  color: #f59e0b;
  margin-top: 0.75rem;
  font-weight: 500;
}

/* Pro→VIP 升级说明 */
.upgrade-notice {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 146, 60, 0.06));
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.notice-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: #f97316;
}

.notice-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.notice-content {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.6;
}

.notice-content p {
  margin: 0;
}

.notice-content strong {
  color: #ea580c;
  font-weight: 600;
}
</style>
