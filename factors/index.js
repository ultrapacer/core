import { getAltitudeFactor } from './altitude/index.js'
import { getDarkFactor } from './dark/index.js'
import { getGradeFactor } from './grade/index.js'
import { getHeatFactor } from './heat/index.js'
import { getTerrainFactor } from './terrain/index.js'
import { Factors } from './Factors.js'

// utility function to offset by 1 and scale
export function applyScale(fact, scale) {
  return (fact - 1) * scale + 1
}

// function to generate pacing factors for a point
export function generate(point, { plan, course }) {
  if (!course) course = plan.course

  if (!point.factors) point.factors = new Factors()

  Object.assign(point.factors, {
    grade: getGradeFactor(point.grade),
    altitude: getAltitudeFactor(point.alt),
    terrain: getTerrainFactor({ point, course })
  })

  if (plan) {
    Object.assign(point.factors, {
      strategy: plan.pacing.strategy.at(point.loc)
    })

    if (typeof point.tod !== 'undefined') {
      Object.assign(point.factors, {
        heat: plan.heatModel ? getHeatFactor({ point, model: plan.heatModel }) : 1,
        dark: plan.event.sun
          ? getDarkFactor({
              timeOfDaySeconds: point.tod,
              terrainFactor: point.factors.terrain,
              sun: plan.event.sun
            })
          : 1
      })
    }
  }

  // compile scales of pacing factors:
  const scales = {}
  if (course?.scales) Object.assign(scales, course.scales)
  if (plan?.scales) Object.assign(scales, plan.scales)

  // if any factor scales exist, apply them:
  Object.keys(scales)
    .filter((key) => key !== 1 && point.factors[key])
    .forEach((key) => {
      point.factors[key] = applyScale(point.factors[key], scales[key])
    })
}

export { list } from './list.js'
export { Strategy } from './strategy/index.js'
export { Factors }
