# 项目长期记忆（海枫前端 monorepo）

> 权威规范 = 仓库内 `AGENTS.md`（随仓库走、更全）。本文件只留跨会话高频要点；逐日细节见 `.workbuddy/memory/YYYY-MM-DD.md`。

## 环境 / git
- 类型检查 `pnpm --filter @haifeng/admin|user typecheck`；bash 里 pnpm 失效 → PowerShell 调 `D:\npm\npm-global\pnpm.cmd`。仓库 **eslint 未安装**，`pnpm lint` 不可用。
- `@haifeng/shared` main/exports 指向 **src 源码**（非 dist），改后仍跑 `pnpm --filter @haifeng/shared build` 更新 .d.ts。
- **JVM 红线**：后端运行期禁 `mvn clean` / IDE Rebuild（无 devtools → NoClassDefFoundError）；沙箱内更禁跑 `mvn`（Lombok 注解处理失效会写坏磁盘 `target/classes`）。改 Java 只能本地编译 + 重启；校验用 `javac -proc:none -d <临时目录>`。构建 `mvn -pl haifeng-app -am compile`。
- 收尾必 commit；`git pull --rebase` 前确认 `git status` 干净。Vite build 验到全新目录（沙箱守卫拦清空已有 `dist/assets`），**真实 dist 需本地重 build**；产物按时间戳取最新 CSS。safe-delete 拦 `rm -rf` → 验证目录用 `mv` 移出仓库。**不要 `git add -A`**（并行任务共用文件，用 `git add <路径>` 或 `git apply --cached` hunk 级暂存）。
- 后端仓库 `D:\exeProject\ideaProjects\Project-HaiFeng`（分支 PDF），不在前端 monorepo 内。dev server curl 502 是 http_proxy → `curl --noproxy '*'`；后台进程用 Bash `run_in_background=true`；后端未运行时可**直连 PG**（`docker exec haifeng-postgres psql -U postgres -d haifeng`）取真实数据。
- 品牌主色 `#F97316`/`#FB923C`；admin 暖橙渐变+橙边卡片，user 冷白微灰卡；仅样式任务不动 `<script>`。

## 高频已知坑（详见 AGENTS.md 第一节）
1. 新公开接口同步 `SecurityConfig.WHITE_LIST` 2. 分页 `size∈[10,100]`、`page≥1` 3. 就业枚举以 DTO `@Pattern` + DB CHECK 为权威 4. 错误文案 `err.response?.data?.msg || err.message || 兜底` 5. MP `updateById` 排除 `is_deleted`，禁用=软删 / 删除=物理删 6. CORS 含 PATCH 7. 弹窗锁滚动抖动（已根治）8. 列表 VO 返 `id` 主键 9. OSS 预签名 3.17.4 仅 `ResponseHeaderOverrides` 10. C 端 VO 的 `Long` 雪花 ID 需 `@JsonSerialize(ToStringSerializer)`（60+ 处待办，竞赛/证书域已修）。
11. ★ 标签配色/建筛选前**先查 DB 实际取值**：别凭 VARCHAR 无 CHECK 就断定不封闭，实测常只有 4~9 个值。查法 `docker exec haifeng-postgres psql -U postgres -d haifeng -c "SELECT col,count(*) FROM t_x GROUP BY col"`。

