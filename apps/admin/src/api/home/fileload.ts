import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  FileLoadListVO,
  FileLoadDetailVO,
  FileLoadQueryDTO,
  FileLoadUploadDTO,
  FileTargetAudience,
} from '@/types/home/fileload'

/** 初中 / 高中 接口前缀 */
const PREFIX_MAP: Record<FileTargetAudience, string> = {
  middle_school: '/api/v1/admin/fileload/middle',
  high_school: '/api/v1/admin/fileload/high',
}

/** 上传文件（multipart：file + targetAudience + subject + applicableStage） */
export const uploadFileLoad = (audience: FileTargetAudience, data: FormData) => {
  return request.post<R<number>>(`${PREFIX_MAP[audience]}/upload`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** 分页查询文件列表 */
export const getFileLoadPage = (audience: FileTargetAudience, params: FileLoadQueryDTO) => {
  return request.get<R<PageResult<FileLoadListVO>>>(`${PREFIX_MAP[audience]}/list`, { params })
}

/** 动态返回 applicable_stage 去重值（筛选下拉，不再写死） */
export const getFileLoadStages = (audience: FileTargetAudience) => {
  return request.get<R<string[]>>(`${PREFIX_MAP[audience]}/stages`)
}

/** 动态返回 subject 去重值 */
export const getFileLoadSubjects = (audience: FileTargetAudience) => {
  return request.get<R<string[]>>(`${PREFIX_MAP[audience]}/subjects`)
}

/** 动态返回 tag 去重值 */
export const getFileLoadTags = (audience: FileTargetAudience) => {
  return request.get<R<string[]>>(`${PREFIX_MAP[audience]}/tags`)
}

/** 获取文件详情（返回预签名下载 URL） */
export const getFileLoadDetail = (audience: FileTargetAudience, id: string) => {
  return request.get<R<FileLoadDetailVO>>(`${PREFIX_MAP[audience]}/${id}`)
}

/** 修改文件信息（学科/适合人群，需带 version） */
export const updateFileLoad = (audience: FileTargetAudience, id: string, data: FileLoadUploadDTO) => {
  return request.put<R<void>>(`${PREFIX_MAP[audience]}/${id}`, data)
}

/** 删除文件 */
export const deleteFileLoad = (audience: FileTargetAudience, id: string) => {
  return request.delete<R<void>>(`${PREFIX_MAP[audience]}/${id}`)
}
