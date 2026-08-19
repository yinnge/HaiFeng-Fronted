<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getChannelDetail, getChannelUniversityList } from '@/api/special'
import { ProvinceOptions } from '@haifeng/shared'
import { DisplayTypeLabel } from '@/types/special'
import type { SpecialChannelDetailVO, ChannelUniversityListVO } from '@/types/special'
import StrongBaseList from '@/components/gaokao/StrongBaseList.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<SpecialChannelDetailVO | null>(null)

// 关联大学
const univRecords = ref<ChannelUniversityListVO[]>([])
const univTotal = ref(0)
const univPage = ref(1)
const univPageSize = 10
const univLoading = ref(false)
const univRegionTag = ref('')
const univSignupStart = ref('')
const univSignupEnd = ref('')

// ===== 纯展示派生：地区 chip 云（聚合已加载记录的 regionTag 计数） =====
const regionTagCounts = computed(() => {
  const map = new Map<string, number>()
  for (const item of univRecords.value) {
    if (!item.regionTag) continue
    map.set(item.regionTag, (map.get(item.regionTag) || 0) + 1)
  }
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
})

// 点击地区 chip → 同步到地区筛选并搜索（复用原有搜索逻辑）
function onChipClick(tag: string) {
  univRegionTag.value = tag === univRegionTag.value ? '' : tag
  onUnivSearch()
}

async function fetchDetail() {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('通道ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getChannelDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取通道详情失败')
  } finally {
    loading.value = false
  }
}

async function fetchUniversityList() {
  if (!detail.value) return
  univLoading.value = true
  try {
    const res = await getChannelUniversityList({
      page: univPage.value,
      size: univPageSize,
      channelCode: detail.value.channelCode,
      regionTag: univRegionTag.value || undefined,
      signupStart: univSignupStart.value || undefined,
      signupEnd: univSignupEnd.value || undefined,
    })
    univRecords.value = res.data.data.records
    univTotal.value = res.data.data.total
  } catch {
    // 关联大学列表公开接口，不需要特殊处理
  } finally {
    univLoading.value = false
  }
}

// ===== 无限滚动：触底追加下一页（保留原有 fetchUniversityList 作为替换式加载/兜底） =====
const loadMoreRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

async function loadMoreUniversities() {
  if (!detail.value || univLoading.value) return
  if (univRecords.value.length >= univTotal.value) return
  univPage.value += 1
  univLoading.value = true
  try {
    const res = await getChannelUniversityList({
      page: univPage.value,
      size: univPageSize,
      channelCode: detail.value.channelCode,
      regionTag: univRegionTag.value || undefined,
      signupStart: univSignupStart.value || undefined,
      signupEnd: univSignupEnd.value || undefined,
    })
    univRecords.value = [...univRecords.value, ...res.data.data.records]
    univTotal.value = res.data.data.total
  } catch {
    // 加载失败回退页码，避免跳过一页
    univPage.value -= 1
  } finally {
    univLoading.value = false
  }
}

function setupObserver() {
  if (observer || !loadMoreRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        loadMoreUniversities()
      }
    },
    { rootMargin: '200px 0px' },
  )
  observer.observe(loadMoreRef.value)
}

function onUnivSearch() {
  univPage.value = 1
  fetchUniversityList()
}

function onUnivPageChange(page: number) {
  univPage.value = page
  fetchUniversityList()
}

function goUnivDetail(universityId: string) {
  router.push(`/university/${universityId}`)
}

function goBack() {
  router.push('/gaokao')
}

onMounted(async () => {
  await fetchDetail()
  if (detail.value) {
    fetchUniversityList()
  }
})

