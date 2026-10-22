<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ==================== 类型定义 ====================
interface ErAttribute {
  id: string
  label: string
  detail: string
}

interface CareerNode {
  id: string
  index: string
  title: string
  subtitle: string
  route: string
  stageGroup: 'foundation' | 'higher' | 'branch' | 'advanced' | 'hub'
  x: number // SVG 画布坐标 X (基准 1000x540)
  y: number // SVG 画布坐标 Y
  attributes: ErAttribute[] // ER图中的实体属性
}

interface CareerEdge {
  from: string
  to: string
  type: 'main' | 'hub' // main: 升学主干线, hub: 英语跨阶段赋能线
  label?: string
}

type PathPreset = 'all' | 'academic' | 'civil' | 'career' | 'english'

// ==================== 10 大核心实体与 ER 属性数据 ====================
// 路由已对齐真实路由表；需登录的目标路由依赖 router 守卫自动拦截
const nodes = ref<CareerNode[]>([
  {
    id: 'junior',
    index: '01',
    title: '初中专栏',
    subtitle: '学业奠基与中考升学指导',
    route: '/middle',
    stageGroup: 'foundation',
    x: 110,
    y: 230,
    attributes: [
      { id: 'j-1', label: '中考政策解读', detail: '属地指标到校与录取投档规则' },
      { id: 'j-2', label: '全科思维养成', detail: '数理化基础模型与阅读积累' },
      { id: 'j-3', label: '重高自招规划', detail: '特长生与自主招生备考路径' },
    ],
  },
  {
    id: 'senior',
    index: '02',
    title: '高中专栏',
    subtitle: '新高考选科与阶段规划',
    route: '/high',
    stageGroup: 'foundation',
    x: 265,
    y: 230,
    attributes: [
      { id: 's-1', label: '3+1+2 选科决策', detail: '专业覆盖率与赋分优劣势精算' },
      { id: 's-2', label: '强基计划筹备', detail: '基础学科拔尖人才培养通道' },
      { id: 's-3', label: '一轮至三轮复习', detail: '高三全周期提分节奏管控' },
    ],
  },
  {
    id: 'gaokao',
    index: '03',
    title: '高考报志愿',
    subtitle: '位次精算与院校专业遴选',
    route: '/gaokao',
    stageGroup: 'foundation',
    x: 425,
    y: 230,
    attributes: [
      { id: 'gk-1', label: '历年录取位次图', detail: '近三年院校专业投档线波动' },
      { id: 'gk-2', label: '冲稳保梯度算法', detail: '平行志愿防退档与分数最大化' },
      { id: 'gk-3', label: '院校专业对比库', detail: '学科评估、就业率与转专业难度' },
      { id: 'gk-4', label: '大一适应指南', detail: '准大学生入学准备与生涯衔接' },
    ],
  },
  {
    id: 'college',
    index: '04',
    title: '大学专栏',
    subtitle: '学分绩点与综合素质发展',
    route: '/college',
    stageGroup: 'higher',
    x: 585,
    y: 230,
    attributes: [
      { id: 'col-1', label: 'GPA 绩点管理', detail: '核心必修课高分策略与奖学金' },
      { id: 'col-2', label: '保研夏令营推免', detail: '大一至大三推免时间轴全规划' },
      { id: 'col-3', label: '白名单学科竞赛', detail: '数学建模、大创等加分赛事指南' },
    ],
  },
  {
    id: 'english',
    index: '05',
    title: '英语练习',
    subtitle: '中考、高考、四六级至考研全贯穿',
    route: '/english',
    stageGroup: 'hub',
    x: 490,
    y: 445,
    attributes: [
      { id: 'en-1', label: '中高考听说读写', detail: '核心考纲词汇与高分作文模板' },
      { id: 'en-2', label: '大学四六级刷分', detail: '听力精听训练与段落匹配技巧' },
      { id: 'en-3', label: '考研英语一/二', detail: '长难句语法拆解与真题阅读逻辑' },
      { id: 'en-4', label: '学术文献与雅思', detail: '硕博英文顶刊阅读与留学语言关' },
    ],
  },
  {
    id: 'kaoyan',
    index: '06',
    title: '考研专栏',
    subtitle: '择校初试与复试调剂护航',
    route: '/postgrad-exam',
    stageGroup: 'branch',
    x: 745,
    y: 120,
    attributes: [
      { id: 'ky-1', label: '学硕与专硕抉择', detail: '考数学/英语科目差异与培养方向' },
      { id: 'ky-2', label: '院校报录比分析', detail: '统招名额、推免占比与复试线' },
      { id: 'ky-3', label: '复试机试与调剂', detail: '联系导师邮件礼仪与复试逆袭' },
    ],
  },
  {
    id: 'kaogong',
    index: '07',
    title: '考公专栏',
    subtitle: '国考省考选岗与行测申论',
    route: '/civil-service',
    stageGroup: 'branch',
    x: 745,
    y: 255,
    attributes: [
      { id: 'kg-1', label: '国考与省考选岗', detail: '专业目录匹配与应届生身份红利' },
      { id: 'kg-2', label: '选调生专项通道', detail: '定向选调与普通选调报考条件' },
      { id: 'kg-3', label: '行测申论实战', detail: '模块化刷题提速与政论文立意' },
    ],
  },
  {
    id: 'grad',
    index: '08',
    title: '研究生专栏',
    subtitle: '学术科研与论文开题指引',
    route: '/graduate',
    stageGroup: 'advanced',
    x: 900,
    y: 110,
    attributes: [
      { id: 'gr-1', label: '文献综述与开题', detail: '高效检索顶会论文与实验设计' },
      { id: 'gr-2', label: '小论文发表策略', detail: 'SCI / 核心期刊投稿周期与返修' },
      { id: 'gr-3', label: '硕转博与秋招抉择', detail: '研二分水岭的学术与就业权衡' },
    ],
  },
  {
    id: 'phd',
    index: '09',
    title: '博士专栏',
    subtitle: '申请考核攻博与学术教职',
    route: '/postgraduate/phd',
    stageGroup: 'advanced',
    x: 900,
    y: 255,
    attributes: [
      { id: 'ph-1', label: '申请考核制攻略', detail: '研究计划书撰写与博导套磁' },
      { id: 'ph-2', label: '博士毕业与大论文', detail: '盲审核心指标与学术创新点提炼' },
      { id: 'ph-3', label: '高校教职与博后', detail: '青椒入职、人才引进与企业研究院' },
    ],
  },
  {
    id: 'career',
    index: '10',
    title: '就业信息专栏',
    subtitle: '名企校招日历与行业薪酬',
    route: '/employment/civil',
    stageGroup: 'advanced',
    x: 840,
    y: 415,
    attributes: [
      { id: 'ca-1', label: '秋招与春招日历', detail: '互联网/国央企/制造业网申节点' },
      { id: 'ca-2', label: '简历精修与面试', detail: 'STAR 法则项目复盘与高频手撕题' },
      { id: 'ca-3', label: '城市落户与薪资', detail: '各线城市人才补贴与五险一金解析' },
    ],
  },
])

