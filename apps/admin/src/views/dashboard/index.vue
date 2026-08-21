<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboardStats, getMemberTrend, getOrderTrend, getDashboardOverview, getSystemResource } from '@/api/dashboard'
import type { DashboardStatsVO, TrendDataVO, DashboardOverviewVO, SystemResourceVO } from '@/types/dashboard'
import { Line, Column } from '@antv/g2plot'

const router = useRouter()

const loading = ref(true)
const errorMsg = ref('')
const trendError = ref('')
const overviewError = ref('')
const stats = ref<DashboardStatsVO | null>(null)
const overview = ref<DashboardOverviewVO | null>(null)
const systemResource = ref<SystemResourceVO | null>(null)
const resourceError = ref('')
const activeDays = ref(7)

let memberTrendChart: Line | null = null
let orderTrendChart: Line | null = null
let entityCompareChart: Column | null = null

const memberTrendRef = ref<HTMLDivElement>()
const orderTrendRef = ref<HTMLDivElement>()
const entityCompareRef = ref<HTMLDivElement>()

const BRAND_ORANGE = '#F97316'
const BRAND_ORANGE_LIGHT = '#FB923C'
const BRAND_BLUE = '#1e88e5'
const BRAND_GREEN = '#10b981'
const BRAND_GOLD = '#f5a54a'

const statCards = ref<{
  title: string
  value: number | string
  icon: string
  color: string
  gradient: string
}[]>([])

const entityCards = ref<{ label: string; value: number; color: string }[]>([])

async function fetchStats() {
  loading.value = true
  errorMsg.value = ''
  trendError.value = ''
  overviewError.value = ''
  try {
    const res = await getDashboardStats()
    if (res.data.code === 200 && res.data.data) {
      stats.value = res.data.data
      buildStatCards()
    } else {
      errorMsg.value = res.data.msg || '获取数据失败'
    }
  } catch (e: any) {
    errorMsg.value = e?.message || '网络错误'
  } finally {
    loading.value = false
  }
}

async function fetchTrends() {
  try {
    const [memberRes, orderRes] = await Promise.all([
      getMemberTrend(activeDays.value),
      getOrderTrend(activeDays.value),
    ])

    if (memberRes.data.code === 200 && memberRes.data.data) {
      renderMemberTrendChart(memberRes.data.data)
    }
    if (orderRes.data.code === 200 && orderRes.data.data) {
      renderOrderTrendChart(orderRes.data.data)
    }
  } catch (e: any) {
    console.error('获取趋势数据失败:', e)
    trendError.value = e?.message || '获取趋势数据失败'
  }
}

async function fetchOverview() {
  try {
    const res = await getDashboardOverview()
    if (res.data.code === 200 && res.data.data) {
      overview.value = res.data.data
    }
  } catch (e: any) {
    console.error('获取概览数据失败:', e)
    overviewError.value = e?.message || '获取概览数据失败'
  }
}

async function fetchSystemResource() {
  try {
    const res = await getSystemResource()
    if (res.data.code === 200 && res.data.data) {
      systemResource.value = res.data.data
    } else {
      resourceError.value = res.data.msg || '获取资源信息失败'
    }
  } catch (e: any) {
    console.error('获取系统资源失败:', e)
    resourceError.value = e?.message || '获取系统资源失败'
  }
}

function buildStatCards() {
  if (!stats.value) return
  const { memberStats, orderStats } = stats.value
  statCards.value = [
    {
      title: '用户总数',
      value: memberStats.totalMembers.toLocaleString(),
      icon: 'User',
      color: BRAND_BLUE,
      gradient: `linear-gradient(135deg, ${BRAND_BLUE}, #64b5f6)`,
    },
    {
      title: 'Pro 会员',
      value: memberStats.proMembers.toLocaleString(),
      icon: 'Star',
      color: BRAND_GOLD,
      gradient: `linear-gradient(135deg, ${BRAND_GOLD}, #fbbf24)`,
    },
    {
      title: 'VIP 会员',
      value: memberStats.vipMembers.toLocaleString(),
      icon: 'Medal',
      color: BRAND_ORANGE,
      gradient: `linear-gradient(135deg, ${BRAND_ORANGE}, ${BRAND_ORANGE_LIGHT})`,
    },
    {
      title: '待处理订单',
      value: orderStats.pendingOrders.toLocaleString(),
      icon: 'ShoppingCart',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
    },
  ]

  const { entityStats } = stats.value
  entityCards.value = [
    { label: '院校', value: entityStats.universityCount, color: BRAND_BLUE },
    { label: '专业', value: entityStats.majorCount, color: BRAND_ORANGE },
    { label: '行业', value: entityStats.industryCount, color: BRAND_GREEN },
    { label: '企业', value: entityStats.enterpriseCount, color: BRAND_GOLD },
    { label: '录取组', value: entityStats.admissionGroupCount, color: '#8b5cf6' },
    { label: '分数记录', value: entityStats.admissionMajorScoreCount, color: '#ec4899' },
  ]
}

