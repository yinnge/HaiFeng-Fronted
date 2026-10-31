<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getGuideOverview,
  getGuideSurvival,
  getGuideAcademic,
  getGuideSocial,
  getGuideSafety,
  getGuideLife,
  getCampusGallery,
} from '@/api/university'
import type { GuideCategoryVO, GalleryItemVO } from '@/types/university'
import { useRechargeDialog } from '@/composables/useRechargeDialog'
import { useExpertContact } from '@/composables/useExpertContact'
import GuideIcon from '@/components/university/GuideIcon.vue'
import {
  GUIDE_MODULES,
  GUIDE_GROUPS,
  HOT_GUIDE_PILLS,
  QUICK_TOOLS,
  GUIDE_TEXT,
  type GuideCategoryApi,
  type GuideModuleMeta,
  type QuickToolMeta,
} from '@/components/university/guide-meta'

const props = withDefaults(
  defineProps<{
    universityId: string
    universityName?: string
    customTags?: string[]
    isVip?: boolean
    stickyTop?: number
  }>(),
  {
    universityName: '',
    customTags: () => [],
    isVip: false,
    stickyTop: 132,
  },
)

const emit = defineEmits<{
  (e: 'open-gallery'): void
  (e: 'open-overview'): void
}>()

const router = useRouter()
const recharge = useRechargeDialog()
const expert = useExpertContact()

const CATEGORY_FETCHERS: Record<GuideCategoryApi, (id: string) => Promise<any>> = {
  survival: getGuideSurvival,
  academic: getGuideAcademic,
  social: getGuideSocial,
  safety: getGuideSafety,
  life: getGuideLife,
}

const CATEGORY_KEYS: GuideCategoryApi[] = ['survival', 'academic', 'social', 'safety', 'life']

const data = reactive<Record<GuideCategoryApi, GuideCategoryVO | null>>({
  survival: null,
  academic: null,
  social: null,
  safety: null,
  life: null,
})
const loaded = reactive<Record<GuideCategoryApi, boolean>>({
  survival: false,
  academic: false,
  social: false,
  safety: false,
  life: false,
})
const failed = reactive<Record<GuideCategoryApi, boolean>>({
  survival: false,
  academic: false,
  social: false,
  safety: false,
  life: false,
})
const loading = reactive<Record<GuideCategoryApi, boolean>>({
  survival: false,
  academic: false,
  social: false,
  safety: false,
  life: false,
})

const initialLoading = ref(true)
const activeModuleKey = ref<string | null>(null)
const allPage = ref(1)
const pageSize = 8
const mobileValue = ref('')
const guideRoot = ref<HTMLElement | null>(null)
const mainRef = ref<HTMLElement | null>(null)

const galleryImages = ref<GalleryItemVO[]>([])
const galleryLoading = ref(false)
const academicDenied = ref(false)
const fetchedTags = ref<string[]>([])

const overviewTags = computed(() => (props.customTags?.length ? props.customTags : fetchedTags.value))
const expectedCategories = computed(() => (props.isVip && !academicDenied.value ? 5 : 4))
const failedCount = computed(() => CATEGORY_KEYS.filter((key) => failed[key]).length)
const allFailed = computed(
  () => !initialLoading.value && failedCount.value >= expectedCategories.value,
)

const academicLocked = computed(() => !props.isVip || academicDenied.value)

function isModuleLocked(module: GuideModuleMeta) {
  return module.category === 'academic' && academicLocked.value
}

function moduleRaw(module: GuideModuleMeta): Record<string, any> | null {
  const categoryData = data[module.category]
  if (!categoryData) return null
  const raw = categoryData[module.key]
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as Record<string, any>
}

function moduleSections(module: GuideModuleMeta): { label: string; items: string[] }[] {
  const raw = moduleRaw(module)
  if (!raw) return []
  return Object.entries(raw)
    .map(([label, value]) => ({
      label,
      items: Array.isArray(value) ? value.map(String).filter((item) => item.trim()) : [],
    }))
    .filter((section) => section.items.length > 0)
}

function moduleCount(module: GuideModuleMeta): number {
  return moduleSections(module).reduce((sum, section) => sum + section.items.length, 0)
}

function moduleStatusText(module: GuideModuleMeta): string {
  if (isModuleLocked(module)) return GUIDE_TEXT.vipOnly
  if (moduleFailed(module)) return '加载失败'
  const count = moduleCount(module)
  return count > 0 ? GUIDE_TEXT.itemCount(count) : GUIDE_TEXT.noContent
}

function moduleBadge(module: GuideModuleMeta): string {
  if (isModuleLocked(module)) return 'VIP'
  if (moduleFailed(module)) return '!'
  const count = moduleCount(module)
  return count > 0 ? String(count) : '—'
}

