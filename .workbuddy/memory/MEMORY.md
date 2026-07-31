# 项目长期记忆（海枫前端 monorepo）

## 通用规范
- 设计令牌见 `AGENTS.md`：主色 `#F97316` / 渐变端 `#FB923C`，暖色渐变页面背景，橙色渐变表头、药丸按钮、橙色顶底边框卡片。改动前逐条对照 Checklist。
- 约束：仅样式任务不动 `<script>` 逻辑；用 `min-width` 撑满数据列、`width` 只给窄固定列（状态/操作）。
- 类型检查：`pnpm --filter @haifeng/admin typecheck`（或 user）。Vite dev 用 esbuild 不做类型检查，CSS 改动不影响 dev 运行。

## 已知坑：Element Plus 弹窗锁滚动 + scrollbar-gutter 抖动
- 现象：`el-dialog`（lock-scroll 默认开）打开时，`useLockscreen` 给 `body` 加 `el-popup-parent--hidden`（`overflow:hidden`），并**内联** `body.style.width = calc(100% - 滚动条宽)` 补偿位移。
- 若全局已用 `html,body{ scrollbar-gutter: stable }` 预留滚动条位置，二者会**重复计算**：gutter 占一份 + body 再缩一份 → 打开弹窗内容左移抖动。
- 干净修法（user 端已采用）：保留 `scrollbar-gutter: stable`，并加 `body.el-popup-parent--hidden{ width:100% !important; overflow:hidden }` 覆盖内联收缩（gutter 已留好位置，body 无需再缩）。
- admin 端当前用的是另一种 hack：`.el-popup-parent--hidden{ overflow:scroll !important }`（强制常驻滚动条轨道来防抖，略丑但能用）。如需统一为 user 端的 scrollbar-gutter 方案，需确认 admin 真实滚动容器（admin 多为定高布局 + 嵌套滚动容器，谨慎改动）。
- 验证：浏览器实测 localhost:3001 个人中心，逐个点开弹窗看右侧是否不再抖动。CSS 改动 Vite HMR 即时生效。

## admin 控制面板「系统信息」字段来源（跨端：后端 haifeng-admin）
- 接口：`GET /api/v1/admin/dashboard/overview` → `DashboardController.getDashboardOverview()` → `DashboardServiceImpl.getSystemInfo()`（《DashboardServiceImpl.java:109-126》）。
- `appVersion`：**改为读取 pom 版本**（2026-07-31）。后端 `haifeng-admin/pom.xml` 已给 `spring-boot-maven-plugin` 加 `build-info` goal；`DashboardServiceImpl` 通过 `ObjectProvider<BuildProperties>` 注入，`info.setAppVersion(bp.getVersion())`，未生成 build-info 时回退 `"1.0.0"`。改版本号改 pom 的 `<version>`（admin 继承父 pom `1.0.0-SNAPSHOT`）。springVersion/javaVersion 仍硬编码未展示。
- `siteName` / `aiProvider` / `aiModel`：来自 DB 表 `system_settings`（单例 id=1），经 `systemSettingsMapper.selectById(1L)` 读取（`DashboardServiceImpl.java:115-120`）。
- **AI 配置两表设计（关键）**：`t_model_provider`（V24 迁移）是**服务商目录**（api_key/base_url/model_name/provider_name/status）；`system_settings.provider_name` / `model_name` 是**"当前选中"指针**，只能经 `updateProviderModel` 写入（校验该 provider 在 `t_model_provider` 存在且启用）。**dashboard 读的是 system_settings 的指针，不是 t_model_provider 目录**。
- **aiProvider/aiModel 为 null 的根因**：前端此前**没有任何 UI 调用 `updateProviderModel`**（仅在 `api/system/settings.ts` 定义了函数，无调用点），所以配置进目录后指针始终为 null。已在 `system/settings/components/ProviderCard.vue` 新增「设为当前模型」按钮（调 `updateProviderModel`），并对当前激活行打「当前」徽标。配置后 dashboard 即显示。
- `adminCount`：`sys_admin` 表 `status=1` 计数（`sysAdminMapper.selectCount`）。
- 关键区分：面板上的「AI 模型」仅是展示配置字符串，**dashboard 不发起 AI 调用**；真正调 AI 大模型由 `system_settings` 的 providerName+modelName+apiNumber(API Key) 驱动，逻辑在后端 AI/对话模块（common 的 AI 客户端），不在 admin system 包。
