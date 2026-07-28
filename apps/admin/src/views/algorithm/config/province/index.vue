<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getProvinceConfigPage,
  getProvinceConfigDetail,
  updateProvinceConfig,
} from '@/api/algorithm/config/province'
import type { ProvinceConfigListVO, ProvinceConfigDetailVO, ProvinceConfigUpdateDTO } from '@/types/algorithm/config/province'
import logoMain from '@/assets/images/logo-main.png'

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
  <div class="page-wrap">
    <img class="watermark watermark-tr" :src="logoMain" alt="" />
    <img class="watermark watermark-bl" :src="logoMain" alt="" />

    <div class="page-header">
      <h2 class="title">省份算法配置</h2>
      <p class="subtitle">管理各省份算法参数，控制同分密度与 Sigmoid 陡度</p>
    </div>

    <div class="action-bar">
      <div class="left-actions" />
      <div class="right-actions">
        <button class="btn btn-refresh" @click="fetchData">
          <span class="btn-icon">↻</span>刷新
        </button>
      </div>
    </div>

    <div class="table-card">
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
            <button class="action-pill action-detail" @click="openDialog('detail', row.province)">详情</button>
            <button class="action-pill action-edit" @click="openDialog('edit', row.province)">修改</button>
          </template>
        </el-table-column>
      </el-table>

      <div class="custom-pagination">
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      class="uni-dialog"
    >
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
        <div class="dialog-footer">
          <button class="btn btn-cancel" @click="handleCloseDialog">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</button>
          <button v-if="dialogMode === 'edit'" class="btn btn-confirm" @click="handleSubmit">确定</button>
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

/* ===== 表格卡片 ===== */
.table-card {
  background: #fff;
  border: 1px solid #fdba74;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(249,115,22,0.06);
}

/* ===== 表格头部橙色渐变 ===== */
:deep(.el-table th.el-table__cell) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #f97316 !important;
  font-weight: 600;
}
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: #fffbf7;
}

/* ===== 操作胶囊 ===== */
.action-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
  transition: all 0.15s;
  margin: 0 2px;
}
.action-detail {
  color: #f97316;
  border-color: #fed7aa;
}
.action-detail:hover {
  background: #fff7ed;
  border-color: #f97316;
}
.action-edit {
  color: #3b82f6;
  border-color: #bfdbfe;
}
.action-edit:hover {
  background: #eff6ff;
  border-color: #3b82f6;
}

/* ===== 分页 ===== */
.custom-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #f97316, #fb923c) !important;
  color: #fff !important;
  border-radius: 6px;
}
.custom-pagination :deep(.el-pager li:hover) {
  color: #f97316;
}
.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #f97316;
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
.uni-dialog :deep(.el-descriptions__label) {
  background: #fff7ed;
  color: #f97316;
  font-weight: 600;
}
.uni-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #f97316 inset;
}
.uni-dialog :deep(.el-input-number.is-controls-right .el-input__wrapper) {
  padding-right: 36px;
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
</style>
