# 项目长期记忆（海枫前端 monorepo）

## 通用规范
- 设计令牌见 `AGENTS.md`：品牌主色 `#F97316` / 渐变端 `#FB923C`（两端共享），admin 端暖橙渐变+橙色顶底边框卡片，user 端橙渐变顶边+纯白卡片+橙色块（postgraduate 风格，见下方 User 端规范）。改动前逐条对照对应端的 Checklist。
- **根背景橙色不可变**：user 端 `html` 全局暖橙画布（背景 `#ffedd5` + 顶部/底部透白雾 + 三道光晕，见 `apps/user/src/assets/styles/index.css`）是品牌底色，**任何改动不得修改它**。页面内容容器透明底露出画布，卡片内部才使用白色 / 橙色块。
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

## 后端分页参数硬约束（所有继承 BasePageQueryDTO 的接口通用）
- 后端 `haifeng-common/.../dto/common/BasePageQueryDTO.java`：`size` 字段 `@Min(10,"每页最小10条")` + `@Max(100,"每页最大100条")`，默认 10；`page` `@Min(1)`。
- **前端坑**：user 端 `university/List.vue` 曾默认 `pageSize=9`、`page-sizes=[9,18,30]`，全 < 10 → 后端返回 `400 每页最小10条`，分页永远失败。已改为默认 12、`page-sizes=[12,24,36]`（3 列卡片网格，12 正好铺满 4 行）。
- **经验**：任何调用带 `size` 的分页接口的前端页面，`page-size` 默认值与 `page-sizes` 档位都必须落在 **[10,100]**，否则被 `@Min/@Max` 拦截。新增分页页前先确认后端该 DTO 的下限。
- 校验链路：`@Valid` 在 Controller 方法参数（`UniversityController.list(@Valid UniversityQueryDTO)`）→ Spring Validation 抛 `MethodArgumentNotValidException` → 全局异常处理器转 `R.fail(400, msg)`。
  3.⚠️ 唯一要守住的规矩：应用 JVM 还在跑的时候，不要执行 mvn clean / mvnw clean / IDE 的 Rebuild / Build Project。本项目没引入 spring-boot-devtools，没有安全热更新机制，磁盘改写和运行时类加载一旦撞车，就会再次出现 $Builder 缺失这类 NoClassDefFoundError。
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



# 海枫管理后台前端设计规范 [vue]

## Design Read

Reading this as: 企业级后台管理系统界面 redesign for 管理员用户, with a 高效、稳定、现代化的 B2B 产品语言, leaning toward a customized enterprise design system with strong brand identity.

目标：
重新设计海枫管理后台整体视觉风格，优化体验、品牌色统一、交互稳定性以及后台系统专业感。

教育规划平台前端，核心功能：高考志愿填报。采用 **Monorepo 单仓库** 架构：

| 应用 | 路径 | 说明 | UI 框架 |
|------|------|------|---------|
| Admin 管理后台 | `apps/admin/` | 面向管理员 | Element Plus |
| User 用户端 | `apps/user/` | 面向 C 端用户 | 待定 |
| Shared 共享包 | `packages/shared/` | 对应后端 common | - |


## 技术栈选型

* **核心框架**: Vue 3.x (严格使用 Composition API + `<script setup>`)
* **构建工具**: Vite
* **开发语言**: TypeScript (必须严格定义 API 响应类型、DTO/VO 的 Interface)
* **路由管理**: Vue Router 4
* **状态管理**: Pinia
* **UI 框架**: Element Plus (管理后台) / 待定 (用户端)
* **CSS 框架**: Tailwind CSS
* **HTTP 客户端**: Axios (需封装拦截器处理双 Token)
* **包管理**: pnpm (Monorepo)

---

## UI 设计规范

### 品牌色
- 主色 `#F97316`，渐变端 `#FB923C`，hover `#EA580C`，active `#C2410C`
- 主操作统一使用橙色渐变 `linear-gradient(135deg, #F97316, #FB923C)`

### 页面背景
- 所有管理页面统一暖色渐变：`linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%)`
- 枫叶 logo 水印 `@/assets/images/logo-main.png`，`opacity: 0.05`，右上 + 左下各一个，`pointer-events: none`

### 卡片（Card）
- 白色背景 `#fff`，`border-radius: 12px`
- 顶部 `3px solid #F97316`，底部 `3px solid #FB923C`
- hover：`box-shadow: 0 4px 16px rgba(249,115,22,0.08)` + `translateY(-1px)`

### 按钮（Button）
- 主操作：橙色渐变药丸 `border-radius: 20px`，带图标，hover 微上浮
- 次操作：白色底 + `#d1d5db` 描边 + `border-radius: 20px`
- 危险操作：红色渐变药丸 `linear-gradient(135deg, #ef4444, #f87171)`

### 药丸标签（Pill Label）
- 区域标题：橙色渐变底 + 白字 + 图标 + `border-radius: 20px`
- 数据标签：浅橙渐变底 + 深橙文字 + `border-radius: 20px`