// ==================== 节点关联边定义 ====================
const edges: CareerEdge[] = [
  // 升学主干演进线
  { from: 'junior', to: 'senior', type: 'main' },
  { from: 'senior', to: 'gaokao', type: 'main' },
  { from: 'gaokao', to: 'college', type: 'main' },
  { from: 'college', to: 'kaoyan', type: 'main' },
  { from: 'college', to: 'kaogong', type: 'main' },
  { from: 'college', to: 'career', type: 'main' },
  { from: 'kaoyan', to: 'grad', type: 'main' },
  { from: 'grad', to: 'phd', type: 'main' },
  { from: 'grad', to: 'career', type: 'main' },
  { from: 'phd', to: 'career', type: 'main' },
  { from: 'kaogong', to: 'career', type: 'main' },

  // 英语练习全周期赋能线 (连接各个学业阶段)
  { from: 'english', to: 'junior', type: 'hub', label: '中考英语' },
  { from: 'english', to: 'senior', type: 'hub', label: '高考英语' },
  { from: 'english', to: 'college', type: 'hub', label: '四六级/雅思' },
  { from: 'english', to: 'kaoyan', type: 'hub', label: '考研英语' },
  { from: 'english', to: 'grad', type: 'hub', label: '英文文献' },
]

// ==================== 交互状态管理 ====================
const selectedNodeId = ref<string>('gaokao') // 默认选中高考报志愿展示卫星属性
const activePreset = ref<PathPreset>('all')
const draggingNodeId = ref<string | null>(null)
const hoveredNodeId = ref<string | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)