// 详情加载完成后 sentinel 才存在，此时才建立观察器
watch(detail, (v) => {
  if (v) {
    nextTick(setupObserver)
  }
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div class="min-h-screen channel-page">
    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- Hero 头部（品牌橙渐变，压过全局 transparent 规则需 !important） -->
        <section class="channel-hero fade-up">
          <div class="hero-orb" aria-hidden="true" />
          <div class="hero-back">
            <button class="hero-back-btn" @click="goBack">← 返回选择报考类型</button>
          </div>
          <div class="hero-main">
            <div class="hero-badge">{{ detail.filterLabel || '特殊通道' }}</div>
            <h2 class="hero-title">{{ detail.channelName }}</h2>
            <p v-if="detail.subtitle" class="hero-subtitle">{{ detail.subtitle }}</p>
            <div v-if="detail.channelCode !== 'STRONG_BASE'" class="hero-chips">
              <span class="hero-chip">
                <span class="chip-dot" />
                关联大学 {{ univTotal }} 所
              </span>
              <span class="hero-chip hero-chip-outline">{{ DisplayTypeLabel[detail.displayType] || detail.displayType }}</span>
            </div>
          </div>
        </section>

        <!-- 通道正文（富文本，原样渲染）→ 置于关联大学/强基列表上方 -->
        <section v-if="detail.content" class="fade-up delay-1">
          <div class="white-card">
            <h3 class="section-title mb-4">通道详情</h3>
            <div v-html="detail.content" class="channel-content" />
          </div>
        </section>

        <!-- 强基计划入围/录取数据（STRONG_BASE 通道，原有逻辑不动） -->
        <StrongBaseList v-if="detail.channelCode === 'STRONG_BASE'" />

        <!-- 关联大学（非 STRONG_BASE 通道） -->
        <section v-if="detail.channelCode !== 'STRONG_BASE'" class="fade-up delay-2">
          <div class="white-card">
            <div class="section-head">
              <h3 class="section-title">关联大学</h3>
              <span class="section-count">共 {{ univTotal }} 所</span>
            </div>

            <!-- 地区 chip 云（聚合已加载 regionTag） -->
            <div v-if="regionTagCounts.length" class="region-chips">
              <button
                v-for="chip in regionTagCounts"
                :key="chip.tag"
                class="region-chip"
                :class="{ active: univRegionTag === chip.tag }"
                @click="onChipClick(chip.tag)"
              >
                {{ chip.tag }} {{ chip.count }}
              </button>
            </div>

            <!-- 搜索栏（label 已去掉 >= / <=） -->
            <div class="search-bar">
              <div class="search-field">
                <label class="search-label">地区</label>
                <el-select v-model="univRegionTag" placeholder="全部" clearable filterable class="w-full" @change="onUnivSearch">
                  <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div class="search-field">
                <label class="search-label">报名开始</label>
                <el-date-picker
                  v-model="univSignupStart"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DDTHH:mm:ss+08:00"
                  class="w-full"
                  @change="onUnivSearch"
                />
              </div>
              <div class="search-field">
                <label class="search-label">报名结束</label>
                <el-date-picker
                  v-model="univSignupEnd"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DDTHH:mm:ss+08:00"
                  class="w-full"
                  @change="onUnivSearch"
                />
              </div>
              <button class="search-btn" @click="onUnivSearch">搜索</button>
            </div>

            <!-- 卡片网格 -->
            <div v-loading="univLoading" class="min-h-[200px]">
              <div v-if="univRecords.length" class="univ-grid">
                <div
                  v-for="(item, idx) in univRecords"
                  :key="item.universityId"
                  class="univ-card fade-up"
                  :style="{ animationDelay: `${(idx % 5) * 70}ms` }"
                >
                  <div class="univ-avatar">{{ item.universityName?.slice(0, 1) || '大' }}</div>
                  <h4 class="univ-name">{{ item.universityName }}</h4>
                  <div class="univ-meta">
                    <span class="univ-meta-item">{{ item.year }} 年</span>
                    <span v-if="item.regionTag" class="univ-region">{{ item.regionTag }}</span>
                  </div>
                  <p class="univ-time">
                    报名 {{ item.signupStart?.slice(0, 10) || '待定' }} ~ {{ item.signupEnd?.slice(0, 10) || '待定' }}
                  </p>
                  <button class="univ-btn" @click="goUnivDetail(item.universityId)">查看详情</button>
                </div>
              </div>
              <div v-else-if="!univLoading" class="empty-tip">暂无关联大学数据</div>
            </div>

            <!-- 无限滚动哨兵（还有更多时显示） -->
            <div
              ref="loadMoreRef"
              v-if="univRecords.length && univRecords.length < univTotal"
              class="load-more"
            >
              <span class="load-more-dots"><i /><i /><i /></span>
              <span>加载中…</span>
            </div>

            <!-- 分页兜底（无 JS / 键盘用户） -->
            <div v-if="univTotal > univPageSize" class="mt-6 flex justify-center">
              <el-pagination
                background
                layout="prev, pager, next, total"
                :total="univTotal"
                :page-size="univPageSize"
                :current-page="univPage"
                @current-change="onUnivPageChange"
              />
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ===== 入场动画：全量 stagger（分块 100ms 错峰 + 卡片 70ms 逐张） ===== */
.fade-up {
  opacity: 0;
  animation: fadeUp 0.5s ease-out forwards;
}
.delay-1 { animation-delay: 100ms; }
.delay-2 { animation-delay: 200ms; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .fade-up { animation: none; opacity: 1; }
}

/* ===== Hero ===== */
.channel-hero {
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
  padding: 24px 36px 32px;
  border-radius: 20px;
  /* 全局 .app-shell main > * 会强制透明，必须 !important 保证实心橙渐变 */
  background: linear-gradient(135deg, #e8722a 0%, #f59e0b 100%) !important;
  color: #fff;
}

/* 区块间纵向间距：Hero 已有 24px，下面 section 统一 20px，相邻 margin 取大值不冲突 */
section.fade-up {
  margin-bottom: 20px;
}
section.fade-up:last-of-type {
  margin-bottom: 0;
}
.hero-orb {
  position: absolute;
  top: -60px;
  right: -40px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25), transparent 70%);
  pointer-events: none;
}
.hero-orb::after {
  content: '';
  position: absolute;
  bottom: -70px;
  left: -30px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.12), transparent 70%);
}
.hero-back {
  position: relative;
  z-index: 1;
  margin-bottom: 14px;
}
.hero-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.hero-back-btn:hover {
  background: rgba(255, 255, 255, 0.28);
}
.hero-main {
  position: relative;
  z-index: 1;
}
.hero-badge {
  display: inline-block;
  margin-bottom: 10px;
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  font-size: 12px;
  color: #fff;
}
.hero-title {
  margin: 0 0 8px 0;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
}
.hero-subtitle {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}
.hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #b45309;
  font-size: 13px;
  font-weight: 500;
}
.hero-chip-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  font-weight: 400;
}
.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f59e0b;
}

