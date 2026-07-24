export interface LaboratoryListVO {
  id: string
  universityId: string
  universityName: string
  name: string
  labType: string
  region: string
  department: string
  director: string
  status: number
  createdAt: string
}

export interface LaboratoryDetailVO {
  id: string
  universityId: string
  universityName: string
  name: string
  labType: string
  establishedYear: string
  region: string
  department: string
  director: string
  staffCount: string
  studentCount: string
  email: string
  phone: string
  introduction: string
  researchDescription: string
  labSpace: string
  openTopics: string
  cooperation: string
  visitingScholars: string
  researchFields: string[]
  majorEquipment: string[]
  coreTeam: CoreTeamItem[]
  statistics: StatisticsItem[]
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface CoreTeamItem {
  name: string; position: string; title: string
}

export interface StatisticsItem {
  label: string; count: number
}

export interface LaboratoryQueryDTO {
  universityName?: string
  name?: string
  labType?: string
  region?: string
  department?: string
  status?: number
  page: number
  size: number
}

export interface LaboratoryAddDTO {
  universityId: string
  name: string
  labType: string
  establishedYear?: string
  region?: string
  department?: string
  director?: string
  staffCount?: string
  studentCount?: string
  email?: string
  phone?: string
  introduction?: string
  researchDescription?: string
  labSpace?: string
  openTopics?: string
  cooperation?: string
  visitingScholars?: string
  researchFields?: string[]
  majorEquipment?: string[]
  coreTeam?: CoreTeamItem[]
  statistics?: StatisticsItem[]
  sortOrder?: number
}

export interface LaboratoryUpdateDTO extends LaboratoryAddDTO {
  status?: number
}

export interface LaboratoryRelationUpdateDTO {
  coreTeam?: CoreTeamItem[]
  statistics?: StatisticsItem[]
}
