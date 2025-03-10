import type { Types } from '~/main'

export const defaultParameters = {
  // f = a*x^2 + b*x
  // goes linear at lower and upper bounds
  a: 0.0021,
  b: 0.034,
  lower: {
    lim: -22,
    m: -0.0584,
    b: -0.0164
  },
  upper: {
    lim: 16,
    m: 0.1012,
    b: 0.4624
  }
}

export const defaultModel: Types.PlanGradeModel = (grade: number): number => {
  if (grade < defaultParameters.lower.lim) {
    return defaultParameters.lower.m * grade + defaultParameters.lower.b
  } else if (grade > defaultParameters.upper.lim) {
    return defaultParameters.upper.m * grade + defaultParameters.upper.b
  } else {
    return defaultParameters.a * grade ** 2 + defaultParameters.b * grade + 1
  }
}
