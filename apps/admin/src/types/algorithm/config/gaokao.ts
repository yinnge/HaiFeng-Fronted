export interface GaokaoConfigDetailVO {
  defaultDensityK: number
  defaultLineSteepness: number
  defaultRankSteepness: number
  newGaokaoLineWeight: number
  newGaokaoRankWeight: number
  oldGaokaoLineWeight: number
  oldGaokaoRankWeight: number
  weightSoftGroup: number
  weightSoftBoth: number
  yearWeights: number[]
  createdAt: string
}

export interface GaokaoConfigUpdateDTO {
  defaultDensityK: number
  defaultLineSteepness: number
  defaultRankSteepness: number
  newGaokaoLineWeight: number
  newGaokaoRankWeight: number
  oldGaokaoLineWeight: number
  oldGaokaoRankWeight: number
  weightSoftGroup: number
  weightSoftBoth: number
  yearWeights: number[]
}
