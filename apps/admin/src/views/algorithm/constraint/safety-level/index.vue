<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getSafetyPage,
  getSafetyDetail,
  addSafety,
  updateSafety,
  deleteSafety,
  batchDeleteSafety,
} from '@/api/algorithm/constraint'
import type {
  SafetyLevelListVO,
  SafetyLevelDetailVO,
  SafetyLevelAddDTO,
  SafetyLevelUpdateDTO,
} from '@/types/algorithm/constraint'

const loading = ref(false)
const tableData = ref<SafetyLevelListVO[]>([])
const total = ref(0)
const selectedLevels = ref<string[]>([])

const queryParams = reactive({
  page: 1,
  size: 10,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentLevel = ref<number | null>(null)
const detailData = ref<SafetyLevelDetailVO | null>(null)

const formData = reactive<Record<string, any>>({
  level: null,
  code: '',
  name: '',
  nameShort: '',
  minCoefficient: null,
  maxCoefficient: null,
  color: '',
  confidence: '',
  confidenceReason: '',
  description: '',
})

const confidenceOptions = [
  { label: '高', value: 'HIGH' },
  { label: '中', value: 'MEDIUM' },
  { label: '低', value: 'LOW' },
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSafetyPage({ page: queryParams.page, size: queryParams.size })
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

const handleSelectionChange = (rows: SafetyLevelListVO[]) => {
  selectedLevels.value = rows.map((r) => String(r.level))
}

const resetForm = () => {
  formData.level = null
  formData.code = ''
  formData.name = ''
  formData.nameShort = ''
  formData.minCoefficient = null
  formData.maxCoefficient = null
  formData.color = ''
  formData.confidence = ''
  formData.confidenceReason = ''
  formData.description = ''
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', level?: number) => {
  dialogMode.value = mode
  currentLevel.value = level || null

  if (mode === 'add') {
    dialogTitle.value = '新增安全系数等级'
    resetForm()
    detailData.value = null
  } else if (mode === 'edit' && level) {
    dialogTitle.value = '修改安全系数等级'
    formLoading.value = true
    try {
      const res = await getSafetyDetail(level)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.level = d.level
        formData.code = d.code
        formData.name = d.name
        formData.nameShort = d.nameShort
        formData.minCoefficient = d.minCoefficient
        formData.maxCoefficient = d.maxCoefficient
        formData.color = d.color || ''
        formData.confidence = d.confidence || ''
        formData.confidenceReason = d.confidenceReason || ''
        formData.description = d.description || ''
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && level) {
    dialogTitle.value = '安全系数等级详情'
    formLoading.value = true
    try {
      const res = await getSafetyDetail(level)
      if (res.data.code === 200) {
        detailData.value = res.data.data
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
  if (!formData.level || !formData.code || !formData.name || !formData.nameShort) {
    ElMessage.warning('请填写等级编号、代码、名称和简称')
    return
  }
  if (formData.minCoefficient === null || formData.maxCoefficient === null) {
    ElMessage.warning('请填写系数范围')
    return
  }
  if (formData.minCoefficient >= formData.maxCoefficient) {
    ElMessage.warning('系数下界必须小于系数上界')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: SafetyLevelAddDTO = {
        level: formData.level,
        code: formData.code,
        name: formData.name,
        nameShort: formData.nameShort,
        minCoefficient: formData.minCoefficient,
        maxCoefficient: formData.maxCoefficient,
      }
      if (formData.color) data.color = formData.color
      if (formData.confidence) data.confidence = formData.confidence
      if (formData.confidenceReason) data.confidenceReason = formData.confidenceReason
      if (formData.description) data.description = formData.description
      res = await addSafety(data)
    } else if (dialogMode.value === 'edit' && currentLevel.value) {
      const data: SafetyLevelUpdateDTO = {
        level: formData.level,
        code: formData.code,
        name: formData.name,
        nameShort: formData.nameShort,
        minCoefficient: formData.minCoefficient,
        maxCoefficient: formData.maxCoefficient,
      }
      if (formData.color) data.color = formData.color
      if (formData.confidence) data.confidence = formData.confidence
      if (formData.confidenceReason) data.confidenceReason = formData.confidenceReason
      if (formData.description) data.description = formData.description
      res = await updateSafety(currentLevel.value, data)
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
  } catch (err: any) {
    if (err.response?.data?.msg) {
      ElMessage.error(err.response.data.msg)
    } else {
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (level: number) => {
  try {
    await ElMessageBox.confirm(
      '确定删除该安全系数等级吗？删除后可恢复。',
      '确认删除',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await deleteSafety(level)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch {
    // 取消
  }
}

const handleBatchDelete = async () => {
  if (selectedLevels.value.length === 0) {
    ElMessage.warning('请先选择要删除的等级')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定批量删除选中的${selectedLevels.value.length} 个等级吗？删除后可恢复。`,
      '确认批量删除',
      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteSafety(selectedLevels.value as unknown as number[])
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedLevels.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch {
    // 取消
  }
}

const confidenceTag = (val: string | null) => {
  if (val === 'HIGH') return 'success'
  if (val === 'MEDIUM') return 'warning'
  if (val === 'LOW') return 'danger'
  return 'info'
}
const confidenceLabel = (val: string | null) => {
  if (val === 'HIGH') return '高'
  if (val === 'MEDIUM') return '中'
  if (val === 'LOW') return '低'
  return val || '-'
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
      <h2 class="page-title">安全系数等级管理</h2>
      <p class="page-subtitle">管理安全系数等级配置、系数范围与置信度</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button class="btn btn-primary" @click="openDialog('add')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5H2.75a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"/></svg>
        <span>新增等级</span>
      </button>
      <button class="btn btn-danger" :disabled="selectedLevels.length === 0" @click="handleBatchDelete">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 2h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM4 3.5V4H2.75a.75.75 0 0 0 0 1.5h.37l.64 7.06A1.75 1.75 0 0 0 5.505 14H10.5a1.75 1.75 0 0 0 1.745-1.44l.64-7.06h.37a.75.75 0 0 0 0-1.5H12v-.5A2 2 0 0 0 10 2H6Z"/></svg>
        <span>批量删除</span>
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
        <el-table-column prop="level" label="等级编号" width="90" align="center" />
        <el-table-column prop="code" label="代码" width="140" />
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="nameShort" label="简称" width="70" align="center" />
        <el-table-column label="系数范围" width="160" align="center">
          <template #default="{ row }">
            {{ row.minCoefficient.toFixed(2) }} ~ {{ row.maxCoefficient.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="confidence" label="置信度" width="100" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="confidenceTag(row.confidence)">{{ confidenceLabel(row.confidence) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <span class="action-pill pill-info" @click="openDialog('detail', row.level)">详情</span>
            <span class="action-pill pill-warning" @click="openDialog('edit', row.level)">修改</span>
            <span class="action-pill pill-danger" @click="handleDelete(row.level)">删除</span>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false" :destroy-on-close="true" class="uni-dialog">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="等级编号">{{ detailData.level }}</el-descriptions-item>
            <el-descriptions-item label="代码">{{ detailData.code }}</el-descriptions-item>
            <el-descriptions-item label="名称">{{ detailData.name }}</el-descriptions-item>
            <el-descriptions-item label="简称">{{ detailData.nameShort }}</el-descriptions-item>
            <el-descriptions-item label="系数范围">
              {{ detailData.minCoefficient.toFixed(2) }} ~ {{ detailData.maxCoefficient.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="显示颜色">
              <span v-if="detailData.color" :style="{ color: detailData.color }">●</span>
              {{ detailData.color || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="置信度">
              <span class="status-pill" :class="confidenceTag(detailData.confidence)">{{ confidenceLabel(detailData.confidence) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="置信度说明">{{ detailData.confidenceReason || '-' }}</el-descriptions-item>
            <el-descriptions-item label="详细说明" :span="2">
              <div class="max-h-32 overflow-y-auto whitespace-pre-wrap">{{ detailData.description || '-' }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="等级编号" required>
                  <el-input-number v-model="formData.level" :min="1" :max="10" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="代码" required>
                  <el-input v-model="formData.code" placeholder="如：REACH_HIGH" maxlength="20" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="名称" required>
                  <el-input v-model="formData.name" placeholder="如：大胆冲刺" maxlength="30" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="简称" required>
                  <el-input v-model="formData.nameShort" placeholder="如：冲刺" maxlength="10" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="系数下界" required>
                  <el-input-number v-model="formData.minCoefficient" :min="0" :max="1" :precision="2" :step="0.05" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="系数上界" required>
                  <el-input-number v-model="formData.maxCoefficient" :min="0" :max="1" :precision="2" :step="0.05" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="显示颜色">
                  <el-color-picker v-model="formData.color" show-alpha />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="置信度">
                  <el-select v-model="formData.confidence" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in confidenceOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="置信度说明">
              <el-input v-model="formData.confidenceReason" placeholder="置信度说明" maxlength="150" show-word-limit />
            </el-form-item>
            <el-form-item label="详细说明">
              <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="详细说明" />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <button class="btn btn-outline" @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</button>
        <button v-if="dialogMode !== 'detail'" class="btn btn-primary" @click="handleSubmit">确定</button>
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
.status-pill.warning {
  background: #FFFBEB;
  color: #D97706;
}
.status-pill.danger {
  background: #FEF2F2;
  color: #DC2626;
}
.status-pill.info {
  background: #F3F4F6;
  color: #6B7280;
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
