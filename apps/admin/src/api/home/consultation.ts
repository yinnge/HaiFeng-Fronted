import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  ConsultationDetailVO,
  ConsultationListVO,
  ConsultationQueryDTO,
} from '@/types/home/consultation'

const PREFIX = '/api/v1/admin/home/consultation'

export const getConsultationPage = (params: ConsultationQueryDTO) =>
  request.get<R<PageResult<ConsultationListVO>>>(`${PREFIX}/list`, { params })

export const getConsultationDetail = (id: string) =>
  request.get<R<ConsultationDetailVO>>(`${PREFIX}/${id}`)
