// apps/user/src/api/employment/jobIndex/index.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { JobIndexListVO, JobIndexDetailVO, JobSearchDTO } from '@/types/employment/jobIndex'

export const getJobList = (params: JobSearchDTO) => {
  return request.get<R<PageResult<JobIndexListVO>>>('/api/v1/app/employment/job/list', { params })
}

export const getJobDetail = (id: number) => {
  return request.get<R<JobIndexDetailVO>>(`/api/v1/app/employment/job/${id}/detail`)
}
