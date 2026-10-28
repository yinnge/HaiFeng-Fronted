<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getLaboratoryPage, getLaboratoryTypes } from '@/api/university/laboratory'
import type { LaboratoryListVO } from '@/types/university/laboratory'
import { ElMessage } from 'element-plus'

const props = defineProps<{ universityId: string; preview?: boolean }>()
const emit = defineEmits<{ (e: 'total', v: number): void }>()
const router = useRouter()

const loading = ref(false)
const list = ref<LaboratoryListVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

/** 预览模式：详情页板块只展示前 4 条（2×2） */
const shownList = computed(() => (props.preview ? list.value.slice(0, 4) : list.value))

/** 类型清单：由独立接口一次性返回全量，不随分页变化 */
const labTypes = ref<string[]>([])
const activeType = ref('')

async function fetchTypes() {
  try {
    const res = await getLaboratoryTypes(props.universityId)
    labTypes.value = res.data.data || []
  } catch {
    // 类型清单拉取失败不阻塞列表，仅不展示筛选按钮
    labTypes.value = []
  }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getLaboratoryPage(props.universityId, {
      page: page.value,
      size: size.value,
      labType: activeType.value || undefined,
    })
    list.value = res.data.data.records
    total.value = res.data.data.total
    emit('total', total.value)
  } catch (e: any) {
    ElMessage.error(e?.message || '获取实验室列表失败')
  } finally {
    loading.value = false
  }
}

function selectType(type: string) {
  if (activeType.value === type) return
  activeType.value = type
  page.value = 1
  fetchList()
}

function goDetail(labId: string) {
  // 带上来源院校 ID，详情页「返回院校」可精确回跳
  router.push({ path: `/university/laboratory/${labId}`, query: { from: props.universityId } })
}

function onPageChange(p: number) {
  page.value = p
  fetchList()
}

onMounted(async () => {
  await fetchTypes()
  fetchList()
})
</script>

<template>
  <div>
    <!-- 类型筛选（预览模式隐藏） -->
    <div v-if="!preview" class="flex flex-wrap gap-3 mb-6">
      <button
        class="rounded-lg px-4 py-2 text-sm font-medium transition-all border"
        :class="activeType === ''
          ? 'bg-orange-500 text-white border-orange-500 shadow-md'
          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'"
        @click="selectType('')"
      >
        全部
      </button>
      <button
        v-for="type in labTypes" :key="type"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-all border"
        :class="activeType === type
          ? 'bg-orange-500 text-white border-orange-500 shadow-md'
          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'"
        @click="selectType(type)"
      >
        {{ type }}
      </button>
    </div>

    <div v-loading="loading" class="min-h-[120px]">
      <div v-if="shownList.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in shownList" :key="item.id"
          class="rounded-xl bg-white p-5 shadow-md border border-gray-100 cursor-pointer hover:shadow-lg hover:border-orange-200 transition-all"
          @click="goDetail(item.id)"
        >
          <h4 class="font-semibold text-gray-800 mb-1">{{ item.name }}</h4>
          <span class="inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-600">{{ item.labType }}</span>
        </div>
      </div>
      <p v-else-if="!loading" class="py-12 text-center text-gray-400">暂无实验室数据</p>
    </div>

    <div v-if="!preview && total > size" class="mt-6 flex justify-center">
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="size" :current-page="page" @current-change="onPageChange" />
    </div>
  </div>
</template>
