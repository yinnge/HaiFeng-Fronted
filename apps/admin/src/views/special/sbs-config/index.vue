<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getStrongBaseUnivPage,
  getStrongBaseUnivDetail,
  addStrongBaseUniv,
  updateStrongBaseUniv,
  deleteStrongBaseUniv,
  batchDeleteStrongBaseUniv,
} from '@/api/special/strong-base-univ'
import type {
  StrongBaseUnivListVO,
  StrongBaseUnivDetailVO,
  StrongBaseUnivQueryDTO,
  StrongBaseUnivAddDTO,
  StrongBaseUnivUpdateDTO,
} from '@/types/special/strong-base-univ'

const loading = ref(false)
const tableData = ref<StrongBaseUnivListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<StrongBaseUnivQueryDTO>({
  page: 1,
  size: 10,
  universityName: '',
  isPilot: undefined,
  pilotYear: undefined,
  testBeforeScore: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<StrongBaseUnivDetailVO | null>(null)

const formData = reactive<StrongBaseUnivAddDTO>({
  universityId: '',
  universityName: '',
  isPilot: true,
  pilotYear: undefined,
  officialUrl: '',
  signupUrl: '',
  testBeforeScore: false,
  defaultEntryRatio: '1:5',
  defaultAdmissionFormula: '',
  availableMajors: [],
  specialNotes: '',
})

// 用于输入专业列表的临时字符串
const availableMajorsStr = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.universityName) params.universityName = queryParams.universityName
    if (queryParams.isPilot !== undefined && queryParams.isPilot !== null) params.isPilot = queryParams.isPilot
    if (queryParams.pilotYear) params.pilotYear = queryParams.pilotYear
    if (queryParams.testBeforeScore !== undefined && queryParams.testBeforeScore !== null) params.testBeforeScore = queryParams.testBeforeScore
    const res = await getStrongBaseUnivPage(params as StrongBaseUnivQueryDTO)
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

const handleSearch = () => { queryParams.page = 1; fetchData() }

const handleReset = () => {
  queryParams.universityName = ''
  queryParams.isPilot = undefined
  queryParams.pilotYear = undefined
  queryParams.testBeforeScore = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: StrongBaseUnivListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增配置'
    formData.universityId = ''
    formData.universityName = ''
    formData.isPilot = true
    formData.pilotYear = undefined
    formData.officialUrl = ''
    formData.signupUrl = ''
    formData.testBeforeScore = false
    formData.defaultEntryRatio = '1:5'
    formData.defaultAdmissionFormula = ''
    formData.availableMajors = []
    formData.specialNotes = ''
    availableMajorsStr.value = ''
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改配置'
    formLoading.value = true
    try {
      const res = await getStrongBaseUnivDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.universityId = d.universityId
        formData.universityName = d.universityName
        formData.isPilot = d.isPilot
        formData.pilotYear = d.pilotYear ?? undefined
        formData.officialUrl = d.officialUrl || ''
        formData.signupUrl = d.signupUrl || ''
        formData.testBeforeScore = d.testBeforeScore
        formData.defaultEntryRatio = d.defaultEntryRatio || '1:5'
        formData.defaultAdmissionFormula = d.defaultAdmissionFormula || ''
        formData.availableMajors = d.availableMajors || []
        formData.specialNotes = d.specialNotes || ''
        availableMajorsStr.value = (d.availableMajors || []).join(', ')
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '配置详情'
    formLoading.value = true
    try {
      const res = await getStrongBaseUnivDetail(id)
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
  if (!formData.universityId || !formData.universityName) {
    ElMessage.warning('请填写大学ID和名称')
    return
  }

  // 处理专业列表
  const submitData = {
    ...formData,
    availableMajors: availableMajorsStr.value
      ? availableMajorsStr.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
      : [],
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addStrongBaseUniv(submitData as StrongBaseUnivAddDTO)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateStrongBaseUniv(currentId.value, submitData as StrongBaseUnivUpdateDTO)
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
    await ElMessageBox.confirm('确定要删除该配置吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteStrongBaseUniv(id)
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
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的配置')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 条配置吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteStrongBaseUniv(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch {
    // 取消
  }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="大学名称">
          <el-input
            v-model="queryParams.universityName"
            placeholder="大学名称模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="试点校">
          <el-select
            v-model="queryParams.isPilot"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="试点年份">
          <el-input-number
            v-model="queryParams.pilotYear"
            :min="2000"
            :max="2099"
            controls-position="right"
            style="width: 130px"
            placeholder="年份"
          />
        </el-form-item>
        <el-form-item label="出分前校测">
          <el-select
            v-model="queryParams.testBeforeScore"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增配置</el-button>
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        批量删除
      </el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="universityName" label="大学名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="isPilot" label="试点校" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isPilot ? 'success' : 'info'" size="small">
              {{ row.isPilot ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pilotYear" label="试点年份" width="120" align="center">
          <template #default="{ row }">
            {{ row.pilotYear || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="testBeforeScore" label="出分前校测" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.testBeforeScore ? 'warning' : 'info'" size="small">
              {{ row.testBeforeScore ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
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

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="750px"
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="大学ID" :span="1">{{ detailData.universityId }}</el-descriptions-item>
            <el-descriptions-item label="大学名称" :span="1">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="试点校" :span="1">
              <el-tag :type="detailData.isPilot ? 'success' : 'info'" size="small">
                {{ detailData.isPilot ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="首次试点年份" :span="1">{{ detailData.pilotYear || '-' }}</el-descriptions-item>
            <el-descriptions-item label="出分前校测" :span="1">
              <el-tag :type="detailData.testBeforeScore ? 'warning' : 'info'" size="small">
                {{ detailData.testBeforeScore ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="官方页面URL" :span="1">{{ detailData.officialUrl || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名入口URL" :span="2">{{ detailData.signupUrl || '-' }}</el-descriptions-item>
            <el-descriptions-item label="默认入围比例">{{ detailData.defaultEntryRatio || '-' }}</el-descriptions-item>
            <el-descriptions-item label="默认录取公式">{{ detailData.defaultAdmissionFormula || '-' }}</el-descriptions-item>
            <el-descriptions-item label="可选专业" :span="2">
              <template v-if="detailData.availableMajors && detailData.availableMajors.length > 0">
                <el-tag
                  v-for="(m, i) in detailData.availableMajors"
                  :key="i"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 4px"
                >
                  {{ m }}
                </el-tag>
              </template>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="特殊说明" :span="2">{{ detailData.specialNotes || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="1">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="1">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="130px">
            <el-form-item label="大学ID" required>
              <el-input-number v-model="formData.universityId" :min="1" style="width: 200px" />
            </el-form-item>
            <el-form-item label="大学名称" required>
              <el-input v-model="formData.universityName" placeholder="请输入大学名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="试点校">
              <el-radio-group v-model="formData.isPilot">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="首次试点年份">
              <el-input-number v-model="formData.pilotYear" :min="2000" :max="2099" controls-position="right" style="width: 130px" />
            </el-form-item>
            <el-form-item label="出分前校测">
              <el-radio-group v-model="formData.testBeforeScore">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="官方页面URL">
              <el-input v-model="formData.officialUrl" placeholder="https://" maxlength="500" />
            </el-form-item>
            <el-form-item label="报名入口URL">
              <el-input v-model="formData.signupUrl" placeholder="https://" maxlength="500" />
            </el-form-item>
            <el-form-item label="默认入围比例">
              <el-input v-model="formData.defaultEntryRatio" placeholder="默认1:5" maxlength="20" style="width: 200px" />
            </el-form-item>
            <el-form-item label="默认录取公式">
              <el-input v-model="formData.defaultAdmissionFormula" placeholder="录取综合分公式" maxlength="500" />
            </el-form-item>
            <el-form-item label="可选专业">
              <el-input
                v-model="availableMajorsStr"
                type="textarea"
                :rows="3"
                placeholder="多个专业用逗号分隔，如：数学与应用数学, 物理学, 化学"
              />
            </el-form-item>
            <el-form-item label="特殊说明">
              <el-input
                v-model="formData.specialNotes"
                type="textarea"
                :rows="3"
                placeholder="特殊说明"
              />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">
          {{ dialogMode === 'detail' ? '关闭' : '取消' }}
        </el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
