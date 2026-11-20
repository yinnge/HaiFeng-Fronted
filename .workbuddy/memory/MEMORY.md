# 项目长期记忆（海枫前端 monorepo）

> 权威规范 = 仓库 `AGENTS.md`；逐日细节见 `.workbuddy/memory/YYYY-MM-DD.md`。本文件仅留跨会话高频红线。

## 环境 / git
- 类型检查 `pnpm --filter @haifeng/admin|user typecheck`；bash 里 pnpm 失效 → PowerShell 调 `D:\npm\npm-global\pnpm.cmd`。eslint 未装。shared main 指向 src，改后仍跑 `pnpm --filter @haifeng/shared build` 更新 .d.ts。
- JVM 红线：后端运行期禁 `mvn clean`/Rebuild（无 devtools → NoClassDefFoundError）；沙箱内禁跑 mvn（Lombok 失效会写坏 target/classes）。编译由用户本地 `mvn -pl haifeng-app -am compile` + 重启。
- 收尾必 commit；`git pull --rebase` 前 status 干净；禁 `git add -A`，逐文件 / hunk 暂存。Vite build 验到新目录，真实 dist 本地重 build。
- 后端仓库 `D:\exeProject\ideaProjects\Project-HaiFeng`（分支 PDF）；curl 502 是 http_proxy → `curl --noproxy '*'`；直连 PG：`docker exec haifeng-postgres psql -U postgres -d haifeng`。
- 品牌 #F97316/#FB923C；admin 暖橙渐变卡、user 冷白微灰卡；纯样式任务不动 `<script>`。

## 高频坑
1. 新公开接口同步 `SecurityConfig.WHITE_LIST` 2. 分页 `size∈[10,100]`、`page≥1` 3. 就业枚举以 DTO `@Pattern` + DB CHECK 为权威 4. 错误文案 `err.response?.data?.msg || err.message || '操作失败'`（拦截器 reject `new Error(msg)`，无 `.response`）5. MP `updateById` 排除 `is_deleted`，禁用=软删 / 删除=物理删，查含禁用或恢复状态走自定义 SQL 6. CORS 含 PATCH 7. 列表 VO 返 `id` 主键 8. OSS 预签名 3.17.4 仅 `ResponseHeaderOverrides` 9. C 端 VO 的 Long 雪花 ID 加 `@JsonSerialize(ToStringSerializer)` 10. 标签配色 / 筛选前先查 DB 实际取值：`SELECT col,count(*) FROM t_x GROUP BY col`。
11. 改 DB 后 C 端不生效先想 Redis `haifeng:app:home:*` 缓存 30min；`--scan` 空先怀疑 NOAUTH，带密码 `PW=$(grep ^REDIS_PASSWORD= .env|cut -d= -f2-); docker exec haifeng-redis redis-cli -a "$PW" --no-auth-warning --scan --pattern "*institution*"`。
12. 位次与分数语义相反：数字越小越靠前。最低位次(minRank)=最低分考生位次=数值最大，最高位次(maxRank)=数值最小，中位(avgRank)居中 → 合法关系 `minRank ≥ avgRank ≥ maxRank`，勿照搬分数的 `minScore ≤ avgScore ≤ maxScore`。导入校验(AdmissionGroupServiceImpl)、DB 聚合(fn_recalc_group: MAX(min_rank)/MIN(max_rank))、app 安全系数(ScoreBasedCalculator: 优先 avgRank、降级 minRank*0.85、rankRatio=avgHistRank/userRank) 三处均已按此语义。

