<script setup lang="ts">
import { navItems } from '@/config/navigation'

type Stage = 'foundation' | 'core' | 'advance' | 'selection' | 'summit'
type TagTone = 'blue' | 'rose' | 'emerald' | 'amber'

interface PlanColumn {
  id: string
  num: string
  title: string
  desc: string
  stage: Stage
  tag?: string
  tagTone?: TagTone
}

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

// 展示顺序：第一列自上而下 1-5（初中/高中/大学/研究生/博士），
// 第二列自上而下 6-10（高考/英语/考研/考公/就业）。
// 颜色由各自 stage 决定，随条目走、不随位置变；num 按新序列重排。
const columns: PlanColumn[] = [
  { id: 'middle', num: '01', title: '初中专栏', desc: '学业奠基与升学指导', stage: 'foundation' },
  { id: 'high', num: '02', title: '高中专栏', desc: '科目选修与生涯规划', stage: 'foundation', tag: '全方位覆盖', tagTone: 'blue' },
  { id: 'college', num: '03', title: '大学专栏', desc: '学分绩点与成长发展', stage: 'core' },
  { id: 'postgrad', num: '04', title: '研究生专栏', desc: '学术科研与文献开题', stage: 'selection' },
  { id: 'phd', num: '05', title: '博士专栏', desc: '申博流程与顶刊发表', stage: 'summit', tag: '申请考核', tagTone: 'blue' },
  { id: 'gaokao', num: '06', title: '高考志愿填报', desc: '院校位次与专业精选', stage: 'core', tag: '热门', tagTone: 'rose' },
  { id: 'cet', num: '07', title: '英语专项练习', desc: '中考、高考、四六级、考研英语在线练习', stage: 'advance' },
  { id: 'kaoyan', num: '08', title: '考研专栏', desc: '择校初试与复试规划', stage: 'advance', tag: '报录精算', tagTone: 'emerald' },
  { id: 'kaogong', num: '09', title: '考公专栏', desc: '国考省考选岗精算', stage: 'selection', tag: '冲刺', tagTone: 'rose' },
  { id: 'employment', num: '10', title: '就业信息专栏', desc: '行业风向与名企直通', stage: 'summit', tag: '直通', tagTone: 'amber' },
]

const routeOverrides: Record<string, string> = {
  kaoyan: '/postgrad-exam',
  kaogong: '/civil-service',
  phd: '/postgraduate/phd',
}

const navRouteMap = new Map(navItems.map(n => [n.id, n.route]))

const items = columns.map(c => ({
  ...c,
  icon: iconMap[c.id] ?? '',
  route: routeOverrides[c.id] ?? navRouteMap.get(c.id) ?? '/',
}))
</script>

<template>
  <div class="plan-matrix">
    <router-link
      v-for="item in items"
      :key="item.id"
      :to="item.route"
      class="plan-card"
      :class="`plan-card--${item.stage}`"
    >
      <span class="plan-card__icon">
        <span class="plan-card__num">{{ item.num }}</span>
        <span class="plan-card__glyph" v-html="item.icon"></span>
      </span>
      <span class="plan-card__body">
        <span class="plan-card__title">
          <span class="plan-card__name">{{ item.title }}</span>
          <span
            v-if="item.tag"
            class="plan-card__tag"
            :class="`plan-card__tag--${item.tagTone}`"
          >{{ item.tag }}</span>
        </span>
        <span class="plan-card__desc">{{ item.desc }}</span>
      </span>
      <span class="plan-card__arrow" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 10h12M11 5l5 5-5 5" />
        </svg>
      </span>
    </router-link>
  </div>
</template>

<style scoped>
.plan-matrix {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  /* 列优先排布：先填满第一列(1-5)再填第二列(6-10)，实现“1-5竖排、6-10竖排” */
  grid-template-rows: repeat(5, auto);
  grid-auto-flow: column;
  gap: 1rem;
}

.plan-card {
  --accent: #2563eb;
  --accent-bg: #eff6ff;
  --accent-ring: rgba(37, 99, 235, 0.18);
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
  min-height: 5.25rem;
  padding: 1.1rem 1.15rem;
  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
  text-decoration: none;
  transition:
    transform 0.28s cubic-bezier(0.32, 0.72, 0, 1),
    border-color 0.28s ease,
    box-shadow 0.28s ease;
}

