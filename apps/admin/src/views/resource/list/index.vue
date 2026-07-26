<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getResourcePage,

  getResourceDetail,

  addResource,

  updateResource,

  updateResourceStatus,

  deleteResource,

  batchDeleteResource,

  importResource,

} from '@/api/resource'

import type {

  ResourceListVO,

  ResourceDetailVO,

  ResourceQueryDTO,

  ResourceAddDTO,

  ResourceUpdateDTO,

} from '@/types/resource'



const loading = ref(false)

const tableData = ref<ResourceListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<ResourceQueryDTO>({

  page: 1,

  size: 10,

  resourceName: '',

  category: '',

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<ResourceDetailVO | null>(null)



const formData = reactive<Record<string, any>>({

  resourceName: '',

  coverUrl: '',

  description: '',

  resourceUrl: '',

  accessCode: '',

  category: '',

  fileType: '',

  sortOrder: null,

})



const importDialogVisible = ref(false)

const importFile = ref<File | null>(null)

const importLoading = ref(false)



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.resourceName) params.resourceName = queryParams.resourceName

    if (queryParams.category) params.category = queryParams.category

    const res = await getResourcePage(params as ResourceQueryDTO)

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

  queryParams.resourceName = ''

  queryParams.category = ''

  queryParams.page = 1

  fetchData()

}



const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }



const handleSizeChange = (size: number) => {

  queryParams.size = size

  queryParams.page = 1

  fetchData()

}



const handleSelectionChange = (rows: ResourceListVO[]) => {

  selectedIds.value = rows.map((r) => r.id)

}



const resetForm = () => {

  formData.resourceName = ''

  formData.coverUrl = ''

  formData.description = ''

  formData.resourceUrl = ''

  formData.accessCode = ''

  formData.category = ''

  formData.fileType = ''

  formData.sortOrder = null

}



const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {

  dialogMode.value = mode

  currentId.value = id || null



  if (mode === 'add') {

    dialogTitle.value = '新增资源'

    resetForm()

    detailData.value = null

  } else if (mode === 'edit' && id) {

    dialogTitle.value = '修改资源'

    formLoading.value = true

    try {

      const res = await getResourceDetail(id)

      if (res.data.code === 200) {

        const d = res.data.data

        formData.resourceName = d.resourceName

        formData.coverUrl = d.coverUrl || ''

        formData.description = d.description || ''

        formData.resourceUrl = d.resourceUrl

        formData.accessCode = d.accessCode || ''

        formData.category = d.category || ''

        formData.fileType = d.fileType || ''

      }

    } catch { ElMessage.error('获取详情失败') }

    finally { formLoading.value = false }

    detailData.value = null

  } else if (mode === 'detail' && id) {

    dialogTitle.value = '资源详情'

    formLoading.value = true

    try {

      const res = await getResourceDetail(id)

      if (res.data.code === 200) detailData.value = res.data.data

    } catch { ElMessage.error('获取详情失败') }

    finally { formLoading.value = false }

  }

  dialogVisible.value = true

}



