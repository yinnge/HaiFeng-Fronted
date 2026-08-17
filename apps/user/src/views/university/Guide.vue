<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { getGuideOverview, getGuideSurvival, getGuideAcademic, getGuideSocial, getGuideSafety, getGuideLife, getCampusGallery, getGalleryTypes } from '@/api/university'
import type { GuideOverviewVO, GuideCategoryVO, GalleryItemVO } from '@/types/university'
import { MemberType } from '@haifeng/shared'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const overview = ref<GuideOverviewVO | null>(null)
const activeCategory = ref<string>('')
const categoryData = ref<GuideCategoryVO | null>(null)
const galleryList = ref<GalleryItemVO[]>([])
const galleryLoading = ref(false)
const galleryTotal = ref(0)
const galleryPage = ref(1)
const galleryTypes = ref<string[]>([])
const selectedImageType = ref('')

const isPro = computed(() => {
  return userStore.userInfo?.memberType === MemberType.PRO || userStore.userInfo?.memberType === MemberType.VIP
})

// JSONB 字段中文映射（与 admin 院校适应指南管理中的 JSONB_FIELDS 保持一致）
const JSONB_FIELDS: { key: string; label: string; subFields: string[] }[] = [
  { key: 'campusFacilities', label: '校园设施', subFields: ['教学楼分布', '实验楼与图书馆', '宿舍区与食堂', '生活配套设施'] },
  { key: 'dormitoryServices', label: '水电网与宿舍管理', subFields: ['水电费缴纳方式', '宿舍规章制度'] },
  { key: 'campusTransportation', label: '校园通勤与校外交通', subFields: ['校内通勤方式', '校外交通情况'] },
  { key: 'academicGuidance', label: '专业与课程核心信息', subFields: ['专业培养方案说明', '选课系统说明'] },
  { key: 'majorTransferGuidelines', label: '转专业原则', subFields: ['基本申请条件', '申请时间与流程'] },
  { key: 'majorTransferConstriction', label: '转专业限制', subFields: ['限制类型', '具体限制说明'] },
  { key: 'academicSupportResources', label: '学习支持资源', subFields: ['师资力量', '学习场所', '学业帮扶'] },
  { key: 'studentOrganizations', label: '学生组织与社团', subFields: ['官方组织', '社团类型'] },
  { key: 'campusEvents', label: '校园活动与竞赛', subFields: ['院校品牌活动', '学科与技能竞赛'] },
  { key: 'classDormSocial', label: '班级与宿舍社交', subFields: ['班级管理方式', '宿舍社交建议'] },
  { key: 'financialAid', label: '奖助勤贷与权益保障', subFields: ['奖助学金政策', '勤工俭学岗位', '权益申诉渠道'] },
  { key: 'campusSecurity', label: '校园安全与应急处理', subFields: ['安全设施', '安全规则'] },
  { key: 'healthServices', label: '医保与心理健康', subFields: ['医保报销政策', '心理健康服务'] },
  { key: 'lifeServices', label: '生活服务', subFields: ['校园生活服务', '医疗资源', '兼职实习资源'] },
]

const fieldLabelMap: Record<string, string> = Object.fromEntries(JSONB_FIELDS.map(f => [f.key, f.label]))
const fieldSubMap: Record<string, Record<string, string>> = Object.fromEntries(
  JSONB_FIELDS.map(f => [f.key, Object.fromEntries(f.subFields.map(sub => [sub, sub]))])
)

// 英文 JSONB 键 → 中文标签（找不到时回退原值，兼容历史数据）
const getFieldLabel = (key: string | number): string => fieldLabelMap[String(key)] ?? String(key)
const getSubLabel = (fieldKey: string | number, subKey: string | number): string =>
  fieldSubMap[String(fieldKey)]?.[String(subKey)] ?? String(subKey)

const categories = [
  { key: 'survival', label: '基础生存类', icon: '🛡️', requiresPro: false, desc: '校园设施、宿舍、交通' },
  { key: 'academic', label: '学业规划类', icon: '📚', requiresPro: true, desc: '学业指导、转专业、学习资源' },
  { key: 'social', label: '社交融入类', icon: '🤝', requiresPro: false, desc: '社团、活动、班级宿舍' },
  { key: 'safety', label: '权益与安全类', icon: '🔒', requiresPro: false, desc: '资助、安全、医疗' },
  { key: 'life', label: '周边生活类', icon: '🏪', requiresPro: false, desc: '生活服务' },
  { key: 'gallery', label: '校园图册', icon: '📷', requiresPro: false, desc: '校园风景' },
]

async function fetchOverview() {
  const id = route.params.id as string
  if (!id) return
  try {
    const res = await getGuideOverview(id)
    overview.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取指南信息失败')
  }
}

