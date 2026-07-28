<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getGaokaoConfigCurrent,
  updateGaokaoConfigCurrent,
} from '@/api/algorithm/config/gaokao'
import type { GaokaoConfigDetailVO, GaokaoConfigUpdateDTO } from '@/types/algorithm/config/gaokao'
import logoMain from '@/assets/images/logo-main.png'

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
  formData.yearWeights = [...d.yearWeights]
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
          <span class="btn-icon">✎</span>修改配置
        </button>
      </div>
      <div class="right-actions">
        <button class="btn btn-refresh" @click="fetchData">
          <span class="btn-icon">↻</span>刷新
        </button>
      </div>
    </div>

    <div v-loading="loading" class="config-grid">
      <div class="config-card">
        <div class="config-card-header">默认参数</div>
        <div class="config-card-body">
          <el-descriptions :column="2" border>
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
        </div>
      </div>

      <div class="config-card">
        <div class="config-card-header">权重配置</div>
        <div class="config-card-body">
          <el-descriptions :column="2" border>
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
        </div>
      </div>

      <div class="config-card">
        <div class="config-card-header">年份衰减权重</div>
        <div class="config-card-body">
          <el-descriptions :column="5" border>
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
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="修改全局参数"
      width="650px"
      :close-on-click-modal="false"
      class="uni-dialog"
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
          <button class="btn btn-cancel" @click="dialogVisible = false">取消</button>
          <button class="btn btn-confirm" :disabled="formLoading" @click="handleSubmit">
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
  user-select: none;
}
.watermark-tr {
  top: -20px;
  right: -20px;
  transform: rotate(18deg);
}
.watermark-bl {
  bottom: -20px;
  left: -20px;
  transform: rotate(-12deg);
}

/* ===== 页面标题 ===== */
.page-header {
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
  gap: 5px;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-icon {
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}
.btn-add {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  box-shadow: 0 2px 6px rgba(249,115,22,0.25);
  border-radius: 24px;
}
.btn-add:hover {
  background: linear-gradient(135deg, #ea580c, #f97316);
  box-shadow: 0 3px 10px rgba(249,115,22,0.35);
  transform: translateY(-1px);
}
.btn-refresh {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}
.btn-refresh:hover {
  border-color: #f97316;
  color: #f97316;
  background: #fff7ed;
}

/* ===== 配置卡片网格 ===== */
.config-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 配置卡片 ===== */
.config-card {
  background: #fff;
  border: 1px solid #fdba74;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(249,115,22,0.06);
}
.config-card-header {
  background: linear-gradient(180deg, #fff7ed, #ffedd5);
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 700;
  color: #f97316;
  border-bottom: 1px solid #fed7aa;
}
.config-card-body {
  padding: 20px 24px;
}
.config-card-body :deep(.el-descriptions__label) {
  background: #fff7ed;
  color: #f97316;
  font-weight: 600;
}
.meta-time {
  margin-top: 12px;
  font-size: 13px;
  color: #9ca3af;
}

/* ===== 对话框 ===== */
.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid #fdba74;
  padding-bottom: 16px;
  margin-bottom: 0;
}
.uni-dialog :deep(.el-dialog__title) {
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
}
.uni-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #f97316 inset;
}
.uni-dialog :deep(.el-input-number.is-controls-right .el-input__wrapper) {
  padding-right: 36px;
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
.btn-cancel {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 8px 24px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover {
  border-color: #f97316;
  color: #f97316;
  background: #fff7ed;
}
.btn-confirm {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  border: none;
  padding: 8px 24px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(249,115,22,0.25);
}
.btn-confirm:hover {
  background: linear-gradient(135deg, #ea580c, #f97316);
  box-shadow: 0 3px 10px rgba(249,115,22,0.35);
  transform: translateY(-1px);
}
.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
