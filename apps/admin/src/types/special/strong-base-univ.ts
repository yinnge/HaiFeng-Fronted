export interface StrongBaseUnivListVO {
  id: string
  universityName: string
  isPilot: boolean
  pilotYear: number | null
  testBeforeScore: boolean
}

export interface StrongBaseUnivDetailVO {
  id: string
  universityId: string
  universityName: string
  isPilot: boolean
  pilotYear: number | null
  officialUrl: string | null
  signupUrl: string | null
  testBeforeScore: boolean
  defaultEntryRatio: string | null
  defaultAdmissionFormula: string | null
  availableMajors: string[] | null
  specialNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface StrongBaseUnivQueryDTO {
  page: number
  size: number
  universityName?: string
  isPilot?: boolean
  pilotYear?: number
  testBeforeScore?: boolean
}

export interface StrongBaseUnivAddDTO {
  universityId: string
  universityName: string
  isPilot?: boolean
  pilotYear?: number
  officialUrl?: string
  signupUrl?: string
  testBeforeScore?: boolean
  defaultEntryRatio?: string
  defaultAdmissionFormula?: string
  availableMajors?: string[]
  specialNotes?: string
}

export interface StrongBaseUnivUpdateDTO {
  universityId: string
  universityName: string
  isPilot?: boolean
  pilotYear?: number
  officialUrl?: string
  signupUrl?: string
  testBeforeScore?: boolean
  defaultEntryRatio?: string
  defaultAdmissionFormula?: string
  availableMajors?: string[]
  specialNotes?: string
}