// 预设生涯路线节点集合
const presetMap: Record<PathPreset, string[]> = {
  all: ['junior', 'senior', 'gaokao', 'college', 'english', 'kaoyan', 'kaogong', 'grad', 'phd', 'career'],
  academic: ['junior', 'senior', 'gaokao', 'college', 'english', 'kaoyan', 'grad', 'phd'],
  civil: ['junior', 'senior', 'gaokao', 'college', 'kaogong', 'career'],
  career: ['junior', 'senior', 'gaokao', 'college', 'english', 'career'],
  english: ['english', 'junior', 'senior', 'college', 'kaoyan', 'grad'],
}

// 属性维度总数（动态计算，避免写死偏差）
const totalAttributes = computed(() =>
  nodes.value.reduce((sum, n) => sum + n.attributes.length, 0)
)

const currentSelectedNode = computed(() =>
  nodes.value.find((n) => n.id === selectedNodeId.value) || nodes.value[2]
)

// 计算当前选中节点的 ER 卫星属性坐标 (环绕在父节点四周)
const satelliteAttributes = computed(() => {
  const parent = currentSelectedNode.value
  if (!parent) return []
  const count = parent.attributes.length
  const radius = 84 // 卫星环绕半径
  return parent.attributes.map((attr, idx) => {
    // 均匀分布在圆周上，避开正左右主干线
    const startAngle = -Math.PI / 2.8
    const step = (Math.PI * 1.4) / Math.max(count - 1, 1)
    const angle = count === 1 ? -Math.PI / 2 : startAngle + idx * step
    return {
      ...attr,
      x: parent.x + Math.cos(angle) * radius,
      y: parent.y + Math.sin(angle) * radius,
    }
  })
})

// 判断节点是否处于高亮（非淡化）状态：悬停驱动，预设优先
function isNodeHighlighted(nodeId: string): boolean {
  if (activePreset.value !== 'all') {
    return presetMap[activePreset.value].includes(nodeId)
  }
  if (!hoveredNodeId.value) return true // 无悬停时全部正常显示
  if (nodeId === hoveredNodeId.value) return true
  return edges.some(
    (e) =>
      (e.from === hoveredNodeId.value && e.to === nodeId) ||
      (e.to === hoveredNodeId.value && e.from === nodeId)
  )
}

// 判断连线是否处于高亮状态
function isEdgeHighlighted(edge: CareerEdge): boolean {
  if (activePreset.value === 'english') {
    return edge.type === 'hub'
  }
  if (activePreset.value !== 'all') {
    const list = presetMap[activePreset.value]
    return list.includes(edge.from) && list.includes(edge.to) && edge.type === 'main'
  }
  if (!hoveredNodeId.value) return true
  return edge.from === hoveredNodeId.value || edge.to === hoveredNodeId.value
}

// 节点是否为“激活”态（选中或悬停）→ 橙色实心
function isNodeActive(nodeId: string): boolean {
  return nodeId === selectedNodeId.value || nodeId === hoveredNodeId.value
}

