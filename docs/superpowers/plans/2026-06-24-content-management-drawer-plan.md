# 备考指南 & 公告 — 右侧抽屉 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在岗位搜索页右侧新增抽屉入口，点击弹出备考指南/公告的分页弹窗，支持模糊+精确搜索、分页列表、内嵌详情查看

**Architecture:**
- 岗位搜索页布局从单列改为双列（主内容区 + 右侧抽屉）
- 右侧抽屉默认展开，含「备考指南」「公告」两个按钮，可收起到右侧竖条
- 点击按钮弹出 `el-dialog`，内部切换列表/详情视图
- 列表详情接口需登录，与岗位列表保持一致的登录拦截行为

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), TypeScript, Element Plus, Tailwind CSS, `@haifeng/shared`

---

### Task 1: 创建类型定义

**Files:**
- Create: `apps/user/src/types/employment/content/examGuide.ts`
- Create: `apps/user/src/types/employment/content/notice.ts`

- [ ] **Step 1: Create ExamGuide type definitions**

```typescript
// apps/user/src/types/employment/content/examGuide.ts
export interface ExamGuideQueryDTO {
  page?: number
  size?: number
  title?: string
  subtitle?: string
  guideCategory?: string
  guideType?: string
  difficultyLevel?: string
  authorTitle?: string
  authorName?: string
}

export interface ExamGuideListVO {
  id: number
  guideCategory: string
  guideType: string
  title: string
  subtitle: string
  tags: string[]
  authorName: string
  authorTitle: string
}

export interface ExamGuideDetailVO {
  id: number
  guideCategory: string
  guideType: string
  title: string
  subtitle: string
  coverImage: string
  iconClass: string
  summary: string
  content: string
  tags: string[]
  difficultyLevel: string
  targetAudience: string
  authorName: string
  authorTitle: string
  isTop: boolean
  isRecommended: boolean
  sortOrder: number
  viewCount: number
  likeCount: number
  createdAt: string
  updatedAt: string
}
```

- [ ] **Step 2: Create Notice type definitions**

```typescript
// apps/user/src/types/employment/content/notice.ts
export interface NoticeQueryDTO {
  page?: number
  size?: number
  title?: string
  summary?: string
  source?: string
  noticeCategory?: string
  noticeType?: string
  province?: string
  city?: string
  year?: string
}

export interface NoticeListVO {
  id: number
  title: string
  summary: string
  publishDate: string
  viewCount: number
  noticeCategory: string
  province: string
  city: string
  year: string
  regStartDate: string
  regEndDate: string
  recruitmentCount: number
}

export interface NoticeDetailVO {
  id: number
  noticeCategory: string
  noticeType: string
  title: string
  summary: string
  content: string
  province: string
  city: string
  tags: string[]
  year: string
  source: string
  sourceUrl: string
  publishDate: string
  publishUnit: string
  regStartDate: string
  regEndDate: string
  examTime: string
  recruitmentCount: number
  isTop: boolean
  isImportant: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}
```

---

### Task 2: 创建 API 函数

**Files:**
- Create: `apps/user/src/api/employment/content/examGuide.ts`
- Create: `apps/user/src/api/employment/content/notice.ts`

- [ ] **Step 1: Create ExamGuide API**

```typescript
// apps/user/src/api/employment/content/examGuide.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { ExamGuideListVO, ExamGuideDetailVO, ExamGuideQueryDTO } from '@/types/employment/content/examGuide'

export const getExamGuideList = (params: ExamGuideQueryDTO) => {
  return request.get<R<PageResult<ExamGuideListVO>>>('/api/v1/app/employment/content/exam-guide/list', { params })
}

export const getExamGuideDetail = (id: number) => {
  return request.get<R<ExamGuideDetailVO>>(`/api/v1/app/employment/content/exam-guide/${id}`)
}
```

- [ ] **Step 2: Create Notice API**

