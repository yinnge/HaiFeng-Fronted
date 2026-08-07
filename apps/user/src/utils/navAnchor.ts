import type { Router } from 'vue-router'
import type { NavSubItem } from '@/config/navigation'

/**
 * 平滑滚动到页面内锚点（id）。
 * 注意：user 端 router 的 scrollBehavior 固定返回 { top: 0 }，不处理 hash，
 * 所以带 # 的路由必须手动滚动到目标元素。
 */
export function scrollToHash(hash: string, retry = 2): void {
  const el = document.getElementById(hash)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  // 目标元素尚未渲染（例如刚跳转、数据未加载完），延迟重试
  if (retry > 0) {
    setTimeout(() => scrollToHash(hash, retry - 1), 120)
  }
}

/**
 * 处理导航子项点击，兼容带锚点（#）的路由：
 * - 无 hash：普通跳转
 * - 已在目标页：直接滚动到锚点
 * - 不在目标页：跳转后等 DOM 渲染再滚动到锚点
 */
export async function pushNavItem(router: Router, currentPath: string, sub: NavSubItem): Promise<void> {
  if (!sub.route) return
  const hashIdx = sub.route.indexOf('#')
  if (hashIdx === -1) {
    await router.push(sub.route)
    return
  }
  const path = sub.route.slice(0, hashIdx)
  const hash = sub.route.slice(hashIdx + 1)
  if (currentPath === path) {
    scrollToHash(hash)
    return
  }
  // 跨页：只负责跳转，滚动交给目标页面在「数据 + DOM 就绪」后处理。
  // 否则此处会在目标页 loading 占位期（卡片未展开）抢先滚动到错误位置，造成抖动。
  await router.push({ path, hash })
}
