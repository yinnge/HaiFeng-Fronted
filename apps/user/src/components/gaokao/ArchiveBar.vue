<script setup lang="ts">
// apps/user/src/components/gaokao/ArchiveBar.vue
// 高考档案吸附条：常驻导航栏下方（sticky），滚动页面时固定不动。
// - 左侧「高考档案」标签；右侧信息：省份行内下拉 + 年份/分数/科目 chip
// - 省份下拉与档案弹窗双向联动；点击年份/分数/科目打开档案弹窗
// - 内置 ArchiveDialog：模拟填报保存后 emit('saved')；父组件可监听刷新业务数据
// 档案源：utils/gaokaoArchive（登录=服务端，游客=localStorage，刷新不丢）
import { ref, computed, onMounted } from 'vue'
import type { GaokaoArchiveVO, GaokaoArchiveForm } from '@/api/gaokao'
import { loadArchiveSmart } from '@/utils/gaokaoArchive'
import { ProvinceOptions } from '@haifeng/shared'
import ArchiveDialog from './ArchiveDialog.vue'

const emit = defineEmits<{
  /** 档案发生变化（初始加载 / 省份下拉切换 / 弹窗保存），携带最新档案（可为 null） */
  (e: 'archive-change', archive: GaokaoArchiveVO | null): void
  /** 弹窗「模拟填报」保存成功（已入库或已存本地） */
  (e: 'saved', form: GaokaoArchiveForm): void
}>()

const displayForm = ref<GaokaoArchiveVO | null>(null)
const dialogVisible = ref(false)

// 吸附偏移：动态测量导航栏实际高度，避免写死（导航内容高度随断点变化）
const stickyTop = ref(64)

function measureHeader() {
  const h = document.querySelector('.app-header')?.getBoundingClientRect().height
  if (h && h > 0) stickyTop.value = Math.round(h)
}

// 供父组件（如其它页面的「修改档案」按钮）直接打开弹窗
function openDialog() {
  dialogVisible.value = true
}
defineExpose({ openDialog })

// 三个选科（首选 / 再选1 / 再选2），老高考无再选科目时只展示首选
const archiveSubjects = computed(() => {
  if (!displayForm.value) return []
  return [
    displayForm.value.subjectType,
    displayForm.value.secondSubjectType,
    displayForm.value.thirdSubjectType,
  ].filter((s): s is string => !!s)
})

// 省份行内下拉：与档案弹窗双向联动（这里改了弹窗跟着改；弹窗保存后这里同步）
const archiveProvince = computed({
  get: () => displayForm.value?.gaokaoProvince || '',
  set: (val: string) => {
    if (!val) return
    if (displayForm.value) {
      displayForm.value.gaokaoProvince = val
    } else {
      // 尚无档案：先建一个最小展示对象（省份仅用于按省查询，完整档案走弹窗）
      displayForm.value = { gaokaoProvince: val, gaokaoYear: new Date().getFullYear() } as GaokaoArchiveVO
    }
    emit('archive-change', displayForm.value)
  },
})

async function loadArchive() {
  try {
    const { archive } = await loadArchiveSmart()
    displayForm.value = archive
    emit('archive-change', archive)
  } catch {
    displayForm.value = null
    emit('archive-change', null)
  }
}

// 弹窗保存成功：更新展示 + 通知父组件
function handleSaved(form: GaokaoArchiveForm) {
  displayForm.value = { ...(displayForm.value || ({} as GaokaoArchiveVO)), ...form }
  dialogVisible.value = false
  emit('archive-change', displayForm.value)
  emit('saved', form)
}

onMounted(() => {
  measureHeader()
  void loadArchive()
})
</script>

<template>
  <div class="archive-bar" :style="{ top: `${stickyTop}px` }">
    <div class="archive-bar-inner">
      <span class="archive-bar-label">
        <svg class="archive-label-icon shrink-0 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        高考档案
      </span>
      <!-- 信息整体靠右：省份行内下拉在前，年份/分数/科目点击打开档案弹窗 -->
      <div class="archive-bar-info">
        <el-select
          v-model="archiveProvince"
          placeholder="省份"
          filterable
          class="archive-province-select"
        >
          <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <template v-if="displayForm && displayForm.score">
          <button class="archive-chip" title="点击修改档案" @click="openDialog">
            {{ displayForm.gaokaoYear }}年
          </button>
          <button class="archive-chip" title="点击修改档案" @click="openDialog">
            {{ displayForm.score }}分
          </button>
          <button v-if="archiveSubjects.length" class="archive-chip" title="点击修改档案" @click="openDialog">
            {{ archiveSubjects.join('/') }}
          </button>
        </template>
        <button v-else class="archive-chip archive-chip-empty" @click="openDialog">
          点击填写年份 / 分数 / 科目
        </button>
      </div>
    </div>

    <!-- 高考档案填写弹窗（模拟填报 / 制定方案） -->
    <ArchiveDialog v-model:visible="dialogVisible" :initial-form="displayForm" @saved="handleSaved" />
  </div>
</template>

<style scoped>
/* ===== 档案吸附条：sticky 吸在导航栏下方（top 由 JS 测量导航实际高度） ===== */
.archive-bar {
  position: sticky;
  z-index: 40;
  background: rgba(255, 251, 245, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(249, 115, 22, 0.15);
  box-shadow: 0 1px 8px rgba(249, 115, 22, 0.06);
}

.archive-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 11px 24px;
}

.archive-bar-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.archive-label-icon {
  width: 18px;
  height: 18px;
}

@media (max-width: 767px) {
  .archive-bar-label {
    display: none;
  }
}

.archive-bar-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  margin-left: auto;
}

/* 省份：橙红粗边框、比 chip 略大；最多三个字，宽度收窄 */
.archive-province-select {
  width: 86px;
}

.archive-province-select :deep(.el-select__wrapper) {
  border-radius: 16px;
  box-shadow: 0 0 0 1.5px #f97316 inset;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: #c2410c;
  min-height: 34px;
  padding: 2px 8px;
}

.archive-province-select :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1.5px #ea580c inset;
}

.archive-province-select :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1.5px #ea580c inset;
}

.archive-province-select :deep(.el-select__placeholder) {
  color: #c2410c;
}

.archive-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #fff;
  border: 1px solid rgba(249, 115, 22, 0.25);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.archive-chip:hover {
  border-color: #f97316;
  color: #f97316;
  background: #fff7ed;
}

.archive-chip-empty {
  border-style: dashed;
  color: #9ca3af;
  font-weight: 400;
}
</style>
