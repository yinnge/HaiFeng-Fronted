<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

/**
 * 百宝箱（与核心服务导航同级别的工具导航）：
 * 5 张「双层包边」卡组成的非对称 Bento 网格 —— 首卡（院校查询）占 2 列 2 行作为主卡，其余 4 张单列错落。
 * 每张卡：极细线图标 + 库标签 + 标题 + 一句话说明 + 竖排路由条目（可带小标签）+ 药丸 CTA（内嵌圆形箭头）。
 * 入场为 IntersectionObserver 驱动的分级上浮（只动 transform / opacity）。
 * 主页区块与悬浮窗弹框共用本组件。
 */

interface BoxItem {
  label: string
  route?: string
  /** 条目右侧的短标签（品类/学段说明） */
  tag?: string
}

interface BoxCard {
  title: string
  /** 右上角库标签 */
  badge: string
  /** 一句话说明 */
  desc: string
  /** 主 CTA 文案 */
  cta: string
  /** 主 CTA 路由（缺省取第一个有条目的条目） */
  route?: string
  /** 是否为主卡（占 2 列 2 行） */
  featured?: boolean
  /** 条目列表 */
  items: BoxItem[]
  /** 图标标识 */
  icon: 'school' | 'book' | 'pin' | 'building' | 'trophy'
}

const cards: BoxCard[] = [
  {
    title: '院校查询',
    badge: '院校库',
    desc: '覆盖全国高校信息、历年录取与培养画像，211、985 一网打尽。',
    cta: '进入院校库',
    route: '/university',
    featured: true,
    icon: 'school',
    items: [
      { label: '院校列表', route: '/university', tag: '本科' },
      { label: '专业组查询', route: '/gaokao/groups', tag: '高考' },
      { label: '特殊招生通道', route: '/special', tag: '强基' },
    ],
  },
  {
    title: '专业查询',
    badge: '专业库',
    desc: '热门与冷门并行，就业薪酬、学科评估一次看清。',
    cta: '查专业',
    route: '/major',
    icon: 'book',
    items: [
      { label: '本科专业', route: '/major', tag: '热门' },
      { label: '考研专业', route: '/postgrad-exam', tag: '备考' },
    ],
  },
  {
    title: '城市查询',
    badge: '城市库',
    desc: '城市发展、生活成本，就业机会与落户政策全览。',
    cta: '看城市',
    route: '/city',
    icon: 'pin',
    items: [{ label: '城市列表', route: '/city', tag: '完整' }],
  },
  {
    title: '企业行业',
    badge: '雇主库',
    desc: '行业趋势与龙头企业，薪资水平深度解析。',
    cta: '查企业',
    route: '/enterprise',
    icon: 'building',
    items: [
      { label: '企业查询', route: '/enterprise', tag: '雇主' },
      { label: '行业查询', route: '/industry', tag: '产业' },
    ],
  },
  {
    title: '竞赛证书',
    badge: '赛证库',
    desc: '国家级、省级赛事信息与证书考取一览。',
    cta: '查竞赛',
    route: '/competition',
    icon: 'trophy',
    items: [
      { label: '竞赛', route: '/competition', tag: '赛事' },
      { label: '证书', route: '/certificate', tag: '技能' },
    ],
  },
]

const router = useRouter()

function go(item: BoxItem | BoxCard) {
  if (!item.route) {
    ElMessage.info('该功能正在开发中')
    return
  }
  router.push(item.route)
}

/** 分级上浮入场：仅在首次进入视口时触发一次 */
const rootEl = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null

onMounted(() => {
  if (!rootEl.value || typeof IntersectionObserver === 'undefined') {
    rootEl.value?.classList.add('tb-in')
    return
  }
  io = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('tb-in')
          io?.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  )
  const shells = rootEl.value.querySelectorAll('.tb-shell')
  shells.forEach(el => io?.observe(el))
})

onBeforeUnmount(() => {
  io?.disconnect()
  io = null
})
</script>

