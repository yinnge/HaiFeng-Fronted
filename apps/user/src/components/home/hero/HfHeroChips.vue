<script setup lang="ts">
import { ref, computed } from 'vue'
import { HERO_MODULES, HERO_COLUMNS, type ColumnKey, type HeroModule } from './hero.config'
import { requestColumnFocus } from '@/composables/useColumnFocus'

// 小屏（<1024px）替代罗盘的胶囊导航（§12）：单专栏点击直达；多专栏点击展开二级专栏。
const expandedKey = ref<string | null>(null)

const openModule = computed<HeroModule | null>(
  () => HERO_MODULES.find((m) => m.key === expandedKey.value) ?? null,
)

function onChipClick(m: HeroModule) {
  if (m.type === 'single') {
    requestColumnFocus(m.columns[0] as ColumnKey, m.color.solid)
  } else {
    expandedKey.value = expandedKey.value === m.key ? null : m.key
  }
}

function onChildClick(columnKey: ColumnKey, color: string) {
  requestColumnFocus(columnKey, color)
}
</script>

<template>
  <div class="hf-chips">
    <div class="hf-chips-row">
      <button
        v-for="m in HERO_MODULES"
        :key="m.key"
        type="button"
        class="hf-chip"
        :class="{ 'is-open': expandedKey === m.key }"
        :style="{ '--chip': m.color.solid, '--chip-bg': m.color.bg }"
        :aria-expanded="m.type === 'multi' ? expandedKey === m.key : undefined"
        @click="onChipClick(m)"
      >
        <span class="hf-chip-dot" aria-hidden="true"></span>
        <span>我是{{ m.name }}</span>
        <span v-if="m.type === 'multi'" class="hf-chip-caret" aria-hidden="true">›</span>
      </button>
    </div>

    <Transition name="hf-chips-expand">
      <div v-if="openModule" class="hf-chips-children">
        <button
          v-for="ck in openModule.columns"
          :key="ck"
          type="button"
          class="hf-chip-child"
          @click="onChildClick(ck as ColumnKey, openModule.color.solid)"
        >
          {{ HERO_COLUMNS[ck as ColumnKey].title }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.hf-chips {
  margin-top: 16px;
  width: 100%;
}
/* ≥1024 由 Hero 主栏罗盘承担导航，胶囊隐藏 */
@media (min-width: 1024px) {
  .hf-chips {
    display: none;
  }
}

.hf-chips-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}
.hf-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 9999px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.hf-chip:hover {
  transform: translateY(-1px);
  border-color: var(--chip);
}
.hf-chip.is-open {
  border-color: var(--chip);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--chip) 14%, transparent);
}
.hf-chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chip);
}
.hf-chip-caret {
  color: #94a3b8;
  font-size: 15px;
  line-height: 1;
  transition: transform 0.2s ease;
}
.hf-chip.is-open .hf-chip-caret {
  transform: rotate(90deg);
}

.hf-chips-children {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.hf-chip-child {
  padding: 6px 12px;
  border-radius: 9999px;
  background: var(--chip-bg);
  color: var(--chip);
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  /* 不用 filter: brightness()：过滤链会把这颗 12px 文字胶囊整块位图化 */
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.hf-chip-child:hover {
  background: color-mix(in srgb, var(--chip-bg) 78%, var(--chip) 22%);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--chip) 16%, transparent);
}

.hf-chips-expand-enter-active,
.hf-chips-expand-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.hf-chips-expand-enter-from,
.hf-chips-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .hf-chip,
  .hf-chip-caret {
    transition: none;
  }
}
</style>
