import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  FileLoadListVO,
  FileLoadDetailVO,
  FileLoadQueryDTO,
  FileLoadAudience,
  NetdiskInfoVO,
} from '@/types/fileload'

const PREFIX = '/api/v1/app/fileload'

/** 分页查询专栏文件列表（公开，对应后端 /list；支持 subject/applicableStage/tag 精准筛选，AND 关系） */
export const getFileLoadList = (audience: FileLoadAudience, params: FileLoadQueryDTO) =>
  request.get<R<PageResult<FileLoadListVO>>>(`${PREFIX}/${audience}/list`, { params })

/** 获取专栏文件详情（需登录/VIP 按模块定，后端已附带预览/下载 URL） */
export const getFileLoadDetail = (audience: FileLoadAudience, id: string) =>
  request.get<R<FileLoadDetailVO>>(`${PREFIX}/${audience}/${id}`)

/** 获取百度网盘资源取码信息（仅 VIP，返回分享链接 + 提取码） */
export const getFileLoadNetdisk = (audience: FileLoadAudience, id: string) =>
  request.get<R<NetdiskInfoVO>>(`${PREFIX}/${audience}/${id}/netdisk`)

/** 动态获取 applicable_stage 去重值（前端按钮筛选） */
export const getFileLoadStages = (audience: FileLoadAudience) =>
  request.get<R<string[]>>(`${PREFIX}/${audience}/stages`)

/** 动态获取 subject 去重值（前端下拉筛选） */
export const getFileLoadSubjects = (audience: FileLoadAudience) =>
  request.get<R<string[]>>(`${PREFIX}/${audience}/subjects`)

/** 动态获取 tag 去重值（前端下拉筛选） */
export const getFileLoadTags = (audience: FileLoadAudience) =>
  request.get<R<string[]>>(`${PREFIX}/${audience}/tags`)
