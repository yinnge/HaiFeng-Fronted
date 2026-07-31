<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getModelProviderList,
  disableModelProvider,
  updateModelProviderStatus,
} from '@/api/system/provider'
import { updateProviderModel, getSystemSettings } from '@/api/system/settings'
import type { ModelProviderVO, ModelProviderQueryDTO } from '@/types/system/provider'
import { ProviderTypeLabel, ProviderTypeTag } from '@/types/system/provider'
import ProviderEditModal from './ProviderEditModal.vue'

const loading = ref(false)
const tableData = ref<ModelProviderVO[]>([])
const total = ref(0)

const queryParams = reactive<ModelProviderQueryDTO>({
  page: 1,
  size: 10,
  providerName: '',
  modelName: '',
  type: undefined,
  status: undefined,
})

const showEditModal = ref(false)
const currentProviderId = ref<string | undefined>()

// 当前选中的 AI 服务商 / 模型（来自 system_settings，决定 dashboard 展示）
const currentProviderName = ref('')
const currentModelName = ref('')

const fetchCurrent = async () => {
  try {
    const res = await getSystemSettings()
    if (res.data.code === 200 && res.data.data) {
      currentProviderName.value = res.data.data.providerName || ''
      currentModelName.value = res.data.data.modelName || ''
    }
  } catch {
    // 忽略：拿不到当前配置不影响列表展示
  }
}

const isCurrent = (row: ModelProviderVO) =>
  !!currentProviderName.value &&
  currentProviderName.value === row.providerName &&
  currentModelName.value === row.modelName

const pageSizes = [10, 20, 30, 50, 100]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getModelProviderList(queryParams)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取服务商列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.providerName = ''
  queryParams.modelName = ''
  queryParams.type = undefined
  queryParams.status = undefined
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

const handleAdd = () => {
  currentProviderId.value = undefined
  showEditModal.value = true
}

const handleEdit = (id: string) => {
  currentProviderId.value = id
  showEditModal.value = true
}

const handleSuccess = () => {
  fetchData()
}

const handleDisable = async (row: ModelProviderVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要禁用服务商"${row.providerName}"吗？`,
      '提示',
      { type: 'warning' }
    )
    const res = await disableModelProvider(row.id)
    if (res.data.code === 200) {
      ElMessage.success('禁用成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '禁用失败')
    }
  } catch {
    // 用户取消
  }
}

const handleToggleStatus = async (row: ModelProviderVO) => {
  const targetStatus = row.status === 1 ? 0 : 1
  const action = targetStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}服务商"${row.providerName}"吗？`,
      '提示',
      { type: 'warning' }
    )
    const res = await updateModelProviderStatus(row.id, { status: targetStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${action}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || `${action}失败`)
    }
  } catch {
    // 用户取消
  }
}

const handleSetActive = async (row: ModelProviderVO) => {
  try {
    await ElMessageBox.confirm(
      `确定将「${row.providerName} / ${row.modelName}」设为当前 AI 模型吗？\n设置后控制面板的「系统信息」将展示该服务商与模型。`,
      '设为当前模型',
      { type: 'warning' }
    )
    const res = await updateProviderModel({
      providerName: row.providerName,
      modelName: row.modelName,
    })
    if (res.data.code === 200) {
      ElMessage.success('已设为当前模型')
      currentProviderName.value = row.providerName
      currentModelName.value = row.modelName
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '设置失败')
    }
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  fetchData()
  fetchCurrent()
})
</script>

<template>
  <div class="provider-card">
    <!-- 搜索表单 -->
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
          <el-form-item label="类型">
            <el-select
              v-model="queryParams.type"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option
                v-for="(label, key) in ProviderTypeLabel"
                :key="key"
                :label="label"
                :value="key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="服务商名称">
            <el-input
              v-model="queryParams.providerName"
              placeholder="请输入服务商名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="模型名称">
            <el-input
              v-model="queryParams.modelName"
              placeholder="请输入模型名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
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
      <button type="button" class="add-btn" @click="handleAdd">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新增服务商
      </button>
    </div>

    <!-- 数据表格 -->
    <div class="table-card">
      <div class="custom-table" v-loading="loading">
        <el-table :data="tableData" stripe>
          <el-table-column prop="providerName" label="服务商名称" min-width="140">
            <template #default="{ row }">
              <span class="provider-name">
                {{ row.providerName }}
                <span v-if="isCurrent(row)" class="current-tag">当前</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="modelName" label="模型名称" min-width="120">
            <template #default="{ row }">
              <span class="code-text">{{ row.modelName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="ProviderTypeTag[row.type] || 'info'" size="small" effect="light">
                {{ ProviderTypeLabel[row.type] || row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="baseUrl" label="Base URL" min-width="180">
            <template #default="{ row }">
              <span class="desc-text">{{ row.baseUrl || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="apiKeyMasked" label="API Key" min-width="160">
            <template #default="{ row }">
              <span class="code-text">{{ row.apiKeyMasked || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="150">
            <template #default="{ row }">
              <span class="desc-text">{{ row.description || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <span v-if="row.status === 1" class="status-tag status-on">启用</span>
              <span v-else class="status-tag status-off">禁用</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="230" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-group">
                <button type="button" class="action-btn action-detail" @click="handleEdit(row.id)">编辑</button>
                <button
                  v-if="row.status === 1 && !isCurrent(row)"
                  type="button"
                  class="action-btn action-active"
                  @click="handleSetActive(row)"
                >
                  设为当前
                </button>
                <button
                  v-if="row.status === 1"
                  type="button"
                  class="action-btn action-disable"
                  @click="handleDisable(row)"
                >
                  禁用
                </button>
                <button
                  v-else
                  type="button"
                  class="action-btn action-enable"
                  @click="handleToggleStatus(row)"
                >
                  启用
                </button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="custom-pagination">
        <el-pagination
          :current-page="queryParams.page"
          :page-size="queryParams.size"
          :page-sizes="pageSizes"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 编辑/新增弹窗 -->
    <ProviderEditModal
      v-model:visible="showEditModal"
      :provider-id="currentProviderId"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.provider-card {
  width: 100%;
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
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
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
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.add-btn:active {
  transform: translateY(0);
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

/* 表格自定义样式 */
.custom-table :deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(.el-table__header th) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  border-bottom: none;
  padding: 14px 0;
}

.custom-table :deep(.el-table__header th .cell) {
  color: #fff;
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

.desc-text {
  font-size: 13px;
  color: #9ca3af;
}

/* 状态标签 */
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-on {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}

.status-off {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
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

.action-disable {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}
.action-disable:hover {
  background: #fde68a;
}

.action-enable {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
}
.action-enable:hover {
  background: #a7f3d0;
}

.action-active {
  background: linear-gradient(135deg, #6366f1, #818cf8);
  color: #fff;
}
.action-active:hover {
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  transform: translateY(-1px);
}

/* 当前选中服务商标识 */
.provider-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.current-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}

/* 自定义分页 */
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
</style>