function moduleFailed(module: GuideModuleMeta): boolean {
  return failed[module.category] && !loaded[module.category]
}

const activeModule = computed(
  () => GUIDE_MODULES.find((module) => module.key === activeModuleKey.value) ?? null,
)

const availableModules = computed(() =>
  GUIDE_MODULES.filter((module) => !isModuleLocked(module) && moduleCount(module) > 0),
)
const totalAvailable = computed(() => availableModules.value.length)
const hasAnyGuide = computed(() => totalAvailable.value > 0)
const lockedCount = computed(() => GUIDE_MODULES.filter((module) => module.vip).length)

const directoryGroups = computed(() =>
  Object.values(GUIDE_GROUPS).map((group) => ({
    group,
    modules: GUIDE_MODULES.filter((module) => module.group === group.key),
  })),
)

const pagedModules = computed(() => {
  const start = (allPage.value - 1) * pageSize
  return GUIDE_MODULES.slice(start, start + pageSize).map((module, index) => ({
    module,
    index: start + index,
  }))
})

function padIndex(value: number) {
  return String(value).padStart(2, '0')
}

async function fetchCategory(category: GuideCategoryApi, force = false, notify = false) {
  if (category === 'academic' && !props.isVip) return
  if (loading[category]) return
  if (loaded[category] && !force) return

  loading[category] = true
  failed[category] = false
  try {
    const res = await CATEGORY_FETCHERS[category](props.universityId)
    data[category] = (res?.data?.data ?? null) as GuideCategoryVO | null
    loaded[category] = true
  } catch (err: any) {
    const message = err?.response?.data?.msg || err?.message || '获取指南内容失败'
    if (category === 'academic' && /VIP|会员|旗舰版/.test(message)) {
      academicDenied.value = true
      data.academic = null
      loaded.academic = true
      failed.academic = false
    } else {
      failed[category] = true
      if (notify) ElMessage.error(message)
    }
  } finally {
    loading[category] = false
  }
}

async function loadAll() {
  initialLoading.value = true
  await Promise.all(CATEGORY_KEYS.map((category) => fetchCategory(category)))
  initialLoading.value = false
}

function retryAll() {
  CATEGORY_KEYS.forEach((category) => {
    failed[category] = false
  })
  loadAll()
}

function retryCategory(category: GuideCategoryApi) {
  failed[category] = false
  fetchCategory(category, true, true)
}

async function fetchRailGallery() {
  galleryLoading.value = true
  try {
    const res = await getCampusGallery(props.universityId, { page: 1, size: 10 })
    galleryImages.value = (res.data.data.records || []).slice(0, 4)
  } catch {
    galleryImages.value = []
  } finally {
    galleryLoading.value = false
  }
}

async function fetchOverviewTags() {
  try {
    const res = await getGuideOverview(props.universityId)
    fetchedTags.value = res.data.data.customTags || []
  } catch {
    fetchedTags.value = []
  }
}

