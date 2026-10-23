# 项目长期记忆（海枫前端 monorepo）

> 详细「已知坑」以仓库内 `AGENTS.md` 为权威（随仓库走、更全）。本文件只留跨会话高频要点 + AGENTS.md 之外的事实。

## 通用规范/环境速查
- 设计令牌：品牌主色 `#F97316`/`#FB923C`；admin 暖橙渐变+橙边卡片，user 纯白微灰卡。仅样式任务不动 `<script>`。
- 类型检查：`pnpm --filter @haifeng/admin|user typecheck`（bash 里 pnpm 失效，用 PowerShell 调 `D:\npm\npm-global\pnpm.cmd`）。
- **JVM 红线**：后端运行期禁止 `mvn clean`/IDE Rebuild（无 devtools，改写磁盘 class 撞车→$Builder 缺失 NoClassDefFoundError）；改 Java 只能重启。
- `@haifeng/shared` 的 main/exports 指向 **src 源码**（非 dist），vite 直接打包源码；改 shared 后仍 `pnpm --filter @haifeng/shared build` 更新 .d.ts/tsbuildinfo。

## 高频已知坑索引（详见 AGENTS.md）
1. 新公开接口同步 `SecurityConfig.WHITE_LIST`（否则 401）。2. 分页 `size∈[10,100]`、`page≥1`。3. 就业模块前后端枚举对齐（@Pattern + DB CHECK 为权威）。4. 前端错误文案 `err.response?.data?.msg || err.message || 兜底`。5. MP 逻辑删除：`updateById` 排除 is_deleted。6. CORS `allowedMethods` 含 PATCH。7. 弹窗锁滚动抖动（已根治）。8. 列表 VO 返 `id` 主键。9. OSS 预签名 3.17.4 仅 `ResponseHeaderOverrides`。

## 已知坑：弹窗锁滚动抖动（2026-08-22 根治）
旧 `index.css` 写 `html{scrollbar-gutter:stable}`（overflow 默认 visible 不生效）+ `body.el-popup-parent--hidden{width:100%!important}` 顶掉 EP 默认补偿 → 弹窗开/关页面左移 6px。**修复**：滚动容器挪到 `body{overflow-y:scroll;scrollbar-gutter:stable}`，删掉所有自定义 `el-popup-parent--hidden` 规则。以后勿加 scrollbar-gutter/width:100%!important 干预锁滚动。

## 详情页暖橙底（2026-08-17 · 同源坑实例持续追加）
`index.css` 全局 `.app-shell main > *, #app > *{background:transparent!important;background-image:none!important}` 强制透出 html 暖橙画布（`#fff7ed`）。要实心白卡/橙 Hero 必须在其 `<style scoped>` 加 `background:#fff!important` / `linear-gradient(...)!important`。根 div 不写背景。
**已知实例**：① RechargeDialog.vue（teleport 到 body 的 `.el-dialog`，scoped `:deep()` 失效，需提权/非 scoped）。② `views/university/Guide.vue` 的 `.guide-hero`（2026-09-03）：是 `<main>` 直接子节点被覆盖，scoped 加 `background:linear-gradient(...)!important` 一行修复。两者根因相同、修复路径不同。

## 后端已知坑（权威，节选）
- **@TableLogic+@Version+updateById 静默失效**（影响行数0不抛异常）：fileload 已改 `LambdaUpdateWrapper` 显式 SET + `setSql("version=version+1")`，影响行数0抛 409。带逻辑删除/乐观锁实体的写操作禁止 `updateById` 做局部更新/逻辑删除。
- OSS `aliyun-sdk-oss:3.17.4`：`GeneratePresignedUrlRequest.setResponseHeaders` 只收 `ResponseHeaderOverrides`（无 `setResponseDisposition`/Map）。下载名用 `ResponseHeaderOverrides.setContentDisposition("attachment; filename*=UTF-8''"+URLEncoder.encode(name).replace("+","%20"))`。KKFileView 预览用干净 URL、下载才带 disposition；预览 url 标准 Base64+URL 编码且先 `%25` 双重编码。
- 局部更新用 `UpdateWrapper` 而非 `BeanUtils.copyProperties`（会把未传字段覆盖 null）。雪花 ID `SnowflakeIdGenerator` 静态调用，勿当实例方法。批量删除用 `@PostMapping`（非 DELETE+Body）。

