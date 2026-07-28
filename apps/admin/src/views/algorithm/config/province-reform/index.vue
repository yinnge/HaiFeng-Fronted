<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getProvinceReformPage,
  getProvinceReformDetail,
  addProvinceReform,
  updateProvinceReform,
  deleteProvinceReform,
  batchDeleteProvinceReform,
} from '@/api/algorithm/config/province-reform'
import type {
  ProvinceReformListVO,
  ProvinceReformDetailVO,
  ProvinceReformQueryDTO,
  ProvinceReformAddDTO,
} from '@/types/algorithm/config'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'

const loading = ref(false)
const tableData = ref<ProvinceReformListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const provinceOptions = [
  '北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江','上海','江苏',
  '浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西',
  '海南','重庆','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆',
]
const reformModelOptions = ['3+3', '3+1+2', '传统文理']

const queryParams = reactive<ProvinceReformQueryDTO>({
  page: 1,
  size: 10,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<ProvinceReformDetailVO | null>(null)

const formData = reactive<ProvinceReformAddDTO>({
  province: '',
  reformYear: null,
  reformModel: null,
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getProvinceReformPage({ page: queryParams.page, size: queryParams.size })
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

const handleSelectionChange = (selection: ProvinceReformListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const resetFormData = () => {
  formData.province = ''
  formData.reformYear = null
  formData.reformModel = null
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增省份配置'
    resetFormData()
    detailData.value = null
  } else if ((mode === 'edit' || mode === 'detail') && id) {
    formLoading.value = true
    try {
      const res = await getProvinceReformDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        if (mode === 'edit') {
          dialogTitle.value = '修改省份配置'
          formData.province = d.province
          formData.reformYear = d.reformYear
          formData.reformModel = d.reformModel
        } else {
          dialogTitle.value = '省份配置详情'
          detailData.value = d
        }
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.province) {
    ElMessage.warning('请填写省份')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addProvinceReform({
        province: formData.province,
        reformYear: formData.reformYear || null,
        reformModel: formData.reformModel || null,
      })
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateProvinceReform(currentId.value, {
        province: formData.province,
        reformYear: formData.reformYear || null,
        reformModel: formData.reformModel || null,
      })
    } else {
      return
    }

    if (res.data.code === 200) {
      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '修改成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要软删除该记录吗？', '提示')
    const res = await deleteProvinceReform(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // cancel
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要软删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示')
    const res = await batchDeleteProvinceReform(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // cancel
  }
}

const formatReformModel = (model: string | null) => {
  if (!model) return '未改革'
  return model
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-wrap">
    <!-- 水印 -->
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" /></div>

    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">省份改革配置管理</h2>
      <p class="page-subtitle">管理各省份高考改革模式与年份配置</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button class="btn btn-primary" @click="openDialog('add')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5H2.75a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"/></svg>
        <span>新增</span>
      </button>
      <button class="btn btn-danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 2h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM4 3.5V4H2.75a.75.75 0 0 0 0 1.5h.37l.64 7.06A1.75 1.75 0 0 0 5.505 14H10.5a1.75 1.75 0 0 0 1.745-1.44l.64-7.06h.37a.75.75 0 0 0 0-1.5H12v-.5A2 2 0 0 0 10 2H6Z"/></svg>
        <span>批量软删除</span>
      </button>
      <div class="action-bar-spacer" />
      <button class="btn btn-outline" @click="fetchData">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 8a5.5 5.5 0 0 1 10.434-2.5H10.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-1.5 0v1.585A7.001 7.001 0 0 0 1.003 8.74a.75.75 0 0 0 1.497-.24A5.502 5.502 0 0 1 2.5 8Z"/></svg>
        <span>刷新</span>
      </button>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange" class="custom-table">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="province" label="省份" width="120" />
        <el-table-column label="改革年份" width="120">
          <template #default="{ row }">
            {{ row.reformYear ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column label="改革模式" min-width="150">
          <template #default="{ row }">
            <span v-if="row.reformModel" class="status-pill success">{{ row.reformModel }}</span>
            <span v-else class="text-gray-400">传统文理</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <span class="action-pill pill-info" @click="openDialog('detail', row.id)">详情</span>
            <span class="action-pill pill-warning" @click="openDialog('edit', row.id)">修改</span>
            <span class="action-pill pill-danger" @click="handleDelete(row.id)">软删除</span>
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

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false" class="uni-dialog">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="改革年份">{{ detailData.reformYear ?? '尚未改革' }}</el-descriptions-item>
            <el-descriptions-item label="改革模式" :span="2">{{ formatReformModel(detailData.reformModel) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">{{ detailData.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-form-item label="省份" required>
              <el-select v-model="formData.province" placeholder="请选择省份" filterable style="width: 100%;">
                <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
            <el-form-item label="改革年份">
              <el-input-number v-model="formData.reformYear" :min="2000" :max="2100" :step="1" controls-position="right" style="width: 100%;" placeholder="选填" />
            </el-form-item>
            <el-form-item label="改革模式">
              <el-select v-model="formData.reformModel" placeholder="请选择（选填）" clearable style="width: 100%;">
                <el-option v-for="m in reformModelOptions" :key="m" :label="m" :value="m" />
              </el-select>
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <button class="btn btn-outline" @click="dialogVisible = false">
          {{ dialogMode === 'detail' ? '关闭' : '取消' }}
        </button>
        <button v-if="dialogMode !== 'detail'" class="btn btn-primary" @click="handleSubmit">
          确定
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-wrap {
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  min-height: calc(100vh - 60px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* 水印 */
.watermark-left {
  position: absolute;
  top: -60px;
  right: 40px;
  opacity: 0.05;
  pointer-events: none;
  transform: rotate(18deg);
}
.watermark-left img {
  width: 180px;
}
.watermark-right {
  position: absolute;
  bottom: -40px;
  left: 30px;
  opacity: 0.05;
  pointer-events: none;
  transform: rotate(-12deg);
}
.watermark-right img {
  width: 180px;
}

/* 页面标题 */
.page-header {
  margin-bottom: 20px;
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px 0;
}
.page-subtitle {
  font-size: 13px;
  color: #999;
  margin: 0;
}

/* 操作栏 */
.action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.action-bar-spacer {
  flex: 1;
}

/* 基础按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-primary {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.45);
}
.btn-danger {
  background: linear-gradient(135deg, #EF4444, #F87171);
  color: #fff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45);
}
.btn-outline {
  background: #fff;
  color: #555;
  border: 1px solid #e0e0e0;
}
.btn-outline:hover {
  border-color: #F97316;
  color: #F97316;
}

/* 表格卡片 */
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(249, 115, 22, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

/* 自定义表格表头 */
.custom-table :deep(.el-table__header-wrapper th) {
  background: linear-gradient(180deg, #FFF7ED, #FFF1F2) !important;
  color: #F97316 !important;
  font-weight: 600;
  font-size: 13px;
}
.custom-table :deep(.el-table__header-wrapper th .cell) {
  color: #F97316 !important;
}

/* 状态胶囊 */
.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-pill.success {
  background: #ECFDF5;
  color: #059669;
}

/* 操作胶囊 */
.action-pill {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 2px;
}
.action-pill:hover {
  transform: translateY(-1px);
}
.pill-info {
  background: #EFF6FF;
  color: #3B82F6;
}
.pill-info:hover {
  background: #DBEAFE;
}
.pill-warning {
  background: #FFF7ED;
  color: #F97316;
}
.pill-warning:hover {
  background: #FFEDD5;
}
.pill-danger {
  background: #FEF2F2;
  color: #EF4444;
}
.pill-danger:hover {
  background: #FEE2E2;
}

/* 分页 */
.custom-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.custom-pagination :deep(.el-pagination .is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff !important;
  border-radius: 6px;
}
.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff !important;
}
.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #F97316;
}

/* 弹窗 */
.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid #F97316;
  padding-bottom: 16px;
}
.uni-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}
.uni-dialog :deep(.el-descriptions__label) {
  background: #FFF7ED;
  font-weight: 500;
}
</style>
