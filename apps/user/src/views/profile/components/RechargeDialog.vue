<!-- apps/user/src/views/profile/components/RechargeDialog.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { MemberType } from '@haifeng/shared'
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

// ── 步骤：1=三列对比  2=微信二维码 ──
const step = ref<1 | 2>(1)

// ── 用户选择 ──
const targetType = ref<'pro' | 'vip'>('pro')
const isRenewal = ref(false)

// ── 当前会员信息 ──
const currentType = computed(() => props.memberInfo?.memberType || MemberType.NORMAL)

// ── 三列按钮状态 ──
const proBtn = computed(() => {
  switch (currentType.value) {
    case MemberType.NORMAL: return { text: '升级到 Pro', disabled: false }
    case MemberType.PRO: return { text: '续费', disabled: false }
    case MemberType.VIP: return { text: '已是更高等级', disabled: true }
    default: return { text: '升级到 Pro', disabled: false }
  }
})

const vipBtn = computed(() => {
  switch (currentType.value) {
    case MemberType.NORMAL: return { text: '升级到 VIP', disabled: false }
    case MemberType.PRO: return { text: '升级到 VIP', disabled: false }
    case MemberType.VIP: return { text: '续费', disabled: false }
    default: return { text: '升级到 VIP', disabled: false }
  }
})

// ── 等级激活 / 徽章 ──
const isFreeActive = computed(() => currentType.value === MemberType.NORMAL)
const isProActive = computed(() => currentType.value === MemberType.PRO)
const isVipActive = computed(() => currentType.value === MemberType.VIP)

const proBadge = computed(() => {
  if (isVipActive.value) return '已包含'
  if (isProActive.value) return '当前'
  return '推荐'
})

const vipBadge = computed(() => {
  if (isVipActive.value) return '当前'
  return '尊享'
})

const isProColumnDisabled = computed(() => currentType.value === MemberType.VIP)

// ── 价格 ──
const proPrice = computed(() => props.siteInfo?.proPrice ?? 0)
const vipPrice = computed(() => props.siteInfo?.vipPrice ?? 0)

const wechatQr = computed(() => props.siteInfo?.contactUrl?.wechat || '')

// ── 事件处理 ──
function handleProClick() {
  if (isProColumnDisabled.value) return
  targetType.value = 'pro'
  isRenewal.value = currentType.value === MemberType.PRO
  step.value = 2
}

function handleVipClick() {
  targetType.value = 'vip'
  isRenewal.value = currentType.value === MemberType.VIP
  step.value = 2
}

function handleBack() {
  step.value = 1
}

function handleClose() {
  emit('update:visible', false)
  resetState()
}

function goToAccountSecurity() {
  emit('update:visible', false)
  resetState()
  router.push({ path: '/profile', query: { tab: 'account' } })
}

function resetState() {
  step.value = 1
  targetType.value = 'pro'
  isRenewal.value = false
}

watch(
  () => props.visible,
  (val) => {
    if (val) resetState()
  }
)
</script>

