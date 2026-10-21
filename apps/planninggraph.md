

## 任务
看一下：D:\SelfCompany\Project-HaiFeng-fronted\apps\user\src\views\ComingSoon.vue，里面有一个：


## 完整 Vue 3 交互式原型代码 (CareerPlanningGraph.vue)


[ 矩阵视图 | 生涯星图 ] 丝滑切换；

预设生涯路线一键高亮（全部脉络 / 硕博深造线 / 考公上岸线 / 名企就业线 / 英语贯穿线）；sh

Obsidian 风格节点拖拽（按住任意圆圈可自由拖动，连线实时跟随）；

ER 图属性卫星动态展开（点击任意实体圆圈，周围环绕弹出它的专属属性节点，右侧同步展示跳转卡片）。

##  方案亮点总结与落地建议
完美融合「英语练习」的跨阶段属性：在图谱中，英语练习 (05) 采用了深色碳黑配橙色描边的中枢圆圈样式，通过虚线同时向 初中、高中、大学、考研、研究生 输送连接，直观解释了为什么它不是单一阶段的专栏，而是全周期核心能力。

兼顾新老用户习惯：如果用户想快速点进某个专栏，可切回 2×5 矩阵视图，而且矩阵卡片底部也顺带展示了前 2 个 ER 属性标签，两套视图共享同一个 nodes 数据源，维护成本极低。



建议方案：分层有向图（保留"图"的视觉美感，但有清晰的方向性）
text

                    ┌─────英语练习─────┐
                    │  (虚线连接，跨阶段辅助)│
         ┌──────────┼──────┬──────────┼──────────┐
         │          │      │          │          │
●初中──●高中──●高考志愿──●大学──┬──●考研──●研究生──┬──●博士
│                  │        │
├──●考公────────────┼────────┤
│                  │        │
└──────────────────┴──●就业信息专栏
核心设计逻辑：

主线节点（初中/高中/高考志愿/大学/就业信息）用实线横向串联，体现"必经阶段"
分支节点（考研/考公/研究生/博士）从大学节点分叉出去，体现"选择分支"，用不同颜色区分（比如蓝色系）
英语练习作为特殊的"跨阶段辅助节点"，放在上方，用虚线连接到初中/高中/大学/考研/研究生等多个阶段——因为英语是贯穿各个阶段的通用能力，而不是某个单一的"升学步骤"，这样处理既符合现实逻辑，也让整个图不是一条死板的直线，保留了"图"该有的网状美感
这样处理后，既保留了节点图的视觉形式（你想要的ER图式效果），又没有丢失路径规划的叙事逻辑，比纯随机力导向更"讲得通道理"。

交互设计（模拟Obsidian的"高亮关联"体验，但不需要力导向算法）
鼠标悬停某个节点 → 该节点变橙色高亮，与其直接相连的节点和连线保持正常亮度，其余节点和连线淡化（opacity: 0.25）
悬停时弹出小卡片，显示该节点的描述文字（复用你首页卡片矩阵的文案）
点击节点 → 跳转到对应专栏页面
这个"关联高亮"效果正是Obsidian图谱最吸引人的交互，用纯CSS类切换+Vue的computed判断就能实现，完全不需要力导向算法本身。



