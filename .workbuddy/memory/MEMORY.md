# 项目长期记忆（海枫前端 monorepo）

> 详细「已知坑」以仓库内 `AGENTS.md` 为权威（随仓库走、更全）。本文件只留跨会话高频要点 + AGENTS.md 之外的事实。

## 通用规范/环境速查
- 设计令牌：品牌主色 `#F97316`/`#FB923C`；admin 暖橙渐变+橙边卡片，user 纯白微灰卡。仅样式任务不动 `<script>`。
- 类型检查：`pnpm --filter @haifeng/admin|user typecheck`（bash 里 pnpm 失效，用 PowerShell 调 `D:\npm\npm-global\pnpm.cmd`）。
- **JVM 红线**：后端运行期禁止 `mvn clean`/IDE Rebuild（无 devtools，改写磁盘 class 撞车→NoClassDefFoundError）；改 Java 只能重启。
- `@haifeng/shared` 的 main/exports 指向 **src 源码**（非 dist），vite 直接打包源码；改 shared 后仍 `pnpm --filter @haifeng/shared build` 更新 .d.ts/tsbuildinfo。

## 高频已知坑索引（详见 AGENTS.md）
1. 新公开接口同步 `SecurityConfig.WHITE_LIST`（否则 401）。2. 分页 `size∈[10,100]`、`page≥1`。3. 就业模块前后端枚举对齐（@Pattern + DB CHECK 为权威）。4. 前端错误文案 `err.response?.data?.msg || err.message || 兜底`。5. MP 逻辑删除：`updateById` 排除 is_deleted。6. CORS `allowedMethods` 含 PATCH。7. 弹窗锁滚动抖动（已根治）。8. 列表 VO 返 `id` 主键。9. OSS 预签名 3.17.4 仅 `ResponseHeaderOverrides`。

## ★ 关键已根治坑（勿回退）
- **弹窗锁滚动抖动（2026-08-22）**：滚动容器在 `body{overflow-y:scroll;scrollbar-gutter:stable}`；勿加 `scrollbar-gutter`/`width:100%!important` 干预锁滚动。
- **详情页暖橙底（2026-08-17）**：`index.css` 全局 `.app-shell main>*,#app>*{background:transparent!important}` 透出 `#fff7ed` 画布。实心白卡/橙 Hero 须 scoped 加 `background:#fff!important`/`linear-gradient(...)!important`；根 div 不写背景。teleport 到 body 的弹窗 scoped `:deep()` 失效，需提权/非 scoped。
- **前端多端共享 localStorage token key 撞车（2026-08-25 真因）**：admin('/admin/')→`haifeng_admin_access_token`，user('/')→`haifeng_access_token`。出现「用户不存在/403+重登即好+本地正常生产炸+通知列表空」先怀疑此，而非后端 tokenVersion。改 shared 后必须 `pnpm --filter @haifeng/shared build`。
- **EP select/number 控件对齐（2026-10-20）**：`.el-select__selected-item` 会拉回隐藏输入框占行，规则只能挂 `.el-select__placeholder`；el-input-number 须显式 `.el-input{width:100%;min-width:0}`。EP 内部布局问题直接 playwright 测 DOM 勿盲改。
- **tokenVersion/VIP 实时（2026-08-25）**：会员权益授予/变更不得 bump tokenVersion（只安全事件才 bump）。VIP 实时靠 `AuthAspect.checkVip` 回退 DB。
- **入场动画必须「退出合成层」（2026-10-29，勿回退）**：`.reveal.revealed` 只写 `filter: blur(0)` + 常驻 `will-change` 会让整块容器永久位图化，在分数像素宽度（如 `.plan-card` 395.33px）下被双线性重采样 → **1px 发丝描边糊成 2px 灰雾、文字发虚**（首页矩阵视图曾中招）。规范：稳态用 `filter: none` / `transform: none`，`transitionend` 后补 `.is-settled{will-change:auto}`。另：含文字容器禁止 `hover: scale()`（含序号徽标），`active` 也只用阴影/位移表达。
- **首页 Hero 不自带背景层（2026-11-06）**：`views/home/index.vue` 的 `.bg-grid-aurora` 是 `position:fixed;inset:0` 全屏画布；Hero 内再放渐变/光斑会被自身矩形裁出硬边。`.hf-hero` 保持 `background:transparent`、无 `isolation`、无 deco/glow 层。
- **scoped CSS 类名笔误不报任何错**：重构 SFC 后必须 `git diff HEAD` 过一遍 CSS 选择器（曾把 `.gs-input-wrap` 写成 `.CCgs-input-wrap`，导航搜索胶囊整体塌陷，typecheck/build 全绿）。
- **交互按钮文字毛边专项（2026-11-09，勿回退）**：四次真凶 = ①`HfHeroCompass` 舞台常驻 `transform: scale(${scale})`（宽屏恒为 1，但 `scale(1)` 仍是变换节点，整棵罗盘文字永久位图化）→ `scale>=1` 写 `none`；②`compass-geometry.ts` 给含文字节点下发 scale → 改 `--hf-node-scale` 由 `::before` 消费；③`AppHeader` 常驻 `will-change:transform` + 纯白底上无收益的 `backdrop-filter` → 删（全站导航文字）；④全局按钮基类 + 各页 `:active scale` 共 31 处 → `transform:none`。标准落地见 AGENTS.md 铁律 6：**缩放只放 `::before` 纯装饰背景层，内容层 `position:relative;z-index:1` 且零 transform**；定位 `translate(-50%,-50%)` 改负 margin、`translateY(0)` 改 `none`、波浪错位改 `margin-top`。保留纯图片/纯装饰层 scale 合法。

