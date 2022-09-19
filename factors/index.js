const list = require('./list')
const altitude = require('./altitude')
const dark = require('./dark')
const grade = require('./grade')
const heat = require('./heat')
const terrain = require('./terrain')
const Factors = require('./Factors')

const generate = (point, arg) => {
  const plan = arg.plan
  const course = arg.plan ? arg.plan.course : arg.course

  if (!point.factors) point.factors = new Factors()

  Object.assign(point.factors, {
    grade: grade(point.grade * (point.grade >= 0 ? course.gainScale : course.lossScale)),
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
