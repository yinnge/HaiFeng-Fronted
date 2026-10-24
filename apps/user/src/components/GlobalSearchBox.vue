<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { searchUniversity, searchCity, searchMajor } from '@/api/search'
import type { SearchItem } from '@/types/search'

const router = useRouter()

/* -------- 输入与下拉 -------- */
const keyword = ref('')
const focused = ref(false)
const showDropdown = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

interface Seg { text: string; hit: boolean }
interface ResultItem { id: string; name: string; sub?: string; segments: Seg[] }
interface ResultGroup { type: 'university' | 'city' | 'major'; label: string; items: ResultItem[] }

const groups = ref<ResultGroup[]>([])
const loading = ref(false)

/* 高亮：院校/城市/专业按关键字子串 */
function segmentsFromKeyword(text: string, kw: string): Seg[] {
  if (!kw) return [{ text, hit: false }]
  const lower = text.toLowerCase()
  const k = kw.toLowerCase()
  const out: Seg[] = []
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

let debounceTimer: ReturnType<typeof setTimeout> | null = null
function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(runSearch, 300)
}

async function runSearch() {
  const kw = keyword.value.trim()
  if (!kw) {
    groups.value = []
    showDropdown.value = false
    return
  }
  loading.value = true
  try {
    const [u, c, m] = await Promise.allSettled([
      searchUniversity(kw),
      searchCity(kw),
      searchMajor(kw),
    ])
    const next: ResultGroup[] = []
    if (u.status === 'fulfilled') {
      const list = (u.value.data.data || []) as SearchItem[]
      if (list.length) {
        next.push({
          type: 'university',
          label: '院校',
          items: list.map((it) => ({ id: it.id, name: it.name, segments: segmentsFromKeyword(it.name, kw) })),
        })
      }
    }
    if (c.status === 'fulfilled') {
      const list = (c.value.data.data || []) as SearchItem[]
      if (list.length) {
        next.push({
          type: 'city',
          label: '城市',
          items: list.map((it) => ({ id: it.id, name: it.name, segments: segmentsFromKeyword(it.name, kw) })),
        })
      }
    }
    if (m.status === 'fulfilled') {
      const list = (m.value.data.data || []) as SearchItem[]
      if (list.length) {
        next.push({
          type: 'major',
          label: '专业',
          items: list.map((it) => ({ id: it.id, name: it.name, segments: segmentsFromKeyword(it.name, kw) })),
        })
      }
    }
    // 资讯组已移除：原详情页 /gaokao/article/:id 已删除；home 资讯由首页 ArticleListDialog 独立承担
    groups.value = next
    showDropdown.value = focused.value
  } finally {
    loading.value = false
  }
}

function go(item: ResultItem, type: ResultGroup['type']) {
  showDropdown.value = false
  expanded.value = false
  keyword.value = ''
  groups.value = []
  const base =
    type === 'university' ? '/university/'
    : type === 'city' ? '/city/'
    : '/major/'
  router.push(base + item.id)
}

/* -------- 聚焦 / 失焦 -------- */
function onFocus() {
  focused.value = true
  if (keyword.value.trim()) showDropdown.value = true
}
function onBlur() {
  // 延迟关闭，留出点击下拉项的时间
  setTimeout(() => {
    focused.value = false
    showDropdown.value = false
  }, 150)
}

/* -------- 全局 ⌘K / Ctrl+K 唤起 -------- */
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault()
    if (isCompact.value) expanded.value = true
    showDropdown.value = true
    inputRef.value?.focus()
  }
}

/* -------- 点击外部关闭 -------- */
function onDocPointerDown(e: PointerEvent) {
  const t = e.target as Node
  if (panelRef.value && !panelRef.value.contains(t)) {
    showDropdown.value = false
    expanded.value = false
  }
}

/* -------- 响应式：<1100px 收缩为图标按钮（避免笔记本挤压） -------- */
const isCompact = ref(false)
let mql: MediaQueryList | null = null
function applyCompact(e: MediaQueryListEvent | MediaQueryList) {
  isCompact.value = e.matches
  if (e.matches) expanded.value = false
}
const expanded = ref(false)
function toggleExpand() {
  expanded.value = !expanded.value
  if (expanded.value) {
    showDropdown.value = true
    setTimeout(() => inputRef.value?.focus(), 50)
  }
}

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    mql = window.matchMedia('(max-width: 1099px)')
    isCompact.value = mql.matches
    mql.addEventListener('change', applyCompact)
  }
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('pointerdown', onDocPointerDown)
})
onBeforeUnmount(() => {
  mql?.removeEventListener('change', applyCompact)
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onDocPointerDown)
  if (debounceTimer) clearTimeout(debounceTimer)
})

// 路由切换时收起
watch(
  () => router.currentRoute.value.fullPath,
  () => {
    showDropdown.value = false
    expanded.value = false
  },
)

