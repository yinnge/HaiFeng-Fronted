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
  siteName: '',
  siteUrl: '',
  siteIcp: '',
  siteDescription: '',
  apiNumber: 3,
})

watch(
  () => props.data,
  (val) => {
    if (val) {
      form.value = {
        siteName: val.siteName || '',
        siteUrl: val.siteUrl || '',
        siteIcp: val.siteIcp || '',
        siteDescription: val.siteDescription || '',
        apiNumber: val.apiNumber || 3,
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
    console.error('保存基本信息失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <h3 class="text-lg font-medium mb-4">基本信息</h3>
    <el-form :model="form" label-width="120px">
      <el-form-item label="网站名称">
        <el-input v-model="form.siteName" placeholder="请输入网站名称" maxlength="50" />
      </el-form-item>
      <el-form-item label="Logo URL">
        <el-input v-model="form.siteUrl" placeholder="请输入 Logo URL" maxlength="100" />
      </el-form-item>
      <el-form-item label="ICP 备案号">
        <el-input v-model="form.siteIcp" placeholder="请输入 ICP 备案号" maxlength="100" />
      </el-form-item>
      <el-form-item label="网站描述">
        <el-input
          v-model="form.siteDescription"
          type="textarea"
          :rows="3"
          placeholder="请输入网站描述"
        />
      </el-form-item>
      <el-form-item label="API 调用次数">
        <el-input-number v-model="form.apiNumber" :min="1" :max="100" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
