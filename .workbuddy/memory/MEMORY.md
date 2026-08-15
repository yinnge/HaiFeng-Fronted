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

## git 红线
- 每个任务收尾必 commit（至少 `git add -A && git commit`）；`git pull --rebase` 前先确认 `git status` 干净，否则静默丢弃未提交修改（2026-08-02 曾从 stash 找回城市模块）。

## user 端导航响应式断点（改导航必须逐档验证）
| 断点 | 行为 | 状态 |
|------|------|------|
| <768px | 汉堡抽屉 MobileNavDrawer | ✅ |
| 768~1700px | 桌面 nav +「更多」折叠 | ✅ |
| ≥1700px | 完整菜单 space-between | ✅ |
| ≥2100px | 容器 max-width:2100 封顶，两侧留白（预期，非 bug） | ⚠️ |
