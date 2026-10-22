# 项目长期记忆与全局设计规范（海枫前端 Monorepo）

## 一、 通用工程与跨端铁律（长期记忆）

### 1. 基础架构与构建约束
- **架构概览**：教育规划平台前端，采用 **pnpm Monorepo** 架构：
  | 应用 | 路径 | 说明 | UI 框架 / 样式 |
  |------|------|------|---------|
  | Admin 管理后台 | `apps/admin/` | 面向管理员 | Element Plus + Tailwind CSS |
  | User 用户端 | `apps/user/` | 面向 C 端学生/家长 | Vue 3 组件库 + Tailwind CSS |
  | Shared 共享包 | `packages/shared/` | 对应后端 common | Axios / 通用工具 / 类型定义 |
- **代码约束**：仅样式任务严禁改动 `<script setup>` 业务逻辑；表格用 `min-width` 撑满数据列，`width` 只给窄固定列（状态/操作）。
- **类型检查**：`pnpm --filter @haifeng/admin typecheck`（或 `user`）。Vite dev 用 esbuild 不做类型检查，CSS 改动不影响 dev 运行。
- **后端热更新禁令**：⚠️ 后端应用 JVM 还在运行时，**严禁执行 `mvn clean` / `mvnw clean` / IDE 的 Rebuild / Build Project**。本项目未引入 `spring-boot-devtools`，磁盘改写与运行时类加载撞车会导致 `$Builder` 缺失等 `NoClassDefFoundError`。

### 2. 已知坑：Element Plus 弹窗锁滚动 + 页面左移抖动（2026-09-09 终极根治）
- **现象**：触发弹窗（`el-dialog` / `ElMessageBox` / `el-drawer` / `el-image` 预览）时，右侧滚动条消失导致整页或顶部 `position: fixed` 悬浮导航左右位移约 6px。
- **机制（element-plus 2.13.7）**：`useLockscreen` 弹窗打开时给 `body` 加 `el-popup-parent--hidden`（`overflow: hidden`），并内联写入 `body.style.width = calc(100% - 滚动条宽)`。
- **正确根治方案（落地于 `apps/user/src/assets/styles/index.css`，严禁误删）**：
    1. **`html { scrollbar-gutter: stable; }`**：根元素控制视口滚动槽，保证 `position: fixed` 悬浮导航在锁滚动前后零位移。
    2. **`body { overflow-y: scroll; scrollbar-gutter: stable; }`**：永远显示 6px 细滚动条并预留稳定槽位。
    3. **`body.el-popup-parent--hidden { width: 100% !important; }`**：用 `!important` 覆盖 Element Plus 内联的 `calc(100% - 滚动条宽)` 补偿，配合稳定 gutter 使锁滚动前后内容区宽度完全恒定。请勿以「早期错误版本」为由删除此条。

### 3. Admin 控制面板「系统信息」字段来源（跨端：后端 haifeng-admin）
- **接口**：`GET /api/v1/admin/dashboard/overview` → `DashboardController.getDashboardOverview()` → `DashboardServiceImpl.getSystemInfo()`（`DashboardServiceImpl.java:109-126`）。
- **`appVersion`**：读取 pom 版本（`spring-boot-maven-plugin` 已加 `build-info` goal，通过 `ObjectProvider<BuildProperties>` 注入，未生成时回退 `"1.0.0"`）。
- **AI 配置两表设计（关键）**：
    - `t_model_provider`（V24 迁移）是**服务商目录**（`api_key` / `base_url` / `model_name` / `provider_name` / `status`）。
    - `system_settings`（单例 `id=1`）中的 `provider_name` / `model_name` 是**“当前选中”指针**，只能经 `updateProviderModel` 写入。**Dashboard 读的是 `system_settings` 的指针，不是目录表**。
    - 前端在 `system/settings/components/ProviderCard.vue` 通过「设为当前模型」按钮调用 `updateProviderModel` 更新指针。

### 4. 后端分页参数硬约束（所有继承 BasePageQueryDTO 的接口通用）
- **后端约束**：`haifeng-common/.../dto/common/BasePageQueryDTO.java` 中 `size` 字段带有 `@Min(10, "每页最小10条")` + `@Max(100, "每页最大100条")`，默认 10；`page` 为 `@Min(1)`。
- **前端铁律**：任何调用带 `size` 分页接口的前端页面，`page-size` 默认值与 `page-sizes` 档位**必须全部落在 `[10, 100]` 区间内**（如 3 列卡片网格统一用 `pageSize=12`、`page-sizes=[12, 24, 36]`），严禁出现 `9` 等小于 10 的数值，否则必报 `400 每页最小10条`。

