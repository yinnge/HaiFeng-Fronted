<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { navItems } from '@/config/navigation'
import { pushNavItem } from '@/utils/navAnchor'

/**
 * 核心服务导航（改造版）：
 * - 10 张大卡（图标 + 名称 + 中文描述）组成跑马灯，从右往左匀速滚动，hover 暂停
 * - 点击卡片弹出无边框面板：卡片平滑滑向左侧，右侧二级目录自上而下级联浮现（垂直居中）
 * - 目录数据与导航栏同源（@/config/navigation），后续新增模块只改 navigation.ts + descMap/iconMap
 */

interface DirItem {
  label: string
  route?: string
  expert?: boolean
}

interface SvcModule {
  id: string
  label: string
  route?: string
  icon: string
  desc: string
  subItems: DirItem[]
}

const emit = defineEmits<{ expert: [] }>()

const iconMap: Record<string, string> = {
  middle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg>`,
  high: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/></svg>`,
  gaokao: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/><path d="M18 14l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14z" opacity=".6"/></svg>`,
  college: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M6 18v-8M10 18v-8M14 18v-8M18 18v-8"/><path d="M12 3L3 8h18z"/></svg>`,
  cet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>`,
  kaoyan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>`,
  kaogong: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9z"/><path d="M9 14l2 2 4-4"/></svg>`,
  postgrad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3"/></svg>`,
  phd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M9 14l-2 8 5-3 5 3-2-8"/></svg>`,
  employment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
}

const descMap: Record<string, string> = {
  middle: '中考资讯与初一至初三同步学习资料',
  high: '高一至高三资料与练题系统',
  gaokao: 'AI 智能填报 · 志愿表 · 特殊通道一站直达',
  college: '大一到大四资料与大学 AI 规划系统',
  cet: '四级六级备考资料与考试资讯',
  kaoyan: '考研资料与考研系统，备考一步到位',
  kaogong: '考公资料与考公系统，上岸快人一步',
  postgrad: '研究生资料与申博指南',
  phd: '博一博二博三阶段资料与规划',
  employment: '体制内 · 基层 · 行业专项招聘信息',
}

// 与导航栏同源：排除「首页」，其余 10 个模块即核心服务
const modules: SvcModule[] = navItems
  .filter(n => n.id !== 'home')
  .map(n => ({
    id: n.id,
    label: n.label,
    route: n.route,
    icon: iconMap[n.id] ?? iconMap.book,
    desc: descMap[n.id] ?? '',
    subItems: [
      ...(n.route ? [{ label: '进入栏目主页', route: n.route }] : []),
      ...(n.subItems ?? []).map(s => ({ label: s.label, route: s.route })),
      ...(n.id === 'gaokao' ? [{ label: '专家指导（一对一）', expert: true }] : []),
    ],
  }))

const router = useRouter()
const route = useRoute()

const activeId = ref<string | null>(null)
const open = computed(() => activeId.value !== null)
const activeModule = computed(() => modules.find(m => m.id === activeId.value) ?? null)

function openDetail(id: string) {
  activeId.value = id
}

function closeDetail() {
  activeId.value = null
}

function go(item: DirItem) {
  if (item.expert) {
    emit('expert')
    return
  }
  if (!item.route) {
    ElMessage.info('该功能正在开发中')
    return
  }
  closeDetail()
  void pushNavItem(router, route.path, { label: item.label, route: item.route })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeDetail()
}

watch(open, v => {
  if (v) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="svc-navigator">
    <!-- 跑马灯：两组相同卡片循环滚动，hover/弹层打开时暂停 -->
    <div class="svc-marquee" :class="{ paused: open }">
      <div class="svc-track">
        <div v-for="g in 2" :key="g" class="svc-track-group" :aria-hidden="g === 2">
          <button
            v-for="m in modules"
            :key="`${g}-${m.id}`"
            type="button"
            class="svc-card"
            @click="openDetail(m.id)"
          >
            <span class="svc-card-icon" v-html="m.icon"></span>
            <h3 class="svc-card-title">{{ m.label }}</h3>
            <p class="svc-card-desc">{{ m.desc }}</p>
            <span class="svc-card-more">
              查看目录
              <svg viewBox="0 0 20 20" fill="currentColor" class="svc-card-arrow">
                <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 点击展开：无边框面板，卡片左移 + 目录级联 -->
    <Teleport to="body">
      <Transition name="svc-fade">
        <div v-if="open && activeModule" class="svc-backdrop" @click.self="closeDetail">
          <div class="svc-panel" role="dialog" aria-modal="true">
            <button type="button" class="svc-close" aria-label="关闭" @click="closeDetail">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <div class="svc-panel-card">
              <span class="svc-panel-icon" v-html="activeModule.icon"></span>
              <h3 class="svc-panel-title">{{ activeModule.label }}</h3>
              <p class="svc-panel-desc">{{ activeModule.desc }}</p>
              <p class="svc-panel-hint">点击右侧目录直达对应功能</p>
            </div>

            <div class="svc-dir">
              <button
                v-for="(item, i) in activeModule.subItems"
                :key="item.label"
                type="button"
                class="svc-dir-item"
                :style="{ '--i': i }"
                @click="go(item)"
              >
                <span class="svc-dir-dot"></span>
                <span class="svc-dir-label">{{ item.label }}</span>
                <svg class="svc-dir-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 4.707a1 1 0 011.414 0L13 8.586l-4.293 4.293a1 1 0 01-1.414-1.414L10.586 10l-3.293-3.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              <p v-if="!activeModule.subItems.length" class="svc-dir-empty">功能规划中，敬请期待</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ============ 跑马灯 ============ */
.svc-marquee {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  padding: 0.75rem 0 1.25rem;
}

.svc-track {
  display: flex;
  width: max-content;
  animation: svc-scroll 48s linear infinite;
  will-change: transform;
}

.svc-marquee:hover .svc-track,
.svc-marquee.paused .svc-track {
  animation-play-state: paused;
}

@keyframes svc-scroll {
  to {
    transform: translateX(-50%);
  }
}

.svc-track-group {
  display: flex;
  gap: 1.25rem;
  padding-right: 1.25rem;
}

.svc-card {
  width: 232px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 1.5rem 1.35rem;
  border-radius: 16px;
  background: #ffffff;
  border: none;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.07);
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.svc-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(249, 115, 22, 0.16);
}

.svc-card:active {
  transform: translateY(-3px) scale(0.99);
}

.svc-card-icon {
  width: 3.25rem;
  height: 3.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.08));
  color: #f97316;
  margin-bottom: 0.9rem;
}

