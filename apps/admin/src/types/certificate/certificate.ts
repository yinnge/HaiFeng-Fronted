export interface CertificateListVO {
  id: string
  certName: string
  category: string | null
  certLevel: string | null
  applicableMajor: string | null
  registrationTime: string | null
  examTime: string | null
  examFee: number | null
  isDeleted: boolean
  updatedAt: string
}

export interface CertificateDetailVO {
  id: string
  certName: string
  category: string | null
  certLevel: string | null
  applicableMajor: string | null
  registrationTime: string | null
  examTime: string | null
  examFee: number | null
  certIntro: string | null
  examRequirements: string[]
  examArrangement: string | null
  officialWebsite: string | null
  createdAt: string
  updatedAt: string
}

export interface CertificateQueryDTO {
  certName?: string
  category?: string
  certLevel?: string
  applicableMajor?: string
  isDeleted?: boolean
  page: number
  size: number
}

export interface CertificateAddDTO {
  certName: string
  category?: string
  certLevel?: string
  applicableMajor?: string
  registrationTime?: string
  examTime?: string
  examFee?: number
  certIntro?: string
  examRequirements?: string[]
  examArrangement?: string
  officialWebsite?: string
}

export interface CertificateUpdateDTO extends CertificateAddDTO {
  id: string
}