```typescript
// apps/user/src/api/employment/content/notice.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { NoticeListVO, NoticeDetailVO, NoticeQueryDTO } from '@/types/employment/content/notice'

export const getNoticeList = (params: NoticeQueryDTO) => {
  return request.get<R<PageResult<NoticeListVO>>>('/api/v1/app/employment/content/notice/list', { params })
}

export const getNoticeDetail = (id: number) => {
  return request.get<R<NoticeDetailVO>>(`/api/v1/app/employment/content/notice/${id}`)
}
```

---

### Task 3: 创建 ExamGuideDialog 组件

**Files:**
- Create: `apps/user/src/components/employment/ExamGuideDialog.vue`
- Data flow: 接收 `dialogVisible` prop，emit `update:dialogVisible`
- 内部管理列表/详情视图切换

- [ ] **Step 1: Create ExamGuideDialog.vue — script section**

```vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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

// list view state
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

// detail view state
const currentView = ref<'list' | 'detail'>('list')
const currentId = ref<number | null>(null)

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

async function goDetail(id: number) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('请先登录查看详情', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning',
      })
      userStore.setRedirectPath(`/employment/job/${id}`)
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
```

- [ ] **Step 2: Create ExamGuideDialog.vue — template section**

```vue
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
        <el-table-column prop="guideCategory" label="类别" width="100">
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
```

---

### Task 4: 创建 ExamGuideDetail 组件

**Files:**
- Create: `apps/user/src/components/employment/ExamGuideDetail.vue`

- [ ] **Step 1: Create ExamGuideDetail.vue**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getExamGuideDetail } from '@/api/employment/content/examGuide'
import type { ExamGuideDetailVO } from '@/types/employment/content/examGuide'

const props = defineProps<{
  id: number
}>()

const loading = ref(false)
const detail = ref<ExamGuideDetailVO | null>(null)

const guideCategoryMap: Record<string, string> = {
  civil: '公务员', institution: '事业单位', military: '军队文职',
  selection: '选调生', teacher: '教师招聘', healthcare: '医疗卫生',
  finance: '金融银行', grassroots: '基层服务', community: '社区工作者',
  general: '通用/其他',
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getExamGuideDetail(props.id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取详情失败')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-loading="loading" class="min-h-[300px]">
    <template v-if="detail">
      <div v-if="detail.coverImage" class="mb-6 rounded-xl overflow-hidden">
        <img :src="detail.coverImage" alt="cover" class="w-full h-48 object-cover" />
      </div>

      <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ detail.title }}</h2>
      <div v-if="detail.subtitle" class="text-gray-500 mb-4">{{ detail.subtitle }}</div>

      <div class="flex flex-wrap items-center gap-2 mb-4 text-sm text-gray-500">
        <span v-if="detail.authorName" class="font-medium text-gray-700">{{ detail.authorName }}</span>
        <span v-if="detail.authorTitle">· {{ detail.authorTitle }}</span>
        <el-tag v-if="detail.difficultyLevel" size="small" type="warning">{{ detail.difficultyLevel }}</el-tag>
        <span>· 阅读 {{ detail.viewCount }}</span>
        <span v-if="detail.likeCount">· 点赞 {{ detail.likeCount }}</span>
      </div>

      <div v-if="detail.tags && detail.tags.length" class="flex flex-wrap gap-1.5 mb-4">
        <el-tag v-for="tag in detail.tags" :key="tag" size="small">{{ tag }}</el-tag>
      </div>

      <div v-if="detail.summary" class="bg-gray-50 rounded-lg p-4 mb-6 text-gray-600 text-sm leading-relaxed">
        {{ detail.summary }}
      </div>

      <div class="prose max-w-none" v-html="detail.content" />
    </template>

    <div v-if="!loading && !detail" class="py-20 text-center text-gray-400">
      暂无内容
    </div>
  </div>