## 密码规则（2026-08-21 统一）
全站唯一：字母+数字 6-16 位，`^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$`，提示「密码必须是数字+字母，长度6-16位」。任何密码入口禁用其它规则。

## user 登录引导（2026-08-21）
未登录拦截统一用 `confirmLogin()`（`utils/loginGuide.ts`）；路由守卫 `requiresAuth` 已接。改登录引导先全局搜「请先登录/去登录」。

## 特殊通道链路（2026-08-19）
用户真实入口=gaokao 页 → `/gaokao/channel/:id` → `views/gaokao/ChannelUniversities.vue`（强基内嵌 `StrongBaseList.vue`）；强基详情 `/special/strong-base/:id`。改前先确认入口。

## 导航断点
<768 汉堡抽屉 / 768~1700 桌面+更多 / ≥1700 完整菜单 / ≥2100 封顶留白（预期）。

## 吸顶导航条 UI 规范（2026-10-19）
- **下拉触发器不显示向下箭头 svg**：导航栏/吸顶条（AppHeader 子条、ArchiveBar、EnglishBar、FileLoadPage 的 stage-nav）上的「药丸式」`el-select` 触发器统一隐藏 `.el-select__suffix`（`display:none`）。已处理：ArchiveBar 身份选择、EnglishBar 考试类型、FileLoadPage 身份选择（/college、/middle 共用）。**后续新增吸顶条上的下拉统一照此，不要向下箭头。**
- **全局头部滚动收起**：所有页面（含主页）`window.scrollY>8` 时抽屉式收起（translateY(-100%)）。`composables/useAutoHideHeader.ts` 为**模块级单例**，AppHeader 与所有吸顶子条共享同一 `hidden`；子条在头部收起时把 sticky `top` 收为 `0`，填补顶部空隙（否则头部收起后子条仍停在 `top:导航高` 留一段空白）。
- 主页 `/` 同样滚动收起（2026-10-21 改）：顶部「工具/账号层」TopToolBar 仅首页常驻（z-60、不收起），旧 AppHeader 在其下方（首页 top=64 紧贴、其余 top=0），二者错层；TopToolBar 与 AppHeader 同处 DefaultLayout。

