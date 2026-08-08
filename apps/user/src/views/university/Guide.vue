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
  { key: 'survival', label: '基础生存类', icon: 'shield', requiresPro: false, desc: '校园设施、宿舍、交通' },
  { key: 'academic', label: '学业规划类', icon: 'book', requiresPro: true, desc: '学业指导、转专业、学习资源' },
  { key: 'social', label: '社交融入类', icon: 'users', requiresPro: false, desc: '社团、活动、班级宿舍' },
  { key: 'safety', label: '权益与安全类', icon: 'lock', requiresPro: false, desc: '资助、安全、医疗' },
  { key: 'life', label: '周边生活类', icon: 'store', requiresPro: false, desc: '生活服务' },
  { key: 'gallery', label: '校园图册', icon: 'camera', requiresPro: false, desc: '校园风景' },
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
  <div class="min-h-screen">
    <main class="container mx-auto px-6 py-8">
      <!-- 引导文案 -->
      <section class="univ-card mb-8 p-6">
        <p class="text-gray-700 leading-relaxed text-center">
          新生校园适应指南为您提供全面的校园适应指导，涵盖生存保障、学业规划、社交融入、权益支持等核心维度，助您快速适应大学生活。
        </p>
      </section>

      <!-- 院校基本信息 -->
      <section v-if="overview" class="univ-card mb-8 p-6">
        <div class="flex items-center gap-4">
          <img
            :src="overview.imageUrl || ''"
            :alt="overview.name"
            class="h-20 w-20 rounded-xl object-cover shadow-md"
            @error="($event.target as HTMLImageElement).src = ''"
          />
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-800">{{ overview.name }}</h2>
            <div class="flex flex-wrap gap-2 mt-2">
              <span v-for="tag in overview.tags" :key="tag" class="pill-new text-xs">{{ tag }}</span>
              <span v-for="tag in overview.customTags" :key="tag" class="pill-new pill-new-blue text-xs">{{ tag }}</span>
            </div>
            <div class="flex gap-4 mt-2 text-sm text-gray-500">
              <span>{{ overview.region }}</span>
              <span>{{ overview.category }}</span>
              <span>{{ overview.nature }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 分类按钮 -->
      <section class="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          v-for="cat in categories"
          :key="cat.key"
          :disabled="cat.requiresPro && !isPro"
          class="cat-btn"
          :class="{
            'cat-active': activeCategory === cat.key,
            'cat-disabled': cat.requiresPro && !isPro,
          }"
          @click="handleCategoryClick(cat)"
        >
          <!-- 盾牌（基础生存） -->
          <svg v-if="cat.icon === 'shield'" class="cat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <!-- 书本（学业规划） -->
          <svg v-else-if="cat.icon === 'book'" class="cat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <!-- 用户（社交融入） -->
          <svg v-else-if="cat.icon === 'users'" class="cat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <!-- 锁（权益安全） -->
          <svg v-else-if="cat.icon === 'lock'" class="cat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <!-- 商店（周边生活） -->
          <svg v-else-if="cat.icon === 'store'" class="cat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <!-- 相机（校园图册） -->
          <svg v-else-if="cat.icon === 'camera'" class="cat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          </svg>
          <div class="text-sm font-semibold">{{ cat.label }}</div>
          <div class="text-xs mt-1 opacity-75">{{ cat.desc }}</div>
          <div v-if="cat.requiresPro && !isPro" class="absolute top-2 right-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
          <div v-if="cat.requiresPro && !isPro" class="mt-1 text-xs text-gray-400">需要专业版</div>
        </button>
      </section>

      <!-- 内容展示区 -->
      <section v-loading="loading || galleryLoading" class="min-h-[200px]">
        <!-- JSONB 数据渲染 -->
        <template v-if="categoryData && Object.keys(categoryData).length > 0">
          <div v-for="(value, key) in categoryData" :key="key" class="guide-section">
            <div class="guide-section-header">
              <h2 class="guide-category-title">{{ getFieldLabel(key) }}</h2>
            </div>
            <div v-if="typeof value === 'object' && value !== null" class="guide-section-body">
              <div v-for="(v, k) in value" :key="k" class="guide-subsection">
                <h4 class="guide-sub-title">
                  <span class="guide-sub-icon"></span>
                  {{ getSubLabel(key, k) }}
                </h4>
                <div v-if="Array.isArray(v)" class="guide-data-list">
                  <div v-for="(item, idx) in v" :key="idx" class="guide-data-item" :style="{ animationDelay: `${idx * 60}ms` }">
                    <span class="guide-data-bullet"></span>
                    <span class="guide-data-text">{{ item }}</span>
                  </div>
                </div>
                <div v-else class="guide-data-list">
                  <div class="guide-data-item">
                    <span class="guide-data-bullet"></span>
                    <span class="guide-data-text">{{ v }}</span>
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
              :class="['pill-new', 'cursor-pointer', selectedImageType === '' ? 'pill-active' : '']"
              @click="handleImageTypeChange('')"
            >
              全部
            </button>
            <button
              v-for="t in galleryTypes"
              :key="t"
              :class="['pill-new', 'cursor-pointer', selectedImageType === t ? 'pill-active' : '']"
              @click="handleImageTypeChange(t)"
            >
              {{ t }}
            </button>
          </div>

          <div v-if="galleryList.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="(item, idx) in galleryList" :key="idx" class="univ-card univ-card-hover overflow-hidden">
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
            <div class="inline-flex items-center gap-1 univ-card p-1.5">
              <button
                class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
                :class="galleryPage <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-brand-orange/10 hover:text-brand-orange'"
                :disabled="galleryPage <= 1"
                @click="galleryPage--; fetchGallery()"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span class="px-3 text-sm text-gray-600">第 {{ galleryPage }} / {{ Math.ceil(galleryTotal / 20) }} 页</span>
              <button
                class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
                :class="galleryPage >= Math.ceil(galleryTotal / 20) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-brand-orange/10 hover:text-brand-orange'"
                :disabled="galleryPage >= Math.ceil(galleryTotal / 20)"
                @click="galleryPage++; fetchGallery()"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
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
            <p class="text-gray-400 text-lg">请点击上方分类按钮查看对应指南内容</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ===== 新规范卡片：纯白底 + 橙描边 + 渐变顶边 ===== */
