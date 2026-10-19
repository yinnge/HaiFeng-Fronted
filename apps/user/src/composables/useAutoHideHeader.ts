// apps/user/src/composables/useAutoHideHeader.ts
// 导航栏「滚动收起 / 回到顶部显示」逻辑（全局单例复用）。
// 规则：仅主页（/）始终显示；其余所有页面滚动离开顶部后自动收起（抽屉式上滑），
//       滚回页面最上方才重新显示。
// 说明：hidden 为「模块级单例」——AppHeader 与所有吸顶子条（ArchiveBar / EnglishBar /
//       FileLoadPage 的 stage-nav）共享同一状态。全局头部收起时，子条把 sticky 的 top
//       收为 0 即可填补顶部空隙，避免留下一段空白。
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'

// 距顶多少像素内视为「最上方」（避免 1~2px 抖动导致反复显隐）
const SCROLL_TOP_THRESHOLD = 8

// ===== 单例状态（所有调用方共享同一 hidden） =====
const hidden = ref(false)
let routeRef: ReturnType<typeof useRoute> | null = null
let refCount = 0

function evaluate() {
  hidden.value = !!routeRef && routeRef.path !== '/' && window.scrollY > SCROLL_TOP_THRESHOLD
}

function onScroll() {
  evaluate()
}

export function useAutoHideHeader() {
  if (!routeRef) routeRef = useRoute()

  // 全局滚动监听只挂一次（首个调用方挂载时）
  if (refCount === 0) {
    window.addEventListener('scroll', onScroll, { passive: true })
    evaluate()
  }
  refCount++

  // 路由切换后重新评估（新页面通常回到顶部 → 显示；同时保留浏览器前进/后退的滚动位置）
  watch(
    () => routeRef!.path,
    async () => {
      await nextTick()
      evaluate()
    },
  )

  onBeforeUnmount(() => {
    refCount--
    if (refCount <= 0) {
      refCount = 0
      window.removeEventListener('scroll', onScroll)
    }
  })

  return { hidden }
}
