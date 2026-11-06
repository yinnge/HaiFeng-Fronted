import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/**
 * 循环动画暂停控制（§11）：
 * Hero 滚出视口（IntersectionObserver）或标签页隐藏（document.hidden）时，
 * 暂停刻度旋转 / 连线流动 / 呼吸点等无关节奏动画，节省 CPU、避免后台空转。
 */
export function useLoopPausable(getEl: () => HTMLElement | null) {
  const inView = ref(true)
  const docHidden = ref(false)
  const paused = computed(() => !inView.value || docHidden.value)

  let io: IntersectionObserver | null = null
  const onVisibility = () => {
    docHidden.value = document.hidden
  }

  onMounted(() => {
    const el = getEl()
    if (el && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          inView.value = entries[0]?.isIntersecting ?? true
        },
        { threshold: 0.01 },
      )
      io.observe(el)
    }
    docHidden.value = document.hidden
    document.addEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    io?.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
  })

  return { paused }
}
