import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { GrassrootsPositionListVO, GrassrootsPositionDetailVO, GrassrootsQueryDTO } from '@/types/employment/grassroots'

export const getGrassrootsList = (params: GrassrootsQueryDTO) => {
  return request.get<R<PageResult<GrassrootsPositionListVO>>>('/api/v1/app/employment/grassroots/project/list', { params })
}

/** 获取所有不重复的招募年份（倒序），供年份筛选下拉 */
export const getGrassrootsYears = () => {
  return request.get<R<string[]>>('/api/v1/app/employment/grassroots/project/years')
}

/** 获取所有不重复的毕业年份要求（倒序），供毕业年份筛选下拉 */
export const getGrassrootsGradYears = () => {
  return request.get<R<string[]>>('/api/v1/app/employment/grassroots/project/grad-years')
}

export const getGrassrootsDetail = (id: string) => {
  return request.get<R<GrassrootsPositionDetailVO>>(`/api/v1/app/employment/grassroots/project/${id}/detail`)
}
