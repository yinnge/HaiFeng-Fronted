# 项目长期记忆（海枫前端 monorepo）

> 权威规范 = 仓库内 `AGENTS.md`（随仓库走、更全）。本文件只留跨会话高频红线；逐日细节见 `.workbuddy/memory/YYYY-MM-DD.md`。

## 环境 / git
- 类型检查 `pnpm --filter @haifeng/admin|user typecheck`；bash 里 pnpm 失效 → PowerShell 调 `D:\npm\npm-global\pnpm.cmd`。仓库 eslint 未装，`pnpm lint` 不可用。
- `@haifeng/shared` main/exports 指向 src 源码（非 dist），改后仍跑 `pnpm --filter @haifeng/shared build` 更新 .d.ts。
- JVM 红线：后端运行期禁 `mvn clean` / IDE Rebuild（无 devtools → NoClassDefFoundError）；沙箱内禁跑 mvn（Lombok 失效写坏 target/classes）。构建 `mvn -pl haifeng-app -am compile`，改 Java 只能本地编译 + 重启。
- 收尾必 commit；`git pull --rebase` 前确保 status 干净。Vite build 验到新目录（守卫拦清空旧 dist/assets），真实 dist 需本地重 build。禁 `git add -A`（并行任务共用文件），逐文件 / hunk 暂存。
- 后端仓库 `D:\exeProject\ideaProjects\Project-HaiFeng`（分支 PDF）。dev server curl 502 是 http_proxy → `curl --noproxy '*'`。后端未起可直连 PG：`docker exec haifeng-postgres psql -U postgres -d haifeng`。
- 品牌主色 #F97316/#FB923C；admin 暖橙渐变 + 橙边卡片，user 冷白微灰卡；仅样式任务不动 `<script>`。

## 高频已知坑（详见 AGENTS.md 第一节）
1. 新公开接口同步 `SecurityConfig.WHITE_LIST` 2. 分页 `size∈[10,100]`、`page≥1` 3. 就业枚举以 DTO `@Pattern` + DB CHECK 为权威 4. 错误文案 `err.response?.data?.msg || err.message || 兜底`（shared request 拦截器 reject `new Error(msg)`，无 `.response`）5. MP `updateById` 排除 `is_deleted`，禁用=软删 / 删除=物理删 6. CORS 含 PATCH 7. 弹窗锁滚动抖动（已根治）8. 列表 VO 返 `id` 主键 9. OSS 预签名 3.17.4 仅 `ResponseHeaderOverrides` 10. C 端 VO 的 Long 雪花 ID 需 `@JsonSerialize(ToStringSerializer)`。
11. ★ 标签配色 / 建筛选前先查 DB 实际取值（VARCHAR 无 CHECK 不代表不封闭，实测常 4~9 值）：`docker exec haifeng-postgres psql -U postgres -d haifeng -c "SELECT col,count(*) FROM t_x GROUP BY col"`。

## ★ 勿回退（视觉 / 交互）
- 弹窗锁滚动抖动：`body{overflow-y:scroll;scrollbar-gutter:stable}` + `body.el-popup-parent--hidden{width:100%!important}`。
- 详情页画布：全局 `.app-shell main>*,#app>*{background:transparent!important}` 透出 `#f8fafc`；实心白卡 / Hero 须 scoped `background:…!important`；teleport 弹窗 scoped `:deep()` 失效。`?skin=editorial` 与暖白 CSS 已删。竞赛 / 行业详情 Hero 一律冷白蓝（#eff6ff + 白渐变遮罩 + 背景图），暖橙只留竞赛右栏报名卡。
- ElDialog 作用域：`inheritAttrs:false` → 用户 class 落在 `.el-dialog` 自身，`.xxx :deep(.el-dialog)` 匹配不到；正解全局唯一类名 + `.xxx.el-dialog{...}`。
- token key：admin `/admin/`→`haifeng_admin_access_token`，user `/`→`haifeng_access_token`；admin vite base `/admin/`、login `/admin/login`，用 `import.meta.env.BASE_URL` 拼。
- tokenVersion/VIP：权益变更不得 bump tokenVersion；VIP 实时靠 `AuthAspect.checkVip` 回退 DB。
- EP 控件：规则只挂 `.el-select__placeholder`；el-input-number 须 `.el-input{width:100%;min-width:0}`。
- 防糊：入场动画必须退出合成层（稳态 `filter:none`/`transform:none` + `.is-settled{will-change:auto}`）；含文字容器禁 `hover/active: scale()`；缩放只放 `::before`。罗盘常驻 scale / AppHeader 常驻 will-change / 全库 :active scale 是四真凶。
- Hero 不自带背景层：`.bg-grid-aurora` 全屏 fixed 画布，`.hf-hero` 透明、无 isolation/deco/glow。
- 橙色小字对比度：`#f97316` 白底仅 2.80:1 → 文字态 `#c2410c`(5.18:1) / hover `#9a3412`(7.31:1) + 取整字号，不靠加粗；品牌橙留给实心背景 / 描边 / 图标 / 大字。⚠️ `background-color:` 含 `color:` 子串，批量替换必带断言。
- scoped CSS 类名笔误零报错：重构 SFC 后必过一遍 `git diff HEAD` 的 CSS 选择器。

