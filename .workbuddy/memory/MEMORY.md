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
