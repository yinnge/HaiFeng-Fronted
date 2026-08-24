# 项目长期记忆（海枫前端 monorepo）

> 详细「已知坑」以仓库内 `AGENTS.md` 为**权威**（它随仓库走、内容更全），本文件只留跨会话高频要点 + AGENTS.md 之外的事实。

## 通用规范（速查）
- 设计令牌：品牌主色 `#e8722a`（brand-orange）；admin 暖橙渐变+橙色顶底边框卡片，user 纯白微灰+细边卡片。改样式前对照 `AGENTS.md` 对应端 Checklist；仅样式任务不动 `<script>`。
- 数据列用 `min-width` 撑满，`width` 只给窄固定列（状态/操作）。
- 类型检查：`pnpm --filter @haifeng/admin typecheck`（或 user）；Vite dev 用 esbuild 不做类型检查。
- **环境**：bash 里 `pnpm` 失效，用 PowerShell 调 `D:\npm\npm-global\pnpm.cmd`（旧 `E:\Nodejs\node_global\pnpm.cmd` 已失效）；后端无 devtools，改 Java 必重启生效。
- **JVM 红线**：后端服务运行期间禁止 `mvn clean`/IDE Rebuild（无 spring-boot-devtools，会触发 $Builder 缺失 NoClassDefFoundError）。

## 高频「已知坑」索引（详见 AGENTS.md）
1. 新增后端公开接口必须同步 `SecurityConfig.WHITE_LIST`（逐条精确匹配，否则 401）。
2. 分页 `size` 硬约束 [10,100]、`page` ≥1（`BasePageQueryDTO`），前端 page-size/page-sizes 必须落在区间内。
3. 就业模块前后端枚举必须对齐：后端 `@Pattern` 与 DB CHECK 约束是权威，前端下拉一字不差。
4. 前端错误文案要用 `err.response?.data?.msg || err.message || 兜底`（拦截器 reject 的是普通 Error，无 .response）。
5. MP 全局逻辑删除：`updateById` 排除 is_deleted、`selectPage` 自动加 is_deleted=false；操作禁用记录/查禁用/物理删必须自定义 SQL。
6. CORS `allowedMethods` 必须含 PATCH（否则 12 模块状态接口全挂）。
7. **Element Plus 弹窗锁滚动抖动**（见下）。
8. **列表 VO 必须返回记录主键 `id`**，否则前端详情接口（后端 `selectById(id)` 按主键查）误传 businessId→404 + 弹窗闪退。典型案例（2026-08-15）：特殊通道 `SpecialChannelUnivListVO` 漏 `id`，前端误传 `universityId` 给 `/channel-univ/{id}`，报「通道大学关联不存在」。顺带：详情接口若 `@RequireLogin`，未登录点会触发响应拦截器强制跳 `/login`，应在前端调用前判 `isLoggedIn()` 友好引导。
9. **OSS 预签名响应头：`aliyun-sdk-oss:3.17.4` 只有 `ResponseHeaderOverrides` 旧式 API**（无 `setResponseDisposition`/`setResponseHeaders(Map)`，这两个是 3.18+ 才加）。设置下载文件名用 `ResponseHeaderOverrides.setContentDisposition("attachment; filename*=UTF-8''"+URLEncoder.encode(name))` + `GeneratePresignedUrlRequest#setResponseHeaders(ResponseHeaderOverrides)`。详见文末「OSS SDK API 误判更正（2026-08-23）」。