## ★ 字体 / 字重（权威见 AGENTS.md 第八节）
- 仅 user 端：`misans-webfont@4.3.1` + `@fontsource-variable/inter@5.3.0`，自托管零境外 CDN。唯一真相 `--hf-font-sans` = `'Inter Variable','MiSans',系统栈`；body / `--el-font-family` / Tailwind sans / TopToolBar / SiteFooter 全引用。`?font=system` → `html.font-system`。admin 零改动。
- `apps/user/scripts/gen-misans-css.mjs`（`pnpm --filter @haifeng/user fonts:gen`）生成 misans.css，升级包必重跑。
- `FACE_SPECS` 双族名封顶：`MiSans`=100 600→Regular / 700→Medium / 800 900→Semibold；`MiSans Display`=100 900→Bold 只给 `--hf-font-strong`。例外 2 处（HfHeroSection `.hf-title`、TopToolBar `.tt-brand-title`，均 800）。★ Display 单字形族：挂它时改 font-weight 数字无效，须先删 `font-family: var(--hf-font-strong)`。调全站轻重只改 FACE_SPECS。
- 合规：MiSans 协议要求注明，已写 SiteFooter.vue `.font-credit`，勿删。

## ★ 收藏模块契约
- targetType 一一对应独立表，ID 不重叠禁止复用：university / major / postgrad_major / city / competition / certificate / enterprise / industry / file_info。
- 后端新增一种收藏 = 3 处：① `FavoriteTargetType` 加枚举 ② 新建 `favorite/target/XxxFavoriteValidator`（id + is_deleted=false）③ 对应 `XxxServiceImpl.page()` 加 ids 过滤（BasePageQueryDTO 自带 ids @Size(max=200)，空集合直接返回空页）。`t_member_favorite.target_type` VARCHAR(32) 无 CHECK，无需迁移。
- ids 上限 200；前端 /favorite/list 单次 size≤100 → 取 2 页取满 200 截断 + 超量提示。
- UI：列表卡右上角 36px 星标（灰→黄填充，@click.stop）；工具栏「查看收藏/收藏中」黄色 toggle（#FBBF24→#F59E0B，999px）；详情页 Hero 元数据行末琥珀底收藏药丸（竞赛详情右上角 40px 圆形星标）。未登录 `confirmLogin()`。卡片根元素含收藏按钮用 `div[role="button" tabindex="0"]` + Enter/Space，不能 `<button>`。
- 列表 toggle 两坑：① 复用 reactive 的 query 退出收藏视图必须 `delete query.ids`；② 收藏视图内取消收藏立即移除并刷新（末页仅剩 1 条回退一页）。已落地文件 / 院校 / 本科专业 / 考研专业 / 竞赛 / 证书 / 企业 / 行业。