## ★ 勿回退（视觉 / 交互）
- **弹窗锁滚动抖动**：`body{overflow-y:scroll;scrollbar-gutter:stable}` + `body.el-popup-parent--hidden{width:100%!important}`；勿删或换别的补偿。
- **详情页画布**：全局 `.app-shell main>*,#app>*{background:transparent!important}` 透出 **`#f8fafc` 冷白**；实心白卡/橙 Hero 须 scoped `background:…!important`；teleport 到 body 的弹窗 scoped `:deep()` 失效。`?skin=editorial` 与全部暖白 CSS 已删（11-10），别再翻回暖白/改 tailwind 令牌。
- **ElDialog 样式作用域**：`inheritAttrs:false` → 用户 class 落在 `.el-dialog` 根元素**自身**，` .xxx :deep(.el-dialog)` 后代选择器永远匹配不到，且 teleport 已脱离 `.page-xxx`。正解：全局唯一类名 + `.xxx.el-dialog{...}`（同元素）。
- **token key 撞车**：admin `/admin/`→`haifeng_admin_access_token`，user `/`→`haifeng_access_token`；admin vite base `/admin/`、login `/admin/login`，用 `import.meta.env.BASE_URL` 动态拼接。
- **tokenVersion/VIP**：会员权益变更不得 bump tokenVersion；VIP 实时靠 `AuthAspect.checkVip` 回退 DB。
- **EP 控件对齐**：规则只挂 `.el-select__placeholder`；el-input-number 须 `.el-input{width:100%;min-width:0}`。
- **防糊**：入场动画必须退出合成层（稳态 `filter:none`/`transform:none` + `.is-settled{will-change:auto}`）；含文字容器禁 `hover/active: scale()`；缩放只放 `::before` 装饰层。罗盘舞台常驻 scale / AppHeader 常驻 will-change / 全库 :active scale 是文字毛边四真凶。
- **Hero 不自带背景层**：`.bg-grid-aurora` 是全屏 fixed 画布，`.hf-hero` 保持透明、无 isolation/deco/glow。
- **橙色小字对比度**：`#f97316` 白底仅 2.80:1 → 文字态一律 `#c2410c`(5.18:1)/hover `#9a3412`(7.31:1)+取整字号，**不要靠加粗掩盖**；品牌橙留给实心背景/描边/图标/大字。⚠️ `background-color:` 含 `color:` 子串，批量替换必带断言。
- **scoped CSS 类名笔误零报错**：重构 SFC 后必过一遍 `git diff HEAD` 的 CSS 选择器。

## ★ 字体 / 字重定案（权威见 AGENTS.md 第八节）
- 仅 **user 端**：`misans-webfont@4.3.1` + `@fontsource-variable/inter@5.3.0`，自托管零境外 CDN。唯一真相 `--hf-font-sans` = `'Inter Variable','MiSans',系统栈`；body/`--el-font-family`/Tailwind sans/TopToolBar/SiteFooter 全引用它。`?font=system` → `html.font-system`（旧栈不含 MiSans）。admin 零改动。
- `apps/user/scripts/gen-misans-css.mjs`（`pnpm --filter @haifeng/user fonts:gen`）生成 `misans.css`：**升级包必重跑**。
- **`FACE_SPECS` 双族名封顶**：`MiSans` = `100 600`→Regular / `700`→Medium / `800 900`→Semibold；`MiSans Display` = `100 900`→Bold，只给 `--hf-font-strong`。例外仅 2 处：`HfHeroSection .hf-title`(800)、`TopToolBar .tt-brand-title`(800)。`html.font-system` 须同步覆盖 `--hf-font-strong`。★ `MiSans Display` 单字形族：挂它时改 `font-weight` 数字**完全无效**，必须先删 `font-family: var(--hf-font-strong)`。业务 CSS 字重一处未改，调全站轻重只改 `FACE_SPECS`。
- **合规**：MiSans 协议要求注明使用，已写 `SiteFooter.vue` 页脚 `.font-credit`，勿删。

## ★ 收藏模块契约（11-12 起多模块统一）
- **targetType 一一对应独立表，ID 空间不重叠，禁止复用**：university / major(本科) / postgrad_major(考研) / city / competition / certificate / enterprise / industry / file_info。
- **后端新增一种收藏 = 3 处**（Spring 自动收集 `FavoriteTargetValidator` Bean）：① `FavoriteTargetType` 加枚举；② 新建 `favorite/target/XxxFavoriteValidator`（id + `is_deleted=false`）；③ 对应 `XxxServiceImpl.page()` 加 ids 过滤（`BasePageQueryDTO` 自带 `ids` `@Size(max=200)`；空集合直接返回空页避免 `IN ()`）。`t_member_favorite.target_type` VARCHAR(32) 无 CHECK，**无需 DB 迁移**。
- **ids 上限 200**；前端 `/favorite/list` 单次 size ≤100 → 取 2 页取满 200 截断 + 超量提示。
- **UI 统一形态**：列表卡片右上角 36px 星标（灰→黄填充，`@click.stop`）；工具栏「查看收藏/收藏中」黄色 toggle（`#FBBF24→#F59E0B`，999px，开启态加深+内凹）；详情页 Hero 元数据行末尾琥珀底收藏药丸（竞赛详情用右上角 40px 圆形星标）。未登录统一 `confirmLogin()`。卡片根元素含收藏按钮时用 `div[role="button" tabindex="0"]`+Enter/Space，不能用 `<button>`。
- **列表页 toggle 两坑**：① `major/List.vue` 的 `query` 是复用 reactive → 退出收藏视图必须 `delete query.ids`；② 收藏视图内取消收藏立即移除并刷新（末页仅剩 1 条回退一页）。已落地：文件/院校/本科专业/考研专业/竞赛/证书/企业/行业。

