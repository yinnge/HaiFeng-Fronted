<!-- apps/admin/src/views/permission/module/index.vue -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getModuleTree } from '@/api/permission/module'
import type { ModuleTreeVO, ModuleQueryDTO } from '@/types/permission/module'
import ModuleSearch from './components/ModuleSearch.vue'
import ModuleTable from './components/ModuleTable.vue'
import ModuleDetailModal from './components/ModuleDetailModal.vue'

const loading = ref(false)
const treeData = ref<ModuleTreeVO[]>([])

const queryParams = reactive<ModuleQueryDTO>({
  moduleCode: '',
})

const showDetailModal = ref(false)
const currentModuleId = ref<number | undefined>()
const currentModule = ref<ModuleTreeVO | undefined>()

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getModuleTree(queryParams.moduleCode ? queryParams : undefined)
    if (res.data.code === 200) {
      treeData.value = res.data.data
    }
  } catch (error) {
    console.error('获取模块列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (params: ModuleQueryDTO) => {
  queryParams.moduleCode = params.moduleCode
  fetchData()
}

const handleReset = () => {
  queryParams.moduleCode = ''
  fetchData()
}

const handleAdd = () => {
  currentModuleId.value = undefined
  currentModule.value = undefined
  showDetailModal.value = true
}

const handleDetail = (module: ModuleTreeVO) => {
  currentModuleId.value = module.id
  currentModule.value = module
  showDetailModal.value = true
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
    <ModuleSearch @search="handleSearch" @reset="handleReset" />

    <div class="bg-white rounded-lg p-5">
      <div class="mb-4">
        <el-button type="primary" @click="handleAdd">+ 新增模块</el-button>
      </div>

      <ModuleTable
        :data="treeData"
        :loading="loading"
        @detail="handleDetail"
        @refresh="fetchData"
      />
    </div>

    <ModuleDetailModal
      v-model:visible="showDetailModal"
      :module-id="currentModuleId"
      :module-tree="treeData"
      :current-module="currentModule"
      @success="handleSuccess"
    />
  </div>
</template>