</template>
```

---

### Task 5: 创建 NoticeDialog 组件

**Files:**
- Create: `apps/user/src/components/employment/NoticeDialog.vue`

- [ ] **Step 1: Create NoticeDialog.vue — script section**

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { getNoticeList } from '@/api/employment/content/notice'
import type { NoticeListVO, NoticeQueryDTO } from '@/types/employment/content/notice'
import NoticeDetail from './NoticeDetail.vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const router = useRouter()

const noticeCategoryOptions = [
  { value: 'civil', label: '公务员' },
  { value: 'institution', label: '事业单位' },
  { value: 'military', label: '军队文职' },
  { value: 'selection', label: '选调生' },
  { value: 'teacher', label: '教师招聘' },
  { value: 'healthcare', label: '医疗卫生' },
  { value: 'finance', label: '金融银行' },
  { value: 'grassroots', label: '基层服务' },
  { value: 'community', label: '社区工作者' },
  { value: 'public_welfare', label: '公益岗位' },
  { value: 'enterprise', label: '国企/名企' },
  { value: 'general', label: '通用/其他' },
]

const noticeTypeOptions = [
  { value: '招聘公告', label: '招聘公告' },
  { value: '招录公告', label: '招录公告' },
  { value: '补录公告', label: '补录公告' },
  { value: '调剂公告', label: '调剂公告' },
  { value: '成绩公示', label: '成绩公示' },
  { value: '面试通知', label: '面试通知' },
  { value: '体检通知', label: '体检通知' },
  { value: '录用公示', label: '录用公示' },
  { value: '报名指南', label: '报名指南' },
  { value: '考试大纲', label: '考试大纲' },
  { value: '政策解读', label: '政策解读' },
]

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}))

// list view state
const loading = ref(false)
const list = ref<NoticeListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const noticeCategory = ref('')
const noticeType = ref('')
const province = ref('')
const city = ref('')
const year = ref('')

// detail view state
const currentView = ref<'list' | 'detail'>('list')
const currentId = ref<number | null>(null)

const provinceCityMap: Record<string, string[]> = {
  '北京': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区'],
  '上海': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区'],
  '天津': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区'],
  '重庆': ['渝中区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区'],
  '广东': ['广州', '深圳', '珠海', '汕头', '佛山', '东莞', '中山', '惠州'],
  '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '台州'],
  '江苏': ['南京', '苏州', '无锡', '常州', '南通', '徐州', '扬州', '镇江'],
  '山东': ['济南', '青岛', '烟台', '潍坊', '临沂', '淄博', '济宁', '泰安'],
  '四川': ['成都', '绵阳', '德阳', '宜宾', '南充', '泸州', '自贡', '乐山'],
  '湖北': ['武汉', '宜昌', '襄阳', '荆州', '黄石', '十堰', '孝感', '荆门'],
  '湖南': ['长沙', '株洲', '湘潭', '衡阳', '岳阳', '常德', '益阳', '郴州'],
  '福建': ['福州', '厦门', '泉州', '漳州', '莆田', '龙岩', '三明', '南平'],
  '河北': ['石家庄', '唐山', '保定', '邯郸', '秦皇岛', '沧州', '廊坊', '邢台'],
  '河南': ['郑州', '洛阳', '开封', '南阳', '新乡', '安阳', '许昌', '平顶山'],
  '安徽': ['合肥', '芜湖', '蚌埠', '马鞍山', '安庆', '阜阳', '滁州', '六安'],
  '江西': ['南昌', '九江', '赣州', '宜春', '吉安', '上饶', '抚州', '景德镇'],
  '辽宁': ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口'],
  '吉林': ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城'],
  '黑龙江': ['哈尔滨', '齐齐哈尔', '牡丹江', '佳木斯', '大庆', '鸡西', '双鸭山'],
  '陕西': ['西安', '咸阳', '宝鸡', '渭南', '延安', '汉中', '安康', '商洛'],
  '山西': ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '忻州', '吕梁'],
  '贵州': ['贵阳', '遵义', '六盘水', '安顺', '毕节', '铜仁', '黔东南', '黔南'],
  '云南': ['昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '大理'],
  '甘肃': ['兰州', '天水', '白银', '金昌', '嘉峪关', '武威', '张掖', '酒泉'],
  '广西': ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港'],
  '内蒙古': ['呼和浩特', '包头', '乌海', '赤峰', '通辽', '鄂尔多斯', '呼伦贝尔'],
  '新疆': ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '库尔勒'],
  '西藏': ['拉萨', '日喀则', '昌都', '林芝', '山南', '那曲'],
  '海南': ['海口', '三亚', '三沙', '儋州'],
  '宁夏': ['银川', '石嘴山', '吴忠', '固原', '中卫'],
  '青海': ['西宁', '海东', '海西', '海南', '海北', '黄南'],
  '香港': ['香港'],
  '澳门': ['澳门'],
  '台湾': ['台北', '高雄', '台中', '台南'],
}

const provinceOptions = Object.keys(provinceCityMap).map(p => ({ value: p, label: p }))
const cityOptions = computed(() => {
  if (!province.value) return []
  return (provinceCityMap[province.value] || []).map(c => ({ value: c, label: c }))
})

import { computed } from 'vue'

function buildParams(): NoticeQueryDTO {
  return {
    page: page.value,
    size: pageSize.value,
    title: keyword.value || undefined,
    summary: keyword.value || undefined,
    source: keyword.value || undefined,
    noticeCategory: noticeCategory.value || undefined,
    noticeType: noticeType.value || undefined,
    province: province.value || undefined,
    city: city.value || undefined,
    year: year.value || undefined,
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params = buildParams()
    const res = await getNoticeList(params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取公告列表失败')
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

function onProvinceChange() {
  city.value = ''
  onSearch()
}

async function goDetail(id: number) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('请先登录查看详情', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning',
      })
      userStore.setRedirectPath(`/employment/job/${id}`)
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
```