## ★ 业务规则（2026-10-23 起）
- **游客档案/专业组查询**：游客填档案仅 localStorage(key `haifeng:guest-gaokao-archive`)；`Groups.vue` 用 `guestArchiveParams` 上行，已登录不传。`request.ts`：401 仅「有 token」算过期，游客无 token 直接 reject 原始 msg，禁弹「登录已过期」。
- **高考省份锁定**：登录用户首次保存档案后省份锁定（导航栏 + 档案表单 disabled）；游客随便切。锁状态单例 `useProvinceLock.ts`。
- **资料页（FileLoadPage）面向人群 = 单一 `stageFilter`**（2026-10-24 重构）：`STAGE_FILTER_OPTIONS` 平铺按钮行；`effectiveStage` 配置项返 `stageFilter`、否则返 `props.stage||route.query.stage`。URL 深链 `?stage=` 经 `syncFromQuery()` 校验预选。

## 导航/布局
- 导航断点：<768 汉堡 / 768~1700 桌面+更多 / ≥1700 完整菜单 / ≥2100 封顶留白。
- 吸顶条下拉（药丸式 el-select）统一隐藏 `.el-select__suffix` 向下箭头。
- 全局头部 `scrollY>8` 抽屉式收起；`composables/useAutoHideHeader.ts` 模块级单例，子条收起时 sticky `top` 收为 0。
- 顶部双层导航：`DefaultLayout` 首页渲染 `TopToolBar`(工具/账号, 常驻不收起)，其下 `AppHeader` 接 `:top-offset`（首页64/其余0）。`GlobalSearchBox` 纯胶囊（院校/城市/专业三分组），flex 链逐级 `flex:1;min-width:0` 传宽（勿用 `width:100%`）。资讯组 2026-10-24 已移除。

## git 红线
收尾必 commit；`git pull --rebase` 前确认 `git status` 干净。

