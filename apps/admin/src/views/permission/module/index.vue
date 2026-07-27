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
const currentModuleId = ref<string | undefined>()
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
  <div class="module-page">
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title">模块管理</div>
      <div class="page-subtitle">管理系统功能模块及层级结构</div>
    </div>

    <div class="action-bar">
      <button type="button" class="add-btn" @click="handleAdd">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新增模块
      </button>
    </div>

    <ModuleSearch @search="handleSearch" @reset="handleReset" />

    <ModuleTable
      :data="treeData"
      :loading="loading"
      @detail="handleDetail"
      @refresh="fetchData"
    />

    <ModuleDetailModal
      v-model:visible="showDetailModal"
      :module-id="currentModuleId"
      :module-tree="treeData"
      :current-module="currentModule"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.module-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
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
  height: auto;
}

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
