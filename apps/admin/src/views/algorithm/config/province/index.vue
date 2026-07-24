<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getProvinceConfigPage,
  getProvinceConfigDetail,
  updateProvinceConfig,
} from '@/api/algorithm/config/province'
import type { ProvinceConfigListVO, ProvinceConfigDetailVO, ProvinceConfigUpdateDTO } from '@/types/algorithm/config/province'

const loading = ref(false)
const tableData = ref<ProvinceConfigListVO[]>([])
const total = ref(0)

const queryParams = reactive({ page: 1, size: 10 })

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentProvince = ref<string | null>(null)
const detailData = ref<ProvinceConfigDetailVO | null>(null)

const formData = reactive<ProvinceConfigUpdateDTO>({
  densityK: 0.15,
  lineSteepness: 2.8,
  rankSteepness: 2.4,
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getProvinceConfigPage({ page: queryParams.page, size: queryParams.size })
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const openDialog = async (mode: 'detail' | 'edit', province: string) => {
  dialogMode.value = mode
  currentProvince.value = province
  formLoading.value = true
  try {
    const res = await getProvinceConfigDetail(province)
    if (res.data.code === 200) {
      const d = res.data.data
      if (mode === 'edit') {
        dialogTitle.value = '修改省份算法参数'
        formData.densityK = d.densityK
        formData.lineSteepness = d.lineSteepness
        formData.rankSteepness = d.rankSteepness
      } else {
        dialogTitle.value = '省份算法配置详情'
        detailData.value = d
      }
    }
  } catch {
    ElMessage.error('获取详情失败')
  } finally {
    formLoading.value = false
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!currentProvince.value) return
  try {
    const res = await updateProvinceConfig(currentProvince.value, {
      densityK: formData.densityK,
      lineSteepness: formData.lineSteepness,
      rankSteepness: formData.rankSteepness,
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
  }
}

const handleCloseDialog = () => {
  dialogVisible.value = false
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4">
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="province" label="省份" width="120" />
        <el-table-column label="同分密度惩罚系数" width="170">
          <template #default="{ row }">{{ row.densityK }}</template>
        </el-table-column>
        <el-table-column label="线差 Sigmoid 陡度" width="170">
          <template #default="{ row }">{{ row.lineSteepness }}</template>
        </el-table-column>
        <el-table-column label="位次 Sigmoid 陡度" min-width="170">
          <template #default="{ row }">{{ row.rankSteepness }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.province)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.province)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="同分密度惩罚系数">{{ detailData.densityK }}</el-descriptions-item>
            <el-descriptions-item label="线差 Sigmoid 陡度">{{ detailData.lineSteepness }}</el-descriptions-item>
            <el-descriptions-item label="位次 Sigmoid 陡度">{{ detailData.rankSteepness }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode === 'edit'">
          <el-form :model="formData" label-width="180px">
            <el-form-item label="同分密度惩罚系数" required>
              <el-input-number v-model="formData.densityK" :min="0" :max="1" :step="0.001" :precision="3" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="线差 Sigmoid 陡度" required>
              <el-input-number v-model="formData.lineSteepness" :min="0" :max="10" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="位次 Sigmoid 陡度" required>
              <el-input-number v-model="formData.rankSteepness" :min="0" :max="10" :step="0.01" :precision="2" controls-position="right" style="width: 100%;" />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <el-button @click="handleCloseDialog">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode === 'edit'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
