# 院校管理模块 — 前端设计文档

## 概述

基于现有管理后台首页模块(公告管理)的 CRUD 模式，实现院校管理模块的三个子页面：院校列表、校园图册、院校适应指南。

---

## 路由与侧边栏

### 路由配置

```typescript
// apps/admin/src/router/modules/university.ts
const universityRoutes: RouteRecordRaw = {
  path: '/university',
  name: 'University',
  meta: { title: '院校管理', icon: 'School' },
  redirect: '/university/info',
  children: [
    {
      path: 'info',
      component: () => import('@/views/university/info/index.vue'),
      meta: { title: '院校列表', moduleCode: 'university_info' },
    },
    {
      path: 'album',
      component: () => import('@/views/university/album/index.vue'),
      meta: { title: '校园图册', moduleCode: 'university_album' },
    },
    {
      path: 'guide',
      component: () => import('@/views/university/guide/index.vue'),
      meta: { title: '院校适应指南', moduleCode: 'university_guide' },
    },
  ],
}
```

### 侧边栏效果

```
院校管理 (School 图标)
├── 院校列表 (默认首页)
├── 校园图册
├── 院校适应指南
```

---

## 子页面设计

### 1. 院校列表页 (`university_info`)

**后端信息:**
- 模块代码: `university_info`
- 基础路径: `/api/v1/admin/university`
- 权限注解: `@RequireAdminModule("university_info")`

**搜索栏:**
| 字段 | 组件 | 说明 |
|------|------|------|
| 院校名称 | el-input | 模糊搜索，最长50字符 |
| 省份 | el-input | 精确匹配 |
| 院校类别 | el-select | 精确匹配 |
| 状态 | el-select | 全部 / 展示(1) / 下架(0) |
| 查询/重置 | el-button | 查询触发搜索，重置清空 |

**操作栏:**
| 按钮 | 说明 |
|------|------|
| 新增院校 | 打开新增 Dialog |
| 导入主表 | 上传 .xlsx/.xls → POST /import |
| 导入详情 | 上传 .xlsx/.xls → POST /import-detail |
| 批量下架 | 需选中数据，POST /batch-delete (软删除) |
| 批量永久删除 | 需选中数据，红色警告，POST /batch-hard-delete |
| 刷新 | 重新请求列表 |

**表格列:**
| 列 | 宽度 | 说明 |
|----|------|------|
| □(checkbox) | 50 | 多选用 |
| ID | 140 | 雪花算法ID |
| 院校名称 | min-width:180 | show-overflow-tooltip |
| 省份 | 120 | |
| 城市 | 120 | |
| 地区 | 100 | |
| 类别 | 100 | |
| 办学层次 | 100 | |
| 性质 | 80 | |
| 状态 | 100 | el-tag 展示/下架 |
| 创建时间 | 180 | |
| 操作 | 360 | fixed="right" |

**操作列按钮:** (5个按钮平铺)
| 按钮 | 类型 | 行为 |
|------|------|------|
| 详情 | primary link | 打开详情 Dialog |
| 修改 | warning link | 打开修改 Dialog |
| 禁用/启用 | info/success link | 切换 → PUT /{id}/status |
| 下架 | danger link | 确认 → DELETE /{id} (软删除) |
| 永久删除 | danger link | 红色警告 → DELETE /{id}/hard |

**Dialog - 详情模式 (el-tabs 分2个Tab):**

Tab1: 基础信息
| 字段 | 类型 |
|------|------|
| ID | Long |
| 院校名称 | String |
| 英文名称 | String |
| 省份/城市/地区 | String |
| 院校类别 | String |
| 专业数量 | Integer |
| 办学层次 | String |
| 院校性质 | String |
| 推免率/推免年份 | Decimal/Integer |
| 是否有博士点/硕士点 | Boolean |
| 隶属部门 | String |
| 院校标签 | Tag[] |
| 知名联盟 | String |
| 院校简介 | Textarea |
| 状态 | Tag |

