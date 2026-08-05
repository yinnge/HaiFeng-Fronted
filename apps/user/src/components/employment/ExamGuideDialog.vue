<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getExamGuideList, recordExamGuideView } from '@/api/employment/content/examGuide'
import type { ExamGuideDetailVO, ExamGuideQueryDTO } from '@/types/employment/content/examGuide'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const guideCategoryOptions = [
  { value: 'civil', label: '公务员' },
  { value: 'institution', label: '事业单位' },
  { value: 'military', label: '军队文职' },
  { value: 'selection', label: '选调生' },
  { value: 'teacher', label: '教师招聘' },
  { value: 'healthcare', label: '医疗卫生' },
  { value: 'finance', label: '金融银行' },
  { value: 'grassroots', label: '基层服务' },
  { value: 'community', label: '社区工作者' },
  { value: 'general', label: '通用/其他' },
]

const guideTypeOptions = [
  { value: '备考攻略', label: '备考攻略' },
  { value: '科目指导', label: '科目指导' },
  { value: '真题解析', label: '真题解析' },
  { value: '面试技巧', label: '面试技巧' },
  { value: '时事热点', label: '时事热点' },
  { value: '经验分享', label: '经验分享' },
  { value: '政策解读', label: '政策解读' },
  { value: '学习计划', label: '学习计划' },
]

const difficultyOptions = [
  { value: '入门', label: '入门' },
  { value: '进阶', label: '进阶' },
  { value: '高阶', label: '高阶' },
]

const loading = ref(false)
const list = ref<ExamGuideDetailVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const guideCategory = ref('')
const guideType = ref('')
const difficultyLevel = ref('')
const authorTitle = ref('')
const authorName = ref('')

const selectedId = ref<string | null>(null)

function guideCategoryLabel(code: string): string {
  return guideCategoryOptions.find(o => o.value === code)?.label || code
}

const selectedDetail = computed(() => list.value.find(r => r.id === selectedId.value) ?? null)

function isSelected(id: string): boolean {
  return selectedId.value === id
}

function buildParams(): ExamGuideQueryDTO {
  return {
    page: page.value,
    size: pageSize.value,
    title: keyword.value || undefined,
    subtitle: keyword.value || undefined,
    guideCategory: guideCategory.value || undefined,
    guideType: guideType.value || undefined,
    difficultyLevel: difficultyLevel.value || undefined,
    authorTitle: authorTitle.value || undefined,
    authorName: authorName.value || undefined,
  }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getExamGuideList(buildParams())
    list.value = res.data.data.records
    total.value = res.data.data.total
    if (list.value.length > 0) {
      if (!list.value.some(r => r.id === selectedId.value)) {
        selectedId.value = list.value[0].id
      }
    } else {
      selectedId.value = null
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取备考指南列表失败')
    list.value = []
    total.value = 0
    selectedId.value = null
  } finally {
    loading.value = false
  }
}

function onSearch() {
  page.value = 1
  fetchList()
}

function onPageChange(newPage: number) {
  page.value = newPage
  fetchList()
}

function onPageSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchList()
}

function selectItem(row: ExamGuideDetailVO) {
  selectedId.value = row.id
  recordExamGuideView(row.id).catch(() => {})
  row.viewCount = (row.viewCount ?? 0) + 1
}

function onClose() {
  emit('update:visible', false)
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      selectedId.value = null
      fetchList()
    }
  }
)
</script>