## 勿回退（视觉 / 交互）
- 弹窗锁滚动抖动：`body{overflow-y:scroll;scrollbar-gutter:stable}` + `body.el-popup-parent--hidden{width:100%!important}`。
- 详情页画布全局透明透出 `#f8fafc`，实心白卡 / Hero 须 scoped `background:…!important`；teleport 弹窗 scoped `:deep()` 失效。竞赛 / 行业详情 Hero 一律冷白蓝，暖橙只留竞赛右栏报名卡。
- ElDialog `inheritAttrs:false` → 用全局唯一类 `.xxx.el-dialog{...}`；弹窗自带 16px padding，顶部白条正解 `.el-dialog.xxx{padding:0!important}` + header `display:none`。
- token key：admin `/admin/`→`haifeng_admin_access_token`，user `/`→`haifeng_access_token`；base/login 用 `import.meta.env.BASE_URL` 拼。权益变更不 bump tokenVersion；VIP 实时靠 `AuthAspect.checkVip` 回退 DB。
- EP：规则只挂 `.el-select__placeholder`；el-input-number 须 `.el-input{width:100%;min-width:0}`。
- 防糊：入场动画稳态退出合成层（filter/transform:none + `.is-settled{will-change:auto}`）；含文字容器禁 hover/active `scale()`；Hero 透明，背景由 `.bg-grid-aurora` fixed 画布提供。
- 橙色小字用 `#c2410c`（hover `#9a3412`），`#f97316` 白底仅 2.80:1，不靠加粗掩盖；`background-color:` 含 `color:` 子串，批量替换必带断言。重构后必过 `git diff HEAD` 的 CSS 选择器。

## 字体 / 字重（仅 user 端，权威见 AGENTS.md 第八节）
- `misans-webfont@4.3.1` + `@fontsource-variable/inter@5.3.0` 自托管；唯一真相 `--hf-font-sans` = `'Inter Variable','MiSans',系统栈`；`?font=system` → `html.font-system`；admin 零改动。升级包重跑 `pnpm --filter @haifeng/user fonts:gen`。
- `FACE_SPECS`：`MiSans` 100-600→Regular / 700→Medium / 800-900→Semibold；`MiSans Display` 全段→Bold 仅给 `--hf-font-strong`。例外 2 处（HfHeroSection `.hf-title`、TopToolBar `.tt-brand-title`，均 800）。Display 单字形族：改 weight 前先删 `font-family: var(--hf-font-strong)`。MiSans 署名 SiteFooter `.font-credit` 勿删。

## 收藏模块契约
- targetType 一一对应独立表、ID 不重叠：university / major / postgrad_major / city / competition / certificate / enterprise / industry / file_info。新增一种 = 枚举 + `favorite/target/XxxFavoriteValidator`（id + is_deleted=false）+ 对应 `XxxServiceImpl.page()` ids 过滤；ids≤200（VARCHAR 无 CHECK，无需迁移）。
- UI：列表卡右上 36px 星标（灰→黄，@click.stop）；工具栏黄色 toggle；详情 Hero 琥珀收藏药丸；未登录 `confirmLogin()`；卡片根用 `div[role="button" tabindex="0"]`，不能 `<button>`。
- toggle 两坑：退出收藏视图必须 `delete query.ids`；取消收藏立即移除并刷新（末页仅 1 条回退一页）。

## 列表页 / 详情页重构范式
- List.vue 只取数；展示拆 `views/xxx/components/`（Hero/SearchCard/Card/Skeleton/ToolsCard/utils.ts）+ `views/xxx/xxx.css`，选择器全由 `.page-xxx-list` 限定。类前缀唯一：pg-/cp-/cert-/ct-/ind-/idt-/cd-/detail-/ent-/pos-（ep- 已占用）。
- Hero 背景图走 JS 内联 `url(${HERO_BG_URL})` 注入 `--hero-bg-url`（中文路径不进 CSS）；复用 major/detail/utils；统一 lucide-vue-next、stroke-width=1.75，禁 Emoji；TONE_COLORS/IconTone 复用。
- URL 同步只写已知 key + stableQueryString/lastWrittenQuery 防循环；深链键单删。榜单 size=5 → size=10 + slice(0,5)。列表卡 hover translateY(-2px)；详情禁整卡位移。
- 多 Tab 同页锚点化：分区恒存在 + sticky Tab（top 注入 CSS 变量）+ IntersectionObserver(`rootMargin:'-40% 0px -50% 0px'`) 反向高亮 + 点击锁 spy 900ms + `watch(query.tab)` 用 next===active 防循环 + reduced-motion 降级。

