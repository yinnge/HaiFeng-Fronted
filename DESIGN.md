# 任务：重构「考研专业列表页」（User 端）

你是前端设计工程师。请严格遵循仓库既有设计规范（品牌橙克制、四色语义辅色、卡片微质感五维法则、防糊铁律），重构考研专业列表页。**本次不涉及顶部导航栏，不改任何接口与字段，只做前端优化。**

技术栈：Vue 3 + TypeScript + Vite + Tailwind 3 + Element Plus + `lucide-vue-next@^1.0.0` + Pinia + Vue Router 4。

我会同时提供两张图：**图一是当前界面，图二是设计原型**。原型只作为版式参考，**必须按本文「原型取舍」一节取舍，不要照抄**。

---

## 0. 动手前必须先做的调研（先读后写，结论写进最终报告）

1. 定位当前考研专业列表页，通读并记录：
  - 列表接口函数名、入参（`name / code / degreeType / disciplineCategory / popularity / difficulty` 与分页参数）、默认排序行为（按 `sort_order` 倒序，**我们不传排序参数**）。
  - 「学科门类枚举」接口的现有调用方式（**沿用，不改**）。
  - 点击「查看详情」的现有跳转方式（route name、参数名，是否带 query），**沿用**。
  - 当前筛选 / 页码 / tab 的状态保存机制（URL query、Pinia、keep-alive 或无）。不要重复实现，见 §3.8。
2. 通读 `apps/user/src/views/major/List.vue`，提取左侧「在线工具」的列表项、图标、route / 跳转逻辑，以及分页样式覆盖（若有）。
3. **检查详情页重构是否已产出共享文件**，存在就直接复用，不存在就按下面的路径创建：
  - `views/major/constants/planningTools.ts`：规划工具配置
  - `views/major/components/PlanningToolsCard.vue`：工具卡组件
  - `views/major/utils.ts` 中的 `getDisciplineIcon`、Hero 背景图常量
  - 专业详情页 Hero 的背景图路径与 `--hero-bg-pos` 写法
4. 校验图标：`lucide-vue-next` 为 `^1.0.0`，图标存在改名。**使用任何图标前，先在 `node_modules/lucide-vue-next` 的导出中确认名称存在**，优先新名称，不存在就换语义相近的图标。

---

## 1. 数据契约（只读，不改）

```ts
interface PostgradMajorListVO {
  id: number | string
  majorName: string
  majorCode: string
  degreeType: string          // '学术学位' | '专业学位'
  disciplineCategory: string  // 学科门类
  popularity?: string | null  // '热门' | '一般' | '冷门'
  difficulty?: string | null  // '高' | '中' | '低'
  brief?: string | null
  examSubjects?: string[] | null
}
```

**统一占位规则**：
- `brief` 为空 → 「简介整理中」；`examSubjects` 为空或 `[]` → 「考试科目整理中」。
- `popularity` / `difficulty` 为空 → 对应元素不渲染，不留空位。
- `examSubjects` 渲染前先 `filter(Boolean)`。
- `majorCode` 为空 → 不渲染代码标签。

---

## 2. 页面布局

容器：`max-width: 1360px; margin: 0 auto; padding: 2rem 1.25rem 4rem;`。页面根容器背景 `#F8FAFC`（写在本页根元素上，**不改 `index.css`**），卡片纯白。

```
[Hero 全宽]
┌──────────── 左栏 minmax(0,1fr) ─────────────┬──── 右栏 320px（sticky）────┐
│ 学位分段切换（全部 / 学术型 / 专业型）       │ 热门考研专业（TOP 5）        │
│ 专业检索卡（两行）                           │ 规划工具快捷入口（6 项）     │
│ 结果卡片网格（2 列）                         │                              │
│ 分页                                         │                              │
└──────────────────────────────────────────────┴──────────────────────────────┘
```