### 表格（Table）
- 表头：浅橙渐变背景 `linear-gradient(180deg, #fff7ed, #ffedd5)` + 深色文字 `#1f2937` + 橙色底边框 `2px solid #F97316`
- 行 hover：浅橙渐变 `rgba(249,115,22,0.03~0.07)`
- 斑马纹：`rgba(255,247,237,0.3)`
- 分页当前页：橙色渐变圆角

### 搜索/筛选栏
- 卡片容器（橙色顶底边框）
- 筛选字段左对齐 + 按钮右对齐（`margin-left: auto`）
- 输入框 hover/focus 时橙色边框

### 弹窗（Dialog）
- `border-radius: 12px`，标题栏底部橙色分隔线
- `el-descriptions` 标签列使用浅橙背景 `rgba(249,115,22,0.05)`

### 页面标题
- 左上角：标题（`22px / 700 / #1f2937`）+ 副标题（`#9ca3af`）

### 分页展示注意事项
- 不展示id【隐藏】

---

## 改动前 Checklist

每次新增或修改模块前，逐项自检：

- [ ] 页面背景是否为暖色渐变 + 枫叶水印？
- [ ] 页面是否有标题 + 副标题？
- [ ] 操作按钮是否为橙色渐变药丸（主）/ 描边圆角（次）？
- [ ] 卡片是否有橙色顶底边框 + hover 动效？
- [ ] 表格表头是否为浅橙渐变 + 深色文字 + 橙色底边框？
- [ ] 搜索栏是否左右对齐 + 药丸标题？
- [ ] 弹窗是否圆角 + 橙色分隔线？
- [ ] 标签/Tag 是否为药丸样式（非 Element Plus 默认）？

---

## 禁止事项

- ❌ 禁止使用 Element Plus 默认灰色按钮作为主操作
- ❌ 禁止使用 `el-card` 默认样式（用自定义卡片 + 橙色边框替代）
- ❌ 禁止使用 `el-table` 默认表头样式（必须自定义浅橙渐变表头 + 橙色底边框）
- ❌ 禁止页面无背景装饰（每个页面必须有暖色渐变背景）
- ❌ 禁止按钮无圆角（统一 `border-radius: 20px` 药丸形）
- ❌ 禁止硬编码颜色（品牌色使用上述色值变量）

---

# User 端 UI 设计规范 [vue]

## Design Read

Reading this as: C端教育规划平台界面 for 高考学生/家长/研究生, with a 清爽、鲜明、专业的内容驱动产品语言, leaning toward 橙渐变顶边白卡片 + 橙色强调块 + 数据驱动写入.

目标：
User 端面向 C 端用户（高考学生/家长/研究生），核心功能：高考志愿填报、院校查询、内容专栏。视觉风格统一为「橙渐变顶边 + 纯白卡片 + 橙色块」：卡片纯白底、`1px` 橙描边、顶部橙渐变粗边（`border-image`）；强调元素（徽标/按钮/竖条/圆点/统计数字）用橙色渐变或浅橙底。参考实现：`apps/user/src/views/postgraduate/index.vue`、`apps/user/src/views/postgraduate/first-year.vue`。

## UI 设计规范

### 品牌色（与 admin 共享 token）
- 主色 `#F97316`，渐变端 `#FB923C`，hover `#EA580C`，active `#C2410C`
- 强调文字橙 `#e8722a`（徽标/指南标题/链接文字）
- 主渐变 `linear-gradient(90deg, #f97316, #fb923c)`（按钮 / 顶边 / 竖条 / 圆点 / 渐变文字）

### 页面根背景（**不可变**）
- `html` 全局暖橙画布：`background-color: #ffedd5` + 顶部/底部透白雾 + 三道光晕（已在 `apps/user/src/assets/styles/index.css` 实现）。**任何改动不得修改 html 画布**，只允许在页面内层做白色 / 橙色块。
- 页面内容容器 `.xx-page`：`max-width: 1280px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem;`，背景透明露出画布（禁止给根容器整屏铺色）。

### Hero（页面首屏区块，可选）
- 背景：半透明暖白渐变 `linear-gradient(160deg, rgba(255,255,255,0.92), rgba(255,247,237,0.92))`
- 边框：`1px solid rgba(249,115,22,0.18)` + 渐变顶边 + 圆角 `1.5rem` + 阴影 `0 10px 40px rgba(249,115,22,0.1)`
- 徽标 `.xx-hero-badge`：浅橙渐变底 + 深橙字 + 橙描边药丸（`linear-gradient(90deg, rgba(249,115,22,0.12), rgba(251,146,60,0.12))` + 文字 `#e8722a` + `border: 1px solid rgba(249,115,22,0.25)` + `border-radius: 9999px`）
- 标题：`clamp(1.6rem, 2.6vw, 2.6rem)` / `font-weight: 800` / `#1f2937`
- 统计数字：橙渐变文字（`background: linear-gradient(135deg, #f97316, #fb923c); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent`）

