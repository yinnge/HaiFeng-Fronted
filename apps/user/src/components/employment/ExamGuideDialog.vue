<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { getExamGuideList } from '@/api/employment/content/examGuide'
import type { ExamGuideListVO, ExamGuideQueryDTO } from '@/types/employment/content/examGuide'
import ExamGuideDetail from './ExamGuideDetail.vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const router = useRouter()

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
const list = ref<ExamGuideListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const guideCategory = ref('')
const guideType = ref('')
const difficultyLevel = ref('')
const authorTitle = ref('')
const authorName = ref('')

const currentView = ref<'list' | 'detail'>('list')
const currentId = ref<string | null>(null)

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
    const params = buildParams()
    const res = await getExamGuideList(params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取备考指南列表失败')
    list.value = []
    total.value = 0
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

async function goDetail(id: string) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('请先登录查看详情', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning',
      })
      userStore.setRedirectPath(router.currentRoute.value.fullPath)
      router.push({ name: 'Login' })
    } catch {
      // cancelled
    }
    return
  }
  currentId.value = id
  currentView.value = 'detail'
}

function goBack() {
  currentView.value = 'list'
  currentId.value = null
}

function onClose() {
  emit('update:visible', false)
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      currentView.value = 'list'
      currentId.value = null
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
    <template v-if="currentView === 'list'">
      <div class="flex gap-3 mb-4">
        <el-input
          v-model="keyword"
          placeholder="搜索标题、副标题..."
          clearable
          @keyup.enter="onSearch"
        />
        <el-button type="primary" @click="onSearch">搜索</el-button>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-4">
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

      <el-table v-loading="loading" :data="list" stripe border style="width: 100%">
        <el-table-column label="标题" min-width="240">
          <template #default="{ row }">
            <div class="font-medium text-gray-800">{{ row.title }}</div>
            <div v-if="row.subtitle" class="text-xs text-gray-400 mt-0.5">{{ row.subtitle }}</div>
          </template>
        </el-table-column>
        <el-table-column label="类别" width="100">
          <template #default="{ row }">
            {{ guideCategoryOptions.find(o => o.value === row.guideCategory)?.label || row.guideCategory }}
          </template>
        </el-table-column>
        <el-table-column prop="guideType" label="类型" width="120" />
        <el-table-column prop="authorName" label="作者" width="100" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goDetail(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

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
    </template>

    <template v-else>
      <div class="mb-4">
        <el-button text @click="goBack">
          ◀ 返回备考指南列表
        </el-button>
      </div>
      <ExamGuideDetail v-if="currentId" :id="currentId" />
    </template>
  </el-dialog>
</template>
