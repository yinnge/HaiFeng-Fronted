import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'

/** 图片上传结果 */
export interface ImageUploadVO {
  /** 可直接访问的完整 URL（公共读 bucket） */
  url: string
  /** 原始文件名 */
  fileName: string
  /** 文件大小（字节） */
  size: number
}

const PREFIX = '/api/v1/admin/common'

/**
 * 上传公开素材图片
 *
 * <p>图片写入独立的「公共读」bucket，返回永久有效的完整 URL，
 * 可直接被 C 端 <img src> 引用（头像 / 轮播图 / 微信二维码等）。
 *
 * <p>后端限制：仅支持 png / jpg / jpeg / webp / svg，单张 ≤ 2MB。
 */
export const uploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<ImageUploadVO>>(`${PREFIX}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
}