### 5. 就业管理模块：前后端枚举值三层对齐（DTO @Pattern + DB CHECK）
- **第一层（DTO `@Pattern`）**：后端 `haifeng-admin` 的 `dto/employment/**` 用 `@Pattern` 硬编码枚举（如公务员 `examType` 为 `国考|省考`；事业单位状态 `招聘中|已结束`、标签 `热门|无|急招`）。前端下拉选项必须一字不差。
- **第二层（DB `CHECK` 约束——最终权威）**：迁移文件 V20~V23 建表含 `chk_xxx` 约束（军文职学历 `本科及以上/硕士及以上/博士`、状态 `进行中/已结束`；选调生类型 `定向/非定向/急需紧缺专业选调`；社区岗 + 社工证；公益岗类别带“类”；医疗 `妇幼保健院/未定级`；教师学科 `道德与法治`）。改选项前必须先核对 DB CHECK 与 DTO `@Pattern`。
- **第三层（状态接口入参形态区分）**：
    - 公务员/事业单位：`PATCH` 数字 `StatusDTO{ status }`（`0`=招聘中/报名中，`1`=已结束；公务员“即将开始”仅限创建/编辑表单设置，下拉操作栏不含第三态）。
    - 军文职/选调生等其余模块：`PATCH` 字符串 `PositionStatusUpdateDTO{ positionStatus }`。
- **必填校验对齐**：全部 12 个就业表单前端必填校验必须与后端 `AddDTO` 的 `@NotBlank(message = "...")` 严格对齐。

### 6. 已知坑：CORS 缺 PATCH / Axios 拦截器吞报错 / MP 逻辑删除
- **CORS 必须含 PATCH**：`haifeng-common/CorsConfig.java` 的 `allowedMethods` 必须包含 `PATCH`，否则所有 `@PatchMapping` 状态切换接口在 OPTIONS 预检阶段即失败。
- **Axios 错误捕获标准写法**：`packages/shared/src/utils/request.ts` 响应拦截器将错误包装为 `reject(new Error(message))`，无 `.response` 属性。前端 `catch` 块**一律写为**：
  ```ts
  const msg = err.response?.data?.msg || err.message || '操作失败';
  ```
- **MyBatis-Plus 逻辑删除（`is_deleted`）铁律**：
    - 全局配置了 `logic-delete-field: isDeleted`。MP 内置的 `updateById`、`update(entity/wrapper)`、`deleteById`、`selectPage` **全部会自动追加 `WHERE is_deleted=false`**，且 `updateById` 会自动忽略 `isDeleted` 字段。
    - **禁用 = 软删除（`is_deleted=true`）**；**删除/批量删除 = 物理删除**（必须写自定义 `@Delete("DELETE FROM t_xxx WHERE id=#{id}")`）。
    - **凡是查询含禁用记录（status 全部/已禁用）、或对已禁用记录执行更新/恢复状态的方法，一律使用 XML 或 `@Update` 自定义 SQL，严禁调用 MP 内置方法。**

---

## 二、 全局色彩体系：主色克制与四色活力光谱

### 1. 破除“全屏单一橙色通胀”原则
当页面上 100% 的边框、标签、图标、分割线全部使用同一种橙色时，橙色会彻底丧失视觉引导力，导致画面显得廉价且疲劳。全站必须执行 **「主色锁定核心场景 + 多巴胺活力辅色分流」** 策略：
- **品牌橙（10% 关键锚定）**：**仅在顶部导航栏核心标识、主召唤按钮（Primary CTA）、一级模块序号锚点等核心场景突出**。
- **中性底色（60~70% 呼吸留白）**：大面积容器、背景、卡片表面与分割线必须使用纯净白与冷调石板灰（Slate/Zinc），保证内容清爽耐看。
- **活力辅色（20% 语义赋能）**：在分类胶囊、学科标签、公告属性、数据看点等场景，引入**晴空蓝、丹霞红、向日葵黄、翡翠绿**，赋予教育平台青春、阳光、热情的生命力。

