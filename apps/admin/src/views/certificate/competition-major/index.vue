<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getCompetitionMajorPage,

  getByCompetitionId,

  getByMajorId,

  addCompetitionMajor,

  deleteCompetitionMajor,

  batchDeleteCompetitionMajor,

} from '@/api/certificate/competitionMajor'

import type {

  CompetitionMajorListVO,

  CompetitionMajorQueryDTO,

  CompetitionMajorAddDTO,

} from '@/types/certificate/competitionMajor'



const loading = ref(false)

const tableData = ref<CompetitionMajorListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<CompetitionMajorQueryDTO>({

  page: 1,

  size: 10,

  competitionName: '',

  majorName: '',

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'add'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const detailData = ref<CompetitionMajorListVO | null>(null)



const addForm = reactive<CompetitionMajorAddDTO>({

  competitionName: '',

  majorName: '',

})



// 按ID查询

const idQueryVisible = ref(false)

const idQueryType = ref<'competition' | 'major'>('competition')

const idQueryValue = ref<string | undefined>(undefined)



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.competitionName) params.competitionName = queryParams.competitionName

    if (queryParams.majorName) params.majorName = queryParams.majorName

    const res = await getCompetitionMajorPage(params as CompetitionMajorQueryDTO)

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

  queryParams.competitionName = ''

  queryParams.majorName = ''

  queryParams.competitionId = undefined

  queryParams.majorId = undefined

  queryParams.page = 1

  fetchData()

}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }

const handleSelectionChange = (val: CompetitionMajorListVO[]) => { selectedIds.value = val.map(v => v.id) }



const openIdQuery = (type: 'competition' | 'major') => {

  idQueryType.value = type

  idQueryValue.value = undefined

  idQueryVisible.value = true

}



const handleIdQuery = async () => {

  if (!idQueryValue.value) {

    ElMessage.warning(`请输入${idQueryType.value === 'competition' ? '竞赛' : '专业'}ID`)

    return

  }

  formLoading.value = true

  try {

    let res: any

    if (idQueryType.value === 'competition') {

      res = await getByCompetitionId(idQueryValue.value)

    } else {

      res = await getByMajorId(idQueryValue.value)

    }

    if (res.data.code === 200) {

      tableData.value = res.data.data

      total.value = res.data.data.length

      idQueryVisible.value = false

    } else {

      ElMessage.error(res.data.msg || '查询失败')

    }

  } catch {

    ElMessage.error('查询失败')

  } finally {

    formLoading.value = false

  }

}



const openAddDialog = () => {

  dialogMode.value = 'add'

  dialogTitle.value = '新增关联'

  addForm.competitionName = ''

  addForm.majorName = ''

  detailData.value = null

  dialogVisible.value = true

}



const openDetailDialog = (row: CompetitionMajorListVO) => {

  dialogMode.value = 'detail'

  dialogTitle.value = '关联详情'

  detailData.value = row

  dialogVisible.value = true

}