const hasResults = computed(() => groups.value.some((g) => g.items.length > 0))
</script>

<template>
  <div class="gs-root" :class="{ compact: isCompact, expanded }">
    <!-- 收缩态：纯图标按钮 -->
    <button
      v-if="isCompact"
      type="button"
      class="gs-icon-btn"
      aria-label="全站查询"
      @click="toggleExpand"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="9" r="6" />
        <path stroke-linecap="round" d="M14 14l3.5 3.5" />
      </svg>
    </button>

    <!-- 展开态：搜索胶囊 + 分组下拉 -->
    <div v-show="!isCompact || expanded" ref="panelRef" class="gs-panel">
      <div class="gs-input-wrap" :class="{ focused }">
        <svg class="gs-magnifier" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="9" r="6" />
          <path stroke-linecap="round" d="M14 14l3.5 3.5" />
        </svg>
        <input
          ref="inputRef"
          v-model="keyword"
          class="gs-input"
          type="text"
          placeholder="全站查询"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
          @keydown.down.prevent
          @keydown.esc="showDropdown = false"
        />
        <kbd class="gs-kbd">⌘K</kbd>

        <Transition name="gs-drop">
          <div v-if="showDropdown && (hasResults || loading)" class="gs-dropdown">
            <div v-if="loading" class="gs-drop-loading">搜索中…</div>
            <template v-for="g in groups" :key="g.type">
              <div v-if="g.items.length" class="gs-group">
                <div class="gs-group-label">{{ g.label }}</div>
                <button
                  v-for="it in g.items"
                  :key="g.type + '-' + it.id"
                  type="button"
                  class="gs-item"
                  @mousedown.prevent="go(it, g.type)"
                >
                  <span class="gs-item-name">
                    <template v-for="(s, i) in it.segments" :key="i"
                      ><span :class="{ 'gs-hit': s.hit }">{{ s.text }}</span></template
                    >
                  </span>
                  <span v-if="it.sub" class="gs-item-sub">{{ it.sub }}</span>
                </button>
              </div>
            </template>
            <div v-if="!loading && !hasResults" class="gs-drop-empty">未找到相关结果</div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gs-root {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.gs-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #999;
  transition: all 0.2s ease;
}
.gs-icon-btn:hover {
  background: var(--neutral-bg);
  color: var(--brand-orange-dark);
}
.gs-icon-btn svg {
  width: 20px;
  height: 20px;
}

.gs-panel {
  display: flex;
  align-items: center;
  justify-content: center; /* 在剩余空间内居中：宽屏靠中、窄屏自动被两侧压缩 */
  flex: 1;
  min-width: 0;
  position: relative;
}

/* 搜索胶囊（整条：放大镜 + 输入框 + ⌘K + 下拉），宽度可随导航收缩 */
.gs-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 360px;
  min-width: 0;
  height: 38px;
  padding: 0 12px 0 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03);
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.gs-input-wrap:hover {
  background: #fff;
  border-color: #cbd5e1;
}
.gs-input-wrap.focused {
  background: #fff;
  border-color: var(--brand-orange);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12), 0 4px 12px rgba(15, 23, 42, 0.04);
}
.gs-magnifier {
  width: 16px;
  height: 16px;
  color: #999;
  flex-shrink: 0;
}
.gs-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #333;
}
.gs-input::placeholder {
  color: #999;
}
.gs-kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  font-weight: 600;
  color: #64748B;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 3px 8px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
  line-height: 1.4;
}

/* 下拉 */
.gs-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  min-width: 320px;
  max-height: 60vh;
  overflow-y: auto;
  background: #fff;
  border: 1px solid var(--neutral-border-strong);
  border-radius: 12px;
  box-shadow: 0 12px 40px var(--neutral-shadow-hover);
  padding: 6px;
  z-index: 200;
}
.gs-drop-loading,
.gs-drop-empty {
  padding: 14px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
.gs-group + .gs-group {
  margin-top: 2px;
  border-top: 1px solid var(--neutral-border);
}
.gs-group-label {
  padding: 6px 10px 2px;
  font-size: 11px;
  font-weight: 700;
  color: #bbb;
  letter-spacing: 0.05em;
}
.gs-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  text-align: left;
  transition: background 0.15s ease;
}
.gs-item:hover {
  background: var(--neutral-bg);
}
.gs-item-name {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gs-hit {
  color: var(--brand-orange-dark);
  font-weight: 700;
}
.gs-item-sub {
  font-size: 11px;
  color: #bbb;
  flex-shrink: 0;
}

.gs-drop-enter-active,
.gs-drop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.gs-drop-enter-from,
.gs-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 笔记本等中等宽度：收窄搜索胶囊，把空间让给右侧功能区（自适应防挤压） */
@media (max-width: 1500px) {
  .gs-input-wrap {
    max-width: 300px;
  }
}

@media (max-width: 1280px) {
  .gs-input-wrap {
    max-width: 260px;
  }
}
</style>
