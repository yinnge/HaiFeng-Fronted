<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPlanners, getPlannerProvinces, getInstitutions } from '@/api/home'
import type { MentorCardConfig } from '@/types/home'
import MentorDialog from './MentorDialog.vue'

// 6 张入口卡片：文案照抄原型，数字由接口动态替换
const CARDS: MentorCardConfig[] = [
  {
    key: 'gaokao',
    kind: 'person',
    accent: 'blue',
    eyebrow: '规划师名单',
    title: '高考志愿规划师',
    desc: '位次精算、冲稳保梯度、专业组适配，一对一陪你把志愿表填稳。',
    countUnit: '位规划师',
    tagTemplate: '{n} 省可选 · 全批次覆盖',
    sub: '覆盖多省的规划师，普通类、艺术体育类、强基综评与专科批均有专人，按考生情况匹配。',
    foot: '以上为规划院在职规划师，预约前可先做一次免费位次评估；不同批次建议匹配对应专项规划师。',
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="1"></rect><path d="m9 14 2 2 4-4"></path></svg>',
    serviceTarget: '高考',
  },
  {
    key: 'kaoyan',
    kind: 'person',
    accent: 'indigo',
    eyebrow: '规划师名单',
    title: '考研规划师',
    desc: '择校定专业、初复试节奏、导师沟通，把上岸路径拆成可执行的四步。',
    countUnit: '位规划师',
    tagTemplate: '{n} 省可选 · 含保研与二战',
    sub: '覆盖多省的规划师，分别负责学硕择校、专硕报考、复试调剂、跨考与保研，按起点选人。',
    foot: '考研规划通常从大三上学期启动；二战与在职考生建议先做一次复盘诊断再定方案。',
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z"></path><path d="M6 12v5c0 1.6 2.7 3 6 3s6-1.4 6-3v-5"></path></svg>',
    serviceTarget: '考研',
  },
  {
    key: 'gaosan',
    kind: 'org',
    accent: 'orange',
    eyebrow: '机构名单',
    title: '高中冲刺小班',
    desc: '高三全年小班教学，分层编班、周测复盘，弱科专项集中突破。',
    countUnit: '家机构',
    tagTemplate: '{n} 省可选 · 6-12 人小班',
    sub: '覆盖多地的高三冲刺机构，班型、师资与上课形式差异较大，建议先试听再签约。',
    foot: '机构信息由规划院实地走访整理，班型与收费以当期招生简章为准；签约前请确认退费条款与教师稳定性。',
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"></path></svg>',
    category: '高中冲刺小班',
  },
  {
    key: 'gongkao',
    kind: 'org',
    accent: 'green',
    eyebrow: '机构名单',
    title: '考公考编机构',
    desc: '国考省考、事业单位、教师招聘，笔试面试全流程与选岗精算。',
    countUnit: '家机构',
    tagTemplate: '{n} 省可选 · 小班督学',
    sub: '覆盖多地机构，分别擅长国省考、事业单位、面试封闭与教师招聘，先明确要考哪一类。',
    foot: '公考培训效果高度依赖个人刷题量，机构只解决方法与督学；协议班请务必看清退费条件与到账周期。',
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M12 3 21 8H3l9-5Z"></path><path d="M5 21V10m4.5 11V10M14.5 21V10M19 21V10"></path></svg>',
    category: '考公考编机构',
  },
  {
    key: 'yangqi',
    kind: 'org',
    accent: 'red',
    eyebrow: '机构名单',
    title: '央国企培训',
    desc: '电网、烟草、铁路、能源、银行校招，网申笔试面试全流程辅导。',
    countUnit: '家机构',
    tagTemplate: '{n} 省可选 · 岗位信息库',
    sub: '覆盖多地机构，对应电网能源、铁路轨道、银行金融、烟草专卖与综合校招。',
    foot: '央国企校招信息以企业官网公告为准，机构提供的岗位库仅作参考；警惕承诺"内部名额"的机构。',
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v18"></path><path d="M13 9h6a1 1 0 0 1 1 1v12"></path><path d="M2 22h20"></path><path d="M7.5 7h1M7.5 11h1M7.5 15h1"></path></svg>',
    category: '央国企培训',
  },
  {
    key: 'zhiye',
    kind: 'org',
    accent: 'cyan',
    eyebrow: '机构名单',
    title: '职业培训机构',
    desc: '技能证书与实操就业，电工、护理、电商、汽修等工种培训。',
    countUnit: '家机构',
    tagTemplate: '{n} 省可选 · 可考证',
    sub: '覆盖多地机构，含电工焊工、护理资格、电商直播、新能源汽车维修与建筑八大员。',
    foot: '报读前请核验机构办学许可证与证书发证单位；"包就业"承诺建议写入合同并注明违约条款。',
    iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
    category: '职业培训机构',
  },
]

