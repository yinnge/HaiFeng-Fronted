<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getGuidePage,
  getGuideDetail,
  addGuide,
  updateGuide,
  updateGuideStatus,
  deleteGuide,
  hardDeleteGuide,
  batchDeleteGuide,
  batchHardDeleteGuide,
  importGuide,
} from '@/api/university/guide'
import { getUniversityPage } from '@/api/university/info'
import type {
  UniversityGuideListVO,
  UniversityGuideDetailVO,
  UniversityGuideQueryDTO,
  UniversityGuideAddDTO,
  UniversityGuideUpdateDTO,
} from '@/types/university/guide'

const loading = ref(false)
const tableData = ref<UniversityGuideListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])
const universityOptions = ref<{ label: string; value: number }[]>([])

const queryParams = reactive<UniversityGuideQueryDTO>({
  page: 1,
  size: 10,
  universityName: '',
  status: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<UniversityGuideDetailVO | null>(null)

const JSONB_FIELDS: { key: string; label: string; subFields: string[] }[] = [
  { key: 'campusFacilities', label: '校园设施', subFields: ['教学楼分布', '实验楼与图书馆', '宿舍区与食堂', '生活配套设施'] },
  { key: 'dormitoryServices', label: '水电网与宿舍管理', subFields: ['水电费缴纳方式', '宿舍规章制度'] },
  { key: 'campusTransportation', label: '校园通勤与校外交通', subFields: ['校内通勤方式', '校外交通情况'] },
  { key: 'academicGuidance', label: '专业与课程核心信息', subFields: ['专业培养方案说明', '选课系统说明'] },
  { key: 'majorTransferGuidelines', label: '转专业原则', subFields: ['基本申请条件', '申请时间与流程'] },
  { key: 'majorTransferConstriction', label: '转专业限制', subFields: ['限制类型', '具体限制说明'] },
  { key: 'academicSupportResources', label: '学习支持资源', subFields: ['师资力量', '学习场所', '学业帮扶'] },
  { key: 'studentOrganizations', label: '学生组织与社团', subFields: ['官方组织', '社团类型'] },
  { key: 'campusEvents', label: '校园活动与竞赛', subFields: ['院校品牌活动', '学科与技能竞赛'] },
  { key: 'classDormSocial', label: '班级与宿舍社交', subFields: ['班级管理方式', '宿舍社交建议'] },
  { key: 'financialAid', label: '奖助勤贷与权益保障', subFields: ['奖助学金政策', '勤工俭学岗位', '权益申诉渠道'] },
  { key: 'campusSecurity', label: '校园安全与应急处理', subFields: ['安全设施', '安全规则'] },
  { key: 'healthServices', label: '医保与心理健康', subFields: ['医保报销政策', '心理健康服务'] },
  { key: 'lifeServices', label: '生活服务', subFields: ['校园生活服务', '医疗资源', '兼职实习资源'] },
]

const buildEmptyJsonb = () => {
  const result: Record<string, Record<string, string[]>> = {}
  JSONB_FIELDS.forEach(field => {
    result[field.key] = {}
    field.subFields.forEach(sub => { result[field.key][sub] = [] })
  })
  return result
}

const formData = reactive<UniversityGuideAddDTO & { jsonbData: Record<string, Record<string, string[]>> }>({
  universityId: '',
  customTags: [],
  remark: '',
  jsonbData: buildEmptyJsonb(),
})

const editFormData = reactive<UniversityGuideUpdateDTO & { jsonbData: Record<string, Record<string, string[]>> }>({
  customTags: [],
  remark: '',
  status: 1,
  jsonbData: buildEmptyJsonb(),
})

const fetchUniversityOptions = async (name?: string) => {
  try {
    const params: Record<string, any> = { page: 1, size: 100 }
    if (name) params.name = name
    const res = await getUniversityPage(params as any)
    if (res.data.code === 200) {
      universityOptions.value = res.data.data.records.map((r: any) => ({
        label: r.name,
        value: r.id,
      }))
    } else {
      ElMessage.error(res.data.msg || '获取院校列表失败')
    }
  } catch (e) {
    console.error('获取院校列表失败:', e)
    ElMessage.error('获取院校列表失败，请检查网络或登录状态')
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
const handleUniversitySearch = (query: string) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchUniversityOptions(query || undefined)
  }, 300)
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.universityName) params.universityName = queryParams.universityName
    if (queryParams.status !== undefined && queryParams.status !== null) params.status = queryParams.status
    const res = await getGuidePage(params as UniversityGuideQueryDTO)
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

const handleSearch = (p?: Pick<UniversityGuideQueryDTO, 'universityName' | 'status'>) => {
  if (p) { queryParams.universityName = p.universityName; queryParams.status = p.status }
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.universityName = ''
  queryParams.status = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }
const handleSelectionChange = (selection: UniversityGuideListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const jsonbInputValue = ref('')
const jsonbInputTarget = ref<{ fieldKey: string; subKey: string } | null>(null)

const showJsonbInput = (fieldKey: string, subKey: string) => {
  jsonbInputTarget.value = { fieldKey, subKey }
  jsonbInputValue.value = ''
}

const addJsonbItem = (fieldKey: string, subKey: string, target: Record<string, Record<string, string[]>>, value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return
  if (!target[fieldKey][subKey]) target[fieldKey][subKey] = []
  target[fieldKey][subKey].push(trimmed)
}

const removeJsonbItem = (fieldKey: string, subKey: string, target: Record<string, Record<string, string[]>>, index: number) => {
  target[fieldKey][subKey].splice(index, 1)
}

const confirmJsonbInput = (target: Record<string, Record<string, string[]>>) => {
  if (!jsonbInputTarget.value || !jsonbInputValue.value.trim()) {
    jsonbInputTarget.value = null
    jsonbInputValue.value = ''
    return
  }
  const { fieldKey, subKey } = jsonbInputTarget.value
  addJsonbItem(fieldKey, subKey, target, jsonbInputValue.value)
  jsonbInputValue.value = ''
  jsonbInputTarget.value = null
}

const getDetailArray = (fieldKey: string, subKey: string): string[] => {
  if (!detailData.value) return []
  const rawVal = (detailData.value as any)[fieldKey]
  if (!rawVal || typeof rawVal !== 'object' || Array.isArray(rawVal)) return []
  const arr = rawVal[subKey]
  return Array.isArray(arr) ? arr.map(String) : []
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null
  if (mode === 'add') {
    dialogTitle.value = '新增院校适应指南'
    formData.universityId = ''
    formData.customTags = []
    formData.remark = ''
    formData.jsonbData = buildEmptyJsonb()
    detailData.value = null
    await fetchUniversityOptions()
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改院校适应指南'
    formLoading.value = true
    try {
      const res = await getGuideDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        editFormData.customTags = d.customTags || []
        editFormData.remark = d.remark || ''
        editFormData.status = d.status
        editFormData.jsonbData = buildEmptyJsonb()
        JSONB_FIELDS.forEach(field => {
          const key = field.key as keyof UniversityGuideDetailVO
          const rawVal = d[key]
          if (rawVal && typeof rawVal === 'object' && !Array.isArray(rawVal)) {
            const obj = rawVal as Record<string, any>
            field.subFields.forEach(sub => {
              const arr = obj[sub]
              editFormData.jsonbData[field.key][sub] = Array.isArray(arr) ? arr.map(String) : []
            })
          }
        })
      }
    } catch { ElMessage.error('获取详情失败') } finally { formLoading.value = false }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '院校适应指南详情'
    formLoading.value = true
    try {
      const res = await getGuideDetail(id)
      if (res.data.code === 200) detailData.value = res.data.data
    } catch { ElMessage.error('获取详情失败') } finally { formLoading.value = false }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (dialogMode.value === 'add') {
    if (!formData.universityId) { ElMessage.warning('请选择院校'); return }
    try {
      const jsonbPayload: Record<string, Record<string, string[]>> = {}
      JSONB_FIELDS.forEach(field => {
        const fieldData = formData.jsonbData[field.key]
        const hasValues = Object.values(fieldData).some(arr => arr.length > 0)
        if (hasValues) {
          jsonbPayload[field.key] = { ...fieldData }
        }
      })
      const res = await addGuide({
        universityId: formData.universityId,
        customTags: formData.customTags?.length ? formData.customTags : undefined,
        remark: formData.remark || undefined,
        ...jsonbPayload,
      })
      if (res.data.code === 200) { ElMessage.success('新增成功'); dialogVisible.value = false; fetchData() }
      else ElMessage.error(res.data.msg || '操作失败')
    } catch { ElMessage.error('操作失败') }
  } else if (dialogMode.value === 'edit' && currentId.value) {
    try {
      const data: UniversityGuideUpdateDTO = {}
      if (editFormData.customTags?.length) data.customTags = editFormData.customTags
      if (editFormData.remark) data.remark = editFormData.remark
      data.status = editFormData.status
      JSONB_FIELDS.forEach(field => {
        const fieldData = editFormData.jsonbData[field.key]
        const hasValues = Object.values(fieldData).some(arr => arr.length > 0)
        if (hasValues) {
          ;(data as any)[field.key] = { ...fieldData }
        } else {
          ;(data as any)[field.key] = null
        }
      })
      const res = await updateGuide(currentId.value, data)
      if (res.data.code === 200) { ElMessage.success('修改成功'); dialogVisible.value = false; fetchData() }
      else ElMessage.error(res.data.msg || '操作失败')
    } catch { ElMessage.error('操作失败') }
  }
}

const handleToggleStatus = async (row: UniversityGuideListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该指南吗？`, '提示')
    const res = await updateGuideStatus(row.id, { status: newStatus })
    if (res.data.code === 200) { ElMessage.success(`${actionText}成功`); fetchData() }
    else ElMessage.error(res.data.msg || '操作失败')
  } catch { /* cancel */ }
}

const handleHardDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该指南吗？此操作不可恢复！', '警告', {
      type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消',
    })
    const res = await hardDeleteGuide(id)
    if (res.data.code === 200) { ElMessage.success('永久删除成功'); fetchData() }
    else ElMessage.error(res.data.msg || '操作失败')
  } catch { /* cancel */ }
}

const handleBatchHardDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要永久删除的指南'); return }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的${selectedIds.value.length} 条指南吗？此操作不可恢复！`, '警告', {
      type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消',
    })
    const res = await batchHardDeleteGuide(selectedIds.value as unknown as number[])
    if (res.data.code === 200) { ElMessage.success('批量永久删除成功'); fetchData() }
    else ElMessage.error(res.data.msg || '操作失败')
  } catch { /* cancel */ }
}