/* ===== 白卡（压过全局 transparent 规则） ===== */
.white-card {
  background: #ffffff !important;
  border: 1px solid #f0e9e3;
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.section-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
}
.section-count {
  font-size: 13px;
  color: #9ca3af;
}

/* ===== 地区 chip 云 ===== */
.region-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 12px;
  background: #faf7f4;
  border: 1px solid #f5ece3;
}
.region-chip {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid #eee3d8;
  background: #fff;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.region-chip:hover {
  border-color: #e8722a;
  color: #e8722a;
}
.region-chip.active {
  background: #e8722a;
  border-color: #e8722a;
  color: #fff;
}

/* ===== 搜索栏 ===== */
.search-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px;
  margin-bottom: 18px;
  padding: 16px;
  border-radius: 14px;
  background: #fffaf5;
  border: 1px solid #f5ece3;
}
.search-field {
  flex: 1;
  min-width: 160px;
}
.search-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}
.search-btn {
  height: 40px;
  padding: 0 28px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #e8722a, #f59e0b);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(232, 114, 42, 0.25);
  transition: filter 0.2s ease;
}
.search-btn:hover {
  filter: brightness(1.05);
}

/* ===== 关联大学卡片 ===== */
.univ-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
@media (min-width: 768px) {
  .univ-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .univ-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (min-width: 1280px) {
  .univ-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
.univ-card {
  display: flex;
  flex-direction: column;
  padding: 18px 16px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #f0e9e3;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.univ-card:hover {
  transform: translateY(-3px);
  border-color: #fdd9c3;
  box-shadow: 0 8px 20px rgba(232, 114, 42, 0.1);
}
.univ-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fff3e8, #ffe8d6);
  color: #e8722a;
  font-size: 17px;
  font-weight: 700;
}
.univ-name {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.univ-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.univ-meta-item {
  font-size: 12px;
  color: #9ca3af;
}
.univ-region {
  padding: 1px 8px;
  border-radius: 999px;
  background: #fff3e8;
  color: #e8722a;
  font-size: 11px;
}
.univ-time {
  margin: 0 0 14px 0;
  font-size: 12px;
  color: #6b7280;
}
.univ-btn {
  margin-top: auto;
  padding: 7px 0;
  border: 1px solid #f5c9a8;
  border-radius: 10px;
  background: transparent;
  color: #e8722a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.univ-btn:hover {
  background: #fff3e8;
}
.empty-tip {
  padding: 48px 0;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

/* ===== 无限滚动加载提示 ===== */
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 0 4px;
  color: #9ca3af;
  font-size: 13px;
}
.load-more-dots {
  display: inline-flex;
  gap: 4px;
}
.load-more-dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e8722a;
  animation: dotPulse 1.2s ease-in-out infinite;
}
.load-more-dots i:nth-child(2) { animation-delay: 0.2s; }
.load-more-dots i:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

/* ===== 通道正文 ===== */
.channel-content {
  color: #4b5563;
  line-height: 1.8;
  font-size: 14px;
}
</style>
