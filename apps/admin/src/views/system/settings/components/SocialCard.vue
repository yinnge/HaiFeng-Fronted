<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateSystemSettings } from '@/api/system/settings'
import type { SystemSettingsVO, ContactUrl } from '@/types/system/settings'

const props = defineProps<{
  data: SystemSettingsVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref<ContactUrl>({
  wechat: '',
  weibo: '',
  zhihu: '',
  douyin: '',
  bilibili: '',
})

watch(
  () => props.data,
  (val) => {
    if (val?.contactUrl) {
      form.value = {
        wechat: val.contactUrl.wechat || '',
        weibo: val.contactUrl.weibo || '',
        zhihu: val.contactUrl.zhihu || '',
        douyin: val.contactUrl.douyin || '',
        bilibili: val.contactUrl.bilibili || '',
      }
    }
  },
  { immediate: true }
)

const handleSave = async () => {
  loading.value = true
  try {
    const res = await updateSystemSettings({ contactUrl: form.value })
    if (res.data.code === 200) {
      ElMessage.success('保存成功')
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存社交媒体失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <h3 class="text-lg font-medium mb-4">社交媒体</h3>
    <el-form :model="form" label-width="120px">
      <el-form-item label="微信二维码">
        <el-input v-model="form.wechat" placeholder="请输入微信二维码 URL" />
      </el-form-item>
      <el-form-item label="微博">
        <el-input v-model="form.weibo" placeholder="请输入微博主页 URL" />
      </el-form-item>
      <el-form-item label="知乎">
        <el-input v-model="form.zhihu" placeholder="请输入知乎主页 URL" />
      </el-form-item>
      <el-form-item label="抖音">
        <el-input v-model="form.douyin" placeholder="请输入抖音主页 URL" />
      </el-form-item>
      <el-form-item label="B站">
        <el-input v-model="form.bilibili" placeholder="请输入 B 站主页 URL" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
