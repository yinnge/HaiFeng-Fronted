<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import PostgradMajorDialog from '@/components/major/PostgradMajorDialog.vue'
import { getPostgradMajorsByUniversity } from '@/api/postgrad-major'
import type { PostgradMajorBriefVO } from '@/types/postgrad-major'
import { useUserStore } from '@/store'
import { MemberType } from '@haifeng/shared'

const props = defineProps<{
  universityId: number
}>()

const userStore = useUserStore()

const loading = ref(false)
const list = ref<PostgradMajorBriefVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const activeDegree = ref('')

const isPro = computed(() => userStore.userInfo?.memberType === MemberType.PRO || userStore.userInfo?.memberType === MemberType.VIP)

const degreeOptions = [
  { value: '', label: '全部' },
  { value: '学术学位', label: '学术学位' },
  { value: '专业学位', label: '专业学位' },
]

const dialogVisible = ref(false)
const selectedMajorId = ref<number | null>(null)

async function fetchList() {
  loading.value = true
  try {
    const res = await getPostgradMajorsByUniversity(props.universityId, {
      page: currentPage.value,
      size: pageSize.value,
      degreeType: activeDegree.value || undefined,
    })
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    if (e?.response?.status !== 403) {
      ElMessage.error('获取考研专业失败')
    }
  } finally {
    loading.value = false
  }
}

function switchDegree(degree: string) {
  activeDegree.value = degree
  currentPage.value = 1
  fetchList()
}

function showDetail(id: number) {
  selectedMajorId.value = id
  dialogVisible.value = true
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchList()
}

onMounted(() => {
  if (isPro.value) fetchList()
})
</script>

<template>
  <div class="min-h-[200px]">
    <template v-if="isPro">
      <!-- Degree sub-buttons -->
      <div class="mb-4 flex gap-3">
        <button
          v-for="opt in degreeOptions" :key="opt.value"
          class="rounded-lg px-5 py-2 text-sm font-medium transition-all"
          :class="activeDegree === opt.value
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="switchDegree(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>

      <div v-loading="loading">
        <div v-if="list.length" class="space-y-2">
          <div
            v-for="item in list" :key="item.id"
            class="flex items-center justify-between rounded-xl bg-gray-50 px-5 py-3 hover:bg-orange-50/50 transition-colors cursor-pointer"
            @click="showDetail(item.id)"
          >
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-gray-800">{{ item.majorName }}</span>
              <span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ item.degreeType }}</span>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <div v-else-if="!loading" class="py-12 text-center text-gray-400">暂无考研专业数据</div>
      </div>

      <div v-if="total > pageSize" class="mt-4 flex justify-center">
        <el-pagination
          background small layout="prev, pager, next"
          :total="total" :page-size="pageSize" :current-page="currentPage"
          @current-change="onPageChange"
        />
      </div>
    </template>
    <template v-else>
      <div class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 text-center border border-orange-100">
        <svg class="inline-block w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">开通专业版，查看该校考研专业</h3>
        <p class="text-gray-500 mb-4">包含学术学位与专业学位硕士研究生招生专业信息</p>
      </div>
    </template>

    <PostgradMajorDialog
      v-model:visible="dialogVisible"
      :major-id="selectedMajorId"
    />
  </div>
</template>
