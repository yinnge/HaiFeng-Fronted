<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import {
  getPlanGroups,
  getPlanGroupMajors,
  sortPlanGroups,
  sortPlanGroupMajors,
  toggleMajorExport,
  toggleGroupExportAll,
  generateExport,
  downloadExport,
  type WishPlanGroupVO,
  type WishPlanMajorVO,
} from '@/api/wish-plan'
import PdfGenerateDialog from '@/components/pdf/PdfGenerateDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const planId = route.params.id as string

const loading = ref(false)
const planGroups = ref<WishPlanGroupVO[]>([])
const expandedGroupId = ref<string | null>(null)
const majors = ref<WishPlanMajorVO[]>([])
const majorLoading = ref(false)
const saving = ref(false)
const exporting = ref(false)

// AI 智能分析
const showGenerateDialog = ref(false)

const safetyColorMap: Record<string, string> = {
  '搏': '#ef4444',
  '冲': '#f97316',
  '稳': '#eab308',
  '保': '#22c55e',
  '垫': '#3b82f6',
}

const safetyGradientMap: Record<string, string> = {
  '搏': 'from-red-500 to-red-600',
  '冲': 'from-orange-500 to-orange-600',
  '稳': 'from-yellow-500 to-yellow-600',
  '保': 'from-green-500 to-green-600',
  '垫': 'from-blue-500 to-blue-600',
}

// 拖拽状态
const dragState = reactive({
  type: '' as 'group' | 'major' | '',
  startIndex: -1,
})
const dragHandleActive = ref(false)

onMounted(async () => {
  await userStore.fetchUserInfo()
  loadGroups()
})

async function loadGroups() {
  loading.value = true
  try {
    const res = await getPlanGroups(planId, { page: 1, size: 100 })
    planGroups.value = res.data.data.records
  } catch (e: any) {
    ElMessage.error(e?.message || '加载志愿表失败')
  } finally {
    loading.value = false
  }
}

async function toggleExpand(groupSnapshotId: string) {
  if (expandedGroupId.value === groupSnapshotId) {
    expandedGroupId.value = null
    majors.value = []
    return
  }
  expandedGroupId.value = groupSnapshotId
  majorLoading.value = true
  try {
    const res = await getPlanGroupMajors(planId, String(groupSnapshotId), { page: 1, size: 100 })
    majors.value = res.data.data.records
  } catch (e: any) {
    ElMessage.error(e?.message || '加载专业明细失败')
  } finally {
    majorLoading.value = false
  }
}

// ========== 排序：↑↓按钮 ==========

function moveGroupUp(index: number) {
  if (index <= 0) return
  const arr = [...planGroups.value]
  ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
  planGroups.value = arr
}

function moveGroupDown(index: number) {
  if (index >= planGroups.value.length - 1) return
  const arr = [...planGroups.value]
  ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
  planGroups.value = arr
}

function moveMajorUp(index: number) {
  if (index <= 0) return
  const arr = [...majors.value]
  ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
  majors.value = arr
}

function moveMajorDown(index: number) {
  if (index >= majors.value.length - 1) return
  const arr = [...majors.value]
  ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
  majors.value = arr
}

// ========== 拖拽排序 ==========

function onDragHandleMouseDown() {
  dragHandleActive.value = true
}

function onDragStart(e: DragEvent, type: 'group' | 'major', index: number) {
  if (!dragHandleActive.value) {
    e.preventDefault()
    return
  }
  dragState.type = type
  dragState.startIndex = index
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', '')
  ;(e.currentTarget as HTMLElement).classList.add('opacity-50')
}

function onDragEnd(e: DragEvent) {
  ;(e.currentTarget as HTMLElement).classList.remove('opacity-50')
  dragState.type = ''
  dragState.startIndex = -1
  dragHandleActive.value = false
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
}

function onDropGroup(e: DragEvent, targetIndex: number) {
  e.preventDefault()
  if (dragState.type !== 'group' || dragState.startIndex === targetIndex) return
  const arr = [...planGroups.value]
  const [moved] = arr.splice(dragState.startIndex, 1)
  arr.splice(targetIndex, 0, moved)
  planGroups.value = arr
}

function onDropMajor(e: DragEvent, targetIndex: number) {
  e.preventDefault()
  if (dragState.type !== 'major' || dragState.startIndex === targetIndex) return
  const arr = [...majors.value]
  const [moved] = arr.splice(dragState.startIndex, 1)
  arr.splice(targetIndex, 0, moved)
  majors.value = arr
}

// ========== 导出 ==========

