<script setup lang="ts">
// apps/user/src/views/english/Index.vue
// 英语四六级主页：
// - 顶部 EnglishBar（sticky 小导航条，含 6 个内联目录 + 右侧考试类型下拉）
// - 默认（无 tab）：展示 6 个模块卡片（历年真题/模拟试卷/题型练习/单词词汇/做题记录/英语资讯）
// - 点条上目录（?tab=xxx）：下方切换为「正在开发中」占位区
// - 卡片点击：提示「即将上线」（本期不设计跳转页）
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import EnglishBar from '@/components/english/EnglishBar.vue'

const route = useRoute()
const activeTab = computed(() => (route.query.tab as string | undefined) || '')

interface CardItem {
  key: string
  title: string
  badge: string
  desc: string
  icon: string
}

// 六张模块卡片（图标内联 svg，静态常量，无用户输入，v-html 安全）
const S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
const iconMap: Record<string, string> = {
  zhenti: `<svg ${S}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  mock: `<svg ${S}><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M9 12h6M9 16h6"/></svg>`,
  practice: `<svg ${S}><path d="M14 4a2 2 0 1 0-4 0v1H7a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-1a2 2 0 1 1 4 0v-3a2 2 0 0 0-2-2h-3V7a2 2 0 0 0-2-2z"/></svg>`,
  vocab: `<svg ${S}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/></svg>`,
  record: `<svg ${S}><rect x="4" y="11" width="3.5" height="9" rx="1"/><rect x="10.5" y="4" width="3.5" height="16" rx="1"/><rect x="17" y="8" width="3.5" height="12" rx="1"/></svg>`,
  news: `<svg ${S}><rect x="3" y="4" width="13" height="16" rx="1"/><path d="M16 8h5v12a1 1 0 0 1-1 1h-4z"/><path d="M6 8h4M6 12h4M6 16h4"/></svg>`,
}

const cards: CardItem[] = [
  { key: 'zhenti', title: '历年真题', badge: '128套真题', desc: '汇集历年四六级考试真题，逐套精练', icon: iconMap.zhenti },
  { key: 'mock', title: '模拟试卷', badge: '30套仿真', desc: '高度还原考场难度的仿真模拟卷', icon: iconMap.mock },
  { key: 'practice', title: '题型练习', badge: '分类专项', desc: '听力 / 阅读 / 写作 / 翻译分题型突破', icon: iconMap.practice },
  { key: 'vocab', title: '单词词汇', badge: '5500词汇', desc: '按考频分级的核心词汇记忆表', icon: iconMap.vocab },
  { key: 'record', title: '做题记录', badge: '答题曲线', desc: '自动记录练习轨迹，追踪正确率', icon: iconMap.record },
  { key: 'news', title: '英语资讯', badge: '每周更新', desc: '考试动态、备考攻略与经验分享', icon: iconMap.news },
]

// 各内联目录的「正在开发中」占位文案
const tabMeta: Record<string, { title: string; desc: string }> = {
  zhenti: { title: '历年真题', desc: '真题库正在整理录入，敬请期待上线。' },
  mock: { title: '模拟试卷', desc: '仿真模拟卷正在命制中，敬请期待上线。' },
  practice: { title: '题型练习', desc: '分题型专项训练正在开发中，敬请期待上线。' },
  vocab: { title: '单词词汇', desc: '分级词汇记忆系统正在开发中，敬请期待上线。' },
  news: { title: '英语资讯', desc: '考试资讯与备考攻略专栏正在筹备中，敬请期待上线。' },
  record: { title: '做题记录', desc: '练习轨迹与正确率看板正在开发中，敬请期待上线。' },
}

const placeholder = computed(() => tabMeta[activeTab.value])

function onCardClick(title: string) {
  ElMessage.info(`「${title}」即将上线，敬请期待`)
}
</script>

<template>
  <div class="english-page">
    <EnglishBar />

    <div class="english-content max-w">
      <!-- 主页：六张模块卡片 -->
      <template v-if="!activeTab">
        <header class="english-hero">
          <h1 class="english-hero-title">英语四六级 · 学习中心</h1>
          <p class="english-hero-sub">真题精练 · 模拟自测 · 题型突破 · 词汇记忆，一站式备考</p>
        </header>

        <div class="english-card-grid">
          <button
            v-for="c in cards"
            :key="c.key"
            type="button"
            class="cet-card"
            @click="onCardClick(c.title)"
          >
            <span class="cet-card-icon" v-html="c.icon" />
            <span class="cet-card-body">
              <span class="cet-card-title">{{ c.title }}</span>
              <span class="cet-card-badge">{{ c.badge }}</span>
              <span class="cet-card-desc">{{ c.desc }}</span>
            </span>
            <span class="cet-card-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </button>
        </div>
      </template>

      <!-- 内联目录占位区 -->
      <template v-else-if="placeholder">
        <div class="english-placeholder">
          <div class="ep-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>
          <h2 class="ep-title">{{ placeholder.title }}</h2>
          <p class="ep-desc">{{ placeholder.desc }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.english-page {
  min-height: 60vh;
}

.max-w {
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 24px 48px;
}

/* ===== 主页 hero ===== */
.english-hero {
  margin-bottom: 22px;
}

.english-hero-title {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.english-hero-sub {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

/* ===== 卡片网格 ===== */
.english-card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.cet-card {
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
  padding: 20px;
  background: #fff;
  border: 1px solid rgba(249, 115, 22, 0.18);
  border-top: 3px solid #f97316;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.05);
  cursor: pointer;
  font: inherit;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.cet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.4);
}

.cet-card-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #fff7ed;
  color: #ea580c;
}

.cet-card-icon :deep(svg) {
  width: 28px;
  height: 28px;
}

.cet-card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.cet-card-title {
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
}

.cet-card-badge {
  align-self: flex-start;
  padding: 2px 10px;
  border-radius: 999px;
  background: #fff7ed;
  color: #c2410c;
  font-size: 12px;
  font-weight: 600;
}

.cet-card-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.cet-card-arrow {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #f97316;
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.cet-card-arrow svg {
  width: 18px;
  height: 18px;
}

.cet-card:hover .cet-card-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* ===== 内联目录占位区 ===== */
.english-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80px 24px;
}

.ep-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #fff7ed;
  color: #f97316;
  margin-bottom: 18px;
}

.ep-icon svg {
  width: 38px;
  height: 38px;
}

.ep-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.ep-desc {
  margin: 0;
  max-width: 420px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .english-card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .english-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
