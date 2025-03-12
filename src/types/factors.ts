export type FactorsObject = {
  altitude: number
  climbStrategy: number
  descentStrategy: number
  grade: number
  terrain: number
  heat: number
  dark: number
  strategy: number
}

export type FactorsKeys = keyof FactorsObject

export interface Factors extends FactorsObject {
  combined: number
  applyEach: (f: (val: number, factor2: number) => number, factors: FactorsObject) => void
  init(val: number): Factors
}
