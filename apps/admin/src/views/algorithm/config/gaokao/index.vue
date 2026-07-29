<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getGaokaoConfigCurrent,
  updateGaokaoConfigCurrent,
} from '@/api/algorithm/config/gaokao'
import type { GaokaoConfigDetailVO, GaokaoConfigUpdateDTO } from '@/types/algorithm/config/gaokao'
import logoMain from '@/assets/images/logo-main.png'

const activeTab = ref('default')
const loading = ref(false)
const configData = ref<GaokaoConfigDetailVO | null>(null)

const dialogVisible = ref(false)
const formLoading = ref(false)

const formData = reactive<GaokaoConfigUpdateDTO>({
  defaultDensityK: 0.15,
  defaultLineSteepness: 2.8,
  defaultRankSteepness: 2.4,
  newGaokaoLineWeight: 0.42,
  newGaokaoRankWeight: 0.5,
  oldGaokaoLineWeight: 0.62,
  oldGaokaoRankWeight: 0.3,
  weightSoftGroup: 0.6,
  weightSoftBoth: 0.3,
  yearWeights: [1.0, 0.8, 0.6, 0.4, 0.2],
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getGaokaoConfigCurrent()
    if (res.data.code === 200) {
      configData.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取配置失败')
    }
  } catch {
    ElMessage.error('获取配置失败')
  } finally {
    loading.value = false
  }
}

const openEditDialog = () => {
  if (!configData.value) return
  const d = configData.value
  formData.defaultDensityK = d.defaultDensityK
  formData.defaultLineSteepness = d.defaultLineSteepness
  formData.defaultRankSteepness = d.defaultRankSteepness
  formData.newGaokaoLineWeight = d.newGaokaoLineWeight
  formData.newGaokaoRankWeight = d.newGaokaoRankWeight
  formData.oldGaokaoLineWeight = d.oldGaokaoLineWeight
  formData.oldGaokaoRankWeight = d.oldGaokaoRankWeight
  formData.weightSoftGroup = d.weightSoftGroup
  formData.weightSoftBoth = d.weightSoftBoth
  formData.yearWeights = d.yearWeights ? [...d.yearWeights] : [1.0, 0.8, 0.6, 0.4, 0.2]
  dialogVisible.value = true
}

