import { Course } from '../models/Course'
import { CoursePoint } from '../models/CoursePoint'
import { Plan } from '../models/Plan'
import { PlanPoint } from '../models/PlanPoint'
import { getAltitudeFactor } from './altitude'
import { getDarkFactor } from './dark'
import { Factors } from './Factors'
import { getGradeFactor } from './grade'
import { getHeatFactor } from './heat'
import { getTerrainFactor } from './terrain'

// utility function to offset by 1 and scale
export function applyScale(fact: number, scale: number) {
  return (fact - 1) * scale + 1
}

export function generateCourseFactors(point: CoursePoint | PlanPoint, course: Course) {
  if (!point.factors) point.factors = new Factors()
  Object.assign(point.factors, {
    grade: getGradeFactor(point.grade),
    altitude: getAltitudeFactor(point.alt),
    terrain: getTerrainFactor(point, course)
  })
}

// function to generate pacing factors for a point
export function generatePlanFactors(point: PlanPoint, plan: Plan) {
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
  point.factors.altitude = applyScale(point.factors.altitude, plan.scales.altitude)
  point.factors.dark = applyScale(point.factors.dark, plan.scales.dark)
}

export { list } from './list'
export { Strategy } from './strategy'
export { Factors }