## ★ 列表页 / 详情页重构范式
- List.vue 只做取数与编排；展示拆 `views/xxx/components/`（Hero/SearchCard/Card/Skeleton/ToolsCard/utils.ts）；页面 CSS `views/xxx/xxx.css`，选择器全由 `.page-xxx-list` 限定。详情页同构。
- 类名前缀全库唯一：postgrad=pg- / competition=cp- / certificate=cert- / city detail=ct- / industry list=ind- / industry detail=idt- / competition detail=cd- / major detail=detail- / enterprise list=ent- / 岗位页=pos-（ep- 已占用）。改前缀前查产物 CSS 两 chunk。
- Hero 背景图走 JS 内联 `url(${HERO_BG_URL})` 注入 `--hero-bg-url`，不进 CSS 产物（中文路径）；HERO_BG_URL 复用 `views/major/detail/components/utils.ts`；Hero 不挂 hf-card。
- 色板 / 图标：TONE_COLORS（blue/amber/green/red/slate）+ IconTone 复用 major/detail/utils；统一 lucide-vue-next、stroke-width=1.75，严禁 Emoji。映射用「关键词正则 → 类别兜底 → 最终兜底」两级，集中 components/utils.ts。
- 在线工具栏 XXX_TOOLS + ToolsCard.vue；详情页 `detail/utils.ts` 里 `export { XXX_TOOLS } from '../components/utils'`。
- URL 同步只写已知 key（buildQuery 只写非默认值），靠 stableQueryString + lastWrittenQuery 防循环；不要 `query:{}` 全清。深链键只删自己那个。
- 分页 size∈[10,100]；榜单 size=5 → size=10 + slice(0,5)；热门榜无 hot 字段用固定 HOT_INDEX_BY_RANK（非实时）。
- 卡片网格：postgrad / 竞赛 / 证书 2 列，行业 / 企业 3 列。防糊：列表页 hover translateY(-2px)；详情页禁整卡位移，只用颜色 / 边框 / 箭头位移。
- 详情页 Tab 锚点化（勿回退成切换隐藏）：多 Tab = 全部分区同页渲染 + 点击平滑滚动锚点。① 分区恒存在（空数据也渲染占位）② Tab 栏 sticky，top 用 asideTop(8/76) 注入 CSS 变量 ③ 偏移 = asideTop + Tab 实高 + 14 ④ `IntersectionObserver({rootMargin:'-40% 0px -50% 0px'})` 反向高亮并同步 `?tab=`，点击后锁 spy 900ms ⑤ watch(query.tab) 靠 next===active 防循环 ⑥ prefers-reduced-motion 降级 behavior:'auto'。

## ★ OSS / 存储（勿回退）
- `haifeng1` bucket 私有读，是 fileload VIP 门禁必要条件：门禁三层 = @RequireVip → 私有 bucket → 后端实时签发预签名 URL（url-expire:3600）。改公共读会让门禁形同虚设（objectKey 泄露即可匿名直连）。实测匿名 403。
- 公开素材（头像 / 轮播图 / 二维码）走独立公共读 bucket：`oss.public-bucket-name`/`public-url-prefix` + `OssService.uploadPublicBytes()` + `buildPublicUrl()`。上传 `POST /api/v1/admin/common/upload`（不绑 @RequireAdminModule，仅 @RequireLogin(userType="admin")），白名单 png/jpg/jpeg/webp/svg ≤2MB，SVG 内容消毒防存储型 XSS。
- C 端头像链路本就断：DB 写 `avatarUrl=/static/planners/xx.svg` 相对路径，但 static/ 下只有 pdfjs、nginx 无 /static/ location。可用图只有 `apps/user/src/assets/images/avatars/avatar-{1..8}.svg`（vite hash 名，不能存 DB）。

## ★ 沙箱内校验 Java（11-16 验证可行）
- `javac -proc:none` 不可行（Lombok 不处理 → @Data getter 找不到符号）。必须 `-proc:full` + 显式 lombok processor + 输出到临时目录（绝不碰 target/classes）。
- classpath 用 Windows 路径 + 分号；全部 m2 jar 会冲突（jjwt 0.11.5 缺 claims(Map)、jsoup 1.10.2 无 Safelist），按 pom 版本排除。
- `javac -nowarn -encoding UTF-8 -proc:full @javac.args -d /tmp/out @allsrcs.txt`。common + admin 全量 872 源文件可过。

## ★ Vue/TS 通用坑
- EP http-request：`(options: UploadRequestOptions) => void` 不匹配，UploadRequestHandler 要求返回 XHR|Promise，且 options.file 才是 File。
- el-form validate 回调：`FormValidateCallback` 返回 void|Promise，不能 return false；失败字段用 `validate((invalidFields)=>{Object.keys(invalidFields)})`。
- v-model 传可选数组报 TS：子 prop `string[]` 父字段 `string[]|undefined` → computed 代理（get ?? []，set 回写）。
- Short 不能由三元 int 隐式转：`(short) 0 : (short) 1`。
- 相对 import 层级：`views/home/constants.ts` 从 `views/home/planner/components/` 出发是 `../../constants`。