// 每张卡片的数量：{ total, provinceCount }
interface CardCount { total: number; provinceCount: number }
const counts = ref<Record<string, CardCount>>({})

const loadCount = async (card: MentorCardConfig): Promise<CardCount> => {
  if (card.kind === 'person') {
    const [listRes, provRes] = await Promise.all([
      getPlanners({ page: 1, size: 10, serviceTarget: card.serviceTarget! }),
      getPlannerProvinces(card.serviceTarget!),
    ])
    return { total: listRes.data.data.total, provinceCount: provRes.data.data?.length ?? 0 }
  }
  // 机构无省份列表接口：取满一页从 province 字段前端去重
  const res = await getInstitutions({ page: 1, size: 100, category: card.category! })
  const provs = new Set<string>()
  res.data.data.records.forEach((it) => { if (it.province) provs.add(it.province) })
  return { total: res.data.data.total, provinceCount: provs.size }
}

const fetchAllCounts = async () => {
  const results = await Promise.allSettled(CARDS.map((c) => loadCount(c)))
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      counts.value[CARDS[i].key] = r.value
    } else {
      // 单张卡片取数失败静默降级为 0，不影响整块展示
      counts.value[CARDS[i].key] = { total: 0, provinceCount: 0 }
    }
  })
}

const countText = (card: MentorCardConfig) => `${counts.value[card.key]?.total ?? 0} ${card.countUnit}`
const tagText = (card: MentorCardConfig) =>
  card.tagTemplate.replace('{n}', String(counts.value[card.key]?.provinceCount ?? 0))

// ===== 弹窗 =====
const dialogOpen = ref(false)
const activeCard = ref<MentorCardConfig | null>(null)
const openCard = (card: MentorCardConfig) => {
  activeCard.value = card
  dialogOpen.value = true
}
const closeDialog = () => { dialogOpen.value = false }

onMounted(fetchAllCounts)
</script>

