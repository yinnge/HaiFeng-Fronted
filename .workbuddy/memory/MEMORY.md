# 项目长期记忆（海枫前端 monorepo）

> **权威规范 = 仓库内 `AGENTS.md`**（随仓库走、更全）。本文件只留跨会话高频要点与 AGENTS.md 之外的事实；逐日细节见 `.workbuddy/memory/YYYY-MM-DD.md`。

## 环境 / git
- 类型检查 `pnpm --filter @haifeng/admin|user typecheck`；bash 里 pnpm 失效 → PowerShell 调 `D:\npm\npm-global\pnpm.cmd`。
- 品牌主色 `#F97316`/`#FB923C`；admin 暖橙渐变+橙边卡片，user 冷白微灰卡；仅样式任务不动 `<script>`。
- **JVM 红线**：后端运行期禁 `mvn clean` / IDE Rebuild（无 devtools，改写磁盘 class 撞车 → NoClassDefFoundError）；沙箱内更禁跑 `mvn`（Lombok 注解处理失效会写坏磁盘 `target/classes`）。改 Java 只能本地编译 + 重启。
- `@haifeng/shared` 的 main/exports 指向 **src 源码**（非 dist），改后仍跑 `pnpm --filter @haifeng/shared build` 更新 .d.ts。
- 收尾必 commit；`git pull --rebase` 前确认 `git status` 干净。Vite build 验到全新目录（沙箱守卫拦清空已有 `dist/assets`），**真实 dist 需本地重 build**。产物核对按时间戳取最新 CSS（验证目录累积，`grep -l | head -1` 会取到旧文件）。
- 后端仓库在 `D:\exeProject\ideaProjects\Project-HaiFeng`（分支 PDF），非前端 monorepo 内。

## 高频已知坑索引（详见 AGENTS.md 第一节）
1. 新公开接口同步 `SecurityConfig.WHITE_LIST`（否则 401）2. 分页 `size∈[10,100]`、`page≥1` 3. 就业枚举以 DTO `@Pattern` + DB CHECK 为权威 4. 错误文案 `err.response?.data?.msg || err.message || 兜底` 5. MP `updateById` 排除 `is_deleted`，禁用=软删 / 删除=物理删 6. CORS `allowedMethods` 含 PATCH 7. 弹窗锁滚动抖动（已根治）8. 列表 VO 返 `id` 主键 9. OSS 预签名 3.17.4 仅 `ResponseHeaderOverrides`。

## ★ 勿回退（视觉 / 交互）
- **弹窗锁滚动抖动**：`body{overflow-y:scroll;scrollbar-gutter:stable}` + `body.el-popup-parent--hidden{width:100%!important}`；勿删或换别的补偿。
- **详情页暖橙底**：全局 `.app-shell main>*,#app>*{background:transparent!important}` 透出 `#fff7ed`；实心白卡/橙 Hero 须 scoped `background:…!important`；teleport 到 body 的弹窗 scoped `:deep()` 失效。
- **token key 撞车**：admin `/admin/`→`haifeng_admin_access_token`，user `/`→`haifeng_access_token`。「用户不存在 / 403 + 重登即好 / 通知列表空」先查这个。
- **tokenVersion/VIP**：会员权益变更不得 bump tokenVersion；VIP 实时靠 `AuthAspect.checkVip` 回退 DB。
- **EP 控件对齐**：`.el-select__selected-item` 会拉回隐藏输入框占行，规则只挂 `.el-select__placeholder`；el-input-number 须 `.el-input{width:100%;min-width:0}`。
- **入场动画必须退出合成层**：`.reveal.revealed` 稳态 `filter:none` / `transform:none` + `.is-settled{will-change:auto}`，否则常驻位图化 → 发丝边糊成灰雾、文字发虚。含文字容器禁 `hover/active: scale()`；缩放只放 `::before` 纯装饰层，定位改负 margin。纯图片/装饰层 scale 合法。
- **文字毛边根治（11-09）**：四真凶 = 罗盘舞台常驻 `scale(1)`、给含文字节点下发 scale、`AppHeader` 常驻 `will-change` + 无收益 `backdrop-filter`、全库 31 处 `:active scale`。
- **Hero 不自带背景层**：`.bg-grid-aurora` 是全屏 fixed 画布，`.hf-hero` 保持透明、无 isolation / deco / glow。
- **scoped CSS 类名笔误零报错**：重构 SFC 后必过一遍 `git diff HEAD` 的 CSS 选择器（typecheck/build 全绿也查不出）。
- **橙色小字对比度（11-10）**：`#f97316` 白底仅 2.80:1（AA 需 4.5:1），文字态一律 `#c2410c`(5.18:1) / hover `#9a3412`(7.31:1) + 取整字号，**不要靠加粗掩盖**；品牌橙保留给实心背景/描边/图标/大字。⚠️ `background-color:` 含 `color:` 子串，批量替换必须带断言。
- **「小字必然糊」是误解**：清晰度由对比度 + 笔画粗细决定；tagline 那次真因 = `11.5px` 分数字号 + `#71717A` 浅色 + `0.01em` 间距。
- **冷白定案**：user 端画布保持 `#f8fafc`；`?skin=editorial` 试验皮肤与全部暖白 CSS 已整体删除（11-10），零残留。别再接受「翻回冷白 / 改 tailwind 令牌 / 网格线换 slate」这类基于错误前提的建议。

