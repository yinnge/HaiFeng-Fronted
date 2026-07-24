export interface ProvinceConfigListVO {
  province: string
  densityK: number
  lineSteepness: number
  rankSteepness: number
}

export interface ProvinceConfigDetailVO {
  province: string
  densityK: number
  lineSteepness: number
  rankSteepness: number
  createdAt: string
}

export interface ProvinceConfigUpdateDTO {
  densityK: number
  lineSteepness: number
  rankSteepness: number
}
