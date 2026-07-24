# 管理端-城市/行业/资源管理模块设计文档

**日期：** 2026-07-19
**模块：** city（城市管理）、industry（行业管理）、resource（资源管理）
**路由前缀：** `/city`、`/industry`、`/resource`

---

## 1. 概述

城市、行业、资源管理模块为管理员提供城市信息、行业数据、学习资源的增删改查及批量导入功能，用于支撑高考志愿规划的地域与行业分析。

采用与首页模块一致的布局风格：白色卡片搜索栏 + 白色表格区域 + Element Plus 组件 + el-tag 友好展示状态。

---

## 2. 页面结构

### 2.1 路由结构

```
/permission                 # 权限管理（父模块，level=1）
├── /permission/admin       # 管理员账号管理（level=2）
├── /permission/role        # 角色管理（level=2）
└── /permission/module      # 模块菜单管理（level=2）

/city                       # 城市管理（level=1）
└── /city/list              # 城市列表（默认跳转，level=2）

/industry                   # 行业管理（level=1）
└── /industry/list          # 行业列表（默认跳转，level=2）

/resource                   # 资源管理（level=1）
└── /resource/list          # 资源列表（默认跳转，level=2）
```

### 2.2 通用布局

每个页面采用上中结构：
- **上方**：全局导航栏（Navbar，含个人中心和退出登录）
- **左侧**：侧边栏（Sidebar，三级树形菜单）
- **中间内容区**：
  - 搜索栏（白色卡片，`rounded-lg bg-white p-5`）
  - 操作栏（新增/导入/批量操作按钮 + 刷新）
  - 表格区域（白色卡片，`rounded-lg bg-white p-5`，含分页）
  - Dialog（新增/修改/详情）

---

## 3. 城市管理页（/city/list）

### 3.1 搜索条件

| 字段 | 组件 | 说明 |
|------|------|------|
| cityName | el-input | 城市名称模糊搜索 |
| province | el-input | 省份模糊搜索 |
| region | el-input | 所属地区模糊搜索 |

三个条件平铺，查询/重置按钮。

### 3.2 操作栏

| 按钮 | 类型 | 说明 |
|------|------|------|
| 新增城市 | el-button type="primary" | 打开新增弹窗 |
| Excel导入▼ | el-dropdown | 下拉：导入城市主表 / 导入城市详情 |
| 批量永久删除 | el-button type="danger" | 选中行后激活，POST `/batch/delete` |
| 刷新 | el-button | 重新加载数据 |

### 3.3 表格列

| 列 | 宽度 | 展示 |
|----|------|------|
| ID | 140px | - |
| 城市名称 | 150px | - |
| 省份 | 120px | - |
| 高校数量 | 100px | - |
| 重点高校数量 | 110px | - |
| 常住人口(万) | 120px | - |
| 状态 | 80px | **启用** `el-tag type="success"` / **禁用** `el-tag type="info"` |
| 创建时间 | 180px | - |
| 操作 | 260px | 详情/修改/禁用启用/永久删除 |

**注意：** 状态字段 isDeleted，true=禁用(灰色标签)，false=启用(绿色标签)

### 3.4 操作列按钮

| 按钮 | 触发 | 说明 |
|------|------|------|
| 详情 | 打开详情 Dialog（el-descriptions只读） | 调 GET `/{id}` |
| 修改 | 打开修改 Dialog（带标签页） | - |
| 禁用/启用 | 状态切换 | 调 PUT `/{id}/status`，confirm 确认 |
| 永久删除 | 单条硬删除 | 调 DELETE `/{id}`，confirm 警告(红色) |

### 3.5 新增/修改 Dialog

**尺寸：** 800px 宽度

**Tab ① - 基本信息**

城市名称* (input, max 50) | 省份* (input, max 30) | 所属地区* (input, max 20)
城市简介 (textarea) | 高校数量 (input-number) | 重点高校数量 (input-number)
常住人口(万) (input-number) | GDP(亿元) (input-number)