### 2. 全局设计令牌（Design Tokens）

| 色彩角色 | 语义定位与情感特征 | 核心主色 (Text / Icon / Solid) | 柔光底座 (Soft SurfaceBg) | 极细微描边 (Subtle Ring) | 典型适用场景 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **海枫橙 (Brand Orange)** | **品牌核心 · 权威引航** | `#F97316` (Hover `#EA580C`) | `#FFF7ED` (`orange-50`) | `rgba(249, 115, 22, 0.2)` | 顶部导航激活态、核心主按钮、一级序号角标 `01-10`、政策类短签 |
| **晴空蓝 (Youthful Blue)** | **青春活力 · 理性智库** | `#2563EB` (`blue-600`) | `#EFF6FF` (`blue-50`) | `rgba(37, 99, 235, 0.18)` | 新高考选科标签（`3+1+2`）、资讯类公告、理工/综合学科、四六级/英语模块、博士申请考核、图表主色 |
| **丹霞红 (Passionate Red)** | **热情奔放 · 焦点冲刺** | `#E11D48` (`rose-600`) | `#FFF1F2` (`rose-50`) | `rgba(225, 29, 72, 0.18)` | 焦点微标签（`热门`、`急招`、`NEW`）、志愿填报冲刺预警、高优红点提示、危险/删除操作 |
| **向日葵黄 (Sunny Yellow)** | **阳光朝气 · 金榜收获** | `#D97706` (文字) / `#F59E0B` (图标) | `#FFFBEB` (`amber-50`) | `rgba(245, 158, 11, 0.22)` | 国家级竞赛/证书金榜、院校性质（`公办`/`民办`）、名企秋招日历、温暖提示卡、VIP 会员徽标 |
| **翡翠绿 (Growth Green)** | **生机畅通 · 实证精确** | `#059669` (`emerald-600`) | `#ECFDF5` (`emerald-50`) | `rgba(5, 150, 105, 0.18)` | 状态在线指示（`实时同步`）、考研`报录精算`标签、`招录`类公告、成功率/就业率正向指标 |

> **色彩对比度硬约束（WCAG AA）**：黄色系作文字时，严禁在白底上直接使用浅亮黄（如 `#FACC15` 看不清），文字必须使用深琥珀色 `#D97706` 或 `#B45309`，搭配 `#FFFBEB` 浅黄底，确保清晰锐利。

---

## 三、 【核心标准】方块与卡片容器微质感规范（严禁单纯依赖有色硬边框）

> **立规背景**：在以往开发中，给每个方块无脑套上 `1px solid #FF8C3D` 亮橙色实线框或使用 `border-image` 顶部渐变边，不仅导致 CSS `border-radius` 圆角被 `border-image` 强行裁切成刺眼的直角外框，更在多卡片矩阵中形成了沉闷压抑的“铁丝网表格感”。**优秀的现代 UI 绝不靠高饱和度硬边框来划分区域，而是靠「高程阴影、微差表面、角标构图与内部收口细节」来塑造质感。**

### 1. 铁律一：彻底废除彩色实线外框与 `border-image`
- ❌ **严禁**在常规展示卡片、专栏方块、公告栏外围使用亮橙色实线框（`border: 1px solid #F97316`）。
- ❌ **严禁**在带 `border-radius` 的卡片上使用 `border-image: linear-gradient(...)`（浏览器规范中 `border-image` 会直接破坏圆角渲染，产生直角外框 Bug）。如需顶部彩条装饰，必须使用卡片内部 `overflow: hidden` + 顶部 `::before` 伪元素高度 `3px` 实现。

### 2. 铁律二：塑造方块高级感的「五维细节法则」

所有卡片、矩阵方块与列表容器，必须通过以下 5 项微细节组合来替代简陋的单层边框：

