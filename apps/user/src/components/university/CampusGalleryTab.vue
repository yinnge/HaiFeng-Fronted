<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getCampusGallery, getGalleryTypes } from '@/api/university'
import type { GalleryItemVO } from '@/types/university'

const props = withDefaults(
  defineProps<{
    universityId: string
    universityName?: string
  }>(),
  {
    universityName: '',
  },
)

const pageSize = 20

const images = ref<GalleryItemVO[]>([])
const types = ref<string[]>([])
const total = ref(0)
const page = ref(1)
const activeType = ref('')
const loading = ref(false)
const viewerVisible = ref(false)
const viewerIndex = ref(0)

const imageUrls = computed(() => images.value.map((image) => image.imageUrl))
const availableTypes = computed(() => {
  const merged = [...types.value]
  images.value.forEach((image) => {
    if (image.imageType && !merged.includes(image.imageType)) merged.push(image.imageType)
  })
  return merged
})

async function fetchTypes() {
  try {
    const res = await getGalleryTypes(props.universityId)
    types.value = (res.data.data || []).filter((type) => !!type)
  } catch {
    types.value = []
  }
}

async function fetchGallery() {
  loading.value = true
  try {
    const res = await getCampusGallery(props.universityId, {
      page: page.value,
      size: pageSize,
      imageType: activeType.value || undefined,
    })
    images.value = res.data.data.records || []
    total.value = res.data.data.total || 0
  } catch (err: any) {
    const message = err?.response?.data?.msg || err?.message || '获取校园风光失败'
    ElMessage.error(message)
    images.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function switchType(type: string) {
  if (activeType.value === type) return
  activeType.value = type
  page.value = 1
  fetchGallery()
}

function onPageChange(value: number) {
  page.value = value
  fetchGallery()
}

function openViewer(index: number) {
  viewerIndex.value = index
  viewerVisible.value = true
}

function resetData() {
  images.value = []
  types.value = []
  total.value = 0
  page.value = 1
  activeType.value = ''
  viewerVisible.value = false
}

watch(
  () => props.universityId,
  (value) => {
    if (!value) return
    resetData()
    fetchTypes()
    fetchGallery()
  },
)

onMounted(() => {
  fetchTypes()
  fetchGallery()
})
</script>

<template>
  <div class="gallery-tab">
    <div class="gallery-head">
      <div class="gallery-head__main">
        <h2>校园风光</h2>
        <p>漫步校园，感受真实的学习与生活氛围。</p>
      </div>
      <div class="gallery-head__count">
        <span class="gallery-head__count-num">{{ total }}</span>
        <span class="gallery-head__count-label">张照片</span>
      </div>
    </div>

    <div class="gallery-filters">
      <button
        class="filter-pill"
        :class="{ 'is-active': activeType === '' }"
        @click="switchType('')"
      >
        全部
      </button>
      <button
        v-for="type in availableTypes"
        :key="type"
        class="filter-pill"
        :class="{ 'is-active': activeType === type }"
        @click="switchType(type)"
      >
        {{ type }}
      </button>
    </div>

    <div v-if="loading && !images.length" class="gallery-skeleton">
      <span v-for="index in 8" :key="index" class="gallery-skeleton__block"></span>
    </div>

    <div v-else-if="!images.length && !loading" class="gallery-empty">
      <span class="gallery-empty__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="M21 15l-4.5-4.5L9 18" />
        </svg>
      </span>
      <h3>暂无校园风光</h3>
      <p>这所院校的校园照片正在整理中，请稍后再来看看。</p>
    </div>

    <div v-else v-loading="loading" class="gallery-grid">
      <button
        v-for="(image, index) in images"
        :key="`${image.imageUrl}-${index}`"
        class="gallery-item"
        @click="openViewer(index)"
      >
        <img
          :src="image.imageUrl"
          :alt="`${universityName || '院校'}校园风光 ${index + 1}`"
          loading="lazy"
        />
        <span v-if="image.imageType" class="gallery-item__type">{{ image.imageType }}</span>
        <span class="gallery-item__mask">
          <span class="gallery-item__zoom">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5L21 21M8 11h6M11 8v6" />
            </svg>
            查看大图
          </span>
        </span>
      </button>
    </div>

    <div v-if="total > pageSize" class="gallery-pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @current-change="onPageChange"
      />
    </div>

    <el-image-viewer
      v-if="viewerVisible"
      :url-list="imageUrls"
      :initial-index="viewerIndex"
      :z-index="3000"
      @close="viewerVisible = false"
    />
  </div>
</template>

<style scoped>
.gallery-tab {
  padding-bottom: 8px;
}

.gallery-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.gallery-head__main h2 {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.gallery-head__main p {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.gallery-head__count {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex: 0 0 auto;
  padding: 6px 12px;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.05) inset;
}

.gallery-head__count-num {
  font-size: 18px;
  font-weight: 800;
  color: #ea580c;
}

.gallery-head__count-label {
  font-size: 11px;
  color: #94a3b8;
}

.gallery-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-pill {
  padding: 6px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.filter-pill:hover {
  border-color: rgba(249, 115, 22, 0.35);
  color: #ea580c;
}

.filter-pill.is-active {
  border-color: transparent;
  background: #fff7ed;
  color: #ea580c;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  min-height: 200px;
}

.gallery-item {
  position: relative;
  overflow: hidden;
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  padding: 0;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 14px;
  background: #f1f5f9;
  cursor: zoom-in;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 16px -6px rgba(15, 23, 42, 0.06);
  transition: box-shadow 0.24s ease, border-color 0.24s ease;
}

.gallery-item:hover {
  border-color: rgba(249, 115, 22, 0.24);
  box-shadow:
    0 4px 12px rgba(15, 23, 42, 0.04),
    0 12px 28px -10px rgba(249, 115, 22, 0.16);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.24s ease;
}

.gallery-item:hover img {
  opacity: 0.88;
}

.gallery-item__type {
  position: absolute;
  left: 9px;
  bottom: 9px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.56);
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.gallery-item__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.3);
  opacity: 0;
  transition: opacity 0.24s ease;
}

.gallery-item:hover .gallery-item__mask {
  opacity: 1;
}

.gallery-item__zoom {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.92);
  color: #1e293b;
  font-size: 11px;
  font-weight: 700;
}

.gallery-item__zoom svg {
  width: 13px;
  height: 13px;
}

.gallery-skeleton {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.gallery-skeleton__block {
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  background: linear-gradient(100deg, #f1f5f9 30%, #f8fafc 50%, #f1f5f9 70%);
  background-size: 200% 100%;
  animation: gallery-shimmer 1.4s ease infinite;
}

@keyframes gallery-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

.gallery-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 40px 24px;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 16px;
  background: #ffffff;
  text-align: center;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
}

.gallery-empty__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: #eff6ff;
  color: #2563eb;
}

.gallery-empty__icon svg {
  width: 32px;
  height: 32px;
}

.gallery-empty h3 {
  margin-top: 14px;
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
}

.gallery-empty p {
  margin-top: 5px;
  font-size: 13px;
  line-height: 1.7;
  color: #64748b;
}

.gallery-pagination {
  display: flex;
  justify-content: center;
  margin-top: 22px;
}

.gallery-pagination :deep(.el-pagination.is-background .el-pager li) {
  border-radius: 8px;
  font-size: 12px;
}

.gallery-pagination :deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #f97316;
}

@media (max-width: 1199px) {
  .gallery-grid,
  .gallery-skeleton {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .gallery-head {
    align-items: flex-start;
  }

  .gallery-head__main h2 {
    font-size: 20px;
  }

  .gallery-grid,
  .gallery-skeleton {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}
</style>