function scrollToMain() {
  nextTick(() => {
    mainRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function selectModule(key: string) {
  if (!hasAnyGuide.value) return
  activeModuleKey.value = key
  scrollToMain()
}

function backToAll() {
  activeModuleKey.value = null
  scrollToMain()
}

function onMobileChange(value: string) {
  if (!value) {
    backToAll()
    return
  }
  if (!hasAnyGuide.value) {
    mobileValue.value = ''
    return
  }
  activeModuleKey.value = value
  scrollToMain()
}

function onAllPageChange(page: number) {
  allPage.value = page
  scrollToMain()
}

function handleTool(tool: QuickToolMeta) {
  if (tool.to) {
    router.push(tool.to)
    return
  }
  if (tool.action === 'expert') {
    expert.open()
    return
  }
  ElMessage.info(GUIDE_TEXT.comingSoon)
}

function resetData() {
  CATEGORY_KEYS.forEach((category) => {
    data[category] = null
    loaded[category] = false
    failed[category] = false
    loading[category] = false
  })
  activeModuleKey.value = null
  allPage.value = 1
  academicDenied.value = false
  galleryImages.value = []
  fetchedTags.value = []
}

watch(activeModuleKey, (value) => {
  mobileValue.value = value ?? ''
})

watch(
  () => props.isVip,
  (value) => {
    if (!value) return
    academicDenied.value = false
    fetchCategory('academic', true)
  },
)

watch(
  () => props.universityId,
  (value) => {
    if (!value) return
    resetData()
    loadAll()
    fetchRailGallery()
    fetchOverviewTags()
  },
)

onMounted(() => {
  loadAll()
  fetchRailGallery()
  fetchOverviewTags()
})
</script>

<template>
  <div
    ref="guideRoot"
    class="guide-tab"
    :style="{ '--guide-sticky-top': `${stickyTop}px` }"
  >
    <div class="guide-mobile-nav">
      <span class="guide-mobile-nav__label">指南目录</span>
      <el-select
        v-model="mobileValue"
        class="guide-mobile-select"
        placeholder="全部指南"
        @change="onMobileChange"
      >
        <el-option label="全部指南" value="" />
        <el-option-group
          v-for="item in directoryGroups"
          :key="item.group.key"
          :label="item.group.label"
        >
          <el-option
            v-for="module in item.modules"
            :key="module.key"
            :label="module.label"
            :value="module.key"
            :disabled="!hasAnyGuide"
          />
        </el-option-group>
      </el-select>
    </div>

    <div class="guide-layout">
      <aside class="guide-directory">
        <div class="dir-head">
          <div class="dir-title">指南目录</div>
          <div class="dir-count">{{ GUIDE_TEXT.totalModules(totalAvailable) }}</div>
        </div>

        <button
          class="dir-all"
          :class="{ 'is-active': activeModuleKey === null }"
          @click="backToAll"
        >
          <span class="dir-all__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
            </svg>
          </span>
          <span class="dir-all__label">{{ GUIDE_TEXT.allGuide }}</span>
          <span class="dir-all__count">{{ totalAvailable }}</span>
        </button>

        <div
          v-for="item in directoryGroups"
          :key="item.group.key"
          class="dir-group"
        >
          <div class="dir-group__label">
            <span class="dir-group__dot" :style="{ background: item.group.color }"></span>
            <span>{{ item.group.label }}</span>
          </div>
          <button
            v-for="module in item.modules"
            :key="module.key"
            class="dir-item"
            :class="{
              'is-active': activeModuleKey === module.key,
              'is-locked': isModuleLocked(module),
              'is-muted': !hasAnyGuide,
            }"
            :style="{ '--group-color': item.group.color }"
            :disabled="!hasAnyGuide"
            @click="selectModule(module.key)"
          >
            <span class="dir-item__icon" :style="{ background: item.group.soft, color: item.group.color }">
              <GuideIcon :name="module.icon" :size="15" />
            </span>
            <span class="dir-item__label">{{ module.label }}</span>
            <span
              class="dir-item__badge"
              :class="{
                'is-vip': isModuleLocked(module),
                'is-error': !isModuleLocked(module) && moduleFailed(module),
                'is-empty': !isModuleLocked(module) && !moduleFailed(module) && moduleCount(module) === 0,
              }"
            >
              {{ moduleBadge(module) }}
            </span>
          </button>
        </div>

        <div v-if="!isVip" class="dir-vip">
          <span class="dir-vip__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 10V8a6 6 0 1112 0v2" />
              <path d="M5 10h14v10H5z" />
              <path d="M12 14v2" />
            </svg>
          </span>
          <div class="dir-vip__body">
            <span class="dir-vip__title">旗舰版专享</span>
            <span class="dir-vip__desc">解锁 {{ lockedCount }} 个学业规划模块</span>
          </div>
          <button class="dir-vip__action" @click="recharge.open()">开通</button>
        </div>
      </aside>

      <main
        ref="mainRef"
        v-loading="initialLoading"
        class="guide-main"
        element-loading-text="加载指南内容..."
        element-loading-background="rgba(248, 250, 252, 0.72)"
      >
        <div v-if="allFailed" class="empty-panel empty-panel--error">
          <span class="empty-panel__icon empty-panel__icon--rose">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 8v4M12 16h.01" />
              <path d="M10.3 3.6L2.6 17a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 3.6a2 2 0 00-3.4 0z" />
            </svg>
          </span>
          <h3>指南内容加载失败</h3>
          <p>请检查网络后重试，或稍后再来查看。</p>
          <button class="primary-btn" @click="retryAll">重新加载</button>
        </div>

        <div v-else-if="!hasAnyGuide" class="empty-panel guide-empty">
          <span class="empty-panel__icon empty-panel__icon--blue">
            <GuideIcon name="books" :size="34" />
          </span>
          <h3>{{ GUIDE_TEXT.guideEmpty }}</h3>
          <p>我们正在收集整理这所院校的适应指南，请稍后再来看看。</p>
          <button v-if="failedCount" class="ghost-btn" @click="retryAll">重新加载</button>
          <button v-else-if="!isVip" class="ghost-btn" @click="recharge.open()">
            旗舰版可提前查看学业规划内容
          </button>
        </div>

        <template v-else-if="activeModule">
          <button class="back-link" @click="backToAll">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            {{ GUIDE_TEXT.backToAll }}
          </button>

          <section class="module-hero">
            <span
              class="module-hero__icon"
              :style="{
                background: GUIDE_GROUPS[activeModule.group].soft,
                color: GUIDE_GROUPS[activeModule.group].color,
              }"
            >
              <GuideIcon :name="activeModule.icon" :size="28" />
            </span>
            <div class="module-hero__body">
              <div class="module-hero__title-row">
                <h2>{{ activeModule.label }}</h2>
                <span
                  class="micro-tag"
                  :style="{
                    color: GUIDE_GROUPS[activeModule.group].color,
                    background: GUIDE_GROUPS[activeModule.group].soft,
                  }"
                >
                  {{ GUIDE_GROUPS[activeModule.group].label }}
                </span>
                <span v-if="isModuleLocked(activeModule)" class="micro-tag micro-tag--amber">
                  {{ GUIDE_TEXT.vipOnly }}
                </span>
              </div>
              <p>{{ activeModule.desc }}</p>
            </div>
            <span class="module-hero__status">{{ moduleStatusText(activeModule) }}</span>
          </section>

          <div v-if="moduleFailed(activeModule)" class="empty-panel empty-panel--error">
            <h3>该模块加载失败</h3>
            <p>网络开小差了，请重新加载。</p>
            <button class="ghost-btn" @click="retryCategory(activeModule.category)">重新加载</button>
          </div>

          <div v-else-if="isModuleLocked(activeModule)" class="lock-panel">
            <span class="lock-panel__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 10V8a6 6 0 1112 0v2" />
                <path d="M5 10h14v10H5z" />
                <path d="M12 14v2" />
              </svg>
            </span>
            <h3>{{ GUIDE_TEXT.lockedTitle }}</h3>
            <p>{{ GUIDE_TEXT.lockedDesc }}</p>
            <button class="primary-btn" @click="recharge.open()">{{ GUIDE_TEXT.lockedAction }}</button>
          </div>

          <div v-else-if="moduleSections(activeModule).length" class="content-card">
            <section
              v-for="(section, index) in moduleSections(activeModule)"
              :key="section.label"
              class="content-block"
              :class="{ 'is-first': index === 0 }"
            >
              <h3 class="content-block__title">
                <span
                  class="content-block__dot"
                  :style="{ background: GUIDE_GROUPS[activeModule.group].color }"
                ></span>
                {{ section.label }}
              </h3>
              <ul class="content-list">
                <li v-for="(item, itemIndex) in section.items" :key="itemIndex">
                  <span
                    class="content-list__dot"
                    :style="{ background: GUIDE_GROUPS[activeModule.group].color }"
                  ></span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>
          </div>

          <div v-else class="empty-panel">
            <span class="empty-panel__icon empty-panel__icon--blue">
              <GuideIcon :name="activeModule.icon" :size="32" />
            </span>
            <h3>{{ GUIDE_TEXT.moduleEmpty }}</h3>
            <p>我们正在补充该模块的详细内容，请稍后再来看看。</p>
          </div>
        </template>

        <template v-else>
          <section class="hot-card">
            <div class="hot-card__glow" aria-hidden="true"></div>
            <div class="hot-card__content">
              <div class="hot-card__eyebrow">
                <GuideIcon name="sparkles" :size="14" />
                <span>热门指南</span>
              </div>
              <h2 class="hot-card__title">
                {{ universityName || '这所院校' }}新生入学，这些指南最常被查看
              </h2>
              <p class="hot-card__sub">从报到入学到日常起居，提前了解校园生活的关键信息。</p>
              <div class="hot-pills">
                <button
                  v-for="pill in HOT_GUIDE_PILLS"
                  :key="pill.moduleKey"
                  class="hot-pill"
                  @click="selectModule(pill.moduleKey)"
                >
                  {{ pill.label }}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="hot-card__mark" aria-hidden="true">
              <GuideIcon name="cap" :size="72" />
            </div>
          </section>

          <div class="section-head">
            <div>
              <h2 class="section-title">{{ GUIDE_TEXT.allGuide }}</h2>
              <p class="section-sub">
                {{ GUIDE_TEXT.totalModules(totalAvailable) }}
                <button v-if="!isVip" class="vip-inline" @click="recharge.open()">
                  另有 {{ lockedCount }} 个旗舰版模块
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </p>
            </div>
          </div>

          <div v-if="overviewTags.length" class="custom-tags">
            <span
              v-for="(tag, index) in overviewTags"
              :key="`${tag}-${index}`"
              class="custom-tag"
              :class="`custom-tag--tone-${index % 5}`"
            >
              {{ tag }}
            </span>
          </div>

          <div class="all-grid">
            <button
              v-for="item in pagedModules"
              :key="item.module.key"
              class="plan-card"
              :class="{
                'is-locked': isModuleLocked(item.module),
                'is-error': !isModuleLocked(item.module) && moduleFailed(item.module),
                'is-empty': !isModuleLocked(item.module) && !moduleFailed(item.module) && moduleCount(item.module) === 0,
              }"
              @click="selectModule(item.module.key)"
            >
              <span class="plan-card__icon-wrap">
                <span class="plan-card__index" :style="{ background: GUIDE_GROUPS[item.module.group].color }">
                  {{ padIndex(item.index + 1) }}
                </span>
                <span
                  class="plan-card__icon"
                  :style="{
                    background: GUIDE_GROUPS[item.module.group].soft,
                    color: GUIDE_GROUPS[item.module.group].color,
                  }"
                >
                  <GuideIcon :name="item.module.icon" :size="22" />
                </span>
              </span>

              <span class="plan-card__body">
                <span class="plan-card__title-row">
                  <span class="plan-card__title">{{ item.module.label }}</span>
                  <span
                    v-if="isModuleLocked(item.module)"
                    class="micro-tag micro-tag--amber"
                  >{{ GUIDE_TEXT.vipOnly }}</span>
                  <span
                    v-else
                    class="micro-tag"
                    :style="{
                      color: GUIDE_GROUPS[item.module.group].color,
                      background: GUIDE_GROUPS[item.module.group].soft,
                    }"
                  >{{ GUIDE_GROUPS[item.module.group].label }}</span>
                  <svg class="plan-card__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
                <span class="plan-card__desc">{{ item.module.desc }}</span>
                <span class="plan-card__footer">
                  <span class="plan-card__count">{{ moduleStatusText(item.module) }}</span>
                  <span class="plan-card__more">
                    {{ isModuleLocked(item.module) ? '解锁查看' : moduleFailed(item.module) ? '重新加载' : '查看指南' }}
                  </span>
                </span>
              </span>
            </button>
          </div>

          <div v-if="GUIDE_MODULES.length > pageSize" class="all-pagination">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="GUIDE_MODULES.length"
              :page-size="pageSize"
              :current-page="allPage"
              @current-change="onAllPageChange"
            />
          </div>
        </template>
      </main>

      <aside class="guide-rail">
        <section class="rail-card">
          <div class="rail-card__head">
            <h3>校园风光</h3>
            <button class="rail-more" @click="emit('open-gallery')">
              查看更多
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <div v-if="galleryImages.length" class="rail-gallery">
            <button
              v-for="(image, index) in galleryImages"
              :key="`${image.imageUrl}-${index}`"
              class="rail-thumb"
              @click="emit('open-gallery')"
            >
              <img :src="image.imageUrl" :alt="`校园风光 ${index + 1}`" loading="lazy" />
              <span class="rail-thumb__mask">查看</span>
            </button>
          </div>
          <div v-else class="rail-gallery-empty">
            <GuideIcon name="building" :size="24" />
            <span>{{ galleryLoading ? '加载中...' : '暂无校园风光' }}</span>
            <button v-if="!galleryLoading" class="rail-ghost-btn" @click="emit('open-gallery')">
              去看看
            </button>
          </div>
        </section>

        <section class="rail-card">
          <div class="rail-card__head">
            <h3>快捷工具</h3>
          </div>
          <div class="quick-list">
            <button
              v-for="tool in QUICK_TOOLS"
              :key="tool.key"
              class="quick-item"
              :class="`tone-${tool.tone}`"
              @click="handleTool(tool)"
            >
              <span class="quick-item__icon">
                <GuideIcon :name="tool.icon" :size="17" />
              </span>
              <span class="quick-item__body">
                <span class="quick-item__label">{{ tool.label }}</span>
                <span class="quick-item__desc">{{ tool.desc }}</span>
              </span>
              <svg class="quick-item__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </section>

        <button class="rail-back" @click="emit('open-overview')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          返回院校详情
        </button>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.guide-tab {
  --guide-ink: #0f172a;
  --guide-body: #475569;
  --guide-muted: #64748b;
  --guide-faint: #94a3b8;
  --guide-line: rgba(15, 23, 42, 0.05);
  --guide-soft-line: #f1f5f9;
  position: relative;
  color: var(--guide-ink);
  padding-bottom: 8px;
}