Tab2: 详细信息
| 字段 | 类型 |
|------|------|
| 地址 | String |
| 招生电话 | String |
| 官方网站 | String |
| 历史组分数线 | Integer |
| 物理组分数线 | Integer |
| 出国比例/男女比例 | String |
| 软科/校友会/武书连/QS/USNEWS排名 | el-descriptions 展示4个排名 |
| 院校详细介绍 | Textarea |

**Dialog - 新增/修改模式 (el-tabs 分2个Tab):**

Tab1: 基础信息 (必填: name, nameEn, provinceName, cityName, region, category)
| 字段 | 组件 | 必填 |
|------|------|------|
| 院校名称 | el-input max=50 | Y |
| 英文名称 | el-input max=50 | Y |
| 省份 | el-input max=50 | Y |
| 城市 | el-input max=50 | Y |
| 地区 | el-input max=50 | Y |
| 院校类别 | el-input max=50 | Y |
| 专业数量 | el-input-number | |
| 办学层次 | el-select: 本科/专科/本专兼招 | |
| 院校性质 | el-input | |
| 推免率 | el-input-number 百分比 | |
| 推免年份 | el-input-number | |
| 博士点/硕士点 | el-switch | |
| 隶属部门 | el-input | |
| 院校标签 | el-select multiple 可输入 | |
| 知名联盟 | el-input | |
| 院校简介 | el-input textarea max=5000 | |
| 院校图片 | el-input (URL) | |
| 状态 | el-switch | |

Tab2: 详细信息 (调用 PUT /{id}/detail)
| 字段 | 组件 | 必填 |
|------|------|------|
| 地址 | el-input max=200 | |
| 招生电话 | el-input max=50 | |
| 官方网站 | el-input max=500 | |
| 历史组分数线 | el-input-number | |
| 物理组分数线 | el-input-number | |
| 轮播图片 | el-input (逗号分隔URLs) | |
| 院校详细介绍 | el-input textarea max=5000 | |
| 软科排名 | el-input-number | |
| 校友会排名 | el-input-number | |
| 武书连排名 | el-input-number | |
| QS排名 | el-input-number | |
| USNEWS排名 | el-input-number | |
| 出国比例 | el-input max=10 | |
| 男女比例 | el-input max=10 | |

**分页:** [10, 20, 30, 50, 100]

---

### 2. 校园图册页 (`university_album`)

**后端信息:**
- 模块代码: `university_album`
- 基础路径: `/api/v1/admin/university/gallery`
- 权限注解: `@RequireAdminModule("university_album")`

**搜索栏:**
| 字段 | 组件 |
|------|------|
| 院校名称 | el-input (模糊搜索) |
| 图片类型 | el-select (教学楼/宿舍/食堂/图书馆/操场/校门等) |
| 状态 | el-select (全部/展示/下架) |
| 查询/重置 | el-button |

**操作栏:**
| 按钮 | 说明 |
|------|------|
| 新增图片 | 打开新增 Dialog |
| 导入Excel | 上传 .xlsx/.xls → POST /import |
| 批量下架 | POST /batch-delete |
| 批量永久删除 | POST /batch-hard-delete |
| 刷新 | 重新请求列表 |

**表格列:**
| 列 | 宽度 | 说明 |
|----|------|------|
| □(checkbox) | 50 | |
| ID | 140 | |
| 院校名称 | min-width:150 | show-overflow-tooltip |
| 图片类型 | 120 | |
| 图片 | 120 | el-image 缩略图 80x60 + 点击预览大图 |
| 状态 | 100 | el-tag |
| 创建时间 | 180 | |
| 操作 | 360 | fixed="right" |

**操作列按钮:** 详情 / 修改 / 禁用-启用 / 下架 / 永久删除

**Dialog - 新增:**
| 字段 | 组件 | 必填 |
|------|------|------|
| 院校 | el-select (从分页接口加载列表) | Y |
| 图片类型 | el-input | Y |
| 图片URL | el-input | Y |
| 排序权重 | el-input-number | |

**Dialog - 修改:**
同新增，额外可修改 status

**Dialog - 详情:**
el-descriptions 展示全部字段

---

### 3. 院校适应指南页 (`university_guide`)

