<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getNoticeList, recordNoticeView } from '@/api/employment/content/notice'
import type { NoticeDetailVO, NoticeQueryDTO } from '@/types/employment/content/notice'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

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

const loading = ref(false)
const list = ref<NoticeDetailVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const noticeCategory = ref('')
const noticeType = ref('')
const province = ref('')
const city = ref('')
const year = ref('')

const selectedId = ref<string | null>(null)

function noticeCategoryLabel(code: string): string {
  return noticeCategoryOptions.find(o => o.value === code)?.label || code
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  return dateStr.slice(0, 10)
}

const selectedDetail = computed(() => list.value.find(r => r.id === selectedId.value) ?? null)

function isSelected(id: string): boolean {
  return selectedId.value === id
}

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
    const res = await getNoticeList(buildParams())
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
    ElMessage.error(e?.response?.data?.msg || '获取公告列表失败')
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

function onProvinceChange() {
  city.value = ''
  onSearch()
}

function selectItem(row: NoticeDetailVO) {
  selectedId.value = row.id
  recordNoticeView(row.id).catch(() => {})
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
    title="📢 公告"
    width="80vw"
    :close-on-click-modal="false"
    @update:model-value="onClose"
  >
    <div class="rounded-xl bg-gradient-to-b from-orange-50/70 to-white p-4 border-t-2 border-t-[#F97316] border-b-2 border-b-[#FB923C] mb-4">
      <div class="flex gap-3 mb-4">
        <el-input
          v-model="keyword"
          placeholder="搜索标题、摘要、来源..."
          clearable
          @keyup.enter="onSearch"
        />
        <el-button class="dg-btn-search" @click="onSearch">搜索</el-button>
      </div>

      <div class="flex flex-wrap items-center gap-3">
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
    </div>

    <div class="grid gap-4" style="grid-template-columns: 300px 1fr; height: 60vh; min-height: 480px">
      <div class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div class="shrink-0 border-b border-gray-100 px-4 py-3 text-sm font-bold text-gray-700">公告列表</div>
        <div v-loading="loading" class="min-h-0 flex-1 overflow-y-auto py-1">
          <button
            v-for="row in list"
            :key="row.id"
            class="flex w-full flex-col items-start gap-1 border-l-4 px-4 py-3 text-left transition-colors"
            :class="isSelected(row.id) ? 'border-orange-500 bg-orange-50' : 'border-transparent hover:bg-orange-50/60'"
            @click="selectItem(row)"
          >
            <span class="rounded-full bg-gradient-to-r from-orange-50 to-amber-50 px-2 py-0.5 text-xs font-medium text-orange-600 ring-1 ring-inset ring-orange-200">
              {{ noticeCategoryLabel(row.noticeCategory) }}
            </span>
            <span class="line-clamp-2 text-sm font-semibold text-gray-800">{{ row.title }}</span>
            <span class="text-xs text-gray-400">{{ formatDate(row.publishDate) }}</span>
          </button>
          <div v-if="!loading && list.length === 0" class="py-16 text-center text-sm text-gray-400">暂无数据</div>
        </div>
      </div>

      <div class="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-orange-50/70 to-white shadow-lg border-t-[3px] border-t-[#F97316] border-b-[3px] border-b-[#FB923C]">
        <div v-loading="loading" class="min-h-0 flex-1 overflow-y-auto p-6">
          <div v-if="selectedDetail" class="pr-1">
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">{{ noticeCategoryLabel(selectedDetail.noticeCategory) }}</span>
              <span v-if="selectedDetail.noticeType" class="rounded-full bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1 text-xs font-medium text-orange-600 ring-1 ring-inset ring-orange-200">{{ selectedDetail.noticeType }}</span>
              <span v-if="selectedDetail.isTop" class="rounded-full bg-amber-500 px-3 py-1 text-xs text-white">置顶</span>
              <span v-if="selectedDetail.isImportant" class="rounded-full bg-red-500 px-3 py-1 text-xs text-white">重要</span>
            </div>

            <h3 class="text-xl font-bold text-gray-800">{{ selectedDetail.title }}</h3>

            <div class="mb-4 mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span v-if="selectedDetail.publishUnit">{{ selectedDetail.publishUnit }}</span>
              <span v-if="selectedDetail.publishDate">· {{ formatDate(selectedDetail.publishDate) }}</span>
              <span v-if="selectedDetail.source">· 来源：{{ selectedDetail.source }}</span>
              <span v-if="selectedDetail.viewCount != null">· 阅读 {{ selectedDetail.viewCount }}</span>
            </div>

            <div class="mb-5 h-px shrink-0 bg-gradient-to-r from-orange-500 to-amber-400"></div>

            <div v-if="selectedDetail.summary" class="mb-5 rounded-lg border-l-4 border-orange-400 bg-orange-50 p-4 text-sm leading-relaxed text-gray-600">
              {{ selectedDetail.summary }}
            </div>

            <div class="notice-content text-gray-600 leading-relaxed" v-html="selectedDetail.content" />

            <div v-if="selectedDetail.sourceUrl" class="mt-6 border-t border-gray-200 pt-4">
              <a :href="selectedDetail.sourceUrl" target="_blank" rel="noopener noreferrer" class="text-sm text-orange-500 hover:text-orange-600">
                查看原文 ↗
              </a>
            </div>
          </div>

          <div v-else class="flex h-full min-h-[320px] items-center justify-center text-gray-400">暂无公告</div>
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
.notice-content p {
  margin-bottom: 12px;
}

.notice-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
}

.notice-content h1,
.notice-content h2,
.notice-content h3,
.notice-content h4 {
  font-weight: 700;
  color: #1f2937;
  margin: 20px 0 10px;
  line-height: 1.4;
}

.notice-content ul {
  list-style: disc;
  padding-left: 20px;
  margin: 8px 0 12px;
}

.notice-content ol {
  list-style: decimal;
  padding-left: 20px;
  margin: 8px 0 12px;
}

.notice-content li {
  margin-bottom: 4px;
}

.notice-content a {
  color: #f97316;
  text-decoration: underline;
}

.notice-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}

.notice-content td,
.notice-content th {
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
}

.notice-content blockquote {
  border-left: 3px solid #f97316;
  padding-left: 12px;
  color: #6b7280;
  margin: 8px 0 12px;
}
</style>
