<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getScoreRankPage,
  getScoreRankDetail,
  addScoreRank,
  updateScoreRank,
  deleteScoreRank,
  batchDeleteScoreRank,
  importScoreRank,
  updateScoreRankStatus,
} from '@/api/algorithm/config/score-rank'
import type {
  ScoreRankListVO,
  ScoreRankDetailVO,
  ScoreRankQueryDTO,
  ScoreRankAddDTO,
} from '@/types/algorithm/config'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'

const loading = ref(false)
const tableData = ref<ScoreRankListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const provinceOptions = [
  '北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江','上海','江苏',
  '浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西',
  '海南','重庆','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆',
]
const subjectTypeOptions = ['物理类', '历史类', '理科', '文科', '不分文理']

const queryParams = reactive<ScoreRankQueryDTO>({
  page: 1,
  size: 10,
  province: undefined,
  year: undefined,
  subjectType: undefined,
  score: undefined,
  rank: undefined,
  isDeleted: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<ScoreRankDetailVO | null>(null)

const formData = reactive<ScoreRankAddDTO>({
  province: '',
  year: new Date().getFullYear(),
  subjectType: '',
  score: 0,
  rank: 0,
  sameScoreCount: null,
  cumulativeCount: null,
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.year) params.year = queryParams.year
    if (queryParams.subjectType) params.subjectType = queryParams.subjectType
    if (queryParams.score !== undefined && queryParams.score !== null) params.score = queryParams.score
    if (queryParams.rank !== undefined && queryParams.rank !== null) params.rank = queryParams.rank
    if (queryParams.isDeleted !== undefined && queryParams.isDeleted !== null) params.isDeleted = queryParams.isDeleted
    const res = await getScoreRankPage(params as ScoreRankQueryDTO)
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

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.province = undefined
  queryParams.year = undefined
  queryParams.subjectType = undefined
  queryParams.score = undefined
  queryParams.rank = undefined
  queryParams.isDeleted = undefined
  queryParams.page = 1
  fetchData()
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

const handleSelectionChange = (selection: ScoreRankListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const resetFormData = () => {
  formData.province = ''
  formData.year = new Date().getFullYear()
  formData.subjectType = ''
  formData.score = 0
  formData.rank = 0
  formData.sameScoreCount = null
  formData.cumulativeCount = null
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增一分一段记录'
    resetFormData()
    detailData.value = null
  } else if ((mode === 'edit' || mode === 'detail') && id) {
    formLoading.value = true
    try {
      const res = await getScoreRankDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        if (mode === 'edit') {
          dialogTitle.value = '修改一分一段记录'
          formData.province = d.province
          formData.year = d.year
          formData.subjectType = d.subjectType
          formData.score = d.score
          formData.rank = d.rank
          formData.sameScoreCount = d.sameScoreCount
          formData.cumulativeCount = d.cumulativeCount
        } else {
          dialogTitle.value = '一分一段记录详情'
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
  if (!formData.province || !formData.year || !formData.subjectType || formData.score === undefined || formData.rank === undefined) {
    ElMessage.warning('请填写完整信息（带*字段）')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addScoreRank({
        ...formData,
        sameScoreCount: formData.sameScoreCount || null,
        cumulativeCount: formData.cumulativeCount || null,
      })
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateScoreRank(currentId.value, {
        ...formData,
        sameScoreCount: formData.sameScoreCount || null,
        cumulativeCount: formData.cumulativeCount || null,
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

const handleToggleStatus = async (row: ScoreRankListVO) => {
  const newStatus = !row.isDeleted
  const actionText = newStatus ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${actionText}该记录吗？`, '提示')
    const res = await updateScoreRankStatus(row.id, newStatus)
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
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
    ElMessage.warning('请先选择要禁用的记录')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要禁用选中的 ${selectedIds.value.length} 条记录吗？`, '提示')
    const res = await batchDeleteScoreRank(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量禁用成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // cancel
  }
}

const handleImport = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const res = await importScoreRank(file)
      if (res.data.code === 200) {
        ElMessage.success(`导入成功，共处理 ${res.data.data} 条记录`)
        fetchData()
      } else {
        ElMessage.error(res.data.msg || '导入失败')
      }
    } catch {
      ElMessage.error('导入失败')
    }
  }
  input.click()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-wrap">
    <!-- 水印 -->
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" alt="" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" alt="" /></div>

    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-title">一分一段表管理</div>
      <div class="page-subtitle">管理各省份高考分数与位次对应关系数据</div>
    </div>

    <!-- 搜索卡片 -->
    <div class="search-card">
      <div class="section-label">
        <span class="label-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        筛选条件
      </div>
      <el-form :model="queryParams" inline class="search-form">
        <div class="filter-fields">
          <el-form-item label="省份">
            <el-select v-model="queryParams.province" placeholder="全部" clearable filterable style="width: 130px;">
              <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
            </el-select>
          </el-form-item>
          <el-form-item label="年份">
            <el-input-number v-model="queryParams.year" :min="2000" :max="2100" :step="1" controls-position="right" :value-on-clear="undefined" style="width: 130px;" />
          </el-form-item>
          <el-form-item label="科类">
            <el-select v-model="queryParams.subjectType" placeholder="全部" clearable style="width: 130px;">
              <el-option v-for="t in subjectTypeOptions" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item>
          <el-form-item label="分数">
            <el-input-number v-model="queryParams.score" :min="0" :max="750" controls-position="right" :value-on-clear="undefined" style="width: 120px;" />
          </el-form-item>
          <el-form-item label="位次">
            <el-input-number v-model="queryParams.rank" :min="0" controls-position="right" :value-on-clear="undefined" style="width: 140px;" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.isDeleted" placeholder="全部" clearable style="width: 110px;">
              <el-option label="启用" :value="false" />
              <el-option label="禁用" :value="true" />
            </el-select>
          </el-form-item>
        </div>
        <div class="search-actions">
          <button type="button" class="search-btn" @click="handleSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            查询
          </button>
          <button type="button" class="reset-btn" @click="handleReset">重置</button>
        </div>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button type="button" class="add-btn" @click="openDialog('add')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新增
      </button>
      <button type="button" class="import-btn" @click="handleImport">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        导入Excel
      </button>
      <button type="button" class="batch-delete-btn" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        批量禁用
      </button>
      <div class="action-bar-spacer" />
      <button type="button" class="refresh-btn" @click="fetchData">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        刷新
      </button>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <div class="custom-table">
        <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="province" label="省份" min-width="100" />
          <el-table-column prop="year" label="年份" min-width="80">
            <template #default="{ row }">
              <span class="code-text">{{ row.year }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="subjectType" label="科类" min-width="110" />
          <el-table-column prop="score" label="分数" min-width="90">
            <template #default="{ row }">
              <span class="code-text">{{ row.score }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="rank" label="位次" min-width="110">
            <template #default="{ row }">
              <span class="code-text">{{ row.rank }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <span :class="['status-tag', row.isDeleted ? 'status-disabled' : 'status-enabled']">
                {{ row.isDeleted ? '禁用' : '启用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="230" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-group">
                <button type="button" class="action-btn action-detail" @click="openDialog('detail', row.id)">详情</button>
                <button type="button" class="action-btn action-edit" @click="openDialog('edit', row.id)">修改</button>
                <button
                  type="button"
                  :class="['action-btn', row.isDeleted ? 'action-enable' : 'action-disable']"
                  @click="handleToggleStatus(row)"
                >
                  {{ row.isDeleted ? '启用' : '禁用' }}
                </button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false" class="uni-dialog">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="年份">{{ detailData.year }}</el-descriptions-item>
            <el-descriptions-item label="科类">{{ detailData.subjectType }}</el-descriptions-item>
            <el-descriptions-item label="分数">{{ detailData.score }}</el-descriptions-item>
            <el-descriptions-item label="位次">{{ detailData.rank }}</el-descriptions-item>
            <el-descriptions-item label="同分人数">{{ detailData.sameScoreCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="累计人数">{{ detailData.cumulativeCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">{{ detailData.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="100px" class="dialog-form">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="省份" required>
                  <el-select v-model="formData.province" placeholder="请选择" filterable style="width: 100%;">
                    <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年份" required>
                  <el-input-number v-model="formData.year" :min="2000" :max="2100" style="width: 100%;" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="科类" required>
                  <el-select v-model="formData.subjectType" placeholder="请选择" style="width: 100%;">
                    <el-option v-for="t in subjectTypeOptions" :key="t" :label="t" :value="t" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="分数" required>
                  <el-input-number v-model="formData.score" :min="0" :max="750" style="width: 100%;" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="位次" required>
                  <el-input-number v-model="formData.rank" :min="0" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="同分人数">
                  <el-input-number v-model="formData.sameScoreCount" :min="0" :value-on-clear="null" style="width: 100%;" placeholder="选填" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="累计人数">
              <el-input-number v-model="formData.cumulativeCount" :min="0" :value-on-clear="null" style="width: 100%;" placeholder="选填" />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button type="button" class="exit-btn" @click="dialogVisible = false">
            {{ dialogMode === 'detail' ? '关闭' : '取消' }}
          </button>
          <button v-if="dialogMode !== 'detail'" type="button" class="save-btn" @click="handleSubmit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            确定
          </button>
        </div>
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
.watermark-left,
.watermark-right {
  position: absolute;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-left {
  top: -60px;
  right: 40px;
  transform: rotate(18deg);
}
.watermark-right {
  bottom: -40px;
  left: 30px;
  transform: rotate(-12deg);
}
.watermark-left img,
.watermark-right img {
  width: 180px;
  height: auto;
}

/* 页面标题 */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

/* 搜索卡片 */
.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}
.search-card:hover {
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

.search-form {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-fields {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.search-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.search-form :deep(.el-input__wrapper:hover),
.search-form :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.search-form :deep(.el-input__wrapper.is-focus),
.search-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.search-btn {
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
.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.search-btn:active {
  transform: translateY(0);
}

.reset-btn {
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
.reset-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}
.reset-btn:active {
  background: #f3f4f6;
}

/* 操作栏 */
.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.action-bar-spacer {
  flex: 1;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  white-space: nowrap;
}
.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.add-btn:active {
  transform: translateY(0);
}

.import-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}
.import-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.batch-delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: linear-gradient(135deg, #EF4444, #F87171);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  white-space: nowrap;
}
.batch-delete-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
.batch-delete-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}
.refresh-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

/* 表格卡片 */
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}
.table-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.custom-table :deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(.el-table__header th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}

.custom-table :deep(.el-table__header th .cell) {
  color: #1f2937;
}

.custom-table :deep(.el-table__body tr) {
  transition: background-color 0.2s ease;
}

.custom-table :deep(.el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), rgba(251, 146, 60, 0.07)) !important;
}

.custom-table :deep(.el-table__body td) {
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
}

.custom-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 247, 237, 0.3);
}

.custom-table :deep(.el-table__empty-block) {
  min-height: 200px;
}

.code-text {
  font-family: 'SF Mono', 'Consolas', 'Liberation Mono', monospace;
  font-size: 13px;
  color: #6b7280;
}

/* 操作按钮组 */
.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-detail {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.action-detail:hover {
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  transform: translateY(-1px);
}

.action-edit {
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
  color: #fff;
}
.action-edit:hover {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.action-delete {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.action-delete:hover {
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.action-disable {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.action-disable:hover {
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.action-enable {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}
.action-enable:hover {
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

/* 状态标签 */
.status-tag {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.status-enabled {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
}
.status-disabled {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #9ca3af;
}

/* 分页 */
.custom-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.custom-pagination :deep(.el-pagination) {
  --el-pagination-hover-color: #F97316;
}

.custom-pagination :deep(.el-pager li) {
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.custom-pagination :deep(.el-pager li:hover) {
  color: #F97316;
}

.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) {
  border-radius: 8px;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) {
  border-radius: 8px;
}

.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #F97316;
}

/* 弹窗 */
.uni-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.uni-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.uni-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.uni-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.uni-dialog :deep(.el-descriptions__label) {
  background: rgba(249, 115, 22, 0.06);
  font-weight: 500;
}

/* 弹窗表单 */
.dialog-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.dialog-form :deep(.el-input__wrapper),
.dialog-form :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.dialog-form :deep(.el-input__wrapper:hover),
.dialog-form :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.dialog-form :deep(.el-input__wrapper.is-focus),
.dialog-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.dialog-form :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.dialog-form :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

/* 弹窗底部按钮 */
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
.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.save-btn:active {
  transform: translateY(0);
}
</style>
