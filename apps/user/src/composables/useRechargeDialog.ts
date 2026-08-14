import { ref } from 'vue'
import type { MemberInfoVO } from '@/types/member/info'
import type { SiteInfoVO } from '@/types/home'
import { getMemberInfo } from '@/api/member/info'
import { getSiteInfo } from '@/api/home'

/** 模块级单例状态：全局充值弹窗控制 */
const visible = ref(false)
const memberInfo = ref<MemberInfoVO | null>(null)
const siteInfo = ref<SiteInfoVO | null>(null)
const loading = ref(false)

export function useRechargeDialog() {
  /** 打开充值弹窗（自动获取最新会员信息和站点配置） */
  async function open() {
    loading.value = true
    try {
      const [infoRes, siteRes] = await Promise.all([getMemberInfo(), getSiteInfo()])
      memberInfo.value = infoRes.data.data
      siteInfo.value = siteRes.data.data
      visible.value = true
    } finally {
      loading.value = false
    }
  }

  /** 关闭弹窗 */
  function close() {
    visible.value = false
  }

  return {
    visible,
    memberInfo,
    siteInfo,
    loading,
    open,
    close,
  }
}