const handleSubmit = async () => {
  formLoading.value = true
  try {
    const res = await updateGaokaoConfigCurrent({
      defaultDensityK: formData.defaultDensityK,
      defaultLineSteepness: formData.defaultLineSteepness,
      defaultRankSteepness: formData.defaultRankSteepness,
      newGaokaoLineWeight: formData.newGaokaoLineWeight,
      newGaokaoRankWeight: formData.newGaokaoRankWeight,
      oldGaokaoLineWeight: formData.oldGaokaoLineWeight,
      oldGaokaoRankWeight: formData.oldGaokaoRankWeight,
      weightSoftGroup: formData.weightSoftGroup,
      weightSoftBoth: formData.weightSoftBoth,
      yearWeights: formData.yearWeights,
    })
    if (res.data.code === 200) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    formLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-wrap">
    <img class="watermark watermark-tr" :src="logoMain" alt="" />
    <img class="watermark watermark-bl" :src="logoMain" alt="" />

    <div class="page-header">
      <h2 class="title">全局权重配置</h2>
      <p class="subtitle">管理算法权重参数、默认值与年份衰减系数</p>
    </div>

    <div class="action-bar">
      <div class="left-actions">
        <button class="btn btn-add" @click="openEditDialog">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          修改配置
        </button>
      </div>
      <div class="right-actions">
        <button class="btn btn-refresh" @click="fetchData">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          刷新
        </button>
      </div>
    </div>

    <div v-loading="loading" class="config-tabs-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="默认参数" name="default">
          <el-descriptions :column="2" border class="config-descriptions">
            <el-descriptions-item label="默认同分密度惩罚系数">
              {{ configData?.defaultDensityK ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="默认线差 Sigmoid 陡度">
              {{ configData?.defaultLineSteepness ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="默认位次 Sigmoid 陡度">
              {{ configData?.defaultRankSteepness ?? '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="权重配置" name="weight">
          <el-descriptions :column="2" border class="config-descriptions">
            <el-descriptions-item label="新高考-线差权重">
              {{ configData?.newGaokaoLineWeight ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="新高考-位次权重">
              {{ configData?.newGaokaoRankWeight ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="旧高考-线差权重">
              {{ configData?.oldGaokaoLineWeight ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="旧高考-位次权重">
              {{ configData?.oldGaokaoRankWeight ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="专业组软约束折扣">
              {{ configData?.weightSoftGroup ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="专业组+专业软约束折扣">
              {{ configData?.weightSoftBoth ?? '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="年份衰减权重" name="year">
          <el-descriptions :column="5" border class="config-descriptions">
            <el-descriptions-item
              v-for="(_, index) in 5"
              :key="index"
              :label="`距今${index + 1}年`"
            >
              {{ configData?.yearWeights?.[index] ?? '-' }}
            </el-descriptions-item>
          </el-descriptions>
          <div v-if="configData?.createdAt" class="meta-time">
            创建时间：{{ configData.createdAt }}
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="修改全局参数"
      width="650px"
      :close-on-click-modal="false"
      class="detail-dialog"
    >
      <div v-loading="formLoading">
        <el-form :model="formData" label-width="190px">
          <h4 class="form-section-title">默认参数</h4>
          <el-form-item label="默认同分密度惩罚系数" required>
            <el-input-number v-model="formData.defaultDensityK" :min="0" :max="1" :step="0.001" :precision="3" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="默认线差 Sigmoid 陡度" required>
            <el-input-number v-model="formData.defaultLineSteepness" :min="0" :max="10" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="默认位次 Sigmoid 陡度" required>
            <el-input-number v-model="formData.defaultRankSteepness" :min="0" :max="10" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
          </el-form-item>

          <el-divider />
          <h4 class="form-section-title">权重配置</h4>
          <el-form-item label="新高考-线差权重" required>
            <el-input-number v-model="formData.newGaokaoLineWeight" :min="0" :max="1" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="新高考-位次权重" required>
            <el-input-number v-model="formData.newGaokaoRankWeight" :min="0" :max="1" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="旧高考-线差权重" required>
            <el-input-number v-model="formData.oldGaokaoLineWeight" :min="0" :max="1" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="旧高考-位次权重" required>
            <el-input-number v-model="formData.oldGaokaoRankWeight" :min="0" :max="1" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="专业组软约束折扣" required>
            <el-input-number v-model="formData.weightSoftGroup" :min="0" :max="1" :step="0.1" :precision="1" controls-position="right" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="专业组+专业软约束折扣" required>
            <el-input-number v-model="formData.weightSoftBoth" :min="0" :max="1" :step="0.1" :precision="1" controls-position="right" style="width: 100%;" />
          </el-form-item>

          <el-divider />
          <h4 class="form-section-title">年份衰减权重</h4>
          <div class="grid grid-cols-5 gap-3">
            <div v-for="(_, index) in Math.min(formData.yearWeights.length, 5)" :key="index">
              <el-form-item :label="`距今${index + 1}年`" label-width="70px">
                <el-input-number v-model="formData.yearWeights[index]" :min="0" :max="1" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button type="button" class="exit-btn" @click="dialogVisible = false">取消</button>
          <button type="button" class="save-btn" :disabled="formLoading" @click="handleSubmit">
            {{ formLoading ? '提交中...' : '确定' }}
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* ===== 页面包装器 ===== */
.page-wrap {
  background: linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%);
  min-height: calc(100vh - 60px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* ===== 水印枫叶 ===== */
.watermark {
  position: absolute;
  width: 180px;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-tr {
  top: -60px;
  right: 40px;
  transform: rotate(18deg);
}
.watermark-bl {
  bottom: -40px;
  left: 30px;
  transform: rotate(-12deg);
}

/* ===== 页面标题 ===== */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}
.page-header .title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  letter-spacing: 0.02em;
}
.page-header .subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

/* ===== 操作栏 ===== */
.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.left-actions,
.right-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
}
.btn-add {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.btn-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.btn-add:active {
  transform: translateY(0);
}
.btn-refresh {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
}
.btn-refresh:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}
.btn-refresh:active {
  background: #f3f4f6;
}

/* ===== 配置标签卡片 ===== */
.config-tabs-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}
.config-tabs-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.config-tabs-card :deep(.el-tabs__item.is-active) {
  color: #F97316;
  font-weight: 600;
}
.config-tabs-card :deep(.el-tabs__active-bar) {
  background: #F97316;
}
.config-tabs-card :deep(.el-tabs__item:hover) {
  color: #F97316;
}

.config-descriptions {
  margin-top: 8px;
}
.config-descriptions :deep(.el-descriptions__label) {
  background: rgba(249, 115, 22, 0.06) !important;
  color: #f97316;
  font-weight: 600;
}
.config-descriptions :deep(.el-descriptions__body .el-descriptions__table) {
  border-color: rgba(249, 115, 22, 0.1);
}

.meta-time {
  margin-top: 12px;
  font-size: 13px;
  color: #9ca3af;
}

/* ===== 对话框 ===== */
.detail-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}
.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}
.detail-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
}
.detail-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}
.detail-dialog :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}
.detail-dialog :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.detail-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.detail-dialog :deep(.el-input-number.is-controls-right .el-input__wrapper) {
  padding-right: 36px;
}
.detail-dialog :deep(.el-form-item) {
  margin-bottom: 18px;
}

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #f97316;
  margin: 0 0 12px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.exit-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}
.exit-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}
.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
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
.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
