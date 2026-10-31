<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useExpertContact } from '@/composables/useExpertContact'
import type { FileLoadAudience } from '@/types/fileload'

const props = withDefaults(
  defineProps<{
    /** 专栏受众，决定展示哪套快捷入口 */
    audience: FileLoadAudience
    /** 面板标题：OSS 详情页为「快捷导航」，网盘详情页为「在线工具」 */
    title?: string
    /** 教师专属详情：跳回本专栏时携带 teacher=1 */
    teacher?: boolean
  }>(),
  { title: '快捷导航', teacher: false },
)

const router = useRouter()
const { open: openExpert } = useExpertContact()

type Tone = 'blue' | 'violet' | 'orange' | 'green' | 'cyan' | 'rose' | 'amber'
type IconName =
  | 'flag'
  | 'target'
  | 'pen'
  | 'sparkle'
  | 'compass'
  | 'building'
  | 'book'
  | 'briefcase'
  | 'doc'
  | 'news'
  | 'graduation'
  | 'headset'

interface QuickNavItem {
  label: string
  desc: string
  icon: IconName
  tone: Tone
  /** route=跳转 / soon=敬请期待 / expert=专家咨询弹框 */
  kind: 'route' | 'soon' | 'expert'
  to?: string
  query?: Record<string, string>
}

/** 24x24 线性图标（stroke），每条为一个 path 的 d */
const ICONS: Record<IconName, string[]> = {
  flag: ['M5 21V4', 'M5 4h11l-2 3.5L16 11H5'],
  target: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8', 'M12 3v3M12 18v3M3 12h3M18 12h3'],
  pen: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'],
  sparkle: [
    'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z',
    'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z',
  ],
  compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M15.5 8.5l-2 5-5 2 2-5Z'],
  building: ['M3 21h18', 'M5 21V7l7-4 7 4v14', 'M9 21v-6h6v6', 'M9 10h.01M15 10h.01'],
  book: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z'],
  briefcase: ['M3 7h18v13H3z', 'M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M3 12h18'],
  doc: ['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z', 'M14 3v5h5', 'M9 13h6M9 17h4'],
  news: ['M3 5h14v14H3z', 'M17 8h4v9a2 2 0 0 1-2 2H3', 'M6 9h8M6 13h8M6 16h5'],
  graduation: ['M12 4L2 9l10 5 10-5Z', 'M6 11.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5'],
  headset: ['M4 14v-2a8 8 0 0 1 16 0v2', 'M4 14h2v6H5a1 1 0 0 1-1-1Z', 'M20 14h-2v6h1a1 1 0 0 0 1-1Z'],
}

/**
 * 各专栏快捷入口。
 * 跳转类的「面向人群」深链值与 FileLoadPage 的 STAGE_FILTER_OPTIONS 保持一致
 * （中考真题→中考资料 / 高考真题→高考资料），syncFromQuery 会校验并预选中。
 */
const QUICK_NAV: Record<FileLoadAudience, QuickNavItem[]> = {
  middle: [
    { label: '中考真题', desc: '历年真题与答案解析', icon: 'target', tone: 'rose', kind: 'route', to: '/middle', query: { stage: '中考资料' } },
    { label: '中考在线练题', desc: '分题型专项训练', icon: 'pen', tone: 'green', kind: 'soon' },
    { label: 'AI初中生涯规划', desc: '智能规划升学路径', icon: 'sparkle', tone: 'orange', kind: 'soon' },
    { label: '专家一对一资讯', desc: '规划师专属答疑', icon: 'headset', tone: 'cyan', kind: 'expert' },
  ],
  // 教师专属资料（?teacher=1）复用高中那套
  high: [
    { label: '高考志愿填报', desc: '智能推荐院校与专业', icon: 'flag', tone: 'orange', kind: 'route', to: '/gaokao' },
    { label: '高考真题库', desc: '历年真题与答案解析', icon: 'target', tone: 'rose', kind: 'route', to: '/high', query: { stage: '高考资料' } },
    { label: '真题在线练习', desc: '分题型专项训练', icon: 'pen', tone: 'green', kind: 'soon' },
    { label: 'AI高中生涯规划', desc: '智能规划升学路径', icon: 'sparkle', tone: 'orange', kind: 'soon' },
    { label: '报考院校查询', desc: '院校库与招生信息', icon: 'building', tone: 'blue', kind: 'route', to: '/university' },
    { label: '相关专业查询', desc: '专业库与就业方向', icon: 'book', tone: 'violet', kind: 'route', to: '/major' },
    { label: '专家一对一资讯', desc: '规划师专属答疑', icon: 'headset', tone: 'cyan', kind: 'expert' },
  ],
  college: [
    { label: '大学生涯规划', desc: '学业与职业发展', icon: 'compass', tone: 'blue', kind: 'soon' },
    { label: '在线考公', desc: '公务员备考专区', icon: 'briefcase', tone: 'amber', kind: 'soon' },
    { label: '在线考研', desc: '考研备考专区', icon: 'graduation', tone: 'violet', kind: 'soon' },
    { label: '大学就业服务', desc: '岗位与实习机会', icon: 'briefcase', tone: 'green', kind: 'soon' },
    { label: '专家一对一资讯', desc: '规划师专属答疑', icon: 'headset', tone: 'cyan', kind: 'expert' },
  ],
  'postgrad-exam': [
    { label: '考研真题', desc: '历年真题与答案解析', icon: 'target', tone: 'rose', kind: 'soon' },
    { label: '考研政策须知', desc: '报考条件与流程', icon: 'doc', tone: 'blue', kind: 'soon' },
    { label: '考研在线练题', desc: '分题型专项训练', icon: 'pen', tone: 'green', kind: 'soon' },
    { label: '考研院校查询', desc: '招生院校与报录比', icon: 'building', tone: 'violet', kind: 'soon' },
    { label: '考研专业查询', desc: '专业目录与方向', icon: 'book', tone: 'amber', kind: 'soon' },
    { label: '专家一对一资讯', desc: '规划师专属答疑', icon: 'headset', tone: 'cyan', kind: 'expert' },
  ],
  'civil-service': [
    { label: '考公真题', desc: '历年真题与答案解析', icon: 'target', tone: 'rose', kind: 'soon' },
    { label: '考公政策须知', desc: '报考条件与流程', icon: 'doc', tone: 'blue', kind: 'soon' },
    { label: '考公在线练题', desc: '分题型专项训练', icon: 'pen', tone: 'green', kind: 'soon' },
    { label: '岗位职位查询', desc: '职位库与招录信息', icon: 'briefcase', tone: 'amber', kind: 'soon' },
    { label: '时政热点', desc: '每月时政与考点', icon: 'news', tone: 'violet', kind: 'soon' },
    { label: '专家一对一资讯', desc: '规划师专属答疑', icon: 'headset', tone: 'cyan', kind: 'expert' },
  ],
  graduate: [
    { label: '申博指南', desc: '博士申请与考核要点', icon: 'graduation', tone: 'violet', kind: 'route', to: '/postgraduate/phd' },
    { label: '研究生专业查询', desc: '考研专业目录与方向', icon: 'book', tone: 'blue', kind: 'route', to: '/postgrad-major' },
    { label: '研究生就业服务', desc: '岗位与实习机会', icon: 'briefcase', tone: 'green', kind: 'soon' },
    { label: '在线考公', desc: '公务员备考专区', icon: 'doc', tone: 'amber', kind: 'soon' },
    { label: '专家一对一资讯', desc: '规划师专属答疑', icon: 'headset', tone: 'cyan', kind: 'expert' },
  ],
}