## ★ admin home 模块（11-16 重构完成）
- planner / institution 契约对齐 V79/V80 新表（此前新增必 400、上下架接口不存在、筛选静默失效）。
- planner 上下架 = 软删 is_deleted（无 status 列），后端派生 status（1在线/0下线）+ `PUT /{id}/status`；操作列 详情/修改/下线/上线/删除 五按钮；列表加「已下线」筛选 + 恢复。C 端零改动。
- institution 保持现状（status 0下架/1上架 + 硬删），C 端按 status=1 过滤。
- 枚举全中文落库：ServiceTargetEnum=高考/考研；InstitutionCategoryEnum=4 中文分类（后端 /categories 下拉）；ProvinceEnum=34 中文裸值（packages/shared 同序 ProvinceOptions）。
- ★ `uk_institutions_user` 单列唯一 → 一个教师账号只能管一个机构（DB + service validateManager 双校验）。库里仅 2 教师账号但 C 端 4 张机构卡按 category 查 → 演示数据造 `demo_teacher_*`。
- ★ Flyway 版本号会撞：提交迁移前 `ls db/migration | sort -V | tail`（V81 被占 → 用 V82）。

## 业务规则 / 导航
- 游客档案仅 localStorage `haifeng:guest-gaokao-archive`；Groups.vue 用 guestArchiveParams。request.ts 401 仅「有 token」算过期。
- 高考省份锁定：登录用户首次保存档案后锁定（导航 + 表单 disabled），游客随便切；单例 useProvinceLock.ts。
- 资料页面向人群 = 单一 stageFilter；`?stage=` 深链经 syncFromQuery() 校验。
- DB province / city_name 存裸字段（北京/广西，无后缀），UI 下拉匹配裸值。前端 `packages/shared/src/types/enums/province.ts`（34 个，同序后端 ProvinceEnum）。
- 导航断点 4 档：<768 汉堡 / 768~1700 桌面+更多 / ≥1700 完整菜单 / ≥2100 封顶留白。scrollY>8 抽屉式收起（useAutoHideHeader.ts 单例）；首页 TopToolBar(64px)，其下 AppHeader 接 :top-offset。右侧链接在 TopToolBar.vue `.tt-link`；config/navigation.ts 纯数据。

## admin 端页面结构
- 通用范式：根 `.<name>-page`（暖橙渐变 + 枫叶水印 logo-main.png opacity .05）；卡片 .search-card / .table-card（白底 + border-top 3px #F97316 + border-bottom 3px #FB923C）；表格 .custom-table + el-table stripe（表头 linear-gradient(180deg,#fff7ed,#ffedd5)）；分页 .custom-pagination 贴右受控；按钮原生 `<button>` + 渐变 class（.action-btn + .action-detail/-edit/-enable/-disable/-delete）；状态 .status-pill + .status-on/-off；搜索区 .section-label 渐变胶囊 + .filter-fields/.search-actions（margin-left:auto）。admin 无 --hf-* token、全硬编码 hex 逐页重复。
- home 三兄弟：announcement（黄金模板，4 组件拆分）/ institution / planner（后两者已对齐 V79/V80）。另 7 个 home 目录走 controller/fileload 文件管理架构。
- 权限：`@RequireAdminModule("home_planner"|"home_institution")` 查 sys_module.module_code（V26 seed）。不绑模块的通用接口用 `@RequireLogin(userType="admin")`。
- 通用组件：common/RichTextEditor.vue（wangEditor，排除 uploadImage）、ImageUpload.vue、TagEditor.vue、JsonbArrayEditor/JsonbObjectEditor（仅 text/number，无 textarea）。
- user 端模块速查：字段清单与 DB 实测值见 11-11~11-13 daily log；易踩 3 条：① 竞赛 detail Hero 冷白蓝 + 5 Tab 同页锚点（勿回退）② 行业趋势色板正向（升绿/稳蓝/降红），勿复用列表 growthTone()（正=红）③ t_industry_detail 8 个 JSONB 全空、/enterprises 普通会员被拒（200 + 业务码 1005）。

## 最近迭代（节选）
- 首页 Hero 双栏（11-06 6e7c6be）；罗盘中心 logo 44→112px（11-10）；行业详情页重构（11-13 abd17f6）+ 两详情页 Hero 改冷白蓝 + 竞赛 5 Tab 改同页锚点。
- admin 规划师/机构改造（11-16 e916410 前端 / 9fe796e 后端）：契约对齐 V79/V80 新表。
- Deploy：`.github/workflows/deploy.yml` 的 scp-action 用 v0.1.4（老版 drone-scp），SFTP 单通道卡死时 `timeout`/`command_timeout` 不生效、只能等 GitHub 6h 全局超时；遇到「卡在 scp file to server」先 Cancel + Re-run，长期方案升级 `appleboy/scp-action@v1`。