## 已知坑：弹窗打开页面左移抖动（2026-08-15 定位根因，待用户确认修复）
- 现象：未登录点「开始志愿填报」→ 路由守卫弹登录框 → 右侧滚动条消失、页面左移约 6px。
- 根因（element-plus 实际装的是 **2.13.7**）：`useLockscreen` 弹窗打开时给 `body` 加 `el-popup-parent--hidden`(`overflow:hidden`)+内联 `body.style.width=calc(100%-滚动条宽)` 补偿位移；关闭 200ms 后还原。
- user 端当前 `index.css` 的 `scrollbar-gutter:stable` 写在 `html,body`（两者 overflow 默认 visible，**stable 对 visible 不生效**，等于没留 gutter），而 `body.el-popup-parent--hidden{width:100%!important}` 又把 Element Plus 的补偿**顶掉**了 → 滚动条消失 + 无补偿 = 内容左移 6px。二者叠加是帮倒忙。
- admin 端 `index.css` 的 `.el-popup-parent--hidden body{overflow-y:scroll!important}` 是**错误选择器**（类加在 body 上，body 不是 .el-popup-parent--hidden 的后代）→ 死 CSS，且 `html{scrollbar-gutter:stable}` 同样无效。
- 影响面：**全局**，user/admin 所有 `el-dialog`/`ElMessageBox`/`el-drawer`/`el-image` 预览都触发，不止首页。
- 修复（2026-08-15 已实施，方案 A）：移除 user/admin `index.css` 里的 `scrollbar-gutter:stable` 与 `body.el-popup-parent--hidden{width:100%!important}`、admin 的 `.el-popup-parent--hidden body{...}` 死规则，回归 Element Plus 默认补偿。**以后不要再加 scrollbar-gutter / width:100%!important / 自写 el-popup-parent--hidden 规则干预锁滚动。** NotificationPanel.vue 的 `scrollbar-gutter:stable` 是嵌套滚动容器内的合法用法，保留。

## 特殊通道「两个入口、三个组件」链路（2026-08-19 改错文件教训，权威）
- **入口①（用户真实入口，gaokao 页）**：gaokao 首页通道卡片（综合评价/强基/专项/民族班/联招 5 张）→ `goChannel()` → `/gaokao/channel/:id` → **`views/gaokao/ChannelUniversities.vue`**。此页 STRONG_BASE 通道内嵌 `components/gaokao/StrongBaseList.vue`（强基列表），点"查看详情"→ `/special/strong-base/:id` → **`views/special/StrongBaseDetail.vue`**。
- **入口②（special 独立入口，易被忽略）**：`/special` → 通道卡片 → `/special/channel/:id` → **`views/special/ChannelDetail.vue`**。
- **教训**：用户说"点进入通道"，实际走的是入口①（GaokaoChannelUniversities.vue + StrongBaseList.vue），不是 special 的 ChannelDetail.vue。**改特殊通道页面必须先确认用户从哪个入口进**；两个入口的 4 通道详情页结构相同（Hero+chip 云+搜索栏+无限滚动），已同步统一为新样式（2026-08-19）。
- **入口统一（2026-08-19 用户拍板）**：特殊通道 Tab1 的 5 张通道卡片（含强基）跳转已从 `/special/channel/:id` 改为 `/gaokao/channel/:id` → 两个入口共用 `GaokaoChannelUniversities.vue`（含 STRONG_BASE 分支渲染 StrongBaseList）。`views/special/ChannelDetail.vue` 保留文件不再被引用。返回按钮保持原状（回 `/gaokao`），用户确认可接受。强基 Tab2 与强基详情仍是 `/special/strong-base/:id` → StrongBaseDetail.vue 不变。
- 组件差异：ChannelUniversities 点卡片→跳 `/university/:id`；ChannelDetail 点卡片→弹窗（需登录引导）。改动时别串。

## 密码规则全站统一（2026-08-21，方案 A，权威）
- **全站唯一密码规则：字母+数字，6-16 位**，正则 `^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$`，提示文案统一「密码必须是数字+字母，长度6-16位」。**新增任何密码输入入口（登录/注册/改密/重置/新增管理员）都必须用这个 pattern，禁止再出现 min/max 长度或其它字符规则**。
- 覆盖范围：后端 common `LoginDTO`、app `RegisterDTO`/`ForgotPasswordResetDTO`/`member PasswordUpdateDTO`、admin `profile PasswordUpdateDTO`/`AdminAddDTO`/`AdminUpdateDTO`（改密 2 个 DTO 于当日从旧规则改齐）；前端 admin 5 处（PasswordModal/AdminLoginForm/UserLoginForm/UserRegisterForm/AdminDetailModal）+ user 3 处（LoginCard/register/AccountInfo）。
- 历史坑（勿重蹈）：改密规则曾与登录规则不一致 → 用户设置 >16 位或纯数字密码后登录被 @Pattern 拦，**永远登不进去**。admin 改密曾要求 8-32+大小写数字，与登录 6-16 互斥。
- admin 改密弹窗 catch 已修透传 `err.message`（拦截器 reject 的是普通 Error）；user 改密弹窗有「确认新密码」字段，admin 本就有。
- 存量风险：历史上不合规的存量密码统一后无法登录，需走忘记密码重置。