<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    width="960px"
    :show-close="false"
    center
    class="recharge-dialog"
  >
    <!-- ═══════════════ 步骤1：三列对比 ═══════════════ -->
    <template v-if="step === 1">
      <!-- 微信号未填写提示 -->
      <div v-if="!memberInfo?.hasWechat" class="wechat-hint">
        <div class="hint-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div class="hint-text">请先在「账号安全」中填写微信号</div>
        <button class="btn-brand" @click="goToAccountSecurity">前往填写</button>
      </div>

      <!-- 三列卡片 -->
      <template v-else>
        <!-- 三列 -->
        <div class="columns-wrap">
          <!-- 列1：免费 -->
          <div class="plan-col plan-free" :class="{ active: isFreeActive }">
            <div class="col-accent-bar free-bar"></div>
            <div class="col-badge free-badge" v-if="isFreeActive">当前</div>

            <!-- 图标 + 名称 -->
            <div class="col-header">
              <div class="col-icon free-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
              </div>
              <div class="col-title-group">
                <div class="col-title">免费版</div>
                <div class="col-subtitle">基础体验</div>
              </div>
            </div>

            <!-- 价格 -->
            <div class="col-price-section">
              <div class="col-price-row">
                <span class="col-price">¥0</span>
                <span class="col-price-unit">永久免费</span>
              </div>
              <div class="col-price-divider"></div>
            </div>

            <!-- 按钮 -->
            <button class="col-btn col-btn-disabled" disabled>当前等级</button>

            <!-- 权限列表 -->
            <ul class="col-permissions">
              <li>院校信息查询、专业详情浏览</li>
              <li>城市数据、行业分类概览</li>
              <li>就业招聘岗位浏览</li>
              <li>特殊招生、竞赛、证书查询</li>
              <li>研究生专栏阅读</li>
              <li>个人资料管理、佣金提现、消息通知</li>
            </ul>
          </div>

          <!-- 列2：Pro -->
          <div
            class="plan-col plan-pro"
            :class="{ active: isProActive, disabled: isProColumnDisabled }"
          >
            <div class="col-accent-bar pro-bar"></div>
            <div class="col-badge pro-badge">{{ proBadge }}</div>

            <div class="col-header">
              <div class="col-icon pro-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
              </div>
              <div class="col-title-group">
                <div class="col-title">专业版</div>
                <div class="col-subtitle">Pro · 解锁更多</div>
              </div>
            </div>

            <div class="col-price-section">
              <div class="col-price-row">
                <span class="col-price">¥{{ proPrice || '—' }}</span>
                <span class="col-price-unit">/ 年</span>
              </div>
              <div class="col-price-monthly" v-if="proPrice > 0">
                约 ¥{{ (proPrice / 12).toFixed(2) }} / 月
              </div>
              <div class="col-price-divider"></div>
            </div>

            <button
              class="col-btn"
              :class="{ 'col-btn-active': !proBtn.disabled, 'col-btn-disabled': proBtn.disabled }"
              :disabled="proBtn.disabled"
              @click="handleProClick"
            >
              {{ proBtn.text }}
            </button>

            <ul class="col-permissions">
              <li>志愿表一键导出（Word / Excel）</li>
              <li>AI 志愿分析报告查看与下载</li>
              <li>院校学术深度指南</li>
              <li>专业薪资排行 · 考研方向 · 竞赛推荐</li>
              <li>考研专业开设院校 & 本研衔接分析</li>
              <li>行业关联企业 · 企业分类筛选</li>
            </ul>
          </div>

          <!-- 列3：VIP -->
          <div class="plan-col plan-vip" :class="{ active: isVipActive }">
            <div class="col-accent-bar vip-bar"></div>
            <div class="col-badge vip-badge">{{ vipBadge }}</div>

            <div class="col-header">
              <div class="col-icon vip-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 16.5l-2.5 1.5.7-2.9-2.2-2 2.9-.3L12 10l1.1 2.8 2.9.3-2.2 2 .7 2.9z"/><path d="M20 5H4l2 6-2 6h16l-2-6 2-6z" opacity=".3"/></svg>
              </div>
              <div class="col-title-group">
                <div class="col-title">VIP 会员</div>
                <div class="col-subtitle">全部尊享权益</div>
              </div>
            </div>

            <div class="col-price-section">
              <div class="col-price-row">
                <span class="col-price">¥{{ vipPrice || '—' }}</span>
                <span class="col-price-unit">/ 年</span>
              </div>
              <div class="col-price-monthly" v-if="vipPrice > 0">
                约 ¥{{ (vipPrice / 12).toFixed(2) }} / 月
              </div>
              <div class="col-price-divider"></div>
            </div>

            <button
              class="col-btn"
              :class="{ 'col-btn-active': !vipBtn.disabled, 'col-btn-disabled': vipBtn.disabled }"
              :disabled="vipBtn.disabled"
              @click="handleVipClick"
            >
              {{ vipBtn.text }}
            </button>

            <ul class="col-permissions">
              <li>AI 智能生成专属志愿分析报告</li>
              <li>录取专业组分数线与详情查询</li>
              <li>资源文件直接下载</li>
            </ul>
          </div>
        </div>
      </template>
    </template>

    <!-- ═══════════════ 步骤2：微信二维码 ═══════════════ -->
    <template v-if="step === 2">
      <div class="step-two-inner">
      <div class="dialog-header">
        <button class="back-btn" @click="handleBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div class="header-title step-title">
          {{ isRenewal ? '续费' : '升级' }}{{ targetType === 'pro' ? '专业版' : 'VIP会员' }}
        </div>
      </div>

      <div v-if="wechatQr" class="qr-section">
        <div class="qr-label">扫码添加管理员微信</div>
        <div class="qr-wrapper">
          <img :src="wechatQr" alt="管理员微信二维码" class="qr-image" />
        </div>
        <div class="qr-hint">请联系管理员充值，有优惠</div>
      </div>
      <div v-else class="qr-empty">
        <div class="qr-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="3"/>
            <rect x="7" y="7" width="10" height="10" rx="1"/>
            <line x1="12" y1="7" x2="12" y2="17"/>
            <line x1="7" y1="12" x2="17" y2="12"/>
          </svg>
        </div>
        <div class="qr-empty-text">管理员暂未设置微信二维码</div>
        <div class="qr-empty-hint">请联系管理员配置</div>
      </div>

      <button class="btn-brand" @click="handleClose">我知道了</button>
      </div>
    </template>
  </el-dialog>
