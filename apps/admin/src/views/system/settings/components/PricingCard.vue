<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateSystemSettings } from '@/api/system/settings'
import type { SystemSettingsVO } from '@/types/system/settings'

const props = defineProps<{
  data: SystemSettingsVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref({
  proPrice: 199,
  vipPrice: 599,
  proCommissionRate: 10,
  vipCommissionRate: 15,
})

watch(
  () => props.data,
  (val) => {
    if (val) {
      form.value = {
        proPrice: val.proPrice || 199,
        vipPrice: val.vipPrice || 599,
        proCommissionRate: val.proCommissionRate || 10,
        vipCommissionRate: val.vipCommissionRate || 15,
      }
    }
  },
  { immediate: true }
)

const handleSave = async () => {
  loading.value = true
  try {
    const res = await updateSystemSettings(form.value)
    if (res.data.code === 200) {
      ElMessage.success('保存成功')
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存会员价格失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <h3 class="text-lg font-medium mb-4">会员价格</h3>
    <el-form :model="form" label-width="120px">
      <el-form-item label="Pro 会员价格">
        <el-input-number v-model="form.proPrice" :min="0" :precision="0" />
        <span class="ml-2 text-gray-400">元/年</span>
      </el-form-item>
      <el-form-item label="VIP 会员价格">
        <el-input-number v-model="form.vipPrice" :min="0" :precision="0" />
        <span class="ml-2 text-gray-400">元/年</span>
      </el-form-item>
      <el-form-item label="Pro 佣金比例">
        <el-input-number v-model="form.proCommissionRate" :min="0" :max="100" :precision="0" />
        <span class="ml-2 text-gray-400">%</span>
      </el-form-item>
      <el-form-item label="VIP 佣金比例">
        <el-input-number v-model="form.vipCommissionRate" :min="0" :max="100" :precision="0" />
        <span class="ml-2 text-gray-400">%</span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
