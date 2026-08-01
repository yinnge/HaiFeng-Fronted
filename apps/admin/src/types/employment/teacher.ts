export interface TeacherListVO {
  id: string
  schoolName: string
  schoolType: string
  schoolNature: string
  positionName: string
  recruitmentType: string
  province: string
  city: string
  district: string
  positionStatus: string
  updatedAt: string
}

export interface TeacherDetailVO {
  id: string
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
  otherCertRequirement: string
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
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface TeacherQueryDTO {
  page: number
  size: number
  schoolName?: string
  positionName?: string
  schoolType?: string
  schoolNature?: string
  recruitmentType?: string
  province?: string
  city?: string
  district?: string
  positionStatus?: string
}

export interface TeacherAddDTO {
  schoolName: string
  schoolType: string
  schoolNature?: string
  supervisingDept?: string
  positionName: string
  subject: string
  recruitmentType: string
  province: string
  city?: string
  district?: string
  educationRequirement?: string
  degreeRequirement?: string
  majorRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  teacherCertRequirement?: string
  teacherCertSubject?: string
  putonghuaLevel?: string
  otherCertRequirement?: string
  workExperience?: string
  isNormalMajor?: string
  salaryRange?: string
  benefits?: string
  examContent?: string
  interviewForm?: string
  regStartDate?: string
  regEndDate?: string
  examTime?: string
  positionStatus?: string
  applyLink?: string
  contactPhone?: string
  remark?: string
  content?: string
  sortOrder?: number
}

export interface TeacherUpdateDTO {
  schoolName?: string
  schoolType?: string
  schoolNature?: string
  supervisingDept?: string
  positionName?: string
  subject?: string
  recruitmentType?: string
  province?: string
  city?: string
  district?: string
  educationRequirement?: string
  degreeRequirement?: string
  majorRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  teacherCertRequirement?: string
  teacherCertSubject?: string
  putonghuaLevel?: string
  otherCertRequirement?: string
  workExperience?: string
  isNormalMajor?: string
  salaryRange?: string
  benefits?: string
  examContent?: string
  interviewForm?: string
  regStartDate?: string
  regEndDate?: string
  examTime?: string
  positionStatus?: string
  applyLink?: string
  contactPhone?: string
  remark?: string
  content?: string
  sortOrder?: number
}

export interface PositionStatusDTO {
  positionStatus: string
}
