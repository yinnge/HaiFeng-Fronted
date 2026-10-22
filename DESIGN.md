# 文件列表 & 详情页优化方案
## 任务
修改：/college，在大学专栏里面有一个大学资料的路由模块。现在需要修改他们，优化界面。


文件列表界面和文件详情界面该怎么优化？

1. **视觉问题**：橙色边框病"复发"了，而且这次是在**容器级别**复发（不是卡片级别）

下面分别拆解。

---

## 一、视觉问题：橙框病在"容器级别"复发

我们在 CODEBUDDY.md 里定的规则主要是针对"**卡片（card）**"不能用橙色硬边框，但这次的页面证明了同一个毛病会在更大的尺度上重演——**区块容器（section）** 也被套上了同样的橙色描边逻辑。

### 具体病灶清单

| 区域 | 当前做法 | 违反的规则 |
|---|---|---|
| 顶部"大学专栏·精选学习资料"介绍框 | 米黄底 + 隐约橙色氛围 | 整个页面已经有全局网格背景做氛围了，这里再叠一层橙色渐变底色，等于"氛围感"打架，显得脏 |
| "筛选"区块容器 | 白底 + 完整橙色描边包围 | **典型的"四边硬框包围"**，和卡片一样犯规 |
| "文件列表"标题区块 | 橙色实心药丸标签当**区域标题** | 橙色被当成"万能标题底色"到处用 |
| "筛选""文件列表"两个胶囊标签 | 橙色填充 | 一个页面里短短几屏出现 5+ 处橙色色块，视觉疲劳 |
| 详情页整个白色容器 | 顶部+底部 2px 橙色描边线贯穿整个页面宽度 | 又是一次"用橙色给整块内容画框"，这正是我们改版前要根治的毛病 |
| 当前身份"大一"胶囊 | 橙色填充 | 这是一个**状态/身份标签**，不是强调重点，不该用品牌色 |

**本质问题**：设计系统2.0 定的规则范围局限在"卡片"这个最小单元，没有明确说"区块容器 / 页面级容器"同样适用这条规则，所以执行时"换了个尺度又把老毛病带回来了"。**这个要补充成一条通用铁律：任何矩形容器（不管是卡片、区块、整页外框），都不得用品牌色/语义色做四边包围描边，分隔一律靠背景色层次+阴影。**

### 修复方案

```css
/* ❌ 错误：区块容器橙框包围 */
.resource-hero, .filter-section, .file-list-section {
  border: 1px solid #FF8C3D;  /* 删除 */
}

/* ✅ 正确：扁平化处理，取消硬边框分隔 */
.resource-hero {
  background: #FFFFFF;               /* 不要米黄渐变底，交给全局网格背景做氛围 */
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 2px 8px var(--neutral-shadow);
  /* 可选：极简点缀——只在图标处保留一点橙色，而不是整块背景 */
}

.filter-section {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px var(--neutral-shadow);
  /* 不再需要边框 */
}

/* "筛选" "文件列表" 这类区域标题，改用左侧色条+文字，不用实心药丸 */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}
.section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--brand-orange), var(--brand-orange-light));
}
```

详情页的整页橙框同理，直接删除 `border-top/border-bottom`，改成卡片本身的阴影分隔即可。

### "当前身份"标签建议改色

这是一个**身份/状态标识**，语义上接近"信息类"而非"强调类"，按我们的四色语义表应该用**蓝色**：

```css
.identity-pill {
  background: var(--sem-blue-bg);
  color: var(--sem-blue);
}
```

---


## 二、列表卡片设计优化

修复数据问题后，卡片结构也需要同步升级为更符合"文件管理"场景的信息层级：

```
┌─────────────────────────────┐
│ ┌────┐                 [PDF] │  ← 文件类型徽标右上角浮标（保留，样式微调）
│ │ 📄 │                       │
│ └────┘                       │
│                               │
│ 高考志愿填报方案深度分析报告    │  ← 改为"真实文件名/标题"，而非UUID
│ [计算机科学] [重点推荐]        │  ← 改为映射后的中文语义标签
│ 481 KB · 2026-09-02           │  ← 次要信息合并一行，弱化处理
└─────────────────────────────┘
```

### 文件类型图标 Token 化（按文件类型分配语义色，而不是随意配色）

