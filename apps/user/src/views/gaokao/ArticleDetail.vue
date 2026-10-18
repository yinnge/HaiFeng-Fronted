<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getGaokaoArticleDetail, type GaokaoArticleDetailVO } from '@/api/article'
import { sanitizeArticleHtml } from '@/utils/sanitize'
import ArchiveBar from '@/components/gaokao/ArchiveBar.vue'
import '@/assets/styles/article-content.css'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<GaokaoArticleDetailVO | null>(null)

const articleId = computed(() => String(route.params.id || ''))

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
  router.push('/gaokao/articles')
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-brand-gray-50 via-orange-50/20 to-white">
    <!-- 档案吸附条：与 /gaokao、/gaokao/groups 共享的模块导航，「高考资讯」按路由精确高亮 -->
    <ArchiveBar />
    <main class="flex-1">
      <div class="mx-auto max-w-4xl px-6 py-8">
        <!-- 返回 -->
        <button
          class="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-brand-orange"
          @click="goBack"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          返回资讯列表
        </button>

        <div v-loading="loading" class="mt-5 min-h-[300px]">
          <template v-if="detail">
            <article class="rounded-2xl bg-white p-6 shadow-card border border-orange-100/70 md:p-10">
              <!-- 头部 -->
              <h1 class="text-2xl font-bold leading-snug text-gray-800 md:text-3xl">{{ detail.title }}</h1>
              <div class="mt-4 flex flex-wrap items-center gap-2">
                <span
                  v-if="detail.columnName"
                  class="inline-flex items-center rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-light px-3 py-1 text-xs font-semibold text-white"
                >
                  {{ detail.columnName }}
                </span>
                <span
                  v-if="detail.province"
                  class="inline-flex items-center rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-xs font-medium text-brand-orange border border-brand-orange/20"
                >
                  {{ detail.province }}
                </span>
                <span
                  v-if="detail.year != null"
                  class="inline-flex items-center rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-medium text-brand-blue border border-brand-blue/20"
                >
                  {{ detail.year }} 年
                </span>
                <span class="text-xs text-gray-400">浏览 {{ detail.viewCount ?? 0 }}</span>
                <span v-if="detail.publishTime" class="text-xs text-gray-400">发布于 {{ formatTime(detail.publishTime) }}</span>
              </div>
              <p v-if="detail.summary" class="mt-4 rounded-r-lg border-l-[3px] border-brand-orange-light bg-orange-50 px-4 py-3 text-sm leading-relaxed text-gray-600">
                {{ detail.summary }}
              </p>

              <el-divider class="!my-6" />

              <!-- 正文：v-html 不受 scoped 约束，样式走全局 .article-content -->
              <div class="article-content" v-html="safeContent" @click="handleContentClick"></div>
            </article>
          </template>

          <div v-else-if="!loading" class="py-20 text-center text-sm text-gray-400">资讯不存在或已下架</div>
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