## user 端登录引导弹窗（2026-08-21 统一，权威）
- **凡是「未登录拦截→提示去登录」的场景，一律用 `confirmLogin()`**（`utils/loginGuide.ts`，默认文案「登录后可查看详细内容」），不要再用 `ElMessageBox.confirm('请先登录...')`。用法：`userStore.setRedirectPath(xxx); if (await confirmLogin()) router.push('/login')`。
- **路由守卫（router/index.ts beforeEach）也已用 confirmLogin**（2026-08-22）：`requiresAuth` 路由未登录时 `if (await confirmLogin()) next({name:'Login'}) else next(false)`。新增 requiresAuth 路由自动生效。**改登录引导弹窗前先全局搜「请先登录/您还没有登录/去登录」，页面内与守卫都要覆盖。**
- 主题（变体2 横幅点睛版）：顶部 88px 金→橙渐变横幅（锁图标+「登录后解锁完整内容」）+ 浅橙渐变卡身 + 橙渐变按钮；样式集中在 `index.css` 的 `.login-guide-box`（`login-guide__banner/__body/__title/__desc`）。
- 坑：element-plus 2.13.7 `ElMessageBoxOptions` 类型**没有 width/showHeader**，用 CSS 控制（.login-guide-box{width:360px}、.el-message-box__header{display:none}），别传这些 option 否则 typecheck 报 TS2353。

## git 红线
- 每个任务收尾必 commit（至少 `git add -A && git commit`）；`git pull --rebase` 前先确认 `git status` 干净，否则静默丢弃未提交修改（2026-08-02 曾从 stash 找回城市模块）。
- 用户明确"不要 git commit"的任务（如纯样式优化）遵守，但要在记忆里标注遗留未提交改动。

## user 端导航响应式断点（改导航必须逐档验证）
| 断点 | 行为 | 状态 |
|------|------|------|
| <768px | 汉堡抽屉 MobileNavDrawer | ✅ |
| 768~1700px | 桌面 nav +「更多」折叠 | ✅ |
| ≥1700px | 完整菜单 space-between | ✅ |
| ≥2100px | 容器 max-width:2100 封顶，两侧留白（预期，非 bug） | ⚠️ |

## 已知坑：详情页根容器背景被全局规则强制透出暖橙（2026-08-17）
- `apps/user/src/assets/styles/index.css` 有 `.app-shell main > *, #app > * { background-color: transparent !important; background-image: none !important; }`，**路由组件根 `<div>` 的背景被强制透明**，透出 `html` 的暖橙画布（`#fff7ed` 径向渐变）。
- 后果：详情页根 div 写 `bg-gradient-to-b from-slate-50 to-white`（冷灰）**不会生效**，页面整体仍是暖橙底（与 `AGENTS.md`「白底透橘」画布一致）。
- 真正呈现效果：「**暖橙底 + 白卡 + 橙 Hero**」——这就是专业详情页 `major/Detail.vue` 的实际观感（虽然代码写的也是冷灰，但被透明）。做 mockup 原型时**别用 widget 自带冷灰容器误导用户**，页面底色就是暖橙。
- 用户体感"区分度好" = 暖橙底白卡对比清晰，**不是冷灰底**。做详情页标准：①根 div 不写背景（让它透出暖橙）；②内容卡用 `bg-white border-gray-100` 与背景拉开；③Hero 保留橙渐变做品牌。
- **不要给根 div 加 `background: ... !important` 强行覆盖**——会破坏全局设计意图（白底透橘），且原型/mockup 画冷灰底是错的设计稿，应改 mockup 而不是改代码。
- **重要补充（2026-08-17，踩坑）**：上面那条说"根容器透出暖橙"只是表面——**`.app-shell main > *` 选择器会命中详情页组件内部嵌套 `<main>` 的直接子 = 各张卡片**，强制 `background-color: transparent !important`，把卡片的 `bg-white` 直接压没（scoped 类的 specificity 高，但 `!important` > 普通规则 specificity，所以普通 `bg-white` 输）。结果用户看到的"暖橙卡片"其实是透明卡片 + 底层暖橙 html 画布。专业详情页也踩这个坑（所以"区分度好"其实是「暖橙底 + 白字内容」风格，并非真正的白卡）。
- **修复**：在用户要求"卡片必须白"时，详情页里所有大块卡片（`.detail-card`/`.stat-card`/`.prospect-card`/`.major-card`/`.city-card`/`.team-card`/`.stage-badge` 等）必须在 `<style scoped>` 加 `background: #ffffff !important;`，压过全局 `transparent !important`。内层 `<main>` 本身透明没问题（让页面底色透出）。
- **再补充（2026-08-17）**：Hero（`.lab-hero` / `.dept-hero` 等带渐变的"展示名称"section）**同样会被全局 `background-image: none !important` 清掉渐变**变成透明、透出 html 浅橙画布。要让 Hero 是真正的实心橙渐变（不是透出浅橙），必须给 Hero 的 `background: linear-gradient(...)` 加 `!important`。上一轮只给白色卡片加了 `!important`，漏了 Hero，导致 Hero 看起来是浅橙而不是品牌橙——切记**所有需要"实心背景"的区块（白卡 + 橙 Hero）一律 `!important`**。

