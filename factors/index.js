const list = require('./list')
const altitude = require('./altitude')
const dark = require('./dark')
const grade = require('./grade')
const heat = require('./heat')
const terrain = require('./terrain')
const Factors = require('./Factors')

// utility function to offset by 1 and scale
const applyScale = (fact, scale) => {
  return ((fact - 1) * scale) + 1
}

// function to generate pacing factors for a point
const generate = (point, { plan, course }) => {
  if (!course) course = plan.course

  if (!point.factors) point.factors = new Factors()

  Object.assign(point.factors, {
    grade: grade(point.grade),
    altitude: altitude(point.alt),
    terrain: terrain(point.loc, course.terrainFactors)
  })

  if (plan) {
    Object.assign(point.factors, {
      strategy: plan.pacing.strategy.at(point.loc)
    })

    if (typeof (point.tod) !== 'undefined') {
      Object.assign(point.factors, {
        heat: plan.heatModel ? heat(point.tod, plan.heatModel) : 1,
        dark: plan.event.sun ? dark(point.tod, point.factors.terrain, plan.event.sun) : 1
      })
    }
  }

  // compile scales of pacing factors:
  const scales = {}
  if (course?.scales) Object.assign(scales, course.scales)
  if (plan?.scales) Object.assign(scales, plan.scales)

  // if any factor scales exist, apply them:
  Object.keys(scales)
    .filter(key => key !== 1 && point.factors[key])
    .forEach(key => { point.factors[key] = applyScale(point.factors[key], scales[key]) })
}

module.exports = {
  list,
  Factors,
  altitude,
  dark,
  grade,
  heat,
  terrain,
  Strategy: require('./strategy'),
  generate
}
