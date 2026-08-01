<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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

const currentView = ref<'list' | 'detail'>('list')
const currentId = ref<string | null>(null)

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

async function goDetail(id: string) {
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