**后端信息:**
- 模块代码: `university_guide`
- 基础路径: `/api/v1/admin/university/guide`
- 权限注解: `@RequireAdminModule("university_guide")`

**搜索栏:**
| 字段 | 组件 |
|------|------|
| 院校名称 | el-input (模糊搜索) |
| 状态 | el-select (全部/展示/下架) |
| 查询/重置 | el-button |

**操作栏:**
| 按钮 | 说明 |
|------|------|
| 新增指南 | 打开新增 Dialog |
| 导入Excel | 上传 .xlsx → POST /import |
| 批量下架 | POST /batch-delete |
| 批量永久删除 | POST /batch-hard-delete |
| 刷新 | 重新请求列表 |

**表格列:**
| 列 | 宽度 | 说明 |
|----|------|------|
| □(checkbox) | 50 | |
| ID | 140 | |
| 院校名称 | min-width:150 | show-overflow-tooltip |
| 自定义标签 | 200 | el-tag 列表 |
| 备注 | 200 | show-overflow-tooltip |
| 状态 | 100 | el-tag |
| 创建时间 | 180 | |
| 操作 | 360 | fixed="right" |

**操作列按钮:** 详情 / 修改 / 禁用-启用 / 下架 / 永久删除

**Dialog - 详情:**
| 区域 | 内容 |
|------|------|
| 基础信息 | el-descriptions: 院校名称, 自定义标签(tags), 备注, 状态, 创建/更新时间 |
| JSONB折叠面板 | el-collapse 展开14个JSONB字段，每个面板内用 el-descriptions 展示键值对 |

**Dialog - 新增/修改:**
| 字段 | 组件 | 必填 |
|------|------|------|
| 院校 | el-select (从分页接口加载列表) | Y |
| 自定义标签 | el-select 多选可输入 | |
| 备注 | el-input textarea | |

14个JSONB字段仅通过Excel导入管理，前端不提供JSONB编辑UI。

---

## Excel导入实现

```typescript
// 通用导入函数
const handleImport = async (api: (file: File) => Promise<AxiosResponse<R>>) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const res = await api(file)
      if (res.data.code === 200) {
        ElMessage.success('导入成功')
        fetchData()
      } else {
        ElMessage.error(res.data.msg || '导入失败')
      }
    } catch {
      ElMessage.error('导入失败')
    }
  }
  input.click()
}
```

---

## 院校选择器实现

新增/修改 Dialog 中需要选择院校时，复用院校列表分页接口（GET /list），请求 page=1, size=1000 获取所有院校数据作为 el-select 的选项。

```typescript
// 获取院校列表供选择器使用
const fetchUniversityOptions = async () => {
  const res = await getUniversityPage({ page: 1, size: 1000 })
  if (res.data.code === 200) {
    universityOptions.value = res.data.data.records.map(r => ({
      label: r.name,
      value: r.id,
    }))
  }
}
```

---

## 状态管理

不新增 Pinia Store，所有页面状态在组件内部通过 `ref` / `reactive` 管理，与公告管理页一致。

---

## 错误处理

所有请求使用 try-catch 包裹，成功显示 ElMessage.success，失败显示 ElMessage.error，后端返回的具体错误信息通过 `res.data.msg` 展示给管理员。

---

## 文件清单

| 文件路径 | 内容 |
|---------|------|
| `apps/admin/src/router/modules/university.ts` | 路由配置 |
| `apps/admin/src/types/university/info.ts` | 院校列表VO/DTO类型 |
| `apps/admin/src/types/university/gallery.ts` | 校园图册VO/DTO类型 |
| `apps/admin/src/types/university/guide.ts` | 适应指南VO/DTO类型 |
| `apps/admin/src/api/university/info.ts` | 院校列表API |
| `apps/admin/src/api/university/gallery.ts` | 校园图册API |
| `apps/admin/src/api/university/guide.ts` | 适应指南API |
| `apps/admin/src/views/university/info/index.vue` | 院校列表页 |
| `apps/admin/src/views/university/album/index.vue` | 校园图册页 |
| `apps/admin/src/views/university/guide/index.vue` | 院校适应指南页 |