.svc-card-icon :deep(svg) {
  width: 1.6rem;
  height: 1.6rem;
}

.svc-card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f2937;
}

.svc-card-desc {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  line-height: 1.6;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.56rem;
}

.svc-card-more {
  margin-top: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #e8722a;
}

.svc-card-arrow {
  width: 0.8rem;
  height: 0.8rem;
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.svc-card:hover .svc-card-arrow {
  transform: translateX(3px);
}

/* ============ 弹出面板（无边框） ============ */
.svc-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(31, 26, 20, 0.45);
  backdrop-filter: blur(4px);
}

.svc-panel {
  position: relative;
  width: min(860px, 94vw);
  min-height: 360px;
  max-height: 86vh;
  display: flex;
  align-items: stretch;
  gap: 3rem;
  padding: 3rem;
  border-radius: 24px;
  background: #ffffff;
  /* 无边框，按需求去掉描边 */
  border: none;
  box-shadow: 0 30px 80px rgba(194, 65, 12, 0.2);
  overflow: hidden;
}

.svc-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #9ca3af;
  transition: all 0.2s ease;
  z-index: 1;
}

.svc-close:hover {
  color: #e8722a;
  background: rgba(249, 115, 22, 0.08);
}

.svc-close svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* 左侧卡片：平滑滑入（模拟「卡片往左移动」） */
.svc-panel-card {
  flex-shrink: 0;
  width: 264px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: svc-card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes svc-card-in {
  from {
    opacity: 0;
    transform: translateX(90px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.svc-panel-icon {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 146, 60, 0.08));
  color: #f97316;
  margin-bottom: 1.25rem;
}

.svc-panel-icon :deep(svg) {
  width: 2rem;
  height: 2rem;
}

.svc-panel-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
}

.svc-panel-desc {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #6b7280;
}

.svc-panel-hint {
  margin-top: 1.25rem;
  font-size: 0.8rem;
  color: #9ca3af;
}

/* 右侧目录：垂直居中 + 级联浮现 */
.svc-dir {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
}

.svc-dir-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1.15rem;
  border-radius: 14px;
  background: #faf9f5;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  animation: svc-item-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(140ms + var(--i) * 60ms);
}

@keyframes svc-item-in {
  from {
    opacity: 0;
    transform: translateY(-14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.svc-dir-item:hover {
  background: #fff7ed;
  transform: translateX(4px);
}

.svc-dir-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #f97316, #fb923c);
  flex-shrink: 0;
}

.svc-dir-label {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
}

.svc-dir-item:hover .svc-dir-label {
  color: #e8722a;
}

.svc-dir-arrow {
  width: 0.9rem;
  height: 0.9rem;
  color: #d1d5db;
  transition: all 0.25s ease;
}

.svc-dir-item:hover .svc-dir-arrow {
  color: #e8722a;
  transform: translateX(2px);
}

.svc-dir-empty {
  text-align: center;
  font-size: 0.9rem;
  color: #9ca3af;
  padding: 2rem 0;
}

/* 弹层过渡 */
.svc-fade-enter-active,
.svc-fade-leave-active {
  transition: opacity 0.25s ease;
}

.svc-fade-enter-from,
.svc-fade-leave-to {
  opacity: 0;
}

/* ============ 响应式 ============ */
@media (max-width: 860px) {
  .svc-panel {
    flex-direction: column;
    gap: 1.5rem;
    padding: 2.5rem 1.5rem 2rem;
    overflow-y: auto;
  }

  .svc-panel-card {
    width: 100%;
  }

  .svc-dir {
    justify-content: flex-start;
  }

  .svc-card {
    width: 200px;
  }
}

/* 减弱动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .svc-track {
    animation: none;
  }

  .svc-panel-card,
  .svc-dir-item {
    animation: none;
  }

  .svc-card,
  .svc-dir-item {
    transition: none;
  }
}
</style>
