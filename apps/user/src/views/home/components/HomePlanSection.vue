<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAnnouncements } from '@/api/home'
import type { AnnouncementListVO } from '@/types/home'
import PlanMatrix from './PlanMatrix.vue'
import NoticePanel from './NoticePanel.vue'
import NoticeDetailDialog from './NoticeDetailDialog.vue'
import NoticeListDialog from './NoticeListDialog.vue'

const announcements = ref<AnnouncementListVO[]>([])
const loading = ref(false)
const detailVisible = ref(false)
const detailId = ref<string | null>(null)
const listVisible = ref(false)

const fetchAnnouncements = async () => {
  loading.value = true
  try {
    const res = await getAnnouncements({ page: 1, size: 10 })
    announcements.value = res.data.data.records
  } catch (e: any) {
    ElMessage.error(e?.message || '获取公告失败')
  } finally {
    loading.value = false
  }
}

function openDetail(id: string) {
  detailId.value = id
  detailVisible.value = true
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<template>
  <section class="home-plan-section">
    <div class="home-plan-grid">
      <div class="home-plan-grid__left">
        <PlanMatrix />
      </div>

      <NoticePanel
        :announcements="announcements"
        :loading="loading"
        @select="openDetail"
        @view-all="listVisible = true"
      />
    </div>

    <NoticeDetailDialog v-model="detailVisible" :announcement-id="detailId" />
    <NoticeListDialog v-model="listVisible" @select="openDetail" />
  </section>
</template>

<style scoped>
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