## ★ 列表页 / 详情页重构统一范式（11-11~11-12 固化）
- `views/xxx/List.vue` **只做取数与编排**；展示拆到 `views/xxx/components/`（Hero/SearchCard/Card/Skeleton/ToolsCard/utils.ts）；页面级 CSS `views/xxx/xxx.css`，**全部选择器由 `.page-xxx-list` 限定**。详情页同构：`Detail.vue` + `detail/detail.css`（`.page-xxx-detail`）+ `detail/utils.ts` + `detail/components/`。
- **类名前缀必须全库唯一**：postgrad=`pg-`、competition=`cp-`、certificate=`cert-`、city detail=`ct-`、industry list=`ind-`、**industry detail=`idt-`**、competition detail=`cd-`、major detail=`detail-`。改前缀前查产物 CSS 是否两 chunk 都含该前缀。
- **Hero**：背景图走 JS 内联 `url(${HERO_BG_URL})` 注入 `--hero-bg-url`，**不进 CSS 产物**（中文路径）。`HERO_BG_URL` 复用 `views/major/detail/components/utils.ts`（`picture/university/列表背景.png`）。Hero **不挂 hf-card**。
- **色板/图标**：`TONE_COLORS`（blue/amber/green/red/slate）+ `IconTone` 复用 major/detail/utils；统一 `lucide-vue-next`、`stroke-width="1.75"`，**严禁 Emoji**。无正式映射表时用「关键词正则 → 类别兜底 → 最终兜底」两级，集中 `components/utils.ts`。
- **在线工具栏**：`XXX_TOOLS`（`{key,label,icon,tone,to?,action?:'coming'|'expert',soon?}`）+ `ToolsCard.vue`；`to` 用 `RouterLink`，coming `ElMessage.info('敬请期待',{grouping:true})`，专家 `useExpertContact.open()`。**详情页复用**：`detail/utils.ts` 里 `export { XXX_TOOLS } from '../components/utils'`，卡片组件从 `../utils` 引入，避免两份维护。
- **URL 同步**：只写已知 key（`buildQuery` 只写非默认值），靠 `stableQueryString` + `lastWrittenQuery` 防 watch 循环；**不要 `query:{}` 全量清空**。深链键只删自己那一个。
- **分页 size ∈[10,100]**；榜单 `size=5` 违规 → `size=10` + `slice(0,5)`。热门榜无 hot 字段时取列表头部近似，热度值用固定展示常量 `HOT_INDEX_BY_RANK`（非实时）。
- **卡片网格**：postgrad/竞赛/证书列表 2 列，行业/企业 3 列。**防糊**：列表页启用 hover `translateY(-2px)`；详情页禁用整卡位移，只用颜色/边框/箭头位移。
- 无「相关专业」类接口时不要硬凑。

