export interface DepartmentListVO {
  id: string
  universityId: string
  universityName: string
  departmentName: string
  departmentType: string
  pageTitle: string
  tags: string[]
  sortOrder: number
  status: number
  createdAt: string
}

export interface DepartmentDetailVO extends DepartmentListVO {
  updatedAt: string
  report: DepartmentReportVO
}

export interface DepartmentReportVO {
  subtitle: string
  citySalary: CitySalaryItem[]
  postgraduate: { title: string; directions: string[] }
  disclaimer: { text: string; updateTime: string; version: string; compileUnit: string }
  prospects: {
    employmentRate: string; masterSalary: string; furtherStudyRate: string
    fortune500Rate: string; salaryGrowthRate: string; overseasRate: string
  }
  trends: {
    highGrowthTracks: string[]; policyOrientations: string[]; environmentAnalysis: string[]
  }
  overview: { title: string; descriptions: string[] }
  career: CareerPath[]
  subjectsDetail: SubjectDetailItem[]
  salary: SalaryItem[]
  majorCompose: MajorComposeItem[]
}

export interface CitySalaryItem {
  cityName: string; minSalary: number; maxSalary: number
}

export interface CareerPath {
  pathTitle: string; pathDesc: string
  stages: { stageTitle: string; workYears: string; position: string; coreGoal: string; salaryRange: string }[]
}

export interface SubjectDetailItem {
  majorName: string; tags: string[]; coreSubject: string; supportSubject: string
  positioning: string; coreCourses: string[]; abilities: string[]; certificates: string[]
}

export interface SalaryItem {
  majorName: string; minSalary: number; maxSalary: number
}

export interface MajorComposeItem {
  subjectName: string; percentage: number
}

export interface DepartmentQueryDTO {
  universityName?: string
  departmentName?: string
  departmentType?: string
  status?: number
  page: number
  size: number
}

export interface DepartmentAddDTO {
  universityId: string
  departmentName: string
  departmentType: string
  pageTitle?: string
  tags?: string[]
  sortOrder?: number
}

export interface DepartmentUpdateDTO extends DepartmentAddDTO {
  status?: number
}
