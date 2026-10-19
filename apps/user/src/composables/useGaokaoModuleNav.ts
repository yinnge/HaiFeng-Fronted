// apps/user/src/composables/useGaokaoModuleNav.ts
// 高考模块共享导航配置：目录最左侧「高中资料」扩展项 + 高一/高二/高三身份。
// 身份用模块级共享 ref：在 /gaokao、资讯列表、资讯详情、百宝箱 任一子页切换后，其它子页实时同步。
import { ref } from 'vue'

const HIGH_IDENTITY_KEY = 'haifeng_high_identity'
export const HIGH_IDENTITIES = ['高三', '高二', '高一']

// 模块级共享 ref（跨页持久 + 实时同步）
const highIdentity = ref<string>('高三')

;(function initHighIdentity() {
  try {
    const v = localStorage.getItem(HIGH_IDENTITY_KEY)
    if (v && HIGH_IDENTITIES.includes(v)) highIdentity.value = v
  } catch {
    /* 隐私模式等场景读取失败，保持默认「高三」 */
  }
})()

// 目录最左侧扩展项「高中资料」（其余目录沿用 ArchiveBar 原有项）
export const gaokaoExtraItems: { key: string; label: string; to: string }[] = [
  { key: 'highfile', label: '高中资料', to: '/gaokao?tab=highfile' },
]

export function useGaokaoModuleNav() {
  function onHighIdentityChange(val: string) {
    highIdentity.value = val
    try {
      localStorage.setItem(HIGH_IDENTITY_KEY, val)
    } catch {
      /* 写入失败可忽略，仅本次会话生效 */
    }
  }

  return {
    HIGH_IDENTITIES,
    highIdentity,
    onHighIdentityChange,
    gaokaoExtraItems,
  }
}