## 已知坑：OSS SDK 预签名响应头 3.17.4 仅 ResponseHeaderOverrides API（2026-08-23）
- **根因**：`aliyun-sdk-oss:3.17.4` 这一版 `GeneratePresignedUrlRequest.setResponseHeaders` 形参类型就是 `ResponseHeaderOverrides`，**既无 `setResponseDisposition(String)` 也无 `setResponseHeaders(Map)`**（这两个是 3.18+/3.19+ 才引入）。项目未锁更高版本，所以编译只能用旧式 API。
- **正确写法**（haifeng-common `OssService.generatePresignedUrl(objectKey, downloadFileName)`）：
  ```java
  ResponseHeaderOverrides responseHeaders = new ResponseHeaderOverrides();
  // URLEncoder 是表单编码（空格→+），RFC 5987 attr-value 须 percent-encoded（空格→%20），
  // 否则浏览器文件名显示为 +（实测：吉晨峰 · … → 吉晨峰+·+…）
  responseHeaders.setContentDisposition("attachment; filename*=UTF-8''"
          + URLEncoder.encode(downloadFileName, StandardCharsets.UTF_8).replace("+", "%20"));
  request.setResponseHeaders(responseHeaders);
  ```
- **预览/下载 URL 分离**：KKFileView 预览必须用【干净】OSS 预签名 URL（不带 disposition），下载才带 disposition；否则 KKFileView 解析 `response-content-disposition` 的 `+`/中文百分号编码时 500。
- **KKFileView 预览 url 参数编码**（fileload 专栏页）：**标准 Base64 + 再 URL 编码**（`Base64.getEncoder()` + `URLEncoder.encode(b64)`），**不是** URL-safe Base64（KKFileView 用 Spring Base64Utils 标准解码，`_` → `Illegal base64 character 5f`），也**不是**百分号编码原文（`:` → `3a`）；且 KKFileView 会再 `URLDecoder.decode` 一次源 URL（`%2B`→`+` 被 OSS 当空格 → 签名 403），须**先 `url.replace("%","%25")` 双重编码**再 Base64（docx 必现，PDF 靠运气）。详见 `2026-08-23.md`「专栏文件三修复」。
- **不是依赖冲突、不是被降级**：四个 pom 仅 common 一处声明 3.17.4，其余依赖均不传 OSS，本地 `.m2` 也只有 3.17.4（已解包 jar 核实 `GeneratePresignedUrlRequest` 无 `setResponseDisposition`）。**无需钉版本、无需查依赖树**。
- **教训**：下次改 `OssService` 预签名 URL 响应头一律用 `ResponseHeaderOverrides.setContentDisposition`；编译器报 `setResponseHeaders(ResponseHeaderOverrides) cannot be applied to (Map)` 即铁证该版本 API=ResponseHeaderOverrides。完整排查见 `2026-08-23.md` 文末「OSS SDK API 误判更正」。

## 后端已知坑汇总（用户历史总结，2026-08-23 沉淀，权威参考）
> 以下为用户在多次踩坑后亲自整理的清单，涉及 MyBatis-Plus / 事务 / 校验 / 幂等等。@TableLogic+@Version+updateById 静默失效已于当日（2026-08-23）在 fileload 模块实锤并重修。

