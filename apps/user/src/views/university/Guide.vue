<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { getGuideOverview, getGuideSurvival, getGuideAcademic, getGuideSocial, getGuideSafety, getGuideLife, getCampusGallery } from '@/api/university'
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

const isPro = computed(() => {
  return userStore.userInfo?.memberType === MemberType.PRO || userStore.userInfo?.memberType === MemberType.VIP
})

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
  } catch {
    ElMessage.error('获取指南信息失败')
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

  if (cat.key === 'gallery') {
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
    ElMessage.error(e?.response?.data?.msg || '获取内容失败')
  } finally {
    loading.value = false
  }
}

async function fetchGallery() {
  const id = route.params.id as string
  if (!id) return
  galleryLoading.value = true
  try {
    const res = await getCampusGallery(id, { page: galleryPage.value, size: 20 })
    galleryList.value = res.data.data.records
    galleryTotal.value = res.data.data.total
  } catch {
    ElMessage.error('获取图册失败')
  } finally {
    galleryLoading.value = false
  }
}

onMounted(fetchOverview)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8">
      <!-- 引导文案 -->
      <section class="mb-8 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 shadow-md border border-orange-100">
        <p class="text-gray-700 leading-relaxed text-center">
          新生校园适应指南为您提供全面的校园适应指导，涵盖生存保障、学业规划、社交融入、权益支持等核心维度，助您快速适应大学生活。
        </p>
      </section>

      <!-- 院校基本信息 -->
      <section v-if="overview" class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
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
              <span v-for="tag in overview.tags" :key="tag" class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600">{{ tag }}</span>
              <span v-for="tag in overview.customTags" :key="tag" class="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-600">{{ tag }}</span>
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
          class="relative rounded-2xl p-5 text-center transition-all border"
          :class="activeCategory === cat.key
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg border-transparent'
            : cat.requiresPro && !isPro
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-100 shadow-md hover:shadow-lg hover:border-orange-200'
          "
          @click="handleCategoryClick(cat)"
        >
          <div class="text-3xl mb-2">{{ cat.icon }}</div>
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
          <div v-for="(value, key) in categoryData" :key="key" class="mb-6 rounded-2xl bg-white p-6 shadow-md border border-gray-100">
            <h3 class="mb-4 text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">{{ key }}</h3>
            <div v-if="typeof value === 'object' && value !== null" class="space-y-3">
              <div v-for="(v, k) in value" :key="k" class="flex">
                <span class="text-gray-500 w-32 shrink-0">{{ k }}：</span>
                <span class="text-gray-700">{{ typeof v === 'object' ? JSON.stringify(v) : v }}</span>
              </div>
            </div>
            <p v-else class="text-gray-600">{{ value }}</p>
          </div>
        </template>

        <!-- 图册 -->
        <template v-if="activeCategory === 'gallery'">
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
          <p class="text-gray-400 text-lg">请点击上方分类按钮查看对应指南内容</p>
        </div>
      </section>
    </main>
  </div>
</template>
