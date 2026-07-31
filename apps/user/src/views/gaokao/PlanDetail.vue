<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
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

const planId = Number(route.params.id)

const loading = ref(false)
const planGroups = ref<WishPlanGroupVO[]>([])
const expandedGroupId = ref<number | null>(null)
const majors = ref<WishPlanMajorVO[]>([])
const majorLoading = ref(false)
const saving = ref(false)
const exporting = ref(false)

// AI 智能分析
const showGenerateDialog = ref(false)

const safetyColorMap: Record<string, string> = {
  '搏': '#FF4D4F',
  '冲': '#FFA940',
  '稳': '#FADB14',
  '保': '#52C41A',
  '垫': '#1890FF',
}

// 拖拽状态
const dragState = reactive({
  type: '' as 'group' | 'major' | '',
  startIndex: -1,
})

const isNormal = (userStore.userInfo?.memberType || 'normal') === 'normal'

onMounted(loadGroups)

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

async function toggleExpand(groupSnapshotId: number) {
  if (expandedGroupId.value === groupSnapshotId) {
    expandedGroupId.value = null
    majors.value = []
    return
  }
  expandedGroupId.value = groupSnapshotId
  majorLoading.value = true
  try {
    const res = await getPlanGroupMajors(planId, groupSnapshotId, { page: 1, size: 100 })
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

function onDragStart(e: DragEvent, type: 'group' | 'major', index: number) {
  dragState.type = type
  dragState.startIndex = index
  e.dataTransfer!.effectAllowed = 'move'
  ;(e.target as HTMLElement).classList.add('opacity-50')
}

function onDragEnd(e: DragEvent) {
  ;(e.target as HTMLElement).classList.remove('opacity-50')
  dragState.type = ''
  dragState.startIndex = -1
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
  try {
    await toggleMajorExport(planId, major.id, !majorIsExported(major))
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

function majorIsExported(major: WishPlanMajorVO): boolean {
  return true
}

function groupAllExported(group: WishPlanGroupVO): boolean {
  return true
}

async function handleToggleGroupExportAll(groupSnapshotId: number, allExported: boolean) {
  try {
    await toggleGroupExportAll(planId, groupSnapshotId, !allExported)
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
      await sortPlanGroupMajors(planId, expandedGroupId.value, majorItems)
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
  if (isNormal) {
    ElMessageBox.alert(
      '导出功能需要Pro或VIP会员，请先升级',
      '导出受限',
      { confirmButtonText: '我知道了', type: 'warning' }
    )
    return
  }

  exporting.value = true
  try {
    const res = await generateExport(planId)
    const { downloadUrl, fileName } = res.data.data
    const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${import.meta.env.VITE_API_BASE_URL || ''}${downloadUrl}`

    const fileRes = await downloadExport(planId, fileName)
    const blob = new Blob([fileRes.data as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
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
  if (isNormal) {
    ElMessageBox.alert(
      'AI智能分析需要Pro或VIP会员，请先升级',
      '功能受限',
      { confirmButtonText: '我知道了', type: 'warning' }
    )
    return
  }
  showGenerateDialog.value = true
}

function handleGenerateSuccess(recordId: number) {
  router.push(`/gaokao/pdf-report/${recordId}`)
}

function goToPdfHistory() {
  router.push(`/gaokao/pdf-history/${planId}`)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1 container mx-auto px-6 py-8 max-w-6xl">
      <div class="flex justify-end gap-3 mb-4">
        <button
          class="rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2 text-white text-sm font-medium hover:from-violet-600 hover:to-purple-600 transition-all shadow-md disabled:opacity-50"
          @click="handleAiAnalysis"
        >
          AI智能分析
        </button>
        <button
          class="rounded-lg border border-gray-200 px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          @click="goToPdfHistory"
        >
          查看AI报告
        </button>
        <button
          class="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-white text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-md disabled:opacity-50"
          :disabled="saving"
          @click="handleSave"
        >
          {{ saving ? '保存中...' : '保存志愿表' }}
        </button>
        <button
          class="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md disabled:opacity-50"
          :disabled="exporting"
          @click="handleExport"
        >
          {{ exporting ? '导出中...' : '导出xlsx' }}
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <el-icon class="is-loading text-4xl text-orange-500"><Loading /></el-icon>
      </div>

      <div v-else-if="planGroups.length === 0" class="text-center py-20 text-gray-400">
        暂无专业组数据
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="(group, gIndex) in planGroups"
          :key="group.id"
          class="rounded-xl border border-gray-100 bg-white overflow-hidden"
          draggable="true"
          @dragstart="onDragStart($event, 'group', gIndex)"
          @dragend="onDragEnd"
          @dragover="onDragOver"
          @drop="onDropGroup($event, gIndex)"
        >
          <!-- 专业组行 -->
          <div class="flex items-stretch">
            <!-- 左：排序号 + 排序按钮 -->
            <div class="w-16 shrink-0 flex flex-col items-center justify-center gap-1 border-r border-gray-100 bg-gray-50/50">
              <span class="text-lg font-bold text-gray-300">{{ gIndex + 1 }}</span>
              <div class="flex gap-0.5">
                <button
                  class="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                  :class="{ 'opacity-30 pointer-events-none': gIndex === 0 }"
                  @click="moveGroupUp(gIndex)"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5l-6 6h12z" /></svg>
                </button>
                <button
                  class="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                  :class="{ 'opacity-30 pointer-events-none': gIndex === planGroups.length - 1 }"
                  @click="moveGroupDown(gIndex)"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l6-6H4z" /></svg>
                </button>
              </div>
            </div>

            <!-- 中：院校信息 -->
            <div class="flex-1 min-w-0 p-4">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-lg font-bold text-gray-800 truncate">{{ group.universityName }}</span>
                <span class="text-sm text-gray-400">{{ group.cityName }}</span>
                <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{{ group.enrollmentCode }}</span>
                <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{{ group.groupCode }}</span>
              </div>
              <div class="mt-1 flex items-center gap-3 text-sm text-gray-500">
                <span>专业组：{{ group.groupName }}</span>
                <span class="text-gray-300">|</span>
                <span>{{ group.majorCount }}个专业</span>
                <span v-if="group.tags.length" class="text-gray-300">|</span>
                <span v-for="tag in group.tags" :key="tag" class="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{{ tag }}</span>
              </div>
              <div v-if="group.constraintsDescription.length > 0" class="mt-2 flex flex-wrap gap-1">
                <span
                  v-for="c in group.constraintsDescription"
                  :key="c"
                  class="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full"
                >
                  {{ c }}
                </span>
              </div>
            </div>

            <!-- 右：操作 -->
            <div class="w-32 shrink-0 flex flex-col items-center justify-center gap-2 border-l border-gray-100">
              <button
                class="text-xs text-blue-500 hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                @click="toggleExpand(group.id)"
              >
                {{ expandedGroupId === group.id ? '收起专业' : '查看专业' }}
              </button>
              <button
                class="text-xs text-gray-400 hover:text-orange-500 transition-colors px-2 py-1 rounded hover:bg-orange-50"
                @click="handleToggleGroupExportAll(group.id, groupAllExported(group))"
              >
                {{ groupAllExported(group) ? '取消全选' : '全选导出' }}
              </button>
            </div>
          </div>

          <!-- 展开的专业列表 -->
          <Transition name="slide">
            <div v-if="expandedGroupId === group.id" class="border-t border-gray-100">
              <div v-if="majorLoading" class="flex justify-center py-8">
                <el-icon class="is-loading text-2xl text-orange-500"><Loading /></el-icon>
              </div>
              <div v-else class="divide-y divide-gray-50">
                <div
                  v-for="(major, mIndex) in majors"
                  :key="major.id"
                  class="flex items-stretch"
                  draggable="true"
                  @dragstart="onDragStart($event, 'major', mIndex)"
                  @dragend="onDragEnd"
                  @dragover="onDragOver"
                  @drop="onDropMajor($event, mIndex)"
                >
                  <!-- 安全球 -->
                  <div class="w-16 shrink-0 flex flex-col items-center justify-center py-3 border-r border-gray-50 bg-gray-50/30">
                    <span
                      class="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      :style="{ backgroundColor: safetyColorMap[major.levelShort] || '#999' }"
                    >
                      {{ major.levelShort }}
                    </span>
                    <span class="text-[9px] text-gray-400 mt-0.5">{{ (major.safetyLevel * 100).toFixed(0) }}%</span>
                  </div>

                  <!-- 专业信息 -->
                  <div class="flex-1 min-w-0 p-3 pl-4">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-gray-800">{{ major.majorName }}</span>
                      <span class="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{{ major.majorCode }}</span>
                    </div>
                    <div class="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                      <span>{{ major.duration }}</span>
                      <span class="text-gray-300">|</span>
                      <span>{{ major.tuition }}</span>
                      <span class="text-gray-300">|</span>
                      <span>录取{{ major.admissionCount }}人</span>
                    </div>
                  </div>

                  <!-- 历史分数 -->
                  <div class="w-72 shrink-0 border-l border-gray-50 p-2">
                    <table class="w-full text-[11px]">
                      <thead>
                        <tr class="text-gray-400">
                          <th class="text-left font-normal">年份</th>
                          <th class="text-left font-normal">最低分</th>
                          <th class="text-left font-normal">平均分</th>
                          <th class="text-left font-normal">最高分</th>
                        </tr>
                      </thead>
                      <tbody class="text-gray-500">
                        <tr v-for="s in major.historyScores" :key="s.year">
                          <td class="py-0.5">{{ s.year }}</td>
                          <td>{{ s.minScore }}</td>
                          <td>{{ s.avgScore }}</td>
                          <td>{{ s.maxScore }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- 排序按钮 -->
                  <div class="w-10 shrink-0 flex flex-col items-center justify-center gap-0.5 border-l border-gray-50">
                    <button
                      class="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                      :class="{ 'opacity-30 pointer-events-none': mIndex === 0 }"
                      @click="moveMajorUp(mIndex)"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5l-6 6h12z" /></svg>
                    </button>
                    <button
                      class="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                      :class="{ 'opacity-30 pointer-events-none': mIndex === majors.length - 1 }"
                      @click="moveMajorDown(mIndex)"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l6-6H4z" /></svg>
                    </button>
                  </div>

                  <!-- 导出开关 -->
                  <div class="w-14 shrink-0 flex items-center justify-center border-l border-gray-50">
                    <button
                      class="w-6 h-6 rounded flex items-center justify-center transition-colors"
                      :class="majorIsExported(major) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:text-green-500'"
                      @click="handleToggleMajorExport(major)"
                    >
                      <svg v-if="majorIsExported(major)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
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
      </div>
    </main>

    <!-- AI 智能分析弹窗 -->
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
</style>
