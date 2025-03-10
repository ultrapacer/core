import { Types } from '../main'
import { getAltitudeFactor } from './altitude'
import { getDarkFactor } from './dark'
import { factorKeys, Factors, type FactorsKeys, type FactorsObject } from './Factors'
import { getGradeFactor } from './grade'
import { getHeatFactor } from './heat'
import { getTerrainFactor } from './terrain'

// utility function to offset by 1 and scale
function applyScale(fact: number, scale?: number) {
  if (scale === undefined) return fact
  return (fact - 1) * scale + 1
}

/**
 * Apply scales to a PlanPoint
 * @param point - PlanPoint to apply scales to
 * @param plan - Plan to use for scales
 */
function applyScales(point: Types.PlanPoint, plan: Types.Plan) {
  point.factors.altitude = applyScale(point.factors.altitude, plan.scales?.altitude)

  if (point.grade > 0) point.factors.grade = applyScale(point.factors.grade, plan.scales?.climbing)

  if (point.grade < 0 && typeof plan.scales?.descending === 'number') {
    let scale = plan.scales.descending
    // when descending factor is negative, flip the grade to reduce benefit of downhill
    if (point.factors.grade < 1) scale = 2 - scale

    point.factors.grade = applyScale(point.factors.grade, scale)
  }

  point.factors.dark = applyScale(point.factors.dark, plan.scales?.dark)
}

export function generateCourseFactors(
  point: Types.CoursePoint | Types.PlanPoint,
  course: Types.Course
) {
  if (!point.factors) point.factors = new Factors()
  Object.assign(point.factors, {
    grade: getGradeFactor(point.grade),
    altitude: getAltitudeFactor(point.alt),
    terrain: getTerrainFactor(point, course)
  })
}

// function to generate pacing factors for a point
export function generatePlanFactors(point: Types.PlanPoint, plan: Types.Plan) {
  if (!point.factors) point.factors = new Factors()
  generateCourseFactors(point, plan.course)

  if (plan) {
    if (point.factors === undefined) throw new Error('no factors')
    point.factors.strategy = plan.strategy.at(point.loc)

    Object.assign(point.factors, {
      heat: plan.heatModel ? getHeatFactor(point, plan.heatModel) : 1,
      dark: plan.event.sun ? getDarkFactor(point.tod, point.factors.terrain, plan.event.sun) : 1
    })
  }

  // if any factor scales exist, apply them:
  if (plan.scales) applyScales(point, plan)
}

export { typeList } from './list'
export { rollup } from './rollup'
export { Strategy, type StrategyElement, type StrategyElementType } from './strategy'
export {
  factorKeys,
  Factors,
  getAltitudeFactor,
  getDarkFactor,
  getGradeFactor,
  getHeatFactor,
  getTerrainFactor
}
export type { FactorsKeys, FactorsObject }
