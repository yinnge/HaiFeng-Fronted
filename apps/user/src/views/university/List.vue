<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUniversityList } from '@/api/university'
import type { UniversityListVO, UniversityQueryDTO } from '@/types/university'
import { ProvinceOptions } from '@haifeng/shared'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const list = ref<UniversityListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

const query = reactive<UniversityQueryDTO>({
  page: 1,
  size: 12,
  name: '',
  provinceName: '',
  nature: '',
  category: '',
  department: '',
  educationLevel: '',
})

const hasDoctorate = ref<string>('')
const hasMaster = ref<string>('')

const natureOptions = ['公办', '民办', '中外合作']
const categoryOptions = ['综合', '理工', '师范', '农林', '医药', '政法', '财经', '民族', '语言', '艺术', '体育']
const educationLevelOptions = ['本科', '专科', '本专兼招']

async function fetchList() {
  loading.value = true
  try {
    const params: UniversityQueryDTO = {
      page: currentPage.value,
      size: pageSize.value,
    }
    if (query.name) params.name = query.name
    if (query.provinceName) params.provinceName = query.provinceName
    if (query.nature) params.nature = query.nature
    if (query.category) params.category = query.category
    if (query.department) params.department = query.department
    if (query.educationLevel) params.educationLevel = query.educationLevel
    if (hasDoctorate.value) params.hasDoctorate = hasDoctorate.value === 'true'
    if (hasMaster.value) params.hasMaster = hasMaster.value === 'true'

    const res = await getUniversityList(params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取院校列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  query.name = ''
  query.provinceName = ''
  query.nature = ''
  query.category = ''
  query.department = ''
  query.educationLevel = ''
  hasDoctorate.value = ''
  hasMaster.value = ''
  currentPage.value = 1
  fetchList()
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchList()
}

function onSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

function goDetail(id: string) {
  router.push(`/university/${id}`)
}

function goGuide(id: string) {
  router.push(`/university/${id}/guide`)
}

onMounted(fetchList)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8">
      <!-- 搜索栏 -->
      <div class="mb-6 flex items-center gap-3">
        <input
          v-model="query.name"
          type="text"
          placeholder="输入院校名称搜索"
          class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
        <button
          class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
          @click="handleSearch"
        >
          搜索
        </button>
        <button
          class="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
          @click="handleReset"
        >
          重置
        </button>
      </div>

      <!-- 精准筛选 -->
      <div class="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <el-select v-model="query.provinceName" placeholder="省份" clearable filterable>
          <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-select v-model="query.nature" placeholder="办学性质" clearable>
          <el-option v-for="opt in natureOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <el-select v-model="query.category" placeholder="院校类型" clearable filterable>
          <el-option v-for="opt in categoryOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <input
          v-model="query.department"
          type="text"
          placeholder="主管部门"
          class="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors"
        />
        <el-select v-model="query.educationLevel" placeholder="学历层次" clearable>
          <el-option v-for="opt in educationLevelOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <el-select v-model="hasDoctorate" placeholder="博士点" clearable>
          <el-option label="全部" value="" />
          <el-option label="有" value="true" />
          <el-option label="无" value="false" />
        </el-select>
        <el-select v-model="hasMaster" placeholder="硕士点" clearable>
          <el-option label="全部" value="" />
          <el-option label="有" value="true" />
          <el-option label="无" value="false" />
        </el-select>
      </div>

      <!-- 列表 -->
      <div v-loading="loading" class="min-h-[400px]">
        <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="item in list"
            :key="item.id"
            class="group rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl overflow-hidden transition-all"
          >
            <div class="aspect-[16/9] overflow-hidden bg-gray-50">
              <img
                :src="item.imageUrl || ''"
                :alt="item.name"
                class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="($event.target as HTMLImageElement).src = ''"
              />
            </div>
            <div class="p-5">
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-lg font-bold text-gray-800 truncate">{{ item.name }}</h3>
                <span class="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600 ml-2">{{ item.nature }}</span>
              </div>
              <div class="flex flex-wrap gap-1.5 mb-3">
                <span v-for="tag in item.tags" :key="tag" class="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                  {{ tag }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-y-1.5 text-sm text-gray-500 mb-4">
                <span>{{ item.provinceName }} · {{ item.cityName }}</span>
                <span>{{ item.category }}</span>
                <span>{{ item.educationLevel }}</span>
                <span>{{ item.majorCount }} 个专业</span>
              </div>
              <div class="flex gap-3">
                <button
                  class="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                  @click="goDetail(item.id)"
                >
                  院校详情
                </button>
                <button
                  class="flex-1 rounded-lg border border-orange-300 py-2 text-sm text-orange-500 font-medium hover:bg-orange-50 transition-all"
                  @click="goGuide(item.id)"
                >
                  适应指南
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="py-20 text-center text-gray-400">
          暂无院校数据
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="mt-8 flex justify-center">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-sizes="[12, 24, 36]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </main>
  </div>
</template>