.guide-layout {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr) 292px;
  gap: 24px;
  align-items: start;
}

/* ===== 左侧目录 ===== */
.guide-directory {
  position: sticky;
  top: var(--guide-sticky-top);
  max-height: calc(100vh - var(--guide-sticky-top) - 24px);
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid var(--guide-line);
  border-radius: 16px;
  padding: 14px 12px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.dir-head {
  padding: 2px 6px 10px;
  border-bottom: 1px solid var(--guide-soft-line);
  margin-bottom: 8px;
}

.dir-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.dir-count {
  margin-top: 2px;
  font-size: 12px;
  color: var(--guide-faint);
}

.dir-all {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #334155;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease, color 0.2s ease;
}

.dir-all:hover {
  background: #f8fafc;
}

.dir-all.is-active {
  background: #fff7ed;
  color: #ea580c;
}

.dir-all__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
}

.dir-all.is-active .dir-all__icon {
  background: #ffffff;
  color: #f97316;
}

.dir-all__icon svg {
  width: 16px;
  height: 16px;
}

.dir-all__label {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
}

.dir-all__count {
  min-width: 20px;
  padding: 1px 6px;
  border-radius: 9999px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.dir-all.is-active .dir-all__count {
  background: rgba(249, 115, 22, 0.12);
  color: #ea580c;
}

.dir-group {
  margin-top: 2px;
}

.dir-group__label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 8px 5px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.dir-group__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex: 0 0 6px;
}

