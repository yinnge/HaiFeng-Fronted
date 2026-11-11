# 项目长期记忆（海枫前端 monorepo）

> **权威规范 = 仓库内 `AGENTS.md`**（随仓库走、更全）。本文件只留跨会话高频要点与 AGENTS.md 之外的事实；逐日细节见 `.workbuddy/memory/YYYY-MM-DD.md`。2026-11-10 已精简去重。

## 环境 / git
- 类型检查 `pnpm --filter @haifeng/admin|user typecheck`；bash 里 pnpm 失效 → PowerShell 调 `D:\npm\npm-global\pnpm.cmd`。
- 品牌主色 `#F97316`/`#FB923C`；admin 暖橙渐变+橙边卡片，user 冷白微灰卡；仅样式任务不动 `<script>`。
- **JVM 红线**：后端运行期禁 `mvn clean` / IDE Rebuild（无 devtools，改写磁盘 class 撞车 → NoClassDefFoundError），改 Java 只能重启。
- `@haifeng/shared` 的 main/exports 指向 **src 源码**（非 dist），改后仍跑 `pnpm --filter @haifeng/shared build` 更新 .d.ts。
- 收尾必 commit；`git pull --rebase` 前确认 `git status` 干净。Vite build 验到全新目录（沙箱守卫拦清空已有 `dist/assets`），**真实 dist 需本地重 build**。产物核对要按时间戳取最新 CSS —— 验证目录是累积的，`grep -l | head -1` 会取到旧文件。

## 高频已知坑索引（详见 AGENTS.md 第一节）
1. 新公开接口同步 `SecurityConfig.WHITE_LIST`（否则 401）2. 分页 `size∈[10,100]`、`page≥1` 3. 就业枚举以 DTO `@Pattern` + DB CHECK 为权威 4. 错误文案 `err.response?.data?.msg || err.message || 兜底` 5. MP `updateById` 排除 `is_deleted`，禁用=软删 / 删除=物理删 6. CORS `allowedMethods` 含 PATCH 7. 弹窗锁滚动抖动（已根治）8. 列表 VO 返 `id` 主键 9. OSS 预签名 3.17.4 仅 `ResponseHeaderOverrides`。

## ★ 勿回退（视觉 / 交互）
- **弹窗锁滚动抖动**：`body{overflow-y:scroll;scrollbar-gutter:stable}` + `body.el-popup-parent--hidden{width:100%!important}`；勿删或换别的补偿。
- **详情页暖橙底**：全局 `.app-shell main>*,#app>*{background:transparent!important}` 透出 `#fff7ed`；实心白卡/橙 Hero 须 scoped `background:…!important`；teleport 到 body 的弹窗 scoped `:deep()` 失效。
- **token key 撞车**：admin `/admin/`→`haifeng_admin_access_token`，user `/`→`haifeng_access_token`。「用户不存在 / 403 + 重登即好 / 通知列表空」先查这个。
- **tokenVersion/VIP**：会员权益变更不得 bump tokenVersion；VIP 实时靠 `AuthAspect.checkVip` 回退 DB。
- **EP 控件对齐**：`.el-select__selected-item` 会拉回隐藏输入框占行，规则只挂 `.el-select__placeholder`；el-input-number 须 `.el-input{width:100%;min-width:0}`。
- **入场动画必须退出合成层**：`.reveal.revealed` 稳态 `filter:none` / `transform:none` + `.is-settled{will-change:auto}`，否则常驻位图化 → 发丝边糊成灰雾、文字发虚。含文字容器禁 `hover/active: scale()`；缩放只放 `::before` 纯装饰层，定位改负 margin。纯图片/装饰层 scale 合法。
- **文字毛边根治（11-09）**：四真凶 = 罗盘舞台常驻 `scale(1)`、给含文字节点下发 scale、`AppHeader` 常驻 `will-change` + 无收益 `backdrop-filter`、全库 31 处 `:active scale`。详见 AGENTS.md 第六节铁律 6。
- **Hero 不自带背景层**：`.bg-grid-aurora` 是全屏 fixed 画布，`.hf-hero` 保持透明、无 isolation / deco / glow。
- **scoped CSS 类名笔误零报错**：重构 SFC 后必过一遍 `git diff HEAD` 的 CSS 选择器（typecheck/build 全绿也查不出）。
- **橙色小字对比度（11-10）**：`#f97316` 白底仅 2.80:1（AA 需 4.5:1），文字态一律 `#c2410c`(5.18:1) / hover `#9a3412`(7.31:1) + 取整字号，**不要靠加粗掩盖**；品牌橙保留给实心背景/描边/图标/大字。⚠️ `background-color:` 含 `color:` 子串，批量替换必须带断言。
- **「小字必然糊」是误解**：清晰度由对比度 + 笔画粗细决定。tagline 那次真因 = `11.5px` 分数字号 + `#71717A` 浅色 + `0.01em` 小数间距，换字体救不了。全库 257 处 rem 字号中 139 处（30 文件）落分数 px，未批量改。