<template>
  <div ref="rootEl" class="treasure-box">
    <div class="tb-bento">
      <article
        v-for="(card, ci) in cards"
        :key="card.title"
        class="tb-shell"
        :class="{ 'is-hero': card.featured }"
        :style="{ '--i': ci }"
      >
        <div class="tb-core">
          <header class="tb-head">
            <span class="tb-icon" aria-hidden="true">
              <!-- 极细线图标（stroke 1.2） -->
              <svg v-if="card.icon === 'school'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 10.2 12 5l9 5.2" /><path d="M5.5 11.8V19h13v-7.2" /><path d="M12 5v14" />
              </svg>
              <svg v-else-if="card.icon === 'book'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" /><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
              </svg>
              <svg v-else-if="card.icon === 'pin'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 21s6.5-6.1 6.5-10.4A6.5 6.5 0 0 0 5.5 10.6C5.5 14.9 12 21 12 21z" /><circle cx="12" cy="10.4" r="2.4" />
              </svg>
              <svg v-else-if="card.icon === 'building'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 20V7.5L13 4v16" /><path d="M13 20h7V9.5L13 7" /><path d="M7.2 10h2.6M7.2 13.4h2.6M7.2 16.8h2.6M15.4 12h2.2M15.4 15.4h2.2" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 4.5h10v4a5 5 0 0 1-10 0z" /><path d="M7 6H4.5v1.5A2.5 2.5 0 0 0 7 10M17 6h2.5v1.5A2.5 2.5 0 0 1 17 10" /><path d="M12 13.5V17M9 20h6M10 17h4v3h-4z" />
              </svg>
            </span>
            <span class="tb-badge">{{ card.badge }}</span>
          </header>

          <h3 class="tb-card-title">
            {{ card.title }}
            <svg class="tb-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </h3>

          <p class="tb-desc">{{ card.desc }}</p>

          <ul class="tb-list">
            <li v-for="item in card.items" :key="item.label">
              <button type="button" class="tb-item" @click="go(item)">
                <span class="tb-item-dot" aria-hidden="true" />
                <span class="tb-item-label">{{ item.label }}</span>
                <span v-if="item.tag" class="tb-item-tag">{{ item.tag }}</span>
              </button>
            </li>
          </ul>

          <button type="button" class="tb-cta" @click="go(card)">
            <span>{{ card.cta }}</span>
            <span class="tb-cta-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h13M12.5 6l6 6-6 6" />
              </svg>
            </span>
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.treasure-box {
  width: 100%;
}

/* ============ 非对称 Bento：主卡 2 列 2 行，其余单列 ============ */
.tb-bento {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.05rem;
  align-items: stretch;
}

.tb-shell {
  grid-column: span 1;
  border-radius: 26px;
  padding: 7px; /* 双层包边：外壳留白 */
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 247, 237, 0.5));
  box-shadow: inset 0 0 0 1px rgba(194, 65, 12, 0.08);
  transition: transform 0.7s cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 0.7s cubic-bezier(0.32, 0.72, 0, 1);
}

.tb-shell.is-hero {
  grid-column: span 2;
  grid-row: span 2;
}

.tb-shell:hover {
  transform: translateY(-5px);
  box-shadow: inset 0 0 0 1px rgba(194, 65, 12, 0.14),
    0 26px 54px -22px rgba(154, 52, 18, 0.4);
}

.tb-core {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 1.15rem 1.2rem 1.2rem;
  border-radius: calc(26px - 7px);
  background: linear-gradient(170deg, #fffdfa 0%, #fff8f0 100%);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.9);
}

/* ============ 卡头：图标 + 库标签 ============ */
.tb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.tb-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 14px;
  color: #c2410c;
  background: linear-gradient(150deg, #fff1e2, #ffe0c2);
  box-shadow: inset 0 0 0 1px rgba(194, 65, 12, 0.12);
  flex-shrink: 0;
}

.tb-icon svg {
  width: 1.15rem;
  height: 1.15rem;
}

.tb-badge {
  padding: 0.2rem 0.62rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #b45309;
  background: rgba(255, 237, 213, 0.9);
  box-shadow: inset 0 0 0 1px rgba(234, 88, 12, 0.14);
  white-space: nowrap;
}

/* ============ 标题 / 说明 ============ */
.tb-card-title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.15rem;
  font-size: 1.06rem;
  font-weight: 800;
  color: #292524;
  letter-spacing: -0.01em;
}