.dir-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 8px;
  border: none;
  border-radius: 9px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease, color 0.2s ease;
}

.dir-item:hover:not(:disabled) {
  background: #f8fafc;
}

.dir-item.is-active {
  background: #f8fafc;
}

.dir-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 2px;
  background: var(--group-color);
}

.dir-item:disabled {
  cursor: default;
}

.dir-item.is-muted {
  opacity: 0.55;
}

.dir-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border-radius: 7px;
}

.dir-item__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}

.dir-item.is-active .dir-item__label {
  color: var(--group-color);
  font-weight: 700;
}

.dir-item__badge {
  flex: 0 0 auto;
  min-width: 18px;
  padding: 1px 5px;
  border-radius: 9999px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
}

.dir-item__badge.is-vip {
  background: #fffbeb;
  color: #b45309;
}

.dir-item__badge.is-empty {
  background: transparent;
  color: #cbd5e1;
}

.dir-item__badge.is-error {
  background: #fff1f2;
  color: #e11d48;
}

.dir-vip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 9px 10px;
  border-radius: 10px;
  background: #f8fafc;
}

.dir-vip__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border-radius: 7px;
  background: #ffffff;
  color: #d97706;
}

.dir-vip__icon svg {
  width: 15px;
  height: 15px;
}

.dir-vip__body {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 1px;
}