<template>
  <el-dialog
    :model-value="props.visible"
    title="📚 备考指南"
    width="80vw"
    :close-on-click-modal="false"
    @update:model-value="onClose"
  >
    <div class="rounded-xl bg-gradient-to-b from-orange-50/70 to-white p-4 border-t-2 border-t-[#F97316] border-b-2 border-b-[#FB923C] mb-4">
      <div class="flex gap-3 mb-4">
        <el-input
          v-model="keyword"
          placeholder="搜索标题、副标题..."
          clearable
          @keyup.enter="onSearch"
        />
        <el-button class="dg-btn-search" @click="onSearch">搜索</el-button>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <el-select
          v-model="guideCategory"
          placeholder="指南类别"
          clearable
          class="!w-[140px]"
          @change="onSearch"
        >
          <el-option
            v-for="opt in guideCategoryOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-select
          v-model="guideType"
          placeholder="指南类型"
          clearable
          class="!w-[140px]"
          @change="onSearch"
        >
          <el-option
            v-for="opt in guideTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-select
          v-model="difficultyLevel"
          placeholder="难度"
          clearable
          class="!w-[120px]"
          @change="onSearch"
        >
          <el-option
            v-for="opt in difficultyOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-input
          v-model="authorTitle"
          placeholder="作者头衔"
          clearable
          class="!w-[150px]"
          @change="onSearch"
        />

        <el-input
          v-model="authorName"
          placeholder="作者名"
          clearable
          class="!w-[140px]"
          @change="onSearch"
        />
      </div>
    </div>

    <div class="grid gap-4" style="grid-template-columns: 300px 1fr; height: 60vh; min-height: 480px">
      <div class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div class="shrink-0 border-b border-gray-100 px-4 py-3 text-sm font-bold text-gray-700">备考指南列表</div>
        <div v-loading="loading" class="min-h-0 flex-1 overflow-y-auto py-1">
          <button
            v-for="row in list"
            :key="row.id"
            class="flex w-full flex-col items-start gap-1 border-l-4 px-4 py-3 text-left transition-colors"
            :class="isSelected(row.id) ? 'border-orange-500 bg-orange-50' : 'border-transparent hover:bg-orange-50/60'"
            @click="selectItem(row)"
          >
            <span class="rounded-full bg-gradient-to-r from-orange-50 to-amber-50 px-2 py-0.5 text-xs font-medium text-orange-600 ring-1 ring-inset ring-orange-200">
              {{ row.guideType }}
            </span>
            <span class="line-clamp-2 text-sm font-semibold text-gray-800">{{ row.title }}</span>
            <span class="text-xs text-gray-400">作者：{{ row.authorName || '-' }}</span>
          </button>
          <div v-if="!loading && list.length === 0" class="py-16 text-center text-sm text-gray-400">暂无数据</div>
        </div>
      </div>

      <div class="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-orange-50/70 to-white shadow-lg border-t-[3px] border-t-[#F97316] border-b-[3px] border-b-[#FB923C]">
        <div v-loading="loading" class="min-h-0 flex-1 overflow-y-auto p-6">
          <div v-if="selectedDetail" class="pr-1">
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">{{ guideCategoryLabel(selectedDetail.guideCategory) }}</span>
              <span v-if="selectedDetail.guideType" class="rounded-full bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1 text-xs font-medium text-orange-600 ring-1 ring-inset ring-orange-200">{{ selectedDetail.guideType }}</span>
              <span v-if="selectedDetail.difficultyLevel" class="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-600">{{ selectedDetail.difficultyLevel }}</span>
            </div>

            <h3 class="text-xl font-bold text-gray-800">{{ selectedDetail.title }}</h3>
            <div v-if="selectedDetail.subtitle" class="mt-1 text-sm text-gray-500">{{ selectedDetail.subtitle }}</div>

            <div class="mb-4 mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span v-if="selectedDetail.authorName" class="font-medium text-gray-700">{{ selectedDetail.authorName }}</span>
              <span v-if="selectedDetail.authorTitle">· {{ selectedDetail.authorTitle }}</span>
              <span v-if="selectedDetail.viewCount != null">· 阅读 {{ selectedDetail.viewCount }}</span>
              <span v-if="selectedDetail.likeCount">· 点赞 {{ selectedDetail.likeCount }}</span>
            </div>

            <div class="mb-5 h-px shrink-0 bg-gradient-to-r from-orange-500 to-amber-400"></div>

            <div v-if="selectedDetail.summary" class="mb-5 rounded-lg border-l-4 border-orange-400 bg-orange-50 p-4 text-sm leading-relaxed text-gray-600">
              {{ selectedDetail.summary }}
            </div>

            <div class="guide-content text-gray-600 leading-relaxed" v-html="selectedDetail.content" />
          </div>

          <div v-else class="flex h-full min-h-[320px] items-center justify-center text-gray-400">暂无备考指南</div>
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-end">
      <el-pagination
        v-if="total > 0"
        background
        layout="sizes, prev, pager, next, total"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        :page-sizes="[10, 20, 30, 50, 100]"
        @current-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </div>
  </el-dialog>
</template>

<style scoped>
.dg-btn-search {
  background: linear-gradient(135deg, #F97316, #FB923C);
  border-color: transparent;
  color: #fff;
  border-radius: 20px;
}
.dg-btn-search:hover,
.dg-btn-search:focus {
  background: linear-gradient(135deg, #EA580C, #FB923C);
  border-color: transparent;
  color: #fff;
}
</style>

<style>
.guide-content p {
  margin-bottom: 12px;
}

.guide-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
}

.guide-content h1,
.guide-content h2,
.guide-content h3,
.guide-content h4 {
  font-weight: 700;
  color: #1f2937;
  margin: 20px 0 10px;
  line-height: 1.4;
}

.guide-content ul {
  list-style: disc;
  padding-left: 20px;
  margin: 8px 0 12px;
}

.guide-content ol {
  list-style: decimal;
  padding-left: 20px;
  margin: 8px 0 12px;
}

.guide-content li {
  margin-bottom: 4px;
}

.guide-content a {
  color: #f97316;
  text-decoration: underline;
}

.guide-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}

.guide-content td,
.guide-content th {
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
}

.guide-content blockquote {
  border-left: 3px solid #f97316;
  padding-left: 12px;
  color: #6b7280;
  margin: 8px 0 12px;
}
</style>
