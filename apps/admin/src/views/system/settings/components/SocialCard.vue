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
  <div class="settings-card">
    <div class="section-label">
      <span class="label-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </span>
      社交媒体
    </div>
    <el-form :model="form" label-width="120px" class="settings-form">
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
      <el-form-item class="form-actions">
        <button type="button" class="save-btn" :disabled="loading" @click="handleSave">
          <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span v-if="loading" class="btn-loading"></span>
          保存修改
        </button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.settings-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}

.settings-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  transform: translateY(-1px);
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 20px;
}

.label-icon {
  display: flex;
  align-items: center;
}

.settings-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.settings-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.settings-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.settings-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.settings-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.form-actions {
  margin-top: 8px;
  margin-bottom: 0 !important;
}

.form-actions :deep(.el-form-item__content) {
  justify-content: flex-end;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 28px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.save-btn:active:not(:disabled) {
  transform: translateY(0);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