function renderMemberTrendChart(data: TrendDataVO) {
  if (!memberTrendRef.value) return
  memberTrendChart?.destroy()

  memberTrendChart = new Line(memberTrendRef.value, {
    autoFit: true,
    data: data.dates.map((date, i) => ({ date, value: data.values[i] })),
    xField: 'date',
    yField: 'value',
    smooth: true,
    color: BRAND_ORANGE,
    area: {
      style: {
        fill: `l(270) 0:${BRAND_ORANGE_LIGHT}80 1:${BRAND_ORANGE}10`,
      },
    },
    point: {
      size: 3,
      shape: 'circle',
      style: {
        fill: '#fff',
        stroke: BRAND_ORANGE,
        lineWidth: 2,
      },
    },
    xAxis: {
      tickCount: activeDays.value <= 7 ? 7 : activeDays.value <= 30 ? 10 : 12,
      label: {
        style: {
          fontSize: 11,
          fill: '#9ca3af',
        },
      },
      line: null,
      tickLine: null,
    },
    yAxis: {
      label: {
        style: {
          fontSize: 11,
          fill: '#9ca3af',
        },
      },
      grid: {
        line: {
          style: {
            stroke: '#f3f4f6',
          },
        },
      },
    },
    tooltip: {
      showCrosshairs: true,
    },
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 800,
      },
    },
  })

  memberTrendChart.render()
}

function renderOrderTrendChart(data: TrendDataVO) {
  if (!orderTrendRef.value) return
  orderTrendChart?.destroy()

  orderTrendChart = new Line(orderTrendRef.value, {
    autoFit: true,
    data: data.dates.map((date, i) => ({ date, value: data.values[i] })),
    xField: 'date',
    yField: 'value',
    smooth: true,
    color: BRAND_BLUE,
    area: {
      style: {
        fill: `l(270) 0:#64b5f680 1:${BRAND_BLUE}10`,
      },
    },
    point: {
      size: 3,
      shape: 'circle',
      style: {
        fill: '#fff',
        stroke: BRAND_BLUE,
        lineWidth: 2,
      },
    },
    xAxis: {
      tickCount: activeDays.value <= 7 ? 7 : activeDays.value <= 30 ? 10 : 12,
      label: {
        style: {
          fontSize: 11,
          fill: '#9ca3af',
        },
      },
      line: null,
      tickLine: null,
    },
    yAxis: {
      label: {
        style: {
          fontSize: 11,
          fill: '#9ca3af',
        },
      },
      grid: {
        line: {
          style: {
            stroke: '#f3f4f6',
          },
        },
      },
    },
    tooltip: {
      showCrosshairs: true,
    },
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 800,
      },
    },
  })

  orderTrendChart.render()
}

function renderEntityCompareChart() {
  if (!entityCompareRef.value || !entityCards.value.length) return
  entityCompareChart?.destroy()

  entityCompareChart = new Column(entityCompareRef.value, {
    autoFit: true,
    data: entityCards.value.map((item) => ({ type: item.label, value: item.value, color: item.color })),
    xField: 'type',
    yField: 'value',
    color: (datum: any) => datum.color,
    columnWidthRatio: 0.6,
    label: {
      position: 'top',
      style: {
        fontSize: 11,
        fill: '#6b7280',
      },
    },
    xAxis: {
      label: {
        style: {
          fontSize: 11,
          fill: '#9ca3af',
        },
      },
      line: null,
      tickLine: null,
    },
    yAxis: {
      label: {
        style: {
          fontSize: 11,
          fill: '#9ca3af',
        },
      },
      grid: {
        line: {
          style: {
            stroke: '#f3f4f6',
          },
        },
      },
    },
    animation: {
      appear: {
        animation: 'zoom-in',
        duration: 600,
      },
    },
  })

  entityCompareChart.render()
}

function handleDaysChange(days: number) {
  activeDays.value = days
  fetchTrends()
}

function goToWithdrawTodo() {
  router.push({ path: '/user/withdraw', query: { status: 'pending' } })
}

