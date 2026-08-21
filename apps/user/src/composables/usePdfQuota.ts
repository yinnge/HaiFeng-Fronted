import { ref } from 'vue'
import { getPdfQuotaToday, type PdfQuotaVO } from '@/api/pdf-report'

/**
 * 今日 PDF 生成配额（剩余次数）共享状态。
 * 在需要展示「今日生成剩余次数」的页面 onMounted 时调用 loadQuota()，
 * 每次生成/重新生成成功后再调用一次即可让剩余次数 -1。
 */
export function usePdfQuota() {
  const quota = ref<PdfQuotaVO>({ limit: 0, used: 0, remaining: 0 })
  const loading = ref(false)

  async function loadQuota() {
    loading.value = true
    try {
      const res = await getPdfQuotaToday()
      quota.value = res.data.data
    } catch (e: any) {
      // 配额查询为辅助展示，失败不影响主流程
    } finally {
      loading.value = false
    }
  }

  return { quota, loading, loadQuota }
}