.dir-vip__title {
  font-size: 11px;
  font-weight: 700;
  color: #92400e;
}

.dir-vip__desc {
  font-size: 10px;
  color: #a16207;
}

.dir-vip__action {
  flex: 0 0 auto;
  padding: 4px 8px;
  border: none;
  border-radius: 7px;
  background: #f59e0b;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dir-vip__action:hover {
  background: #d97706;
}

/* ===== 主内容 ===== */
.guide-main {
  position: relative;
  min-width: 0;
  min-height: 320px;
  scroll-margin-top: calc(var(--guide-sticky-top) + 12px);
}

.guide-main :deep(.el-loading-spinner .el-loading-text) {
  color: #64748b;
  font-size: 13px;
}

.guide-main :deep(.el-loading-spinner .path) {
  stroke: #f97316;
}

/* 热门指南 */
.hot-card {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  border: 1px solid rgba(249, 115, 22, 0.12);
  border-radius: 16px;
  background: linear-gradient(120deg, #fff7ed 0%, #ffffff 58%, #f8fafc 100%);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 6px 22px -8px rgba(249, 115, 22, 0.14);
}

.hot-card__glow {
  position: absolute;
  right: -40px;
  top: -60px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.14) 0%, rgba(249, 115, 22, 0) 70%);
  pointer-events: none;
}

.hot-card__content {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
}

.hot-card__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(249, 115, 22, 0.1);
  color: #c2410c;
  font-size: 11px;
  font-weight: 700;
}

.hot-card__title {
  margin-top: 8px;
  font-size: 18px;
  line-height: 1.45;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #0f172a;
}

.hot-card__sub {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}

.hot-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.hot-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  background: #ffffff;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.hot-pill svg {
  width: 11px;
  height: 11px;
  color: #94a3b8;
  transition: color 0.2s ease, transform 0.2s ease;
}

.hot-pill:hover {
  border-color: rgba(249, 115, 22, 0.38);
  background: #fff7ed;
  color: #ea580c;
}

.hot-pill:hover svg {
  color: #ea580c;
  transform: translateX(2px);
}

.hot-card__mark {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  flex: 0 0 96px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.66);
  color: rgba(249, 115, 22, 0.34);
}

/* 全部指南标题 */
.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin: 22px 2px 10px;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #0f172a;
}

.section-sub {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.vip-inline {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 7px;
  border: none;
  border-radius: 6px;
  background: #fffbeb;
  color: #b45309;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.vip-inline svg {
  width: 10px;
  height: 10px;
}

.vip-inline:hover {
  background: #fef3c7;
}

.custom-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 2px 14px;
}

.custom-tag {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
}

.custom-tag--tone-0 {
  background: #fff7ed;
  color: #c2410c;
}

.custom-tag--tone-1 {
  background: #eff6ff;
  color: #2563eb;
}

.custom-tag--tone-2 {
  background: #ecfdf5;
  color: #059669;
}