#### 细节 ①：微差表面与无感发丝边（Surface & Hairline Border）
- 卡片背景采用纯白 `#FFFFFF`，外围仅使用 **1px 极浅冷灰发丝边** `border: 1px solid #F1F5F9`（或 `1px solid rgba(15, 23, 42, 0.05)`）。
- 搭配双层弥散环境阴影，让方块自然“浮”在画布上：
  ```css
  .hf-card {
    background: #FFFFFF;
    border-radius: 16px;
    border: 1px solid rgba(15, 23, 42, 0.05);
    box-shadow: 
      0 1px 2px rgba(15, 23, 42, 0.02),
      0 4px 20px -2px rgba(15, 23, 42, 0.04);
    transition: all 0.28s cubic-bezier(0.32, 0.72, 0, 1);
  }
  .hf-card:hover {
    transform: translateY(-2px);
    border-color: rgba(249, 115, 22, 0.22); /* 仅在 Hover 激活时浮现极淡暖光边 */
    box-shadow: 
      0 4px 12px rgba(15, 23, 42, 0.04),
      0 12px 28px -4px rgba(249, 115, 22, 0.08);
  }
  ```

#### 细节 ②：父子角标锚定构图（Absolute Corner Badging）
- **反例警示**：严禁在方块内部将「图标框」与「实心序号方块 `01`」水平并排放置，这会造成双色块视觉碰撞并挤压标题排版空间。
- **标准做法**：左侧设 `48px × 48px`（`border-radius: 14px`）无描边柔光图标底座（如暖杏色 `#FFF7ED`、浅蓝色 `#EFF6FF`、浅黄色 `#FFFBEB`）；序号 `01-10` 制成 `20px × 20px` 正圆徽标（白边 `2px solid #FFFFFF`），以 **`position: absolute; top: -6px; left: -6px`** 吸附在图标底座左上角，融合成单一视觉锚点。

#### 细节 ③：标题旁语义化微胶囊（Semantic Micro-Tags）
- 为避免 10 张矩阵卡片或列表项长相完全雷同，在主标题右侧 `gap: 8px` 处按业务属性挂载**小圆角矩形微标签（`border-radius: 6px`，`padding: 2px 7px`，`font-size: 11px`，`font-weight: 600`）**：
    - 选科/学术类用**晴空蓝**（如 `3+1+2`、`申请考核`）；
    - 焦点/冲刺类用**丹霞红**（如 `热门`、`冲刺`）；
    - 测算/数据类用**翡翠绿**（如 `报录精算`、`实时同步`）；
    - 赛事/荣誉类用**向日葵黄**（如 `国家级`、`公办`）。

#### 细节 ④：列表去分割线化与底部状态收口（Borderless List & Footer Bar）
- **去虚线化**：公告或资讯列表项之间**严禁使用 `dashed` 虚线或粗实线分割**，统一使用 `gap: 10px~12px` 留白呼吸，配合单行 `padding: 6px 8px` 与 `border-radius: 8px` 的悬浮浅灰底色反馈。
- **消除中文方括号**：严禁使用 `【公告】` 这种老旧纯文本括号，一律替换为 `4px~6px` 圆角的四色语义短签（`政策` 暖橙 + 右上角 `5px` 丹霞红圆点、`资讯` 晴空蓝、`招录` 翡翠绿、`就业` 向日葵黄/浅紫）。
- **容器底部收口**：在公告栏或大型列表卡片底部，放置一条 `background: #F8FAFC; border-radius: 10px; padding: 10px 14px` 的浅灰收口条（如左侧呼吸圆点 + `每日 09:00 更新全国政策快报` + 右侧 `订阅推送` 链接），彻底终结右栏下半部分留白空洞的问题。

#### 细节 ⑤：栅格垂直配平与操作引导（Grid Balancing & Affordance）
- **右栏组合配平**：当左侧为多行卡片矩阵（如 2×5 专栏）时，右侧窄栏严禁将单个公告框强行 `height: 100%` 拉满造成大面积空白，必须拆分为 **「上半区：规划院公告」+「下半区：快捷通道与智库工具」** 两个高度紧凑的独立卡片，实现左右底部自然齐平。
- **高对比度微箭头**：方块最右侧的跳转指示器 `→` 或 `↗` 采用深石板灰 `#334155`（Hover 时变为 `#EA580C` 并向右平移 `2px`），杜绝浅灰看不清的弱交互感。

---

## 四、 User 端（C 端用户）UI 详细设计规范

### 1. 页面画布与局部背景层级
- **根画布兼容**：`apps/user/src/assets/styles/index.css` 中的 `html` 全局画布保持底层兼容，但在具体业务视图（尤其是首页高密度工作台、百宝箱、生涯图谱）中，内容区块内部提倡使用清透的冷灰白底托（`#F8FAFC`）与纯白卡片（`#FFFFFF`）拉开干净的明度层次，避免暖杏粉灰底色直接接触白卡造成画面显脏。
- **页面容器**：`max-width: 1280px`（或 `1360px`）；`margin: 0 auto; padding: 2rem 1.25rem 4rem;`。