你现在 PDF=红、图片=紫 的配色思路是对的（按类型区分色彩），建议把这套配色关系做成一个**固定的 token 表**，后续所有文件类型统一遵守，不要每加一种类型就随手配一个颜色：

```js
// fileTypeStyle.js
export const FILE_TYPE_STYLE = {
  pdf:   { label: 'PDF',  color: '#EF4444', bg: 'linear-gradient(135deg,#FEF2F2,#FEE2E2)' },
  image: { label: '图片', color: '#8B5CF6', bg: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)' },
  word:  { label: 'Word', color: '#3B82F6', bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' },
  excel: { label: 'Excel',color: '#22C55E', bg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)' },
  ppt:   { label: 'PPT',  color: '#F59E0B', bg: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)' },
  zip:   { label: '压缩包',color: '#64748B', bg: 'linear-gradient(135deg,#F8FAFC,#F1F5F9)' },
}
```

图标容器按「设计系统2.0 第三章」的立体细节标准重做（当前图1的图标是纯色平涂方块，偏单薄）：

```css
.file-icon-badge {
  width: 56px; height: 56px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: var(--file-type-bg);              /* 由JS注入，来自上面token表 */
  box-shadow: inset 0 1px 2px rgba(255,255,255,0.7),
              0 1px 4px rgba(0,0,0,0.06);
}
.file-icon-badge svg {
  width: 26px; height: 26px;
  color: var(--file-type-color);
}
.file-type-corner-badge {
  position: absolute; top: 10px; right: 10px;
  font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 6px;
  background: var(--file-type-color);
  color: #fff;
}
```

### 卡片整体容器（去掉米黄渐变缩略图底，改中性色）

```css
.file-card {
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--neutral-shadow);
  border: 1px solid var(--neutral-border);
  transition: all .25s;
}
.file-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px var(--neutral-shadow-hover);
}
.file-card__thumb {
  background: #F8FAFC;   /* 不要米黄渐变，中性底 */
  padding: 28px 0;
  display: flex; justify-content: center;
  position: relative;
}
.file-card__body { padding: 14px 16px 16px; }
.file-card__title {
  font-size: 14px; font-weight: 600; color: #1f2937;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.file-card__meta {
  display: flex; gap: 6px; margin: 8px 0;
}
.file-card__footer {
  display: flex; justify-content: space-between;
  font-size: 12px; color: #94A3B8;
}
```

---

## 四、详情页优化

### 1. 整页去橙框（已在第一部分说明），改为白卡阴影

### 2. 右侧信息面板：用映射后的数据渲染

```
┌─────────────────────────────┐
│ [PDF] 高考志愿填报方案深度分析报告.pdf │ ← 真实文件名，不是UUID
├─────────────────────────────┤
│ 基础信息                      │
│ 文件大小    481 KB            │
│ 上传时间    2026-09-02        │
│ 所属专栏    大学专栏           │
├─────────────────────────────┤
│ 分类                         │
│ 学科       计算机科学与技术     │ ← 映射后文字，不是324
│ 适用阶段    大一              │
├─────────────────────────────┤
│ 文档简介                      │
│ 本文深度解析山西省2026年高考...  │ ← 真实简介文字，不是4324
├─────────────────────────────┤
│ 标签                         │
│ [重点推荐] [高考志愿]          │ ← 映射后文字，不是344
└─────────────────────────────┘
```

每个信息分组之间，**用极淡的分隔线代替独立边框盒子**：

```css
.detail-panel-group {
  padding: 16px 0;
  border-bottom: 1px solid var(--neutral-border);
}
.detail-panel-group:last-child { border-bottom: none; }
.detail-panel-label { font-size: 12px; color: #94A3B8; margin-bottom: 8px; }
.detail-panel-value { font-size: 14px; color: #1f2937; font-weight: 500; }
```

### 3. kkfileview 预览区域的"工业灰"观感优化

当前预览区域左右两边是 kkfileview 默认的深灰色背景，和整体浅色、精致的设计语言格格不入，属于**"第三方组件默认样式没有被二次包装"**的典型问题。建议：

```css
.preview-iframe-wrapper {
  border-radius: 16px;
  overflow: hidden;              /* 关键：把iframe四个角"裁"成圆角 */
  box-shadow: 0 4px 20px var(--neutral-shadow);
  background: #F1F5F9;           /* 把kkfileview默认的深炭灰，换成和全局背景协调的浅灰 */
}
.preview-iframe-wrapper iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
```

