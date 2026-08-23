import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { FileLoadListVO, FileLoadDetailVO, FileLoadQueryDTO, FileLoadAudience } from '@/types/fileload'

const PREFIX = '/api/v1/app/fileload'

/** 分页查询专栏文件列表（需登录，对应后端 /list） */
export const getFileLoadList = (audience: FileLoadAudience, params: FileLoadQueryDTO) =>
  request.get<R<PageResult<FileLoadListVO>>>(`${PREFIX}/${audience}/list`, { params })

/** 获取专栏文件详情（需 VIP，后端已附带预览/下载 URL） */
export const getFileLoadDetail = (audience: FileLoadAudience, id: string) =>
  request.get<R<FileLoadDetailVO>>(`${PREFIX}/${audience}/${id}`)
