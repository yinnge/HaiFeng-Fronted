<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
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

const leftRef = ref<HTMLElement | null>(null)
const leftHeight = ref(0)
const stacked = ref(false)

const PANEL_HEADER_HEIGHT = 52
const NOTICE_ITEM_HEIGHT = 40
const MIN_COUNT = 5
const MAX_COUNT = 10

const visibleCount = computed(() => {
  if (stacked.value) return MIN_COUNT
  const available = leftHeight.value - PANEL_HEADER_HEIGHT
  if (available <= 0) return MIN_COUNT
  const count = Math.floor(available / NOTICE_ITEM_HEIGHT)
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, count))
})

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

let resizeObserver: ResizeObserver | null = null
let mql: MediaQueryList | null = null

function applyStacked(e: MediaQueryList | MediaQueryListEvent) {
  stacked.value = e.matches
}

onMounted(async () => {
  fetchAnnouncements()

  if (typeof window !== 'undefined') {
    mql = window.matchMedia('(max-width: 1024px)')
    applyStacked(mql)
    mql.addEventListener('change', applyStacked)

    await nextTick()
    if (leftRef.value) {
      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (entry) leftHeight.value = entry.contentRect.height
      })
      resizeObserver.observe(leftRef.value)
      leftHeight.value = leftRef.value.getBoundingClientRect().height
    }
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  mql?.removeEventListener('change', applyStacked)
})
</script>

<template>
  <section class="home-plan-section reveal">
    <div class="home-plan-grid" :class="{ 'is-stacked': stacked }">
      <div ref="leftRef" class="home-plan-grid__left">
        <PlanMatrix />
      </div>

      <NoticePanel
        :announcements="announcements"
        :loading="loading"
        :visible-count="visibleCount"
        :panel-height="stacked ? null : leftHeight"
        :stacked="stacked"
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
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  align-items: start;
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
