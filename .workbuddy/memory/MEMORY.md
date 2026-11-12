# 项目长期记忆（海枫前端 monorepo）

> **权威规范 = 仓库内 `AGENTS.md`**（随仓库走、更全）。本文件只留跨会话高频要点；逐日细节见 `.workbuddy/memory/YYYY-MM-DD.md`。

## 环境 / git
- 类型检查 `pnpm --filter @haifeng/admin|user typecheck`；bash 里 pnpm 失效 → PowerShell 调 `D:\npm\npm-global\pnpm.cmd`。
- 品牌主色 `#F97316`/`#FB923C`；admin 暖橙渐变+橙边卡片，user 冷白微灰卡；仅样式任务不动 `<script>`。
- **JVM 红线**：后端运行期禁 `mvn clean` / IDE Rebuild（无 devtools → NoClassDefFoundError）；沙箱内更禁跑 `mvn`（Lombok 注解处理失效会写坏磁盘 `target/classes`）。改 Java 只能本地编译 + 重启。Java 语法校验用 `javac -proc:none -d <临时目录>`。
- `@haifeng/shared` 的 main/exports 指向 **src 源码**（非 dist），改后仍跑 `pnpm --filter @haifeng/shared build` 更新 .d.ts。
- 收尾必 commit；`git pull --rebase` 前确认 `git status` 干净。Vite build 验到全新目录（沙箱守卫拦清空已有 `dist/assets`），**真实 dist 需本地重 build**。产物核对按时间戳取最新 CSS。沙箱 safe-delete 会拦 `rm -rf` → 验证目录用 `mv` 移出仓库。**不要 `git add -A`**（并行任务共用文件，用 `git add <路径>` 或 `git apply --cached` hunk 级暂存）。
- 后端仓库在 `D:\exeProject\ideaProjects\Project-HaiFeng`（分支 PDF），非前端 monorepo 内。
- 环境：dev server 的 curl 502 是 http_proxy 拦截 → `curl --noproxy '*'`；后台进程用 Bash 工具 `run_in_background=true`；后端未运行时可**直连 PG**（`docker exec haifeng-postgres psql -U postgres -d haifeng`）取真实数据验证前端逻辑。

## 高频已知坑索引（详见 AGENTS.md 第一节）
1. 新公开接口同步 `SecurityConfig.WHITE_LIST` 2. 分页 `size∈[10,100]`、`page≥1` 3. 就业枚举以 DTO `@Pattern` + DB CHECK 为权威 4. 错误文案 `err.response?.data?.msg || err.message || 兜底` 5. MP `updateById` 排除 `is_deleted`，禁用=软删 / 删除=物理删 6. CORS 含 PATCH 7. 弹窗锁滚动抖动（已根治）8. 列表 VO 返 `id` 主键 9. OSS 预签名 3.17.4 仅 `ResponseHeaderOverrides` 10. C 端 VO 的 `Long` 雪花 ID 需 `@JsonSerialize(ToStringSerializer)`（60+ 处待办，竞赛/证书域已修）。

## ★ 勿回退（视觉 / 交互）
- **弹窗锁滚动抖动**：`body{overflow-y:scroll;scrollbar-gutter:stable}` + `body.el-popup-parent--hidden{width:100%!important}`；勿删或换别的补偿。
- **详情页暖橙底**：全局 `.app-shell main>*,#app>*{background:transparent!important}` 透出 `#fff7ed`；实心白卡/橙 Hero 须 scoped `background:…!important`；teleport 到 body 的弹窗 scoped `:deep()` 失效。
- **token key 撞车**：admin `/admin/`→`haifeng_admin_access_token`，user `/`→`haifeng_access_token`。
- **tokenVersion/VIP**：会员权益变更不得 bump tokenVersion；VIP 实时靠 `AuthAspect.checkVip` 回退 DB。
- **EP 控件对齐**：规则只挂 `.el-select__placeholder`（`.el-select__selected-item` 会拉回隐藏输入占行）；el-input-number 须 `.el-input{width:100%;min-width:0}`。
- **入场动画必须退出合成层**：稳态 `filter:none`/`transform:none` + `.is-settled{will-change:auto}`；含文字容器禁 `hover/active: scale()`；缩放只放 `::before` 纯装饰层。
- **文字毛边四真凶**：罗盘舞台常驻 `scale(1)`、给含文字节点下发 scale、`AppHeader` 常驻 `will-change` + 无收益 `backdrop-filter`、全库 `:active scale`。
- **Hero 不自带背景层**：`.bg-grid-aurora` 是全屏 fixed 画布，`.hf-hero` 保持透明、无 isolation/deco/glow。
- **scoped CSS 类名笔误零报错**：重构 SFC 后必过一遍 `git diff HEAD` 的 CSS 选择器。
- **橙色小字对比度**：`#f97316` 白底仅 2.80:1 → 文字态一律 `#c2410c`(5.18:1) / hover `#9a3412`(7.31:1) + 取整字号，**不要靠加粗掩盖**；品牌橙保留给实心背景/描边/图标/大字。⚠️ `background-color:` 含 `color:` 子串，批量替换必须带断言。
- **冷白定案**：user 端画布保持 `#f8fafc`；`?skin=editorial` 与全部暖白 CSS 已整体删除（11-10）。别再接受「翻回暖白 / 改 tailwind 令牌」类建议。