### 2. 顶部双层导航与数据看板（Hero Banner）
- **品牌标题**：主标题 `20px / 800 / #18181B`，字距 `-0.02em`；右侧目录链接采用圆角热区 + 底部 `16px` 短胶囊指示条。
- **搜索框**：宽度 `clamp(260px, 22vw, 350px)`，高度 `38px`，全圆角胶囊 `border-radius: 9999px`，冷灰底 `#F8FAFC` + `1px solid #E2E8F0`，聚焦时平滑微展宽并带橙色柔光外环。
- **智库数据看板条**：白底无框大圆角横幅（`border-radius: 18px`），左侧展示智库定位 + 翡翠绿 `实时同步` 胶囊，右侧横向并列核心大数字指标，数字色彩多元分流：
    - 第一组（如 `10 大系统专栏`）：主数字用**海枫橙** `#F97316`；
    - 第二组（如 `120+ 算法库`）：主数字用**深曜黑** `#0F172A`；
    - 第三组（如 `200K+ 全国学子`）：主数字用**晴空蓝** `#2563EB`。

### 3. 标签与按钮的形态区分（终结“万物皆橙色药丸”）
- **形态分级**：
    1. **全圆角胶囊（`border-radius: 9999px`）**：**仅限用于**可点击的主次操作按钮（CTA）、顶部视图切换器（如 `全景决策图谱`）、状态在线徽标。
    2. **微圆角矩形（`border-radius: 6px`）**：用于所有卡片标题旁的说明性标签（`3+1+2`、`热门`、`报录精算`）、公告分类短签（`政策`、`资讯`）、专业代码与学科标签。
    3. **正圆角标（`border-radius: 50%`）**：用于吸附在图标左上角的序号 `01-10`。
- **按钮色彩分级**：
    - **一级主行动按钮（每屏不超过 1~2 个）**：海枫橙实心或微渐变（`#F97316` → `#EA580C`）+ 白字 + `border-radius: 12px` 或 `9999px`（如右栏「预约 1 对 1 首席升学规划师」）。
    - **模块级切换/次要按钮**：白底或浅冷灰底 `#F8FAFC` + `1px solid #E2E8F0` + 深灰字 `#334155` + 内部精致 SVG 图标（如「全景决策图谱」按钮）。
    - **辅助工具小卡**：采用清爽的冷灰蓝底 `#F8FAFC` + 左上角线性图标 + 右上角外链图标 `↗` + 底部翡翠绿/晴空蓝辅助说明小字（如「全周期日历」、「百宝箱查询矩阵」）。

### 4. 文字层级与图标规范
- **四级文字色阶（Slate 体系）**：
    - 一级标题/核心数字：`#0F172A` (`slate-900`)，`font-weight: 700~800`
    - 二级卡片标题/导航文字：`#1E293B` (`slate-800`)，`font-weight: 600~700`
    - 三级正文/列表标题：`#475569` (`slate-600`)
    - 四级辅助描述/日期时间戳：`#64748B` (`slate-500`) 或 `#94A3B8` (`slate-400`)
- **图标铁律**：全站统一使用精细线性 SVG 语义图标（`stroke-width="1.75"` 或 `"2"`），**严禁使用任何 Emoji 图标**。
- **防御性数据渲染**：凡涉及数量统计字段（如院校卡片的 `major_count`），当值为 `0` 或 `null` 时，前端必须渲染为 `"专业数据整理中"`，**严禁直接渲染出 `"0 个专业"`**。

---

## 五、 Admin 端（管理后台）UI 详细设计规范

### 1. 整体基调与色彩扩展
- **页面背景**：柔和浅灰暖白底 `#F8FAFC`，保留右上/左下极低透明度（`opacity: 0.03`）枫叶水印，确保长时间办公视觉不疲劳。
- **容器与卡片**：废除原先沉重的“上下各 3px 粗橙色边框”，改为纯白底 `#FFFFFF` + `border-radius: 12px` + `1px solid #E2E8F0` 极细边框 + 柔和环境阴影 `0 2px 12px rgba(15, 23, 42, 0.03)`。重点统计卡片可采用左侧 `4px` 四色竖条（橙/蓝/红/黄）区分不同业务指标维度。

