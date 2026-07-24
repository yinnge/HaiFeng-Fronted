# 系统设置与用户管理模块更新 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add provider/model config card to system settings page, fix batch delete HTTP method in operation logs.

**Architecture:** Vue 3 + Element Plus + Pinia. Add one new card component (ProviderCard.vue), update types and API files, fix one HTTP method.

**Tech Stack:** Vue 3, TypeScript, Element Plus, Axios

---

### Task 1: Fix batch delete HTTP method in log API

**Files:**
- Modify: `apps/admin/src/api/system/log.ts:23-25`

- [ ] **Step 1: Change `request.delete` to `request.post`**

Edit `apps/admin/src/api/system/log.ts` lines 23-25:

Before:
```ts
export const batchDeleteLogs = (data: AdminLogBatchDeleteDTO) => {
  return request.delete<R<number>>(`${PREFIX}/batch`, { data })
}
```

After:
```ts
export const batchDeleteLogs = (data: AdminLogBatchDeleteDTO) => {
  return request.post<R<number>>(`${PREFIX}/batch`, data)
}
```

---

### Task 2: Add providerName and modelName to SystemSettingsVO type

**Files:**
- Modify: `apps/admin/src/types/system/settings.ts`

- [ ] **Step 1: Add `providerName` and `modelName` fields**

Edit `apps/admin/src/types/system/settings.ts`, add two fields after `apiNumber` in `SystemSettingsVO`:

```ts
export interface SystemSettingsVO {
  id: number
  siteName: string
  siteUrl: string
  siteIcp: string
  siteDescription: string
  apiNumber: number
  providerName: string
  modelName: string
  proPrice: number
  // ... rest unchanged
}
```

---

### Task 3: Add getEnabledProviders and updateProviderModel API functions

**Files:**
- Modify: `apps/admin/src/api/system/settings.ts`

- [ ] **Step 1: Add two new API functions**

Append after `updateSystemSettings` in `apps/admin/src/api/system/settings.ts`:

```ts
/** 获取所有启用的服务商列表 */
export const getEnabledProviders = () => {
  return request.get<R<string[]>>(`${PREFIX}/providers`)
}

/** 更新服务商和模型 */
export const updateProviderModel = (data: { providerName: string; modelName: string }) => {
  return request.put<R<void>>(`${PREFIX}/provider-model`, data)
}
```

---

### Task 4: Create ProviderCard.vue component

**Files:**
- Create: `apps/admin/src/views/system/settings/components/ProviderCard.vue`

- [ ] **Step 1: Create the ProviderCard component**

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getEnabledProviders, updateProviderModel } from '@/api/system/settings'
import type { SystemSettingsVO } from '@/types/system/settings'

const props = defineProps<{
  data: SystemSettingsVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const editing = ref(false)
const providers = ref<string[]>([])
const loadingProviders = ref(false)

const form = ref({
  providerName: '',
  modelName: '',
})

watch(
  () => props.data,
  (val) => {
    if (val) {
      form.value = {
        providerName: val.providerName || '',
        modelName: val.modelName || '',
      }
    }
  },
  { immediate: true }
)

const handleEdit = async () => {
  editing.value = true
  loadingProviders.value = true
  try {
    const res = await getEnabledProviders()
    if (res.data.code === 200) {
      providers.value = res.data.data || []
    }
  } catch (error) {
    console.error('获取服务商列表失败:', error)
  } finally {
    loadingProviders.value = false
  }
}

const handleCancel = () => {
  if (props.data) {
    form.value = {
      providerName: props.data.providerName || '',
      modelName: props.data.modelName || '',
    }
  }
  editing.value = false
}

const handleSave = async () => {
  if (!form.value.providerName) {
    ElMessage.warning('请选择服务商')
    return
  }
  if (!form.value.modelName) {
    ElMessage.warning('请输入模型名称')
    return
  }

  loading.value = true
  try {
    const res = await updateProviderModel({
      providerName: form.value.providerName,
      modelName: form.value.modelName,
    })
    if (res.data.code === 200) {
      ElMessage.success('保存成功')
      editing.value = false
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存服务商配置失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <h3 class="text-lg font-medium mb-4">服务商与模型配置</h3>

    <template v-if="!editing">
      <div class="space-y-3">
        <div class="flex items-center">
          <span class="text-gray-500 w-24">当前服务商：</span>
          <el-tag v-if="data?.providerName" type="info">{{ data.providerName }}</el-tag>
          <span v-else class="text-gray-400">未配置</span>
        </div>
        <div class="flex items-center">
          <span class="text-gray-500 w-24">当前模型：</span>
          <el-tag v-if="data?.modelName" type="primary">{{ data.modelName }}</el-tag>
          <span v-else class="text-gray-400">未配置</span>
        </div>
      </div>
      <el-button class="mt-4" @click="handleEdit">编辑</el-button>
    </template>

    <template v-else>
      <el-form :model="form" label-width="100px">
        <el-form-item label="服务商" required>
          <el-select
            v-model="form.providerName"
            placeholder="请选择服务商"
            :loading="loadingProviders"
            style="width: 260px"
          >
            <el-option
              v-for="p in providers"
              :key="p"
              :label="p"
              :value="p"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模型名称" required>
          <el-input
            v-model="form.modelName"
            placeholder="请输入模型名称，如：gpt-4o"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </template>
  </div>
</template>
```

---

### Task 5: Register ProviderCard in system settings page

**Files:**
- Modify: `apps/admin/src/views/system/settings/index.vue`

- [ ] **Step 1: Import ProviderCard**

Add import line in `<script setup>`:
```ts
import ProviderCard from './components/ProviderCard.vue'
```

- [ ] **Step 2: Add ProviderCard after ContactCard**

Add in the template after `<ContactCard ... />`:
```vue
<ProviderCard :data="settingsData" @refresh="fetchData" />
```