async function handleCategoryClick(cat: typeof categories[0]) {
  if (cat.requiresPro && !isPro.value) {
    ElMessageBox.alert('该内容需要专业版及以上会员才能查看', '权限不足', {
      confirmButtonText: '知道了',
      type: 'warning',
    })
    return
  }

  activeCategory.value = cat.key
  categoryData.value = null
  galleryList.value = []
  galleryTotal.value = 0
  galleryTypes.value = []
  selectedImageType.value = ''

  if (cat.key === 'gallery') {
    const id = route.params.id as string
    if (!id) return
    try {
      const typesRes = await getGalleryTypes(id)
      galleryTypes.value = typesRes.data.data || []
    } catch {
      galleryTypes.value = []
    }
    await fetchGallery()
    return
  }

  const id = route.params.id as string
  if (!id) return

  loading.value = true
  try {
    let res: any
    switch (cat.key) {
      case 'survival': res = await getGuideSurvival(id); break
      case 'academic': res = await getGuideAcademic(id); break
      case 'social': res = await getGuideSocial(id); break
      case 'safety': res = await getGuideSafety(id); break
      case 'life': res = await getGuideLife(id); break
    }
    if (res?.data?.data) {
      categoryData.value = res.data.data
    } else {
      categoryData.value = {}
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '获取内容失败')
  } finally {
    loading.value = false
  }
}

async function fetchGallery() {
  const id = route.params.id as string
  if (!id) return
  galleryLoading.value = true
  try {
    const params: { page: number; size: number; imageType?: string } = { page: galleryPage.value, size: 20 }
    if (selectedImageType.value) {
      params.imageType = selectedImageType.value
    }
    const res = await getCampusGallery(id, params)
    galleryList.value = res.data.data.records
    galleryTotal.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取图册失败')
  } finally {
    galleryLoading.value = false
  }
}

function handleImageTypeChange(type: string) {
  selectedImageType.value = type
  galleryPage.value = 1
  fetchGallery()
}

onMounted(fetchOverview)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-brand-gray-50 via-orange-50/20 to-white">
    <main class="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
      <!-- 引导横幅 -->
      <section class="guide-hero mb-8">
        <div class="guide-hero-mask" />
        <div class="guide-hero-inner">
          <h1 class="guide-hero-title">新生校园适应指南</h1>
          <p v-if="overview?.name" class="guide-hero-name">{{ overview?.name }}</p>
          <p class="guide-hero-sub">生存保障 · 学业规划 · 社交融入 · 权益支持，助你快速融入大学生活</p>
          <div v-if="overview && (overview.tags?.length || overview.customTags?.length)" class="guide-hero-tags">
            <span v-for="tag in overview.tags" :key="tag" class="guide-hero-tag">{{ tag }}</span>
            <span v-for="tag in overview.customTags" :key="tag" class="guide-hero-tag">{{ tag }}</span>
          </div>
        </div>
      </section>

      <!-- 主体：左侧分类目录 + 右侧内容区 -->
      <div class="guide-layout">
        <!-- 左侧分类目录 -->
        <aside class="guide-aside">
          <nav class="guide-nav">
            <button
              v-for="cat in categories"
              :key="cat.key"
              :disabled="cat.requiresPro && !isPro"
              class="guide-nav-item"
              :class="{ 'is-active': activeCategory === cat.key, 'is-disabled': cat.requiresPro && !isPro }"
              @click="handleCategoryClick(cat)"
            >
              <span class="guide-nav-icon">{{ cat.icon }}</span>
              <span class="guide-nav-label">{{ cat.label }}</span>
              <span v-if="cat.requiresPro && !isPro" class="guide-nav-pro">PRO</span>
            </button>
          </nav>
        </aside>

        <!-- 右侧内容区 -->
        <div class="guide-content">
          <section v-loading="loading || galleryLoading" class="min-h-[200px]">
            <!-- JSONB 卡片化渲染 -->
            <template v-if="categoryData && Object.keys(categoryData).length > 0">
              <div v-for="(value, key) in categoryData" :key="key" class="guide-category">
                <div class="guide-category-header">
                  <h2 class="guide-category-title">{{ getFieldLabel(key) }}</h2>
                </div>
                <div v-if="typeof value === 'object' && value !== null" class="guide-card-grid">
                  <div v-for="(v, k, idx) in value" :key="k" class="guide-card" :style="{ animationDelay: `${idx * 70}ms` }">
                    <h4 class="guide-card-title">
                      <span class="guide-card-icon"></span>
                      {{ getSubLabel(key, k) }}
                    </h4>
                    <div class="guide-card-body">
                      <template v-if="Array.isArray(v)">
                        <div v-for="(item, i) in v" :key="i" class="guide-card-item">
                          <span class="guide-card-bullet"></span>
                          <span class="guide-card-text">{{ item }}</span>
                        </div>
                      </template>
                      <div v-else class="guide-card-item">
                        <span class="guide-card-bullet"></span>
                        <span class="guide-card-text">{{ v }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p v-else class="text-gray-500 text-sm italic px-6 pb-5">暂无数据</p>
              </div>
            </template>

            <!-- 图册 -->
            <template v-if="activeCategory === 'gallery'">
              <!-- 图片类型筛选 -->
              <div v-if="galleryTypes.length > 0" class="mb-6 flex flex-wrap gap-2">
                <button
                  :class="[
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-all border',
                    selectedImageType === ''
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                  ]"
                  @click="handleImageTypeChange('')"
                >
                  全部
                </button>
                <button
                  v-for="t in galleryTypes"
                  :key="t"
                  :class="[
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-all border',
                    selectedImageType === t
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                  ]"
                  @click="handleImageTypeChange(t)"
                >
                  {{ t }}
                </button>
              </div>

              <div v-if="galleryList.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div v-for="(item, idx) in galleryList" :key="idx" class="group rounded-xl overflow-hidden shadow-md bg-white">
                  <div class="aspect-[4/3] overflow-hidden">
                    <img
                      :src="item.imageUrl"
                      :alt="item.imageType"
                      class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p class="p-2 text-center text-xs text-gray-500">{{ item.imageType }}</p>
                </div>
              </div>
              <p v-else class="py-12 text-center text-gray-400">暂无图册内容</p>
              <div v-if="galleryTotal > 20" class="mt-6 flex justify-center">
                <el-pagination background layout="prev, pager, next" :total="galleryTotal" :page-size="20" :current-page="galleryPage" @current-change="(p: number) => { galleryPage = p; fetchGallery() }" />
              </div>
            </template>

            <!-- 空状态 -->
            <div v-if="!activeCategory" class="py-16 text-center">
              <div class="inline-flex flex-col items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                  <svg class="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p class="text-gray-400 text-lg">请点击左侧分类查看对应指南内容</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ===== 引导横幅 ===== */
