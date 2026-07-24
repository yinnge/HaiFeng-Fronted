# 高考算法全局配置 & AI厂商余额查询 — 设计文档

## 概述

在管理端新增三个页面，并添加到左侧导航菜单：

| 页面 | 模块码 | 路由路径 | 导航层级 |
|------|--------|---------|---------|
| 省份算法配置 | `algo_config_prov` | `/algorithm/config/province` | 高考算法 → 算法配置管理 → 省份算法配置 (level-3) |
| 高考算法全局参数 | `algo_config_gaokao` | `/algorithm/config/gaokao` | 高考算法 → 算法配置管理 → 高考算法全局参数 (level-3) |
| AI厂商余额查询 | `system_provider` | `/system/provider` | 系统管理 → AI余额查询 (level-2) |

**注意**: 菜单显示名称为"AI余额查询"，但 `moduleCode` 保持后端一致的 `system_provider`。

---

## 1. 省份算法配置

### 接口

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/api/v1/admin/algorithm/config/province-config/page?page=&size=` | 分页查询（仅 page/size 参数） |
| GET | `/api/v1/admin/algorithm/config/province-config/{province}` | 详情（路径参数为省份名称） |
| PUT | `/api/v1/admin/algorithm/config/province-config/{province}` | 修改 |

### 页面布局

- **顶部按钮**：只有"刷新"（不支持新增和删除，API 无对应接口）
- **表格**：省份 | 同分密度惩罚系数 | 线差 Sigmoid 陡度 | 位次 Sigmoid 陡度 | 操作
- **操作列**：详情、修改（均为 link 类型按钮）
- **分页**：Element Plus el-pagination

### 弹窗

- **详情弹窗**：`el-descriptions` border 模式，只读展示 province、densityK、lineSteepness、rankSteepness、createdAt
- **修改弹窗**：`el-form` 三个数字输入框
  - densityK: `el-input-number` min=0 max=1 step=0.001
  - lineSteepness: `el-input-number` min=0 max=10 step=0.01
  - rankSteepness: `el-input-number` min=0 max=10 step=0.01

### 校验规则

- densityK: [0.000, 1.000]
- lineSteepness: [0.00, 10.00]
- rankSteepness: [0.00, 10.00]

### 错误处理

- 404 -> "省份配置不存在"
- 400 -> 显示后端错误消息（参数校验不通过）

---

## 2. 高考算法全局参数

### 接口

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/api/v1/admin/algorithm/config/gaokao-config/current` | 查看当前配置 |
| PUT | `/api/v1/admin/algorithm/config/gaokao-config/current` | 修改配置 |

### 页面布局

默认以只读卡片形式展示全部配置字段，按逻辑分组展示：

- **默认参数组**：defaultDensityK、defaultLineSteepness、defaultRankSteepness
- **权重配置组**：newGaokaoLineWeight、newGaokaoRankWeight、oldGaokaoLineWeight、oldGaokaoRankWeight、weightSoftGroup、weightSoftBoth
- **年份衰减组**：yearWeights（展示为近5年数组）

顶部有"修改配置"按钮。

### 修改弹窗

打开编辑弹窗，所有字段可编辑：
- 数字字段用 `el-input-number`，带范围校验
- yearWeights 用多个 `el-input-number`（固定5个，对应近5年）

### 校验规则

- defaultDensityK: [0.000, 1.000]
- defaultLineSteepness / defaultRankSteepness: [0.00, 10.00]
- newGaokaoLineWeight / newGaokaoRankWeight / oldGaokaoLineWeight / oldGaokaoRankWeight: [0.00, 1.00]
- weightSoftGroup / weightSoftBoth: [0.0, 1.0]
- yearWeights: 每个元素 [0.00, 1.00]

### 错误处理

- 404 -> "高考算法全局配置不存在"
- 400 -> 显示后端错误消息

---

## 3. AI厂商余额查询

### 接口

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/api/v1/admin/system/model-providers/balance?refresh=false` | 查询 DeepSeek 余额 |

refresh=true 时跳过缓存直接调 DeepSeek API。

### 页面布局

- **顶部按钮**：「刷新」(refresh=false) 和 「强制刷新」(refresh=true)
- **内容卡片**：展示 DeepSeek 余额信息
  - 可用状态：绿色/红色 Tag
  - 币种
  - 模型列表（逗号分隔/标签）
  - 总余额（大字突出）
  - 赠送余额
  - 充值余额

### 异常处理

- API 超时/失败：`isAvailable=false`，余额字段为 null，页面显示"接口不可用"
- 无 DeepSeek 配置：空列表，显示提示信息"未配置 DeepSeek 厂商"

---

## 4. 文件结构

```
apps/admin/src/
├── api/
│   ├── algorithm/config/
│   │   ├── index.ts                       (更新导出)
│   │   ├── province.ts                    (新增)
│   │   └── gaokao.ts                      (新增)
│   └── system/
│       └── provider.ts                    (新增)
├── types/
│   ├── algorithm/config/
│   │   ├── index.ts                       (更新导出)
│   │   ├── province.ts                    (新增)
│   │   └── gaokao.ts                      (新增)
│   └── system/
│       └── provider.ts                    (新增)
├── views/
│   ├── algorithm/config/
│   │   ├── province/
│   │   │   └── index.vue                  (新增)
│   │   └── gaokao/
│   │       └── index.vue                  (新增)
│   └── system/
│       └── provider/
│           └── index.vue                  (新增)
└── router/
    ├── modules/
    │   ├── algorithm.ts                   (修改：添加两个 level-3 子路由)
    │   └── system.ts                      (修改：添加 system_provider 路由)
    └── index.ts                           (如有必要修改)
```

---

## 5. 技术选型

- 沿用项目现有技术栈：Vue 3 + TypeScript + Element Plus + Pinia
- 不引入新依赖
- 代码结构遵循项目已有的自包含单文件模式（参考 province-reform/index.vue）