## ★ 字体 / 字重定案（权威见 AGENTS.md 第八节）
- 仅 **user 端**：`misans-webfont@4.3.1` + `@fontsource-variable/inter@5.3.0`，自托管、零境外 CDN。唯一真相 `--hf-font-sans` = `'Inter Variable','MiSans',系统栈`；body / `--el-font-family` / Tailwind sans / TopToolBar / SiteFooter 全引用它。`?font=system` → `html.font-system`（旧栈刻意不含 MiSans）。admin 零改动。
- `apps/user/scripts/gen-misans-css.mjs`（`pnpm --filter @haifeng/user fonts:gen`）生成 `misans.css`：**升级包必重跑**。
- **`FACE_SPECS` 双族名封顶**：`MiSans` = `100 600`→Regular / `700`→Medium / `800 900`→Semibold；`MiSans Display` = `100 900`→Bold，只给 `--hf-font-strong`。**例外仅 2 处**：`HfHeroSection .hf-title`(800)、`TopToolBar .tt-brand-title`(800)。`html.font-system` 必须同步覆盖 `--hf-font-strong`。
- ★ **`MiSans Display` 是单字形族**：挂它时改 `font-weight` 数字**完全无效**，必须先删 `font-family: var(--hf-font-strong)`。
- 业务 CSS 字重声明一处未改；调全站轻重只改 `FACE_SPECS`。`font-display:swap` 首次一次字形切换，刻意不做淡入。
- **合规义务**：MiSans 协议要求注明使用，已写 `SiteFooter.vue` 页脚 `.font-credit`，勿删。

## 业务规则
- **游客档案/专业组**：游客档案仅 localStorage `haifeng:guest-gaokao-archive`；`Groups.vue` 用 `guestArchiveParams` 上行，已登录不传。`request.ts` 401 仅「有 token」算过期。
- **高考省份锁定**：登录用户首次保存档案后锁定（导航 + 表单 disabled），游客随便切；单例 `useProvinceLock.ts`。
- **资料页面向人群 = 单一 `stageFilter`**：`STAGE_FILTER_OPTIONS` 平铺按钮行，`?stage=` 深链经 `syncFromQuery()` 校验预选。
- **DB province / city_name 存裸字段**（北京 / 广西，无「省/市」后缀），UI 下拉必须匹配裸值。

## 导航 / 布局
- 断点 4 档：<768 汉堡 / 768~1700 桌面+更多 / ≥1700 完整菜单 / ≥2100 封顶留白。药丸 el-select 隐藏 `.el-select__suffix` 箭头。
- `scrollY>8` 抽屉式收起（`composables/useAutoHideHeader.ts` 模块级单例）；顶部双层：`DefaultLayout` 首页渲染 `TopToolBar`（常驻不收起），其下 `AppHeader` 接 `:top-offset`（首页 64 / 其余 0）。
- **主页右侧「首页/百宝箱/…」在 `components/TopToolBar.vue .tt-link`**；`config/navigation.ts` 纯菜单数据、无样式。
- 顶部品牌区：`.top-toolbar` 高 64px；`.tt-logo` 36→48px、`.tt-brand{margin-left:-16px}` 单独贴合，勿全局去 padding。