.plan-card--foundation {
  --accent: #2563eb;
  --accent-bg: #eff6ff;
  --accent-ring: rgba(37, 99, 235, 0.18);
}

.plan-card--core {
  --accent: #f97316;
  --accent-bg: #fff7ed;
  --accent-ring: rgba(249, 115, 22, 0.2);
}

.plan-card--advance {
  --accent: #0891b2;
  --accent-bg: #ecfeff;
  --accent-ring: rgba(8, 145, 178, 0.18);
}

.plan-card--selection {
  --accent: #d97706;
  --accent-bg: #fffbeb;
  --accent-ring: rgba(217, 119, 6, 0.18);
}

.plan-card--summit {
  --accent: #4f46e5;
  --accent-bg: #eef2ff;
  --accent-ring: rgba(79, 70, 229, 0.18);
}

.plan-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent-ring);
  box-shadow:
    0 4px 12px rgba(15, 23, 42, 0.04),
    0 14px 28px -6px rgba(15, 23, 42, 0.1);
}

.plan-card:active {
  /* 按压反馈不再用 scale：整卡含标题文字，缩放走合成层位图插值会让文字瞬间发虚
     （DESIGN.md 方案1）。改用阴影收拢表达按压感。 */
  transform: translateY(0);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.03),
    0 4px 12px -4px rgba(15, 23, 42, 0.08);
  transition-duration: 0.1s;
}

.plan-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.plan-card__icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  flex-shrink: 0;
  border-radius: 0.875rem;
  color: var(--accent);
  background: linear-gradient(135deg, var(--accent-bg) 0%, #ffffff 100%);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    0 1px 3px var(--accent-ring);
  /* 只过渡阴影：图标底座内含「01-10」序号文字，不能做 transform 动画 */
  transition: box-shadow 0.28s ease;
}

/* 强调改为「光环加深」，不做 scale：
   序号文字在底座内，任何缩放/位移都会让它进入合成层位图插值 → 序号发虚
   （对应 DESIGN.md 方案1：含文字的容器不要用 scale 做强调）。 */
.plan-card:hover .plan-card__icon {
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.9),
    0 2px 8px -1px var(--accent-ring);
}

.plan-card__glyph,
.plan-card__glyph :deep(svg) {
  width: 1.5rem;
  height: 1.5rem;
}

.plan-card__glyph {
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  flex: 1;
}

.plan-card__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.plan-card__name {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-card__num {
  position: absolute;
  top: -6px;
  left: -6px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  background: var(--accent);
  color: #ffffff;
  /* 0.5625rem = 9px 整数像素，避免 0.58rem(9.28px) 在序号块里发虚 */
  font-size: 0.5625rem;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.16);
}

.plan-card__tag {
  flex-shrink: 0;
  max-width: 4.5rem;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-card__tag--blue {
  color: #2563eb;
  background: #eff6ff;
}

.plan-card__tag--rose {
  color: #e11d48;
  background: #fff1f2;
}

.plan-card__tag--emerald {
  color: #059669;
  background: #ecfdf5;
}

.plan-card__tag--amber {
  color: #d97706;
  background: #fffbeb;
}

.plan-card__desc {
  /* 字号取整数 px（0.8125rem = 13px）：0.82rem = 13.12px 会带来分数像素字形，
     描边/文字在 1x 屏上更容易看起来发虚 */
  font-size: 0.8125rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-card__arrow {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  color: #94a3b8;
  transition: color 0.2s ease, transform 0.2s ease;
}

.plan-card__arrow svg {
  width: 100%;
  height: 100%;
}

.plan-card:hover .plan-card__arrow {
  color: var(--accent);
  transform: translateX(3px);
}

@media (max-width: 768px) {
  .plan-matrix {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    grid-auto-flow: row;
  }
}

@media (prefers-reduced-motion: reduce) {
  .plan-card,
  .plan-card__icon,
  .plan-card__arrow {
    transition: none;
  }

  .plan-card:hover {
    transform: none;
  }
}
</style>
