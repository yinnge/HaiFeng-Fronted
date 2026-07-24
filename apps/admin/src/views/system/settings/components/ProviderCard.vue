<script setup lang="ts">
import { ref, watch } from 'vue'
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