- [ ] **Step 2: Create NoticeDialog.vue — template section**

```vue
<template>
  <el-dialog
    :model-value="props.visible"
    title="📢 公告"
    width="80vw"
    :close-on-click-modal="false"
    @update:model-value="onClose"
  >
    <template v-if="currentView === 'list'">
      <div class="flex gap-3 mb-4">
        <el-input
          v-model="keyword"
          placeholder="搜索标题、摘要、来源..."
          clearable
          @keyup.enter="onSearch"
        />
        <el-button type="primary" @click="onSearch">搜索</el-button>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-4">
        <el-select
          v-model="noticeCategory"
          placeholder="公告类别"
          clearable
          class="!w-[150px]"
          @change="onSearch"
        >
          <el-option
            v-for="opt in noticeCategoryOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-select
          v-model="noticeType"
          placeholder="公告类型"
          clearable
          class="!w-[140px]"
          @change="onSearch"
        >
          <el-option
            v-for="opt in noticeTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-select
          v-model="province"
          placeholder="省份"
          clearable
          class="!w-[130px]"
          @change="onProvinceChange"
        >
          <el-option
            v-for="opt in provinceOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-select
          v-model="city"
          placeholder="城市"
          clearable
          class="!w-[130px]"
          :disabled="!province"
          @change="onSearch"
        >
          <el-option
            v-for="opt in cityOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-select
          v-model="year"
          placeholder="年份"
          clearable
          class="!w-[120px]"
          @change="onSearch"
        >
          <el-option
            v-for="opt in yearOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <el-table v-loading="loading" :data="list" stripe border style="width: 100%">
        <el-table-column label="标题" min-width="200">
          <template #default="{ row }">
            <div class="font-medium text-gray-800">{{ row.title }}</div>
            <div v-if="row.summary" class="text-xs text-gray-400 mt-0.5 truncate max-w-[400px]">{{ row.summary }}</div>
          </template>
        </el-table-column>
        <el-table-column label="类别" width="100">
          <template #default="{ row }">
            {{ noticeCategoryOptions.find(o => o.value === row.noticeCategory)?.label || row.noticeCategory }}
          </template>
        </el-table-column>
        <el-table-column prop="province" label="省份" width="80" />
        <el-table-column label="发布日期" width="110">
          <template #default="{ row }">
            {{ row.publishDate ? row.publishDate.slice(0, 10) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="阅读" width="70">
          <template #default="{ row }">
            {{ row.viewCount > 999 ? (row.viewCount / 1000).toFixed(1) + 'k' : row.viewCount }}
          </template>
        </el-table-column>
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
          ◀ 返回公告列表
        </el-button>
      </div>
      <NoticeDetail v-if="currentId" :id="currentId" />
    </template>
  </el-dialog>
</template>
```

