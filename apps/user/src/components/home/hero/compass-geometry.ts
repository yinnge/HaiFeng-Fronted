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
  return {
    left: `${x}px`,
    top: `${y}px`,
    transform: `translate(-50%, -50%) scale(${baseScale * entScale})`,
    opacity: isOther ? '0' : ctx.entered ? '1' : '0',
    pointerEvents: isOther ? 'none' : 'auto',
    transitionDelay: ctx.entered ? (isActive ? '0ms' : '40ms') : `${i * 70}ms`,
  }
}

/** 中心圆盘样式（含入场缩放因子） */
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
