<script setup lang="ts">
// apps/user/src/components/gaokao/ArticleSearchBox.vue
// 资讯标题关键字搜索框：省份筛选（默认「全国」=不限）+ 输入防抖搜索 + 下弹建议（命中段橙色高亮）。
// 点击/回车选中后 emit('select', id)，由父组件决定跳转；请求侧带序号丢弃过期响应。
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { searchGaokaoArticles, type GaokaoArticleSearchItemVO } from '@/api/article'
import ProvincePicker from './ProvincePicker.vue'

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

/** '' = 全国（不限省份，不传给后端） */
const province = ref('')
const keyword = ref('')
const suggestions = ref<GaokaoArticleSearchItemVO[]>([])
const open = ref(false)
const loading = ref(false)
const rootRef = ref<HTMLElement | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
/** 请求序号：只接受最后一次请求的响应，防止慢响应覆盖新结果 */
let requestSeq = 0

function scheduleSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => void doSearch(), 300)
}

async function doSearch() {
  const kw = keyword.value.trim()
  if (!kw) {
    suggestions.value = []
    open.value = false
    loading.value = false
    return
  }
  const seq = ++requestSeq
  loading.value = true
  try {
    const res = await searchGaokaoArticles({
      keyword: kw,
      province: province.value || undefined,
      limit: 10,
    })
    if (seq !== requestSeq) return
    suggestions.value = res.data.data
    open.value = true
  } catch {
    if (seq !== requestSeq) return
    suggestions.value = []
    open.value = false
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}

watch(keyword, scheduleSearch)
// 切换省份时若已有关键字立即重查（不走防抖）
watch(province, () => {
  if (keyword.value.trim()) void doSearch()
})

function onPick(item: GaokaoArticleSearchItemVO) {
  open.value = false
  emit('select', item.id)
}

function onEnter() {
  if (suggestions.value.length) onPick(suggestions.value[0])
}

/** 按高亮区间把标题切段；游标推进兜底重叠/倒序区间 */
function segments(item: GaokaoArticleSearchItemVO): { text: string; hit: boolean }[] {
  const parts: { text: string; hit: boolean }[] = []
  const sorted = [...item.highlight].sort((a, b) => a.start - b.start)
  let cursor = 0
  for (const s of sorted) {
    if (s.start < cursor || s.end > item.title.length || s.start >= s.end) continue
    if (s.start > cursor) parts.push({ text: item.title.slice(cursor, s.start), hit: false })
    parts.push({ text: item.title.slice(s.start, s.end), hit: true })
    cursor = s.end
  }
  if (cursor < item.title.length) parts.push({ text: item.title.slice(cursor), hit: false })
  return parts
}

// 点击组件外部关闭下拉
function onDocumentMousedown(e: MouseEvent) {
  if (!rootRef.value?.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('mousedown', onDocumentMousedown))
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentMousedown)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div ref="rootRef" class="asb-row">
    <ProvincePicker v-model="province" variant="bar" national placeholder="全国" />
    <div class="asb-field">
      <div class="asb-input-wrap">
        <svg class="asb-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
        </svg>
        <input
          v-model="keyword"
          type="text"
          class="asb-input"
          placeholder="搜索资讯标题，如：山西高考2026分数线"
          @keydown.enter.prevent="onEnter"
        />
      </div>
      <div v-if="open" class="asb-panel">
        <div v-if="loading" class="asb-empty">搜索中…</div>
        <template v-else-if="suggestions.length">
          <button
            v-for="item in suggestions"
            :key="item.id"
            type="button"
            class="asb-item"
            @click="onPick(item)"
          >
            <span class="asb-title">
              <span
                v-for="(p, i) in segments(item)"
                :key="i"
                :class="p.hit ? 'asb-hit' : undefined"
              >{{ p.text }}</span>
            </span>
            <span class="asb-tags">
              <span v-if="item.columnName" class="asb-tag">{{ item.columnName }}</span>
              <span class="asb-tag">{{ item.province || '全国' }}</span>
            </span>
          </button>
        </template>
        <div v-else class="asb-empty">未找到相关资讯</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.asb-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.asb-field {
  position: relative;
  flex: 1;
  min-width: 0;
}

.asb-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 14px;
  background: #fff;
  border: 1px solid rgba(249, 115, 22, 0.25);
  border-radius: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.asb-input-wrap:focus-within {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
}

.asb-ico {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #fb923c;
}

.asb-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #1f2937;
}

.asb-input::placeholder {
  color: #9ca3af;
}

.asb-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 30;
  max-height: 380px;
  overflow-y: auto;
  padding: 6px;
  background: #fff;
  border: 1px solid rgba(249, 115, 22, 0.12);
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(249, 115, 22, 0.12);
}

.asb-item {
  display: block;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;
}

.asb-item:hover {
  background: #fff7ed;
}

.asb-title {
  display: block;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.asb-hit {
  color: #f97316;
  font-weight: 600;
}

.asb-tags {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.asb-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  color: #e8722a;
  background: rgba(249, 115, 22, 0.08);
  border: 1px solid rgba(249, 115, 22, 0.18);
}

.asb-empty {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}
</style>