## ★ 收藏模块契约（11-12 起，多模块已统一）
- **targetType 一一对应独立表，ID 空间不重叠，禁止复用**：university / major(本科) / postgrad_major(考研, t_postgrad_major) / city / competition / certificate / enterprise / industry / file_info。
- **后端新增一种收藏 = 3 处**（无注册表要改，Spring 自动收集 `FavoriteTargetValidator` Bean）：① `FavoriteTargetType` 加枚举；② 新建 `service/impl/favorite/target/XxxFavoriteValidator`（按 id + is_deleted=false 校验）；③ 对应 `XxxServiceImpl.page()` 加 ids 过滤（`BasePageQueryDTO` 已自带 `ids`，`@Size(max=200)`；空集合直接返回空页避免 `IN ()`）。`t_member_favorite.target_type` 是 VARCHAR(32) 无 CHECK，**无需 DB 迁移**。
- **ids = 收藏上限 200**；前端 `/favorite/list` 单次 size ≤100 → 取 2 页取满 200 截断 + 超量提示。
- **前端收藏 UI 统一形态**：列表卡片右上角 36px 放大星标（灰星→黄星填充，`@click.stop` 避开整卡跳转）；工具栏「查看收藏/收藏中」黄色 toggle（`#FBBF24→#F59E0B`，999px 圆角，开启态加深+内凹）；详情页在 Hero 元数据行末尾追加琥珀底收藏药丸。未登录统一走 `confirmLogin()`。
- **列表页 toggle 的两个坑**：① `major/List.vue` 的 `query` 是复用 reactive 对象 → 退出收藏视图必须 `delete query.ids`；其它页每次新建 params 无此问题。② 收藏视图内取消收藏要立即移除并刷新当前页（末页仅剩 1 条时回退一页）。
- **卡片根元素含收藏按钮时不能用 `<button>`** → 用 `div[role="button" tabindex="0"]` + Enter/Space。
- 已落地：文件 / 院校 / 本科专业 / 考研专业 / 竞赛 / 证书 / **企业**。

## ★ 列表页重构统一范式（11-11~11-12 已固化，竞赛/证书/考研/城市均照此）
- `views/xxx/List.vue` **只做取数与编排**；展示拆到 `views/xxx/components/`（Hero / SearchCard / Card / Skeleton / ToolsCard / utils.ts）；页面级 CSS 为 `views/xxx/xxx.css`，**全部选择器由 `.page-xxx-list` 限定**，不复用别的页的 css 文件。
- **类名前缀必须全库唯一**：postgrad=`pg-`、competition=`cp-`、certificate=`cert-`、city detail=`ct-`（**已被城市详情页占用**）。改前缀前务必查产物 CSS 是否两 chunk 都含该前缀。
- **Hero**：背景图走 JS 内联 `url(${HERO_BG_URL})` 注入 `--hero-bg-url`，**不进 CSS 产物**（中文路径）。`HERO_BG_URL` 复用 `views/major/detail/components/utils.ts`（= `picture/university/列表背景.png`）。Hero **不挂 hf-card**（避免 background:#fff 覆盖多层背景）。
- **色板**：`TONE_COLORS`（blue/amber/green/red/slate）+ `IconTone` 只读复用 `views/major/detail/components/utils.ts`。
- **图标**：统一 `lucide-vue-next`，`stroke-width="1.75"`；**严禁 Emoji**（AGENTS.md 第四节）。无正式映射表时用「关键词正则表 → 类别兜底 → 最终兜底」两级映射，集中放 `components/utils.ts`，业务方给正式表后**只替换该数组**。
- **在线工具栏**：`components/utils.ts` 导出 `XXX_TOOLS`（`{key,label,icon,tone,to?,action?:'coming'|'expert',soon?}`）+ `ToolsCard.vue` 组件；`to` 用 `RouterLink`，coming 项 `ElMessage.info('敬请期待',{grouping:true})`，专家项 `useExpertContact.open()`。
- **URL 同步**：只写已知 key（`buildQuery` 只写非默认值），靠 `stableQueryString` + `lastWrittenQuery` 防 watch 循环；**不要 `query:{}` 全量清空**（会误伤用户筛选）。深链键只删自己那一个。
- **列表接口分页 size 必须 ∈[10,100]**；榜单 `size=5` 违反 `@Min(10)` → 用 `size=10` + `slice(0,5)`。
- **卡片网格**：postgrad/竞赛/证书列表左栏均 **2 列**；用户要求企业页 **3 列**（需确认窄屏断点）。
- **防糊交互**：列表页**启用** hover `translateY(-2px)`；详情页（本科+考研）**禁用**整卡位移，只用颜色/边框/箭头位移。
- **热门榜**：后端无 hot 字段时只能取列表头部近似，且热度值是固定展示常量（`HOT_INDEX_BY_RANK`，非实时）。
- 无「相关专业」类接口时不要硬凑；仓库 **eslint 未安装、无配置**，`pnpm lint` 不可用。
- ★★ **ElDialog 样式作用域（通用陷阱，已踩）**：Dialog `inheritAttrs:false`，用户传的 `class` 经 `$attrs` 合并到 **`.el-dialog` 根元素自身** → scoped 的 `.xxx :deep(.el-dialog)` 编译成后代选择器，**同元素非后代 → 永远匹配不到（死规则，零报错）**；且弹框 teleport 到 body，已脱离 `.page-xxx` 子树，**页面级限定选择器同样命中不了**。**正确做法**：独立**全局唯一类名**写进页面级 CSS（与 `.certificate-select-popper` / `.cert-detail-dialog` 同一策略），写 `.xxx.el-dialog{...}`（同元素）而非 `.xxx .el-dialog{...}`。
- ★★ **标签配色前先查 DB 实际取值**：别凭"字段是 VARCHAR 就没有 CHECK"就断定取值不封闭 —— **实测往往只有 4~9 个值**（证书 `cert_level` 4 个、`category` 9 个，均为封闭集合）→ 可放心做「值→色」映射，比固定一套色信息量大得多。查法：`docker exec haifeng-postgres psql -U postgres -d haifeng -c "SELECT col, count(*) FROM t_x GROUP BY col"`。