新增调 `POST /`，修改调 `PUT /{id}`。

**Tab ② - 详细信息**

**基础数据分组：**
- 面积(km²) | 副标题 | 城市级别(下拉：直辖市/省会城市/地级市/县级市)
- 行政区划代码 | 人均GDP(万元) | 城镇化率(%)
- GDP增长率(%) | 农村人口比例(%) | 老龄化率(%)
- 外来人口比例(%) | 世界500强企业数量

**产业信息分组：**
- 产业描述 (textarea)
- 主要产业 (输入框，逗号分隔)
- 新兴产业 (输入框，逗号分隔)

**JSONB数据分组（文本框粘贴JSON格式）：**
- 产业结构 | 未来规划 | 高等教育 | 基础教育
- 企业统计 | 房价水平 | 租房成本 | 住房政策
- 消费数据 | 就业数据 | 交通数据 | 医疗数据 | 文化旅游

修改调用 `PUT /{id}/detail`。

### 3.6 详情 Dialog

使用 `el-descriptions border :column="2"`，按基本信息/详细信息分组展示所有字段。
JSONB字段用 `<pre>` 标签格式化展示。

### 3.7 Excel导入

**导入城市主表：** 弹窗上传 .xlsx 文件，调 `POST /import`，展示后端返回的错误信息（如有）。
**导入城市详情：** 弹窗上传 .xlsx 文件（14个Sheet），调 `POST /import-detail`。

### 3.8 分页

支持 10/20/30/50/100 条每页，`el-pagination` 组件。

---

## 4. 行业管理页（/industry/list）

### 4.1 搜索条件

| 字段 | 组件 | 说明 |
|------|------|------|
| industryName | el-input | 行业名称模糊搜索 |
| category | el-input | 行业分类模糊搜索 |
| talentTrend | el-select | 人才趋势筛选，选项：上升/稳定/下降 |

### 4.2 操作栏

| 按钮 | 类型 | 说明 |
|------|------|------|
| 新增行业 | el-button type="primary" | 打开新增弹窗 |
| Excel导入▼ | el-dropdown | 下拉：导入行业主表 / 导入行业详情 |
| 批量永久删除 | el-button type="danger" | POST `/batch/delete` |
| 刷新 | el-button | 重新加载数据 |

### 4.3 表格列

| 列 | 宽度 | 展示 |
|----|------|------|
| ID | 140px | - |
| 行业名称 | 180px | - |
| 行业分类 | 120px | - |
| 人才趋势 | 100px | 上升 `el-tag success` / 稳定 `warning` / 下降 `danger` |
| 年增长率(%) | 100px | - |
| 状态 | 80px | 启用 `success` / 禁用 `info` |
| 创建时间 | 180px | - |
| 操作 | 260px | 详情/修改/禁用启用/永久删除 |

### 4.4 新增/修改 Dialog

**尺寸：** 800px

**Tab ① - 基本信息**

行业名称* (input, max 100) | 行业分类 (input, max 50) | 图标样式类名 (input)
行业描述 (textarea) | 年增长率(%) (input-number) | 市场规模 (input)
人才缺口 (input) | 投资热度(%) (input-number, 0-100)
增长趋势 (select: 上升/稳定/下降)
市场趋势 (select: 上升/稳定/下降)
人才趋势 (select: 上升/稳定/下降)
投资趋势 (select: 上升/稳定/下降)

**Tab ② - 详细信息**

简短描述 (input, max 500) | 详细描述 (textarea)

**JSONB数据（文本框粘贴JSON格式）：**
发展规模 | 人才需求 | 行业薪资 | 政策信息
发展支持 | 人才分析 | 人才政策 | 薪资数据

### 4.5 Excel导入

- **导入行业主表：** POST `/import`，上传 .xlsx（1个Sheet）
- **导入行业详情：** POST `/import-detail`，上传 .xlsx（9个Sheet）

