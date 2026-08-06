# 项目长期记忆（海枫前端 monorepo）

## 通用规范
- 设计令牌见 `AGENTS.md`：主色 `#F97316` / 渐变端 `#FB923C`，暖色渐变页面背景，橙色渐变表头、药丸按钮、橙色顶底边框卡片。改动前逐条对照 Checklist。
- 约束：仅样式任务不动 `<script>` 逻辑；用 `min-width` 撑满数据列、`width` 只给窄固定列（状态/操作）。
- 类型检查：Vite dev 用 esbuild 不做类型检查；改 TS 后用 `cd apps/admin && ./node_modules/.bin/vue-tsc --noEmit -p tsconfig.json`（pnpm 不在 PATH，勿用 `pnpm --filter`）。

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

## 后端分页参数硬约束（所有继承 BasePageQueryDTO 的接口通用）
- 后端 `haifeng-common/.../dto/common/BasePageQueryDTO.java`：`size` 字段 `@Min(10,"每页最小10条")` + `@Max(100,"每页最大100条")`，默认 10；`page` `@Min(1)`。
- **前端坑**：user 端 `university/List.vue` 曾默认 `pageSize=9`、`page-sizes=[9,18,30]`，全 < 10 → 后端返回 `400 每页最小10条`，分页永远失败。已改为默认 12、`page-sizes=[12,24,36]`（3 列卡片网格，12 正好铺满 4 行）。
- **经验**：任何调用带 `size` 的分页接口的前端页面，`page-size` 默认值与 `page-sizes` 档位都必须落在 **[10,100]**，否则被 `@Min/@Max` 拦截。新增分页页前先确认后端该 DTO 的下限。
- 校验链路：`@Valid` 在 Controller 方法参数（`UniversityController.list(@Valid UniversityQueryDTO)`）→ Spring Validation 抛 `MethodArgumentNotValidException` → 全局异常处理器转 `R.fail(400, msg)`。

## 就业管理模块：前后端枚举值必须对齐（后端 @Pattern 是权威）
- 后端 `haifeng-admin` DTO 里用 `@Pattern` 硬编码枚举（如公务员 examType `国考|省考`、学历/学位/政治面貌/报名状态；事业单位学历 `无要求/...`、学位 `无要求/...`、状态 `招聘中|已结束`、标签 `热门|无|急招`）。**前端下拉选项必须与之一字不差**，否则新增/修改直接 400。
- 2026-07-31 踩坑：admin 公务员表单/搜索写 `['国家级','省级']`（user 端是 `['国考','省考']`），事业单位写 `['不限']`/`['在招','未发布']`，且标签用自由输入框 → 全部必报错。已修：civil 2 处、institution 5 处（含 positionTag 改 select）。
- 改就业模块前先 grep 后端 `dto/employment/**` 的 `@Pattern` 清单，再对照前端 `*Options` 数组；选项文本改动要同时查该模块的 FormModal / Search / Table（含 pill 映射）/ index.vue（状态切换判断）。
- 事业单位/公务员状态接口 body 是数字 `StatusDTO{status}`（0=招聘中/报名中，1=已结束），不是字符串；表格下拉 command 拿到的中文值需自行映射回 0/1。
- 后端 Excel 导入的 `validateExcelRows` 通常只查非空不查枚举，导入可绕过 create 校验（公务员已补 examType 校验，其他模块若加需逐个补）。
- **第三层校验：DB CHECK 约束（最终权威）**——迁移文件 V20（教师/医疗/金融）、V21（基层/社区/公益）、V22（指南/公告）、V23（公务员/事业单位/军文职/选调生）建表时还有 CHECK 约束，DTO 无 @Pattern 的模块（军文职/选调生/社区/公益/金融/医疗/教师等）由 DB 兜底拦截，报错特征：`violates check constraint "chk_xxx"`。军文职学历合法值"本科及以上/硕士及以上/博士"、状态"进行中/已结束"；选调生类型"定向/非定向/急需紧缺专业选调"；社区"网格员/调解员/安全员/社会工作师/综合岗"+社工证"不要求/XX社工师"；公益岗类别带"类"；医疗"妇幼保健院/未定级"；教师学科"道德与法治"。**前端选项必须以 DB CHECK 为准**。
- 状态接口分两类：公务员/事业单位 PATCH 数字 `StatusDTO{status}`；军文职/选调生等其余模块 PATCH 字符串 `PositionStatusUpdateDTO{positionStatus}`。