- 右栏 `position: sticky; top: 88px; align-self: start`，确认祖先没有 `overflow: hidden` 破坏 sticky。右栏顶部与分段切换对齐。
- 栅格 `grid-template-columns: minmax(0,1fr) 320px; gap: 20px`。卡片网格 `repeat(2, minmax(0,1fr)); gap: 16px`。
- 断点：≥1280 双栏；<1024 单栏（右栏沉到分页下方，取消 sticky）；<768 卡片单列、检索区纵向堆叠。
- 建议拆分组件到当前页面同级 `components/`：`PostgradHero`、`PostgradDegreeTabs`、`PostgradSearchCard`、`PostgradMajorCard`、`PostgradMajorSkeleton`、`PostgradHotRank`，复用共享的 `PlanningToolsCard`。图标与热度常量放同目录 `utils.ts`。主文件只负责取数和编排。

---

## 3. 各模块详细要求

### 3.1 Hero
- 容器：`border-radius: 18px; overflow: hidden; height: clamp(176px, 14vw, 208px)`，白底发丝边加双层阴影，**不得橙色渐变铺底**。
- 背景图**复用专业详情页 Hero 同一素材与同一套写法**（共享常量，禁止重复声明路径）：
  ```css
  .postgrad-hero {
    --hero-bg-pos: center 62%;   /* 值越大越往下，后续自行微调；与详情页保持同一默认值 */
    background:
      linear-gradient(90deg, #F8FBFF 0%, rgba(248,251,255,.94) 36%, rgba(248,251,255,0) 72%),
      url(...) var(--hero-bg-pos) / cover no-repeat,
      #EFF6FF;
  }
  @media (max-width: 767px) { .postgrad-hero { --hero-bg-pos: 75% 62%; } }
  ```
  只用纯 CSS 渐变做遮罩，**不得使用 `filter` / `backdrop-filter`**，背景图层不要有 transform。
- 左侧内容：
  - 56×56 圆角 16px 浅蓝柔光底座（`#EFF6FF`）加线性图标 `BookOpenCheck`（`#2563EB`，stroke 1.75）。**不用橙色实心图标块**。
  - 标题「考研专业全景 · 助你精准备考」：`28px / 800 / #0F172A / letter-spacing: -0.02em`。
  - 副标题：`14px / 1.6 / #475569`，文案「覆盖学术学位与专业学位硕士研究生招生专业，提供专业介绍、考试科目、报考条件与跨考难度等信息」。
  - 4 个**不可点击**的说明项（原型里的 4 个药丸）：无背景、无描边、无 pointer、无 hover。形态为「28px 圆角 8px 浅色底座图标 + 13px / 600 / `#334155` 文字」，横排 `gap: 20px`，<768 时 2×2。图标与配色：
    - 专业介绍 `FileText` 蓝
    - 考试科目 `ListChecks` 绿
    - 报考条件 `UserCheck` 琥珀
    - 跨考难度 `Shuffle` 蓝
  - **不得使用 9999px 胶囊**，这 4 项不是按钮。

### 3.2 学位分段切换
- 三项：「全部专业」「学术型硕士」「专业型硕士」，分别对应 `degreeType` 为空、`学术学位`、`专业学位`。
- 形态：切换器允许 9999px，高 40px，`padding: 0 20px`，`gap: 10px`，`<button role="tab">`，外层 `role="tablist"`，`aria-selected` 同步。
- 激活态：底 `#FFF7ED`、字 `#C2410C`、`font-weight: 600`、`box-shadow: 0 0 0 1px rgba(249,115,22,.2)`。**不用实心橙**。
- 未激活：白底、`1px solid #E2E8F0`、字 `#334155`；hover 字色 `#C2410C`，边框 `rgba(249,115,22,.3)`。
- 切换后页码重置为 1；`:focus-visible` 要有可见焦点环。

