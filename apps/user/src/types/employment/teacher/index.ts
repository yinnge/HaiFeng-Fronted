export interface TeacherQueryDTO {
  page?: number
  size?: number
  keyword?: string
  schoolType?: string
  schoolNature?: string
  subject?: string
  province?: string
  city?: string
  district?: string
  recruitmentCount?: number
  ageLimit?: number
  positionStatus?: string
}

export interface TeacherPositionListVO {
  id: number
  schoolName: string
  schoolType: string
  schoolNature: string
  positionName: string
  subject: string
  recruitmentType: string
  province: string
  city: string
  district: string
  workExperience: string
  recruitmentCount: number
  ageLimit: number
  salaryRange: string
  regStartDate: string
  regEndDate: string
  positionStatus: string
}

export interface TeacherPositionDetailVO {
  id: number
  schoolName: string
  schoolType: string
  schoolNature: string
  supervisingDept: string
  positionName: string
  subject: string
  recruitmentType: string
  province: string
  city: string
  district: string
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  ageLimit: number
  recruitmentCount: number
  teacherCertRequirement: string
  teacherCertSubject: string
  putonghuaLevel: string
  otherCertRequirement: string | null
  workExperience: string
  isNormalMajor: string
  salaryRange: string
  benefits: string
  examContent: string
  interviewForm: string
  regStartDate: string
  regEndDate: string
  examTime: string
  positionStatus: string
  applyLink: string
  contactPhone: string
  remark: string
  content: string
}