async function handleToggleMajorExport(major: WishPlanMajorVO) {
  const newStatus = !majorIsExported(major)
  try {
    await toggleMajorExport(planId, String(major.id), newStatus)
    major.isExported = newStatus
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

function majorIsExported(major: WishPlanMajorVO): boolean {
  return major.isExported !== false
}

function groupAllExported(group: WishPlanGroupVO): boolean {
  return group.allExported !== false
}

async function handleToggleGroupExportAll(group: WishPlanGroupVO) {
  const newStatus = !groupAllExported(group)
  try {
    await toggleGroupExportAll(planId, String(group.id), newStatus)
    group.allExported = newStatus
    // 同步更新当前展开的专业列表
    if (expandedGroupId.value === group.id) {
      majors.value.forEach(m => { m.isExported = newStatus })
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

// ========== 保存排序 ==========

async function handleSave() {
  saving.value = true
  try {
    // 保存专业组排序
    const groupItems = planGroups.value.map((g, i) => ({ groupId: g.id, sortOrder: i + 1 }))
    await sortPlanGroups(planId, groupItems)

    // 保存展开的专业排序
    if (expandedGroupId.value && majors.value.length > 0) {
      const majorItems = majors.value.map((m, i) => ({ majorId: m.id, sortOrder: i + 1 }))
      await sortPlanGroupMajors(planId, String(expandedGroupId.value), majorItems)
    }

    ElMessage.success('保存成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// ========== 导出 ==========

async function handleExport() {
  exporting.value = true
  try {
    // 1. 生成导出文件（权限：Pro+，403=非 Pro 会员）
    const genRes = await generateExport(planId)
    const { fileName } = genRes.data.data

    // 2. 使用 downloadUrl 下载（responseType: 'blob' + 覆盖 JSON 解析器）
    const fileRes = await downloadExport(planId, fileName)

    // 3. fileRes.data 已经是 Blob（transformResponse 已被覆盖为直通）
    const blob = fileRes.data instanceof Blob
      ? fileRes.data
      : new Blob([fileRes.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

// ========== AI 智能分析 ==========

function handleAiAnalysis() {
  const mt = userStore.userInfo?.memberType || 'normal'
  if (mt !== 'pro' && mt !== 'vip') {
    ElMessageBox.alert(
      'AI智能分析需要Pro或VIP会员，请先升级',
      '功能受限',
      { confirmButtonText: '我知道了', type: 'warning' }
    )
    return
  }
  showGenerateDialog.value = true
}

function handleGenerateSuccess(recordId: string) {
  router.push(`/gaokao/pdf-report/${recordId}`)
}

function goToPdfHistory() {
  router.push(`/gaokao/pdf-history/${planId}`)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-brand-gray-50 to-white">
    <main class="flex-1 container mx-auto px-6 py-8 max-w-7xl">
      <!-- 顶部标题 + 操作按钮 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">志愿表详情</h1>
          <p class="text-sm text-gray-500 mt-1">拖拽调整志愿顺序，导出你的志愿方案</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="btn-secondary px-4 py-2 text-sm" @click="handleAiAnalysis">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI智能分析
          </button>
          <button class="btn-secondary px-4 py-2 text-sm" @click="goToPdfHistory">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            查看AI报告
          </button>
          <button
            class="btn-brand px-5 py-2 text-sm"
            :class="saving ? 'opacity-60 cursor-not-allowed' : ''"
            :disabled="saving"
            @click="handleSave"
          >
            <svg v-if="!saving" class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ saving ? '保存中...' : '保存志愿表' }}
          </button>
          <button
            class="inline-flex items-center px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 bg-gradient-to-r from-brand-blue to-brand-blue-light text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            :class="exporting ? 'opacity-60 cursor-not-allowed' : ''"
            :disabled="exporting"
            @click="handleExport"
          >
            <svg v-if="!exporting" class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ exporting ? '导出中...' : '导出xlsx' }}
          </button>
        </div>
      </div>

      <!-- 骨架屏加载 -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="rounded-2xl border border-gray-100/60 bg-white p-5 shadow-card animate-pulse">
          <div class="flex items-stretch gap-4">
            <div class="w-16 shrink-0 flex flex-col items-center justify-center">
              <div class="w-10 h-10 rounded-xl bg-gray-200" />
            </div>
            <div class="flex-1 space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-32 h-5 bg-gray-200 rounded" />
                <div class="w-16 h-4 bg-gray-200 rounded" />
              </div>
              <div class="w-2/3 h-4 bg-gray-200 rounded" />
            </div>
            <div class="w-32 shrink-0 space-y-2">
              <div class="w-full h-4 bg-gray-200 rounded" />
              <div class="w-full h-4 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="planGroups.length === 0" class="text-center py-20">
        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
          <svg class="w-10 h-10 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">暂无专业组数据</h3>
        <p class="text-sm text-gray-500">请先在专业组页面选择专业</p>
      </div>

      <!-- 专业组列表 -->
      <div v-else class="space-y-4">
        <TransitionGroup name="list" tag="div" class="space-y-4">
          <div
            v-for="(group, gIndex) in planGroups"
            :key="group.id"
            class="group relative rounded-2xl border border-gray-100/80 bg-white overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
            draggable="true"
            @mousedown="dragHandleActive = false"
            @dragstart="onDragStart($event, 'group', gIndex)"
            @dragend="onDragEnd"
            @dragover="onDragOver"
            @drop="onDropGroup($event, gIndex)"
          >
            <!-- 专业组行 -->
            <div class="flex items-stretch">
              <!-- 左：拖拽手柄 + 排序号 -->
              <div class="w-16 shrink-0 flex flex-col items-center justify-center gap-1 border-r border-gray-100/60 bg-gray-50/30">
                <div class="cursor-grab active:cursor-grabbing text-gray-300 hover:text-brand-orange transition-colors drag-handle" @mousedown.stop="onDragHandleMouseDown">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                  </svg>
                </div>
                <span class="text-sm font-bold text-gray-300">{{ gIndex + 1 }}</span>
                <div class="flex flex-col gap-0.5">
                  <button
                    class="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                    :disabled="gIndex === 0"
                    @click="moveGroupUp(gIndex)"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    class="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                    :disabled="gIndex === planGroups.length - 1"
                    @click="moveGroupDown(gIndex)"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 安全等级球 -->
              <div class="w-16 shrink-0 flex flex-col items-center justify-center border-r border-gray-100/60 p-3">
                <div class="relative">
                  <span
                    class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md transition-transform duration-200 group-hover:scale-105"
                    :class="`bg-gradient-to-br ${safetyGradientMap[group.levelShort ?? ''] || 'from-gray-400 to-gray-500'}`"
                  >
                    {{ group.levelShort }}
                  </span>
                </div>
                <span class="mt-1 text-[10px] font-medium text-gray-500 tabular-nums">{{ ((group.safetyLevel ?? 0) * 100).toFixed(0) }}%</span>
              </div>

              <!-- 中：院校信息 -->
              <div class="flex-1 min-w-0 p-4">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-lg font-bold text-gray-800 truncate">{{ group.universityName }}</span>
                  <span class="inline-flex items-center text-sm text-gray-500">
                    <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ group.cityName }}
                  </span>
                  <span class="pill pill-blue text-xs">{{ group.enrollmentCode }}</span>
                  <span class="pill pill-gold text-xs">{{ group.groupCode }}</span>
                </div>
                <div class="mt-2 flex items-center gap-3 text-sm text-gray-500">
                  <span class="inline-flex items-center">
                    <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {{ group.groupName }}
                  </span>
                  <span class="text-gray-300">·</span>
                  <span>{{ group.majorCount }}个专业</span>
                  <template v-if="group.tags.length">
                    <span class="text-gray-300">·</span>
                    <span v-for="tag in group.tags" :key="tag" class="pill pill-orange text-xs">{{ tag }}</span>
                  </template>
                </div>
                <div v-if="group.constraintsDescription.length > 0" class="mt-2.5 flex flex-wrap gap-1.5">
                  <span
                    v-for="c in group.constraintsDescription"
                    :key="c"
                    class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-100"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {{ c }}
                  </span>
                </div>
              </div>

              <!-- 右：操作 -->
              <div class="w-28 shrink-0 flex flex-col items-center justify-center gap-2 border-l border-gray-100/60 p-3">
                <button
                  class="w-full flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium"
                  :class="expandedGroupId === group.id
                    ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20'
                    : 'text-brand-blue hover:bg-brand-blue/10 border border-transparent'"
                  @click="toggleExpand(group.id)"
                >
                  <svg
                    class="w-4 h-4 transition-transform duration-200"
                    :class="expandedGroupId === group.id ? 'rotate-180' : ''"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span class="text-xs">{{ expandedGroupId === group.id ? '收起' : '专业' }}</span>
                </button>
                <button
                  class="w-full text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
                  :class="groupAllExported(group)
                    ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    : 'text-brand-orange hover:bg-brand-orange/10'"
                  @click="handleToggleGroupExportAll(group)"
                >
                  {{ groupAllExported(group) ? '取消全选' : '全选导出' }}
                </button>
              </div>
            </div>

            <!-- 展开的专业列表 -->
            <Transition name="slide">
              <div v-if="expandedGroupId === group.id" class="border-t border-gray-100/60">
                <div v-if="majorLoading" class="flex items-center justify-center py-8 gap-2">
                  <div class="w-2 h-2 rounded-full bg-brand-orange animate-bounce" style="animation-delay: 0ms" />
                  <div class="w-2 h-2 rounded-full bg-brand-orange animate-bounce" style="animation-delay: 150ms" />
                  <div class="w-2 h-2 rounded-full bg-brand-orange animate-bounce" style="animation-delay: 300ms" />
                </div>
                <div v-else class="divide-y divide-gray-100/60">
                  <div
                    v-for="(major, mIndex) in majors"
                    :key="major.id"
                    class="flex items-stretch hover:bg-gray-50/50 transition-colors"
                    draggable="true"
                    @mousedown="dragHandleActive = false"
                    @dragstart.stop="onDragStart($event, 'major', mIndex)"
                    @dragend="onDragEnd"
                    @dragover="onDragOver"
                    @drop="onDropMajor($event, mIndex)"
                  >
                    <!-- 排序号 -->
                    <div class="w-16 shrink-0 flex flex-col items-center justify-center py-3 border-r border-gray-100/60 bg-gray-50/20">
                      <div class="cursor-grab active:cursor-grabbing text-gray-300 hover:text-brand-orange transition-colors" @mousedown.stop="onDragHandleMouseDown">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                        </svg>
                      </div>
                      <span class="text-[10px] font-bold text-gray-300 mt-0.5">{{ mIndex + 1 }}</span>
                      <div class="flex flex-col gap-0.5 mt-0.5">
                        <button
                          class="w-4 h-4 flex items-center justify-center rounded text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                          :disabled="mIndex === 0"
                          @click="moveMajorUp(mIndex)"
                        >
                          <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          class="w-4 h-4 flex items-center justify-center rounded text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                          :disabled="mIndex === majors.length - 1"
                          @click="moveMajorDown(mIndex)"
                        >
                          <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- 安全等级球 -->
                    <div class="w-16 shrink-0 flex flex-col items-center justify-center py-3 border-r border-gray-100/60">
                      <div class="relative">
                        <span
                          class="inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                          :class="`bg-gradient-to-br ${safetyGradientMap[major.levelShort] || 'from-gray-400 to-gray-500'}`"
                        >
                          {{ major.levelShort }}
                        </span>
                      </div>
                      <span class="mt-1 text-[9px] font-medium text-gray-500 tabular-nums">{{ (major.safetyLevel * 100).toFixed(0) }}%</span>
                    </div>

                    <!-- 专业信息 -->
                    <div class="flex-1 min-w-0 p-3 pl-4">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-semibold text-gray-800">{{ major.majorName }}</span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-500">{{ major.majorCode }}</span>
                      </div>
                      <div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span>{{ major.duration }}</span>
                        <span class="text-gray-300">·</span>
                        <span class="text-brand-orange font-medium">{{ major.tuition }}</span>
                        <span class="text-gray-300">·</span>
                        <span class="inline-flex items-center">
                          <svg class="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          录取{{ major.admissionCount }}人
                        </span>
                      </div>
                    </div>

                    <!-- 历史分数 -->
                    <div class="w-[26rem] shrink-0 border-l border-gray-100/60 p-3 bg-gray-50/20">
                      <div class="overflow-hidden rounded-lg border border-gray-200/60">
                        <table class="w-full text-[11px]">
                          <thead>
                            <tr class="bg-gray-100/40">
                              <th class="text-left font-semibold text-gray-600 px-3 py-1.5">年份</th>
                              <th class="text-left font-semibold text-gray-600 px-3 py-1.5">最低分</th>
                              <th class="text-left font-semibold text-gray-600 px-3 py-1.5">平均分</th>
                              <th class="text-left font-semibold text-gray-600 px-3 py-1.5">最高分</th>
                            </tr>
                          </thead>
                          <tbody class="text-gray-600 divide-y divide-gray-100/60">
                            <tr v-for="s in major.historyScores" :key="s.year" class="hover:bg-gray-50/60 transition-colors">
                              <td class="px-3 py-1.5 font-medium tabular-nums">{{ s.year }}</td>
                              <td class="px-3 py-1.5 tabular-nums">{{ s.minScore }}</td>
                              <td class="px-3 py-1.5 tabular-nums">{{ s.avgScore }}</td>
                              <td class="px-3 py-1.5 tabular-nums">{{ s.maxScore }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- 导出开关 -->
                    <div class="w-14 shrink-0 flex items-center justify-center border-l border-gray-100/60">
                      <button
                        class="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                        :class="majorIsExported(major)
                          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md shadow-green-500/25'
                          : 'text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 border border-transparent hover:border-brand-orange/20'"
                        @click="handleToggleMajorExport(major)"
                      >
                        <svg v-if="majorIsExported(major)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </TransitionGroup>
      </div>
    </main>

    <PdfGenerateDialog
      v-model:visible="showGenerateDialog"
      :plan-id="planId"
      @success="handleGenerateSuccess"
    />
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 5000px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.list-move {
  transition: transform 0.3s ease;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