## OSS / 存储
- `haifeng1` 私有读是 fileload VIP 门禁根基（@RequireVip + 私有 bucket + 后端实时预签名 3600s），勿改公共读。
- 会员头像独立 bucket `haifeng-memeber-svg`（公共读，`OSS_AVATAR_BUCKET_NAME`/`PREFIX`，oss.avatar-*）；按 memberId 固定 key `haifeng/avatars/{id}` 覆盖上传=删旧更新，切静态头像不删对象、可凭稳定 URL 切回（MemberInfoVO.customAvatar 由 OSS doesObjectExist 探测）。上传接口 `POST /api/v1/app/member/profile/avatar/upload`；校验 JPG/PNG ≤2MB 边长 64~2048 宽高比 0.5~2（禁 SVG）。
- 公开素材走 `haifeng-public`（ACL 可公共读即可，勿开公共读写）：`POST /api/v1/admin/common/upload`（仅 @RequireLogin admin），png/jpg/jpeg/webp/svg ≤2MB，SVG 消毒；putObject 不支持自定义响应头（X-Content-Type-Options 实测被静默丢弃）；必须显式设 Content-Type（`OssService.resolveContentType()`），否则 SVG 被当附件；bucket 强制下载对 SVG 是净收益，保留。
- C 端头像相对路径 `/static/planners/*.svg` 链路断；可用图仅 `apps/user/src/assets/images/avatars/avatar-{1..8}.svg`（vite hash 名不可存 DB）。

## 沙箱校验 Java / Vue 通用坑
- Java：`-proc:none` 不可行，须 `-proc:full` + 显式 lombok processor + 临时输出目录（绝不碰 target/classes）；classpath 用 Windows 路径分号、按 pom 版本排除冲突 jar（jjwt/jsoup）。
- EP http-request 须返回 XHR|Promise 且用 `options.file`；el-form validate 回调不能 return false；可选数组 v-model 用 computed 代理；Short 显式强转；相对 import 层级核对（planner/components → `../../constants`）。
- `common/ImageUpload.vue` 单/多图判断：父传 `model-values` 才是多图，`modelValues` **绝不能设默认值**（设 `() => []` 会让所有单图误判为多图，URL 写不进 `avatarUrl`）。图片「上传」写 OSS 公共读 bucket `haifeng-public`，「链接」只存 URL 字符串到 DB，二者都不落本地静态盘。

## admin home / 业务规则 / 导航
- planner = 软删上下架（派生 status + `PUT /{id}/status`）+ 列表「已下线」筛选；institution = status 0/1 + 硬删；枚举全中文落库（高考/考研、4 类机构、34 省裸值）；`uk_institutions_user` 单列唯一 → 演示账号 `demo_teacher_*`；Flyway 提交前查 `ls db/migration | sort -V | tail`。
- admin 通用范式：根 `.<name>-page` 暖橙渐变 + 枫叶水印；.search-card/.table-card 白底橙上下边；.custom-table + stripe 渐变表头；.custom-pagination 贴右；原生 button 渐变 action-*；.status-pill。home 三兄弟 announcement 为黄金模板，另 7 目录走 fileload 架构；权限 `@RequireAdminModule("home_planner"|"home_institution")`。通用组件 RichTextEditor（排除 uploadImage）/ ImageUpload / TagEditor / JsonbArrayObjectEditor。
- 游客档案仅 localStorage `haifeng:guest-gaokao-archive`；高考省份登录用户首次保存后锁定；资料页单一 stageFilter；DB province/city 存裸值，shared `ProvinceOptions` 34 个同序。
- 导航断点 <768 / 768~1700 / ≥1700 / ≥2100；scrollY>8 抽屉式收起（useAutoHideHeader 单例）；TopToolBar(64px) 下接 AppHeader :top-offset。
- 最近：11-16 admin 规划师 / 机构改造（前端 e916410 / 后端 9fe796e）；11-13 行业详情 + 两详情页 Hero 冷白蓝 / 竞赛 5 Tab 锚点；部署 scp-action v0.1.4 卡在 scp 先 Cancel + Re-run。