function goToOrderTodo() {
  router.push({ path: '/user/order', query: { status: 'pending' } })
}

function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

/** 格式化比率（%），后端返回 0~100 的数值；不支持的环境返回「不支持」 */
function formatRate(v: number | string | null): string {
  if (v === null || v === undefined || v === '') return '不支持'
  const n = Number(v)
  if (Number.isNaN(n)) return '不支持'
  return `${n.toFixed(2)}%`
}

/** 格式化 GB 数值，保留两位小数 */
function formatGb(v: number | string | null): string {
  if (v === null || v === undefined || v === '') return '-'
  const n = Number(v)
  if (Number.isNaN(n)) return '-'
  return n.toFixed(2)
}

onMounted(async () => {
  await Promise.all([fetchStats(), fetchOverview(), fetchSystemResource()])
  await fetchTrends()
  await nextTick()
  renderEntityCompareChart()
})

onBeforeUnmount(() => {
  memberTrendChart?.destroy()
  orderTrendChart?.destroy()
  entityCompareChart?.destroy()
})
</script>

<template>
  <div class="dashboard-container">
    <div class="brand-watermark brand-watermark--top-right" />
    <div class="brand-watermark brand-watermark--bottom-left" />

    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">控制面板</h2>
        <p class="mt-1 text-sm text-gray-500">系统数据概览与趋势分析</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-for="days in [7, 30, 90]"
          :key="days"
          class="time-btn"
          :class="{ 'time-btn--active': activeDays === days }"
          @click="handleDaysChange(days)"
        >
          {{ days }}天
        </button>
      </div>
    </div>

    <div v-if="loading" v-loading="loading" class="min-h-[400px] rounded-xl bg-white p-6" />

    <el-alert
      v-if="!loading && errorMsg"
      :title="errorMsg"
      type="error"
      show-icon
      :closable="false"
      class="mb-4"
    />

    <div v-if="!loading && stats" class="bento-grid">
      <!-- Row 1: 4个统计卡片 -->
      <div
        v-for="card in statCards"
        :key="card.title"
        class="bento-cell bento-cell--stat"
      >
        <div class="stat-card">
          <div class="stat-card__icon" :style="{ background: card.gradient }">
            <el-icon :size="22" color="#fff">
              <component :is="card.icon" />
            </el-icon>
          </div>
          <div class="stat-card__content">
            <p class="stat-card__label">{{ card.title }}</p>
            <p class="stat-card__value" :style="{ color: card.color }">{{ card.value }}</p>
          </div>
        </div>
      </div>

      <!-- Row 2 左: 订单增长趋势 (3列) -->
      <div class="bento-cell bento-cell--order-trend">
        <div class="chart-header">
          <h3 class="chart-title">订单增长趋势</h3>
          <span class="chart-badge chart-badge--blue">折线图</span>
        </div>
        <div ref="orderTrendRef" class="chart-container chart-container--tall" />
        <div v-if="trendError" class="chart-empty">{{ trendError }}</div>
      </div>

      <!-- Row 2 右: 系统信息 (1列) -->
      <div class="bento-cell bento-cell--system">
        <div class="overview-section">
          <div class="overview-header">
            <span class="overview-icon">⚙️</span>
            <h3 class="overview-title">系统信息</h3>
          </div>
          <div v-if="overview" class="overview-list">
            <div class="overview-item">
              <span class="overview-label">网站名称</span>
              <span class="overview-value">{{ overview.systemInfo.siteName || '-' }}</span>
            </div>
            <div class="overview-item">
              <span class="overview-label">厂商 / 模型</span>
              <span class="overview-value overview-value--tag">{{ overview.systemInfo.aiProvider || '-' }} / {{ overview.systemInfo.aiModel || '-' }}</span>
            </div>
            <div class="overview-item">
              <span class="overview-label">版本</span>
              <span class="overview-value overview-value--tag">v{{ overview.systemInfo.appVersion }}</span>
            </div>
            <div class="overview-item">
              <span class="overview-label">管理员数</span>
              <span class="overview-value overview-value--highlight">{{ overview.systemInfo.adminCount }}</span>
            </div>
            <div v-if="systemResource" class="overview-item">
              <span class="overview-label">CPU 核心数</span>
              <span class="overview-value">{{ systemResource.cpuCores }} 核</span>
            </div>
            <div v-if="systemResource" class="overview-item">
              <span class="overview-label">CPU 使用率</span>
              <span class="overview-value overview-value--highlight">{{ formatRate(systemResource.cpuUsageRate) }}</span>
            </div>
            <div v-if="systemResource" class="overview-item">
              <span class="overview-label">内存占用</span>
              <span class="overview-value overview-value--highlight">{{ formatGb(systemResource.usedMemoryGb) }} / {{ formatGb(systemResource.totalMemoryGb) }} GB</span>
            </div>
            <div v-if="systemResource" class="overview-item">
              <span class="overview-label">内存使用率</span>
              <span class="overview-value overview-value--highlight">{{ formatRate(systemResource.memoryUsageRate) }}</span>
            </div>
          </div>
          <div v-else class="chart-empty">{{ overviewError || '暂无数据' }}</div>
        </div>
      </div>

      <!-- Row 3 左: 用户增长趋势 (2列) -->
      <div class="bento-cell bento-cell--half">
        <div class="chart-header">
          <h3 class="chart-title">用户增长趋势</h3>
          <span class="chart-badge">折线图</span>
        </div>
        <div ref="memberTrendRef" class="chart-container" />
        <div v-if="trendError" class="chart-empty">{{ trendError }}</div>
      </div>

      <!-- Row 3 右: 实体数据对比 (2列) -->
      <div class="bento-cell bento-cell--half">
        <div class="chart-header">
          <h3 class="chart-title">实体数据对比</h3>
          <span class="chart-badge chart-badge--green">柱状图</span>
        </div>
        <div ref="entityCompareRef" class="chart-container" />
      </div>

      <!-- Row 4: 订单待办 + 提现待办 -->
      <template v-if="overview">
        <div class="bento-cell bento-cell--half bento-cell--clickable" @click="goToOrderTodo">
          <div class="overview-section">
            <div class="overview-header">
              <span class="overview-icon">📋</span>
              <h3 class="overview-title">订单待办</h3>
              <span class="overview-badge">{{ overview.todoList.pendingOrderCount }} 笔待处理</span>
            </div>
            <div class="todo-list">
              <div
                v-for="order in overview.todoList.pendingOrders"
                :key="order.id"
                class="todo-item"
              >
                <div class="todo-item__info">
                  <span class="todo-item__name">{{ order.memberName }}</span>
                  <span class="todo-item__time">{{ formatTime(order.createdAt) }}</span>
                </div>
                <span class="todo-item__amount">¥{{ order.amount }}</span>
              </div>
              <div v-if="overview.todoList.pendingOrders.length === 0" class="todo-empty">
                暂无待处理订单
              </div>
            </div>
            <div v-if="overview.todoList.pendingOrderCount > 0" class="todo-link">
              点击查看全部 →
            </div>
          </div>
        </div>

        <div class="bento-cell bento-cell--half bento-cell--clickable" @click="goToWithdrawTodo">
          <div class="overview-section">
            <div class="overview-header">
              <span class="overview-icon">💰</span>
              <h3 class="overview-title">提现待办</h3>
              <span class="overview-badge overview-badge--gold">{{ overview.todoList.pendingWithdrawCount }} 笔待处理</span>
            </div>
            <div class="todo-list">
              <div
                v-for="withdraw in overview.todoList.pendingWithdraws"
                :key="withdraw.id"
                class="todo-item"
              >
                <div class="todo-item__info">
                  <span class="todo-item__name">{{ withdraw.memberName }}</span>
                  <span class="todo-item__time">{{ formatTime(withdraw.createdAt) }}</span>
                </div>
                <span class="todo-item__amount">¥{{ withdraw.amount }}</span>
              </div>
              <div v-if="overview.todoList.pendingWithdraws.length === 0" class="todo-empty">
                暂无待处理提现
              </div>
            </div>
            <div v-if="overview.todoList.pendingWithdrawCount > 0" class="todo-link">
              点击查看全部 →
            </div>
          </div>
        </div>
      </template>
      <div v-else class="bento-cell bento-cell--full">
        <div class="chart-empty">
          <template v-if="overviewError">{{ overviewError }}</template>
          <template v-else>暂无数据</template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  position: relative;
  min-height: calc(100vh - 120px);
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 247, 237, 0.6) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 247, 237, 0.3) 100%);
}