### 3.3 专业检索卡
- 白卡 `.hf-card`，`padding: 20px`，**不得有橙色外框**。
- 头部：左侧 3×14px 品牌橙竖条加 `Search` 图标（`#64748B`）加「专业检索」（`16px / 700 / #0F172A`）；右侧「共 N 个专业」（`13px / #64748B`，N 为接口真实 total，数字用 `#0F172A / 600`）。**不要橙色胶囊标题，不要假数字。**
- 第一行（flex，`gap: 12px`）：
  - 名称输入框（`flex: 1`，placeholder「输入考研专业名称或关键词」，`maxlength=100`，可清空，`Search` 前缀图标）。
  - 代码输入框（`width: 160px`，placeholder「专业代码」，`maxlength=20`）。
  - 「搜索」按钮：**本页唯一的橙色实心主按钮**（`#F97316 → #EA580C` 微渐变，白字，`border-radius: 12px`，高 40px，带 `Search` 图标）。
  - 「重置」：白底、`1px solid #E2E8F0`、字 `#334155`、同高同圆角，带 `RotateCcw` 图标。
- 第二行：学科门类、热度（热门/一般/冷门）、难度（高/中/低）三个 `el-select`，各 `width: 180px`，可清空，`gap: 12px`。门类选项来自现有枚举接口。
- 输入框与下拉统一：高 40px，圆角 10px，底 `#F8FAFC`，`1px solid #E2E8F0`，聚焦时边框 `rgba(249,115,22,.5)` 加 `0 0 0 3px rgba(249,115,22,.12)` 柔光环；placeholder 与 label 不低于 `#64748B`。用 scoped `:deep` 覆盖，**下拉浮层样式用页面级 `popper-class`，不改全局**。
- 交互：
  - 三个下拉变更**立即查询**；名称、代码输入框**回车或点「搜索」才查询**。
  - 提交前对输入 `trim`，与后端 DTO 长度对齐。
  - 「重置」清空全部筛选（含 tab 回到「全部专业」）并回到第 1 页。
- <768：名称、代码、下拉都 `width: 100%` 纵向堆叠，按钮并排各占一半。

### 3.4 专业卡（表格改卡片）
统一类 `.hf-card`，`padding: 20px`，整卡为 **`<router-link>`**（支持新标签页和键盘聚焦），跳转沿用现有写法。结构：

1. **头部**（flex，`gap: 14px`）：
  - 左：48×48，圆角 14px 的柔光图标底座加 lucide 图标（见 §4），**无序号徽标**。
  - 右上：专业名（`16px / 700 / #0F172A`，单行省略加 `title`），其后代码标签（等宽 `12px`，`#64748B`，底 `#F1F5F9`，圆角 6px，`padding: 2px 7px`）。
2. **标签行**（`gap: 8px`，允许换行，全部为 6px 圆角、`11px / 600 / padding 2px 7px`、带 1px 同色系 ring）：
  - 学位类型：学术学位用蓝（`#2563EB` / `#EFF6FF` / ring `rgba(37,99,235,.18)`），专业学位用琥珀（`#B45309` / `#FFFBEB` / ring `rgba(245,158,11,.22)`）。
  - 学科门类：slate（`#475569` / `#F1F5F9`）。
  - 热度：**仅「热门」**用红（`#E11D48` / `#FFF1F2` / ring `rgba(225,29,72,.18)`）并带 12px `Flame` 图标；「一般」「冷门」用 slate 灰且不带图标。
  - **难度不用标签**，改为「三格等级条加文字」，放在标签行末尾：三个 `12×4px`、圆角 2px 的纯色块 `gap: 2px`，后接文字「难度 高」（`12px / 600`）。高 = 红（点亮 3 格）、中 = 琥珀（点亮 2 格）、低 = 绿（点亮 1 格），未点亮格用 `#E2E8F0`。外层加 `aria-label="难度：高"`。色值：红 `#E11D48`、琥珀 `#D97706`（文字用 `#B45309`）、绿 `#059669`。这样与「热门」红标签在形态上区分开。
