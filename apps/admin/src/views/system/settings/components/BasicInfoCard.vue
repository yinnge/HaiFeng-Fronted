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
  <div class="settings-card">
    <div class="section-label">
      <span class="label-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </span>
      基本信息
    </div>
    <el-form :model="form" label-width="120px" class="settings-form">
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

.settings-form :deep(.el-input__wrapper),
.settings-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.settings-form :deep(.el-input__wrapper:hover),
.settings-form :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.settings-form :deep(.el-input__wrapper.is-focus),
.settings-form :deep(.el-textarea__inner:focus) {
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
