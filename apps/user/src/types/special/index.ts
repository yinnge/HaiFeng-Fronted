// ==== Special Channel (特殊招生通道) ====
export interface SpecialChannelListVO {
  id: string
  channelCode: string
  channelName: string
  subtitle: string
  filterLabel: string
  displayType: string
}

export interface SpecialChannelQueryDTO {
  page?: number
  size?: number
  displayType?: string
  channelName?: string
}

export interface SpecialChannelDetailVO {
  id: string
  channelCode: string
  channelName: string
  subtitle: string
  filterLabel: string
  displayType: string
  content: string
}

// ==== Channel-University Association (通道-大学关联) ====
export interface ChannelUniversityListVO {
  universityId: string
  universityName: string
  year: number
  regionTag: string
  signupStart: string
  signupEnd: string
}

export interface ChannelUniversityQueryDTO {
  page?: number
  size?: number
  channelCode: string
  regionTag?: string
  signupStart?: string
  signupEnd?: string
}

export interface ChannelUniversityDetailVO {
  id: string
  channelCode: string
  channelName: string
  universityId: string
  universityName: string
  year: number
  regionTag: string
  signupStart: string
  signupEnd: string
  officialUrl: string
  brochureTitle: string
  brochureContent: string
}

// ==== Strong Base Score (强基计划数据) ====
export interface StrongBaseScoreListVO {
  id: string
  universityId: string
  universityName: string
  year: number
  province: string
  subjectType: string
  majorName: string
  majorCode: string
  entryScore: number
  entryScoreType: string
  entryRatio: string
  admissionScore: number
  planCount: number
  admissionCount: number
}

export interface StrongBaseScoreQueryDTO {
  page?: number
  size?: number
  year?: number
  province?: string
  subjectType?: string
  entryScoreType?: string
  universityName?: string
  majorName?: string
  majorCode?: string
}

export interface StrongBaseScoreDetailVO {
  id: string
  universityId: string
  universityName: string
  year: number
  province: string
  subjectType: string
  majorName: string
  majorCode: string
  entryScore: number
  entryScoreType: string
  entryFormula: string
  entryRatio: string
  admissionScore: number
  admissionFormula: string
  planCount: number
  admissionCount: number
  remark: string
}

// ==== Strong Base University Config (强基院校配置) ====
export interface StrongBaseUniversityDetailVO {
  id: string
  universityId: string
  universityName: string
  isPilot: boolean
  pilotYear: number
  officialUrl: string
  signupUrl: string
  testBeforeScore: boolean
  defaultEntryRatio: string
  defaultAdmissionFormula: string
  availableMajors: string[]
  specialNotes: string
}

// ==== Display Type Mapping (展示类型映射) ====
export const DisplayTypeLabel: Record<string, string> = {
  UNIVERSITY_LIST: '院校列表',
  ARTICLE_ONLY: '文章',
  MAJOR_DATA: '专业数据',
  GROUP: '分组',
}

export const DisplayTypeOptions = [
  { value: '', label: '全部' },
  { value: 'UNIVERSITY_LIST', label: '院校列表' },
  { value: 'ARTICLE_ONLY', label: '文章' },
  { value: 'MAJOR_DATA', label: '专业数据' },
  { value: 'GROUP', label: '分组' },
]

export const SubjectTypeOptions = [
  { value: '', label: '全部' },
  { value: '物理类', label: '物理类' },
  { value: '历史类', label: '历史类' },
  { value: '理科', label: '理科' },
  { value: '文科', label: '文科' },
  { value: '综合改革', label: '综合改革' },
]

export const EntryScoreTypeOptions = [
  { value: '', label: '全部' },
  { value: '高考成绩', label: '高考成绩' },
  { value: '加权成绩', label: '加权成绩' },
  { value: '校测初试', label: '校测初试' },
]
