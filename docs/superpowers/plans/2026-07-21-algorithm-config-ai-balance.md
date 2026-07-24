# 高考算法全局配置 & AI厂商余额查询 Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在管理端新增省份算法配置、高考算法全局参数、AI厂商余额查询三个页面及对应导航

**Architecture:** 沿用项目现有自包含单文件模式，类型定义 → API 服务 → 视图组件 → 路由注册

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Pinia + Vue Router 4

---

### Task 1: 创建省份算法配置类型定义

**Files:**
- Create: `apps/admin/src/types/algorithm/config/province.ts`
- Modify: `apps/admin/src/types/algorithm/config/index.ts`

- [ ] **创建 province.ts**

```typescript
export interface ProvinceConfigListVO {
  province: string
  densityK: number
  lineSteepness: number
  rankSteepness: number
}

export interface ProvinceConfigDetailVO {
  province: string
  densityK: number
  lineSteepness: number
  rankSteepness: number
  createdAt: string
}

export interface ProvinceConfigUpdateDTO {
  densityK: number
  lineSteepness: number
  rankSteepness: number
}
```

- [ ] **修改 index.ts 添加导出**

```typescript
export * from './province'
export * from './score-rank'
export * from './batch-score-line'
export * from './province-reform'
export * from './gaokao'
```

---

### Task 2: 创建高考算法全局参数类型定义

**Files:**
- Create: `apps/admin/src/types/algorithm/config/gaokao.ts`

```typescript
export interface GaokaoConfigDetailVO {
  defaultDensityK: number
  defaultLineSteepness: number
  defaultRankSteepness: number
  newGaokaoLineWeight: number
  newGaokaoRankWeight: number
  oldGaokaoLineWeight: number
  oldGaokaoRankWeight: number
  weightSoftGroup: number
  weightSoftBoth: number
  yearWeights: number[]
  createdAt: string
}

export interface GaokaoConfigUpdateDTO {
  defaultDensityK: number
  defaultLineSteepness: number
  defaultRankSteepness: number
  newGaokaoLineWeight: number
  newGaokaoRankWeight: number
  oldGaokaoLineWeight: number
  oldGaokaoRankWeight: number
  weightSoftGroup: number
  weightSoftBoth: number
  yearWeights: number[]
}
```

---

### Task 3: 创建 AI 厂商余额类型定义

**Files:**
- Create: `apps/admin/src/types/system/provider.ts`

```typescript
export interface AiBalanceVO {
  providerName: string
  models: string[]
  isAvailable: boolean
  currency: string
  totalBalance: number | null
  grantedBalance: number | null
  toppedUpBalance: number | null
}
```

---

### Task 4: 创建省份算法配置 API

**Files:**
- Create: `apps/admin/src/api/algorithm/config/province.ts`
- Modify: `apps/admin/src/api/algorithm/config/index.ts`

- [ ] **创建 province.ts**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { ProvinceConfigListVO, ProvinceConfigDetailVO, ProvinceConfigUpdateDTO } from '@/types/algorithm/config/province'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/algorithm/config/province-config'

export const getProvinceConfigPage = (params: { page: number; size: number }): Promise<AxiosResponse<R<PageResult<ProvinceConfigListVO>>>> =>
  request.get(`${PREFIX}/page`, { params })

export const getProvinceConfigDetail = (province: string): Promise<AxiosResponse<R<ProvinceConfigDetailVO>>> =>
  request.get(`${PREFIX}/${encodeURIComponent(province)}`)

export const updateProvinceConfig = (province: string, data: ProvinceConfigUpdateDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${encodeURIComponent(province)}`, data)
```

- [ ] **修改 index.ts**

```typescript
export * from './province-reform'
export * from './score-rank'
export * from './batch-score-line'
export * from './province'
export * from './gaokao'
```

---

### Task 5: 创建高考算法全局参数 API

**Files:**
- Create: `apps/admin/src/api/algorithm/config/gaokao.ts`

```typescript
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { GaokaoConfigDetailVO, GaokaoConfigUpdateDTO } from '@/types/algorithm/config/gaokao'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/algorithm/config/gaokao-config'

export const getGaokaoConfigCurrent = (): Promise<AxiosResponse<R<GaokaoConfigDetailVO>>> =>
  request.get(`${PREFIX}/current`)

export const updateGaokaoConfigCurrent = (data: GaokaoConfigUpdateDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/current`, data)
```

---

### Task 6: 创建 AI 厂商余额查询 API

**Files:**
- Create: `apps/admin/src/api/system/provider.ts`

```typescript
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { AiBalanceVO } from '@/types/system/provider'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/system/model-providers'

