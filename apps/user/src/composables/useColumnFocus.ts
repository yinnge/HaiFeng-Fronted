import { ref, type Ref } from 'vue'

export interface ColumnFocusRequest {
  /** 专栏 key（矩阵卡片 id） */
  columnKey: string
  /** 模块主色 hex，用于矩阵高亮的脉冲柔光环 */
  color: string
  /** 每次递增，保证重复点击同一专栏也能再次触发 */
  nonce: number
}

/** 模块级单例：Hero 发起聚焦请求，「全周期生涯规划导航」区块 watch 处理 */
const focusRequest: Ref<ColumnFocusRequest | null> = ref(null)
let nonce = 0

/** Hero → 导航区块 发起聚焦请求 */
export function requestColumnFocus(columnKey: string, color: string): void {
  nonce += 1
  focusRequest.value = { columnKey, color, nonce }
}

export function useColumnFocus() {
  return { focusRequest, requestColumnFocus }
}

/** 16 进制色 → "r, g, b" 字符串，供 `is-hf-pulse` 的 `rgba(var(--hf-pulse-rgb), a)` 使用 */
export function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

/**
 * 动态计算 sticky/fixed 导航总高度（不写死数字）：
 * 仅累加「当前贴顶（rect.top≈0）」的 .top-toolbar / .app-header 的高度。
 * 滚动到下方区块时 AppHeader 自动收起（translateY -100%），不会重复计入。
 */
export function getNavOffset(): number {
  let offset = 0
  for (const sel of ['.top-toolbar', '.app-header'] as const) {
    const el = document.querySelector(sel) as HTMLElement | null
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    const stuck = cs.position === 'sticky' || cs.position === 'fixed'
    if (stuck && rect.top <= 1 && rect.height > 0) offset += rect.height
  }
  return offset
}

/**
 * 平滑滚动元素进入可视区；动画结束后 resolve（保证后续高亮/选中在用户可见时触发）。
 * @param el         目标元素
 * @param opts.center true=垂直居中（扣除导航偏移）；false=顶部贴近导航偏移下方
 */
export function scrollToElement(el: HTMLElement, opts?: { center?: boolean }): Promise<void> {
  return new Promise((resolve) => {
    const navOffset = getNavOffset()
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    const top =
      opts?.center === false
        ? window.scrollY + rect.top - navOffset - 16
        : window.scrollY + rect.top - navOffset - (vh - navOffset) / 2 + rect.height / 2
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' })

    let done = false
    const finish = () => {
      if (done) return
      done = true
      window.removeEventListener('scrollend', finish)
      resolve()
    }
    // scrollend 优先；不支持时 / 超时降级为 700ms
    if ('onscrollend' in window) {
      window.addEventListener('scrollend', finish, { once: true })
    }
    window.setTimeout(finish, 700)
  })
}
