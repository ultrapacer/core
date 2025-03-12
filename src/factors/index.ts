import { Types } from '../main'
import { getAltitudeFactor } from './altitude'
import { getDarkFactor } from './dark'
import { factorKeys, Factors } from './Factors'
import { getGradeFactor } from './grade'
import { getHeatFactor } from './heat'
import { getTerrainFactor } from './terrain'

// utility function to offset by 1 and scale
export function applyScale(fact: number, scale?: number) {
  if (scale === undefined) return fact
  return (fact - 1) * scale + 1
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

    point.factors.grade = getGradeFactor(point.grade, plan.gradeModel)

    point.factors.strategy = plan.strategy.at(point.loc)

    if (plan.strategies?.climbing?.filter(point)) {
      point.factors.climbStrategy = plan.strategies.climbing.factor
    } else point.factors.climbStrategy = plan.strategies.climbing?.default ?? 1

    if (plan.strategies?.descending?.filter(point)) {
      point.factors.descentStrategy = plan.strategies.descending.factor
    } else point.factors.descentStrategy = plan.strategies.descending?.default ?? 1

    Object.assign(point.factors, {
      heat: plan.heatModel ? getHeatFactor(point, plan.heatModel) : 1,
      dark: plan.event.sun ? getDarkFactor(point.tod, point.factors.terrain, plan.event.sun) : 1
    })
  }

  // if any factor scales exist, apply them:
  point.factors.altitude = applyScale(point.factors.altitude, plan.scales?.altitude)
  point.factors.dark = applyScale(point.factors.dark, plan.scales?.dark)
}

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