export const getAiBalance = (refresh?: boolean): Promise<AxiosResponse<R<AiBalanceVO[]>>> =>
  request.get(`${PREFIX}/balance`, { params: { refresh: refresh || undefined } })
```

---

### Task 7: 创建省份算法配置页面

**Files:**
- Create: `apps/admin/src/views/algorithm/config/province/index.vue`

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getProvinceConfigPage,
  getProvinceConfigDetail,
  updateProvinceConfig,
} from '@/api/algorithm/config/province'
import type { ProvinceConfigListVO, ProvinceConfigDetailVO, ProvinceConfigUpdateDTO } from '@/types/algorithm/config/province'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'

const loading = ref(false)
const tableData = ref<ProvinceConfigListVO[]>([])
const total = ref(0)

const queryParams = reactive({ page: 1, size: 10 })

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentProvince = ref<string | null>(null)
const detailData = ref<ProvinceConfigDetailVO | null>(null)

const formData = reactive<ProvinceConfigUpdateDTO>({
  densityK: 0.15,
  lineSteepness: 2.8,
  rankSteepness: 2.4,
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getProvinceConfigPage({ page: queryParams.page, size: queryParams.size })
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const openDialog = async (mode: 'detail' | 'edit', province: string) => {
  dialogMode.value = mode
  currentProvince.value = province
  formLoading.value = true
  try {
    const res = await getProvinceConfigDetail(province)
    if (res.data.code === 200) {
      const d = res.data.data
      if (mode === 'edit') {
        dialogTitle.value = '修改省份算法参数'
        formData.densityK = d.densityK
        formData.lineSteepness = d.lineSteepness
        formData.rankSteepness = d.rankSteepness
      } else {
        dialogTitle.value = '省份算法配置详情'
        detailData.value = d
      }
    }
  } catch {
    ElMessage.error('获取详情失败')
  } finally {
    formLoading.value = false
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!currentProvince.value) return
  try {
    const res = await updateProvinceConfig(currentProvince.value, {
      densityK: formData.densityK,
      lineSteepness: formData.lineSteepness,
      rankSteepness: formData.rankSteepness,
    })
    if (res.data.code === 200) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleCloseDialog = () => {
  dialogVisible.value = false
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4">
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="province" label="省份" width="120" />
        <el-table-column label="同分密度惩罚系数" width="160">
          <template #default="{ row }">{{ row.densityK }}</template>
        </el-table-column>
        <el-table-column label="线差 Sigmoid 陡度" width="160">
          <template #default="{ row }">{{ row.lineSteepness }}</template>
        </el-table-column>
        <el-table-column label="位次 Sigmoid 陡度" min-width="160">
          <template #default="{ row }">{{ row.rankSteepness }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.province)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.province)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="同分密度惩罚系数">{{ detailData.densityK }}</el-descriptions-item>
            <el-descriptions-item label="线差 Sigmoid 陡度">{{ detailData.lineSteepness }}</el-descriptions-item>
            <el-descriptions-item label="位次 Sigmoid 陡度">{{ detailData.rankSteepness }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode === 'edit'">
          <el-form :model="formData" label-width="180px">
            <el-form-item label="同分密度惩罚系数" required>
              <el-input-number v-model="formData.densityK" :min="0" :max="1" :step="0.001" :precision="3" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="线差 Sigmoid 陡度" required>
              <el-input-number v-model="formData.lineSteepness" :min="0" :max="10" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="位次 Sigmoid 陡度" required>
              <el-input-number v-model="formData.rankSteepness" :min="0" :max="10" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <el-button @click="handleCloseDialog">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode === 'edit'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 8: 创建高考算法全局参数页面

**Files:**
- Create: `apps/admin/src/views/algorithm/config/gaokao/index.vue`

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getGaokaoConfigCurrent,
  updateGaokaoConfigCurrent,
} from '@/api/algorithm/config/gaokao'
import type { GaokaoConfigDetailVO, GaokaoConfigUpdateDTO } from '@/types/algorithm/config/gaokao'
import type { AxiosResponse } from 'vue-router'
import type { R } from '@haifeng/shared'

const loading = ref(false)
const configData = ref<GaokaoConfigDetailVO | null>(null)

const dialogVisible = ref(false)
const formLoading = ref(false)

const formData = reactive<GaokaoConfigUpdateDTO>({
  defaultDensityK: 0.15,
  defaultLineSteepness: 2.8,
  defaultRankSteepness: 2.4,
  newGaokaoLineWeight: 0.42,
  newGaokaoRankWeight: 0.5,
  oldGaokaoLineWeight: 0.62,
  oldGaokaoRankWeight: 0.3,
  weightSoftGroup: 0.6,
  weightSoftBoth: 0.3,
  yearWeights: [1.0, 0.8, 0.6, 0.4, 0.2],
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getGaokaoConfigCurrent()
    if (res.data.code === 200) {
      configData.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取配置失败')
    }
  } catch {
    ElMessage.error('获取配置失败')
  } finally {
    loading.value = false
  }
}

const openEditDialog = () => {
  if (!configData.value) return
  const d = configData.value
  formData.defaultDensityK = d.defaultDensityK
  formData.defaultLineSteepness = d.defaultLineSteepness
  formData.defaultRankSteepness = d.defaultRankSteepness
  formData.newGaokaoLineWeight = d.newGaokaoLineWeight
  formData.newGaokaoRankWeight = d.newGaokaoRankWeight
  formData.oldGaokaoLineWeight = d.oldGaokaoLineWeight
  formData.oldGaokaoRankWeight = d.oldGaokaoRankWeight
  formData.weightSoftGroup = d.weightSoftGroup
  formData.weightSoftBoth = d.weightSoftBoth
  formData.yearWeights = [...d.yearWeights]
  dialogVisible.value = true
}

const handleSubmit = async () => {
  formLoading.value = true
  try {
    const res = await updateGaokaoConfigCurrent({
      defaultDensityK: formData.defaultDensityK,
      defaultLineSteepness: formData.defaultLineSteepness,
      defaultRankSteepness: formData.defaultRankSteepness,
      newGaokaoLineWeight: formData.newGaokaoLineWeight,
      newGaokaoRankWeight: formData.newGaokaoRankWeight,
      oldGaokaoLineWeight: formData.oldGaokaoLineWeight,
      oldGaokaoRankWeight: formData.oldGaokaoRankWeight,
      weightSoftGroup: formData.weightSoftGroup,
      weightSoftBoth: formData.weightSoftBoth,
      yearWeights: formData.yearWeights,
    })
    if (res.data.code === 200) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    formLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4">
      <el-button type="primary" @click="openEditDialog">修改配置</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div v-loading="loading" class="space-y-4">
      <div class="rounded-lg bg-white p-5">
        <h3 class="mb-4 text-base font-medium text-gray-800">默认参数</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="默认同分密度惩罚系数">
            {{ configData?.defaultDensityK ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="默认线差 Sigmoid 陡度">
            {{ configData?.defaultLineSteepness ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="默认位次 Sigmoid 陡度">
            {{ configData?.defaultRankSteepness ?? '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="rounded-lg bg-white p-5">
        <h3 class="mb-4 text-base font-medium text-gray-800">权重配置</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="新高考-线差权重">
            {{ configData?.newGaokaoLineWeight ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="新高考-位次权重">
            {{ configData?.newGaokaoRankWeight ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="旧高考-线差权重">
            {{ configData?.oldGaokaoLineWeight ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="旧高考-位次权重">
            {{ configData?.oldGaokaoRankWeight ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="专业组软约束折扣">
            {{ configData?.weightSoftGroup ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="专业组+专业软约束折扣">
            {{ configData?.weightSoftBoth ?? '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="rounded-lg bg-white p-5">
        <h3 class="mb-4 text-base font-medium text-gray-800">年份衰减权重</h3>
        <el-descriptions :column="5" border>
          <el-descriptions-item
            v-for="(year, index) in 5"
            :key="year"
            :label="`距今${index + 1}年`"
          >
            {{ configData?.yearWeights?.[index] ?? '-' }}
          </el-descriptions-item>
        </el-descriptions>
        <div v-if="configData?.createdAt" class="mt-3 text-sm text-gray-400">
          创建时间：{{ configData.createdAt }}
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="修改全局参数" width="650px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <el-form :model="formData" label-width="190px">
          <h4 class="mb-3 text-sm font-medium text-gray-600">默认参数</h4>
          <el-form-item label="默认同分密度惩罚系数" required>
            <el-input-number v-model="formData.defaultDensityK" :min="0" :max="1" :step="0.001" :precision="3" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="默认线差 Sigmoid 陡度" required>
            <el-input-number v-model="formData.defaultLineSteepness" :min="0" :max="10" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="默认位次 Sigmoid 陡度" required>
            <el-input-number v-model="formData.defaultRankSteepness" :min="0" :max="10" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
          </el-form-item>

          <el-divider />
          <h4 class="mb-3 text-sm font-medium text-gray-600">权重配置</h4>
          <el-form-item label="新高考-线差权重" required>
            <el-input-number v-model="formData.newGaokaoLineWeight" :min="0" :max="1" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="新高考-位次权重" required>
            <el-input-number v-model="formData.newGaokaoRankWeight" :min="0" :max="1" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="旧高考-线差权重" required>
            <el-input-number v-model="formData.oldGaokaoLineWeight" :min="0" :max="1" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="旧高考-位次权重" required>
            <el-input-number v-model="formData.oldGaokaoRankWeight" :min="0" :max="1" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="专业组软约束折扣" required>
            <el-input-number v-model="formData.weightSoftGroup" :min="0" :max="1" :step="0.1" :precision="1" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="专业组+专业软约束折扣" required>
            <el-input-number v-model="formData.weightSoftBoth" :min="0" :max="1" :step="0.1" :precision="1" controls-position="right" style="width: 100%;" />
          </el-form-item>

          <el-divider />
          <h4 class="mb-3 text-sm font-medium text-gray-600">年份衰减权重</h4>
          <div class="grid grid-cols-5 gap-3">
            <div v-for="(_, index) in Math.min(formData.yearWeights.length, 5)" :key="index">
              <el-form-item :label="`距今${index + 1}年`" label-width="70px">
                <el-input-number v-model="formData.yearWeights[index]" :min="0" :max="1" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="formLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 9: 创建 AI 厂商余额查询页面

**Files:**
- Create: `apps/admin/src/views/system/provider/index.vue`

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAiBalance } from '@/api/system/provider'
import type { AiBalanceVO } from '@/types/system/provider'

const loading = ref(false)
const balanceList = ref<AiBalanceVO[]>([])

const fetchData = async (refresh = false) => {
  loading.value = true
  try {
    const res = await getAiBalance(refresh)
    if (res.data.code === 200) {
      balanceList.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '查询失败')
    }
  } catch {
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4">
      <el-button type="primary" @click="fetchData(false)">刷新</el-button>
      <el-button @click="fetchData(true)">强制刷新（跳过缓存）</el-button>
    </div>

    <div v-loading="loading" class="space-y-4">
      <div v-if="balanceList.length === 0 && !loading" class="rounded-lg bg-white p-10 text-center text-gray-400">
        暂未配置 DeepSeek 厂商
      </div>

      <div v-for="item in balanceList" :key="item.providerName" class="rounded-lg bg-white p-6">
        <div class="mb-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-lg font-semibold text-gray-800">{{ item.providerName }}</span>
            <el-tag v-if="item.isAvailable" type="success" size="small">可用</el-tag>
            <el-tag v-else type="danger" size="small">不可用</el-tag>
          </div>
          <span class="text-sm text-gray-400">币种：{{ item.currency }}</span>
        </div>

        <div class="mb-4">
          <span class="text-sm text-gray-500">关联模型：</span>
          <el-tag v-for="model in item.models" :key="model" size="small" class="mr-1">{{ model }}</el-tag>
        </div>

        <el-descriptions :column="3" border>
          <el-descriptions-item label="总余额">
            <span class="text-xl font-semibold text-gray-800">
              {{ item.totalBalance != null ? `¥${item.totalBalance}` : '-' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="赠送余额">
            {{ item.grantedBalance != null ? `¥${item.grantedBalance}` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="充值余额">
            {{ item.toppedUpBalance != null ? `¥${item.toppedUpBalance}` : '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>
```

