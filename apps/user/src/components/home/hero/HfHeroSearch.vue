<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Search, ArrowRight } from 'lucide-vue-next'
import { useGlobalSearch, type SearchResultItem, type SearchResultType } from '@/composables/useGlobalSearch'
import { HERO_HOT_SEARCH, HERO_SEARCH_PLACEHOLDER, HOT_TAG_COLOR } from './hero.config'

const search = useGlobalSearch()
const { keyword, groups, loading, hasResults, runSearch, onInput, go, reset } = search

const focused = ref(false)
const showDropdown = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

// 现有搜索不支持类型参数（院校/城市/专业为 3 个独立接口，且无「分数线/政策」检索），
// 按 §6.1 条件：不渲染分段切换器，仅保留输入框。

function onFocus() {
  focused.value = true
  if (keyword.value.trim()) showDropdown.value = true
}
function onBlur() {
  // 延迟关闭，留出点击下拉项的时间
  window.setTimeout(() => {
    focused.value = false
    showDropdown.value = false
  }, 150)
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    // 提交（回车）：仅确保搜索执行并展示下拉；无结果 / 下拉空时不跳转、不做任何操作（按需求澄清）。
    e.preventDefault()
    if (!keyword.value.trim()) return
    runSearch()
    showDropdown.value = true
  }
}
function onSubmitBtn() {
  if (!keyword.value.trim()) return
  runSearch()
  showDropdown.value = true
  inputRef.value?.focus()
}

function onResultClick(item: SearchResultItem, type: SearchResultType) {
  go(item, type)
  showDropdown.value = false
  reset()
}
function onDocPointerDown(e: PointerEvent) {
  const t = e.target as Node
  if (panelRef.value && !panelRef.value.contains(t)) {
    showDropdown.value = false
  }
}

// 热搜：点击填入搜索框并提交（展示下拉，不自动跳转）
function applyHot(text: string) {
  keyword.value = text
  runSearch()
  showDropdown.value = true
  focused.value = true
  window.setTimeout(() => inputRef.value?.focus(), 30)
}

const dropdownVisible = computed(() => focused.value && (loading.value || hasResults.value))

onMounted(() => document.addEventListener('pointerdown', onDocPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointerDown))
</script>

<template>
  <div ref="panelRef" class="hf-search">
    <!-- 搜索框 -->
    <div class="hf-input-wrap" :class="{ focused }">
      <Search class="hf-magnifier" :size="20" :stroke-width="1.75" />
      <input
        ref="inputRef"
        v-model="keyword"
        class="hf-input"
        type="text"
        :placeholder="HERO_SEARCH_PLACEHOLDER"
        aria-label="全站搜索"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <!-- 无 Ctrl K 标识、无快捷键（按 §1.3） -->
      <button
        type="button"
        class="hf-submit"
        aria-label="搜索"
        @click="onSubmitBtn"
      >
        <ArrowRight :size="20" :stroke-width="2" />
      </button>
    </div>

    <!-- 下拉结果 -->
    <Transition name="hf-drop">
      <div v-if="dropdownVisible" class="hf-dropdown">
        <div v-if="loading" class="hf-drop-tip">搜索中…</div>
        <template v-for="g in groups" :key="g.type">
          <div v-if="g.items.length" class="hf-group">
            <div class="hf-group-label">{{ g.label }}</div>
            <button
              v-for="it in g.items"
              :key="g.type + '-' + it.id"
              type="button"
              class="hf-item"
              @mousedown.prevent="onResultClick(it, g.type)"
            >
              <span class="hf-item-name">
                <template v-for="(s, i) in it.segments" :key="i"
                  ><span :class="{ 'hf-hit': s.hit }">{{ s.text }}</span></template
                >
              </span>
            </button>
          </div>
        </template>
        <div v-if="!loading && !hasResults" class="hf-drop-tip">未找到相关结果</div>
      </div>
    </Transition>

    <!-- 热搜微标签（§6.2） -->
    <div class="hf-hot">
      <span class="hf-hot-label">热搜</span>
      <button
        v-for="(h, i) in HERO_HOT_SEARCH"
        :key="i"
        type="button"
        class="hf-hot-item"
        @click="applyHot(h.text)"
      >
        <span
          class="hf-hot-tag"
          :style="{
            color: HOT_TAG_COLOR[h.tone].solid,
            background: HOT_TAG_COLOR[h.tone].bg,
            boxShadow: `inset 0 0 0 1px ${HOT_TAG_COLOR[h.tone].solid}22`,
          }"
          >{{ h.tag }}</span
        >
        <span class="hf-hot-text">{{ h.text }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.hf-search {
  position: relative;
  width: 100%;
  max-width: 600px;
}

/* 输入框容器 */
.hf-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 56px;
  padding: 0 8px 0 18px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.03),
    0 8px 30px -6px rgba(15, 23, 42, 0.08);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.hf-input-wrap.focused {
  border-color: rgba(249, 115, 22, 0.35);
  box-shadow:
    0 0 4px rgba(249, 115, 22, 0.1),
    0 1px 2px rgba(15, 23, 42, 0.03),
    0 8px 30px -6px rgba(15, 23, 42, 0.08);
}
.hf-magnifier {
  flex-shrink: 0;
  color: #94a3b8;
}
.hf-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #0f172a;
}
.hf-input::placeholder {
  color: #94a3b8;
}
.hf-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.28);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hf-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.34);
}
.hf-submit:active {
  transform: none;
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.22);
}

/* 下拉 */
.hf-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  min-width: 320px;
  max-height: 56vh;
  overflow-y: auto;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);
  padding: 6px;
  z-index: 30;
}
.hf-drop-tip {
  padding: 14px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
}
.hf-group + .hf-group {
  margin-top: 2px;
  border-top: 1px solid rgba(15, 23, 42, 0.05);
}
.hf-group-label {
  padding: 6px 10px 2px;
  font-size: 11px;
  font-weight: 700;
  color: #cbd5e1;
  letter-spacing: 0.05em;
}
.hf-item {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  text-align: left;
  font-size: 14px;
  color: #334155;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}
.hf-item:hover {
  background: rgba(249, 115, 22, 0.06);
}
.hf-hit {
  color: #ea580c;
  font-weight: 700;
}

.hf-drop-enter-active,
.hf-drop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.hf-drop-enter-from,
.hf-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 热搜 */
.hf-hot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}
.hf-hot-label {
  font-size: 13px;
  color: #94a3b8;
}
.hf-hot-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
}
.hf-hot-tag {
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 600;
}
.hf-hot-text {
  font-size: 13px;
  color: #475569;
  transition: color 0.2s ease;
}
.hf-hot-item:hover .hf-hot-text {
  color: #ea580c;
}
</style>