const handleImport = async () => {
  const input = document.createElement('input')
  input.type = 'file'; input.accept = '.xlsx,.xls'
  input.onchange = async () => {
    const file = input.files?.[0]; if (!file) return
    try {
      const res = await importGuide(file)
      if (res.data.code === 200) { ElMessage.success('导入成功'); fetchData() }
      else ElMessage.error(res.data.msg || '导入失败')
    } catch { ElMessage.error('导入失败') }
  }
  input.click()
}

const formatJsonbValue = (value: any): string => {
  if (!value) return '-'
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.join('、')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const statusLabel = (status: number) => (status === 1 ? '启用' : '禁用')

onMounted(() => { fetchData() })
</script>

<template>
  <div class="page-wrap">
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" alt="" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" alt="" /></div>
    <div class="page-header">
      <div class="page-title">院校适应指南管理</div>
      <div class="page-subtitle">管理各院校的入学适应指南信息，支持导入与批量操作</div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-card">
      <div class="section-label"><span class="label-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </span>筛选条件</div>
      <el-form :model="queryParams" inline class="search-form">
        <div class="filter-fields">
          <el-form-item label="院校名称">
            <el-input v-model="queryParams.universityName" placeholder="模糊搜索" clearable style="width:200px" @keyup.enter="handleSearch()" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width:120px">
              <el-option label="启用" :value="1" /><el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </div>
        <div class="search-actions">
          <button type="button" class="search-btn" @click="handleSearch()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>查询
          </button>
          <button type="button" class="reset-btn" @click="handleReset">重置</button>
        </div>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button type="button" class="primary-btn" @click="openDialog('add')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>新增指南
      </button>
      <button type="button" class="outline-btn" @click="handleImport">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>导入Excel
      </button>
      <button type="button" class="danger-btn" :disabled="selectedIds.length === 0" @click="handleBatchHardDelete">批量永久删除</button>
      <button type="button" class="refresh-btn" @click="fetchData">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>刷新
      </button>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <div class="custom-table" v-loading="loading">
        <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="universityName" label="院校名称" min-width="160" show-overflow-tooltip />
          <el-table-column label="自定义标签" min-width="200">
            <template #default="{ row }">
              <span v-if="row.customTags && row.customTags.length" class="tag-list">
                <span v-for="tag in row.customTags" :key="tag" class="tag-pill">{{ tag }}</span>
              </span>
              <span v-else class="dim-text">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <span class="status-pill" :class="row.status === 1 ? 'status-on' : 'status-off'">{{ statusLabel(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="300" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-group">
                <button type="button" class="act-btn act-detail" @click="openDialog('detail', row.id)">详情</button>
                <button type="button" class="act-btn act-edit" @click="openDialog('edit', row.id)">修改</button>
                <button type="button" class="act-btn" :class="row.status===1?'act-disable':'act-enable'" @click="handleToggleStatus(row)">{{ row.status===1?'禁用':'启用' }}</button>
                <button type="button" class="act-btn act-del" @click="handleHardDelete(row.id)">永久删除</button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="custom-pagination">
        <el-pagination :current-page="queryParams.page" :page-size="queryParams.size" :page-sizes="[10,20,30,50,100]" :total="total" layout="total, sizes, prev, pager, next" @current-change="handlePageChange" @size-change="handleSizeChange" />
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="950px" class="uni-dialog" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border style="margin-bottom:16px">
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="院校名称">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="自定义标签" :span="2">
              <span v-if="detailData.customTags && detailData.customTags.length" class="tag-list">
                <span v-for="tag in detailData.customTags" :key="tag" class="tag-pill">{{ tag }}</span>
              </span>
              <span v-else class="dim-text">-</span>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <span class="status-pill" :class="detailData.status===1?'status-on':'status-off'">{{ statusLabel(detailData.status) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
          <el-collapse>
            <el-collapse-item v-for="field in JSONB_FIELDS" :key="field.key" :title="field.label" :name="field.key">
              <template v-if="detailData[field.key as keyof UniversityGuideDetailVO]">
                <div v-for="sub in field.subFields" :key="sub" class="jsonb-detail-row">
                  <div class="jsonb-detail-label">{{ sub }}</div>
                  <div class="jsonb-detail-items">
                    <template v-if="getDetailArray(field.key, sub).length">
                      <span v-for="(item, idx) in getDetailArray(field.key, sub)" :key="idx" class="jsonb-detail-item">{{ item }}</span>
                    </template>
                    <span v-else class="dim-text">暂无数据</span>
                  </div>
                </div>
              </template>
              <span v-else class="dim-text">暂无数据</span>
            </el-collapse-item>
          </el-collapse>
        </template>
        <template v-if="dialogMode === 'add'">
          <el-form :model="formData" label-width="100px" class="uni-form">
            <el-form-item label="院校" required>
              <el-select v-model="formData.universityId" placeholder="请输入院校名称搜索" filterable remote :remote-method="handleUniversitySearch" :loading="formLoading" style="width:100%">
                <el-option v-for="item in universityOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="自定义标签">
              <el-select v-model="formData.customTags" multiple filterable allow-create default-first-option placeholder="输入标签后回车" style="width:100%" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="备注信息" />
            </el-form-item>
            <el-divider content-position="left">
              <span style="font-size:13px;font-weight:600;color:#C2410C;">院校适应指南详情</span>
            </el-divider>
            <el-collapse>
              <el-collapse-item v-for="field in JSONB_FIELDS" :key="field.key" :title="field.label" :name="field.key">
                <div v-for="sub in field.subFields" :key="sub" style="margin-bottom:12px;">
                  <div style="font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">{{ sub }}</div>
                  <div class="jsonb-tag-list">
                    <span v-for="(item, idx) in formData.jsonbData[field.key][sub]" :key="idx" class="jsonb-tag">
                      {{ item }}
                      <button type="button" class="jsonb-tag-remove" @click="removeJsonbItem(field.key, sub, formData.jsonbData, idx)">×</button>
                    </span>
                    <template v-if="jsonbInputTarget?.fieldKey === field.key && jsonbInputTarget?.subKey === sub">
                      <el-input v-model="jsonbInputValue" size="small" style="width:160px;" placeholder="输入内容" @keyup.enter="confirmJsonbInput(formData.jsonbData)" @blur="confirmJsonbInput(formData.jsonbData)" />
                    </template>
                    <button v-else type="button" class="jsonb-add-btn" @click="showJsonbInput(field.key, sub)">+ 添加</button>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </template>
        <template v-if="dialogMode === 'edit'">
          <el-form :model="editFormData" label-width="100px" class="uni-form">
            <el-form-item label="自定义标签">
              <el-select v-model="editFormData.customTags" multiple filterable allow-create default-first-option placeholder="输入标签后回车" style="width:100%" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="editFormData.remark" type="textarea" :rows="3" placeholder="备注信息" />
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="editFormData.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-divider content-position="left">
              <span style="font-size:13px;font-weight:600;color:#C2410C;">院校适应指南详情</span>
            </el-divider>
            <el-collapse>
              <el-collapse-item v-for="field in JSONB_FIELDS" :key="field.key" :title="field.label" :name="field.key">
                <div v-for="sub in field.subFields" :key="sub" style="margin-bottom:12px;">
                  <div style="font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">{{ sub }}</div>
                  <div class="jsonb-tag-list">
                    <span v-for="(item, idx) in editFormData.jsonbData[field.key][sub]" :key="idx" class="jsonb-tag">
                      {{ item }}
                      <button type="button" class="jsonb-tag-remove" @click="removeJsonbItem(field.key, sub, editFormData.jsonbData, idx)">×</button>
                    </span>
                    <template v-if="jsonbInputTarget?.fieldKey === field.key && jsonbInputTarget?.subKey === sub">
                      <el-input v-model="jsonbInputValue" size="small" style="width:160px;" placeholder="输入内容" @keyup.enter="confirmJsonbInput(editFormData.jsonbData)" @blur="confirmJsonbInput(editFormData.jsonbData)" />
                    </template>
                    <button v-else type="button" class="jsonb-add-btn" @click="showJsonbInput(field.key, sub)">+ 添加</button>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </template>
      </div>
      <template #footer>
        <button type="button" class="cancel-btn" @click="dialogVisible=false">{{ dialogMode==='detail'?'关闭':'取消' }}</button>
        <button v-if="dialogMode!=='detail'" type="button" class="submit-btn" @click="handleSubmit">确定</button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* Page */
.page-wrap { min-height:calc(100vh - 60px); background:linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%); padding:24px; position:relative; overflow:hidden; }
.watermark-left,.watermark-right { position:absolute; opacity:0.05; pointer-events:none; z-index:0; }
.watermark-left { top:-60px; right:40px; transform:rotate(18deg); }
.watermark-right { bottom:-40px; left:30px; transform:rotate(-12deg); }
.watermark-left img,.watermark-right img { width:180px; height:auto; }
.page-header { position:relative; z-index:1; margin-bottom:24px; }
.page-title { font-size:22px; font-weight:700; color:#1f2937; margin-bottom:4px; letter-spacing:-0.02em; }
.page-subtitle { font-size:13px; color:#9ca3af; }

/* Search Card */
.search-card { background:#fff; border-radius:12px; padding:24px; margin-bottom:16px; border:1px solid rgba(249,115,22,0.1); border-top:3px solid #F97316; border-bottom:3px solid #FB923C; transition:all 0.3s cubic-bezier(0.4,0,0.2,1); }
.search-card:hover { box-shadow:0 4px 16px rgba(249,115,22,0.08); transform:translateY(-1px); }
.section-label { display:inline-flex; align-items:center; gap:6px; padding:6px 16px; background:linear-gradient(135deg,#F97316,#FB923C); color:#fff; font-size:13px; font-weight:600; border-radius:20px; margin-bottom:20px; }
.label-icon { display:flex; align-items:center; }
.search-form { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; }
.filter-fields { display:flex; align-items:flex-start; flex-wrap:wrap; gap:8px; }
.search-form :deep(.el-form-item) { margin-bottom:0; }
.search-form :deep(.el-form-item__label) { font-weight:500; color:#374151; }
.search-form :deep(.el-input__wrapper),.search-form :deep(.el-select__wrapper) { border-radius:8px; transition:all 0.25s cubic-bezier(0.4,0,0.2,1); }
.search-form :deep(.el-input__wrapper:hover),.search-form :deep(.el-select__wrapper:hover) { box-shadow:0 0 0 1px rgba(249,115,22,0.3) inset; }
.search-form :deep(.el-input__wrapper.is-focus),.search-form :deep(.el-select__wrapper.is-focused) { box-shadow:0 0 0 1px #F97316 inset; }
.search-actions { display:flex; align-items:center; gap:10px; margin-left:auto; }

/* Buttons - Micro-animations */
.search-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 24px; background:linear-gradient(135deg,#F97316,#FB923C); color:#fff; border:none; border-radius:20px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.25s cubic-bezier(0.4,0,0.2,1); box-shadow:0 2px 8px rgba(249,115,22,0.3); }
.search-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(249,115,22,0.4); }
.search-btn:active { transform:translateY(0) scale(0.98); box-shadow:0 1px 4px rgba(249,115,22,0.3); }
.reset-btn { display:inline-flex; align-items:center; padding:8px 20px; background:#fff; color:#6b7280; border:1px solid #d1d5db; border-radius:20px; font-size:14px; font-weight:500; cursor:pointer; transition:all 0.25s cubic-bezier(0.4,0,0.2,1); }
.reset-btn:hover { color:#374151; border-color:#9ca3af; background:#f9fafb; }
.reset-btn:active { transform:scale(0.98); }

/* Action Bar */
.action-bar { position:relative; z-index:1; display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
.primary-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 20px; background:linear-gradient(135deg,#F97316,#FB923C); color:#fff; border:none; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.25s cubic-bezier(0.4,0,0.2,1); box-shadow:0 2px 8px rgba(249,115,22,0.3); }
.primary-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(249,115,22,0.4); }
.primary-btn:active { transform:translateY(0) scale(0.98); }
.outline-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 20px; background:#fff; color:#374151; border:1px solid #d1d5db; border-radius:20px; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.25s cubic-bezier(0.4,0,0.2,1); }
.outline-btn:hover { color:#F97316; border-color:#F97316; background:rgba(249,115,22,0.04); }
.outline-btn:active { transform:scale(0.98); }
.danger-btn { display:inline-flex; align-items:center; padding:8px 20px; background:linear-gradient(135deg,#ef4444,#f87171); color:#fff; border:none; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.25s cubic-bezier(0.4,0,0.2,1); box-shadow:0 2px 8px rgba(239,68,68,0.3); }
.danger-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(239,68,68,0.4); }
.danger-btn:active { transform:translateY(0) scale(0.98); }
.danger-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; box-shadow:none; }
.refresh-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 20px; background:#fff; color:#6b7280; border:1px solid #d1d5db; border-radius:20px; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.25s cubic-bezier(0.4,0,0.2,1); }
.refresh-btn:hover { color:#374151; border-color:#9ca3af; background:#f9fafb; }
.refresh-btn:active { transform:scale(0.98); }

/* Table Card */
.table-card { background:#fff; border-radius:12px; padding:24px; border:1px solid rgba(249,115,22,0.1); border-top:3px solid #F97316; border-bottom:3px solid #FB923C; transition:all 0.3s cubic-bezier(0.4,0,0.2,1); }
.table-card:hover { box-shadow:0 4px 16px rgba(249,115,22,0.08); }
.custom-table :deep(.el-table) { --el-table-border-color:#f3f4f6; --el-table-header-bg-color:transparent; border-radius:8px; overflow:hidden; }
.custom-table :deep(.el-table__header th) { background:linear-gradient(180deg,#fff7ed,#ffedd5)!important; color:#1f2937!important; font-weight:600; font-size:14px; border-bottom:2px solid #F97316!important; padding:14px 0; }
.custom-table :deep(.el-table__header th .cell) { color:#1f2937; }
.custom-table :deep(.el-table__body tr) { transition:background 0.2s ease; }
.custom-table :deep(.el-table__body tr:hover>td) { background:linear-gradient(90deg,rgba(249,115,22,0.03),rgba(251,146,60,0.07))!important; }
.custom-table :deep(.el-table__body td) { border-bottom:1px solid #f3f4f6; padding:12px 0; transition:background 0.2s ease; }
.custom-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) { background:rgba(255,247,237,0.3); }
.dim-text { font-size:13px; color:#9ca3af; }
.tag-list { display:flex; flex-wrap:wrap; gap:4px; }
.tag-pill { display:inline-flex; align-items:center; padding:2px 10px; background:linear-gradient(135deg,rgba(249,115,22,0.08),rgba(251,146,60,0.12)); color:#C2410C; border:1px solid rgba(249,115,22,0.2); border-radius:20px; font-size:12px; font-weight:500; }
.status-pill { display:inline-flex; align-items:center; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:500; border:1px solid transparent; }
.status-on { background:linear-gradient(135deg,rgba(249,115,22,0.08),rgba(251,146,60,0.12)); color:#C2410C; border-color:rgba(249,115,22,0.2); }
.status-off { background:#f3f4f6; color:#6b7280; border-color:#e5e7eb; }

/* Action Buttons - Micro-animations */
.action-group { display:flex; align-items:center; justify-content:center; gap:5px; flex-wrap:wrap; }
.act-btn { display:inline-flex; align-items:center; padding:3px 10px; border:none; border-radius:12px; font-size:12px; font-weight:500; cursor:pointer; transition:all 0.2s cubic-bezier(0.4,0,0.2,1); white-space:nowrap; }
.act-btn:active { transform:scale(0.95); }
.act-detail { background:linear-gradient(135deg,#F97316,#FB923C); color:#fff; }
.act-detail:hover { box-shadow:0 2px 8px rgba(249,115,22,0.3); transform:translateY(-1px); }
.act-edit { background:linear-gradient(135deg,#2563eb,#60a5fa); color:#fff; }
.act-edit:hover { box-shadow:0 2px 8px rgba(37,99,235,0.3); transform:translateY(-1px); }
.act-enable { background:linear-gradient(135deg,#10b981,#34d399); color:#fff; }
.act-enable:hover { box-shadow:0 2px 8px rgba(16,185,129,0.3); transform:translateY(-1px); }
.act-disable { background:linear-gradient(135deg,#f59e0b,#fbbf24); color:#fff; }
.act-disable:hover { box-shadow:0 2px 8px rgba(245,158,11,0.3); transform:translateY(-1px); }
.act-del { background:linear-gradient(135deg,#b91c1c,#dc2626); color:#fff; }
.act-del:hover { box-shadow:0 2px 8px rgba(185,28,28,0.3); transform:translateY(-1px); }

/* Pagination */
.custom-pagination { display:flex; justify-content:flex-end; margin-top:20px; padding-top:16px; border-top:1px solid #f3f4f6; }
.custom-pagination :deep(.el-pagination) { --el-pagination-hover-color:#F97316; }
.custom-pagination :deep(.el-pager li) { border-radius:8px; transition:all 0.2s cubic-bezier(0.4,0,0.2,1); font-weight:500; }
.custom-pagination :deep(.el-pager li:hover) { color:#F97316; transform:translateY(-1px); }
.custom-pagination :deep(.el-pager li.is-active) { background:linear-gradient(135deg,#F97316,#FB923C); color:#fff; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) { border-radius:8px; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) { box-shadow:0 0 0 1px rgba(249,115,22,0.3) inset; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper.is-focused) { box-shadow:0 0 0 1px #F97316 inset; }
.custom-pagination :deep(.btn-prev),.custom-pagination :deep(.btn-next) { border-radius:8px; }
.custom-pagination :deep(.btn-prev:hover),.custom-pagination :deep(.btn-next:hover) { color:#F97316; }

/* Dialog */
.uni-dialog :deep(.el-dialog) { border-radius:12px; overflow:hidden; }
.uni-dialog :deep(.el-dialog__header) { border-bottom:2px solid rgba(249,115,22,0.15); padding:20px 24px; margin:0; }
.uni-dialog :deep(.el-dialog__title) { font-size:16px; font-weight:600; color:#1f2937; }
.uni-dialog :deep(.el-dialog__body) { padding:24px; }
.uni-dialog :deep(.el-dialog__footer) { border-top:1px solid #f3f4f6; padding:16px 24px; }
.uni-dialog :deep(.el-descriptions) { --el-descriptions-item-bordered-label-background:rgba(249,115,22,0.05); }
.uni-dialog :deep(.el-descriptions__label) { font-weight:600; color:#374151; background:rgba(249,115,22,0.06)!important; }
.uni-dialog :deep(.el-descriptions__cell) { border-color:rgba(249,115,22,0.1); }
.uni-form :deep(.el-form-item__label) { font-weight:500; color:#374151; }
.uni-form :deep(.el-input__wrapper),.uni-form :deep(.el-textarea__inner),.uni-form :deep(.el-select__wrapper) { border-radius:8px; transition:all 0.25s cubic-bezier(0.4,0,0.2,1); }
.uni-form :deep(.el-input__wrapper:hover),.uni-form :deep(.el-textarea__inner:hover),.uni-form :deep(.el-select__wrapper:hover) { box-shadow:0 0 0 1px rgba(249,115,22,0.3) inset; }
.uni-form :deep(.el-input__wrapper.is-focus),.uni-form :deep(.el-textarea__inner:focus),.uni-form :deep(.el-select__wrapper.is-focused) { box-shadow:0 0 0 1px #F97316 inset; }
.uni-form :deep(.el-switch.is-checked .el-switch__core) { background:#F97316; border-color:#F97316; }
.cancel-btn { display:inline-flex; align-items:center; padding:8px 24px; background:#fff; color:#6b7280; border:1px solid #d1d5db; border-radius:20px; font-size:14px; font-weight:500; cursor:pointer; transition:all 0.25s cubic-bezier(0.4,0,0.2,1); }
.cancel-btn:hover { color:#374151; border-color:#9ca3af; background:#f9fafb; }
.cancel-btn:active { transform:scale(0.98); }
.submit-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 24px; background:linear-gradient(135deg,#F97316,#FB923C); color:#fff; border:none; border-radius:20px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.25s cubic-bezier(0.4,0,0.2,1); box-shadow:0 2px 8px rgba(249,115,22,0.3); }
.submit-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(249,115,22,0.4); }
.submit-btn:active { transform:translateY(0) scale(0.98); }
.uni-form :deep(.el-divider) { margin:20px 0 12px; }
.uni-form :deep(.el-divider__text) { background:#fff; padding-right:12px; }
.uni-form :deep(.el-collapse) { border:1px solid rgba(249,115,22,0.15); border-radius:8px; }
.uni-form :deep(.el-collapse-item__header) { background:linear-gradient(180deg,#fff7ed,#ffedd5); padding:0 16px; font-weight:600; color:#1f2937; border-bottom:1px solid rgba(249,115,22,0.1); transition:background 0.2s ease; }
.uni-form :deep(.el-collapse-item__header:hover) { background:linear-gradient(180deg,#fff7ed,#ffedd5); }
.uni-form :deep(.el-collapse-item__wrap) { border-bottom:1px solid rgba(249,115,22,0.1); }
.uni-form :deep(.el-collapse-item:last-child .el-collapse-item__wrap) { border-bottom:none; }
.uni-form :deep(.el-collapse-item__content) { padding:12px 16px; }

/* JSONB Tag List */
.jsonb-tag-list { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
.jsonb-tag { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; background:linear-gradient(135deg,rgba(249,115,22,0.08),rgba(251,146,60,0.12)); color:#C2410C; border:1px solid rgba(249,115,22,0.2); border-radius:20px; font-size:12px; font-weight:500; transition:all 0.2s ease; }
.jsonb-tag:hover { background:linear-gradient(135deg,rgba(249,115,22,0.12),rgba(251,146,60,0.18)); }
.jsonb-tag-remove { display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border:none; background:rgba(249,115,22,0.15); color:#C2410C; border-radius:50%; font-size:12px; cursor:pointer; line-height:1; padding:0; transition:all 0.2s ease; }
.jsonb-tag-remove:hover { background:rgba(239,68,68,0.2); color:#dc2626; transform:scale(1.1); }
.jsonb-add-btn { display:inline-flex; align-items:center; padding:4px 12px; background:#fff; color:#F97316; border:1px dashed rgba(249,115,22,0.4); border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; transition:all 0.2s cubic-bezier(0.4,0,0.2,1); }
.jsonb-add-btn:hover { border-color:#F97316; background:rgba(249,115,22,0.04); transform:translateY(-1px); }
.jsonb-add-btn:active { transform:scale(0.98); }

/* JSONB Detail View */
.jsonb-detail-row { margin-bottom:12px; }
.jsonb-detail-row:last-child { margin-bottom:0; }
.jsonb-detail-label { font-size:13px; font-weight:600; color:#374151; margin-bottom:6px; }
.jsonb-detail-items { display:flex; flex-wrap:wrap; gap:6px; }
.jsonb-detail-item { display:inline-flex; align-items:center; padding:4px 12px; background:rgba(249,115,22,0.05); color:#1f2937; border:1px solid rgba(249,115,22,0.12); border-radius:8px; font-size:13px; line-height:1.5; transition:all 0.2s ease; }
.jsonb-detail-item:hover { background:rgba(249,115,22,0.08); border-color:rgba(249,115,22,0.2); }
</style>
