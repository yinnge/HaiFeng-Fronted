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

## 详情页暖橙底（2026-08-17）
`index.css` 全局 `.app-shell main > *, #app > *{background:transparent!important;background-image:none!important}` 强制透出 html 暖橙画布（`#fff7ed`）。要实心白卡/橙 Hero 必须在其 `<style scoped>` 加 `background:#fff!important` / `linear-gradient(...)!important`。根 div 不写背景。

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

## git 红线
收尾必 commit；`git pull --rebase` 前确认 `git status` 干净。

## ★ NEW：tokenVersion 致会话失效 / VIP 不实时（2026-08-25）
- **机制**：`JwtAuthenticationFilter.isTokenVersionValid()` 拿 token 内 `tokenVersion` 与 **Redis** `haifeng:token:version:{userType}:{id}` 比对；Redis 无该 key 直接放行（本地无 Redis 故本地不触发），生产有值则版本不符→`AuthUser` 不写入 SecurityContext→`getCurrentMemberId()` 返回 null→`selectById(null)` 抛「用户不存在」。刷新 token 不校验 tokenVersion（只校验 refresh 串），故版本不符只让 access token 失效。
- **触发点（生产 bug）**：`MemberServiceImpl.upgradeMember` 与 `MemberOrderServiceImpl`（订单确认/撤销）在**会员类型变更**时 `setTokenVersion(+1)` 并写 Redis → 用户旧会话立即失效→点按钮报「用户不存在」、须重登。本地无 Redis 故无感 = 用户说的「本地没事、生产报错」。
- **修复（2026-08-25 已实施）**：会员升级/订单确认/撤销**不再 bump tokenVersion**（仅密码修改、账号禁用等安全事件才 bump）。VIP 实时性改为 `AuthAspect.checkVip` 回退 DB 查 `member.isVipActive()`（注入 `MemberMapper`），admin 升级后 VIP 立即生效、无需重登/等刷新。前端 `apps/user/src/main.ts` 增加 `focus`/`visibilitychange` 时 `fetchUserInfo()` 同步 VIP 徽标。
- **教训**：token 版本号只用于「强制重登」类安全事件；会员权益授予/变更不得 bump，否则生产 Redis 直接废掉用户会话。

## 问题2（admin 端 token 过期显示横杠 -）根因
admin `main.ts` 已注册 `setSessionExpiredHandler`（非可关闭弹窗+重定向 `/admin/login`），逻辑与 user 端一致；admin 刷新 token 不校验 version。生产仍显示「-」通常是**旧生产包未含 handler**（dev HMR 有、prod 需重新 `pnpm --filter @haifeng/admin|user build`）。重新构建部署即修复。
