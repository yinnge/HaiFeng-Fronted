<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { getDashboardStats, getMemberTrend, getOrderTrend, getDashboardOverview } from '@/api/dashboard'
import type { DashboardStatsVO, TrendDataVO, DashboardOverviewVO } from '@/types/dashboard'
import { Line, Column } from '@antv/g2plot'

const loading = ref(true)
const errorMsg = ref('')
const stats = ref<DashboardStatsVO | null>(null)
const overview = ref<DashboardOverviewVO | null>(null)
const activeDays = ref(7)

// 图表实例
let memberTrendChart: Line | null = null
let orderTrendChart: Line | null = null
let entityCompareChart: Column | null = null

// 图表容器 ref
const memberTrendRef = ref<HTMLDivElement>()
const orderTrendRef = ref<HTMLDivElement>()
const entityCompareRef = ref<HTMLDivElement>()

// 品牌色
const BRAND_ORANGE = '#F97316'
const BRAND_ORANGE_LIGHT = '#FB923C'
const BRAND_BLUE = '#1e88e5'
const BRAND_GREEN = '#10b981'
const BRAND_GOLD = '#f5a54a'

// 统计卡片配置
const statCards = ref<{
  title: string
  value: number | string
  icon: string
  color: string
  gradient: string
}[]>([])

// 实体对比数据
const entityCards = ref<{ label: string; value: number; color: string }[]>([])

async function fetchStats() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getDashboardStats()
    if (res.data.code === 200 && res.data.data) {
      stats.value = res.data.data
      buildStatCards()
      await nextTick()
      renderEntityCompareChart()
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

  // 实体对比数据
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
    data: entityCards.value.map((item) => ({ type: item.label, value: item.value })),
    xField: 'type',
    yField: 'value',
    seriesField: 'type',
    color: entityCards.value.map((item) => item.color),
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

function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

onMounted(async () => {
  await Promise.all([fetchStats(), fetchOverview()])
  await fetchTrends()
})

onBeforeUnmount(() => {
  memberTrendChart?.destroy()
  orderTrendChart?.destroy()
  entityCompareChart?.destroy()
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 页面背景装饰 -->
    <div class="brand-watermark brand-watermark--top-right" />
    <div class="brand-watermark brand-watermark--bottom-left" />

    <!-- 页面标题 -->
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

    <!-- 加载中 -->
    <div v-loading="loading" class="min-h-[400px] rounded-xl bg-white p-6" />

    <!-- 错误提示 -->
    <el-alert
      v-if="!loading && errorMsg"
      :title="errorMsg"
      type="error"
      show-icon
      :closable="false"
      class="mb-4"
    />

    <!-- Bento Grid 内容 -->
    <div v-if="!loading && stats" class="bento-grid">
      <!-- 左上：统计卡片区域 (2x2) -->
      <div class="bento-cell bento-cell--stats">
        <div class="stats-grid">
          <div
            v-for="card in statCards"
            :key="card.title"
            class="stat-card"
          >
            <div class="stat-card__icon" :style="{ background: card.gradient }">
              <el-icon :size="20" color="#fff">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="stat-card__content">
              <p class="stat-card__label">{{ card.title }}</p>
              <p class="stat-card__value" :style="{ color: card.color }">{{ card.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右上：用户增长趋势 -->
      <div class="bento-cell bento-cell--trend">
        <div class="chart-header">
          <h3 class="chart-title">用户增长趋势</h3>
          <span class="chart-badge">折线图</span>
        </div>
        <div ref="memberTrendRef" class="chart-container" />
      </div>

      <!-- 左下：订单趋势 -->
      <div class="bento-cell bento-cell--chart">
        <div class="chart-header">
          <h3 class="chart-title">订单趋势</h3>
          <span class="chart-badge chart-badge--blue">折线图</span>
        </div>
        <div ref="orderTrendRef" class="chart-container" />
      </div>

      <!-- 中下：实体数据对比 -->
      <div class="bento-cell bento-cell--chart">
        <div class="chart-header">
          <h3 class="chart-title">实体数据对比</h3>
          <span class="chart-badge chart-badge--green">柱状图</span>
        </div>
        <div ref="entityCompareRef" class="chart-container" />
      </div>

      <!-- 右下：系统信息 + 待办事项 -->
      <div v-if="overview" class="bento-cell bento-cell--overview">
        <!-- 系统信息 -->
        <div class="overview-section">
          <div class="overview-header">
            <span class="overview-icon">⚙️</span>
            <h3 class="overview-title">系统信息</h3>
          </div>
          <div class="overview-list">
            <div class="overview-item">
              <span class="overview-label">站点名称</span>
              <span class="overview-value">{{ overview.systemInfo.siteName || '-' }}</span>
            </div>
            <div class="overview-item">
              <span class="overview-label">应用版本</span>
              <span class="overview-value overview-value--tag">v{{ overview.systemInfo.appVersion }}</span>
            </div>
            <div class="overview-item">
              <span class="overview-label">AI 模型</span>
              <span class="overview-value">{{ overview.systemInfo.aiProvider }} / {{ overview.systemInfo.aiModel }}</span>
            </div>
            <div class="overview-item">
              <span class="overview-label">管理员数</span>
              <span class="overview-value overview-value--highlight">{{ overview.systemInfo.adminCount }}</span>
            </div>
          </div>
        </div>

        <!-- 分割线 -->
        <div class="overview-divider" />

        <!-- 待办事项 -->
        <div class="overview-section">
          <div class="overview-header">
            <span class="overview-icon">📋</span>
            <h3 class="overview-title">待办事项</h3>
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

/* 品牌水印 */
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

/* 时间筛选按钮 */
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

/* Bento Grid 布局 */
.bento-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
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

/* 左上：统计卡片区域 */
.bento-cell--stats {
  grid-column: 1;
  grid-row: 1;
}

/* 右上：用户增长趋势 */
.bento-cell--trend {
  grid-column: 2;
  grid-row: 1;
  min-height: 320px;
}

/* 下方图表 */
.bento-cell--chart {
  min-height: 280px;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 100%;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  border-radius: 10px;
  border: 1px solid rgba(249, 115, 22, 0.06);
  transition: all 0.2s ease;
}

.stat-card:hover {
  background: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.06);
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
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
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

/* 图表头部 */
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

.chart-badge--gold {
  color: #f5a54a;
  background: linear-gradient(135deg, rgba(245, 165, 74, 0.1), rgba(251, 191, 36, 0.1));
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: calc(100% - 40px);
  min-height: 220px;
}

/* 右下：系统信息 + 待办事项 */
.bento-cell--overview {
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

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

.overview-divider {
  height: 1px;
  margin: 12px 0;
  background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.15), transparent);
}

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

/* 响应式 */
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }

  .bento-cell--stats,
  .bento-cell--trend,
  .bento-cell--overview {
    grid-column: 1;
    grid-row: auto;
  }
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card__value {
    font-size: 18px;
  }
}
</style>