Note: The `import { computed } from 'vue'` should be added at the top with the other imports, not in the middle of the script. The plan below already has it at the top in the corrected version.

---

### Task 6: 创建 NoticeDetail 组件

**Files:**
- Create: `apps/user/src/components/employment/NoticeDetail.vue`

- [ ] **Step 1: Create NoticeDetail.vue**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getNoticeDetail } from '@/api/employment/content/notice'
import type { NoticeDetailVO } from '@/types/employment/content/notice'

const props = defineProps<{
  id: number
}>()

const loading = ref(false)
const detail = ref<NoticeDetailVO | null>(null)

const noticeCategoryMap: Record<string, string> = {
  civil: '公务员', institution: '事业单位', military: '军队文职',
  selection: '选调生', teacher: '教师招聘', healthcare: '医疗卫生',
  finance: '金融银行', grassroots: '基层服务', community: '社区工作者',
  public_welfare: '公益岗位', enterprise: '国企/名企', general: '通用/其他',
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getNoticeDetail(props.id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取公告详情失败')
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  return dateStr.slice(0, 10)
}
</script>

<template>
  <div v-loading="loading" class="min-h-[300px]">
    <template v-if="detail">
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <el-tag type="primary">
          {{ noticeCategoryMap[detail.noticeCategory] || detail.noticeCategory }}
        </el-tag>
        <el-tag v-if="detail.noticeType" type="success">{{ detail.noticeType }}</el-tag>
        <el-tag v-if="detail.isTop" type="warning" effect="dark">置顶</el-tag>
        <el-tag v-if="detail.isImportant" type="danger" effect="dark">重要</el-tag>
      </div>

      <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.title }}</h2>

      <div class="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
        <div v-if="detail.source">来源：{{ detail.source }}</div>
        <div v-if="detail.publishUnit">发布单位：{{ detail.publishUnit }}</div>
        <div v-if="detail.publishDate">发布日期：{{ formatDate(detail.publishDate) }}</div>
        <div v-if="detail.province || detail.city">地区：{{ [detail.province, detail.city].filter(Boolean).join(' ') }}</div>
        <div v-if="detail.recruitmentCount">招录人数：{{ detail.recruitmentCount }} 人</div>
        <div v-if="detail.regStartDate">报名开始：{{ formatDate(detail.regStartDate) }}</div>
        <div v-if="detail.regEndDate">报名截止：{{ formatDate(detail.regEndDate) }}</div>
        <div v-if="detail.examTime">考试时间：{{ formatDate(detail.examTime) }}</div>
        <div>阅读量：{{ detail.viewCount }}</div>
      </div>

      <div v-if="detail.summary" class="bg-orange-50 rounded-lg p-4 mb-6 text-gray-600 text-sm leading-relaxed border-l-4 border-orange-400">
        {{ detail.summary }}
      </div>

      <div class="prose max-w-none" v-html="detail.content" />

      <div v-if="detail.sourceUrl" class="mt-6 pt-4 border-t border-gray-200">
        <a :href="detail.sourceUrl" target="_blank" rel="noopener noreferrer" class="text-orange-500 hover:text-orange-600 text-sm">
          查看原文 ↗
        </a>
      </div>
    </template>

    <div v-if="!loading && !detail" class="py-20 text-center text-gray-400">
      暂无内容
    </div>
  </div>