const items = computed<QuickNavItem[]>(() => QUICK_NAV[props.audience] || [])

async function onItemClick(item: QuickNavItem) {
  if (item.kind === 'soon') {
    // 与 FileLoadPage 子导航占位项保持一致的轻提示
    ElMessage.info(`「${item.label}」敬请期待`)
    return
  }
  if (item.kind === 'expert') {
    await openExpert()
    return
  }
  if (!item.to) return
  // 跳回本专栏时保留教师身份（/high?teacher=1）
  const query: Record<string, string> = { ...(item.query || {}) }
  if (props.teacher && item.to === `/${props.audience}`) query.teacher = '1'
  void router.push({ path: item.to, query })
}
</script>

<template>
  <section class="qn-panel">
    <header class="qn-head">
      <span class="qn-head-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
        </svg>
      </span>
      <h2 class="qn-title">{{ title }}</h2>
    </header>

    <ul class="qn-list">
      <li v-for="item in items" :key="item.label">
        <button type="button" class="qn-item" :class="`tone-${item.tone}`" @click="onItemClick(item)">
          <span class="qn-item-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(d, i) in ICONS[item.icon]" :key="i" :d="d" />
            </svg>
          </span>
          <span class="qn-item-text">
            <span class="qn-item-label">{{ item.label }}</span>
            <span class="qn-item-desc">{{ item.desc }}</span>
          </span>
          <svg class="qn-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.qn-panel {
  padding: 16px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
}

.qn-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.qn-head-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 9px;
  color: #ffffff;
  background: linear-gradient(135deg, #fb923c, #f97316);
  box-shadow: 0 2px 8px -2px rgba(249, 115, 22, 0.45);
}

.qn-head-icon svg {
  width: 15px;
  height: 15px;
}

.qn-title {
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.qn-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.qn-item {
  --tone: #64748b;
  --tone-bg: #f8fafc;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 12px;
  background: var(--tone-bg);
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.22s cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 0.22s ease,
    background-color 0.22s ease;
}

.qn-item:hover {
  transform: translateX(3px);
  background: var(--tone-bg);
  box-shadow: 0 6px 18px -8px var(--tone);
}

.qn-item:active {
  transform: translateX(1px);
}

.qn-item:focus-visible {
  outline: 2px solid rgba(249, 115, 22, 0.55);
  outline-offset: 2px;
}

.qn-item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  color: #ffffff;
  background: var(--tone);
  box-shadow: 0 3px 10px -4px var(--tone);
}

.qn-item-icon svg {
  width: 18px;
  height: 18px;
}

.qn-item-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.qn-item-label {
  color: #1e293b;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qn-item-desc {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qn-item-arrow {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #cbd5e1;
  transition: transform 0.22s ease, color 0.22s ease;
}

.qn-item:hover .qn-item-arrow {
  color: var(--tone);
  transform: translateX(2px);
}

/* 语义化配色：图标块取主色，卡片底取同色系浅色 */
.tone-blue {
  --tone: #3b82f6;
  --tone-bg: #eff6ff;
}
.tone-violet {
  --tone: #7c3aed;
  --tone-bg: #f5f3ff;
}
.tone-orange {
  --tone: #f97316;
  --tone-bg: #fff7ed;
}
.tone-green {
  --tone: #059669;
  --tone-bg: #ecfdf5;
}
.tone-cyan {
  --tone: #0891b2;
  --tone-bg: #ecfeff;
}
.tone-rose {
  --tone: #e11d48;
  --tone-bg: #fff1f2;
}
.tone-amber {
  --tone: #d97706;
  --tone-bg: #fffbeb;
}
</style>
