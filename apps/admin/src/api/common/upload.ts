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

/**
 * 上传培训机构图片
 *
 * <p>与通用上传同一个公共读 bucket，但 objectKey 落到 haifeng/institutions/ 前缀，
 * 与种子数据（qihang-*.svg 等）在同一目录。校验规则同 uploadImage。
 */
export const uploadInstitutionImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<ImageUploadVO>>(`${PREFIX}/upload-institution`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
}

/**
 * 清理「已上传但最终未保存」的图片（孤儿图）
 *
 * <p>编辑弹窗里上传的图片先落 OSS，若用户取消或反复换图，这些中间产物
 * 从未写进业务表，后端基于 DB 旧值的清理扫不到。弹窗关闭时把这类 URL 送到这里删除。
 *
 * <p>后端只删本系统公共 bucket（URL 含 haifeng/images/ 或 haifeng/institutions/）的对象，
 * 外部地址与相对路径自动跳过，误传也无害。单次最多 50 张。
 */
export const cleanupUploadedImages = (urls: string[]) => {
  if (!urls.length) return Promise.resolve()
  return request.post<R<void>>(`${PREFIX}/cleanup-images`, urls)
}