### 2. 表格、状态标签与操作按钮
- **表格（`el-table`）**：
    - 表头：清爽冷灰或极浅暖白背景 `#F8FAFC` + 深色粗体文字 `#1E293B` + 底部 `1px solid #E2E8F0` 分隔线（取代原先刺眼的 2px 亮橙底边框）。
    - 行 Hover：`rgba(249, 115, 22, 0.03)` 或 `#F8FAFC`。
    - 分页：隐藏所有记录的数据库原始 `id` 列；分页组件当前页使用海枫橙圆角高亮。
- **多色语义状态标签（取代单一橙色药丸）**：
    - **进行中 / 报名中 / 启用 / 正常**：翡翠绿底 `#ECFDF5` + `#059669` 文字 + `6px` 圆角。
    - **即将开始 / 审核中 / 常规分类**：晴空蓝底 `#EFF6FF` + `#2563EB` 文字 + `6px` 圆角。
    - **公办 / 国家级 / 重点推荐**：向日葵黄底 `#FFFBEB` + `#D97706` 文字 + `6px` 圆角。
    - **热门 / 急招 / 预警**：丹霞红底 `#FFF1F2` + `#E11D48` 文字 + `6px` 圆角。
    - **已结束 / 禁用 / 归档**：中性冷灰底 `#F1F5F9` + `#64748B` 文字 + `6px` 圆角。
- **弹窗（`el-dialog` / `ElMessageBox`）**：
    - 圆角 `16px`，头部底部分隔线采用 `1px solid #F1F5F9`，配合四色语义图标（Info=晴空蓝、Warning=向日葵黄、Success=翡翠绿、Error=丹霞红）。

---

## 六、 改动前自检 Checklist

每次新增或修改页面/组件前，必须逐条核对：

- [ ] **【容器细节】** 卡片是否已去掉亮橙色硬边框与 `border-image`，改用纯白底 + `1px` 极浅冷灰发丝边 + 柔和弥散阴影？
- [ ] **【角标构图】** 序号 `01-10` 是否已做成圆形角标吸附在图标底座左上角，而非独立色块与标题水平挤压？
- [ ] **【四色分流】** 页面是否合理运用了晴空蓝（选科/资讯/学术）、丹霞红（热门/急招/预警）、向日葵黄（荣誉/公办/日历）、翡翠绿（实证/招录），避免了满屏同一种橙色？
- [ ] **【标签形态】** 行内说明标签与公告分类是否已改为 `6px` 微圆角矩形（而非全部做成千篇一律的橙色药丸）？
- [ ] **【列表与配平】** 公告列表是否已去掉 `【】` 括号与底部 `dashed` 虚线，并加上了底部浅灰收口条与右栏下半区工具模块配平？
- [ ] **【防御渲染】** 列表与卡片中的计数（如专业数）是否已做 `> 0` 判断，杜绝页面出现 `0 个专业`？
- [ ] **【工程红线】** 分页 `pageSize` 是否在 `[10, 100]` 区间？错误捕获是否包含 `err.message`？就业枚举是否对齐 DB CHECK？

---

## 七、 全局严禁事项（Anti-Patterns）

- ❌ **严禁**给普通卡片、专栏方块、公告栏添加高饱和度橙色实线外框（`1px solid #FF8C3D` / `#F97316`）
- ❌ **严禁**在带圆角的容器上使用 `border-image`（会导致浏览器圆角失效变成直角硬框）
- ❌ **严禁**全站所有标签、徽标、数据块只用橙色一种颜色（必须按语义使用蓝、红、黄、绿分流）
- ❌ **严禁**把所有行内微标签都做成全圆角药丸（行内标签统一用 `4px~6px` 微圆角，胶囊仅限交互按钮）
- ❌ **严禁**将卡片序号做成实心方块与主标题并排碰撞（必须绝对定位吸附于图标框左上角）
- ❌ **严禁**在公告列表中使用中文方括号 `【公告】` 及老旧的 `dashed` 虚线分割
- ❌ **严禁**在页面上使用任何 Emoji 图标（必须使用线性 SVG 图标）
- ❌ **严禁**删除 `index.css` 中根治 Element Plus 弹窗抖动的 `scrollbar-gutter: stable` 与 `width: 100% !important` 补丁