### 卡片（Card）
- 背景纯白 `#ffffff`，圆角 `1rem`
- 描边 `1px solid rgba(249,115,22,0.15)`
- **渐变顶边（标志性，必须保留）**：
  ```css
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  ```
- 阴影 `0 4px 20px rgba(249,115,22,0.06)`
- hover：`translateY(-6px)` + `box-shadow: 0 14px 34px rgba(249,115,22,0.14)` + 描边加深 `rgba(249,115,22,0.35)`
- 内层小卡（如 tips 卡）：浅橙渐变底 `linear-gradient(160deg, #fffdf9, #fff7ed)` + `1px solid rgba(249,115,22,0.12)`，hover 上浮 `-4px`

### 橙色块（强调元素）
- 区域标题：左侧 4px 橙渐变竖条（`::before`，`linear-gradient(180deg, #f97316, #fb923c)`，宽 4px 高 1.25rem 圆角）+ `1.5rem / 800 / #1f2937`
- 药丸徽标/标签：浅橙渐变底 + `#e8722a` 文字 + `1px solid rgba(249,115,22,0.25)` + `border-radius: 9999px`
- 按钮 `.xx-btn`：橙渐变底 `linear-gradient(90deg, #f97316, #fb923c)` + 白字 + `border-radius: 9999px` + 阴影 `0 4px 14px rgba(249,115,22,0.28)`，hover 上浮 `-2px` + 阴影增强
- 模块图标底：浅橙渐变圆角方块（`linear-gradient(135deg, rgba(249,115,22,0.12), rgba(251,146,60,0.12))` + `1px solid rgba(249,115,22,0.22)` + `border-radius: 0.75~0.9rem`）
- 列表圆点：橙渐变小圆点（`width/height: 0.45rem; border-radius: 50%; background: linear-gradient(135deg, #f97316, #fb923c)`）
- 指南块：浅橙渐变底 `linear-gradient(135deg, rgba(249,115,22,0.06), rgba(251,146,60,0.06))` + `1px dashed rgba(249,115,22,0.35)`，内部小项白底 + 橙描边

### 文字层级（三级灰）
- 标题：`#1f2937` / `font-weight: 700~800`
- 正文/描述：`#6b7280`；列表项：`#4b5563`
- 辅助文字：`#9ca3af`
- 品牌强调：`#e8722a` / 橙渐变文字（统计数字、重要数值）

### 图标
- **统一使用 SVG 语义图标（禁止 emoji）**，`stroke-width="2"`、`w-4 h-4` 基准；徽标/模块图标底内放 SVG 白/橙图标
- 注：参考文件当前实现为 emoji，按本规范后续改造时应替换为 SVG

### 写入手法（数据驱动）
- 页面内容由 `<script setup>` 中的 `interface` + 常量数组驱动，模板 `v-for` 渲染，避免手写重复 DOM：
  - 定义 `interface StageItem / ModuleItem` 等，字段含 `title / desc / btn / route / developing / features[]` 等
  - 跳转统一 `go(item)`：`developing` 标记的弹「该功能正在开发中」（`ElMessage.info`），有 `route` 的 `router.push`
- 内容区块结构：`Hero（可选）→ section（标题 + 副标题 + 卡片网格）`
- 网格：`display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem`（自适应列数）

### 参考实现
- `apps/user/src/views/postgraduate/index.vue`：Hero + 阶段导航卡（4 张白卡）+ 核心模块卡（3 张白卡 + features 列表）
- `apps/user/src/views/postgraduate/first-year.vue`：模块块（白卡大容器）+ 内层提示卡网格 + 指南块（虚线橙描边）

---

## 改动前 Checklist（User 端）

每次新增或修改 user 端模块前，逐项自检：

- [ ] `html` 全局暖橙画布（`#ffedd5` + 白雾 + 光晕）未被改动？
- [ ] 页面根容器是否透明底 + `max-width: 1280px` 居中（未整屏铺色）？
- [ ] 卡片是否纯白 `#ffffff` + `1px` 橙描边 + 渐变顶边（`border-image`）？
- [ ] 卡片 hover 是否上浮 + 橙阴影增强？
- [ ] 强调元素是否橙色系（徽标 / 按钮 / 竖条 / 圆点 / 渐变文字）？
- [ ] 主按钮是否为橙渐变药丸 + 白字？
- [ ] 图标是否全部 SVG（无 emoji）？
- [ ] 内容是否数据驱动（`interface` + 数组 + `v-for`）？
- [ ] 文字层级是否为三级灰 + 橙强调？
- [ ] 跳转是否统一 `go(item)`（`developing` 弹「开发中」）？

---

## 禁止事项（User 端）

- ❌ 禁止修改 `html` 全局暖橙画布背景（**根背景橙色不可变**）
- ❌ 禁止卡片使用无色细边 `border-gray-100/60` / 纯白微灰渐变（必须白底 + 橙描边 + 渐变顶边）
- ❌ 禁止卡片缺少渐变顶边（标志性 `border-image` 顶边必须保留）
- ❌ 禁止使用 emoji 图标（统一 SVG 语义图标）
- ❌ 禁止页面根容器整屏铺色 / 不透明背景（必须露出全局暖橙画布）
- ❌ 禁止硬编码颜色（品牌色用上述色值）
- ❌ 禁止按钮无圆角（统一 `border-radius: 9999px` 药丸形）