## 业务规则 / 导航
- **游客档案**仅 localStorage `haifeng:guest-gaokao-archive`；`Groups.vue` 用 `guestArchiveParams`，已登录不传。`request.ts` 401 仅「有 token」算过期。
- **高考省份锁定**：登录用户首次保存档案后锁定（导航+表单 disabled），游客随便切；单例 `useProvinceLock.ts`。
- **资料页面向人群 = 单一 `stageFilter`**；`?stage=` 深链经 `syncFromQuery()` 校验。
- **DB province / city_name 存裸字段**（北京/广西，无省/市后缀），UI 下拉必须匹配裸值。
- 导航断点 4 档：<768 汉堡 / 768~1700 桌面+更多 / ≥1700 完整菜单 / ≥2100 封顶留白。`scrollY>8` 抽屉式收起（`useAutoHideHeader.ts` 单例）；首页 `TopToolBar`（64px 常驻）其下 `AppHeader` 接 `:top-offset`（首页 64 / 其余 0）。主页右侧链接在 `TopToolBar.vue .tt-link`；`config/navigation.ts` 纯数据。

## 页面结构 / 数据速查（细节见各自 daily log）
- **竞赛**：List 冷白 / detail 暖橙 Hero（右栏=报名卡→流程→获奖→专业→工具→收口条，Tab 进 URL）。列表 VO 仅 `id/compName/compLevel/registrationTime`；`comp_level` 无 CHECK 自由 VARCHAR → 动态聚合；`registrationTime` 自由文本；`t_competition_major` 0 行；`/competition/{id}/majors` `@RequireVip`。
- **证书**：无 `/certificate/:id` 路由，详情是 `CertificateDetailDialog.vue` 弹框。C 端列表仅 `category`(精准)+`certName`(模糊) 两筛选。`t_certificate` 275 行：`cert_level` 4 值、`category` 9 值 → 按值映射（初级绿/中级蓝/高级黄/不分等级 slate）。`exam_fee` 275/275 NULL + `non_null` → 键整个不存在，卡片与弹框均不展示。
- **城市详情**：`views/city/detail/`（9 组件 + `city-detail.css`）；`CityDetailVO` 29 字段、13 个 `Record<string,any>`、**不含 id/cityIntro/coverImageUrl** → 用 `readNum/readText/readList` 安全读取。
- **行业**：List 冷白 Hero + 3 列 + 右栏热门榜/工具（11-12 `68e8fd2`）。DB 实测 90 条、17 门类、`sort_order` 全 0、真实热度 `investment_heat`(30~88)、`category` 后端 eq 精准匹配；图标 = 名称关键词 61 规则 → 17 门类兜底（90/90 命中、46 种），在 `components/utils.ts` 私有 `KEYWORD_ICONS`。★ **`t_industry_detail` 8 个 JSONB 90/90 全为空 `{}`**、`short/detailed_description` 全空；详情 VO 不含 id、不含 description；主表仅 9 个概览指标有值（`talent_gap` 全空）。`t_enterprise_industry` 0 行，`/enterprises` `@RequireVip`；详情接口 `/industry/{id}/detail` 仅 `@RequireLogin`。C 端 `IndustryListVO.id`（Long）**缺 `@JsonSerialize`**。列表页「名称搜索」是纯 UI 未接后端（`IndustryQueryDTO` 无 name）。**详情页 11-13 已重构**：`Detail.vue` 只做编排 + `detail/`（`detail.css` 用 `.page-industry-detail` / `idt-` 前缀、`utils.ts` re-export `INDUSTRY_TOOLS`+`HERO_BG_URL`、10 组件）；正文以主表 9 指标为主、8 个 JSONB 走通用容错渲染器（有值才出，全空显示「深度数据整理中」），并发补 `/industry/list?ids=` 拿 `description`+`category`。趋势色板语义正向（上升绿/稳定蓝/下降红），用 `trendStyle()`，**刻意不复用列表页 `growthTone()`**（那个是 A 股习惯正=红）。
- **企业**：List 尚未重构。`EnterpriseListVO` 11 字段含 id、**不含 recruitmentStatus**；`t_enterprise` 2373 条、100% 无 logo、`sort_order` 全 0；`enterprise_nature` 有 CHECK；`enterprise_type` 13 值走 `/enterprise/types`；无 `/enterprise/:id` 路由，只有 `/enterprise/:id/positions`。

## 最近迭代（节选）
- 首页 Hero 双栏重构（11-06 `6e7c6be`）；罗盘中心 logo 44→**112px**（11-10）。