.univ-card {
  /* !important 覆盖 .app-shell main > * 的透底规则（卡片是 main 直接子） */
  background: #ffffff !important;
  background-image: none !important;
  border-radius: 1rem;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  transition: all 0.25s ease;
}
.univ-card-hover:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.35);
}

/* ===== 橙系药丸标签 ===== */
.pill-new {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e8722a;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.25);
}
.pill-new-blue {
  color: #1e88e5;
  background: linear-gradient(90deg, rgba(30, 136, 229, 0.1), rgba(30, 136, 229, 0.08));
  border-color: rgba(30, 136, 229, 0.25);
}
.pill-active {
  background: linear-gradient(90deg, #f97316, #fb923c) !important;
  color: #fff !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.28);
}

/* ===== 分类按钮 ===== */
.cat-btn {
  position: relative;
  padding: 1.25rem 0.5rem;
  text-align: center;
  border-radius: 1rem;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  background: #ffffff !important;
  background-image: none !important;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  color: #374151;
  cursor: pointer;
  transition: all 0.25s ease;
}
.cat-btn:hover:not(.cat-disabled) {
  transform: translateY(-4px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.35);
}
.cat-active {
  background: linear-gradient(135deg, #f97316, #fb923c) !important;
  border-color: transparent !important;
  color: #fff !important;
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35);
}
.cat-disabled {
  background: #f3f4f6 !important;
  color: #9ca3af !important;
  border-color: #e5e7eb !important;
  border-image: none !important;
  cursor: not-allowed;
}
.cat-icon {
  width: 2rem;
  height: 2rem;
  margin: 0 auto 0.5rem;
  display: block;
}

/* Guide Section - Category Card */
.guide-section {
  margin-bottom: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(249, 115, 22, 0.08);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  overflow: hidden;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.guide-section:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

/* Section Header */
.guide-section-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(249, 115, 22, 0.08);
  background: linear-gradient(135deg, rgba(255, 247, 237, 0.6) 0%, rgba(255, 237, 213, 0.3) 100%);
}
.guide-category-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  padding-left: 12px;
  border-left: 4px solid #F97316;
  line-height: 1.3;
}

/* Section Body */
.guide-section-body {
  padding: 8px 0;
}

/* Sub-section */
.guide-subsection {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}
.guide-subsection:last-child {
  border-bottom: none;
}
.guide-sub-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.guide-sub-icon {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F97316, #FB923C);
  flex-shrink: 0;
}

/* Data List */
.guide-data-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 14px;
}

/* Data Item - Each on its own line */
.guide-data-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 247, 237, 0.4);
  border: 1px solid rgba(249, 115, 22, 0.06);
  transition: all 0.2s ease;
  animation: fadeInUp 0.3s ease forwards;
  opacity: 0;
}
.guide-data-item:hover {
  background: rgba(255, 247, 237, 0.8);
  border-color: rgba(249, 115, 22, 0.15);
  transform: translateX(4px);
}

/* Bullet */
.guide-data-bullet {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #FB923C;
  margin-top: 7px;
  flex-shrink: 0;
}

/* Data Text */
.guide-data-text {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.7;
  flex: 1;
}

/* Gallery Card */
.gallery-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.gallery-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* Fade In Animation */
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

/* Responsive */
@media (max-width: 640px) {
  .guide-section-header {
    padding: 16px 16px 12px;
  }
  .guide-category-title {
    font-size: 16px;
  }
  .guide-subsection {
    padding: 12px 16px;
  }
  .guide-data-item {
    padding: 6px 10px;
  }
}
</style>
