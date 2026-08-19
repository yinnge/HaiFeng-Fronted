# 项目长期记忆（海枫前端 monorepo）

> 详细「已知坑」以仓库内 `AGENTS.md` 为**权威**（它随仓库走、内容更全），本文件只留跨会话高频要点 + AGENTS.md 之外的事实。

## 通用规范（速查）
- 设计令牌：品牌主色 `#e8722a`（brand-orange）；admin 暖橙渐变+橙色顶底边框卡片，user 纯白微灰+细边卡片。改样式前对照 `AGENTS.md` 对应端 Checklist；仅样式任务不动 `<script>`。
- 数据列用 `min-width` 撑满，`width` 只给窄固定列（状态/操作）。
- 类型检查：`pnpm --filter @haifeng/admin typecheck`（或 user）；Vite dev 用 esbuild 不做类型检查。
- **环境**：bash 里 `pnpm` 失效，用 PowerShell 调 `E:\Nodejs\node_global\pnpm.cmd`；后端无 devtools，改 Java 必重启生效。
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