.brand-watermark {
  position: absolute;
  width: 200px;
  height: 200px;
  background-image: url('@/assets/images/logo-main.png');
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.03;
  pointer-events: none;
}

.brand-watermark--top-right {
  top: 20px;
  right: 20px;
}

.brand-watermark--bottom-left {
  bottom: 20px;
  left: 20px;
  transform: rotate(180deg);
}

.time-btn {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-btn:hover {
  color: #F97316;
  border-color: #F97316;
}

.time-btn--active {
  color: #fff;
  background: linear-gradient(135deg, #F97316, #FB923C);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.time-btn--active:hover {
  color: #fff;
}

/* ==================== Bento Grid（4列） ==================== */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto auto auto;
  gap: 16px;
}

.bento-cell {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(249, 115, 22, 0.08);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}

.bento-cell:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  transform: translateY(-1px);
}

/* Row 1: 统计卡片 */
.bento-cell--stat {
  grid-row: 1;
}

.bento-cell--stat:nth-child(1) { grid-column: 1; }
.bento-cell--stat:nth-child(2) { grid-column: 2; }
.bento-cell--stat:nth-child(3) { grid-column: 3; }
.bento-cell--stat:nth-child(4) { grid-column: 4; }

/* Row 2: 订单趋势（3列）+ 系统信息（1列） */
.bento-cell--order-trend {
  grid-column: 1 / span 3;
  grid-row: 2;
  min-height: 400px;
}