## 最近迭代（节选）
- 证书页批量导入（2026-10-26）：`POST /api/v1/admin/certificate/import`，单文件入参、前端多选逐个上传、聚合 `ImportResultVO`。
- 竞赛页批量导入（2026-10-27）：`POST /api/v1/admin/competition/import/main` 与 `/import/detail` 两个端点，前端「导入主表/导入详情」两按钮 + 同一导入弹窗（`importMode` 切换端点与列头提示），复用证书页聚合结果展示与样式。列头：主表 sheet「竞赛主表」= 竞赛名称(必填)/竞赛级别/报名时间；详情表 5 个 sheet 均以竞赛名称关联主表（须已存在）。`ImportResultVO` 类型同时定义在 `types/certificate/certificate.ts` 与 `types/certificate/competition.ts`。
- 首页 Hero 双栏重构（2026-11-06，commit `6e7c6be`）：`components/home/hero/` 全套新组件 + `hero.config.ts` 配置驱动；`useGlobalSearch`（导航/Hero 共用逻辑）、`useColumnFocus`（focusRequest 单例 → 矩阵 `data-column-key` 高亮 / 图谱 `selectNodeByKey`）、`useLoopPausable`。矩阵高亮用 `@property --hf-snake-angle` + `conic-gradient` + `mask-composite:exclude` 做 2s 外侧流动边框（禁止缩放闪烁）。
- 文字毛边全库根治（2026-11-09）：34 文件 / +206 −84，覆盖 `views/home/**`、`components/home/hero/**`、全局 `index.css`、`AppHeader.vue`、user+admin 各页 `:active scale`。新增 `HfCompassNode/HfCompassChild/PlannerCard` 三套 `::before` 背景层实现；`tailwind.config.js` 的 scaleIn 改位移模板。两端 `vue-tsc --noEmit` 通过、`git diff --check` 干净。详见 `AGENTS.md` 第六节与当日日志。
- 主页杂志感试验（2026-11-09，两笔 commit `91a423f` + `7b303b4`）：**默认关闭**的 `?skin=editorial` 皮肤（localStorage `haifeng:home-skin`，`&warm=soft` 保守微暖档，`?skin=default` 清记忆），暖白 `#FAF9F5` + 降 radial 光晕 + 标题 `#1F1E1D`/600 + 正文 line-height 1.7 + 赭橙 `#D97757`；所有 CSS 挂 `.home-page.is-editorial`，关闭零残留。另独立一笔删掉 `index.css:1` 的 Geist 境外 CDN、字体基线改中文系统栈 + `system-ui`。**第一轮刻意不装任何 web font**（宋体细衬线易与上午根治的毛边冲突、FOUT 与零闪烁矛盾），字体试验留第二轮。注意 `AGENTS.md:62` 规定中性底色为冷调 Slate/Zinc，暖白目前只是主页试验、未升格为规范。**2026-11-10 已整体删除**：用户看过后定案冷白，`?skin=editorial` / `&warm=soft` / `?skin=default` / localStorage `haifeng:home-skin` 及全部 `.home-page.is-editorial` CSS 已从 `views/home/index.vue` 清除（704→601 行）；这些排版改动本就只挂在默认关闭的开关下，删除对默认页零视觉影响。字体与字重的权威规范见 `AGENTS.md` 第八节。
- **橙色小字对比度坑（2026-11-10，勿回退）**：`views/major/List.vue`「查看详情 →」发虚，核查**不是**合成层毛边复现（祖先链干净：`.hf-card` 稳态无 transform、Motion 只在 Hero/统计条）、**不是**分数字号（12px 整数、无 letter-spacing）。主因 `#f97316` 白底仅 **2.80:1**（AA 需 4.5:1），同卡黑字 10.35:1；新诱因是字重封顶后 `500` 从 Medium 变 Regular、笔画变细让既有缺陷显形。修法 = 文字态 `#c2410c`(5.18:1) / hover `#9a3412`(7.31:1) + 12→13px + 箭头描边 2，**刻意不加粗**；分页器 `background-color/border-color:#f97316` 保留（⚠️ `background-color:` 含 `color:` 子串，批量替换必须带断言）。规范见 `AGENTS.md` 第二节「橙色小字同理」。**「小字必然糊」是误解**，决定清晰度的是对比度 + 笔画粗细。
- 冷白定案 + 小字模糊根因（2026-11-09 晚，commit `91dbc2b`）：用户拍板**保持 `#f8fafc` 冷白、底色零改动**。别人「翻回冷白 / 改 tailwind 令牌 / 网格线换 slate / 换暖棕阴影」的建议基于「已全站暖白」的错误前提（暖白只在默认关闭的 `?skin=editorial` 里）；实测网格线本就是 `rgba(15,23,42,0.04)`、全库无暖棕卡片阴影、`index.css :root` 已有完整令牌，逐条证伪。截图 tagline 小字发虚真因 = `TopToolBar.vue` 的 `11.5px` 分数字号 + `#71717A` 浅色 + `0.01em` 小数间距 + 删 Geist 后回落微软雅黑，**换字体救不了、也不是合成层问题**；改 `12px / #52525B / letter-spacing:0`。全库 257 处 rem 字号中 **139 处（30 文件）落在分数 px**，本轮未批量改（可选第二批）。`logo-main.png` 800×800 显示 36×36，图片分辨率不是问题。**「切片多少」不是用户决策**：fontsource 已按 unicode-range 分片，浏览器只下用到的片；要定的是「装哪个 / 给谁用 / 几档字重」，小字应装黑体而非宋体。
- **B 档字体落地（2026-11-09 深夜，仅 user 端）**：装 `misans-webfont@4.3.1` + `@fontsource-variable/inter@5.3.0`（admin 零改动）。唯一真相 `--hf-font-sans`（`index.css :root`）= `'Inter Variable','MiSans',系统栈`；body / `--el-font-family` / Tailwind `sans` / TopToolBar / SiteFooter 全改为 `var(--hf-font-sans)` —— 原来三处硬编码不同栈才是「有的地方可以有的地方不可以」的真因（EP 2.13.7 的 `--el-font-family` 实测只定义、0 引用，组件多用 `font-family:inherit`）。`?font=system` → `html.font-system` 做 A/B，**该旧栈刻意不含 `'MiSans'`**（已被 @font-face 注册，写进去就命中 web font、开关失效）。
  - **族名坑（勿回退）**：分包 CSS 族名不统一（regular/bold = `MiSans`，medium = `MiSans Medium`，semibold = `MiSans Semibold` 且 weight 都写 400）→ 直接按 README 引会让 `font-weight:600` 匹配到 Bold 700。用 `apps/user/scripts/gen-misans-css.mjs`（`pnpm --filter @haifeng/user fonts:gen`）生成 `assets/styles/misans.css` 统一族名 + 正确 400/500/600/700、删 `local()`、url 改本地相对路径；**升级包必重跑**。
  - **合规**：MiSans 协议要求「在软件中特别注明使用了 MiSans 字体」，已写在 `SiteFooter.vue` 页脚 `.font-credit`，勿删。npm 的 Apache-2.0 只管分包代码，字体另受小米协议约束。
  - **成本**：753 分片 / 23.5 MB 进 dist；主 CSS 1,058 KB（gzip 269 KB），字体声明占 ~591 KB 源码 / ~140 KB gzip，是首屏必下的隐性成本。`font-display:swap` 首次有一次字形切换、缓存后无；刻意不做淡入以免毛边复发。
  - **验证 / 操作**：两端 typecheck 通过；Vite build 到全新目录成功（沙箱守卫会拦清空已有 dist）；产物 url 全为 `/assets/*.woff2`，无境外 CDN、无 node_modules 残留。**真实 dist 未更新，需本地重 build**。未改 `CircularGallery.vue` 的 WebGL Canvas 文字（JS `font:` 硬编码雅黑，不受 CSS 栈影响）。
  - **★ 字重二次修正（勿回退）**：装完字体后小字厚重、Hero 标题正常。根因 = 全库 1176 处 CSS 字重 **83% ≥500**（700:337/600:331/500:259/400:198）+ Tailwind `font-medium` 448 / `font-bold` 284 / `font-semibold` 205；系统栈只有 400/700 时中文 500/600 靠合成显不出，补齐四档真实字形后 11–17px 小字全部显形。规律：**800/900 全是 ≥24px 大标题**（用户认可），600/700 集中在导航/筛选标签/文件列表等小字。修法只改 `gen-misans-css.mjs` 的 `WEIGHT_MAP`：`regular→'400 500'`(Regular)、`medium→'600'`、`semibold→'700'`、`bold→'800 900'`(Bold 只给大标题)。零改组件；dist 体积、753 个 URL、分片数不变，仅 CSS 4 个数字；重跑 `fonts:gen` 生效，改回原映射即可 A/B。静态字体 `font-weight` 范围声明合法（CSS Fonts 4），不插值/不合成。若仍嫌重可把 600 并入 Regular（`'400 600'`）。
  - **★ 字重第三轮封顶（勿回退，用户「除导航栏 / Hero 左标题外全部降低」+ 不想以后逐模块调）**：`gen-misans-css.mjs` 改成 `FACE_SPECS` 输出**双族名**：`MiSans`（默认 `--hf-font-sans`：`100 600`→Regular / `700`→Medium / `800 900`→Semibold，**全站最重只到 Semibold**）+ `MiSans Display`（`100 900`→Bold，仅 `--hf-font-strong`）。例外 3 处：`HfHeroSection.vue .hf-title`、`AppHeader.vue .nav-link`、`TopToolBar.vue .tt-brand-title` 加 `font-family: var(--hf-font-strong)`；`index.css :root` 定义变量，**`html.font-system` 必须同步 `--hf-font-strong: var(--hf-font-sans)`**，否则 `?font=system` 仍加载 Bold。**业务 CSS 1176 处字重声明一处未改**，以后任何模块写 800/900 都不会厚重；调字重只改 `FACE_SPECS`，调例外只改那 3 处引用。资料页 800 标题→Semibold、罗盘 700→Medium。体积 / 753 URL / 23.5 MB dist 与前一轮完全相同。**2026-11-10 更新**：用户随后要求「导航栏字重再小一点，小 100」→ 例外减为 **2 处**（删 `.nav-link` 的 `--hf-font-strong` 引用 + `700→600` → Regular，品牌名/Hero 左标题 800 仍 Bold）。★ **`MiSans Display` 是单字形族（`100 900` 只有 Bold），挂它时改 `font-weight` 数字完全无效，必须先摘引用再调数字**；详见 `AGENTS.md` 第八节。
  - **Google Fonts 兼容结论**：技术上兼容（字体栈按字符逐个回退，西文走它、中文自动回退 MiSans），但国内 `fonts.googleapis/gstatic` 不稳、上午刚删境外 CDN，且**只对西文有效、救不了中文厚重**（那是字重问题）。正确做法用 `@fontsource-variable/*` 本地包（实测 manrope / dm-sans / plus-jakarta-sans 均 5.3.0 可用）+ `main.ts` import，勿用 `<link>`；换西文字体 ≠ 修字重。