## 页面结构速查（详见各自 daily log）
- **竞赛**：`views/competition/`（List 冷白 / detail 暖橙 Hero，detail 右栏=报名卡→流程→获奖→专业→工具→收口条，Tab 进 URL）。列表 VO 仅 4 字段 `id/compName/compLevel/registrationTime`；`comp_level` 是**无 CHECK 自由 VARCHAR** → 下拉动态聚合；`registrationTime` 是**自由文本**不能当日期。`t_competition_major` **0 行**；`/competition/{id}/majors` 是 `@RequireVip` **只认 vip**。
- **证书**：`views/certificate/`（列表 6 组件 + `certificate.css` + `components/utils.ts`；详情**弹框**已重做 `CertificateDetailDialog.vue`）。C 端列表**只有** `category`(精准)+`certName`(模糊) 两筛选，无排序参数（后端硬编码 `sort_order DESC, created_at DESC`）。★ **DB 实测 t_certificate 275 行**：`cert_level` 仅 **4 个封闭值**（不分等级 88/中级 64/初级 63/高级 60）、`category` 仅 **9 个封闭值**（职场通用类/管理类/计算机类/财经类/工程建筑类/教育类/语言类/医学健康类/法律类）→ **已改按值映射**（级别：初级=绿/中级=蓝/高级=黄/不分等级=slate），列表卡片与弹框**共用 utils.ts 同一函数**同步生效，未收录取值回退 slate。★ **`exam_fee` 275/275 全 NULL** 且后端 `jackson.default-property-inclusion: non_null` → **该键在 JSON 中整个不存在**（不是 null），前端 `examFee?: number` 可选，**卡片与弹框均不展示费用格**。文本列都很短（`cert_intro` ≤27 字）→ 无需折叠/滚动。
- **城市详情**：`views/city/detail/`（9 组件 + `city-detail.css`，`.page-city-detail` 自建通用类，不跨模块挂 postgrad 类）。`CityDetailVO` 29 字段、13 个嵌套对象全是 `Record<string,any>`、**不含 id/cityIntro/coverImageUrl** → 用 `readNum/readText/readList` 安全读取。
- **企业**：`views/enterprise/`（List 尚未重构，2026-11-12 待做）。后端 `EnterpriseListVO` 11 字段含 `id`，**不含 recruitmentStatus**（DB 有列但 VO 未映射）；`t_enterprise` 2373 条、**100% 无 logo**（logo_url 全空）、`recruitment_status` 全为「招聘中」、`sort_order` 全 0（排序实际=created_at DESC）；`enterprise_nature` 有 DB CHECK（央企/国企/民企/外企/合资）；`enterprise_type` 13 个 DISTINCT 值（走 `/enterprise/types` 接口）；`t_enterprise_industry` **0 行** 且 `/enterprise/industries` 是 `@RequireVip` → **卡片不可展示行业标签**；**无 `/enterprise/:id` 路由**，只有 `/enterprise/:id/positions`（requiresAuth）。

## 最近迭代（节选）
- 证书页批量导入（10-26）：`POST /api/v1/admin/certificate/import`。竞赛页（10-27）：`/import/main` + `/import/detail`。
- 首页 Hero 双栏重构（11-06，`6e7c6be`）：`components/home/hero/` 全套 + `hero.config.ts` 配置驱动。
- 罗盘中心 logo（11-10）：`logo-main.png` 800×800 RGBA；`.hf-center-logo` 44→**112px**。罗盘节点左上角徽标 = `module.columns.length`（子专栏数量）。