## ★ 字体 / 字重定案（权威见 AGENTS.md 第八节）
- 仅 **user 端**：`misans-webfont@4.3.1` + `@fontsource-variable/inter@5.3.0`，自托管、零境外 CDN。唯一真相 `--hf-font-sans` = `'Inter Variable','MiSans',系统栈`；body / `--el-font-family` / Tailwind sans / TopToolBar / SiteFooter 全引用它。`?font=system` → `html.font-system`（旧栈刻意不含 `'MiSans'`）。admin 零改动。
- `apps/user/scripts/gen-misans-css.mjs`（`pnpm --filter @haifeng/user fonts:gen`）生成 `misans.css`：**升级包必重跑**。
- **`FACE_SPECS` 双族名封顶**：`MiSans` = `100 600`→Regular / `700`→Medium / `800 900`→Semibold；`MiSans Display` = `100 900`→Bold，只给 `--hf-font-strong`。**例外仅 2 处**：`HfHeroSection .hf-title`(800)、`TopToolBar .tt-brand-title`(800)。`html.font-system` 必须同步覆盖 `--hf-font-strong`。
- ★ **`MiSans Display` 是单字形族**：挂它时改 `font-weight` 数字**完全无效**，必须先删 `font-family: var(--hf-font-strong)` 再调数字。
- 业务 CSS 字重声明一处未改；调全站轻重只改 `FACE_SPECS`。`font-display:swap` 首次一次字形切换，刻意不做淡入以免毛边复发。
- **合规义务**：MiSans 协议要求注明使用，已写 `SiteFooter.vue` 页脚 `.font-credit`，勿删。
- **11-10 晚导航加深**：`AppHeader .nav-link` → `#111827`/700，`TopToolBar .tt-link`+`.tt-mobile-link` → `#18181B`/700；激活态靠橙字+橙底+下划线，不叠加字重。

## 业务规则
- **游客档案/专业组**：游客档案仅 localStorage `haifeng:guest-gaokao-archive`；`Groups.vue` 用 `guestArchiveParams` 上行，已登录不传。`request.ts` 401 仅「有 token」算过期。
- **高考省份锁定**：登录用户首次保存档案后锁定（导航 + 表单 disabled），游客随便切；单例 `useProvinceLock.ts`。
- **资料页面向人群 = 单一 `stageFilter`**：`STAGE_FILTER_OPTIONS` 平铺按钮行，`?stage=` 深链经 `syncFromQuery()` 校验预选。

## 导航 / 布局
- 断点 4 档：<768 汉堡 / 768~1700 桌面+更多 / ≥1700 完整菜单 / ≥2100 封顶留白。药丸 el-select 隐藏 `.el-select__suffix` 箭头。
- `scrollY>8` 抽屉式收起（`composables/useAutoHideHeader.ts` 模块级单例）；顶部双层：`DefaultLayout` 首页渲染 `TopToolBar`（常驻不收起），其下 `AppHeader` 接 `:top-offset`（首页 64 / 其余 0）。
- **主页右侧「首页/百宝箱/生涯规划图谱/大数据对比/专家咨询预约」在 `components/TopToolBar.vue .tt-link`**；`config/navigation.ts` 只是纯菜单数据，**不含任何样式**。
- 顶部品牌区（11-10）：`.top-toolbar` 高 64px；`.tt-grid` 的 `max-width:2200px;margin:0 auto` 只在 >2200px 生效，普通屏留白全来自 `padding:0 24px`。`.tt-logo` 36→48px、`.tt-brand{margin-left:-16px}` 单独贴合，勿全局去 padding。

