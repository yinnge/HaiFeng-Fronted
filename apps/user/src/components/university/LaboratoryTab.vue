<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getLaboratoryPage } from '@/api/university/laboratory'
import type { LaboratoryListVO } from '@/types/university/laboratory'
import { ElMessage } from 'element-plus'

const props = defineProps<{ universityId: number }>()
const router = useRouter()

const loading = ref(false)
const list = ref<LaboratoryListVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const activeType = ref('')

const labTypes = computed(() => {
  const types = new Set(list.value.map(item => item.labType))
  return Array.from(types)
})

const filteredList = computed(() => {
  if (!activeType.value) return list.value
  return list.value.filter(item => item.labType === activeType.value)
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getLaboratoryPage(props.universityId, { page: page.value, size: size.value })
    list.value = res.data.data.records
    total.value = res.data.data.total
    if (!activeType.value && labTypes.value.length) {
      activeType.value = labTypes.value[0]
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取实验室列表失败')
  } finally {
    loading.value = false
  }
}

function goDetail(labId: number) {
  router.push(`/university/laboratory/${labId}`)
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
        v-for="type in labTypes" :key="type"
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
          @click="goDetail(item.id)"
        >
          <h4 class="font-semibold text-gray-800 mb-1">{{ item.name }}</h4>
          <span class="inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-600">{{ item.labType }}</span>
        </div>
      </div>
      <p v-else-if="!loading" class="py-12 text-center text-gray-400">暂无实验室数据</p>
    </div>

    <div v-if="total > size" class="mt-6 flex justify-center">
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="size" :current-page="page" @current-change="onPageChange" />
    </div>
  </div>
</template>
