# C 端专业-考研方向关联查询 双向页面设计

## 概述

在 C 端（`apps/user/`）实现本科专业与考研方向的双向嵌套关联查询展示：

1. 本科专业详情页（MajorDetail.vue）→ 关联考研方向列表
2. 考研专业详情弹窗（PostgradMajorDialog.vue）→ 关联本科专业列表

两个接口均需 Pro 及以上会员权限。

---

## 后端 API（已实现）

| 方向 | 接口 | 权限 |
|------|------|------|
| 本科专业 → 考研方向 | `GET /api/v1/app/major/{majorId}/postgrad-directions` | Pro |
| 考研方向 → 本科专业 | `GET /api/v1/app/postgrad-major/{postgradMajorId}/undergraduate-majors` | Pro |

### 响应 VO

**PostgradMajorDirectionBriefVO**
```typescript
{ id: number; postgradMajorName: string }
```

**UndergraduateMajorDirectionBriefVO**
```typescript
{ id: number; majorName: string }
```

---

## 新增类型定义

### `apps/user/src/types/postgrad-major/index.ts`
```typescript
export interface PostgradMajorDirectionBriefVO {
  id: number
  postgradMajorName: string
}
```

### `apps/user/src/types/major/index.ts`
```typescript
export interface UndergraduateMajorDirectionBriefVO {
  id: number
  majorName: string
}
```

---

## 新增 API 函数

### `apps/user/src/api/major/index.ts`
```typescript
export const getMajorPostgradDirections = (majorId: number, params: { page: number; size: number }) =>
  request.get<R<PageResult<PostgradMajorDirectionBriefVO>>>(`${PREFIX}/${majorId}/postgrad-directions`, { params })
```

### `apps/user/src/api/postgrad-major/index.ts`
```typescript
export const getPostgradMajorUndergraduateMajors = (postgradMajorId: number, params: { page: number; size: number }) =>
  request.get<R<PageResult<UndergraduateMajorDirectionBriefVO>>>(`/api/v1/app/postgrad-major/${postgradMajorId}/undergraduate-majors`, { params })
```

---

## 页面 1：MajorDetail.vue — 考研方向区块

### 位置
基本信息卡片之后（第 113 行 `</Motion>` 之后），就业数据卡片之前。

### 视觉风格
与"关联竞赛"区块一致：Motion 动画包裹、白色圆角卡片、橙色标签按钮、分页器。

### 交互逻辑
1. **Pro 会员**：显示方向列表（橙色标签按钮），支持分页
2. **非 Pro 会员**：显示升级提示（橙色渐变背景 + 锁图标 + "开通专业版" 按钮）
3. **点击标签**：调用 `showDetail(direction.id)` → 打开 PostgradMajorDialog
4. **分页**：参数 10/20/30/50/100

### 数据流
```
onMounted → fetchDetail() → getMajorPostgradDirections(majorId, { page, size })
         → 填充 directions[] + directionTotal
```

### 模板结构（伪代码）
```html
<Motion section>
  <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
    <h3>考研方向</h3>
    <template v-if="isPro">
      <div v-loading>
        <button v-for="d in directions" @click="showDetail(d.id)">
          {{ d.postgradMajorName }}
        </button>
      </div>
      <el-pagination v-if="directionTotal > directionPageSize" />
    </template>
    <template v-else>
      <!-- 升级提示 -->
    </template>
  </section>
</Motion>
```

---

## 页面 2：PostgradMajorDialog.vue — 关联本科专业区块

### 位置
网格信息区域之后（第 155 行 `</div>` 之后），开设院校之前。

### 视觉风格
与"开设院校"区块一致：灰底行列表 + 右箭头，点击跳转。

### 交互逻辑
1. **Pro 会员**：显示本科专业列表（灰底行 + 箭头），分页
2. **非 Pro 会员**：显示升级提示（与开设院校一致）
3. **点击行**：`router.push('/major/${major.id}')` + 关闭弹窗
4. **分页**：参数 10/20/30/50/100

### 数据流
```
watch(visible) → fetchDetail()
              → fetchUndergraduateMajors() [if isPro]
  fetchUndergraduateMajors() → getPostgradMajorUndergraduateMajors(majorId, { page, size })
                            → 填充 undergraduateMajors[] + undergradTotal
```

### 模板结构（伪代码）
```html
<section class="rounded-xl border border-gray-200 p-4">
  <h4>关联本科专业</h4>
  <template v-if="isPro">
    <div v-loading>
      <div v-for="m in undergraduateMajors" @click="goMajor(m.id)">
        <span>{{ m.majorName }}</span>
        <svg arrow />
      </div>
    </div>
    <el-pagination v-if="undergradTotal > undergradPageSize" />
  </template>
  <template v-else>
    <!-- 升级提示 -->
  </template>
</section>
```

---

## 错误处理
- API 调用失败 → ElMessage.error 提示错误信息
- 401/403 状态码由 Axios 拦截器统一处理
- 空数据 → 显示"暂无数据"占位

## 分页参数
遵循规范：`10, 20, 30, 50, 100`
