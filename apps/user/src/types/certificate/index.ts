import type { BasePageQuery } from '@haifeng/shared'

export interface CertificateListVO {
  id: string
  certName: string
  category: string
  certLevel: string
  applicableMajor: string
  registrationTime: string
  examTime: string
  examFee: number
  certIntro: string
}

export interface CertificateDetailVO {
  id: string
  certName: string
  category: string
  certLevel: string
  applicableMajor: string
  registrationTime: string
  examTime: string
  examFee: number
  certIntro: string
  examRequirements: string[]
  examArrangement: string
  officialWebsite: string
}

export interface CompetitionListVO {
  id: string
  compName: string
  compLevel: string
  registrationTime: string
}

export interface CompetitionBasicInfoItem {
  title: string
  content: string
}

export interface CompetitionDetailVO {
  id: string
  competitionId: string
  compName?: string
  compLevel?: string
  basicInfo: CompetitionBasicInfoItem[] | null
  awards: string[] | null
  background: string | null
  purposes: string[] | null
  competitionRules: Array<{ title: string; content: string }> | null
  scoringCriteria: string[] | null
  notices: string[] | null
  /** 后端实际结构为 {title, content}（DB JSONB，V74 迁移后统一），勿按 {step,desc} 取 */
  processGuide: Array<{ title: string; content: string }> | null
  /** 后端实际结构为 {title, content}（DB JSONB），勿按 {level,count} 取 */
  awardsDisplay: Array<{ title: string; content: string }> | null
}

export interface CompetitionMajorBriefVO {
  majorId: string
  majorName: string
}

export interface CompetitionBriefVO {
  competitionId: string
  competitionName: string
}

export interface CertificateQueryDTO extends BasePageQuery {
  category?: string
  certName?: string
  /**
   * 收藏过滤（可选）：仅返回命中的证书 id，与其它筛选 AND 叠加（对应后端 BasePageQueryDTO.ids）。
   * 逗号分隔的 id 字符串（Spring 自动拆分绑定 List<Long>）；后端上限 200 个。
   */
  ids?: string
}

export interface CompetitionQueryDTO extends BasePageQuery {
  compName?: string
  compLevel?: string
  /**
   * 收藏过滤（可选）：仅返回命中的竞赛 id，与其它筛选 AND 叠加（对应后端 BasePageQueryDTO.ids）。
   * 逗号分隔的 id 字符串（Spring 自动拆分绑定 List<Long>）；后端上限 200 个。
   */
  ids?: string
}