## 已知坑：admin 状态切换全部失败 = 后端 CORS 缺 PATCH
- 现象：任意模块操作栏"状态下拉"点了都报"操作失败"，后端日志只见 `Securing OPTIONS /.../status`、无 PATCH。
- 根因：`haifeng-common/CorsConfig.java` 的 `allowedMethods` 曾缺 `PATCH`（2026-07-31 已补上）。**改 CorsConfig 时不要把 PATCH 弄丢**，否则 12 个模块的 @PatchMapping 状态接口全挂。
- 诊断套路：前端报"操作失败"+后端只见 OPTIONS 预检 → 先查后端 CORS `allowedMethods` 是否含该 HTTP 方法（GET/POST/PUT/DELETE/PATCH/OPTIONS）。
- 公务员状态语义：状态接口 `StatusDTO{status}` 仅两态（0=报名中，1=已结束），"即将开始"只能靠 create/表单设置，操作栏下拉不得含第三态。

## 已知坑：前端"操作失败"吞掉后端真实错误信息（拦截器包装）
- `packages/shared/src/utils/request.ts` 响应拦截器（:117 与 :49）把所有错误 `reject(new Error(message))`（message 取自 `error.response.data.msg`）——**reject 的是普通 Error，没有 .response 属性**。
- 因此页面 catch 写 `err.response?.data?.msg || 'xxx失败'` 永远取到 undefined → 显示兜底文案，后端真实原因（如"学历要求不能为空"）被吞。
- 正确写法：`err.response?.data?.msg || err.message || '兜底文案'`（err.message 就是后端 msg）。**新建页面/模块一律用这种写法**；搜 `err.response?.data?.msg` 可排查存量隐患。
- 就业管理 14 文件已修 + 选调生表单补前端必填校验（2026-07-31）；guide/notice 是 catch 无参形态（固定文案），未修。

## 已知坑：后端 @NotBlank 无 message → 报错只显示"不能为空"（无字段名）
- 部分就业模块 DTO（如基层项目 `GrassrootsProjectPositionAddDTO`）的 `@NotBlank`/`@Size` 没写 message，校验失败经 `GlobalExceptionHandler` 返回的就是默认文案"不能为空"（多个字段逗号拼接），管理员看不出缺哪个字段。
- 排查：`grep @NotBlank` 后端 `dto/employment/**`，没 message 的就是隐患。
- 已修：选调生（本就带 message）、基层项目 7 个字段补 message（2026-07-31，需重启后端生效）。前端对应表单（selection/grassroots FormModal）已加必填校验提前拦截。
- 2026-07-31 全量统一：社区/公益岗 DTO 也补了 message（各 6 字段）；**全部 12 个就业表单前端都已加必填校验**（civil/institution/military/selection/teacher/healthcare/finance/community/welfare/grassroots/notice/guide），与后端 @NotBlank 对齐。改表单必填校验时以后端 AddDTO @NotBlank 为权威清单。

## 已知坑：MyBatis-Plus 全局逻辑删除下 updateById 排除 is_deleted
- `application-dev/prod.yml` 配置了 `logic-delete-field: isDeleted`（logic-delete-value: true / not-delete-value: false）。后果：
  - **`entity.setIsDeleted(true) + updateById` 永远写不进 is_deleted**（updateById 自动排除逻辑删除字段）→ 12 个就业模块旧 delete() 全部"成功但删不掉"。
  - selectById/selectPage 自动追加 `is_deleted=false` 条件。
  - 改 is_deleted 的正确姿势：`mapper.update(null, Wrappers.lambdaUpdate(X.class).set(X::getIsDeleted, val).eq(X::getId, id))`；软删用 `mapper.deleteById(id)`（自动转 UPDATE）。
