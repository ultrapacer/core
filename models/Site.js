const _ = require('lodash')
const Waypoint = require('./Waypoint')

const d = require('../debug')('models:Waypoint')

class Site {
  constructor(data) {
    d(`constructor: ${data.name || 'unnamed'}`)

    Object.defineProperty(this, '_cache', { value: {} })
    Object.defineProperty(this, '_data', { value: {} })

    data = _.defaults(data, { cutoffs: [] })

    if (!data.course) throw new Error('Site requires "course" field to be defined.')

    Object.assign(this, data)
  }

  clearCache() {
    d(`clearCache: ${this.name}`)
    Object.keys(this._cache).forEach((key) => {
      delete this._cache[key]
    })
  }

  get __class() {
    return 'Site'
  }

  get course() {
    return this._data.course
  }
  set course(v) {
    if (v.__class !== 'Course')
      throw new TypeError('Site "course" field must be of "Course" class.')
    this._data.course = v
  }

  get percent() {
    switch (this.type) {
      case 'start':
        return 0
      case 'finish':
        return 1
      default:
        return this._data.percent
    }
  }

  set percent(v) {
    this._data.percent = v
  }

  get waypoints() {
    if (this._cache.waypoints) return this._cache.waypoints
    d(`generating waypoints array: ${this.name}`)
    if (this.type === 'finish') {
      this._cache.waypoints = [new Waypoint({ site: this, loop: this.course.loops })]
    } else {
      this._cache.waypoints = _.range(this.course.loops).map(
        (x) => new Waypoint({ site: this, loop: x + 1 })
      )
    }
    return this._cache.waypoints
  }

  serialize() {
    d(`serialize: ${this.name}`)
    const fields = Object.keys(this)
    fields.push('percent')
    return _.pick(this, fields)
  }
}

module.exports = Site