3. **简介**：`brief`，`14px / 1.65 / #475569`，`line-clamp: 2`，`min-height` 固定为两行高度，保证同行卡片等高。
4. **底部收口条**：`background: #F8FAFC; border-radius: 10px; padding: 10px 14px; margin-top: 14px`，不使用分割线。
  - 左：`ListChecks` 图标（`#64748B`，14px）加「考试科目：」（`13px / #64748B`）加 `examSubjects.join(' · ')`（`13px / #334155`，单行省略，`title` 为全文，`min-width: 0; flex: 1`）。
  - 右：「查看详情」（`13px / 600 / #C2410C`）加 `ArrowRight`（`#334155`），`flex-shrink: 0`。
  - 卡片 hover 时：文字变 `#9A3412`，箭头变 `#EA580C` 并 `translateX(2px)`（箭头不含文字，可 transform）。
- hover（仅此类可点击卡）：`translateY(-2px)`，`border-color: rgba(249,115,22,.22)`，阴影 `0 4px 12px rgba(15,23,42,.04), 0 12px 28px -4px rgba(249,115,22,.08)`。`:active` 用 `transform: none` 加阴影收拢，**禁止 `scale`**。
- 整卡 `:focus-visible` 要有可见焦点环（`outline: 2px solid rgba(37,99,235,.5); outline-offset: 2px`）。
- 网格行高：`align-items: stretch`，卡片内用 flex column，收口条 `margin-top: auto`。

### 3.5 右栏「热门考研专业」
- 白卡 `.hf-card`，标题「热门考研专业」（3×14px 橙竖条加 `16px / 700`），副标题「精选热门报考方向」（`13px / #64748B`）。**副标题与标题均不得出现「实时」「TOP 榜实时」等字样。**
- 数据：**独立请求一次**，复用同一个列表接口，参数 `popularity=热门`、`page=1`、`size=5`，不传排序（沿用默认 `sort_order` 倒序）。**不随左侧筛选、tab、分页联动**，仅页面挂载时加载。失败或返回空 → **整卡静默隐藏**，不弹错误提示。
- 每行为 `<router-link>`（跳转同 §3.4），`padding: 8px 10px; border-radius: 10px`，行间用 `gap: 4px`，**无分割线**，hover 底 `#F8FAFC`。内容：
  - 左：22×22 正圆（`border-radius: 50%`）序号徽标，`12px / 700`。1 号：底 `#FFF1F2` 字 `#E11D48`；2 号：底 `#FFFBEB` 字 `#B45309`；3 号：底 `#EFF6FF` 字 `#2563EB`；4、5 号：底 `#F1F5F9` 字 `#475569`。
  - 中：专业名（`14px / 600 / #1E293B`，单行省略加 `title`）。
  - 右：`Flame`（`#E11D48`，14px）加热度指数（`13px / 600 / #475569`，`tabular-nums`）。
- **热度指数规则**（用户确认可展示的固定占位值）：在 `utils.ts` 顶部声明
  ```ts
  // 展示用热度指数：按排名位置取固定值，非实时、非真实统计。
  // TODO: 后端提供真实热度字段后替换此常量
  export const HOT_INDEX_BY_RANK = [12568, 10342, 8761, 7230, 6542]
  ```
  取值只看**榜单中的排名下标**，与筛选、翻页、刷新、数据内容都无关。数字用 `toLocaleString('zh-CN')` 加千分位。

### 3.6 右栏「规划工具快捷入口」
- **复用共享的 `PlanningToolsCard` 与配置**（见 §0.3）。若需新增共享抽取，**`List.vue` 与专业详情页的文案、样式、行为必须保持改动前完全一致**，用「每页覆盖字段」实现（`label` / `order` / `visible` / `comingSoon`）。
- 卡片标题统一为「规划工具快捷入口」。
- 本页名称与顺序固定为：
  1. 院校库查询
  2. 考研真题（标「即将上线」）
  3. 考公考研
  4. 就业服务
  5. AI智能规划
  6. 专家一对一指导