## 顶部双层导航 + 全站搜索（2026-10-21）
- **双层结构**：`DefaultLayout` 在 `AppHeader` 上方仅首页(`route.path==='/'`)渲染 `TopToolBar`（工具/账号层，sticky top:0 z-60，常驻不收起）；旧 `AppHeader` 接 `:top-offset`（首页 64、其余 0）紧贴其下。滚动时 AppHeader 抽屉式收起、TopToolBar 留顶（错层）。
- **账号区分布（2026-10-22 定稿）**：新导航 TopToolBar（仅首页）与旧导航 AppHeader（**仅非首页** `v-if="!isHome"`）都带 铃铛+头像（铃铛在头像左）；`UserAvatar` 触发区只显示头像+身份标签（无用户名），未登录渲染 `user-avatar-login-btn`（验证时勿用 `.user-avatar-wrapper` 选择器，未登录会误判 false）。
- **旧导航 AppHeader 去 logo**：最左侧 logo 已删除（仅删除该 logo，不影响内容分类导航）；`logoMain` 引用已移除。
- **搜索 `GlobalSearchBox`**：**已去掉模块筛选按钮**（原 高考/中考/考公/考研/英语四六级 作用域删除）——搜索本质是「实体+资讯」全站查，模块筛选只作用于资讯组、很鸡肋，故移除。现为**纯胶囊**：放大镜+输入框+⌘K，`width:100%; max-width:360px; flex:1` 可随导航收缩；聚焦橙描边+光晕。下拉=院校/城市/专业/资讯 分组（资讯走 `searchArticle(null,kw)` 全模块）。点选跳 `/university/:id` `/city/:id` `/major/:id` `/gaokao/article/:id`。**待补**：非高考资讯详情无通用路由（仅 `/gaokao/article/:id` 写死高考模块），需补通用 `/article/:id` + 后端 id 查询。
- **⚠️ 布局坑：flex 链要靠 `flex:1` 传递宽度，不能用 `width:100%`**（新导航实测）：`tt-center`(grid 1fr 轨道) → `.gs-root` → `.gs-panel` → `.gs-input-wrap`。中间两层若只写 `width:100%` **不会撑满**（flex item 的 width:100% 不等于 grow），实测 875px 轨道下 panel 仍停在内容宽 282px。**必须逐级 `flex:1; min-width:0`**，末端 `.gs-input-wrap` 再 `flex:1; max-width:360px`。
- **新导航栅格（2026-10-21 定稿）**：`grid-template-columns: auto minmax(0,1fr) auto; gap:24px`。品牌(内容宽) | 搜索(弹性可缩、**靠左不居中**) | 功能区(内容宽，**永不挤压**)。旧 `1fr auto 1fr` 会让右侧 1fr 装不下 662px 内容，`justify-content:flex-end` 把溢出**往左推**盖住搜索框（实测 1366px 重叠 157px）——已根治，OVERLAP=0。
- **新导航响应式**：链接 gap 24→16px（≤1400px 再降到 12px）；副标题 ≤1199px 隐藏；搜索框 ≤1099px 收为图标按钮（GlobalSearchBox 的 mql 断点已从 1023 改到 **1099**）。实测 1920/1440/1366/1280 均无重叠、无横向溢出。
- **新导航样式规范（2026-10-21 定稿）**：品牌标题 `.tt-brand-title` 20px/800/#18181B、「未来规划院」`.tt-grad` 渐变 135deg #FF7A00→#EA580C、副标 11.5px #71717A；右导航 `.tt-link` 14.5px/600/#3F3F46、hover/active 橙 #EA580C + 圆角胶囊热区 + 底部 16px 短指示条（替代旧满宽横线）。
- **百宝箱单例**：`useTreasureBox.ts` 模块级单例 `open`；`FloatingTreasure`（首页悬浮 img.png）与 `TopToolBar` 的「百宝箱」按钮共用同一弹窗（`openBox()`）。
- **ComingSoon 占位页**：`/coming-soon?from=xxx`（career-map/data-compare/consultation），三个入口共用，居中大字+图标+返回首页。
- 模块作用域列表（高考/中考/考公/考研/英语四六级）当前前端写死；如后端有动态字典接口，后续改动态拉取。

## git 红线
收尾必 commit；`git pull --rebase` 前确认 `git status` 干净。

## ★ NEW：tokenVersion 致会话失效 / VIP 不实时（2026-08-25）
- **机制**：`JwtAuthenticationFilter.isTokenVersionValid()` 拿 token 内 `tokenVersion` 与 **Redis** `haifeng:token:version:{userType}:{id}` 比对；Redis 无该 key 直接放行（本地无 Redis 故本地不触发），生产有值则版本不符→`AuthUser` 不写入 SecurityContext→`getCurrentMemberId()` 返回 null→`selectById(null)` 抛「用户不存在」。刷新 token 不校验 tokenVersion（只校验 refresh 串），故版本不符只让 access token 失效。
- **触发点（曾误诊为生产 bug）**：最初怀疑 `MemberServiceImpl.upgradeMember` 与 `MemberOrderServiceImpl`（订单确认/撤销）在会员类型变更时 `setTokenVersion(+1)` 并写 Redis → 用户旧会话失效。但经完整读码确认：当前代码全链路已无 member 的 tokenVersion bump（grep `setTokenVersion` 仅剩 admin 安全事件与注释），且 tokenVersion bump 无法解释「admin 403 无权限」「通知列表空」等身份错位症状。**用户实际的「用户不存在/403」生产 bug 是前端 token key 撞车（见下方新坑），与后端无关。** 去掉 bump 仍是有价值的 secondary 改进（避免另一种会话失效），但不是该生产 bug 的根因。
- **修复（2026-08-25 已实施）**：会员升级/订单确认/撤销**不再 bump tokenVersion**（仅密码修改、账号禁用等安全事件才 bump）。VIP 实时性改为 `AuthAspect.checkVip` 回退 DB 查 `member.isVipActive()`（注入 `MemberMapper`），admin 升级后 VIP 立即生效、无需重登/等刷新。前端 `apps/user/src/main.ts` 增加 `focus`/`visibilitychange` 时 `fetchUserInfo()` 同步 VIP 徽标。
- **教训**：token 版本号只用于「强制重登」类安全事件；会员权益授予/变更不得 bump，否则生产 Redis 直接废掉用户会话。

