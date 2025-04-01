import type { Types } from '../..'
import { defaultModel } from './defaults'

/**
 * get grade factor
 * @param grade - grade as percentage (positive up, negative down)
 * @param model - grade model to use
 * @returns grade factor
 */
export function getGradeFactor(grade: number, model?: Types.PlanGradeModel): number {
  if (!model) {
    model = defaultModel
  }
  return model(grade)
}
