import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MemberType } from '@haifeng/shared'
import { getSiteInfo } from '@/api/home'
import type { SiteInfoVO } from '@/types/home'
import { useUserStore } from '@/store/modules/user'
import { confirmLogin } from '@/utils/loginGuide'
import { useRechargeDialog } from '@/composables/useRechargeDialog'

const visible = ref(false)
const siteInfo = ref<SiteInfoVO | null>(null)
const loading = ref(false)

export function useExpertContact() {
  const router = useRouter()
  const userStore = useUserStore()
  const recharge = useRechargeDialog()

  const fetchSiteInfo = async () => {
    if (siteInfo.value) return
    loading.value = true
    try {
      const res = await getSiteInfo()
      siteInfo.value = res.data.data
    } catch (e: any) {
      ElMessage.error(e?.message || '获取联系信息失败')
    } finally {
      loading.value = false
    }
  }

  async function open() {
    if (!userStore.isLoggedIn()) {
      userStore.setRedirectPath(router.currentRoute.value.fullPath)
      if (await confirmLogin()) {
        router.push('/login')
      }
      return
    }

    const memberType = userStore.userInfo?.memberType
    if (memberType !== MemberType.VIP) {
      try {
        await ElMessageBox.confirm('专家指导联系方式为VIP会员专享，是否前往开通？', '提示', {
          confirmButtonText: '前往开通',
          cancelButtonText: '取消',
          type: 'warning',
        })
        recharge.open()
      } catch {
        /* cancel */
      }
      return
    }

    await fetchSiteInfo()
    if (siteInfo.value) visible.value = true
  }

  function close() {
    visible.value = false
  }

  return {
    visible,
    siteInfo,
    loading,
    open,
    close,
  }
}
