<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getProvinceReformPage,
  getProvinceReformDetail,
  addProvinceReform,
  updateProvinceReform,
  deleteProvinceReform,
  batchDeleteProvinceReform,
} from '@/api/algorithm/config/province-reform'
import type {
  ProvinceReformListVO,
  ProvinceReformDetailVO,
  ProvinceReformQueryDTO,
  ProvinceReformAddDTO,
} from '@/types/algorithm/config'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'

const loading = ref(false)
const tableData = ref<ProvinceReformListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const provinceOptions = [
  '北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江','上海','江苏',
  '浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西',
  '海南','重庆','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆',
]
const reformModelOptions = ['3+3', '3+1+2', '传统文理']

const queryParams = reactive<ProvinceReformQueryDTO>({
  page: 1,
  size: 10,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<ProvinceReformDetailVO | null>(null)

const formData = reactive<ProvinceReformAddDTO>({
  province: '',
  reformYear: null,
  reformModel: null,
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getProvinceReformPage({ page: queryParams.page, size: queryParams.size })
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

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (selection: ProvinceReformListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const resetFormData = () => {
  formData.province = ''
  formData.reformYear = null
  formData.reformModel = null
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增省份配置'
    resetFormData()
    detailData.value = null
  } else if ((mode === 'edit' || mode === 'detail') && id) {
    formLoading.value = true
    try {
      const res = await getProvinceReformDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        if (mode === 'edit') {
          dialogTitle.value = '修改省份配置'
          formData.province = d.province
          formData.reformYear = d.reformYear
          formData.reformModel = d.reformModel
        } else {
          dialogTitle.value = '省份配置详情'
          detailData.value = d
        }
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
  if (!formData.province) {
    ElMessage.warning('请填写省份')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addProvinceReform({
        province: formData.province,
        reformYear: formData.reformYear || null,
        reformModel: formData.reformModel || null,
      })
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateProvinceReform(currentId.value, {
        province: formData.province,
        reformYear: formData.reformYear || null,
        reformModel: formData.reformModel || null,
      })
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
    await ElMessageBox.confirm('确定要软删除该记录吗？', '提示')
    const res = await deleteProvinceReform(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // cancel
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要软删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示')
    const res = await batchDeleteProvinceReform(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // cancel
  }
}

const formatReformModel = (model: string | null) => {
  if (!model) return '未改革'
  return model
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增</el-button>
      <el-button :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量软删除</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="province" label="省份" width="120" />
        <el-table-column label="改革年份" width="120">
          <template #default="{ row }">
            {{ row.reformYear ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column label="改革模式" min-width="150">
          <template #default="{ row }">
            <el-tag v-if="row.reformModel" type="primary" size="small">{{ row.reformModel }}</el-tag>
            <span v-else class="text-gray-400">传统文理</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">软删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="改革年份">{{ detailData.reformYear ?? '尚未改革' }}</el-descriptions-item>
            <el-descriptions-item label="改革模式" :span="2">{{ formatReformModel(detailData.reformModel) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">{{ detailData.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-form-item label="省份" required>
              <el-select v-model="formData.province" placeholder="请选择省份" filterable style="width: 100%;">
                <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
            <el-form-item label="改革年份">
              <el-input-number v-model="formData.reformYear" :min="2000" :max="2100" :step="1" controls-position="right" style="width: 100%;" placeholder="选填" />
            </el-form-item>
            <el-form-item label="改革模式">
              <el-select v-model="formData.reformModel" placeholder="请选择（选填）" clearable style="width: 100%;">
                <el-option v-for="m in reformModelOptions" :key="m" :label="m" :value="m" />
              </el-select>
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
