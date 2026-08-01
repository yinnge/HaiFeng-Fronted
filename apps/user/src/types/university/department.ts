export interface DepartmentListVO {
  id: string
  departmentName: string
  departmentType: string
}

export interface DepartmentReportVO {
  subtitle: string
  overview: {
    title: string
    descriptions: string[]
  }
  subjectsDetail: {
    majorName: string
    tags: string[]
    coreSubject: string
    supportSubject: string
    positioning: string
    coreCourses: string[]
    abilities: string[]
    certificates: string[]
  }[]
  postgraduate: {
    title: string
    directions: string[]
  }
  citySalary: {
    cityName: string
    minSalary: number
    maxSalary: number
  }[]
  salary: {
    majorName: string
    minSalary: number
    maxSalary: number
  }[]
  career: {
    pathTitle: string
    pathDesc: string
    stages: {
      stageTitle: string
      workYears: string
      position: string
      coreGoal: string
      salaryRange: string
    }[]
  }[]
  trends: {
    highGrowthTracks: string[]
    policyOrientations: string[]
    environmentAnalysis: string[]
  }
  prospects: {
    employmentRate: string
    masterSalary: string
    furtherStudyRate: string
    fortune500Rate: string
    salaryGrowthRate: string
    overseasRate: string
  }
  disclaimer: {
    text: string
    updateTime: string
    version: string
    compileUnit: string
  }
  majorCompose: {
    subjectName: string
    percentage: number
  }[]
}