## ★ 字体 / 字重定案（权威见 AGENTS.md 第八节）
- 仅 **user 端**：`misans-webfont@4.3.1` + `@fontsource-variable/inter@5.3.0`，自托管、零境外 CDN。唯一真相 `--hf-font-sans` = `'Inter Variable','MiSans',系统栈`；body / `--el-font-family` / Tailwind sans / TopToolBar / SiteFooter 全引用它。`?font=system` → `html.font-system`（旧栈刻意不含 `'MiSans'`）。admin 零改动。
- `apps/user/scripts/gen-misans-css.mjs`（`pnpm --filter @haifeng/user fonts:gen`）生成 `misans.css`：**升级包必重跑**。修的是分包族名不统一（medium/semibold 独立族名且 weight 写 400）+ 删 `local()` + url 本地化。
- **`FACE_SPECS` 双族名封顶**：`MiSans` = `100 600`→Regular / `700`→Medium / `800 900`→Semibold（全站最重）；`MiSans Display` = `100 900`→Bold，只给 `--hf-font-strong`。**例外现为 2 处**：`HfHeroSection .hf-title`(800)、`TopToolBar .tt-brand-title`(800)。`html.font-system` 必须同步覆盖 `--hf-font-strong`。
- ★ **`MiSans Display` 是单字形族**：挂它时改 `font-weight` 数字**完全无效**，必须先删 `font-family: var(--hf-font-strong)` 再调数字。
- 业务 CSS **1176 处字重声明一处未改**；调全站轻重只改 `FACE_SPECS`，调例外只改那 2 处引用。753 分片 / 23.5 MB dist / 主 CSS gzip 269 KB；`font-display:swap` 首次一次字形切换，刻意不做淡入以免毛边复发。
- **合规义务**：MiSans 协议要求注明使用，已写 `SiteFooter.vue` 页脚 `.font-credit`，勿删。
- Google Fonts 技术兼容但不用 `<link>`（国内不稳、只对西文有效）；要用 `@fontsource-variable/*` 本地包。
- **冷白定案**：画布保持 `#f8fafc`，`?skin=editorial` 试验皮肤及全部暖白 CSS 已整体删除（11-10），零残留。别再接受「翻回冷白 / 改 tailwind 令牌 / 网格线换 slate / 换暖棕阴影」这类基于错误前提的建议。
- **11-10 晚导航加深**：`AppHeader .nav-link` → `#111827` / 700，`TopToolBar .tt-link` + `.tt-mobile-link` → `#18181B` / 700（Medium，仍比最初 Bold 细）；激活态靠橙字 + 橙底 + 下划线区分，不叠加字重。

## 业务规则
- **游客档案/专业组**：游客档案仅 localStorage `haifeng:guest-gaokao-archive`；`Groups.vue` 用 `guestArchiveParams` 上行，已登录不传。`request.ts` 401 仅「有 token」算过期。
- **高考省份锁定**：登录用户首次保存档案后锁定（导航 + 表单 disabled），游客随便切；单例 `useProvinceLock.ts`。
- **资料页面向人群 = 单一 `stageFilter`**：`STAGE_FILTER_OPTIONS` 平铺按钮行，`?stage=` 深链经 `syncFromQuery()` 校验预选。

## 导航 / 布局
- 断点 4 档：<768 汉堡 / 768~1700 桌面+更多 / ≥1700 完整菜单 / ≥2100 封顶留白。药丸 el-select 隐藏 `.el-select__suffix` 箭头。
- `scrollY>8` 抽屉式收起（`composables/useAutoHideHeader.ts` 模块级单例）；顶部双层：`DefaultLayout` 首页渲染 `TopToolBar`（常驻不收起），其下 `AppHeader` 接 `:top-offset`（首页 64 / 其余 0）。`GlobalSearchBox` flex 链逐级 `flex:1;min-width:0`。
- **主页右侧「首页/百宝箱/生涯规划图谱/大数据对比/专家咨询预约」在 `components/TopToolBar.vue .tt-link`**，不在 `views/home/components`；`config/navigation.ts` 只是纯菜单数据（label/route/subItems/inactiveQuery），**不含任何样式**。