.tb-chev {
  width: 0.85rem;
  height: 0.85rem;
  color: #d6a58a;
  transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1),
    color 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.tb-shell:hover .tb-chev {
  transform: translateX(3px);
  color: #ea580c;
}

.tb-desc {
  font-size: 0.8rem;
  line-height: 1.65;
  color: #a8a29e;
}

/* 主卡信息量更大 */
.tb-shell.is-hero .tb-card-title {
  font-size: 1.22rem;
}

.tb-shell.is-hero .tb-desc {
  font-size: 0.84rem;
  max-width: 30ch;
}

/* ============ 条目列表 ============ */
.tb-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-top: 0.2rem;
}

.tb-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.42rem 0.5rem;
  border: none;
  border-radius: 12px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.4s cubic-bezier(0.32, 0.72, 0, 1),
    transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.tb-item:hover {
  background: rgba(255, 255, 255, 0.92);
  transform: translateX(3px);
}

.tb-item:active {
  transform: translateX(3px) scale(0.985);
}

.tb-item-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #f97316;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
}

.tb-item-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #57534e;
  transition: color 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.tb-item:hover .tb-item-label {
  color: #ea580c;
}

.tb-item-tag {
  margin-left: auto;
  padding: 0.1rem 0.42rem;
  border-radius: 999px;
  font-size: 0.64rem;
  font-weight: 600;
  color: #c2410c;
  background: rgba(255, 237, 213, 0.85);
  white-space: nowrap;
}

/* ============ CTA：药丸 + 内嵌圆形箭头 ============ */
.tb-cta {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 0.75rem 0.6rem 1.1rem;
  border: none;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(96deg, #f97316, #fb923c);
  box-shadow: 0 10px 22px -12px rgba(234, 88, 12, 0.85);
  cursor: pointer;
  transition: transform 0.6s cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 0.6s cubic-bezier(0.32, 0.72, 0, 1);
}

.tb-cta:active {
  transform: scale(0.975);
}

.tb-cta-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.55rem;
  height: 1.55rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  transition: transform 0.6s cubic-bezier(0.32, 0.72, 0, 1),
    background 0.6s cubic-bezier(0.32, 0.72, 0, 1);
}

.tb-cta-arrow svg {
  width: 0.9rem;
  height: 0.9rem;
}

.tb-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px -14px rgba(234, 88, 12, 0.95);
}

.tb-cta:hover .tb-cta-arrow {
  transform: translate(3px, -1px) scale(1.06);
  background: rgba(255, 255, 255, 0.32);
}

/* 卡片顶部留白，CTA 贴底对齐 */
.tb-core > .tb-list {
  margin-bottom: 0.6rem;
}

/* ============ 分级上浮入场（只动 transform / opacity） ============ */
.tb-shell {
  opacity: 0;
  transform: translateY(22px);
}

.tb-shell.tb-in {
  opacity: 1;
  transform: none;
  transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.85s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.7s cubic-bezier(0.32, 0.72, 0, 1);
  transition-delay: calc(var(--i) * 70ms);
}

/* 悬浮窗弹框内的卡片：弹框自身已做级联，卡内不再重复入场 */
:deep(.ft-modal) .tb-shell {
  opacity: 1;
  transform: none;
}

/* ============ 响应式 ============ */
@media (max-width: 1180px) {
  .tb-bento {
    grid-template-columns: repeat(4, 1fr);
  }

  .tb-shell.is-hero {
    grid-column: span 2;
    grid-row: span 1;
  }
}

@media (max-width: 900px) {
  .tb-bento {
    grid-template-columns: repeat(2, 1fr);
  }

  .tb-shell.is-hero {
    grid-column: span 2;
    grid-row: span 1;
  }
}

@media (max-width: 560px) {
  .tb-bento {
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }

  .tb-shell,
  .tb-shell.is-hero {
    grid-column: span 1;
    grid-row: span 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tb-shell,
  .tb-shell.tb-in,
  .tb-item,
  .tb-cta,
  .tb-cta-arrow,
  .tb-chev {
    transition: none;
  }

  .tb-shell {
    opacity: 1;
    transform: none;
  }
}
</style>
