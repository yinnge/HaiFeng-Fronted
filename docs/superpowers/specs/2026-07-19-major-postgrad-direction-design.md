# 考研专业关联管理模块 - 前端设计规范

## 概述

本模块实现本科专业与考研方向的多对多关联管理，属于「专业管理」父模块下的「专业考研关联」子模块。

- 模块编码: `major_postgraduate`
- 路由路径: `/major/postgrad-direction`
- 路由名称: `MajorPostgradDirection`
- 基础 API: `/api/v1/admin/major-postgrad-direction`

## 页面布局

沿用管理后台统一布局：
- 左侧全局导航栏（侧边栏），「专业管理」父模块下新增二级导航项
- 右侧白色卡片式内容区，背景色 `#f0f2f5`

## 路由与导航

在 `router/modules/major.ts` 的 `children` 中添加：

```ts
{
  path: 'postgrad-direction',
  name: 'MajorPostgradDirection',
  component: () => import('@/views/major/postgrad-direction/index.vue'),
  meta: { title: '专业考研关联', moduleCode: 'major_postgraduate' },
}
```

侧边栏位置：
```
▼ 专业管理
   ├── 专业列表
   ├── 考研专业
   ├── 考研专业大学关联
   └── 专业考研关联      ← 新增
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/list?page=&size=&majorName=&postgradMajorName=` | 分页查询列表（支持模糊搜索） |
| GET | `/{id}` | 获取详情 |
| POST | `/add` | 新增关联 |
| PUT | `/{id}` | 修改关联 |
| DELETE | `/{id}` | 硬删除 |
| POST | `/batch-delete` | 批量硬删除 |
| POST | `/import` | xlsx 导入 |

### ListVO 字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键 |
| majorName | String | 本科专业名称 |
| postgradMajorName | String | 考研专业名称 |
| createdAt | String | 创建时间 |

### DetailVO 字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键 |
| majorId | Long | 本科专业ID |
| postgradMajorId | Long | 考研专业ID |
| majorName | String | 本科专业名称 |
| postgradMajorName | String | 考研专业名称 |
| sortOrder | Integer | 排序权重 |
| createdAt | String | 创建时间 |

### AddDTO / UpdateDTO
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| majorId | Long | 是 | 本科专业ID |
| postgradMajorId | Long | 是 | 考研专业ID |
| sortOrder | Integer | 否 | 排序权重 |

### ImportResultVO
| 字段 | 类型 | 说明 |
|------|------|------|
| total | Integer | 总条数 |
| success | Integer | 成功条数 |
| failed | Integer | 失败条数 |
| errors | String[] | 错误信息列表 |

## 页面设计

### 搜索栏（白色卡片）
```
[本科专业名称 输入框] [考研专业名称 输入框] [查询] [重置]
```

### 操作栏
```
左侧: [新增关联] (primary)  [导入关联数据]
右侧: [批量硬删除] (danger, 选中时启用)  [刷新]
```

### 数据表格（白色卡片，stripe 条纹）
| 列 | 宽度 | 说明 |
|----|------|------|
| 选择框 | 50px | type="selection" |
| ID | 140px | prop="id" |
| 本科专业名称 | min-width 180px | show-overflow-tooltip |
| 考研专业名称 | min-width 180px | show-overflow-tooltip |
| 创建时间 | 180px | prop="createdAt" |
| 操作 | 220px | fixed="right", 详见下方 |

**操作列按钮：**
- 详情: `type="primary" link`
- 修改: `type="warning" link`
- 硬删除: `type="danger" link` → 弹出警告确认框

### 分页
- page-sizes: `[10, 20, 30, 50, 100]`
- layout: `"total, sizes, prev, pager, next"`

### 弹窗（el-dialog, 700px）

**详情模式：** el-descriptions border + 2列
- ID, 本科专业名称, 考研专业名称, 排序权重, 创建时间

**新增/修改模式：** el-form
- 本科专业: el-select + filterable + remote 搜索（调用 getMajorPage）
- 考研专业: el-select + filterable + remote 搜索（调用 getPostgradMajorPage）
- 排序权重: el-input-number (min=0, 非必填)

## 交互细节

1. **新增关联** → 打开弹窗 mode='add' → 填写表单 → POST /add → 成功后关闭弹窗并刷新列表
2. **修改** → 打开弹窗 mode='edit' → GET 详情回填表单 → PUT /{id} → 刷新
3. **详情** → 打开弹窗 mode='detail' → GET 详情只读展示
4. **单条硬删除** → ElMessageBox.confirm(type='warning') → DELETE /{id} → 刷新
5. **批量硬删除** → 勾选行 → 点击「批量硬删除」→ 确认 → POST /batch-delete → 刷新
6. **导入** → 创建隐藏 input[type=file] accept='.xlsx,.xls' → 选文件 → POST /import → 显示导入结果（成功/失败详情）
7. **报错处理** → 所有 API 调用失败时，用 ElMessage.error 展示后端返回的 res.data.msg

## 文件清单

| 文件 | 操作 |
|------|------|
| `apps/admin/src/types/major/postgrad-direction.ts` | 新建 - 类型定义 (ListVO, DetailVO, QueryDTO, AddDTO, UpdateDTO) |
| `apps/admin/src/types/major/index.ts` | 修改 - 导出新类型 |
| `apps/admin/src/api/major/index.ts` | 修改 - 添加 API 函数 |
| `apps/admin/src/views/major/postgrad-direction/index.vue` | 新建 - 页面组件 |
| `apps/admin/src/router/modules/major.ts` | 修改 - 添加路由 |
