<!-- apps/admin/src/views/permission/role/index.vue -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getRolePage } from '@/api/permission/role'
import type { RoleVO, RoleQueryDTO } from '@/types/permission/role'
import RoleSearch from './components/RoleSearch.vue'
import RoleTable from './components/RoleTable.vue'
import RoleDetailModal from './components/RoleDetailModal.vue'
import RoleModuleModal from './components/RoleModuleModal.vue'

const loading = ref(false)
const tableData = ref<RoleVO[]>([])
const total = ref(0)

const queryParams = reactive<RoleQueryDTO>({
  page: 1,
  size: 10,
  roleName: '',
  status: undefined,
})

const showDetailModal = ref(false)
const currentRoleId = ref<string | undefined>()
const showModuleModal = ref(false)
const moduleRoleId = ref<string>('')
const moduleRoleName = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRolePage(queryParams)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (params: RoleQueryDTO) => {
  queryParams.roleName = params.roleName
  queryParams.status = params.status
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.roleName = ''
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
  currentRoleId.value = undefined
  showDetailModal.value = true
}

const handleDetail = (id: string) => {
  currentRoleId.value = id
  showDetailModal.value = true
}

const handleModule = (id: string, name: string) => {
  moduleRoleId.value = id
  moduleRoleName.value = name
  showModuleModal.value = true
}

const handleSuccess = () => {
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <RoleSearch @search="handleSearch" @reset="handleReset" />

    <div class="bg-white rounded-lg p-5">
      <div class="mb-4">
        <el-button type="primary" @click="handleAdd">+ 新增角色</el-button>
      </div>

      <RoleTable
        :data="tableData"
        :loading="loading"
        :total="total"
        :page="queryParams.page"
        :size="queryParams.size"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @detail="handleDetail"
        @module="handleModule"
        @refresh="fetchData"
      />
    </div>

    <RoleDetailModal
      v-model:visible="showDetailModal"
      :role-id="currentRoleId"
      @success="handleSuccess"
    />

    <RoleModuleModal
      v-model:visible="showModuleModal"
      :role-id="moduleRoleId"
      :role-name="moduleRoleName"
      @success="handleSuccess"
    />
  </div>
</template>
