export interface LaboratoryListVO {
  id: string
  name: string
  labType: string
}

export interface LaboratoryDetailVO {
  universityName: string
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
  statistics: { label: string; count: number }[]
  majorEquipment: string[]
  coreTeam: { memberName: string; position: string; role: string }[]
}