| 类别 | 要点 |
|------|------|
| MP 逻辑删除/乐观锁 | **@TableLogic + @Version + `updateById` 组合会导致逻辑删除/更新静默不生效（影响行数 0 但方法不抛异常、返回 200）**。fileload 模块已于 2026-08-23 改用 `LambdaUpdateWrapper` 显式 SET（`entity=null` 绕开 @TableLogic 拦截）修复。**新增任何带 @TableLogic/@Version 实体的写操作，禁止用 `updateById(entity)` 做逻辑删除/局部更新，统一用 `UpdateWrapper`**。 |
| 乐观锁 | 高并发 `updateById` 在 version 不匹配时必抛 OptimisticLockException；写操作务必校验 version 并在影响行数=0 时显式抛业务异常，不要静默吞。 |
| 事务 | 缺 `@Transactional` 的地方（写多表/写+OSS）要补；但注意 `@Transactional` 内调 `generatePresignedUrl`（每次 createClient+shutdown）不影响正确性，仅性能。 |
| 硬删除 | `hardDeleteById` 可能引入孤儿引用 / 悬空；优先逻辑删除；跨表删除前必须评估外键引用。 |
| DTO/Entity 类型 | DTO 字段类型必须与 DB 列类型一致，否则转换失败；`BeanUtils.copyProperties` 会把 DTO 中未传字段覆盖为 null（DTO 字段可选时，改部分字段会丢失已有值）——**局部更新必须用 UpdateWrapper 而非 copyProperties 全覆盖**。 |
| 校验注解 | 列表/集合参数用 `@NotEmpty`+`@Size(max=100)` 而非 `@NotNull`；`@NotBlank` 优于 `@NotNull`（防空串绕过）；`@RequestBody` 必须配 `@Valid`、`@PathVariable` 配 `@Validated` 才触发校验。 |
| LIKE 查询 | 必须 `@Size(max=50)` 限制长度，防超长注入/全表扫。 |
| 性能 | `page()`/`detail()` 用 `BeanUtils.copyProperties` 反射复制性能差，量大建议手动 set 或 MapStruct。 |
| 幂等 | 佣金/下单等写操作必须幂等（同订单重复调用不能重复加余额/建记录）。 |
| SQL 边界 | `year` 等可 NULL 字段用 `= NULL` 永远 false，应 `IS NULL`；Mapper XML 中 `subjects &&` / `@>` 对空数组边界行为需显式处理。 |
| 关联表一致性 | 改源表（如 t_major 专业名）不会自动同步关联表里的冗余字段（major_name），需业务层同步或去掉冗余。 |
| 雪花 ID | `SnowflakeIdGenerator` 是静态调用，不要在 Spring Bean 里当实例方法用。 |
| 日志 | 禁止打印完整手机号（脱敏）；删除上千条时不要打印完整 ID 列表（截断或只打数量）；关键写操作补 `@OperationLog`。 |
| HTTP 语义 | 批量删除用 `@PostMapping`（兼容所有代理/网关），不要 HTTP DELETE + Body。 |

## 已知坑：fileload admin 端"删除/update 静默失效 + 下载 NoSuchKey"（2026-08-23 实锤修复）
- **删除/update 静默失效**：admin `FileLoadServiceImpl` 早期用 `updateById(entity)` 做软删除/局部更新，受 `@TableLogic`+`@Version` 干扰，影响行数=0 但 MP 不抛异常 → 接口 200、库 `is_deleted` 仍 false。铁证：`SELECT id,file_name,is_deleted,version FROM t_file_info WHERE id=2091526091121496064` → `false,0`。**修复**：delete/update 改用 `LambdaUpdateWrapper`（entity=null 绕开 @TableLogic，显式 SET + `setSql("version=version+1")`，影响行数 0 抛 409）。
- **下载 NoSuchKey（admin 端）**：admin 与 user 端 `detail()` 生成下载 URL 代码逐行一致（同用 `generatePresignedUrl(fileUrl, fileName)`，fileUrl 存纯 objectKey `haifeng/files/uuid.ext`），前端下载按钮点 `detailData.fileUrl` 也正确。若 admin 仍报 NoSuchKey 而 OSS 控制台有该文件、user 端能下，优先核对：①该记录的 `file_url` DB 字段值是否真的是纯 `haifeng/files/...`（无 bucket 前缀）；②admin 启动时的 `OSS_BUCKET_NAME`/`OSS_ENDPOINT` 环境变量是否和 user 端一致（同一 `.env`，但 admin 若用不同启动方式可能覆盖）。
- **上传秒传隐患**：`upload()` 按 `file_md5` 查重，命中即返回 existing id 不再上传 OSS。若 existing 那条 OSS 文件已被删，新上传会复用指向已删 key → 下载 NoSuchKey。后续可加"秒传前校验 OSS 对象是否真存在"。
