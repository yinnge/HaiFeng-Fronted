<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PostgradMajorDialog from '@/components/major/PostgradMajorDialog.vue'
import { getPostgradMajorList, getPostgradMajorDisciplineCategories } from '@/api/postgrad-major'
import type { PostgradMajorListVO, PostgradMajorQueryDTO } from '@/types/postgrad-major'
import { Motion } from 'motion-v'

const router = useRouter()

const loading = ref(false)
const list = ref<PostgradMajorListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const activeDegree = ref('')
const degreeOptions = [
  { value: '', label: '全部专业' },
  { value: '学术学位', label: '学术型硕士' },
  { value: '专业学位', label: '专业型硕士' },
]

const query = reactive<PostgradMajorQueryDTO>({
  page: 1,
  size: 10,
})

const dialogVisible = ref(false)
const selectedMajorId = ref<string | null>(null)

const disciplineOptions = ref<string[]>([])
const popularityOptions = ['热门', '一般', '冷门']
const difficultyOptions = ['高', '中', '低']

async function fetchList() {
  loading.value = true
  try {
    query.page = currentPage.value
    query.size = pageSize.value
    query.degreeType = activeDegree.value || undefined
    const res = await getPostgradMajorList(query)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取考研专业列表失败')
  } finally {
    loading.value = false
  }
}

async function fetchDisciplineCategories() {
  try {
    const res = await getPostgradMajorDisciplineCategories()
    disciplineOptions.value = res.data.data ?? []
  } catch {
    disciplineOptions.value = []
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  query.name = ''
  query.code = ''
  query.degreeType = ''
  query.disciplineCategory = ''
  query.popularity = ''
  query.difficulty = ''
  activeDegree.value = ''
  currentPage.value = 1
  fetchList()
}

function switchDegree(degree: string) {
  activeDegree.value = degree
  query.degreeType = degree || undefined
  currentPage.value = 1
  fetchList()
}

function showDetail(id: string) {
  selectedMajorId.value = id
  dialogVisible.value = true
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

function getPopularityTag(popularity: string) {
  if (popularity === '热门') return 'danger'
  if (popularity === '一般') return 'warning'
  return 'info'
}

function getDifficultyTag(difficulty: string) {
  if (difficulty === '高') return 'danger'
  if (difficulty === '中') return 'warning'
  return 'success'
}

onMounted(() => {
  fetchList()
  fetchDisciplineCategories()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100">
          <p class="text-gray-700 leading-relaxed">
            涵盖学术学位与专业学位硕士研究生招生专业，提供专业介绍、考试科目、报考条件、跨考难度等全面信息，助您精准备考。
          </p>
        </div>
      </Motion>

      <!-- Degree Type buttons -->
      <div class="mb-6 flex gap-4">
        <button
          v-for="opt in degreeOptions" :key="opt.value"
          class="rounded-xl px-8 py-3 text-base font-semibold transition-all"
          :class="activeDegree === opt.value
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'"
          @click="switchDegree(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- Search bar -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <input
          v-model="query.name"
          type="text"
          placeholder="输入考研专业名称搜索"
          class="flex-1 min-w-[180px] rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
        <input
          v-model="query.code"
          type="text"
          placeholder="专业代码"
          class="w-32 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="query.disciplineCategory" placeholder="学科门类" clearable filterable class="!w-36">
          <el-option v-for="d in disciplineOptions" :key="d" :label="d" :value="d" />
        </el-select>
        <el-select v-model="query.popularity" placeholder="热度" clearable class="!w-28">
          <el-option v-for="p in popularityOptions" :key="p" :label="p" :value="p" />
        </el-select>
        <el-select v-model="query.difficulty" placeholder="难度" clearable class="!w-28">
          <el-option v-for="d in difficultyOptions" :key="d" :label="d" :value="d" />
        </el-select>
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

      <!-- Postgrad Major List -->
      <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <div v-loading="loading" class="min-h-[300px]">
          <div v-if="list.length" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100 text-left text-sm text-gray-500">
                  <th class="pb-3 pr-4 font-medium">代码</th>
                  <th class="pb-3 pr-4 font-medium">专业名称</th>
                  <th class="pb-3 pr-4 font-medium">学位类型</th>
                  <th class="pb-3 pr-4 font-medium">学科门类</th>
                  <th class="pb-3 pr-4 font-medium">热度</th>
                  <th class="pb-3 pr-4 font-medium">难度</th>
                  <th class="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in list" :key="item.id"
                  class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors"
                >
                  <td class="py-3 pr-4 text-sm text-gray-600 font-mono">{{ item.majorCode }}</td>
                  <td class="py-3 pr-4 text-sm font-medium text-gray-800">{{ item.majorName }}</td>
                  <td class="py-3 pr-4 text-sm">
                    <span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ item.degreeType }}</span>
                  </td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.disciplineCategory }}</td>
                  <td class="py-3 pr-4 text-sm">
                    <el-tag :type="getPopularityTag(item.popularity)" size="small" effect="plain">{{ item.popularity }}</el-tag>
                  </td>
                  <td class="py-3 pr-4 text-sm">
                    <el-tag :type="getDifficultyTag(item.difficulty)" size="small" effect="plain">{{ item.difficulty }}</el-tag>
                  </td>
                  <td class="py-3 text-sm">
                    <button
                      class="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                      @click="showDetail(item.id)"
                    >查看详情</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else-if="!loading" class="py-16 text-center text-gray-400">暂无考研专业数据</div>
        </div>
        <div v-if="total > pageSize" class="mt-6 flex justify-center">
          <el-pagination
            background layout="total, sizes, prev, pager, next"
            :total="total" :page-sizes="[10, 20, 30, 50, 100]"
            :page-size="pageSize" :current-page="currentPage"
            @current-change="onPageChange" @size-change="onSizeChange"
          />
        </div>
      </section>
    </main>

    <PostgradMajorDialog
      v-model:visible="dialogVisible"
      :major-id="selectedMajorId"
    />
  </div>
</template>