```markdown
<script setup lang="ts">
import { ref, computed } from "vue";

// ==================== 类型定义 ====================
interface ErAttribute {
  id: string;
  label: string;
  detail: string;
}

interface CareerNode {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  route: string;
  stageGroup: "foundation" | "higher" | "branch" | "advanced" | "hub";
  x: number; // SVG 画布坐标 X (基准 1000x560)
  y: number; // SVG 画布坐标 Y
  attributes: ErAttribute[]; // ER图中的实体属性
}

interface CareerEdge {
  from: string;
  to: string;
  type: "main" | "hub"; // main: 升学主干线, hub: 英语跨阶段赋能线
  label?: string;
}

type ViewMode = "graph" | "matrix";
type PathPreset = "all" | "academic" | "civil" | "career" | "english";

// ==================== 10 大核心实体与 ER 属性数据 ====================
const nodes = ref<CareerNode[]>([
  {
    id: "junior",
    index: "01",
    title: "初中专栏",
    subtitle: "学业奠基与中考升学指导",
    route: "/junior",
    stageGroup: "foundation",
    x: 110,
    y: 230,
    attributes: [
      { id: "j-1", label: "中考政策解读", detail: "属地指标到校与录取投档规则" },
      { id: "j-2", label: "全科思维养成", detail: "数理化基础模型与阅读积累" },
      { id: "j-3", label: "重高自招规划", detail: "特长生与自主招生备考路径" },
    ],
  },
  {
    id: "senior",
    index: "02",
    title: "高中专栏",
    subtitle: "新高考选科与阶段规划",
    route: "/high-school",
    stageGroup: "foundation",
    x: 265,
    y: 230,
    attributes: [
      { id: "s-1", label: "3+1+2 选科决策", detail: "专业覆盖率与赋分优劣势精算" },
      { id: "s-2", label: "强基计划筹备", detail: "基础学科拔尖人才培养通道" },
      { id: "s-3", label: "一轮至三轮复习", detail: "高三全周期提分节奏管控" },
    ],
  },
  {
    id: "gaokao",
    index: "03",
    title: "高考报志愿",
    subtitle: "位次精算与院校专业遴选",
    route: "/gaokao",
    stageGroup: "foundation",
    x: 425,
    y: 230,
    attributes: [
      { id: "gk-1", label: "历年录取位次图", detail: "近三年院校专业投档线波动" },
      { id: "gk-2", label: "冲稳保梯度算法", detail: "平行志愿防退档与分数最大化" },
      { id: "gk-3", label: "院校专业对比库", detail: "学科评估、就业率与转专业难度" },
      { id: "gk-4", label: "大一适应指南", detail: "准大学生入学准备与生涯衔接" },
    ],
  },
  {
    id: "college",
    index: "04",
    title: "大学专栏",
    subtitle: "学分绩点与综合素质发展",
    route: "/college",
    stageGroup: "higher",
    x: 585,
    y: 230,
    attributes: [
      { id: "col-1", label: "GPA 绩点管理", detail: "核心必修课高分策略与奖学金" },
      { id: "col-2", label: "保研夏令营推免", detail: "大一至大三推免时间轴全规划" },
      { id: "col-3", label: "白名单学科竞赛", detail: "数学建模、大创等加分赛事指南" },
    ],
  },
  {
    id: "english",
    index: "05",
    title: "英语练习",
    subtitle: "中考、高考、四六级至考研全贯穿",
    route: "/english",
    stageGroup: "hub",
    x: 490,
    y: 445,
    attributes: [
      { id: "en-1", label: "中高考听说读写", detail: "核心考纲词汇与高分作文模板" },
      { id: "en-2", label: "大学四六级刷分", detail: "听力精听训练与段落匹配技巧" },
      { id: "en-3", label: "考研英语一/二", detail: "长难句语法拆解与真题阅读逻辑" },
      { id: "en-4", label: "学术文献与雅思", detail: "硕博英文顶刊阅读与留学语言关" },
    ],
  },
  {
    id: "kaoyan",
    index: "06",
    title: "考研专栏",
    subtitle: "择校初试与复试调剂护航",
    route: "/postgraduate-prep",
    stageGroup: "branch",
    x: 745,
    y: 120,
    attributes: [
      { id: "ky-1", label: "学硕与专硕抉择", detail: "考数学/英语科目差异与培养方向" },
      { id: "ky-2", label: "院校报录比分析", detail: "统招名额、推免占比与复试线" },
      { id: "ky-3", label: "复试机试与调剂", detail: "联系导师邮件礼仪与复试逆袭" },
    ],
  },
  {
    id: "kaogong",
    index: "07",
    title: "考公专栏",
    subtitle: "国考省考选岗与行测申论",
    route: "/civil-servant",
    stageGroup: "branch",
    x: 745,
    y: 255,
    attributes: [
      { id: "kg-1", label: "国考与省考选岗", detail: "专业目录匹配与应届生身份红利" },
      { id: "kg-2", label: "选调生专项通道", detail: "定向选调与普通选调报考条件" },
      { id: "kg-3", label: "行测申论实战", detail: "模块化刷题提速与政论文立意" },
    ],
  },
  {
    id: "grad",
    index: "08",
    title: "研究生专栏",
    subtitle: "学术科研与论文开题指引",
    route: "/graduate-student",
    stageGroup: "advanced",
    x: 900,
    y: 110,
    attributes: [
      { id: "gr-1", label: "文献综述与开题", detail: "高效检索顶会论文与实验设计" },
      { id: "gr-2", label: "小论文发表策略", detail: "SCI / 核心期刊投稿周期与返修" },
      { id: "gr-3", label: "硕转博与秋招抉择", detail: "研二分水岭的学术与就业权衡" },
    ],
  },
  {
    id: "phd",
    index: "09",
    title: "博士专栏",
    subtitle: "申请考核攻博与学术教职",
    route: "/phd",
    stageGroup: "advanced",
    x: 900,
    y: 255,
    attributes: [
      { id: "ph-1", label: "申请考核制攻略", detail: "研究计划书撰写与博导套磁" },
      { id: "ph-2", label: "博士毕业与大论文", detail: "盲审核心指标与学术创新点提炼" },
      { id: "ph-3", label: "高校教职与博后", detail: "青椒入职、人才引进与企业研究院" },
    ],
  },
  {
    id: "career",
    index: "10",
    title: "就业信息专栏",
    subtitle: "名企校招日历与行业薪酬",
    route: "/career",
    stageGroup: "advanced",
    x: 840,
    y: 415,
    attributes: [
      { id: "ca-1", label: "秋招与春招日历", detail: "互联网/国央企/制造业网申节点" },
      { id: "ca-2", label: "简历精修与面试", detail: "STAR 法则项目复盘与高频手撕题" },
      { id: "ca-3", label: "城市落户与薪资", detail: "各线城市人才补贴与五险一金解析" },
    ],
  },
]);

// ==================== 节点关联边定义 ====================
const edges: CareerEdge[] = [
  // 升学主干演进线
  { from: "junior", to: "senior", type: "main" },
  { from: "senior", to: "gaokao", type: "main" },
  { from: "gaokao", to: "college", type: "main" },
  { from: "college", to: "kaoyan", type: "main" },
  { from: "college", to: "kaogong", type: "main" },
  { from: "college", to: "career", type: "main" },
  { from: "kaoyan", to: "grad", type: "main" },
  { from: "grad", to: "phd", type: "main" },
  { from: "grad", to: "career", type: "main" },
  { from: "phd", to: "career", type: "main" },
  { from: "kaogong", to: "career", type: "main" },

  // 英语练习全周期赋能线 (连接各个学业阶段)
  { from: "english", to: "junior", type: "hub", label: "中考英语" },
  { from: "english", to: "senior", type: "hub", label: "高考英语" },
  { from: "english", to: "college", type: "hub", label: "四六级/雅思" },
  { from: "english", to: "kaoyan", type: "hub", label: "考研英语" },
  { from: "english", to: "grad", type: "hub", label: "英文文献" },
];

// ==================== 交互状态管理 ====================
const viewMode = ref<ViewMode>("graph");
const selectedNodeId = ref<string>("gaokao"); // 默认选中高考报志愿展示卫星属性
const activePreset = ref<PathPreset>("all");
const draggingNodeId = ref<string | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);

// 预设生涯路线节点集合
const presetMap: Record<PathPreset, string[]> = {
  all: ["junior", "senior", "gaokao", "college", "english", "kaoyan", "kaogong", "grad", "phd", "career"],
  academic: ["junior", "senior", "gaokao", "college", "english", "kaoyan", "grad", "phd"],
  civil: ["junior", "senior", "gaokao", "college", "kaogong", "career"],
  career: ["junior", "senior", "gaokao", "college", "english", "career"],
  english: ["english", "junior", "senior", "college", "kaoyan", "grad"],
};

const currentSelectedNode = computed(() =>
  nodes.value.find((n) => n.id === selectedNodeId.value) || nodes.value[2]
);

// 计算当前选中节点的 ER 卫星属性坐标 (环绕在父节点四周)
const satelliteAttributes = computed(() => {
  const parent = currentSelectedNode.value;
  if (!parent) return [];
  const count = parent.attributes.length;
  const radius = 84; // 卫星环绕半径
  return parent.attributes.map((attr, idx) => {
    // 均匀分布在圆周上，避开正左右主干线
    const startAngle = -Math.PI / 2.8;
    const step = (Math.PI * 1.4) / Math.max(count - 1, 1);
    const angle = count === 1 ? -Math.PI / 2 : startAngle + idx * step;
    return {
      ...attr,
      x: parent.x + Math.cos(angle) * radius,
      y: parent.y + Math.sin(angle) * radius,
    };
  });
});

// 判断节点是否处于高亮路径中
function isNodeHighlighted(nodeId: string): boolean {
  if (activePreset.value !== "all") {
    return presetMap[activePreset.value].includes(nodeId);
  }
  if (!selectedNodeId.value) return true;
  if (nodeId === selectedNodeId.value) return true;
  return edges.some(
    (e) =>
      (e.from === selectedNodeId.value && e.to === nodeId) ||
      (e.to === selectedNodeId.value && e.from === nodeId)
  );
}

// 判断连线是否处于高亮状态
function isEdgeHighlighted(edge: CareerEdge): boolean {
  if (activePreset.value === "english") {
    return edge.type === "hub";
  }
  if (activePreset.value !== "all") {
    const list = presetMap[activePreset.value];
    return list.includes(edge.from) && list.includes(edge.to) && edge.type === "main";
  }
  return edge.from === selectedNodeId.value || edge.to === selectedNodeId.value;
}

// 生成平滑三次贝塞尔曲线路径
function getEdgePath(edge: CareerEdge): string {
  const source = nodes.value.find((n) => n.id === edge.from);
  const target = nodes.value.find((n) => n.id === edge.to);
  if (!source || !target) return "";

  const dx = target.x - source.x;
  const dy = target.y - source.y;

  if (edge.type === "hub") {
    // 英语中枢线采用向上拱起的优雅弧线
    const cx = (source.x + target.x) / 2;
    const cy = Math.min(source.y, target.y) + dy * 0.15;
    return `M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`;
  }

  // 主干线采用水平 S 型三次贝塞尔曲线
  const c1x = source.x + dx * 0.45;
  const c1y = source.y;
  const c2x = source.x + dx * 0.55;
  const c2y = target.y;
  return `M ${source.x} ${source.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${target.x} ${target.y}`;
}

// ==================== Obsidian 风格拖拽物理交互 ====================
function onNodePointerDown(nodeId: string, event: PointerEvent) {
  selectedNodeId.value = nodeId;
  activePreset.value = "all";
  draggingNodeId.value = nodeId;
  (event.target as Element).setPointerCapture(event.pointerId);
}

function onSvgPointerMove(event: PointerEvent) {
  if (!draggingNodeId.value || !svgRef.value) return;
  const svg = svgRef.value;
  const rect = svg.getBoundingClientRect();
  const scaleX = 1000 / rect.width;
  const scaleY = 540 / rect.height;

  const newX = Math.max(70, Math.min(930, (event.clientX - rect.left) * scaleX));
  const newY = Math.max(70, Math.min(480, (event.clientY - rect.top) * scaleY));

  const targetNode = nodes.value.find((n) => n.id === draggingNodeId.value);
  if (targetNode) {
    targetNode.x = Math.round(newX);
    targetNode.y = Math.round(newY);
  }
}

function onSvgPointerUp() {
  draggingNodeId.value = null;
}

function selectPreset(preset: PathPreset) {
  activePreset.value = preset;
  if (preset === "english") {
    selectedNodeId.value = "english";
  } else if (preset === "academic") {
    selectedNodeId.value = "phd";
  } else if (preset === "civil") {
    selectedNodeId.value = "kaogong";
  } else if (preset === "career") {
    selectedNodeId.value = "career";
  }
}
</script>

<template>
  <section class="py-12 bg-[#F8FAFC] text-zinc-900 antialiased selection:bg-orange-500 selection:text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- 顶部栏：左侧模块标题 + 右侧 [矩阵视图 / 生涯星图] 切换器 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-orange-100/80 text-orange-700">
              PATHWAY TOPOLOGY
            </span>
            <h2 class="text-xl sm:text-2xl font-black tracking-tight text-zinc-900">
              全周期生涯规划导航
            </h2>
          </div>
          <p class="text-xs sm:text-sm text-zinc-600 mt-1">
            从初中升学、高考志愿到硕博深造与名企就业的关联知识图谱（点击节点展开实体属性，双击或右侧直达专栏）
          </p>
        </div>

        <!-- 视图切换胶囊 (Double-Bezel Segmented Control) -->
        <div class="inline-flex p-1 rounded-full bg-zinc-200/75 ring-1 ring-zinc-300/60 self-start sm:self-auto">
          <button
            type="button"
            @click="viewMode = 'graph'"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              viewMode === 'graph'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            ]"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="12" cy="18" r="3" />
              <path d="M8.5 7.5L10.5 15.5M15.5 7.5L13.5 15.5M9 6h6" />
            </svg>
            <span>生涯星图 (Obsidian/ER)</span>
          </button>

          <button
            type="button"
            @click="viewMode = 'matrix'"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              viewMode === 'matrix'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            ]"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>2×5 矩阵视图</span>
          </button>
        </div>
      </div>

      <!-- ==================== 模式 A：Obsidian + ER 交互式生涯星图 ==================== -->
      <div
        v-if="viewMode === 'graph'"
        class="rounded-[2rem] bg-zinc-200/50 p-1.5 sm:p-2 ring-1 ring-zinc-300/60"
      >
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
                >
                  <!-- 选中态外层呼吸光圈 -->
                  <circle
                    v-if="selectedNodeId === node.id"
                    r="38"
                    fill="none"
                    stroke="#EA580C"
                    stroke-width="1.5"
                    stroke-dasharray="4 3"
                    class=" opacity-70"
                  />

                  <!-- 实体主圆圈 -->
                  <circle
                    :r="node.stageGroup === 'hub' ? 32 : 28"
                    :fill="
                      selectedNodeId === node.id
                        ? '#EA580C'
                        : node.stageGroup === 'hub'
                        ? '#18181B'
                        : '#FFFFFF'
                    "
                    :stroke="
                      selectedNodeId === node.id
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
                      selectedNodeId === node.id || node.stageGroup === 'hub'
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
                      selectedNodeId === node.id || node.stageGroup === 'hub'
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
                <span class="font-mono text-zinc-600">10 实体 · 33 属性维度</span>
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
                  <a
                    :href="currentSelectedNode.route"
                    class="group w-full inline-flex items-center justify-between pl-5 pr-2 py-2.5 rounded-full bg-orange-600 text-white text-xs font-semibold shadow-xs transition-all duration-300 hover:bg-orange-500 active:scale-[0.98]"
                  >
                    <span>进入「{{ currentSelectedNode.title }}」主页</span>
                    <span class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs transition-transform duration-300 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
```