## ★ 收藏模块契约（11-12 起，4 个模块已统一）
- **targetType 一一对应独立表，ID 空间不重叠，禁止复用**：university / major(本科) / **postgrad_major(考研, t_postgrad_major)** / city / competition / certificate / enterprise / industry / file_info。复用会两边串数据。
- **后端新增一种收藏 = 3 处**（无注册表要改，Spring 自动收集 `FavoriteTargetValidator` Bean）：① `FavoriteTargetType` 加枚举；② 新建 `service/impl/favorite/target/XxxFavoriteValidator`（参照 `MajorFavoriteValidator`，按 id + status=1 校验）；③ 对应 `XxxServiceImpl.page()` 加 ids 过滤（`BasePageQueryDTO` 已自带 `ids`，`@Size(max=200)`；空集合直接返回空页避免 `IN ()`）。`t_member_favorite.target_type` 是 VARCHAR(32) 无 CHECK，**无需 DB 迁移**。
- **ids = 收藏上限 200**（`BasePageQueryDTO.ids @Size(max=200)`）；前端 `/favorite/list` 单次 size ≤100 → 取 2 页取满 200 截断 + 超量提示。
- **前端收藏 UI 统一形态**：列表卡片右上角 36px 放大星标（灰星→黄星填充，`@click.stop` 避开整卡跳转）；工具栏「查看收藏/收藏中」黄色 toggle（`#FBBF24→#F59E0B`，999px 圆角，开启态加深+内凹）；详情页在 Hero 元数据/名称行末尾追加琥珀底高亮收藏药丸。未登录统一走全站 `confirmLogin()`。
- **列表页 toggle 的两个坑**：① `major/List.vue` 的 `query` 是复用 reactive 对象 → 退出收藏视图必须 `delete query.ids`；`university`/`postgrad` 每次新建 params 无此问题。② 收藏视图内取消收藏要立即移除并刷新当前页（末页仅剩 1 条时回退一页）。
- **`PostgradMajorCard.vue` 根元素是 `<button>` → 改 `<div role="button" tabindex="0">`**（button 内不能嵌套 button），补 Enter/Space 键盘可达。
- ★ **`PostgradMajorDetailVO` 无 id 字段** → 详情页收藏 targetId 取 `route.params.id`。
- 已落地：文件（fileload）、院校（university）、本科专业（major）、考研专业（postgrad_major）。前端 typecheck 全绿；后端待本地编译+重启。

## 专业模块页面结构（11-11~11-12 重构）
- `views/major/Detail.vue` 只取数/编排；12 子组件 + `utils.ts` + `detail.css` 在 `views/major/detail/`，页面级 CSS 全由 `.page-major-detail` 限定。
- **考研专业详情已改独立页面** `/postgrad-major/:id`（`PostgradDetail.vue` + `postgrad-detail/` 8 组件）；`PostgradMajorDialog.vue` 已删除。根节点并列挂 `class="page-postgrad-detail page-postgrad-list"` + `import './postgrad/postgrad.css'` 零改动复用列表页通用类（代价：根类名带列表页语义）。
- **数据契约**：`PostgradMajorDetailVO` 13 字段全必填、**不含 id / 不含热度数值**；`examSubjects`/`admissionRequirements` 是**扁平 string[]**（切勿按关键词猜分组）。
- **URL 同步 8 键** `page/size/name/code/degreeType/disciplineCategory/popularity/difficulty`（靠 `buildQuery` 只写 8 键，**不要 `query:{}` 全量清空**）。`PostgradMajorQueryDTO` 无排序字段；门类枚举纯 HTTP `/discipline-categories`。
- **榜单 `size=5` 违反后端 `@Min(10)`** → 用 `size=10` + `slice(0,5)`；`HOT_INDEX_BY_RANK` 是固定展示值、非实时。
- **防糊交互策略**：列表页**启用** hover `translateY(-2px)`；详情页（本科 + 考研）**禁用**整卡位移，只用颜色/边框/箭头位移。三页刻意不同。
- 无「相关专业」接口：`/list` 支持 `majorCategory`、**不支持 `parentCategory`**。仓库 **eslint 未安装、无配置**，`pnpm lint` 不可用。

## 城市详情页（11-12 重构，无原型按经验）
- `views/city/Detail.vue` 只取数/编排；`views/city/detail/` 下 `utils.ts` + `city-detail.css` + 9 组件。页面级 CSS 由 `.page-city-detail` **自建**通用类（不跨模块挂 `.page-postgrad-list`）。`city/List.vue` / router / `index.css` 零改动。
- 「列表页 4 个快捷工具」是 `List.vue:223-228` 内联数组，**不是组件** → 详情页新建 `CityQuickToolsCard.vue` 复制 4 项（企业查询/行业分析/就业前景/AI智能分析占位）。
- `CityDetailVO` 29 字段全必填、13 个嵌套对象全是 `Record<string,any>`、**不含 id / cityIntro / coverImageUrl** → `detail/utils.ts` 用 `readNum/readText/readList` 安全读取。
- **单位口径**：`perCapitaGdp` 以 admin 端「万元」为权威；比率先判空再拼 `%`；`0` 合法。Hero 用 `picture/city/city-hero.png`（常量 `CITY_HERO_BG`）；**无 VIP 门禁**。

## 最近迭代（节选）
- 证书页批量导入（10-26）：`POST /api/v1/admin/certificate/import`。竞赛页（10-27）：`/import/main` + `/import/detail`。
- 首页 Hero 双栏重构（11-06，`6e7c6be`）：`components/home/hero/` 全套 + `hero.config.ts` 配置驱动；`useGlobalSearch`/`useColumnFocus`/`useLoopPausable`。
- 罗盘中心 logo（11-10）：`logo-main.png` 800×800 RGBA 透明底；白圆只是 CSS 壳已删，`.hf-center-logo` 44→**112px**。
- **罗盘节点左上角徽标 = `module.columns.length`**（子专栏数量），不是序号；`HeroModule.badge?: string` 可覆盖。
