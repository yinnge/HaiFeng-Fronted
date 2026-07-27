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
- 表头：橙色渐变背景 + 白色粗体文字
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

---

## 改动前 Checklist

每次新增或修改模块前，逐项自检：

- [ ] 页面背景是否为暖色渐变 + 枫叶水印？
- [ ] 页面是否有标题 + 副标题？
- [ ] 操作按钮是否为橙色渐变药丸（主）/ 描边圆角（次）？
- [ ] 卡片是否有橙色顶底边框 + hover 动效？
- [ ] 表格表头是否为橙色渐变 + 自定义分页？
- [ ] 搜索栏是否左右对齐 + 药丸标题？
- [ ] 弹窗是否圆角 + 橙色分隔线？
- [ ] 标签/Tag 是否为药丸样式（非 Element Plus 默认）？

---

## 禁止事项

- ❌ 禁止使用 Element Plus 默认灰色按钮作为主操作
- ❌ 禁止使用 `el-card` 默认样式（用自定义卡片 + 橙色边框替代）
- ❌ 禁止使用 `el-table` 默认表头样式（必须自定义橙色渐变表头）
- ❌ 禁止页面无背景装饰（每个页面必须有暖色渐变背景）
- ❌ 禁止按钮无圆角（统一 `border-radius: 20px` 药丸形）
- ❌ 禁止硬编码颜色（品牌色使用上述色值变量）