- 图标、路由、跳转逻辑沿用 `List.vue` 的已有实现。「考研真题」是新增项，没有现成图标，选 `FileClock`（不存在则用 `ScrollText`）。「考公考研」若在 `List.vue` 找不到对应项，就用 `Landmark` 并标「即将上线」，**在报告里明确说明**。
- **没有路由的项**统一加蓝色 6px 小标签「即将上线」（`11px / 600`），点击 `ElMessage.info({ message: '敬请期待', grouping: true })`，不跳转。「AI智能规划」是普通行，不做橙色高亮，行为与专业详情页的该项一致。
- 每行：36px 圆角 10px 柔光图标底座，标题 `14px / 600 / #1E293B`，右侧 `ChevronRight`（`#334155`，hover `#EA580C` 并右移 2px），行 hover 底 `#F8FAFC`。**各行图标底座颜色在蓝 / 绿 / 琥珀间分流，不得使用紫色，不得整卡高亮橙色。**

### 3.7 分页
- 位于卡片网格下方居中，布局 `prev, pager, next, sizes`，**去掉 total**（已在检索卡头部显示）。
- 页容量选项沿用现有，默认 10。
- 样式优先**复用专业列表页已有的分页覆盖**；没有的话，页面级覆盖：激活页底 `#FFF7ED`、字 `#C2410C`、`font-weight: 600`；普通页 hover 字 `#C2410C`；不使用 Element 默认蓝。
- **翻页、改每页条数后**，平滑滚动到「学位切换」顶部，用 `scrollIntoView({ behavior: 'smooth', block: 'start' })`，并尊重 `prefers-reduced-motion`。

### 3.8 URL 状态同步
- 筛选、页码、每页条数、tab 同步到 `route.query`（`page / size / name / code / degreeType / disciplineCategory / popularity / difficulty`），用 `router.replace`，不污染历史。
- 页面初始化与 `route.query` 变化时反向恢复状态，实现「列表 → 详情 → 返回」后状态保留。
- 若调研发现现有页面**已有**状态保存机制，保持其行为，只补缺失部分，不要双重实现。
- 任何筛选变更都把 `page` 重置为 1。
- 请求竞态处理：每次请求带自增 id，只采纳最新一次的响应，避免快速切换时旧数据覆盖新数据。

---

## 4. 图标映射

在 `utils.ts` 中实现 `getPostgradMajorIcon(majorName, disciplineCategory)`，返回 `{ icon, fg, bg }`，两级映射、带兜底：

1. **专业名关键词**（命中即返回；顺序即优先级），建议如下（均需校验导出存在，不存在换近义图标）：

| 关键词 | 图标 | 关键词 | 图标 |
|---|---|---|---|
| 临床、内科、外科 | `Stethoscope` | 口腔 | `Smile` |
| 公共卫生 | `ShieldPlus` | 护理 | `HeartPulse` |
| 中药 | `Leaf` | 中医 | `Activity` |
| 药 | `Pill` | 医学技术、检验 | `Microscope` |
| 法医、法学、法律 | `Scale` | 计算机、软件、网络 | `Cpu` |
| 人工智能 | `BrainCircuit` | 电子、通信、信息 | `CircuitBoard` |
| 机械 | `Settings` | 土木、建筑 | `Building2` |
| 化学、化工 | `FlaskConical` | 物理 | `Atom` |
| 数学、统计 | `Sigma` | 生物 | `Dna` |
| 金融 | `Landmark` | 经济 | `TrendingUp` |
| 会计、审计 | `Calculator` | 管理、工商 | `BriefcaseBusiness` |
| 教育 | `School` | 心理 | `Brain` |
| 外语、语言 | `Languages` | 新闻、传播 | `Newspaper` |
| 历史 | `ScrollText` | 哲学 | `Lightbulb` |
| 艺术、设计 | `Palette` | 体育 | `Dumbbell` |
| 农、林、园艺 | `Sprout` | 军事 | `Shield` |

2. **学科门类兜底**（研究生共 14 个门类），覆盖：

