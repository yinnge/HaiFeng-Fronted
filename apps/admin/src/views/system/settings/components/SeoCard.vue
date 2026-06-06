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
  seoTitle: '',
  seoKeywords: '',
  seoDescription: '',
})

watch(
  () => props.data,
  (val) => {
    if (val) {
      form.value = {
        seoTitle: val.seoTitle || '',
        seoKeywords: val.seoKeywords || '',
        seoDescription: val.seoDescription || '',
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
    console.error('保存 SEO 配置失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <h3 class="text-lg font-medium mb-4">SEO 配置</h3>
    <el-form :model="form" label-width="120px">
      <el-form-item label="SEO 标题">
        <el-input v-model="form.seoTitle" placeholder="请输入 SEO 标题" maxlength="200" />
      </el-form-item>
      <el-form-item label="SEO 关键词">
        <el-input v-model="form.seoKeywords" placeholder="请输入关键词，用逗号分隔" maxlength="100" />
      </el-form-item>
      <el-form-item label="SEO 描述">
        <el-input
          v-model="form.seoDescription"
          type="textarea"
          :rows="3"
          placeholder="请输入 SEO 描述"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
