<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getGaokaoConfigCurrent,
  updateGaokaoConfigCurrent,
} from '@/api/algorithm/config/gaokao'
import type { GaokaoConfigDetailVO, GaokaoConfigUpdateDTO } from '@/types/algorithm/config/gaokao'

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
  <div>
    <div class="mb-4 flex items-center gap-3">
      <el-button type="primary" @click="openEditDialog">修改配置</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div v-loading="loading" class="space-y-4">
      <div class="rounded-lg bg-white p-5">
        <h3 class="mb-4 text-base font-medium text-gray-800">默认参数</h3>
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

      <div class="rounded-lg bg-white p-5">
        <h3 class="mb-4 text-base font-medium text-gray-800">权重配置</h3>
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

      <div class="rounded-lg bg-white p-5">
        <h3 class="mb-4 text-base font-medium text-gray-800">年份衰减权重</h3>
        <el-descriptions :column="5" border>
          <el-descriptions-item
            v-for="(_, index) in 5"
            :key="index"
            :label="`距今${index + 1}年`"
          >
            {{ configData?.yearWeights?.[index] ?? '-' }}
          </el-descriptions-item>
        </el-descriptions>
        <div v-if="configData?.createdAt" class="mt-3 text-sm text-gray-400">
          创建时间：{{ configData.createdAt }}
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="修改全局参数" width="650px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <el-form :model="formData" label-width="190px">
          <h4 class="mb-3 text-sm font-medium text-gray-600">默认参数</h4>
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
          <h4 class="mb-3 text-sm font-medium text-gray-600">权重配置</h4>
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
          <h4 class="mb-3 text-sm font-medium text-gray-600">年份衰减权重</h4>
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
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="formLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
