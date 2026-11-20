import { cleanupUploadedImages } from '@/api/common/upload'

/**
 * 追踪「本次弹窗会话中上传、但最终未被保存」的图片 URL，关闭时统一清理。
 *
 * <p>背景：图片上传是「先落 OSS、再存 DB URL」两步式。编辑弹窗里传了新图又取消，
 * 或反复换图时，中间那些从未写进业务表的 URL 会成为孤儿永久残留；
 * 后端基于「DB 旧值 vs 新值」的清理扫不到它们，只能由前端在关闭时主动回收。
 *
 * <p>判定规则：本次会话上传过的 URL（uploaded）中，不在「提交成功时最终保留列表」
 * （retained）里的，就是要删的孤儿。未提交（取消 / 关闭 / 提交失败）时 retained 为空，
 * 即全部回收。
 */
export function createPendingUploadTracker() {
  /** 本次会话经上传接口产生的 URL；手填的外部链接不算，避免误删 */
  let uploaded: string[] = []
  /** 提交成功后最终被业务表引用的 URL，这些绝不能删 */
  let retained: string[] = []

  return {
    /** 记录一次真实上传成功 */
    track(url: string) {
      if (url && !uploaded.includes(url)) {
        uploaded.push(url)
      }
    },

    /**
     * 提交成功后调用，声明本次最终保留的图片 URL。
     * 不调用则视为「未提交」，关闭时 uploaded 全部回收。
     */
    markSubmitted(finalUrls: Array<string | undefined | null>) {
      retained = finalUrls.filter((u): u is string => !!u)
    },

    /**
     * 弹窗关闭时调用：回收上传了但没被保存的孤儿图。
     * 先清空内部状态再发请求，避免重复关闭 / 重复触发导致重复删除。
     * 清理失败只留孤儿，不干扰主流程（后端删除本身也只记日志不抛错）。
     */
    async flush() {
      const toDelete = uploaded.filter((u) => !retained.includes(u))
      uploaded = []
      retained = []
      if (!toDelete.length) return
      try {
        await cleanupUploadedImages(toDelete)
      } catch {
        // 静默：孤儿残留可接受，不能因为清理失败影响用户关闭弹窗
      }
    },

    /** 弹窗重新打开时兜底重置（正常流程 flush 已清空） */
    reset() {
      uploaded = []
      retained = []
    },
  }
}
