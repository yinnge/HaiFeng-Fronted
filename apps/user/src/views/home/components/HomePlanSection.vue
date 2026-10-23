<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAnnouncements, getHomeArticleNews } from '@/api/home'
import type { AnnouncementListVO, HomeArticleNewsVO } from '@/types/home'
import PlanMatrix from './PlanMatrix.vue'
import AnnouncementBar from './AnnouncementBar.vue'
import NoticePanel from './NoticePanel.vue'
import NoticeDetailDialog from './NoticeDetailDialog.vue'
import NoticeListDialog from './NoticeListDialog.vue'
import ArticleDetailDialog from './ArticleDetailDialog.vue'
import ArticleListDialog from './ArticleListDialog.vue'

// ===== 公告（滚动条 + 公告弹窗）=====
const announcements = ref<AnnouncementListVO[]>([])
const loadingAnn = ref(false)
const annDetailVisible = ref(false)
const annDetailId = ref<string | null>(null)
const annListVisible = ref(false)

const fetchAnnouncements = async () => {
  loadingAnn.value = true
  try {
    const res = await getAnnouncements({ page: 1, size: 10 })
    announcements.value = res.data.data.records
  } catch (e: any) {
    ElMessage.error(e?.message || '获取公告失败')
  } finally {
    loadingAnn.value = false
  }
}

function openAnnDetail(id: string) {
  annDetailId.value = id
  annDetailVisible.value = true
}

// ===== 资讯（右侧面板 + 资讯弹窗）=====
const articles = ref<HomeArticleNewsVO[]>([])
const loadingArticle = ref(false)
const articleDetailVisible = ref(false)
const articleDetailId = ref<string | number | null>(null)
const articleListVisible = ref(false)

const fetchArticles = async () => {
  loadingArticle.value = true
  try {
    const res = await getHomeArticleNews({ page: 1, size: 10 })
    articles.value = res.data.data.records
  } catch (e: any) {
    ElMessage.error(e?.message || '获取资讯失败')
  } finally {
    loadingArticle.value = false
  }
}

function openArticleDetail(id: string | number) {
  articleDetailId.value = id
  articleDetailVisible.value = true
}

onMounted(() => {
  fetchAnnouncements()
  fetchArticles()
})
</script>

<template>
  <section class="home-plan-section">
    <!-- 滚动公告条（位于 5x2 导航矩阵上方） -->
    <AnnouncementBar
      :announcements="announcements"
      :loading="loadingAnn"
      @select="openAnnDetail"
      @view-all="annListVisible = true"
    />

    <div class="home-plan-grid">
      <div class="home-plan-grid__left">
        <PlanMatrix />
      </div>

      <NoticePanel
        :articles="articles"
        :loading="loadingArticle"
        @select="openArticleDetail"
        @view-all="articleListVisible = true"
      />
    </div>

    <!-- 公告弹窗 -->
    <NoticeDetailDialog v-model="annDetailVisible" :announcement-id="annDetailId" />
    <NoticeListDialog v-model="annListVisible" @select="openAnnDetail" />

    <!-- 资讯弹窗 -->
    <ArticleDetailDialog v-model="articleDetailVisible" :article-id="articleDetailId" />
    <ArticleListDialog v-model="articleListVisible" @select="openArticleDetail" />
  </section>
</template>

<style scoped>
.home-plan-section {
  display: flex;
  flex-direction: column;
}

.home-plan-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 1.5rem;
  align-items: stretch;
}

.home-plan-grid__left {
  min-width: 0;
}

@media (max-width: 1024px) {
  .home-plan-grid {
    grid-template-columns: 1fr;
  }
}
</style>