- **物理删除**：自定义 `@Delete("DELETE FROM t_xxx WHERE id=#{id}")`（不被逻辑删除拦截器转换）；批量用 `<script><foreach>` IN。12 个就业模块 Mapper 已加 physicalDeleteById/physicalDeleteBatchIds（2026-07-31）。
- 删除语义（2026-07-31 用户确认）：**禁用=软删除（is_deleted=true 隐藏），删除/批量删除=物理删除**（不可恢复）。前端按钮文案统一"删除"。
- **查禁用/查全部必须自定义 SQL**：MP 逻辑删除自动注入 is_deleted=false 只作用于 MP 内置方法（selectPage/selectList/selectById），**XML/注解自定义 SQL 不受影响**。guide/notice 的 page() 已改自定义 XML 分页查询（2026-07-31），支持 status 三态（0 启用/1 禁用/null 全部）+ 数组列 resultMap（StringArrayTypeHandler）。其他模块如需"查禁用"沿用此模式。
- **更新/删除/状态切换碰禁用记录也必须自定义 SQL**：MP 的 `updateById`、`update(entity/wrapper)`、`deleteById` **都会自动注入 WHERE is_deleted=false**（2026-07-31 两次踩坑实证）——对已禁用记录一律 0 行。guide/notice 的 updateStatus 用 @Update 直写 is_deleted、update() 用 XML 动态 update、delete 用 @Delete 物理删。**凡是可能操作 is_deleted=true 记录的方法，一律自定义 SQL，不要用 MP 内置方法。**




## 已知坑：git pull --rebase 静默丢弃未提交修改（2026-08-02 实踩）
- 现象：某文件"修复过又变回旧版"——git log 全历史都查不到修复内容 = **修复从未 commit，被 `git pull --rebase` Fast-forward 覆盖丢弃**。
- 找回：`git stash list`（WIP 条目保存了当时工作区）→ `git show "stash@{n}:完整路径" > 文件` 逐文件恢复（不弹栈、不破坏 stash）。恢复后 git status 呈 M/?? 状态，需重新 commit。
- 预防：**每个任务收尾必 commit**（至少 `git add -A && git commit`），或暂不提交时 `git stash` 留底；`git pull --rebase` 前先确认 `git status` 干净。参考：城市模块 city/list + JsonbArrayEditor 曾整体丢失后从 stash@{2} 找回。

## user 端导航栏响应式断点规范（多分辨率适配 / 设计提醒）
改动导航/菜单布局时，必须按以下 4 档断点逐一验证，不能只在单一宽度截图确认。

| 断点 | 导航行为 | 适用设备 / 新场景 | 状态 |
|------|----------|-------------------|------|
| `< 768px` | 汉堡抽屉 `MobileNavDrawer` | 手机竖屏/横屏、小平板 | ✅ 正常 |
| `768 ~ 1700px` | 桌面 nav + 动态「更多」折叠 | 13~16" 笔记本、横屏平板（截图2 即此档） | ✅ 正常 |
| `≥ 1700px` | 完整 12 菜单 + `space-between` 摊满 | 24 寸+ 台式显示器 | ✅ 正常 |
| `≥ 2100px`（27" 4K/5K+） | 居中容器到达上限 `max-width:2100px`，两侧留白 | 27" 及以上大屏 | ⚠️ 有空白 |

注意事项：
- **第 4 档「两侧留白」是居中布局的天道，不是 bug**：容器 `max-width` 封顶后，超出部分天然左右留白。若要消除空白需抬高上限（不推荐，会破坏大屏可读性），属预期行为，勿当成缺陷修。
- **尺寸即场景**：每档对应一类真实使用场景（手机 / 笔记本 / 24" 台式 / 27" 大屏），验收时要覆盖这 4 类，而非只看开发机宽度。
- 动态「更多」折叠档（768~1700）在菜单项增减时要确认折叠阈值与 ellipsis 兜底正确，避免 12 项在窄笔记本下溢出或误折叠。
- 汉堡抽屉档（<768）确认 `MobileNavDrawer` 抽屉宽度、滚动、遮罩点击关闭在真机/DevTools 设备模拟下无异常。
