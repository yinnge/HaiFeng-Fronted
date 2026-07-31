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

  <div class="page-x">

    <div class="watermark-left"><img src="@/assets/images/logo-main.png" /></div>

    <div class="watermark-right"><img src="@/assets/images/logo-main.png" /></div>

    <div class="page-header">

      <h2 class="page-title">证书管理</h2>

      <p class="page-subtitle">管理职业资格证书信息，包括分类、等级、报考条件与考试安排</p>

    </div>

    <!-- 搜索-->

    <div class="search-card">

      <div class="section-label">筛选条件</div>

      <el-form class="search-form" :model="queryParams" inline>

        <div class="filter-fields">

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

        </div>

        <div class="search-actions">
          <el-button class="search-btn" @click="handleSearch">查询</el-button>
          <el-button class="reset-btn" @click="handleReset">重置</el-button>
        </div>

      </el-form>

    </div>



    <!-- 操作-->

    <div class="action-bar">

      <div class="action-left">

        <el-button class="btn-primary" @click="openDialog('add')">+ 新增证书</el-button>

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

      <div class="custom-table">
      <el-table

        :data="tableData"

        v-loading="loading"

        stripe

        @selection-change="handleSelectionChange"

      >

        <el-table-column type="selection" width="50" />

        <el-table-column prop="certName" label="证书名称" min-width="150" show-overflow-tooltip />

        <el-table-column prop="category" label="分类" min-width="100" />

        <el-table-column prop="certLevel" label="等级" min-width="80" />

        <el-table-column prop="applicableMajor" label="适用专业" min-width="150" show-overflow-tooltip />

        <el-table-column prop="registrationTime" label="报名时间" min-width="150" />

        <el-table-column prop="examTime" label="考试时间" min-width="150" />

        <el-table-column prop="examFee" label="考试费用(元)" min-width="110">

          <template #default="{ row }">

            {{ row.examFee !== null && row.examFee !== undefined ? row.examFee : '-' }}

          </template>

        </el-table-column>

        <el-table-column prop="updatedAt" label="更新时间" min-width="180" />

        <el-table-column prop="isDeleted" label="状态" width="80" align="center">

          <template #default="{ row }">

            <span class="status-pill" :class="row.isDeleted ? 'status-off' : 'status-on'">

              {{ row.isDeleted ? '禁用' : '启用' }}

            </span>

          </template>

        </el-table-column>

        <el-table-column label="操作" width="280" align="center" fixed="right">

          <template #default="{ row }">

            <div class="action-group">
              <span class="action-btn action-detail" @click="openDialog('detail', row.id)">详情</span>

              <span class="action-btn action-edit" @click="openDialog('edit', row.id)">修改</span>

              <span class="action-btn action-status" @click="handleToggleStatus(row)">

                {{ row.isDeleted ? '启用' : '禁用' }}

              </span>

              <span class="action-btn action-delete" @click="handleHardDelete(row.id, row.certName)">删除</span>
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



    <!-- Dialog -->

    <el-dialog

      v-model="dialogVisible"

      :title="dialogTitle"

      width="750px"

      :close-on-click-modal="false"

      class="certificate-dialog"

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

          <el-button class="exit-btn" @click="dialogVisible = false">

            {{ dialogMode === 'detail' ? '关闭' : '取消' }}

          </el-button>

          <el-button v-if="dialogMode !== 'detail'" class="save-btn" @click="handleSubmit">

            确定

          </el-button>

        </span>

      </template>

    </el-dialog>

  </div>

</template>

<style scoped>
.page-x {
  position: relative;
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%);
  padding: 24px;
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

.table-card,
.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(249,115,22,0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all .3s ease;
}
.search-card {
  margin-bottom: 16px;
}
.table-card:hover,
.search-card:hover {
  box-shadow: 0 4px 16px rgba(249,115,22,0.08);
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
  transition: all .25s ease;
  box-shadow: 0 2px 8px rgba(249,115,22,0.3);
}
.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249,115,22,0.4);
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
  transition: all .25s ease;
}
.reset-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.action-left,
.action-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.action-right {
  margin-left: auto;
}

.btn-primary {
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
  transition: all .25s ease;
  box-shadow: 0 2px 8px rgba(249,115,22,0.3);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249,115,22,0.4);
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
  transition: background-color .2s ease;
}
.custom-table :deep(.el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249,115,22,0.03), rgba(251,146,60,0.07)) !important;
}
.custom-table :deep(.el-table__body td) {
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
}
.custom-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255,247,237,0.3);
}
.custom-table :deep(.el-table__empty-block) {
  min-height: 200px;
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
  transition: all .2s ease;
  white-space: nowrap;
}
.action-detail {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.action-detail:hover {
  box-shadow: 0 2px 8px rgba(249,115,22,0.3);
  transform: translateY(-1px);
}
.action-edit {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: #fff;
}
.action-edit:hover {
  box-shadow: 0 2px 8px rgba(59,130,246,0.3);
  transform: translateY(-1px);
}
.action-status {
  background: #fff;
  color: #d97706;
  border: 1px solid #fbbf24;
}
.action-status:hover {
  background: #fffbeb;
}
.action-delete {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.action-delete:hover {
  box-shadow: 0 2px 8px rgba(239,68,68,0.3);
  transform: translateY(-1px);
}

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
  transition: all .2s ease;
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
  box-shadow: 0 0 0 1px rgba(249,115,22,0.3) inset;
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

.certificate-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}
.certificate-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249,115,22,0.15);
  padding: 20px 24px;
  margin: 0;
}
.certificate-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.certificate-dialog :deep(.el-dialog__body) {
  padding: 24px;
}
.certificate-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}
.certificate-dialog :deep(.el-input__wrapper),
.certificate-dialog :deep(.el-textarea__inner),
.certificate-dialog :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all .25s ease;
}
.certificate-dialog :deep(.el-input__wrapper:hover),
.certificate-dialog :deep(.el-textarea__inner:hover),
.certificate-dialog :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249,115,22,0.3) inset;
}
.certificate-dialog :deep(.el-input__wrapper.is-focus),
.certificate-dialog :deep(.el-textarea__inner:focus),
.certificate-dialog :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.certificate-dialog :deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: #F97316;
  border-color: #F97316;
}
.certificate-dialog :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #F97316;
}

.uni-descriptions :deep(.el-descriptions__label) {
  background: linear-gradient(135deg, #FFF7ED, #FFEDD5) !important;
  color: #9A3412 !important;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
  transition: all .25s ease;
}
.search-form :deep(.el-input__wrapper:hover),
.search-form :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249,115,22,0.3) inset;
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
  transition: all .25s ease;
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
  transition: all .25s ease;
  box-shadow: 0 2px 8px rgba(249,115,22,0.3);
}
.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249,115,22,0.4);
}
.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
