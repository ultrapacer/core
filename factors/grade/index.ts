import { defaults } from './defaults'
import { GradeModel } from './GradeModel'

/**
 * get grade factor
 * @param grade - grade as percentage (positive up, negative down)
 * @param model - grade model to use
 * @returns grade factor
 */
export function getGradeFactor(grade: number, model?: GradeModel): number {
  if (model === null || typeof model === 'undefined') {
    model = defaults
  }
  if (grade < model.lower.lim) {
    return model.lower.m * grade + model.lower.b
  } else if (grade > model.upper.lim) {
    return model.upper.m * grade + model.upper.b
  } else {
    return model.a * grade ** 2 + model.b * grade + 1
  }
}