.custom-tag--tone-3 {
  background: #fffbeb;
  color: #b45309;
}

.custom-tag--tone-4 {
  background: #fff1f2;
  color: #be123c;
}

/* 指南卡片网格 */
.all-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.plan-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 15px 16px;
  border: 1px solid var(--guide-line);
  border-radius: 14px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 16px -6px rgba(15, 23, 42, 0.05);
  transition: transform 0.24s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.24s ease, border-color 0.24s ease;
}

.plan-card:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.22);
  box-shadow:
    0 4px 12px rgba(15, 23, 42, 0.04),
    0 12px 28px -8px rgba(249, 115, 22, 0.12);
}

.plan-card.is-locked {
  background: #fcfcfd;
}

.plan-card.is-empty {
  background: #fcfcfd;
}

.plan-card__icon-wrap {
  position: relative;
  flex: 0 0 auto;
}

.plan-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 13px;
}

.plan-card__index {
  position: absolute;
  top: -6px;
  left: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 19px;
  height: 19px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
}

.plan-card__body {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.plan-card__title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.plan-card__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.plan-card__arrow {
  width: 14px;
  height: 14px;
  margin-left: auto;
  flex: 0 0 14px;
  color: #334155;
  transition: color 0.2s ease, transform 0.2s ease;
}

.plan-card:hover .plan-card__arrow {
  color: #ea580c;
  transform: translateX(2px);
}

.plan-card__desc {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}

.plan-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 2px;
}

.plan-card__count {
  font-size: 11px;
  color: #94a3b8;
}

.plan-card__more {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  transition: color 0.2s ease;
}

.plan-card:hover .plan-card__more {
  color: #ea580c;
}

.plan-card.is-locked .plan-card__more {
  color: #b45309;
}

.micro-tag {
  flex: 0 0 auto;
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.5;
  white-space: nowrap;
}

.micro-tag--amber {
  background: #fffbeb;
  color: #b45309;
}

.all-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.all-pagination :deep(.el-pagination.is-background .el-pager li) {
  border-radius: 8px;
  font-size: 12px;
}

.all-pagination :deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #f97316;
}

/* ===== 模块详情 ===== */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 12px;
  padding: 5px 9px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

.back-link svg {
  width: 15px;
  height: 15px;
}

.back-link:hover {
  background: #f1f5f9;
  color: #ea580c;
}

.module-hero {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid var(--guide-line);
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
}

.module-hero__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  border-radius: 15px;
}

.module-hero__body {
  flex: 1;
  min-width: 0;
}

.module-hero__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.module-hero__title-row h2 {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #0f172a;
}

.module-hero__body p {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}

.module-hero__status {
  flex: 0 0 auto;
  padding: 4px 9px;
  border-radius: 6px;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.content-card {
  margin-top: 14px;
  padding: 6px 20px 20px;
  border: 1px solid var(--guide-line);
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
}

.content-block {
  padding-top: 18px;
  border-top: 1px solid var(--guide-soft-line);
}

.content-block.is-first {
  border-top: none;
}

.content-block__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.content-block__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex: 0 0 6px;
}

.content-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 10px;
  padding-left: 2px;
}

.content-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.75;
  color: #475569;
  white-space: pre-wrap;
  word-break: break-word;
}

.content-list__dot {
  width: 4px;
  height: 4px;
  margin-top: 8px;
  border-radius: 50%;
  flex: 0 0 4px;
  opacity: 0.55;
}

/* ===== 付费墙 ===== */
.lock-panel {
  position: relative;
  overflow: hidden;
  margin-top: 14px;
  padding: 34px 24px;
  border: 1px solid rgba(245, 158, 11, 0.18);
  border-radius: 16px;
  background: linear-gradient(135deg, #fffbeb 0%, #ffffff 60%, #fff7ed 100%);
  text-align: center;
}

.lock-panel__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #ffffff;
  color: #d97706;
  box-shadow: 0 4px 16px -6px rgba(217, 119, 6, 0.28);
}

.lock-panel__icon svg {
  width: 26px;
  height: 26px;
}

.lock-panel h3 {
  margin-top: 14px;
  font-size: 17px;
  font-weight: 800;
  color: #1e293b;
}

.lock-panel p {
  max-width: 420px;
  margin: 6px auto 0;
  font-size: 13px;
  line-height: 1.7;
  color: #64748b;
}

/* ===== 空态 / 错误 ===== */
.empty-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  padding: 40px 24px;
  border: 1px solid var(--guide-line);
  border-radius: 16px;
  background: #ffffff;
  text-align: center;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
}

.empty-panel__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: #f8fafc;
  color: #94a3b8;
}

.empty-panel__icon--blue {
  background: #eff6ff;
  color: #2563eb;
}