| 门类 | 图标 | 底座色 |
|---|---|---|
| 哲学 | `Lightbulb` | 蓝 |
| 经济学 | `TrendingUp` | 琥珀 |
| 法学 | `Scale` | 蓝 |
| 教育学 | `School` | 绿 |
| 文学 | `BookText` | 琥珀 |
| 历史学 | `ScrollText` | 琥珀 |
| 理学 | `FlaskConical` | 蓝 |
| 工学 | `Cpu` | 蓝 |
| 农学 | `Sprout` | 绿 |
| 医学 | `Stethoscope` | 绿 |
| 军事学 | `Shield` | slate |
| 管理学 | `BriefcaseBusiness` | 琥珀 |
| 艺术学 | `Palette` | 红 |
| 交叉学科 | `Shuffle` | 蓝 |

3. **最终兜底**：`GraduationCap`，蓝。

- 关键词命中时，**底座色取该专业所属门类的颜色**（保证同门类色调一致）；门类也未知时用蓝。
- 若详情页已有 `getDisciplineIcon`，**复用其配色常量**，并在文件注释里写明「后续可细化到专业级」的扩展点；**不得修改它对专业详情页的现有输出**。
- 所有图标 `stroke-width` 取 `1.75` 或 `2`，**严禁 Emoji**。

---

## 5. 原型取舍（必读）

**采纳**：整体「Hero + 左列表右工具」双栏版式；表格改 2 列卡片；卡片内「名称 + 代码 + 标签 + 简介 + 考试科目 + 查看详情」的信息结构；右栏「榜单 + 工具」两张卡。

**不采纳（原型与规范或事实冲突）**：
1. 原型右栏每张工具卡一个底色、含紫色、含橙色高亮的 AI 卡 → 统一白底行，无紫色，AI 行不高亮。
2. 原型标题「专业热度 TOP 榜」和「按关注热度实时排行」 → 改为「热门考研专业」和「精选热门报考方向」。
3. 原型「共 268 个专业」 → 用真实 total。「综合排序」下拉 → 不做。
4. 原型筛选栏缺「难度」 → 保留难度筛选。
5. 原型 Hero 的 4 个药丸 → 改为不可点击的图标文字项。
6. 原型卡片内的 1px 分割线 → 改为浅灰收口条。
7. 原型 9999px 标签与同色撞色 → 改为 6px 标签，热度与难度形态分离。
8. 原型的导航栏 → 不在本次范围。

---

## 6. 视觉规范（强制）

**色彩**：品牌橙只出现在 ① 模块标题竖条（3×14px）② 本页唯一实心主按钮「搜索」③ 小字文字态（`#C2410C`）④ 激活态的浅橙底（`#FFF7ED`，不实心）。橙色文字一律 `#C2410C`，hover `#9A3412`。黄色文字用 `#B45309` 或 `#D97706` 搭 `#FFFBEB`。**不得出现紫色**。白与 slate 占主体，四色按语义分流。

**卡片**统一 `.hf-card`：
```css
.hf-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(15,23,42,.05);
  box-shadow: 0 1px 2px rgba(15,23,42,.02), 0 4px 20px -2px rgba(15,23,42,.04);
  transition: border-color .28s cubic-bezier(.32,.72,0,1), box-shadow .28s cubic-bezier(.32,.72,0,1), transform .28s cubic-bezier(.32,.72,0,1);
}
```
- 只有**可点击卡片 / 行**才有 hover 位移，纯展示卡不加。
- **严禁**彩色实线外框、`border-image`。

**形态**：9999px 只给分段切换器和 CTA；说明性标签 6px；榜单序号 50% 正圆。

**文字色阶**：`#0F172A / #1E293B / #475569 / #64748B`。所有 label、placeholder、辅助小字**不得低于 `#64748B`**（`#94A3B8` 仅限时间戳）。

