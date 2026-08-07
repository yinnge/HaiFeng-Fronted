<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStrongBaseScoreList } from '@/api/special'
import { ProvinceOptions } from '@haifeng/shared'
import type { StrongBaseScoreListVO } from '@/types/special'
import { SubjectTypeOptions, EntryScoreTypeOptions } from '@/types/special'

const router = useRouter()

const records = ref<StrongBaseScoreListVO[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 10
const total = ref(0)

// ===== 查询条件（与 StrongBaseScoreQueryDTO 对应） =====
const sYear = ref<number | undefined>(undefined)
const sProvince = ref('')
const sSubjectType = ref('')
const sEntryScoreType = ref('')
const sUniversityName = ref('')
const sMajorName = ref('')
const sMajorCode = ref('')

// 生成年份选项（近5年）
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years: { value: number | undefined; label: string }[] = [{ value: undefined, label: '全部' }]
  for (let i = 0; i < 5; i++) {
    const y = currentYear - i
    years.push({ value: y, label: `${y}年` })
  }
  return years
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getStrongBaseScoreList({
      page: currentPage.value,
      size: pageSize,
      year: sYear.value || undefined,
      province: sProvince.value || undefined,
      subjectType: sSubjectType.value || undefined,
      entryScoreType: sEntryScoreType.value || undefined,
      universityName: sUniversityName.value || undefined,
      majorName: sMajorName.value || undefined,
      majorCode: sMajorCode.value || undefined,
    })
    records.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取强基数据失败')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  currentPage.value = 1
  fetchData()
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchData()
}

function viewDetail(id: string) {
  router.push(`/special/strong-base/${id}`)
}

onMounted(fetchData)
</script>

<template>
  <section class="mb-8">
    <h3 class="text-xl font-bold text-gray-800 mb-4">强基计划入围/录取数据</h3>

    <!-- 搜索栏 -->
    <div class="mb-6 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">年份</label>
          <el-select v-model="sYear" placeholder="全部" clearable class="w-full">
            <el-option
              v-for="opt in yearOptions"
              :key="String(opt.value ?? 'all')"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">省份</label>
          <el-select v-model="sProvince" placeholder="全部" clearable filterable class="w-full">
            <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">科类</label>
          <el-select v-model="sSubjectType" placeholder="全部" clearable class="w-full">
            <el-option v-for="opt in SubjectTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">入围类型</label>
          <el-select v-model="sEntryScoreType" placeholder="全部" clearable class="w-full">
            <el-option v-for="opt in EntryScoreTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">大学名称</label>
          <input
            v-model="sUniversityName"
            type="text"
            placeholder="模糊搜索"
            class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
            @keyup.enter="onSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">专业名称</label>
          <input
            v-model="sMajorName"
            type="text"
            placeholder="模糊搜索"
            class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
            @keyup.enter="onSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">专业代码</label>
          <input
            v-model="sMajorCode"
            type="text"
            placeholder="模糊搜索"
            class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
            @keyup.enter="onSearch"
          />
        </div>
      </div>
      <div class="flex justify-center">
        <button
          class="px-8 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
          @click="onSearch"
        >
          搜索
        </button>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div v-loading="loading" class="min-h-[200px]">
      <div v-if="records.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in records"
          :key="item.id"
          class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-lg font-bold text-gray-800">{{ item.universityName }}</h4>
            <span class="text-xs text-gray-400">{{ item.year }}年</span>
          </div>
          <p class="text-sm text-gray-600 mb-3">
            {{ item.majorName }}
            <span v-if="item.majorCode" class="text-xs text-gray-400">({{ item.majorCode }})</span>
          </p>
          <div class="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
            <span>省份: {{ item.province }}</span>
            <span>科类: {{ item.subjectType }}</span>
            <span>入围类型: {{ item.entryScoreType }}</span>
            <span>入围比例: {{ item.entryRatio }}</span>
          </div>
          <div class="flex items-center justify-between py-2 border-t border-gray-100">
            <div class="text-sm">
              <span class="text-gray-400">入围分: </span>
              <span class="font-semibold text-orange-500">{{ item.entryScore ?? '-' }}</span>
            </div>
            <div class="text-sm">
              <span class="text-gray-400">录取分: </span>
              <span class="font-semibold text-orange-500">{{ item.admissionScore ?? '-' }}</span>
            </div>
            <div class="text-sm">
              <span class="text-gray-400">计划/录取: </span>
              <span class="font-semibold text-gray-700">{{ item.planCount ?? '-' }}/{{ item.admissionCount ?? '-' }}</span>
            </div>
          </div>
          <button
            class="mt-3 w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
            @click="viewDetail(item.id)"
          >
            查看详情 →
          </button>
        </div>
      </div>
      <div v-else-if="!loading" class="py-12 text-center text-gray-400">
        暂无强基计划数据
      </div>
    </div>

    <div v-if="total > pageSize" class="mt-6 flex justify-center">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="onPageChange"
      />
    </div>
  </section>
</template>