// 生成平滑三次贝塞尔曲线路径
function getEdgePath(edge: CareerEdge): string {
  const source = nodes.value.find((n) => n.id === edge.from)
  const target = nodes.value.find((n) => n.id === edge.to)
  if (!source || !target) return ''

  const dx = target.x - source.x
  const dy = target.y - source.y

  if (edge.type === 'hub') {
    // 英语中枢线采用向上拱起的优雅弧线
    const cx = (source.x + target.x) / 2
    const cy = Math.min(source.y, target.y) + dy * 0.15
    return `M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`
  }

  // 主干线采用水平 S 型三次贝塞尔曲线
  const c1x = source.x + dx * 0.45
  const c1y = source.y
  const c2x = source.x + dx * 0.55
  const c2y = target.y
  return `M ${source.x} ${source.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${target.x} ${target.y}`
}

// ==================== Obsidian 风格拖拽物理交互 ====================
function onNodePointerDown(nodeId: string, event: PointerEvent) {
  selectedNodeId.value = nodeId
  activePreset.value = 'all'
  draggingNodeId.value = nodeId
  ;(event.target as Element).setPointerCapture(event.pointerId)
}

function onSvgPointerMove(event: PointerEvent) {
  if (!draggingNodeId.value || !svgRef.value) return
  const svg = svgRef.value
  const rect = svg.getBoundingClientRect()
  const scaleX = 1000 / rect.width
  const scaleY = 540 / rect.height

  const newX = Math.max(70, Math.min(930, (event.clientX - rect.left) * scaleX))
  const newY = Math.max(70, Math.min(480, (event.clientY - rect.top) * scaleY))

  const targetNode = nodes.value.find((n) => n.id === draggingNodeId.value)
  if (targetNode) {
    targetNode.x = Math.round(newX)
    targetNode.y = Math.round(newY)
  }
}

function onSvgPointerUp() {
  draggingNodeId.value = null
}

// ==================== 路线预设高亮过滤 ====================
function selectPreset(preset: PathPreset) {
  activePreset.value = preset
  if (preset === 'english') {
    selectedNodeId.value = 'english'
  } else if (preset === 'academic') {
    selectedNodeId.value = 'phd'
  } else if (preset === 'civil') {
    selectedNodeId.value = 'kaogong'
  } else if (preset === 'career') {
    selectedNodeId.value = 'career'
  }
}

// 右侧详情面板“进入主页”：SPA 跳转，需登录目标由 router 守卫自动拦截
function goToColumn(node: CareerNode) {
  router.push(node.route)
}
</script>