<template>
  <section class="section-wrapper section-mentor">
    <div class="section-container reveal">
      <div class="section-head">
        <h2 class="section-title">名师指导</h2>
        <p class="section-sub">不止志愿填报 —— 从高中冲刺到职场上岸，找人、找课、找机构一站直达</p>
      </div>

      <div class="needs-grid">
        <article
          v-for="card in CARDS"
          :key="card.key"
          role="button"
          tabindex="0"
          class="need-card"
          :class="`need-card--${card.accent}`"
          @click="openCard(card)"
          @keydown.enter="openCard(card)"
          @keydown.space.prevent="openCard(card)"
        >
          <span class="need-card__top">
            <span class="need-card__icon" v-html="card.iconSvg"></span>
            <span class="need-card__kind">{{ countText(card) }}</span>
          </span>
          <h3 class="need-card__title">{{ card.title }}</h3>
          <p class="need-card__desc">{{ card.desc }}</p>
          <span class="need-card__foot">
            <span class="need-card__tag">{{ tagText(card) }}</span>
            <span class="need-card__more">
              {{ card.kind === 'person' ? '查看名单' : '查看机构' }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
            </span>
          </span>
        </article>
      </div>
    </div>

    <MentorDialog v-model="dialogOpen" :card="activeCard" @close="closeDialog" />
  </section>
</template>

<style scoped>
/* 区块容器宽度沿用首页 1280px；三列网格铺满，消除留白感 */
.section-mentor {
  position: relative;
  padding: 3.5rem 0;
  scroll-margin-top: 8.75rem;
}
.section-container { max-width: 1280px; margin: 0 auto; }
.section-head { margin-bottom: 2rem; }
.section-title {
  position: relative;
  padding-left: 14px;
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1.5;
  letter-spacing: -0.01em;
}
.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 1.25rem;
  border-radius: 2px;
  background: var(--brand-orange);
}
.section-sub { margin-top: 0.35rem; font-size: 0.95rem; color: #6b7280; line-height: 1.5; }

/* ============ 更多需求 ============ */
.needs-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.need-card {
  --nc: #3b82f6; --nc-soft: #eff6ff; --nc-deep: #1d4ed8; --nc-line: rgba(59,130,246,.28);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.4rem 1.3rem 1.1rem;
  text-align: left;
  background: #fff;
  overflow: hidden;
  cursor: pointer;
  font: inherit;
  color: inherit;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(15,23,42,.04);
  transition: transform .35s cubic-bezier(.32,.72,0,1), box-shadow .35s ease, border-color .35s ease;
}
.need-card::before {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--nc), var(--nc-line) 55%, transparent);
  opacity: .6;
  transition: opacity .35s ease;
}
.need-card:hover { transform: translateY(-4px); border-color: var(--nc-line); box-shadow: 0 14px 30px -10px var(--nc-line); }
.need-card:hover::before { opacity: 1; }
.need-card:focus-visible { outline: 2px solid var(--nc); outline-offset: 2px; }
.need-card__top { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: .9rem; }
.need-card__icon {
  display: flex; align-items: center; justify-content: center;
  width: 2.6rem; height: 2.6rem;
  border-radius: .75rem;
  background: var(--nc-soft);
  color: var(--nc);
  transition: transform .35s cubic-bezier(.32,.72,0,1), background .3s ease, color .3s ease;
}
.need-card:hover .need-card__icon { transform: scale(1.06) rotate(-4deg); background: var(--nc); color: #fff; }
.need-card__icon :deep(svg) { width: 1.3rem; height: 1.3rem; }
.need-card__kind {
  flex-shrink: 0;
  font-size: .7rem;
  font-weight: 600;
  letter-spacing: .04em;
  color: var(--nc-deep);
  background: var(--nc-soft);
  border-radius: 9999px;
  padding: .2rem .6rem;
}
.need-card__title { font-size: 1.0625rem; font-weight: 700; color: #1f2937; letter-spacing: -.01em; }
.need-card__desc { margin-top: .45rem; font-size: .83rem; line-height: 1.75; color: #6b7280; }
.need-card__foot {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px dashed #e2e8f0;
}
.need-card__tag { font-size: .75rem; color: #94a3b8; }
.need-card__more { display: inline-flex; align-items: center; gap: .25rem; font-size: .78rem; font-weight: 600; color: var(--nc-deep); }
.need-card__more svg { width: .85rem; height: .85rem; transition: transform .3s ease; }
.need-card:hover .need-card__more svg { transform: translateX(3px); }
.need-card--blue { --nc: #3b82f6; --nc-soft: #eff6ff; --nc-deep: #1d4ed8; --nc-line: rgba(59,130,246,.28); }
.need-card--indigo { --nc: #6366f1; --nc-soft: #eef2ff; --nc-deep: #4338ca; --nc-line: rgba(99,102,241,.28); }
.need-card--orange { --nc: #f97316; --nc-soft: #fff7ed; --nc-deep: #c2410c; --nc-line: rgba(249,115,22,.28); }
.need-card--green { --nc: #059669; --nc-soft: #ecfdf5; --nc-deep: #047857; --nc-line: rgba(5,150,105,.28); }
.need-card--red { --nc: #ef4444; --nc-soft: #fef2f2; --nc-deep: #b91c1c; --nc-line: rgba(239,68,68,.28); }
.need-card--cyan { --nc: #0891b2; --nc-soft: #ecfeff; --nc-deep: #0e7490; --nc-line: rgba(8,145,178,.28); }

@media (max-width: 1024px) {
  .needs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 768px) {
  .needs-grid { grid-template-columns: 1fr; gap: .75rem; }
  .need-card { padding: 1.15rem 1.1rem .95rem; }
  .need-card__desc { font-size: .82rem; }
  .section-title { font-size: 20px; }
}
</style>
