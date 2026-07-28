<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getCertificatePage,

  getCertificateDetail,

  addCertificate,

  updateCertificate,

  updateCertificateStatus,

  softDeleteCertificate,

  hardDeleteCertificate,

  batchDeleteCertificate,

  batchUpdateCertificateStatus,

} from '@/api/certificate/certificate'

import type {

  CertificateListVO,

  CertificateDetailVO,

  CertificateQueryDTO,

  CertificateAddDTO,

  CertificateUpdateDTO,

} from '@/types/certificate/certificate'



const loading = ref(false)

const tableData = ref<CertificateListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<CertificateQueryDTO>({

  page: 1,

  size: 10,

  certName: '',

  category: undefined,

  certLevel: undefined,

  applicableMajor: '',

  isDeleted: undefined,

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<CertificateDetailVO | null>(null)



const formData = reactive<CertificateAddDTO>({

  certName: '',

  category: '',

  certLevel: '',

  applicableMajor: '',

  registrationTime: '',

  examTime: '',

  examFee: undefined,

  certIntro: '',

  examRequirements: [],

  examArrangement: '',

  officialWebsite: '',

})



const requirementInput = ref('')



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.certName) params.certName = queryParams.certName

    if (queryParams.category) params.category = queryParams.category

    if (queryParams.certLevel) params.certLevel = queryParams.certLevel

    if (queryParams.applicableMajor) params.applicableMajor = queryParams.applicableMajor

    if (queryParams.isDeleted !== undefined) params.isDeleted = queryParams.isDeleted

    const res = await getCertificatePage(params as CertificateQueryDTO)

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

  queryParams.certName = ''

  queryParams.category = undefined

  queryParams.certLevel = undefined

  queryParams.applicableMajor = ''

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



const handleSelectionChange = (val: CertificateListVO[]) => {

  selectedIds.value = val.map(v => v.id)

}



const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {

  dialogMode.value = mode

  currentId.value = id || null



  if (mode === 'add') {

    dialogTitle.value = '新增证书'

    formData.certName = ''

    formData.category = ''

    formData.certLevel = ''

    formData.applicableMajor = ''

    formData.registrationTime = ''

    formData.examTime = ''

    formData.examFee = undefined

    formData.certIntro = ''

    formData.examRequirements = []

    formData.examArrangement = ''

    formData.officialWebsite = ''

    detailData.value = null

  } else if (mode === 'edit' && id) {

    dialogTitle.value = '修改证书'

    formLoading.value = true

    try {

      const res = await getCertificateDetail(id)

      if (res.data.code === 200) {

        const d = res.data.data

        formData.certName = d.certName

        formData.category = d.category || ''

        formData.certLevel = d.certLevel || ''

        formData.applicableMajor = d.applicableMajor || ''

        formData.registrationTime = d.registrationTime || ''

        formData.examTime = d.examTime || ''

        formData.examFee = d.examFee ?? undefined

        formData.certIntro = d.certIntro || ''

        formData.examRequirements = d.examRequirements || []

        formData.examArrangement = d.examArrangement || ''

        formData.officialWebsite = d.officialWebsite || ''

      }

    } catch {

      ElMessage.error('获取详情失败')

    } finally {

      formLoading.value = false

    }

    detailData.value = null

  } else if (mode === 'detail' && id) {

    dialogTitle.value = '证书详情'

    formLoading.value = true

    try {

      const res = await getCertificateDetail(id)

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



const addRequirement = () => {

  if (requirementInput.value.trim()) {

    if (!formData.examRequirements) formData.examRequirements = []

    formData.examRequirements.push(requirementInput.value.trim())

    requirementInput.value = ''

  }

}



const removeRequirement = (index: number) => {

  if (formData.examRequirements) {

    formData.examRequirements.splice(index, 1)

  }

}



const handleSubmit = async () => {

  if (!formData.certName) {

    ElMessage.warning('请填写证书名称')

    return

  }



  try {

    let res: any

    if (dialogMode.value === 'add') {

      const data: CertificateAddDTO = { certName: formData.certName }

      if (formData.category) data.category = formData.category

      if (formData.certLevel) data.certLevel = formData.certLevel

      if (formData.applicableMajor) data.applicableMajor = formData.applicableMajor

      if (formData.registrationTime) data.registrationTime = formData.registrationTime

      if (formData.examTime) data.examTime = formData.examTime

      if (formData.examFee !== undefined && formData.examFee !== null) data.examFee = formData.examFee

      if (formData.certIntro) data.certIntro = formData.certIntro

      if (formData.examRequirements && formData.examRequirements.length > 0) data.examRequirements = formData.examRequirements

      if (formData.examArrangement) data.examArrangement = formData.examArrangement

      if (formData.officialWebsite) data.officialWebsite = formData.officialWebsite

      res = await addCertificate(data)

    } else if (dialogMode.value === 'edit' && currentId.value) {

      const data: CertificateUpdateDTO = {

        id: currentId.value,

        certName: formData.certName,

      }

      if (formData.category) data.category = formData.category

      if (formData.certLevel) data.certLevel = formData.certLevel

      if (formData.applicableMajor) data.applicableMajor = formData.applicableMajor

      if (formData.registrationTime) data.registrationTime = formData.registrationTime

      if (formData.examTime) data.examTime = formData.examTime

      if (formData.examFee !== undefined && formData.examFee !== null) data.examFee = formData.examFee

      if (formData.certIntro) data.certIntro = formData.certIntro

      if (formData.examRequirements && formData.examRequirements.length > 0) data.examRequirements = formData.examRequirements

      if (formData.examArrangement) data.examArrangement = formData.examArrangement

      if (formData.officialWebsite) data.officialWebsite = formData.officialWebsite

      res = await updateCertificate(data)

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



const handleToggleStatus = async (row: CertificateListVO) => {

  const newStatus = !row.isDeleted

  const actionText = newStatus ? '启用' : '禁用'

  try {

    await ElMessageBox.confirm(`确定${actionText}该证书吗？`, '提示')

    const res = await updateCertificateStatus(row.id, newStatus)

    if (res.data.code === 200) {

      ElMessage.success(`${actionText}成功`)

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch {

    // 取消

  }

}



const handleHardDelete = async (id: string, name: string) => {

  try {

    await ElMessageBox.confirm(

      `确定要删除证书"${name}"吗？数据不可恢复！`,

      '警告',

      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }

    )

    const res = await hardDeleteCertificate(id)

    if (res.data.code === 200) {

      ElMessage.success('删除成功')

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch {

    // 取消

  }

}



const handleBatchDelete = async () => {

  if (selectedIds.value.length === 0) {

    ElMessage.warning('请选择要删除的证书')

    return

  }

  try {

    await ElMessageBox.confirm(

      `确定要批量删除选中的${selectedIds.value.length} 条证书记录吗？数据不可恢复！`,

      '警告',

      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }

    )

    const res = await batchDeleteCertificate(selectedIds.value as unknown as number[])

    if (res.data.code === 200) {

      ElMessage.success('批量删除成功')

      selectedIds.value = []

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch {

    // 取消

  }

}



const handleBatchDisable = async () => {

  if (selectedIds.value.length === 0) {

    ElMessage.warning('请选择要禁用的证书')

    return

  }

  try {

    await ElMessageBox.confirm(

      `确定要批量禁用选中的${selectedIds.value.length} 条证书吗？`,

      '提示',

      { type: 'warning', confirmButtonText: '确定批量禁用', cancelButtonText: '取消' }

    )

    const res = await batchUpdateCertificateStatus(selectedIds.value as unknown as number[], true)

    if (res.data.code === 200) {

      ElMessage.success('批量禁用成功')

      selectedIds.value = []

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch {

    // 取消

  }

}



onMounted(() => {

  fetchData()

})

</script>



<template>

  <div class="page-wrap">

    <div class="watermark-left"><img src="@/assets/images/logo-main.png" /></div>

    <div class="watermark-right"><img src="@/assets/images/logo-main.png" /></div>

    <div class="page-header">

      <h2 class="page-title">证书管理</h2>

      <p class="page-subtitle">管理职业资格证书信息，包括分类、等级、报考条件与考试安排</p>

    </div>

    <!-- 搜索-->

    <div class="search-card">

      <div class="section-label">筛选条件</div>

      <el-form :model="queryParams" inline>

        <el-form-item label="证书名称">

          <el-input

            v-model="queryParams.certName"

            placeholder="证书名称模糊搜索"

            clearable

            style="width: 180px"

            @keyup.enter="handleSearch"

          />

        </el-form-item>

        <el-form-item label="分类">

          <el-select

            v-model="queryParams.category"

            placeholder="全部分类"

            clearable

            style="width: 140px"

          >

            <el-option label="IT" value="IT" />

            <el-option label="财会" value="财会" />

            <el-option label="语言" value="语言" />

            <el-option label="工程" value="工程" />

          </el-select>

        </el-form-item>

        <el-form-item label="等级">

          <el-select

            v-model="queryParams.certLevel"

            placeholder="全部等级"

            clearable

            style="width: 120px"

          >

            <el-option label="初级" value="初级" />

            <el-option label="中级" value="中级" />

            <el-option label="高级" value="高级" />

          </el-select>

        </el-form-item>

        <el-form-item label="适用专业">

          <el-input

            v-model="queryParams.applicableMajor"

            placeholder="适用专业模糊搜索"

            clearable

            style="width: 180px"

            @keyup.enter="handleSearch"

          />

        </el-form-item>

        <el-form-item label="状态">

          <el-select

            v-model="queryParams.isDeleted"

            placeholder="全部"

            clearable

            style="width: 100px"

          >

            <el-option label="启用" :value="false" />

            <el-option label="禁用" :value="true" />

          </el-select>

        </el-form-item>

        <el-form-item>

          <el-button class="btn-search" @click="handleSearch">查询</el-button>

          <el-button class="btn-reset" @click="handleReset">重置</el-button>

        </el-form-item>

      </el-form>

    </div>



    <!-- 操作-->

    <div class="action-bar">

      <div class="action-left">

        <el-button class="btn-add" @click="openDialog('add')">+ 新增证书</el-button>

      </div>

      <div class="action-right">

        <el-button class="btn-danger" :disabled="selectedIds.length === 0" @click="handleBatchDisable">

          批量禁用

        </el-button>

        <el-button class="btn-danger-solid" :disabled="selectedIds.length === 0" @click="handleBatchDelete">

          批量删除

        </el-button>

        <el-button class="btn-outline" @click="fetchData">刷新</el-button>

      </div>

    </div>



    <!-- 表格 -->

    <div class="table-card">

      <el-table

        :data="tableData"

        v-loading="loading"

        stripe

        @selection-change="handleSelectionChange"

      >

        <el-table-column type="selection" width="50" />

        <el-table-column prop="certName" label="证书名称" width="150" show-overflow-tooltip />

        <el-table-column prop="category" label="分类" width="100" />

        <el-table-column prop="certLevel" label="等级" width="80" />

        <el-table-column prop="applicableMajor" label="适用专业" width="150" show-overflow-tooltip />

        <el-table-column prop="registrationTime" label="报名时间" width="150" />

        <el-table-column prop="examTime" label="考试时间" width="150" />

        <el-table-column prop="examFee" label="考试费用(元)" width="110">

          <template #default="{ row }">

            {{ row.examFee !== null && row.examFee !== undefined ? row.examFee : '-' }}

          </template>

        </el-table-column>

        <el-table-column prop="updatedAt" label="更新时间" width="180" />

        <el-table-column prop="isDeleted" label="状态" width="80" align="center">

          <template #default="{ row }">

            <span class="status-pill" :class="row.isDeleted ? 'status-off' : 'status-on'">

              {{ row.isDeleted ? '禁用' : '启用' }}

            </span>

          </template>

        </el-table-column>

        <el-table-column label="操作" width="280" align="center" fixed="right">

          <template #default="{ row }">

            <span class="action-link" @click="openDialog('detail', row.id)">详情</span>

            <span class="action-link" @click="openDialog('edit', row.id)">修改</span>

            <span class="action-link" @click="handleToggleStatus(row)">

              {{ row.isDeleted ? '启用' : '禁用' }}

            </span>

            <span class="action-link action-danger" @click="handleHardDelete(row.id, row.certName)">删除</span>

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



    <!-- Dialog -->

    <el-dialog

      v-model="dialogVisible"

      :title="dialogTitle"

      width="750px"

      :close-on-click-modal="false"

      class="uni-dialog"

    >

      <div v-loading="formLoading">

        <!-- 详情模式 -->

        <template v-if="dialogMode === 'detail' && detailData">

          <el-descriptions :column="1" border class="uni-descriptions">

            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>

            <el-descriptions-item label="证书名称">{{ detailData.certName }}</el-descriptions-item>

            <el-descriptions-item label="分类">{{ detailData.category || '-' }}</el-descriptions-item>

            <el-descriptions-item label="等级">{{ detailData.certLevel || '-' }}</el-descriptions-item>

            <el-descriptions-item label="适用专业">{{ detailData.applicableMajor || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名时间">{{ detailData.registrationTime || '-' }}</el-descriptions-item>

            <el-descriptions-item label="考试时间">{{ detailData.examTime || '-' }}</el-descriptions-item>

            <el-descriptions-item label="考试费用(元)">{{ detailData.examFee ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="证书简介">{{ detailData.certIntro || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报考条件">

              <div v-if="detailData.examRequirements && detailData.examRequirements.length > 0">

                <el-tag

                  v-for="(req, i) in detailData.examRequirements"

                  :key="i"

                  size="small"

                  class="mr-1 mb-1"

                >

                  {{ req }}

                </el-tag>

              </div>

              <span v-else>-</span>

            </el-descriptions-item>

            <el-descriptions-item label="考试安排">{{ detailData.examArrangement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="官方网站">{{ detailData.officialWebsite || '-' }}</el-descriptions-item>

            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>

            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>

          </el-descriptions>

        </template>



        <!-- 新增/修改模式 -->

        <template v-if="dialogMode !== 'detail'">

          <el-form :model="formData" label-width="120px">

            <el-form-item label="证书名称" required>

              <el-input v-model="formData.certName" placeholder="请输入证书名称" maxlength="150" show-word-limit />

            </el-form-item>

            <el-form-item label="证书分类">

              <el-select v-model="formData.category" placeholder="请选择分类" clearable style="width: 240px">

            <el-option label="IT" value="IT" />

                <el-option label="财会" value="财会" />

                <el-option label="语言" value="语言" />

                <el-option label="工程" value="工程" />

              </el-select>

            </el-form-item>

            <el-form-item label="证书等级">

              <el-select v-model="formData.certLevel" placeholder="请选择等级" clearable style="width: 160px">

                <el-option label="初级" value="初级" />

                <el-option label="中级" value="中级" />

                <el-option label="高级" value="高级" />

              </el-select>

            </el-form-item>

            <el-form-item label="适用专业">

              <el-input v-model="formData.applicableMajor" placeholder="请输入适用专业" maxlength="200" />

            </el-form-item>

            <el-form-item label="报名时间">

              <el-input v-model="formData.registrationTime" placeholder="如：每年3月9月" maxlength="100" />

            </el-form-item>

            <el-form-item label="考试时间">

              <el-input v-model="formData.examTime" placeholder="如：5月中旬11月上旬" maxlength="100" />

            </el-form-item>

            <el-form-item label="考试费用">

              <el-input-number v-model="formData.examFee" :min="0" :precision="0" placeholder="元" />

            </el-form-item>

            <el-form-item label="证书简介">

              <el-input v-model="formData.certIntro" type="textarea" :rows="3" placeholder="请输入证书简介" />

            </el-form-item>

            <el-form-item label="报考条件">

              <div class="flex gap-2 mb-2">

                <el-input v-model="requirementInput" placeholder="输入报考条件" style="width: 300px" @keyup.enter="addRequirement" />

                <el-button type="primary" @click="addRequirement">添加</el-button>

              </div>

              <div v-if="formData.examRequirements && formData.examRequirements.length > 0" class="flex flex-wrap gap-1">

                <el-tag

                  v-for="(req, i) in formData.examRequirements"

                  :key="i"

                  closable

                  @close="removeRequirement(i)"

                >

                  {{ req }}

                </el-tag>

              </div>

            </el-form-item>

            <el-form-item label="考试安排">

              <el-input v-model="formData.examArrangement" type="textarea" :rows="3" placeholder="请输入考试安排详情" />

            </el-form-item>

            <el-form-item label="官方网站">

              <el-input v-model="formData.officialWebsite" placeholder="https://" maxlength="500" />

            </el-form-item>

          </el-form>

        </template>

      </div>



      <template #footer>

        <span class="dialog-footer">

          <el-button class="btn-outline" @click="dialogVisible = false">

            {{ dialogMode === 'detail' ? '关闭' : '取消' }}

          </el-button>

          <el-button v-if="dialogMode !== 'detail'" class="btn-add" @click="handleSubmit">

            确定

          </el-button>

        </span>

      </template>

    </el-dialog>

  </div>

</template>

<style scoped>
.page-wrap {
  background: linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%);
  min-height: calc(100vh - 60px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

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
}

.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 6px 0;
  line-height: 1.3;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

.search-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  box-shadow: 0 2px 12px rgba(249,115,22,0.08);
}
.section-label {
  display: inline-block;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 12px;
  padding: 3px 12px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-weight: 500;
}

.btn-search {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 20px !important;
  padding: 8px 20px !important;
}
.btn-search:hover {
  opacity: 0.9;
}
.btn-reset {
  background: #fff !important;
  border: 1px solid #F97316 !important;
  color: #F97316 !important;
  border-radius: 20px !important;
  padding: 8px 20px !important;
}
.btn-reset:hover {
  background: #FFF7ED !important;
}

.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.action-left, .action-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 20px !important;
  padding: 8px 20px !important;
  font-weight: 500;
}
.btn-add:hover {
  opacity: 0.9;
}

.btn-outline {
  background: #fff !important;
  border: 1px solid #d1d5db !important;
  color: #374151 !important;
  border-radius: 20px !important;
  padding: 8px 16px !important;
}
.btn-outline:hover {
  background: #FFF7ED !important;
  border-color: #FB923C !important;
}
.btn-outline:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-danger {
  background: #fff !important;
  border: 1px solid #DC2626 !important;
  color: #DC2626 !important;
  border-radius: 20px !important;
  padding: 8px 16px !important;
}
.btn-danger:hover {
  background: #FEF2F2 !important;
}
.btn-danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-danger-solid {
  background: linear-gradient(135deg, #DC2626, #EF4444) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 20px !important;
  padding: 8px 16px !important;
}
.btn-danger-solid:hover {
  opacity: 0.9;
}
.btn-danger-solid:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.table-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #FED7AA;
  box-shadow: 0 2px 12px rgba(249,115,22,0.06);
}

.table-card :deep(.el-table__header-wrapper th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}
.table-card :deep(.el-table__header-wrapper th .cell) {
  color: #1f2937 !important;
}

.status-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.status-on {
  background: #DCFCE7;
  color: #15803D;
}
.status-off {
  background: #F3F4F6;
  color: #6B7280;
}

.action-link {
  color: #F97316;
  cursor: pointer;
  font-size: 13px;
  margin: 0 6px;
  transition: color 0.2s;
}
.action-link:hover {
  color: #FB923C;
}
.action-danger {
  color: #DC2626;
}
.action-danger:hover {
  color: #EF4444;
}

.custom-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.custom-pagination :deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  border-radius: 6px;
}
.custom-pagination :deep(.el-pagination .el-pager li.is-active:hover) {
  color: #fff !important;
}
.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #F97316 !important;
}

.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid #F97316;
  padding-bottom: 16px;
  margin-bottom: 20px;
}
.uni-dialog :deep(.el-dialog__title) {
  font-size: 17px;
  font-weight: 600;
  color: #9A3412;
}

.uni-descriptions :deep(.el-descriptions__label) {
  background: linear-gradient(135deg, #FFF7ED, #FFEDD5) !important;
  color: #9A3412 !important;
  font-weight: 500;
}

.uni-dialog :deep(.el-form-item__label) {
  color: #9A3412;
  font-weight: 500;
}
.uni-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
.uni-dialog :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
.uni-dialog :deep(.el-textarea__inner:focus) {
  border-color: #F97316;
  box-shadow: 0 0 0 1px #F97316;
}
.uni-dialog :deep(.el-input-number .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