<template>
  <!-- 生涯星图卡片本体（已抽离外层 section / 页面标题，便于内嵌到首页切换区块） -->
  <div class="career-graph rounded-[2rem] bg-zinc-200/50 p-1.5 sm:p-2 ring-1 ring-zinc-300/60">
    <div class="rounded-[calc(2rem-0.375rem)] bg-white p-4 sm:p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
      <!-- 图谱顶部控制栏：路线预设高亮过滤 -->
      <div class="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-100">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-zinc-500 mr-1">路线透视:</span>
          <button
            v-for="item in [
              { id: 'all', label: '全部全貌' },
              { id: 'academic', label: '硕博科研深造线' },
              { id: 'civil', label: '考公选调上岸线' },
              { id: 'career', label: '本科名企就业线' },
              { id: 'english', label: '英语全周期赋能线' },
            ]"
            :key="item.id"
            type="button"
            @click="selectPreset(item.id as PathPreset)"
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
              activePreset === item.id
                ? 'bg-orange-50 text-orange-600 ring-1 ring-orange-300 font-semibold'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
            ]"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="flex items-center gap-4 text-[11px] text-zinc-500">
          <span class="inline-flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span>
            核心阶段实体 (可拖拽)
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-100 ring-1 ring-orange-400 inline-block"></span>
            ER 实体属性卫星
          </span>
        </div>
      </div>

      <!-- 主体区：左 8 列交互式 SVG 星图画布 + 右 4 列当前选中实体详情面板 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <!-- 左侧：SVG 拓扑画布 -->
        <div class="lg:col-span-8 relative rounded-2xl bg-[#FAFAFA] ring-1 ring-zinc-200/80 overflow-hidden">
          <!-- 点阵背景网格纹理 -->
          <div
            class="absolute inset-0 pointer-events-none opacity-45"
            style="background-image: radial-gradient(#CBD5E1 1px, transparent 1px); background-size: 20px 20px;"
          />

          <svg
            ref="svgRef"
            viewBox="0 0 1000 540"
            class="w-full h-[380px] sm:h-[460px] select-none touch-none relative z-10"
            @pointermove="onSvgPointerMove"
            @pointerup="onSvgPointerUp"
            @pointerleave="onSvgPointerUp"
          >
            <defs>
              <!-- 箭头标记 -->
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="28"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#EA580C" />
              </marker>
              <marker
                id="arrow-muted"
                viewBox="0 0 10 10"
                refX="28"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#CBD5E1" />
              </marker>
            </defs>

            <!-- 顶部阶段分栏微标签 -->
            <g class="text-[11px] fill-zinc-400 font-mono">
              <text x="110" y="34" text-anchor="middle">STAGE 01 · 基础升学</text>
              <text x="425" y="34" text-anchor="middle">STAGE 02 · 志愿决策</text>
              <text x="585" y="34" text-anchor="middle">STAGE 03 · 大学成长</text>
              <text x="820" y="34" text-anchor="middle">STAGE 04 · 深造与职业跃迁</text>
            </g>

            <!-- 1. 渲染主干连线与英语中枢连线 -->
            <g>
              <path
                v-for="(edge, idx) in edges"
                :key="idx"
                :d="getEdgePath(edge)"
                fill="none"
                :stroke="isEdgeHighlighted(edge) ? '#EA580C' : '#E2E8F0'"
                :stroke-width="isEdgeHighlighted(edge) ? 2.5 : 1.5"
                :stroke-dasharray="edge.type === 'hub' ? '5 4' : 'none'"
                :marker-end="isEdgeHighlighted(edge) ? 'url(#arrow-active)' : 'url(#arrow-muted)'"
                class="transition-all duration-300"
              />
            </g>

            <!-- 2. 渲染当前选中节点的 ER 属性卫星连线与圆圈 -->
            <g v-if="currentSelectedNode">
              <line
                v-for="attr in satelliteAttributes"
                :key="'line-' + attr.id"
                :x1="currentSelectedNode.x"
                :y1="currentSelectedNode.y"
                :x2="attr.x"
                :y2="attr.y"
                stroke="#FDBA74"
                stroke-width="1.5"
                stroke-dasharray="3 3"
              />

              <g
                v-for="attr in satelliteAttributes"
                :key="attr.id"
                :transform="`translate(${attr.x}, ${attr.y})`"
                class="transition-all duration-300"
              >
                <circle
                  r="26"
                  fill="#FFF7ED"
                  stroke="#FB923C"
                  stroke-width="1.5"
                />
                <text
                  text-anchor="middle"
                  dy="3"
                  class="text-[10px] font-semibold fill-orange-800 pointer-events-none"
                >
                  {{ attr.label.slice(0, 5) }}
                </text>
              </g>
            </g>

            <!-- 3. 渲染 10 大核心实体圆圈 -->
            <g
              v-for="node in nodes"
              :key="node.id"
              :transform="`translate(${node.x}, ${node.y})`"
              class="cursor-grab active:cursor-grabbing transition-opacity duration-300"
              :class="isNodeHighlighted(node.id) ? 'opacity-100' : 'opacity-30'"
              @pointerdown="onNodePointerDown(node.id, $event)"
              @mouseenter="hoveredNodeId = node.id"
              @mouseleave="hoveredNodeId = null"
            >
              <!-- 选中态外层呼吸光圈 -->
              <circle
                v-if="selectedNodeId === node.id"
                r="38"
                fill="none"
                stroke="#EA580C"
                stroke-width="1.5"
                stroke-dasharray="4 3"
                class="opacity-70"
              />

              <!-- 实体主圆圈 -->
              <circle
                :r="node.stageGroup === 'hub' ? 32 : 28"
                :fill="
                  isNodeActive(node.id)
                    ? '#EA580C'
                    : node.stageGroup === 'hub'
                    ? '#18181B'
                    : '#FFFFFF'
                "
                :stroke="
                  isNodeActive(node.id)
                    ? '#C2410C'
                    : node.stageGroup === 'hub'
                    ? '#EA580C'
                    : '#CBD5E1'
                "
                stroke-width="2"
              />

              <!-- 节点序号 -->
              <text
                text-anchor="middle"
                dy="-6"
                :class="[
                  'text-[9px] font-mono font-bold pointer-events-none',
                  isNodeActive(node.id) || node.stageGroup === 'hub'
                    ? 'fill-orange-200'
                    : 'fill-zinc-400'
                ]"
              >
                {{ node.index }}
              </text>

              <!-- 节点简称 -->
              <text
                text-anchor="middle"
                dy="8"
                :class="[
                  'text-[11px] font-bold pointer-events-none',
                  isNodeActive(node.id) || node.stageGroup === 'hub'
                    ? 'fill-white'
                    : 'fill-zinc-800'
                ]"
              >
                {{ node.title.replace('专栏', '') }}
              </text>
            </g>
          </svg>

          <!-- 底部操作提示条 -->
          <div class="px-4 py-2.5 bg-white/90 border-t border-zinc-200/70 flex items-center justify-between text-[11px] text-zinc-500">
            <span>提示：单击任意圆圈展开 ER 属性卫星，按住节点可自由拖拽调整布局</span>
            <span class="font-mono text-zinc-600">{{ nodes.length }} 实体 · {{ totalAttributes }} 属性维度</span>
          </div>
        </div>

        <!-- 右侧：当前选中实体的 ER 属性详情与路由直达面板 -->
        <div class="lg:col-span-4 rounded-2xl bg-zinc-100/80 p-1 ring-1 ring-zinc-200/80 flex">
          <div class="rounded-xl bg-white p-5 w-full flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                <div>
                  <span class="text-[11px] font-mono font-semibold text-orange-600">
                    ENTITY #{{ currentSelectedNode.index }}
                  </span>
                  <h3 class="text-lg font-bold text-zinc-900 mt-0.5">
                    {{ currentSelectedNode.title }}
                  </h3>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-orange-50 text-orange-700 ring-1 ring-orange-200/70">
                  {{ currentSelectedNode.attributes.length }} 项核心属性
                </span>
              </div>

              <p class="text-xs text-zinc-600 mt-3 leading-relaxed">
                {{ currentSelectedNode.subtitle }}
              </p>

              <!-- ER 属性列表展示 -->
              <div class="mt-4 space-y-2.5">
                <div class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  包含属性维度 (Attributes)
                </div>
                <div
                  v-for="attr in currentSelectedNode.attributes"
                  :key="attr.id"
                  class="p-3 rounded-xl bg-zinc-50 ring-1 ring-zinc-200/70 hover:ring-orange-300 transition-all"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                    <span class="text-xs font-bold text-zinc-900">{{ attr.label }}</span>
                  </div>
                  <p class="text-[11px] text-zinc-600 mt-1 pl-3.5 leading-relaxed">
                    {{ attr.detail }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 底部跳转专栏主按钮 (Button-in-Button 架构) -->
            <div class="mt-6 pt-4 border-t border-zinc-100">
              <button
                type="button"
                @click="goToColumn(currentSelectedNode)"
                class="group w-full inline-flex items-center justify-between pl-5 pr-2 py-2.5 rounded-full bg-orange-600 text-white text-xs font-semibold shadow-xs transition-all duration-300 hover:bg-orange-500 active:scale-[0.98]"
              >
                <span>进入「{{ currentSelectedNode.title }}」主页</span>
                <span class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs transition-transform duration-300 group-hover:translate-x-0.5">
                  ↗
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