</template>

<style>
/* el-dialog teleport 到 body，scoped 的 data-v 属性在 teleport 元素上丢失，
   导致 .recharge-dialog 选不到根元素、background:transparent 失效。
   此处用全局非 scoped 样式 + !important 强制令弹窗根元素背景透明，
   只保留三列卡片本身的白底，卡片间露出遮罩。 */
.el-dialog.recharge-dialog {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 24px;
  overflow: visible;
}
</style>

<style scoped>
/* ═══════ 全局弹窗底色（scoped 内备用，实际靠上面全局样式生效） ═══════ */
.recharge-dialog {
  border-radius: 24px;
  overflow: visible;
  background: transparent;
  box-shadow: none;
}

.recharge-dialog :deep(.el-overlay-dialog) {
  background: rgba(0, 0, 0, 0.2);
}

.recharge-dialog :deep(.el-dialog__header) {
  display: none;
}

.recharge-dialog :deep(.el-dialog__body) {
  padding: 0;
}

/* ═══════ 通用：对话框头部 ═══════ */
.step-two-inner {
  background: #ffffff;
  border-radius: 24px;
  padding: 1rem 0;
}

.dialog-header {
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative;
  padding: 1.5rem 2rem 0;
}

.header-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 0.875rem;
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
  width: 26px;
  height: 26px;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.header-sub {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 0.35rem;
}

.step-title {
  margin-bottom: 0;
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

/* ═══════ 微信号提示 ═══════ */
.wechat-hint {
  text-align: center;
  padding: 2rem 0;
  background: #ffffff;
  border-radius: 24px;
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

/* ═══════ 三列布局 ═══════ */
.columns-wrap {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 12px 8px;
}

/* ═══════ 单列卡片 ═══════ */
.plan-col {
  flex: 1;
  min-width: 0;
  background: #ffffff;
  border-radius: 16px;
  padding: 44px 24px 40px;
  position: relative;
  overflow: hidden;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease, border-color 0.28s ease;
}

/* —— 顶部装饰条 —— */
.col-accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 16px 16px 0 0;
}

/* —— 等级徽章（右上角） —— */
.col-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 3px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  border-radius: 9999px;
  line-height: 1.7;
}