---

## 5. 资源管理页（/resource/list）

### 5.1 搜索条件

| 字段 | 组件 | 说明 |
|------|------|------|
| resourceName | el-input | 资源名称模糊搜索 |
| category | el-input | 分类模糊搜索 |

### 5.2 操作栏

| 按钮 | 类型 | 说明 |
|------|------|------|
| 新增资源 | el-button type="primary" | 打开新增弹窗 |
| Excel导入 | el-button | 上传 .xlsx，调 `POST /import` |
| 批量下架 | el-button type="danger" | 批量软删除，POST `/batch-delete`，最多100条 |
| 刷新 | el-button | 重新加载数据 |

### 5.3 表格列

| 列 | 宽度 | 展示 |
|----|------|------|
| ID | 140px | - |
| 资源名称 | 200px | show-overflow-tooltip |
| 分类 | 120px | - |
| 文件类型 | 100px | PDF/视频/压缩包 |
| 浏览量 | 100px | - |
| 状态 | 80px | 启用 `success` / 禁用 `info` |
| 更新时间 | 180px | - |
| 操作 | 240px | 详情/修改/禁用启用/下架 |

**注意：** 不展示 sortOrder（排序序号）字段。

### 5.4 新增/修改 Dialog

**尺寸：** 700px（单页，无标签页）

资源名称* (input, max 100) | 资源URL* (input, max 500) | 访问码 (input, max 50)
分类 (input, max 50) | 文件类型 (input, max 20) | 排序序号 (input-number)
封面URL (input, max 500) | 描述 (textarea, max 1000)

### 5.5 操作说明

- **下架** = 单条软删除，调 `DELETE /{id}`，提示"确定下架该资源吗？下架后可恢复"
- **批量下架** = 批量软删除，调 `POST /batch-delete`，选中行后激活
- **禁用/启用** = 状态切换，调 `PUT /{id}/status`

---

## 6. 错误处理规范

| 场景 | 处理方式 |
|------|----------|
| 列表加载失败 | ElMessage.error('获取列表失败') |
| 操作成功 | ElMessage.success('操作成功') |
| 操作失败 | ElMessage.error(res.data.msg \|\| '操作失败') |
| 参数校验 | 前端必填校验 + 后端错误码提示 |
| Excel导入错误 | 弹窗展示后端返回的批量错误信息 |

所有接口返回非 200 code 时均需展示后端返回的 msg。

---

## 7. 权限模块编码

| 路由 | 模块编码 |
|------|----------|
| /city/list | city_info |
| /industry/list | industry_info |
| /resource/list | resource_info |

---

## 8. 路由定义

```ts
// city 路由
const cityRoutes: RouteRecordRaw = {
  path: '/city',
  name: 'City',
  meta: { title: '城市管理', icon: 'MapLocation' },
  redirect: '/city/list',
  children: [
    {
      path: 'list',
      name: 'CityList',
      component: () => import('@/views/city/list/index.vue'),
      meta: { title: '城市管理', moduleCode: 'city_info' },
    },
  ],
}

// industry 路由
const industryRoutes: RouteRecordRaw = {
  path: '/industry',
  name: 'Industry',
  meta: { title: '行业管理', icon: 'DataLine' },
  redirect: '/industry/list',
  children: [
    {
      path: 'list',
      name: 'IndustryList',
      component: () => import('@/views/industry/list/index.vue'),
      meta: { title: '行业管理', moduleCode: 'industry_info' },
    },
  ],
}

// resource 路由
const resourceRoutes: RouteRecordRaw = {
  path: '/resource',
  name: 'Resource',
  meta: { title: '资源管理', icon: 'Collection' },
  redirect: '/resource/list',
  children: [
    {
      path: 'list',
      name: 'ResourceList',
      component: () => import('@/views/resource/list/index.vue'),
      meta: { title: '资源管理', moduleCode: 'resource_info' },
    },
  ],
}
```
