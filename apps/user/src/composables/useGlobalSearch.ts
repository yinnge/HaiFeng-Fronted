import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { searchUniversity, searchCity, searchMajor } from '@/api/search'
import type { SearchItem } from '@/types/search'

export interface SearchSeg {
  text: string
  hit: boolean
}
export interface SearchResultItem {
  id: string
  name: string
  sub?: string
  segments: SearchSeg[]
}
export type SearchResultType = 'university' | 'city' | 'major'
export interface SearchResultGroup {
  type: SearchResultType
  label: string
  items: SearchResultItem[]
}

const TYPE_LABEL: Record<SearchResultType, string> = {
  university: '院校',
  city: '城市',
  major: '专业',
}

/** 关键字子串高亮分段（院校/城市/专业名称按关键字匹配） */
export function highlightSegments(text: string, kw: string): SearchSeg[] {
  if (!kw) return [{ text, hit: false }]
  const lower = text.toLowerCase()
  const k = kw.toLowerCase()
  const out: SearchSeg[] = []
  let cursor = 0
  let idx: number
  while ((idx = lower.indexOf(k, cursor)) !== -1) {
    if (idx > cursor) out.push({ text: text.slice(cursor, idx), hit: false })
    out.push({ text: text.slice(idx, idx + k.length), hit: true })
    cursor = idx + k.length
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), hit: false })
  return out.length ? out : [{ text, hit: false }]
}

/**
 * 全局搜索核心（导航搜索框 与 Hero 搜索框 共用）。
 * 仅封装「请求 + 结果 + 导航」，不涉及任何 UI 状态（下拉显隐、快捷键、compact 等由各组件自理）。
 * 不改变现有导航搜索的提交/跳转行为。
 */
export function useGlobalSearch() {
  const router = useRouter()
  const keyword = ref('')
  const groups = ref<SearchResultGroup[]>([])
  const loading = ref(false)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  async function runSearch(): Promise<void> {
    const kw = keyword.value.trim()
    if (!kw) {
      groups.value = []
      loading.value = false
      return
    }
    loading.value = true
    try {
      const results = await Promise.allSettled([
        searchUniversity(kw),
        searchCity(kw),
        searchMajor(kw),
      ])
      const next: SearchResultGroup[] = []
      const push = (r: PromiseSettledResult<{ data: { data: SearchItem[] } }>, type: SearchResultType) => {
        if (r.status === 'fulfilled' && r.value) {
          const list = (r.value.data.data || []) as SearchItem[]
          if (list.length) {
            next.push({
              type,
              label: TYPE_LABEL[type],
              items: list.map((it) => ({ id: it.id, name: it.name, segments: highlightSegments(it.name, kw) })),
            })
          }
        }
      }
      push(results[0], 'university')
      push(results[1], 'city')
      push(results[2], 'major')
      groups.value = next
    } finally {
      loading.value = false
    }
  }

  function onInput(): void {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(runSearch, 300)
  }

  /** 跳转到结果详情页（与现有导航搜索完全一致） */
  function go(item: SearchResultItem, type: SearchResultType): void {
    const base = type === 'university' ? '/university/' : type === 'city' ? '/city/' : '/major/'
    router.push(base + item.id)
  }

  function reset(): void {
    keyword.value = ''
    groups.value = []
    loading.value = false
  }

  const hasResults = computed(() => groups.value.some((g) => g.items.length > 0))

  return { keyword, groups, loading, hasResults, runSearch, onInput, go, highlightSegments, reset }
}
