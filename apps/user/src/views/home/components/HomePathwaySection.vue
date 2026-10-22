<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomePlanSection from './HomePlanSection.vue'
import CareerGraph from './CareerGraph.vue'

const route = useRoute()
const router = useRouter()

// 矩阵视图 = 现有 5×2 矩阵 + 右侧公告；图谱视图 = 生涯星图
type PathwayView = 'matrix' | 'graph'
const activeView = ref<PathwayView>('matrix')

// 由 URL query 驱动初始视图（导航栏跳转 /?view=graph 时还原为图谱并滚动定位）
function applyQueryView() {
  if (route.query.view === 'graph') {
    activeView.value = 'graph'
    nextTick(() => {
      document
        .getElementById('pathway')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  } else {
    activeView.value = 'matrix'
  }
}

function setView(v: PathwayView) {
  activeView.value = v
  // 同步到 URL（保留 hash），便于刷新 / 书签还原。
  // 用 history.replaceState 而非 router.replace，避免触发路由 scrollBehavior
  // 把页面顶到顶端 —— 保证“在当前位置平滑切换视图”。
  const params = new URLSearchParams()
  for (const [key, val] of Object.entries(route.query)) {
    if (key === 'view') continue
    if (val == null) continue
    if (Array.isArray(val)) val.forEach((item) => params.append(key, String(item)))
    else params.append(key, String(val))
  }
  if (v === 'graph') params.set('view', 'graph')
  const search = params.toString()
  const newUrl = (route.path || '/') + (search ? '?' + search : '') + (route.hash || '')
  window.history.replaceState(null, '', newUrl)
}

onMounted(() => {
  applyQueryView()
})

watch(
  () => route.query.view,
  () => applyQueryView()
)
</script>

<template>
  <section id="pathway" class="section-wrapper section-pathway">
    <div class="section-container reveal">
      <!-- ============ 标题块（复制自 /career-map，对齐风格） ============ -->
      <div class="pathway-head">
        <div class="flex items-center gap-2.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-orange-100/80 text-orange-700">
            PATHWAY TOPOLOGY
          </span>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-zinc-900">
            全周期生涯规划导航
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-zinc-600 mt-1">
          一张贯穿初中到名企就业的生涯导航图：左侧矩阵为你梳理全周期升学路径，右侧星图以知识图谱呈现各专栏的关联与属性。点击节点展开详情，一键直达对应专栏。
        </p>
      </div>

      <!-- ============ SVG 分段切换器：矩阵视图 / 图谱视图 ============ -->
      <div class="pathway-toggle" role="tablist" aria-label="视图切换">
        <button
          type="button"
          role="tab"
          :aria-selected="activeView === 'matrix'"
          class="pathway-toggle__btn"
          :class="{ 'is-active': activeView === 'matrix' }"
          @click="setView('matrix')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span>矩阵视图</span>
        </button>

        <button
          type="button"
          role="tab"
          :aria-selected="activeView === 'graph'"
          class="pathway-toggle__btn"
          :class="{ 'is-active': activeView === 'graph' }"
          @click="setView('graph')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="5" cy="6" r="2.5" />
            <circle cx="19" cy="6" r="2.5" />
            <circle cx="12" cy="18" r="2.5" />
            <path stroke-linecap="round" d="M7 7.2 10.4 16M17 7.2 13.6 16M7.4 6h9.2" />
          </svg>
          <span>图谱视图</span>
        </button>
      </div>

      <!-- ============ 内容区：矩阵 / 图谱 平滑淡入淡出切换 ============ -->
      <Transition name="pathway-fade" mode="out-in">
        <div :key="activeView" class="pathway-content">
          <HomePlanSection v-if="activeView === 'matrix'" />
          <CareerGraph v-else />
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
/* ============ 标题块 ============ */
.pathway-head {
  margin-bottom: 1.25rem;
}

/* ============ SVG 分段切换器 ============ */
.pathway-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  margin-bottom: 1.5rem;
  border-radius: 9999px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.pathway-toggle__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

.pathway-toggle__btn svg {
  width: 1rem;
  height: 1rem;
}

.pathway-toggle__btn:hover {
  color: #334155;
  background: #e2e8f0;
}

.pathway-toggle__btn.is-active {
  color: #ffffff;
  background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-light));
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.22);
}

/* ============ 内容切换过渡：淡入 + 轻微上移 ============ */
.pathway-fade-enter-active,
.pathway-fade-leave-active {
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.pathway-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.pathway-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.pathway-content {
  /* 给内容一个稳定的最小高度，减少切换时的跳动 */
  min-height: 320px;
}
</style>
