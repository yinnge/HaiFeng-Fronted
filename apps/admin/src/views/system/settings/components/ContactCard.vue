<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateSystemSettings } from '@/api/system/settings'
import type { SystemSettingsVO, BasicMessage } from '@/types/system/settings'

const props = defineProps<{
  data: SystemSettingsVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref<BasicMessage>({
  address: '',
  phone: '',
  email: '',
  consultationTime: '',
})

watch(
  () => props.data,
  (val) => {
    if (val?.basicMessage) {
      form.value = {
        address: val.basicMessage.address || '',
        phone: val.basicMessage.phone || '',
        email: val.basicMessage.email || '',
        consultationTime: val.basicMessage.consultationTime || '',
      }
    }
  },
  { immediate: true }
)

const handleSave = async () => {
  loading.value = true
  try {
    const res = await updateSystemSettings({ basicMessage: form.value })
    if (res.data.code === 200) {
      ElMessage.success('保存成功')
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存联系信息失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <h3 class="text-lg font-medium mb-4">联系信息</h3>
    <el-form :model="form" label-width="120px">
      <el-form-item label="公司地址">
        <el-input v-model="form.address" placeholder="请输入公司地址" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="联系邮箱">
        <el-input v-model="form.email" placeholder="请输入联系邮箱" />
      </el-form-item>
      <el-form-item label="咨询时间">
        <el-input v-model="form.consultationTime" placeholder="如：周一至周五 9:00-18:00" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
