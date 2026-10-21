<script setup lang="ts">
import { navItems } from '@/config/navigation'

interface PlanColumn {
  id: string
  num: string
  title: string
  desc: string
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

const columns: PlanColumn[] = [
  { id: 'middle', num: '01', title: '初中专栏', desc: '学业奠基与升学指导' },
  { id: 'high', num: '02', title: '高中专栏', desc: '科目选修与生涯规划' },
  { id: 'gaokao', num: '03', title: '高考志愿填报', desc: '院校位次与专业精选' },
  { id: 'college', num: '04', title: '大学专栏', desc: '学分绩点与成长发展' },
  { id: 'cet', num: '05', title: '英语练习', desc: '中考到考研英语在线练习' },
  { id: 'kaoyan', num: '06', title: '考研专栏', desc: '择校初试与复试规划' },
  { id: 'kaogong', num: '07', title: '考公专栏', desc: '国考省考选岗精算' },
  { id: 'postgrad', num: '08', title: '研究生专栏', desc: '学术科研与文献开题' },
  { id: 'phd', num: '09', title: '博士专栏', desc: '申博流程与顶刊发表' },
  { id: 'employment', num: '10', title: '就业信息专栏', desc: '行业风向与名企直通' },
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
    >
      <span class="plan-card__icon" v-html="item.icon"></span>
      <span class="plan-card__body">
        <span class="plan-card__title">
          <span class="plan-card__num">{{ item.num }}</span>
          <span class="plan-card__name">{{ item.title }}</span>
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
  gap: 1rem;
}

.plan-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
  padding: 1.1rem 1.15rem;
  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  text-decoration: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.14);
}

.plan-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  border-radius: 0.8rem;
  color: #f97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.22);
  transition: color 0.25s ease;
}

.plan-card:hover .plan-card__icon {
  color: #ea580c;
}

.plan-card__icon :deep(svg) {
  width: 1.5rem;
  height: 1.5rem;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.4rem;
  height: 1.4rem;
  padding: 0 0.25rem;
  flex-shrink: 0;
  border-radius: 0.35rem;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1;
}

.plan-card__desc {
  font-size: 0.82rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-card__arrow {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  color: #d1d5db;
  transition: color 0.2s ease, transform 0.2s ease;
}

.plan-card__arrow svg {
  width: 100%;
  height: 100%;
}

.plan-card:hover .plan-card__arrow {
  color: #f97316;
  transform: translateX(3px);
}

@media (max-width: 768px) {
  .plan-matrix {
    grid-template-columns: 1fr;
  }
}
</style>
