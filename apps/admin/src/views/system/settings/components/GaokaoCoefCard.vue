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
  reachHighCount: 1,
  reachCount: 2,
  matchCount: 3,
  safeCount: 2,
  floorCount: 1,
  apiNumber: 3,
})

watch(
  () => props.data,
  (val) => {
    if (val) {
      form.value = {
        reachHighCount: val.reachHighCount ?? 1,
        reachCount: val.reachCount ?? 2,
        matchCount: val.matchCount ?? 3,
        safeCount: val.safeCount ?? 2,
        floorCount: val.floorCount ?? 1,
        apiNumber: val.apiNumber ?? 3,
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
    console.error('保存高考系数失败:', error)
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
          <path d="M3 3v18h18"/>
          <path d="M7 14l4-4 3 3 5-5"/>
        </svg>
      </span>
      高考系数设置
    </div>

    <p class="section-desc">下列数值为生成志愿表时各档位默认填充的院校/专业数量。</p>

    <el-form :model="form" label-width="120px" class="settings-form">
      <el-form-item label="博">
        <el-input-number v-model="form.reachHighCount" :min="0" :precision="0" />
        <span class="field-suffix">个</span>
      </el-form-item>
      <el-form-item label="冲">
        <el-input-number v-model="form.reachCount" :min="0" :precision="0" />
        <span class="field-suffix">个</span>
      </el-form-item>
      <el-form-item label="稳">
        <el-input-number v-model="form.matchCount" :min="0" :precision="0" />
        <span class="field-suffix">个</span>
      </el-form-item>
      <el-form-item label="保">
        <el-input-number v-model="form.safeCount" :min="0" :precision="0" />
        <span class="field-suffix">个</span>
      </el-form-item>
      <el-form-item label="垫">
        <el-input-number v-model="form.floorCount" :min="0" :precision="0" />
        <span class="field-suffix">个</span>
      </el-form-item>

      <!-- 中间橙色分割线 -->
      <div class="coef-divider">
        <span class="coef-divider-line"></span>
        <span class="coef-divider-label">每日 API 调用</span>
        <span class="coef-divider-line"></span>
      </div>

      <el-form-item label="API 每日调用次数">
        <el-input-number v-model="form.apiNumber" :min="1" :max="100" :precision="0" />
        <span class="field-suffix">次/日</span>
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
  margin-bottom: 12px;
}

.label-icon {
  display: flex;
  align-items: center;
}

.section-desc {
  margin: 0 0 20px 0;
  font-size: 13px;
  color: #9ca3af;
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

/* 中间橙色分割线 */
.coef-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0 24px 0;
}

.coef-divider-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0), #F97316, rgba(249, 115, 22, 0));
}

.coef-divider-label {
  flex-shrink: 0;
  padding: 3px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #F97316;
  background: rgba(249, 115, 22, 0.08);
  border: 1px solid rgba(249, 115, 22, 0.25);
  border-radius: 16px;
  white-space: nowrap;
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