.guide-hero {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(135deg, #c2410c 0%, #e8722a 100%);
  animation: fadeInUp 0.5s ease both;
}
.guide-hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(40, 16, 2, 0.42) 0%, rgba(40, 16, 2, 0) 62%);
  pointer-events: none;
}
.guide-hero-inner {
  position: relative;
  padding: 2rem 2.5rem;
}
.guide-hero-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.18);
}
.guide-hero-name {
  margin-top: 0.6rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.18);
}
.guide-hero-sub {
  margin-top: 0.45rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.95);
}
.guide-hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.9rem;
}
.guide-hero-tag {
  padding: 3px 12px;
  border-radius: 9999px;
  background: #ffffff;
  color: #e8722a;
  font-size: 12px;
  font-weight: 600;
}

/* ===== 双栏布局：左目录 + 右内容 ===== */
.guide-layout {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}
.guide-aside {
  position: sticky;
  top: 5rem;
  align-self: flex-start;
}
.guide-content {
  min-width: 0;
}

/* ===== 分类目录 ===== */
.guide-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.guide-nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: fadeInUp 0.4s ease both;
}
.guide-nav-item:hover:not(.is-disabled) {
  border-color: rgba(232, 114, 42, 0.25);
  transform: translateX(3px);
}
.guide-nav-item.is-active {
  background: linear-gradient(90deg, #e8722a, #f97316);
  color: #ffffff;
  box-shadow: 0 6px 14px -6px rgba(232, 114, 42, 0.5);
}
.guide-nav-item.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.guide-nav-icon {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}
.guide-nav-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}
.guide-nav-pro {
  padding: 1px 8px;
  border-radius: 9999px;
  background: rgba(232, 114, 42, 0.12);
  color: #e8722a;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}
.guide-nav-item.is-active .guide-nav-pro {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* ===== 内容分组 ===== */
.guide-category {
  margin-bottom: 2rem;
}
.guide-category-header {
  margin-bottom: 1rem;
}
.guide-category-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  padding-left: 12px;
  border-left: 4px solid #f97316;
  line-height: 1.3;
}

/* ===== 卡片化内容 ===== */
.guide-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
.guide-card {
  background: #ffffff;
  border: 1px solid rgba(232, 114, 42, 0.08);
  border-radius: 14px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  animation: fadeInUp 0.5s ease both;
  opacity: 0;
}
.guide-card:hover {
  transform: translateY(-3px);
  border-color: rgba(232, 114, 42, 0.2);
  box-shadow: 0 10px 24px -12px rgba(232, 114, 42, 0.2);
}
.guide-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem;
}
.guide-card-icon {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #fb923c);
  flex-shrink: 0;
}
.guide-card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.guide-card-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
}
.guide-card-bullet {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #fb923c;
  margin-top: 8px;
  flex-shrink: 0;
}
.guide-card-text {
  flex: 1;
}

/* ===== 入场动画 ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 响应式：移动端目录降级为横向滚动 ===== */
@media (max-width: 1023px) {
  .guide-layout {
    grid-template-columns: 1fr;
  }
  .guide-aside {
    position: static;
  }
  .guide-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 0.5rem;
    padding-bottom: 0.25rem;
  }
  .guide-nav-item {
    width: auto;
    flex-shrink: 0;
    white-space: nowrap;
  }
  .guide-hero-inner {
    padding: 1.5rem 1.25rem;
  }
  .guide-hero-title {
    font-size: 1.3rem;
  }
  .guide-hero-name {
    font-size: 1.15rem;
  }
}
</style>