const handleAddSubmit = async () => {

  if (!addForm.competitionName) {

    ElMessage.warning('请填写竞赛名称')

    return

  }

  if (!addForm.majorName) {

    ElMessage.warning('请填写专业名称')

    return

  }

  try {

    const res = await addCompetitionMajor({

      competitionName: addForm.competitionName,

      majorName: addForm.majorName,

    })

    if (res.data.code === 200) {

      ElMessage.success('新增关联成功')

      dialogVisible.value = false

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch {

    ElMessage.error('操作失败')

  }

}



const handleDelete = async (id: string, name: string) => {

  try {

    await ElMessageBox.confirm(

      `确定要删除竞赛"${name}"的关联吗？删除后数据保留可恢复。`,

      '提示'

    )

    const res = await deleteCompetitionMajor(id)

    if (res.data.code === 200) {

      ElMessage.success('删除成功')

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch { /* 取消 */ }

}



const handleBatchDelete = async () => {

  if (selectedIds.value.length === 0) {

    ElMessage.warning('请选择要删除的关联')

    return

  }

  try {

    await ElMessageBox.confirm(

      `确定要批量删除选中的${selectedIds.value.length} 条关联记录吗？数据保留可恢复。`,

      '警告',

      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }

    )

    const res = await batchDeleteCompetitionMajor(selectedIds.value)

    if (res.data.code === 200) {

      ElMessage.success('批量删除成功')

      selectedIds.value = []

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch { /* 取消 */ }

}



onMounted(() => { fetchData() })

</script>



<template>

  <div>

    <!-- 搜索-->

    <div class="mb-4 rounded-lg bg-white p-5">

      <el-form :model="queryParams" inline>

        <el-form-item label="竞赛名称">

          <el-input v-model="queryParams.competitionName" placeholder="竞赛名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="专业名称">

          <el-input v-model="queryParams.majorName" placeholder="专业名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item>

          <el-button type="primary" @click="handleSearch">查询</el-button>

          <el-button @click="handleReset">重置</el-button>

        </el-form-item>

        <el-form-item>

          <el-button @click="openIdQuery('competition')">按竞赛ID查询</el-button>

          <el-button @click="openIdQuery('major')">按专业ID查询</el-button>

        </el-form-item>

      </el-form>

    </div>



    <!-- 操作-->

    <div class="mb-4">

      <el-button type="primary" @click="openAddDialog">新增关联</el-button>

      <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchDelete">批量删除</el-button>

      <el-button @click="fetchData">刷新</el-button>

    </div>



    <!-- 表格 -->

    <div class="rounded-lg bg-white p-5">

      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">

        <el-table-column type="selection" width="50" />

        <el-table-column prop="id" label="ID" width="140" />

        <el-table-column prop="competitionName" label="竞赛名称" width="200" show-overflow-tooltip />

        <el-table-column prop="majorName" label="专业名称" width="180" show-overflow-tooltip />

        <el-table-column prop="createdAt" label="创建时间" width="180" />

        <el-table-column label="操作" width="200" align="center" fixed="right">

          <template #default="{ row }">

            <el-button type="primary" link @click="openDetailDialog(row)">详情</el-button>

            <el-button type="danger" link @click="handleDelete(row.id, row.competitionName)">软删除</el-button>

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



    <!-- 新增 Dialog -->

    <el-dialog v-if="dialogMode === 'add'" :model-value="dialogVisible" @update:model-value="dialogVisible = $event" title="新增关联" width="500px" :close-on-click-modal="false">

      <el-form :model="addForm" label-width="100px">

        <el-form-item label="竞赛名称" required>

          <el-input v-model="addForm.competitionName" placeholder="输入竞赛名称，系统自动查找ID" />

        </el-form-item>

        <el-form-item label="专业名称" required>

          <el-input v-model="addForm.majorName" placeholder="输入专业名称，系统自动查找ID" />

        </el-form-item>

      </el-form>

      <template #footer>

        <el-button @click="dialogVisible = false">取消</el-button>

        <el-button type="primary" @click="handleAddSubmit">确定</el-button>

      </template>

    </el-dialog>



    <!-- 详情 Dialog -->

    <el-dialog v-if="dialogMode === 'detail'" :model-value="dialogVisible" @update:model-value="dialogVisible = $event" title="关联详情" width="500px" :close-on-click-modal="false">

      <div v-if="detailData">

        <el-descriptions :column="1" border>

          <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>

          <el-descriptions-item label="竞赛ID">{{ detailData.competitionId }}</el-descriptions-item>

          <el-descriptions-item label="专业ID">{{ detailData.majorId }}</el-descriptions-item>

          <el-descriptions-item label="竞赛名称">{{ detailData.competitionName }}</el-descriptions-item>

          <el-descriptions-item label="专业名称">{{ detailData.majorName }}</el-descriptions-item>

          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>

        </el-descriptions>

      </div>

      <template #footer>

        <el-button @click="dialogVisible = false">关闭</el-button>

      </template>

    </el-dialog>



    <!-- 按ID查询 Dialog -->

    <el-dialog v-model="idQueryVisible" :title="idQueryType === 'competition' ? '按竞赛ID查询' : '按专业ID查询'" width="400px" :close-on-click-modal="false">

      <el-form label-width="100px">

        <el-form-item :label="idQueryType === 'competition' ? '竞赛ID' : '专业ID'" required>

          <el-input-number v-model="idQueryValue" :min="1" style="width: 100%" />

        </el-form-item>

      </el-form>

      <template #footer>

        <el-button @click="idQueryVisible = false">取消</el-button>

        <el-button type="primary" @click="handleIdQuery">查询</el-button>

      </template>

    </el-dialog>

  </div>

</template>