const handleSubmit = async () => {

  if (!formData.resourceName || !formData.resourceUrl) {

    ElMessage.warning('请填写资源名称和资源URL')

    return

  }



  try {

    const data: Record<string, any> = {

      resourceName: formData.resourceName,

      resourceUrl: formData.resourceUrl,

    }

    if (formData.coverUrl) data.coverUrl = formData.coverUrl

    if (formData.description) data.description = formData.description

    if (formData.accessCode) data.accessCode = formData.accessCode

    if (formData.category) data.category = formData.category

    if (formData.fileType) data.fileType = formData.fileType

    if (formData.sortOrder !== null) data.sortOrder = formData.sortOrder



    let res: any

    if (dialogMode.value === 'add') {

      res = await addResource(data as ResourceAddDTO)

    } else if (dialogMode.value === 'edit' && currentId.value) {

      res = await updateResource(currentId.value, data as ResourceUpdateDTO)

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



const handleToggleStatus = async (row: ResourceListVO) => {

  const newStatus = !row.isDeleted

  const actionText = newStatus ? '禁用' : '启用'

  try {

    await ElMessageBox.confirm(`确定${actionText}该资源吗？`, '提示')

    const res = await updateResourceStatus(row.id, { isDeleted: newStatus })

    if (res.data.code === 200) { ElMessage.success(`${actionText}成功`); fetchData() }

    else { ElMessage.error(res.data.msg || '操作失败') }

  } catch { /* cancel */ }

}



const handleDelete = async (id: string) => {

  try {

    await ElMessageBox.confirm('确定要下架该资源吗？下架后可恢复。', '提示', {

      type: 'warning', confirmButtonText: '确定下架', cancelButtonText: '取消',

    })

    const res = await deleteResource(id)

    if (res.data.code === 200) { ElMessage.success('下架成功'); fetchData() }

    else { ElMessage.error(res.data.msg || '下架失败') }

  } catch { /* cancel */ }

}



const handleBatchDelete = async () => {

  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要下架的资源'); return }

  try {

    await ElMessageBox.confirm(`确定要批量下架选中的${selectedIds.value.length} 条资源吗？下架后可恢复。`, '提示', {

      type: 'warning', confirmButtonText: '确定批量下架', cancelButtonText: '取消',

    })

    const res = await batchDeleteResource(selectedIds.value)

    if (res.data.code === 200) { ElMessage.success('批量下架成功'); selectedIds.value = []; fetchData() }

    else { ElMessage.error(res.data.msg || '批量下架失败') }

  } catch { /* cancel */ }

}



const handleImportFileChange = (uploadFile: any) => {

  importFile.value = uploadFile.raw

  return false

}



const handleImportSubmit = async () => {

  if (!importFile.value) { ElMessage.warning('请选择文件'); return }

  importLoading.value = true

  try {

    const res = await importResource(importFile.value)

    if (res.data.code === 200) { ElMessage.success('导入成功'); importDialogVisible.value = false; fetchData() }

    else { ElMessage.error(res.data.msg || '导入失败') }

  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '导入失败') }

  finally { importLoading.value = false }

}



const statusTag = (val: boolean) => (val ? 'info' : 'success')

const statusLabel = (val: boolean) => (val ? '禁用' : '启用')



onMounted(() => { fetchData() })

</script>



<template>

  <div>

    <div class="mb-4 rounded-lg bg-white p-5">

      <el-form :model="queryParams" inline>

        <el-form-item label="资源名称">

          <el-input v-model="queryParams.resourceName" placeholder="资源名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="分类">

          <el-input v-model="queryParams.category" placeholder="分类模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item>

          <el-button type="primary" @click="handleSearch">查询</el-button>

          <el-button @click="handleReset">重置</el-button>

        </el-form-item>

      </el-form>

    </div>



    <div class="mb-4 flex items-center justify-between">

      <div class="flex items-center gap-2">

        <el-button type="primary" @click="openDialog('add')">新增资源</el-button>

        <el-button type="success" @click="importDialogVisible = true">Excel导入</el-button>

        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量下架</el-button>

      </div>

      <el-button @click="fetchData">刷新</el-button>

    </div>



    <div class="rounded-lg bg-white p-5">

      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">

        <el-table-column type="selection" width="50" />

        <el-table-column prop="id" label="ID" width="140" />

        <el-table-column prop="resourceName" label="资源名称" min-width="200" show-overflow-tooltip />

        <el-table-column prop="category" label="分类" width="120" />

        <el-table-column prop="fileType" label="文件类型" width="100" align="center" />

        <el-table-column prop="viewCount" label="浏览量" width="100" align="right" />

        <el-table-column prop="isDeleted" label="状态" width="80" align="center">

          <template #default="{ row }">

            <el-tag :type="statusTag(row.isDeleted)" size="small">{{ statusLabel(row.isDeleted) }}</el-tag>

          </template>

        </el-table-column>

        <el-table-column prop="updatedAt" label="更新时间" width="180" />

        <el-table-column label="操作" width="260" align="center" fixed="right">

          <template #default="{ row }">

            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>

            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>

            <el-button :type="row.isDeleted ? 'success' : 'info'" link @click="handleToggleStatus(row)">

              {{ row.isDeleted ? '启用' : '禁用' }}

            </el-button>

            <el-button type="danger" link @click="handleDelete(row.id)">下架</el-button>

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



    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false">

      <div v-loading="formLoading">

        <template v-if="dialogMode === 'detail' && detailData">

          <el-descriptions :column="2" border>

            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>

            <el-descriptions-item label="资源名称" :span="2">{{ detailData.resourceName }}</el-descriptions-item>

            <el-descriptions-item label="分类">{{ detailData.category || '-' }}</el-descriptions-item>

            <el-descriptions-item label="文件类型">{{ detailData.fileType || '-' }}</el-descriptions-item>

            <el-descriptions-item label="资源URL" :span="2">

              <el-link type="primary" :href="detailData.resourceUrl" target="_blank">{{ detailData.resourceUrl }}</el-link>

            </el-descriptions-item>

            <el-descriptions-item label="访问码">{{ detailData.accessCode || '-' }}</el-descriptions-item>

            <el-descriptions-item label="浏览量">{{ detailData.viewCount }}</el-descriptions-item>

            <el-descriptions-item label="封面URL" :span="2">{{ detailData.coverUrl || '-' }}</el-descriptions-item>

            <el-descriptions-item label="描述" :span="2">

              <div class="max-h-40 overflow-y-auto whitespace-pre-wrap">{{ detailData.description || '-' }}</div>

            </el-descriptions-item>

            <el-descriptions-item label="状态" :span="2">

              <el-tag :type="statusTag(detailData.isDeleted)" size="small">{{ statusLabel(detailData.isDeleted) }}</el-tag>

            </el-descriptions-item>

            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>

            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>

          </el-descriptions>

        </template>



        <template v-if="dialogMode !== 'detail'">

          <el-form :model="formData" label-width="100px" class="mt-2">

            <el-form-item label="资源名称" required>

              <el-input v-model="formData.resourceName" placeholder="请输入资源名称" maxlength="100" show-word-limit />

            </el-form-item>

            <el-form-item label="资源URL" required>

              <el-input v-model="formData.resourceUrl" placeholder="请输入资源链接（如百度网盘地址）" maxlength="500" />

            </el-form-item>

            <el-row :gutter="20">

              <el-col :span="12">

                <el-form-item label="访问码">

                  <el-input v-model="formData.accessCode" placeholder="百度网盘提取码" maxlength="50" />

                </el-form-item>

              </el-col>

              <el-col :span="12">

                <el-form-item label="排序序号">

                  <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />

                </el-form-item>

              </el-col>

            </el-row>

            <el-row :gutter="20">

              <el-col :span="12">

                <el-form-item label="分类">

                  <el-input v-model="formData.category" placeholder="分类（如：考研真题）" maxlength="50" />

                </el-form-item>

              </el-col>

              <el-col :span="12">

                <el-form-item label="文件类型">

                  <el-input v-model="formData.fileType" placeholder="如：PDF/视频/压缩包" maxlength="20" />

                </el-form-item>

              </el-col>

            </el-row>

            <el-form-item label="封面URL">

              <el-input v-model="formData.coverUrl" placeholder="封面图片URL" maxlength="500" />

            </el-form-item>

            <el-form-item label="描述">

              <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="资源描述" maxlength="1000" show-word-limit />

            </el-form-item>

          </el-form>

        </template>

      </div>



      <template #footer>

        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>

        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>

      </template>

    </el-dialog>



    <el-dialog v-model="importDialogVisible" title="导入资源" width="500px">

      <el-upload drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls" :on-change="handleImportFileChange" :limit="1">

        <el-icon class="el-icon--upload" style="font-size: 48px;"><UploadFilled /></el-icon>

        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>

        <template #tip>

          <div class="el-upload__tip">仅支持 .xlsx / .xls 格式文件</div>

        </template>

      </el-upload>

      <template #footer>

        <el-button @click="importDialogVisible = false">取消</el-button>

        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>

      </template>

    </el-dialog>

  </div>

</template>