## 专业详情页（11-11 重构）
- `views/major/Detail.vue` 只取数/编排；12 个子组件 + `utils.ts` + `detail.css` 在 `views/major/detail/`，页面级 CSS 全部由 `.page-major-detail` 限定；不改 `index.css` / `List.vue` / router。
- **考研方向**返回 `PostgradMajorDirectionBriefVO{id,postgradMajorName,category?}`（不是 `UndergraduateMajorDirectionBriefVO`），**无详情路由**，点击开 `PostgradMajorDialog` 弹窗；**竞赛 + 考研方向都是 VIP 门禁**；竞赛 VO 字段 `competitionId/competitionName`。
- 无「相关专业」接口：`/list` 支持 `majorCategory`、**不支持 `parentCategory`**；`MajorRateRing` 的 rate 是 0–100 且 null 自显 `—`，复用时父层接管空态。仓库 **eslint 未安装、无配置**，`pnpm lint` 不可用。
- 防糊：本页可点击项只用颜色/边框/箭头位移反馈，**不启用 hover translateY 位移**。

## 考研专业列表页（11-11 重构）
- `views/major/PostgradList.vue` 只取数/编排；7 组件 + `utils.ts` + `postgrad.css` 在 `views/major/postgrad/`，页面级 CSS 由 `.page-postgrad-list` 限定。
- **考研专业详情无路由**，列表/榜单行点击开 `PostgradMajorDialog` 弹窗（与本科专业详情、院校详情 Tab 共 3 处复用），别改 router-link。榜单 `size=5` 违反后端 `@Min(10)`，用 `size=10` + `slice(0,5)`；`HOT_INDEX_BY_RANK` 是固定展示值、非实时。
- URL 同步 8 键 `page/size/name/code/degreeType/disciplineCategory/popularity/difficulty`；`?majorId=` 深链来自首页工具箱 `MajorModule.vue:108`，清理只删该键（靠 `buildQuery` 只写 8 键实现），**不要 `query:{}` 全量清空**。
- `PostgradMajorQueryDTO` 无排序字段；门类枚举是纯 HTTP `/discipline-categories`，无静态候选；14 门类含「交叉学科」只写在 DESIGN.md，代码静态表是 13 个。
- DESIGN.md §0.3 指定的 `constants/planningTools.ts`、`components/PlanningToolsCard.vue`、`views/major/utils.ts` **均不存在**；真实共享物是 `detail/components/utils.ts` 的 `HERO_BG_URL` / `TONE_COLORS` / `getDisciplineIcon`。
- 本页**启用** hover `translateY(-2px)`（Q10），专业详情页**禁用**；两页刻意不同。

## 最近迭代（节选）
- 证书页批量导入（10-26）：`POST /api/v1/admin/certificate/import`。竞赛页（10-27）：`/import/main` + `/import/detail` 两端点、同一弹窗 `importMode` 切换；列头见当日日志。
- 首页 Hero 双栏重构（11-06，`6e7c6be`）：`components/home/hero/` 全套 + `hero.config.ts` 配置驱动；`useGlobalSearch` / `useColumnFocus` / `useLoopPausable`；矩阵高亮用 `@property --hf-snake-angle` + conic-gradient + mask-composite。
- 罗盘中心 logo（11-10）：`logo-main.png` 是 800×800 **RGBA，四角 alpha=0、71% 像素全透明**；白圆只是 `HfHeroCompass.vue .hf-center` 的 CSS 壳，已删（无 background / border / radius / shadow），`.hf-center-logo` 44→**112px** 占满原圆圈尺寸，`centerStyle` 的入场/展开 scale 保留（纯图片层合法）。图片自带透明留白，可见枫叶约占画布 67%×81%，若要枫叶本身撑满圆圈可再放大到 128~136px。
- **罗盘节点左上角徽标 = `module.columns.length`（子专栏数量），不是序号**；两个模块都显示 2 是「恰好都含 2 个专栏」。`HeroModule.badge?: string` 可覆盖文案（初高中 11-10 设为 `'1'`），徽标色由 CSS `var(--m-color)` 按模块注入，与文案无关。
- 顶部品牌区（11-10）：`.top-toolbar` 高 64px / `padding:0 24px`；`.tt-grid` 的 `max-width:2200px;margin:0 auto` **只在 >2200px 生效**，普通屏的左右留白全来自前者。**左右 padding 不限制 logo 尺寸，上限是 64px 高度** → `.tt-logo` 36→48px、`.tt-brand{margin-left:-16px}` 单独贴合，勿全局去 padding（会让搜索框与右侧菜单一起贴边）。tagline 与品牌名间距由 `.tt-brand-sub{margin-top:3px}` 控制，勿动 `.tt-brand-text{top:-2px}` 光学修正。
