const _ = require('lodash')
const planPointFields = ['lat', 'lon', 'alt', 'latlon', 'grade', 'loc', 'actual']
class PlanPoint {
  constructor (plan, point) {
    Object.defineProperty(this, '_plan', { value: plan })
    Object.defineProperty(this, '_point', { value: point }) // should be CoursePoint object
    planPointFields.forEach(f => {
      Object.defineProperty(this, f, { get () { return this._point[f] } })
    })
  }

  get __class () { return 'PlanPoint' }

  has (field) {
    return _.isNumber(this[field])
  }

  get pace () {
    const factors = this.factors?.combined
    const np = this._plan.pacing?.np

    if (factors && np) return factors * np

    // if no factors, undefined (this will be the case for last point)
    return undefined
  }
}

module.exports = PlanPoint
