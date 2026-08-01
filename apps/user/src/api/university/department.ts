import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { DepartmentListVO, DepartmentReportVO } from '@/types/university/department'

const PREFIX = '/api/v1/app/university'

export const getDepartmentPage = (universityId: string, params: { page?: number; size?: number }) =>
  request.get<R<PageResult<DepartmentListVO>>>(`${PREFIX}/${universityId}/departments`, { params })

export const getDepartmentReport = (departmentId: string) =>
  request.get<R<DepartmentReportVO>>(`${PREFIX}/departments/${departmentId}/report`)