/* ── 免费列 ── */
.plan-free {
  border: 2px solid #e5e7eb;
}
.plan-free.active {
  border-color: #d1d5db;
}
.free-bar { background: #e5e7eb; }
.free-badge { background: #9ca3af; }
.free-icon {
  background: #f3f4f6;
  color: #9ca3af;
}

/* ── Pro 列 ── */
.plan-pro {
  border: 2px solid #fdba74;
}
.plan-pro.active {
  border-color: #f97316;
}
.plan-pro.disabled {
  border-color: #e5e7eb;
  background: #fafafa;
  box-shadow: none;
}
.plan-pro.disabled .col-title,
.plan-pro.disabled .col-title-group .col-title {
  color: #9ca3af;
}
.plan-pro.disabled .col-subtitle {
  color: #b0b7c3;
}
.plan-pro.disabled .col-price {
  color: #9ca3af;
}
.plan-pro.disabled .col-price-monthly {
  color: #b0b7c3;
}
.plan-pro.disabled .col-permissions li {
  color: #b0b7c3;
}
.pro-bar { background: linear-gradient(90deg, #f97316, #fb923c); }
.pro-badge { background: linear-gradient(135deg, #f97316, #fb923c); }

/* Pro 列禁用态覆盖徽章 */
.plan-pro.disabled .pro-bar { background: #d1d5db; }
.plan-pro.disabled .pro-badge { background: #9ca3af; }
.plan-pro.disabled .pro-icon {
  background: #e5e7eb;
  color: #9ca3af;
}

/* ── VIP 列 ── */
.plan-vip {
  border: 2px solid #fcd34d;
}
.plan-vip.active {
  border-color: #d97706;
}

/* —— hover 动态高亮：鼠标悬停任意可点列即上浮 + 边框点亮 —— */
.plan-col:hover {
  transform: translateY(-8px);
}
.plan-free:hover {
  border-color: #9ca3af;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
}
.plan-pro:hover {
  border-color: #f97316;
  box-shadow: 0 14px 30px rgba(249, 115, 22, 0.3);
}
.plan-vip:hover {
  border-color: #d97706;
  box-shadow: 0 14px 30px rgba(245, 158, 11, 0.3);
}
.plan-pro.disabled:hover {
  transform: none;
  box-shadow: none;
  border-color: #e5e7eb;
}
.vip-bar { background: linear-gradient(90deg, #f59e0b, #fb923c); }
.vip-badge { background: linear-gradient(135deg, #f59e0b, #d97706); }

/* ── 通用：列头图标 ── */
.col-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
  margin-bottom: 16px;
}

.col-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.col-icon svg {
  width: 24px;
  height: 24px;
}

.pro-icon {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #ffffff;
}

.vip-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff;
}

.col-title-group {
  min-width: 0;
}

.col-title {
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.3;
}

.plan-pro .col-title {
  color: #e8722a;
}

.plan-vip .col-title {
  color: #b45309;
}

.col-subtitle {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 1px;
}

.plan-pro .col-subtitle {
  color: #fb923c;
}

.plan-vip .col-subtitle {
  color: #d97706;
}

/* ── 价格区 ── */
.col-price-section {
  margin-bottom: 16px;
}

.col-price-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.col-price {
  font-size: 30px;
  font-weight: 800;
  color: #6b7280;
}

.plan-pro .col-price {
  color: #ea580c;
}

.plan-vip .col-price {
  color: #d97706;
}

.col-price-unit {
  font-size: 12px;
  color: #9ca3af;
}

.col-price-monthly {
  font-size: 10px;
  color: #fb923c;
  margin-top: 2px;
}

.plan-vip .col-price-monthly {
  color: #f59e0b;
}

.col-price-divider {
  height: 1px;
  background: #f3f4f6;
  margin-top: 10px;
}

.plan-pro .col-price-divider {
  background: #fed7aa;
}

.plan-vip .col-price-divider {
  background: #fde68a;
}

/* ── 按钮 ── */
.col-btn {
  display: block;
  width: 100%;
  padding: 12px 0;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-bottom: 18px;
}

.col-btn-active {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #ffffff;
  box-shadow: 0 3px 12px rgba(249, 115, 22, 0.25);
}

.col-btn-active:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px rgba(249, 115, 22, 0.35);
}

.plan-vip .col-btn-active {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 3px 12px rgba(245, 158, 11, 0.25);
}

.plan-vip .col-btn-active:hover {
  box-shadow: 0 5px 16px rgba(245, 158, 11, 0.35);
}

.col-btn-disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

/* ── 权限列表 ── */
.col-permissions {
  list-style: none;
  padding: 0;
  margin: 0;
}

.col-permissions li {
  position: relative;
  padding-left: 18px;
  font-size: 12px;
  color: #6b7280;
  line-height: 2.4;
}

.col-permissions li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d1d5db;
}

.plan-pro .col-permissions li::before {
  background: #fb923c;
}

.plan-vip .col-permissions li::before {
  background: #f59e0b;
}

/* ═══════ 时长选择 ═══════ */
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

/* ── 价格展示 ── */
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

/* ── 升级说明 ── */
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

/* ── 品牌按钮 ── */
.btn-brand {
  display: block;
  width: calc(100% - 4rem);
  margin: 0 auto;
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

.btn-brand:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
}

.btn-brand:active {
  transform: translateY(0);
}

/* ── 订单摘要 ── */
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

.order-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
}

/* ── 二维码 ── */
.qr-section {
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 2rem;
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

/* ── 二维码为空 ── */
.qr-empty {
  text-align: center;
  padding: 3rem 2rem;
  margin: 0 2rem 2rem;
  background: #fafafa;
  border-radius: 12px;
}

.qr-empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 0.75rem;
  color: #d1d5db;
}

.qr-empty-icon svg {
  width: 100%;
  height: 100%;
}

.qr-empty-text {
  font-size: 0.95rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.qr-empty-hint {
  font-size: 0.8rem;
  color: #9ca3af;
}
</style>