**额外建议**：kkfileview 本身的背景色可以通过它的配置文件/URL参数自定义（它支持传 `office_preview_switch_disabled` 等参数，具体看你用的版本是否支持自定义背景色/工具栏颜色），如果支持，直接把它的深灰背景改成 `#F1F5F9` 这种和你全站一致的浅灰，比在外层套壳更彻底。如果不支持，就用上面"外层包裹+圆角裁切+阴影"的方案做视觉兼容处理。

此外，加一个**骨架屏/加载状态**，因为 kkfileview 转码加载有时候会有延迟，白屏等待体验差：

```vue
<template>
  <div class="preview-iframe-wrapper">
    <div v-if="loading" class="preview-skeleton">
      <el-skeleton :rows="8" animated />
    </div>
    <iframe
      v-show="!loading"
      :src="previewUrl"
      @load="loading = false"
    />
  </div>
</template>
```

### 4. 底部按钮

"下载文件""新窗口打开"两个按钮目前已经符合规范（主橙色按钮+次白底按钮），**这部分保留不动**。

---

## 五、补充到 AGENTS.md 的新条目（这次讨论的产出，下次统一收录时用）

```markdown
## 已知坑：橙框病在"容器级别"复发（设计系统2.0 补充条款）
- 2.0 版规则原文只强调"卡片不能用橙色硬边框"，但实际开发中该毛病会在更大尺度复现：
  区块容器（筛选区/列表标题区）、整页外层容器 同样被套上橙色四边描边或顶底描边。
- **补充铁律**：不管是卡片、区块(section)、还是整页容器，任何矩形区域都不得用品牌色/语义色做
  四边（或顶+底）包围描边。分隔一律用"背景色层次 + box-shadow"，颜色只允许用在：
  左侧4px色条标题、图标、文字强调、徽标/标签这些"点状/线状局部元素"上。
- 排查方法：search 项目内 `border.*#FF` / `border-top.*border-bottom` 组合出现在
  non-card 的 section/wrapper/container 类名上的写法，均需按此条款改为阴影方案。

## 已知坑：文件资料模块 —— 原始数据库字段/UUID 直接渲染给用户（P0，高于样式优先级）
- 现象：文件列表卡片标题显示 OSS 存储用的 UUID 文件名（如 `74ddb69d-0d85-...`），
  而不是用户上传时的原始文件名；学科/标签字段显示原始数据库ID数字（如 `324`、`344`），
  未转换成中文名称；详情页"文档简介"字段显示纯数字，疑似脏数据或字段错位。
- 根因：① 数据库设计缺失 original_name 字段，或前端渲染了 storage_name/storage_key
  而非 original_name；② 前端直接渲染外键ID，未做字典映射，或后端接口未返回 xxxName
  便捷字段；③ 简介字段数据本身异常，需回查该条记录的录入来源。
- 正确方案：
  1) 数据库层：文件表需同时保存 `storage_name`（OSS用，UUID）和 `original_name`
     （用户上传时的真实文件名，展示用），前端一律渲染 `original_name`。
  2) 接口层：涉及 subjectId/tagId 等外键的列表/详情接口，后端直接在返回体里多给一个
     `subjectName` / `tagNames` 字段，前端不自己维护字典做转换（减少前后端不一致风险）。
  3) 任何页面新增字段渲染前，先确认该字段是"原始外键ID"还是"展示用文本"，
     **严禁把裸ID/UUID/storage_key 直接丢进模板渲染**，这是比颜色/边框更高优先级的bug，
     属于"能不能用"级别而非"好不好看"级别。
- 适用范围：所有专栏（初中/高中/大学/考研等）的文件资料列表与详情页，结构相同，需统一排查。

## 第三方组件默认样式二次包装规范（kkfileview 等 iframe 嵌入场景）
- 第三方预览组件（kkfileview）自带的深灰背景/默认工具栏与站点整体浅色高级感不符，
  严禁直接裸露使用，必须用外层容器包裹：`border-radius` 裁切圆角 + `box-shadow` 阴影
  融入卡片体系 + 背景色替换为站点中性灰 `#F1F5F9`（若组件支持配置则优先改组件自身背景）。
- 预览加载需配 `el-skeleton` 骨架屏，避免 iframe 转码期间白屏。
```

---