---

### Task 10: 更新路由配置

**Files:**
- Modify: `apps/admin/src/router/modules/algorithm.ts`
- Modify: `apps/admin/src/router/modules/system.ts`

- [ ] **修改 algorithm.ts** — 在现有 `algorithmRoutes` 的 children 中，在合适位置（比如 constraints 下面）添加两个 level-3 路由：

在文件末尾 `]` 之前，添加：

```typescript
    // === 算法配置管理 ===
    {
      path: 'config',
      name: 'AlgorithmConfig',
      meta: { title: '算法配置管理', icon: 'TrendCharts' },
      redirect: '/algorithm/config/province',
      children: [
        {
          path: 'province',
          name: 'AlgorithmConfigProvince',
          component: () => import('@/views/algorithm/config/province/index.vue'),
          meta: { title: '省份算法配置', moduleCode: 'algo_config_prov' },
        },
        {
          path: 'gaokao',
          name: 'AlgorithmConfigGaokao',
          component: () => import('@/views/algorithm/config/gaokao/index.vue'),
          meta: { title: '高考算法全局参数', moduleCode: 'algo_config_gaokao' },
        },
      ],
    },
```

注意：删除现有的单个 `config/province-reform`、`config/score-rank`、`config/batch-score-line` 路由（它们已有自己的导航位置？不对——它们原本直接挂在 algorithm 的 children 下，没有用目录包装。需要保持它们的位置不变。新加的 `config` 路由是新的二级目录。

