import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { checkGroupsExist } from '@/api/gaokao'

const STORAGE_KEY = 'haifeng:selected-majors'

export interface SelectedMajor {
  majorCode: string
  majorName: string
  levelShort: string
  safetyLevel: number
}

export interface SelectedGroup {
  groupId: string
  groupName: string
  universityName: string
  levelShort: string
  safetyLevel: number
  majors: SelectedMajor[]
}

export type SelectionMap = Record<string, SelectedGroup>

function loadFromStorage(): SelectionMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveToStorage(selections: SelectionMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selections))
}

export const useSelectionStore = defineStore('selection', () => {
  const selections = ref<SelectionMap>(loadFromStorage())

  const totalCount = computed(() => {
    return Object.values(selections.value).reduce((sum, g) => sum + g.majors.length, 0)
  })

  const groupCount = computed(() => Object.keys(selections.value).length)

  const countByLevel = computed(() => {
    const counts = { reachHigh: 0, reach: 0, match: 0, safe: 0, floor: 0 }
    for (const group of Object.values(selections.value)) {
      for (const major of group.majors) {
        switch (major.levelShort) {
          case '搏': counts.reachHigh++; break
          case '冲': counts.reach++; break
          case '稳': counts.match++; break
          case '保': counts.safe++; break
          case '垫': counts.floor++; break
        }
      }
    }
    return counts
  })

  function isMajorSelected(majorCode: string): boolean {
    for (const group of Object.values(selections.value)) {
      if (group.majors.some(m => m.majorCode === majorCode)) return true
    }
    return false
  }

  function toggleMajor(
    groupId: string,
    groupInfo: { groupName: string; universityName: string; levelShort: string; safetyLevel: number },
    majorInfo: SelectedMajor
  ) {
    const existing = selections.value[groupId]
    if (existing) {
      const idx = existing.majors.findIndex(m => m.majorCode === majorInfo.majorCode)
      if (idx >= 0) {
        existing.majors.splice(idx, 1)
        if (existing.majors.length === 0) {
          delete selections.value[groupId]
        }
      } else {
        existing.majors.push(majorInfo)
      }
    } else {
      selections.value[groupId] = {
        groupId,
        groupName: groupInfo.groupName,
        universityName: groupInfo.universityName,
        levelShort: groupInfo.levelShort,
        safetyLevel: groupInfo.safetyLevel,
        majors: [majorInfo],
      }
    }
    persist()
  }

  function clearSelection() {
    selections.value = {}
    persist()
  }

  /** 移除单个专业组（用于创建志愿表时跳过已被后台删除/禁用的孤儿暂存项） */
  function removeGroup(groupId: string) {
    if (selections.value[groupId]) {
      delete selections.value[groupId]
      persist()
    }
  }

  /**
   * 清理指向已删除/已禁用专业组的孤儿记录。
   * 进入专业组查询页或新建志愿表前调用：用后端 /group/exists 校验暂存区里的 groupId 是否还存活，
   * 不存活（admin 已删除该专业组）的就移除，使角标计数与"待加入志愿表"的真实专业数保持一致。
   * 注意：只动暂存区，不动已生成的志愿表数据。接口异常时静默，不影响正常使用。
   */
  async function pruneInvalidSelections() {
    const groupIds = Object.keys(selections.value)
    if (groupIds.length === 0) return
    try {
      const res = await checkGroupsExist(groupIds)
      const existing = new Set((res.data.data || []).map(String))
      let changed = false
      for (const gid of groupIds) {
        if (!existing.has(gid)) {
          delete selections.value[gid]
          changed = true
        }
      }
      if (changed) persist()
    } catch {
      // 网络/接口异常不影响暂存区使用
    }
  }

  function persist() {
    saveToStorage(selections.value)
  }

  return {
    selections,
    totalCount,
    groupCount,
    countByLevel,
    isMajorSelected,
    toggleMajor,
    clearSelection,
    removeGroup,
    pruneInvalidSelections,
    persist,
  }
})
