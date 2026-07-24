<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getCertificatePage,

  getCertificateDetail,

  addCertificate,

  updateCertificate,

  softDeleteCertificate,

  hardDeleteCertificate,

  batchDeleteCertificate,

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



const handleSoftDelete = async (id: string, name: string) => {

  try {

    await ElMessageBox.confirm(

      `确定要软删除证书"${name}"吗？数据将保留可恢复。`,

      '提示'

    )

    const res = await softDeleteCertificate(id)

    if (res.data.code === 200) {

      ElMessage.success('软删除成功')

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

      `确定要硬删除证书"${name}"吗？数据不可恢复！`,

      '警告',

      { type: 'warning', confirmButtonText: '确定硬删除', cancelButtonText: '取消' }

    )

    const res = await hardDeleteCertificate(id)

    if (res.data.code === 200) {

      ElMessage.success('硬删除成功')

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

      `确定要批量硬删除选中的${selectedIds.value.length} 条证书记录吗？数据不可恢复！`,

      '警告',

      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }

    )

    const res = await batchDeleteCertificate(selectedIds.value)

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



onMounted(() => {

  fetchData()

})

</script>



<template>

  <div>

    <!-- 搜索-->

    <div class="mb-4 rounded-lg bg-white p-5">

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

        <el-form-item>

          <el-button type="primary" @click="handleSearch">查询</el-button>

          <el-button @click="handleReset">重置</el-button>

        </el-form-item>

      </el-form>

    </div>



    <!-- 操作-->

    <div class="mb-4">

      <el-button type="primary" @click="openDialog('add')">新增证书</el-button>

      <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchDelete">

        批量硬删除      </el-button>

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

        <el-table-column prop="id" label="ID" width="140" />

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

        <el-table-column label="操作" width="280" align="center" fixed="right">

          <template #default="{ row }">

            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>

            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>

            <el-button type="info" link @click="handleSoftDelete(row.id, row.certName)">软删除</el-button>

            <el-button type="danger" link @click="handleHardDelete(row.id, row.certName)">硬删除</el-button>

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

          <el-descriptions :column="1" border>

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

