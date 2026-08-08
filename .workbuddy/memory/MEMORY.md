# 项目长期记忆（海枫前端 monorepo）

## 通用规范
- 设计令牌见 `AGENTS.md`：品牌主色 `#F97316` / 渐变端 `#FB923C`。user 端「橙渐变顶边白卡片+橙色块」（postgraduate 风格），admin 端暖橙渐变+橙色顶底边框卡片。改动前逐条对照对应端 Checklist。
- **根背景橙色不可变**：user 端 `html` 全局暖橙画布（`apps/user/src/assets/styles/index.css`）不可改；页面透明底露出画布，仅卡片内部用白/橙。
- 约束：仅样式任务不动 `<script>` 逻辑；`min-width` 撑数据列、`width` 只给窄固定列（状态/操作）。
- 类型检查：Vite dev 用 esbuild 不做类型检查；改 TS 后用 `apps/user/node_modules/.bin/vue-tsc --noEmit`（bash 里 pnpm 失效，用 PowerShell 调 `E:\Nodejs\node_global\pnpm.cmd`）。后端无 devtools，改 Java 必须重启后端生效。

## 已知坑：user 端卡片白底须 !important 覆盖透底规则
- 全站透底规则 `.app-shell main > * { background: transparent !important }` 会覆盖 `<main>` 直接子元素的白底。卡片若是 main 直接子（Detail/LaboratoryDetail/AdmissionGroupDetail/DepartmentDetail），`.univ-card` 必须 `background:#ffffff !important; background-image:none !important`。若包一层 `.xx-page` wrapper 变孙子则无需。
- postgraduate 参考实现用 `.pg-page` wrapper，卡片是孙子，正常白底即可。

## 已知坑：后端新增公开接口必须同步 SecurityConfig 白名单
- `haifeng-common/.../config/SecurityConfig.java` 的 `WHITE_LIST` 逐条精确路径匹配；不在白名单的公开接口未登录一律 401。新增 app 端无 @RequireLogin 的接口必须同步加白名单。

## 已知坑：Element Plus 弹窗锁滚动 + scrollbar-gutter 抖动
- user 端：`html,body{ scrollbar-gutter: stable }` + `body.el-popup-parent--hidden{ width:100% !important; overflow:hidden }` 覆盖内联收缩防抖。admin 用 `.el-popup-parent--hidden{ overflow:scroll !important }`。

## admin 控制面板「系统信息」来源
- `GET /api/v1/admin/dashboard/overview`。appVersion 读 pom 版本（build-info）；siteName/aiProvider/aiModel 读 DB `system_settings`（单例 id=1）；aiProvider/aiModel 为 null 因前端此前无 UI 调 `updateProviderModel`（已在 ProviderCard 加「设为当前模型」按钮）。dashboard 只读 system_settings 指针，不是 t_model_provider 目录。

## 后端分页参数硬约束（BasePageQueryDTO）
- `size` @Min(10)@Max(100) 默认10；`page` @Min(1)。前端 `page-size` 默认值与 `page-sizes` 档位必须落 [10,100]，否则 400。

## 就业管理模块：前后端枚举对齐（后端 @Pattern / DB CHECK 为权威）
- 前端下拉/标签选项须与后端 DTO @Pattern、迁移文件 DB CHECK 约束一字不差，否则新增/修改 400 / `violates check constraint`。状态接口：公务员/事业单位 PATCH 数字 `StatusDTO`；其余 PATCH 字符串 `PositionStatusUpdateDTO`。

## 已知坑：前端拦截器吞错误 / blob 放行
- 响应拦截器 reject 普通 Error（无 .response），正确写法 `err.response?.data?.msg || err.message || '兜底文案'`。
- 响应拦截器对 `config.responseType==='blob'||'arraybuffer'` 须直接 `return response`，否则二进制下载被当错误（AL7 导出 xlsx 踩坑）。

## 已知坑：MyBatis-Plus 逻辑删除
- `updateById/deleteById` 自动排除/注入 `is_deleted`；改/删禁用记录必须自定义 SQL（@Update/@Delete/XML）。语义：禁用=软删，删除/批量删除=物理删。

## 后端改动安全红线
- 应用 JVM 运行时**不要**执行 `mvn clean` / IDE Rebuild / Build Project（无 devtools，磁盘改写与类加载撞车会 NoClassDefFoundError）。改 haifeng-common 后必须重启后端，否则旧类导致 500。

## git 工作习惯
- 每个任务收尾必 commit；`git pull --rebase` 前确认 `git status` 干净（曾静默丢弃未提交修改，仅能从 `git stash list` 找回）。

## user 端导航栏响应式断点（4 档）
- `<768` 汉堡抽屉；`768~1700` 桌面+动态「更多」折叠；`≥1700` 完整菜单；`≥2100` 居中 `max-width:2100px` 两侧留白（预期行为，非 bug）。