等一下——现有的 `algorithm.ts` 已经有这些路由在 level-2 位置：
- `admission/group` (algo_admission_grp)
- `admission/major-score` (algo_admission_dtl)
- `config/province-reform` (algo_score_prov)
- `config/score-rank` (algo_score_rank)
- `config/batch-score-line` (algo_score_baseline)
- `constraint/*` (algo_constraint_dict, algo_constraint_mjr)
- `safety/*` (algo_safety_level)

我可以把新的 `config` 目录加上，但要注意 path 不要冲突。目前的 config 开头的路由是 `config/province-reform` 等，而我想加的是新的二级目录 path `config` + 子路由 `config/province` 和 `config/gaokao`。

但是现有的 `config/province-reform`、`config/score-rank`、`config/batch-score-line` 是直接挂在 algorithm 的 children 下的。如果我再加一个 `path: 'config'` 的二级目录，它会跟现有的单一路径冲突吗？

实际上不会——在 vue-router 中，`path: 'config'` 有 children 时，它的子路由路径是 `config/province` 和 `config/gaokao`，而现有的 `path: 'config/province-reform'` 是直接挂在 parent children 下的不同路径。它们不冲突。

但为了导航更清晰，我应该把现有的 config/xxx 路由也整理到新的 config 目录下吗？可以考虑但会增加变更范围。先不加，保持现有结构不变，只新增。

所以正确做法：在现有 algorithm.ts 的 constrant/safety 之后，添加新的二级目录 `config`（算法配置管理），里面放两个新路由。

- [ ] **修改 system.ts** — 在 children 中添加：

```typescript
    {
      path: 'provider',
      name: 'SystemProvider',
      component: () => import('@/views/system/provider/index.vue'),
      meta: { title: 'AI余额查询', icon: 'Monitor', moduleCode: 'system_provider' },
    },
```
