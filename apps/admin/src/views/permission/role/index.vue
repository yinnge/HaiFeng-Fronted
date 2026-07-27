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
  <div class="role-page">
    <!-- 枫叶装饰 -->
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title">角色管理</div>
      <div class="page-subtitle">管理系统角色及权限配置</div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button type="button" class="add-btn" @click="handleAdd">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新增角色
      </button>
    </div>

    <RoleSearch @search="handleSearch" @reset="handleReset" />

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

<style scoped>
.role-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* 枫叶水印 */
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

/* 操作栏 */
.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
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
</style>