## 问题2（admin 端 token 过期显示横杠 -）根因
admin `main.ts` 已注册 `setSessionExpiredHandler`（非可关闭弹窗+重定向 `/admin/login`），逻辑与 user 端一致；admin 刷新 token 不校验 version。生产仍显示「-」通常是**旧生产包未含 handler**（dev HMR 有、prod 需重新 `pnpm --filter @haifeng/admin|user build`）。重新构建部署即修复。

## ★ 已知坑：前端多端共享 localStorage token key 撞车（2026-08-25 真因）
- **症状**：admin 升级/撤销用户会员后，user 端报「用户不存在」、admin 端撤销报 `403 无权限`、通知列表空（重登后恢复）、**本地正常生产炸**。
- **根因**：`packages/shared/src/utils/auth.ts` 的 access/refresh token key 是**写死的同一个** `haifeng_access_token`/`haifeng_refresh_token`，admin 与 user 两端共用。生产**同源**部署时两应用读写同一 key 互相覆盖：user 拿到 admin token（isMember=false→getCurrentMemberId null→「用户不存在」）、admin 拿到 member token（!isAdmin→`FORBIDDEN(403,"无权限")`）、通知按错误 userId 查询→空。dev 端口不同源（:3000/:3001）各自独立 localStorage → 不触发 = 用户说的「本地没事」。
- **修复**：token key 按各端 `import.meta.env.BASE_URL` 派生命名空间——admin('/admin/')→`haifeng_admin_access_token`，user('/')→`haifeng_access_token`（保持兼容，不丢 user 现有会话）。改 shared 一处 + `pnpm --filter @haifeng/shared build` + 重建两 app。部署后 admin 需重登一次（新 key 为空）。
- **诊断铁律**：出现「用户不存在 / 403 无权限 + 重登即好 + 本地正常生产炸 + 通知列表空」这类**身份错位**信号时，第一怀疑**同源多应用共享 localStorage key**，而不是后端 tokenVersion/会话失效。改 shared 后必须 `pnpm --filter @haifeng/shared build`。