.empty-panel__icon--rose {
  background: #fff1f2;
  color: #e11d48;
}

.empty-panel h3 {
  margin-top: 14px;
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
}

.empty-panel p {
  max-width: 380px;
  margin-top: 5px;
  font-size: 13px;
  line-height: 1.7;
  color: #64748b;
}

.empty-panel--error {
  border-color: rgba(225, 29, 72, 0.14);
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  padding: 9px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #f97316, #ea580c);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 16px -8px rgba(234, 88, 12, 0.55);
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.primary-btn:hover {
  background: linear-gradient(90deg, #ea580c, #c2410c);
  box-shadow: 0 8px 20px -8px rgba(194, 65, 12, 0.55);
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.ghost-btn:hover {
  border-color: rgba(249, 115, 22, 0.35);
  background: #fff7ed;
  color: #ea580c;
}

/* ===== 右侧栏 ===== */
.guide-rail {
  position: sticky;
  top: var(--guide-sticky-top);
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  max-height: calc(100vh - var(--guide-sticky-top) - 24px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.rail-card {
  padding: 14px;
  border: 1px solid var(--guide-line);
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
}

.rail-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.rail-card__head h3 {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.rail-more {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #ea580c;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.rail-more svg {
  width: 10px;
  height: 10px;
  transition: transform 0.2s ease;
}

.rail-more:hover {
  background: #fff7ed;
}

.rail-more:hover svg {
  transform: translateX(2px);
}

.rail-gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}

.rail-thumb {
  position: relative;
  overflow: hidden;
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  padding: 0;
  border: none;
  border-radius: 9px;
  background: #f1f5f9;
  cursor: pointer;
}

.rail-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.2s ease;
}

.rail-thumb__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.35);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.rail-thumb:hover .rail-thumb__mask {
  opacity: 1;
}

.rail-gallery-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 118px;
  border-radius: 10px;
  background: #f8fafc;
  color: #94a3b8;
  font-size: 11px;
}

.rail-ghost-btn {
  display: block;
  margin: 10px auto 0;
  padding: 5px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  background: #ffffff;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.rail-ghost-btn:hover {
  border-color: rgba(249, 115, 22, 0.35);
  color: #ea580c;
}

.quick-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.quick-item:hover {
  background: #f8fafc;
}

.quick-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 9px;
}

.quick-item.tone-blue .quick-item__icon {
  background: #eff6ff;
  color: #2563eb;
}

.quick-item.tone-violet .quick-item__icon {
  background: #f5f3ff;
  color: #7c3aed;
}

.quick-item.tone-orange .quick-item__icon {
  background: #fff7ed;
  color: #ea580c;
}

.quick-item.tone-green .quick-item__icon {
  background: #ecfdf5;
  color: #059669;
}

.quick-item.tone-rose .quick-item__icon {
  background: #fff1f2;
  color: #e11d48;
}

.quick-item__body {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 1px;
}

.quick-item__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.quick-item__desc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  color: #94a3b8;
}

.quick-item__arrow {
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  color: #cbd5e1;
  transition: color 0.2s ease, transform 0.2s ease;
}

.quick-item:hover .quick-item__arrow {
  color: #ea580c;
  transform: translateX(2px);
}

.rail-back {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.rail-back svg {
  width: 14px;
  height: 14px;
}

.rail-back:hover {
  border-color: rgba(249, 115, 22, 0.35);
  background: #fff7ed;
  color: #ea580c;
}

/* ===== 移动端目录 ===== */
.guide-mobile-nav {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.guide-mobile-nav__label {
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.guide-mobile-select {
  flex: 1;
  min-width: 0;
}

.guide-mobile-select :deep(.el-select__wrapper) {
  min-height: 38px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
}

/* ===== 响应式 ===== */
@media (max-width: 1199px) {
  .guide-layout {
    grid-template-columns: 210px minmax(0, 1fr);
  }

  .guide-rail {
    position: static;
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    max-height: none;
    overflow: visible;
  }

  .rail-back {
    grid-column: 1 / -1;
  }
}

@media (max-width: 1023px) {
  .guide-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }

  .guide-directory {
    display: none;
  }

  .guide-mobile-nav {
    display: flex;
  }

  .guide-rail {
    margin-top: 16px;
  }
}

@media (max-width: 767px) {
  .hot-card {
    padding: 16px;
  }

  .hot-card__title {
    font-size: 16px;
  }

  .hot-card__mark {
    display: none;
  }

  .all-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .guide-rail {
    grid-template-columns: minmax(0, 1fr);
  }

  .module-hero {
    flex-wrap: wrap;
    padding: 15px 16px;
  }

  .module-hero__status {
    display: none;
  }

  .content-card {
    padding: 4px 16px 16px;
  }

  .lock-panel {
    padding: 26px 18px;
  }
}
</style>
