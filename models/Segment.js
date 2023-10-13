import _ from 'lodash'

export class Segment {
  constructor(obj) {
    Object.defineProperty(this, '_data', { value: {} })

    Object.assign(this, obj)
  }

  set name(v) {
    this._data.name = v
  }

  get name() {
    return this._data.name || this.waypoint?.name || undefined
  }

  get start() {
    return this.end - this.len
  }

  get pace() {
    if (!_.isNumber(this.time)) return undefined
    if (!this.time) return 0
    return this.time / this.len
  }

  // time based fields require associated point1 & point2
  get delay() {
    if (
      !_.isNumber(this.point1?.elapsed) ||
      !_.isNumber(this.point2?.elapsed) ||
      !_.isNumber(this.point1?.time) ||
      !_.isNumber(this.point2?.time)
    )
      return undefined
    return this.point2.elapsed - this.point1.elapsed - (this.point2.time - this.point1.time)
  }

  get elapsed() {
    return this.point2?.elapsed
  }

  get time() {
    if (!_.isNumber(this.point1?.time) || !_.isNumber(this.point2?.time)) return undefined
    return this.point2.time - this.point1.time
  }

  get tod() {
    return this.point2?.tod
  }

  // dummy setters, just in case:
  set delay(v) {}
  set pace(v) {}
  set elapsed(v) {}
  set time(v) {}
  set tod(v) {}
}