## ★ 已知坑：EP select/number 控件对齐与布局（2026-10-20 根治 · ArchiveDialog/ArchiveQuickForm）
- **对齐规范（最终态，勿回退）**：上下两列严格对齐。dialog：省份/预估分数/填报批次 同列同宽 220px（`max-width:220px`），年份/对应位次 同列同宽 220px；QuickForm：全部控件撑满 `gk-row` 栅格列（1fr 1fr + gap 12px），分数|位次行、批次行**必须与省份|年份行共用同一栅格**——勿再改 column-gap、缩窄单个框、或加 margin-left 偏移，任何单框变宽变窄都会破坏上下对齐（这是用户反复强调的最终要求）。
- **坑1（select 文字掉出盒子）**：EP2.13 `.el-select__selection` 内有**两个**带 `el-select__selected-item` 类的元素：`input-wrapper is-hidden`（隐藏输入框，**必须保持 position:absolute**）与 `el-select__placeholder`（选中标签，原生 absolute+top:50%+translateY(-50%) 居中）。自定义布局规则若挂 `.el-select__selected-item` 会把 is-hidden 拉回文档流占一行 → 文字标签被 flex-wrap 挤到第二行排到盒子外面。**布局规则只能挂 `.el-select__placeholder`**；垂直居中用 `display:flex + align-items:center + line-height:normal + transform:none`（static 后 EP 原生居中机制失效，translateY 微调治不了本）。
- **坑2（el-input-number 撑爆溢出）**：el-input-number 是 inline-flex，内层 `.el-input`/`.el-input__wrapper` 默认按内容 sizing，input 固有宽(~20字符)把 wrapper 撑到 230px+ 溢出外层盒子（橙色边框画在 wrapper 上，视觉上就是"框超宽"）。必须显式 `.el-input{width:100%;min-width:0}` + `.el-input__wrapper{width:100%;box-sizing:border-box}`。另：`.gk-number` 本身就是 el-input-number 根元素，`.gk-number .el-input-number` 这类后代选择器永远匹配不到（曾致宽度规则整轮失效）。
- **容量参考**：8 位数位次(50000000) 16px 字号需输入区 ≥88px；缩框时用 playwright 验 scrollWidth≤clientWidth。
- **方法教训**：EP 控件内部布局问题连续盲改 CSS 三轮未中，最后用 playwright-cli 连 dev server 读真实 DOM+计算样式一次定位。**以后 EP 内部布局问题直接测 DOM，不盲改。**（坑：playwright-cli 会话不跨 bash 命令保持，open+eval+screenshot 须同一条命令链式执行；QuickForm 在 /gaokao 非 /；弹窗触发点=吸顶条「点击填写…」文字节点。）

## ★ 规则：游客（未登录）档案与专业组查询链路（2026-10-23 定稿）
- **产品约定**：不注册也可填高考档案（仅 localStorage，key `haifeng:guest-gaokao-archive`）并查询专业组。
- **前端**：`Groups.vue` 用 `guestArchiveParams`（province/year/score/rank/三科/batchLineScore）随 `getGroupPage`/`getMajorPage` 上行；已登录不传，后端以库中档案为权威。类型 `GuestArchiveParams` 在 `api/gaokao/index.ts`。
- **后端**：`admission/group/page`、`admission/major/page` 免登录，档案解析统一走 `GuestArchiveResolver`（登录+库有档案→用库；否则按请求参数建**临时** MemberGaokao 不落库；都无→1010）。DTO 统一继承 `GuestArchiveQueryDTO`。**注意：控制器上 `@RequireLogin` 属于 Aspect 层面，加白名单无效**，`/wish-plan/level-dict` 整类需登录 → 游客用前端兜底档位字典。
- **`request.ts` 铁律**：401 只有在「有 token」时才算会话过期；无 access 且无 refresh token（游客）一律直接 reject 原始 msg，禁止弹「登录已过期」。新增接口时不要绕过此判断。

## ★ 规则：高考省份锁定（2026-10-23）
- 游客（未登录）：导航栏 + 档案表单的省份随便切，档案只存 localStorage。
- 登录用户：**第一次保存档案**时弹框「省份确认之后不可再更改，是否继续？」；确认入库后省份锁定（导航栏 ProvincePicker 与 ArchiveDialog/ArchiveQuickForm 的高考省份全部 disabled），后端 `saveArchive` 也会拒绝省份变更。
- 锁定状态单例：`composables/useProvinceLock.ts`（`provinceLocked`），由 `utils/gaokaoArchive.ts` 的 `loadArchiveSmart`/`saveArchiveSmart` 同步；判断口径：**已登录 + 服务端已有档案**（含游客档案迁移入库后）。
- 新增/改动档案保存时注意：`saveArchiveSmart` 返回值已改为 `{ toServer, canceled }`，取消确认框时 `canceled=true` 不算保存成功。
