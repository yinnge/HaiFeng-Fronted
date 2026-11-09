import {
  COMPASS_CENTER,
  COMPASS_EXPANDED_CENTER,
  HERO_COLUMNS,
  type HeroModule,
  type ColumnKey,
} from './hero.config'

export interface CompassCtx {
  expanded: boolean
  activeKey: string | null
  entered: boolean
  pinned: boolean
}

/** 模块节点定位 + 入场/展开态样式（纯函数，便于单测与拆分） */
export function moduleStyle(m: HeroModule, i: number, ctx: CompassCtx): Record<string, string> {
  const isActive = ctx.expanded && ctx.activeKey === m.key
  const isOther = ctx.expanded && ctx.activeKey !== m.key
  const x = isActive ? COMPASS_EXPANDED_CENTER.x : m.center.x
  const y = isActive ? COMPASS_EXPANDED_CENTER.y : m.center.y
  const baseScale = isActive ? 1.15 : isOther ? 0.92 : 1
  const entScale = ctx.entered ? 1 : 0.6
  const delay = ctx.entered ? (isActive ? '0ms' : '40ms') : `${i * 70}ms`
  return {
    left: `${x}px`,
    top: `${y}px`,
    /* 缩放只交给 .hf-node-inner::before 这个「纯装饰背景层」消费。
       节点标题 / 副标题 / 序号徽标 / 热门标签都是文字，绝不能跟着 scale
       进入合成层位图插值（见 AGENTS.md 第六节铁律 2）。
       定位也不再用 translate(-50%,-50%)，改由 CSS 负 margin 完成。 */
    '--hf-node-scale': String(baseScale * entScale),
    '--hf-node-delay': delay,
    opacity: isOther ? '0' : ctx.entered ? '1' : '0',
    pointerEvents: isOther ? 'none' : 'auto',
  }
}

/** 中心圆盘样式（含入场缩放因子）
 *  中心圆盘只有 logo 图片、无文字，属于纯装饰层，scale 合法；
 *  展开态的收缩同样不会波及其余文字节点。 */
export function centerStyle(ctx: CompassCtx): Record<string, string> {
  const baseScale = ctx.expanded ? 0.92 : 1
  const entScale = ctx.entered ? 1 : 0.6
  return {
    left: `${COMPASS_CENTER.x}px`,
    top: `${COMPASS_CENTER.y}px`,
    transform: `translate(-50%, -50%) scale(${baseScale * entScale})`,
    opacity: ctx.expanded ? '0' : ctx.entered ? '1' : '0',
    pointerEvents: ctx.expanded ? 'none' : 'auto',
  }
}

/** 无障碍标签（单专栏直达 / 多专栏展开提示） */
export function moduleAria(m: HeroModule, ctx: CompassCtx): string {
  if (m.type === 'single') return `${m.name}，按回车定位到下方专栏`
  const titles = m.columns.map((k) => HERO_COLUMNS[k as ColumnKey].title).join('、')
  return `${m.name}，包含${titles}，${ctx.pinned && ctx.activeKey === m.key ? '已展开' : '按回车展开'}`
}

/** 展开态下，非当前模块移出 Tab 序（§13） */
export function tabIndexFor(m: HeroModule, ctx: CompassCtx): number {
  if (ctx.expanded && ctx.activeKey !== m.key) return -1
  return 0
}
