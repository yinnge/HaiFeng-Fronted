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
  <div class="settings-card">
    <div class="section-label">
      <span class="label-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </span>
      会员价格
    </div>
    <el-form :model="form" label-width="120px" class="settings-form">
      <el-form-item label="Pro 会员价格">
        <el-input-number v-model="form.proPrice" :min="0" :precision="0" />
        <span class="field-suffix">元/年</span>
      </el-form-item>
      <el-form-item label="VIP 会员价格">
        <el-input-number v-model="form.vipPrice" :min="0" :precision="0" />
        <span class="field-suffix">元/年</span>
      </el-form-item>
      <el-form-item label="Pro 佣金比例">
        <el-input-number v-model="form.proCommissionRate" :min="0" :max="100" :precision="0" />
        <span class="field-suffix">%</span>
      </el-form-item>
      <el-form-item label="VIP 佣金比例">
        <el-input-number v-model="form.vipCommissionRate" :min="0" :max="100" :precision="0" />
        <span class="field-suffix">%</span>
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

.field-suffix {
  margin-left: 10px;
  color: #9ca3af;
  font-size: 13px;
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
