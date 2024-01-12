const planPointFields = ['lat', 'lon', 'alt', 'latlon', 'grade', 'loc', 'actual']

export class PlanPoint {
  constructor(plan, point) {
    Object.defineProperty(this, '_plan', { value: plan })
    Object.defineProperty(this, '_point', { value: point }) // should be CoursePoint object
    Object.defineProperty(this, '_chunk', { writable: true, enumerable: false })
    planPointFields.forEach((f) => {
      Object.defineProperty(this, f, {
        get() {
          return this._point[f]
        }
      })
    })
  }

  get __class() {
    return 'PlanPoint'
  }

  /**
   * np for a point is the same as its parent chunk
   */
  get np() {
    return this._chunk.np
  }

  get factor() {
    return this.factors?.combined
  }

  get pace() {
    const { np, factor } = this

    if (factor && np) return factor * np

    // if no factors, undefined (this will be the case for last point)
    return undefined
  }
}
