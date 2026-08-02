<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getDepartmentPage } from '@/api/university/department'
import type { DepartmentListVO } from '@/types/university/department'
import { ElMessage } from 'element-plus'

const props = defineProps<{ universityId: string }>()
const router = useRouter()

const loading = ref(false)
const list = ref<DepartmentListVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const activeType = ref('')

const deptTypes = computed(() => {
  const types = new Set(list.value.map(item => item.departmentType))
  return Array.from(types)
})

const filteredList = computed(() => {
  if (!activeType.value) return list.value
  return list.value.filter(item => item.departmentType === activeType.value)
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getDepartmentPage(props.universityId, { page: page.value, size: size.value })
    list.value = res.data.data.records
    total.value = res.data.data.total
    if (!activeType.value && deptTypes.value.length) {
      activeType.value = deptTypes.value[0]
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取院系列表失败')
  } finally {
    loading.value = false
  }
}

function goDetail(item: DepartmentListVO) {
  router.push({
    path: `/university/departments/${item.id}`,
    query: { name: item.departmentName, type: item.departmentType },
  })
}

function onPageChange(p: number) {
  page.value = p
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-3 mb-6">
      <button
        v-for="type in deptTypes" :key="type"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-all border"
        :class="activeType === type
          ? 'bg-orange-500 text-white border-orange-500 shadow-md'
          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'"
        @click="activeType = type; page = 1; fetchList()"
      >
        {{ type }}
      </button>
    </div>

    <div v-loading="loading" class="min-h-[120px]">
      <div v-if="filteredList.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in filteredList" :key="item.id"
          class="rounded-xl bg-white p-5 shadow-md border border-gray-100 cursor-pointer hover:shadow-lg hover:border-orange-200 transition-all"
          @click="goDetail(item)"
        >
          <h4 class="font-semibold text-gray-800 mb-1">{{ item.departmentName }}</h4>
          <span class="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600">{{ item.departmentType }}</span>
        </div>
      </div>
      <p v-else-if="!loading" class="py-12 text-center text-gray-400">暂无院系数据</p>
    </div>

    <div v-if="total > size" class="mt-6 flex justify-center">
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="size" :current-page="page" @current-change="onPageChange" />
    </div>
  </div>
</template>