</template>
```

---

### Task 7: 修改岗位搜索页 — 添加右侧抽屉

**Files:**
- Modify: `apps/user/src/views/employment/jobs/index.vue`

- [ ] **Step 1: Add imports to script section**

In the `<script setup lang="ts">` block, add these imports after the existing ones:

```typescript
import { ref } from 'vue'
import ExamGuideDialog from '@/components/employment/ExamGuideDialog.vue'
import NoticeDialog from '@/components/employment/NoticeDialog.vue'
```

Note: `ref` and other imports may already exist — check and add only missing ones. Currently `ref` is already imported, so just add the component imports.

- [ ] **Step 2: Add drawer state variables**

After the existing reactive state declarations, add:

```typescript
const drawerExpanded = ref(true)
const examGuideVisible = ref(false)
const noticeVisible = ref(false)
```

- [ ] **Step 3: Modify template — wrap content area in flex layout**

Change the current template structure from:

```html
<main class="flex-1">
  <div class="container mx-auto px-6 py-12 text-center">HERO</div>
  <div class="container mx-auto px-6 pb-6">TABS</div>
  <div class="container mx-auto px-6 pb-8">SEARCH</div>
  <div class="container mx-auto px-6 pb-16">RESULTS</div>
</main>
```

To:

```html
<main class="flex-1">
  <div class="container mx-auto px-6 py-12 text-center">HERO</div>
  <div class="container mx-auto px-6 pb-16">
    <div class="flex gap-6">
      <div class="flex-1 min-w-0">
        <div class="pb-6">TABS</div>
        <div class="pb-8">SEARCH</div>
        <div>RESULTS</div>
      </div>

      <!-- Right Drawer -->
      <div
        :class="[
          'shrink-0 transition-all duration-300',
          drawerExpanded ? 'w-56' : 'w-3 cursor-pointer'
        ]"
        class="relative"
        @click="!drawerExpanded && (drawerExpanded = true)"
      >
        <div
          v-if="drawerExpanded"
          class="sticky top-24 space-y-3"
        >
          <button
            class="w-full rounded-2xl bg-white p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all text-left group"
            @click="examGuideVisible = true"
          >
            <div class="text-2xl mb-1">📚</div>
            <div class="font-bold text-gray-800 group-hover:text-orange-500 transition-colors">备考指南</div>
            <div class="text-xs text-gray-400 mt-0.5">备考文章·经验·技巧</div>
          </button>

          <button
            class="w-full rounded-2xl bg-white p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all text-left group"
            @click="noticeVisible = true"
          >
            <div class="text-2xl mb-1">📢</div>
            <div class="font-bold text-gray-800 group-hover:text-orange-500 transition-colors">公告</div>
            <div class="text-xs text-gray-400 mt-0.5">招考·招聘·通知</div>
          </button>

          <button
            class="w-full text-center text-xs text-gray-400 hover:text-orange-500 transition-colors py-1"
            @click="drawerExpanded = false"
          >
            ◀ 收起
          </button>
        </div>

        <div
          v-else
          class="sticky top-24 flex items-center justify-center h-32 w-3 bg-white/80 rounded-r-lg shadow-sm border border-gray-200 text-gray-400 hover:text-orange-500 transition-colors text-xs"
          title="展开"
        >
          ▶
        </div>
      </div>
    </div>
  </div>

  <!-- Dialogs -->
  <ExamGuideDialog v-model:visible="examGuideVisible" />
  <NoticeDialog v-model:visible="noticeVisible" />
</main>
```

- [ ] **Step 4: Apply the actual edit to the existing template**

The existing template structure is:

```html
    <main class="flex-1">
      <div class="container mx-auto px-6 py-12 text-center">
        <!-- hero section -->
      </div>

      <div class="container mx-auto px-6 pb-6">
        <!-- tabs -->
      </div>

      <div class="container mx-auto px-6 pb-8">
        <!-- search -->
      </div>

      <div class="container mx-auto px-6 pb-16">
        <!-- results -->
      </div>
    </main>
```

Replace with the new flex layout where tabs, search, and results go into the flex-1 column, and the drawer sits beside them.

---

### Task 8: Verify build

- [ ] **Step 1: Run TypeScript check or dev server**

```bash
cd apps/user
npx vue-tsc --noEmit
```

Or test by starting the dev server:

```bash
cd apps/user
npm run dev
```

Check terminal output for compilation errors. If there are errors (import paths, type mismatches, missing imports), fix them.

**Known issues to check:**
- The `NoticeDialog.vue` has `import { computed } from 'vue'` in the middle of script — it must be at the top next to other imports.
- The `cityOptions` computed uses `province.value` which should be reactive.
- All import paths must use `@/` alias.
