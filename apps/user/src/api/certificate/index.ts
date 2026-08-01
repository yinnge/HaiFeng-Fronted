import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CertificateListVO,
  CertificateDetailVO,
  CompetitionListVO,
  CompetitionDetailVO,
  CompetitionMajorBriefVO,
  CertificateQueryDTO,
} from '@/types/certificate'

const CERT_PREFIX = '/api/v1/app/certificate'
const COMP_PREFIX = '/api/v1/app/competition'

export const getCertificateCategories = () =>
  request.get<R<string[]>>(`${CERT_PREFIX}/categories`)

export const getCertificateList = (params: CertificateQueryDTO) =>
  request.get<R<PageResult<CertificateListVO>>>(`${CERT_PREFIX}/list`, { params })

export const getCertificateDetail = (certId: string) =>
  request.get<R<CertificateDetailVO>>(`${CERT_PREFIX}/${certId}/detail`)

export const getCompetitionList = (params: { page: number; size: number }) =>
  request.get<R<PageResult<CompetitionListVO>>>(`${COMP_PREFIX}/list`, { params })

export const getCompetitionDetail = (compId: string) =>
  request.get<R<CompetitionDetailVO>>(`${COMP_PREFIX}/${compId}/detail`)

export const getCompetitionMajors = (compId: string, params: { page: number; size: number }) =>
  request.get<R<PageResult<CompetitionMajorBriefVO>>>(`${COMP_PREFIX}/${compId}/majors`, { params })
