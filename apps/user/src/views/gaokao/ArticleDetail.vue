<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getGaokaoArticleDetail, type GaokaoArticleDetailVO } from '@/api/article'
import { sanitizeArticleHtml } from '@/utils/sanitize'
import ArchiveBar from '@/components/gaokao/ArchiveBar.vue'
import { useGaokaoModuleNav } from '@/composables/useGaokaoModuleNav'
import '@/assets/styles/article-content.css'

const router = useRouter()
const route = useRoute()

/** 与 /gaokao、资讯列表 完全一致的模块导航（含「高中资料」+ 高中身份），保证各处小导航栏统一 */
const { HIGH_IDENTITIES, highIdentity, onHighIdentityChange, gaokaoExtraItems } = useGaokaoModuleNav()

const loading = ref(false)
const detail = ref<GaokaoArticleDetailVO | null>(null)

const articleId = computed(() => String(route.params.id || ''))

/**
 * 返回逻辑：从哪点进来就回哪（不回列表）。
 * - from=articles（资讯列表进入）→ 回 /gaokao/articles，按钮文案「返回资讯列表」；
 * - 其它（高考志愿 landing 等）→ 回 /gaokao，按钮文案「返回高考志愿」。
 */
const backFrom = computed(() => (route.query.from as string) || 'gaokao')
const backLabel = computed(() => (backFrom.value === 'articles' ? '返回资讯列表' : '返回高考志愿'))

/** 展示前前端再过一层 DOMPurify（双保险），并把 table 包上 .table-wrap */
const safeContent = computed(() => sanitizeArticleHtml(detail.value?.content))

const formatTime = (s: string | null) => (s ? s.replace('T', ' ').slice(0, 16) : '')

/** 图片点击放大：零依赖 lightbox（事件委托在正文容器上） */
const lightboxUrl = ref('')
const handleContentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.tagName === 'IMG') {
    lightboxUrl.value = (target as HTMLImageElement).src
  }
}
const closeLightbox = () => {
  lightboxUrl.value = ''
}

async function fetchDetail() {
  if (!articleId.value) return
  loading.value = true
  try {
    const res = await getGaokaoArticleDetail(articleId.value)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取资讯详情失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (backFrom.value === 'articles') {
    router.push('/gaokao/articles')
  } else {
    router.push('/gaokao')
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-surface-bg">
    <!-- 档案吸附条：与 /gaokao 完全一致的模块导航（含「高中资料」+ 高中身份），保证各处小导航栏统一 -->
    <ArchiveBar
      :extra-items="gaokaoExtraItems"
      :identity-options="HIGH_IDENTITIES"
      :identity="highIdentity"
      @identity-change="onHighIdentityChange"
    />
    <main class="flex-1">
      <div class="mx-auto max-w-4xl px-6 py-8">
        <!-- 返回 -->
        <button
          class="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-sem-blue"
          @click="goBack"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {{ backLabel }}
        </button>

        <div v-loading="loading" class="mt-5 min-h-[300px]">
          <template v-if="detail">
            <article class="rounded-2xl border border-surface-border bg-white p-6 shadow-hf md:p-10">
              <!-- 头部 -->
              <h1 class="text-2xl font-bold leading-snug text-gray-800 md:text-3xl">{{ detail.title }}</h1>
              <div class="mt-4 flex flex-wrap items-center gap-2">
                <span
                  v-if="detail.columnName"
                  class="inline-flex items-center rounded-md bg-sem-blue px-2.5 py-1 text-xs font-semibold text-white"
                >
                  {{ detail.columnName }}
                </span>
                <span
                  v-if="detail.province"
                  class="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                >
                  {{ detail.province }}
                </span>
                <span
                  v-if="detail.year != null"
                  class="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                >
                  {{ detail.year }} 年
                </span>
                <span class="text-xs text-gray-400">浏览 {{ detail.viewCount ?? 0 }}</span>
                <span v-if="detail.publishTime" class="text-xs text-gray-400">发布于 {{ formatTime(detail.publishTime) }}</span>
              </div>
              <p v-if="detail.summary" class="mt-4 rounded-r-lg border-l-[3px] border-sem-blue bg-sem-blue-bg px-4 py-3 text-sm leading-relaxed text-gray-600">
                {{ detail.summary }}
              </p>

              <el-divider class="!my-6" />

              <!-- 正文：v-html 不受 scoped 约束，样式走全局 .article-content -->
              <div class="article-content" v-html="safeContent" @click="handleContentClick"></div>
            </article>
          </template>

          <div v-else-if="!loading" class="rounded-2xl border border-surface-border bg-white py-20 text-center shadow-hf">
            <p class="text-sm text-gray-500">资讯不存在或已下架</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 图片放大遮罩 -->
    <div v-if="lightboxUrl" class="article-lightbox" @click="closeLightbox">
      <img :src="lightboxUrl" alt="图片预览" />
    </div>
  </div>
</template>

<style scoped>
/* 图片放大遮罩（本组件自身渲染，scoped 生效） */
.article-lightbox {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.article-lightbox img {
  max-width: 92vw;
  max-height: 92vh;
  border-radius: 8px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}
</style>
