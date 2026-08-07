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
    ElMessage.error(e?.message || '获取考研专业列表失败')
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
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 border border-orange-100">
          <div class="flex items-center gap-3 mb-3">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </span>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">考研专业全景 · 助您精准备考</h1>
          </div>
          <p class="text-gray-600 leading-relaxed mb-4">
            涵盖学术学位与专业学位硕士研究生招生专业，提供专业介绍、考试科目、报考条件、跨考难度等全面信息，为您的考研之路保驾护航。
          </p>
          <div class="flex flex-wrap gap-2">
            <span v-for="kw in ['专业介绍', '考试科目', '报考条件', '跨考难度']" :key="kw" class="rounded-full bg-white px-4 py-1.5 text-sm text-orange-600 border border-orange-200">
              {{ kw }}
            </span>
          </div>
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
      <div class="mb-6 rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] shadow-lg p-6">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          考研专业检索
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <input
            v-model="query.name"
            type="text"
            placeholder="输入考研专业名称搜索"
            class="flex-1 min-w-[180px] rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
            @keyup.enter="handleSearch"
          />
          <input
            v-model="query.code"
            type="text"
            placeholder="专业代码"
            class="w-32 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
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
            class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
            @click="handleSearch"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            搜索
          </button>
          <button
            class="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
            @click="handleReset"
          >
            重置
          </button>
        </div>
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