.bento-cell--system {
  grid-column: 4;
  grid-row: 2;
  display: flex;
  flex-direction: column;
}

/* Row 3 & 4: 各占2列 */
.bento-cell--half {
  grid-column: span 2;
}

.bento-cell--full {
  grid-column: 1 / -1;
}

/* ==================== 统计卡片 ==================== */
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 4px 0;
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-card__content {
  flex: 1;
  min-width: 0;
}

.stat-card__label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.stat-card__value {
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

/* ==================== 图表 ==================== */
.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.chart-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  color: #F97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1));
  border-radius: 12px;
}

.chart-badge--blue {
  color: #1e88e5;
  background: linear-gradient(135deg, rgba(30, 136, 229, 0.1), rgba(100, 181, 246, 0.1));
}

.chart-badge--green {
  color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1));
}

.chart-container {
  width: 100%;
  height: calc(100% - 40px);
  min-height: 220px;
}

.chart-container--tall {
  min-height: 340px;
}

/* ==================== 系统信息 ==================== */
.overview-section {
  flex: 1;
}

.overview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.overview-icon {
  font-size: 14px;
}

.overview-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.overview-badge {
  margin-left: auto;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  color: #F97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1));
  border-radius: 10px;
}

.overview-badge--gold {
  color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.1));
}

.overview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.overview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(249, 115, 22, 0.08);
}

.overview-item:last-child {
  border-bottom: none;
}

.overview-label {
  font-size: 12px;
  color: #9ca3af;
}

.overview-value {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.overview-value--tag {
  padding: 1px 6px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.08));
  border-radius: 4px;
  color: #F97316;
}

.overview-value--highlight {
  font-weight: 600;
  color: #F97316;
}

/* ==================== 待办事项 ==================== */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: linear-gradient(135deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  border-radius: 8px;
  border: 1px solid rgba(249, 115, 22, 0.06);
  transition: all 0.2s ease;
}

.todo-item:hover {
  background: #fff;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.06);
}

.todo-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.todo-item__name {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.todo-item__time {
  font-size: 10px;
  color: #9ca3af;
}

.todo-item__amount {
  font-size: 13px;
  font-weight: 600;
  color: #F97316;
  font-variant-numeric: tabular-nums;
}

.todo-empty {
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
}

.bento-cell--clickable {
  cursor: pointer;
}

.bento-cell--clickable:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.12);
}

.todo-link {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 500;
  color: #F97316;
  text-align: right;
}

.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #9ca3af;
  font-size: 13px;
}

/* ==================== 响应式 ==================== */
@media (max-width: 1280px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .bento-cell--stat:nth-child(1) { grid-column: 1; }
  .bento-cell--stat:nth-child(2) { grid-column: 2; }
  .bento-cell--stat:nth-child(3) { grid-column: 1; }
  .bento-cell--stat:nth-child(4) { grid-column: 2; }

  .bento-cell--order-trend {
    grid-column: 1 / -1;
  }

  .bento-cell--system {
    grid-column: 1 / -1;
  }

  .bento-cell--half {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: 16px;
  }

  .bento-grid {
    grid-template-columns: 1fr;
  }

  .bento-cell--stat:nth-child(1),
  .bento-cell--stat:nth-child(2),
  .bento-cell--stat:nth-child(3),
  .bento-cell--stat:nth-child(4) {
    grid-column: 1;
  }

  .bento-cell--half {
    grid-column: 1;
  }

  .stat-card__value {
    font-size: 18px;
  }
}
</style>