**防糊铁律**：
1. 稳态元素不得留下 `transform` / `filter` / `will-change`；本页不做入场动画。
2. 含文字或细描边的容器**禁止 `scale()`**；强调只用 `translateY`、阴影与颜色；`:active` 用 `transform: none`。
3. `will-change` 不写在任何长期存在的类上。
4. **字号全部取整 px**（11 / 12 / 13 / 14 / 15 / 16 / 28），禁止 `0.82rem` 这类分数 px。
5. `backdrop-filter` 本页一律不用。
6. 栅格使用 `minmax(0,1fr)` 与固定 320px 右栏，减少分数像素落位；卡片内文字不放在 transform 节点内（仅整卡 `translateY`）。

**其他**：
- 可点击元素必须是 `<a>` / `<router-link>` / `<button>`，具备 `focus-visible` 样式。
- 竖向列表项之间不用 `dashed` 或粗线，用 `gap: 10–12px`。
- 加 `@media (prefers-reduced-motion: reduce)`，将过渡与平滑滚动降级。
- 不使用任何 Emoji，不使用 `【】`。

---

## 7. 加载与异常
- **加载中**：显示与卡片同尺寸的骨架卡（纯色块，无 shimmer、无 `filter`），数量等于当前页容量，避免布局跳动。右栏榜单加载时显示 5 行骨架，失败则整卡隐藏。
- **空结果**：`ElEmpty` 加「清除筛选」按钮（效果等同「重置」）；**不渲染分页**。
- **请求失败**：卡片区显示错误提示加「重试」按钮，不清空已有筛选条件。
- **任何模块没有内容就不要渲染外壳卡片**，避免出现孤立的空阴影卡。

---

## 8. 禁止事项
- 不修改接口、字段名、参数名，不新增排序参数。
- 不改动导航栏；不引入新依赖；不修改 `index.css` 全局样式。
- 不修改 `List.vue` 与专业详情页的视觉和行为（抽取共享配置除外，行为必须一致）。
- 不展示任何后端没提供的数据，**唯一例外**是 §3.5 约定的榜单固定热度指数。
- 不展示「实时」「综合排序」等不成立的功能或文案。

---

## 9. 交付物与验收

**交付**：
1. 改动文件清单（新增 / 修改 / 删除）。
2. 完整代码（按文件分块）。
3. **报告**：§0 调研结论（现有跳转方式、状态保存机制、复用的共享文件、实际使用的 lucide 图标清单）、「考公考研」路由查找结果、对 `List.vue` 与详情页的改动范围、无法完成或用占位的项。

**验收清单（自测后逐条回答 ✅/❌）**：
- [ ] 检索卡无橙色外框；全页实心橙块只有「搜索」一个
- [ ] 页面无紫色、无大面积橙色渐变、无 `border-image`
- [ ] 热度与难度形态不同：仅「热门」是红标签，难度是三格等级条
- [ ] 学位类型两种值颜色不同；卡片图标底座按门类有蓝 / 绿 / 琥珀变化
- [ ] `brief` 与 `examSubjects` 为空时显示占位文案，同行卡片等高
- [ ] 整张卡片可点击，支持新标签页打开与键盘聚焦
- [ ] 榜单请求只在挂载时发一次，改变筛选、tab、翻页时不重新请求，热度数值不变
- [ ] 榜单标题与副标题不含「实时」；无榜单数据时整卡隐藏
- [ ] 下拉变更即查询；名称、代码回车或点搜索才查询；重置回到全部专业与第 1 页
- [ ] 「列表 → 详情 → 返回」后筛选、页码、tab 保留
- [ ] 右栏工具名称与顺序正确；「考研真题」与无路由项点击提示「敬请期待」且连点不刷屏
- [ ] 1280 / 1024 / 768 三档布局正常，桌面右栏 sticky 生效
- [ ] 全页无分数 px 字号、无稳态 transform / filter、无 `scale`，hover 时文字边缘清晰
- [ ] 分页无 total、激活态非 Element 默认蓝；翻页后滚动到列表顶部
- [ ] `List.vue` 与专业详情页视觉与交互与改动前一致
- [ ] `vue-tsc` 与 ESLint 无新增错误