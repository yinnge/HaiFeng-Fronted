import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'haifeng:selected-majors'

export interface SelectedMajor {
  majorId: string
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

  function isMajorSelected(majorId: string): boolean {
    for (const group of Object.values(selections.value)) {
      if (group.majors.some(m => m.majorId === majorId)) return true
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
      const idx = existing.majors.findIndex(m => m.majorId === majorInfo.majorId)
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
    persist,
  }
})
