const _ = require('lodash')
const { areSame, MissingDataError } = require('../util')

const areSameWaypoint = (a, b) => Boolean(a && b && areSame(a.site, b.site) && a.loop === b.loop)

class Waypoint {
  constructor (data) {
    Object.defineProperty(this, '_data', { value: {} })

    data = _.defaults(data, { loop: 1 })

    Object.assign(this, data)
  }

  get __class () { return 'Waypoint' }

  get site () { return this._data.site }
  set site (v) {
    if (v.__class !== 'Site') throw new TypeError('Waypoint "site" field must be of "Site" class.')
    this._data.site = v
  }

  get course () { return this.site.course }

  get name () {
    if (this.loop >= 2 && this.type !== 'finish') {
      return `${this.site.name} ${this.loop}`
    } else {
      return this.site.name
    }
  }

  get description () { return this.site.description }

  get loc () {
    return (this.site.percent + this.loop - 1) * this.course.loopDist
  }

  set loc (v) {
    if (!_.isNumber(v)) throw new Error('Wrong format for Waypoint.loc')
    if (this.type === 'start') {
      this.site.percent = 0
    } else if (this.type === 'finish') {
      this.site.percent = 1
    } else {
      this.site.percent = (v / this.course.loopDist) % 1
    }
  }

  get lat () {
    if (!_.isNumber(this.site.lat)) this.refreshLLA()
    return this.site.lat
  }

  get lon () {
    if (!_.isNumber(this.site.lon)) this.refreshLLA()
    return this.site.lon
  }

  get alt () {
    if (this.site.elevation === undefined && this.course?.track?.points) this.refreshLLA()
    return this.site.elevation
  }

  set lat (v) { this.site.lat = v }
  set lon (v) { this.site.lon = v }
  set alt (v) { this.site.elevation = v }
  get tier () { return this.site.tier || 1 }
  get type () { return this.site.type }

  get dropbags () { return this.site.dropbags || false }
  set dropbags (v) { this.site.dropbags = Boolean(v) }

  get crew () { return this.site.crew || false }
  set crew (v) { this.site.crew = Boolean(v) }

  terrainFactor (waypoints, useId = true) {
    if ((this.site.terrainFactor !== null && this.site.terrainFactor !== undefined) || !waypoints) {
      return this.site.terrainFactor
    } else {
      const wps = waypoints.filter(wp => wp.loop === 1).sort((a, b) => a.loc - b.loc)
      const i = this.site._id && useId
        ? wps.findIndex(wp => wp.site._id === this.site._id)
        : wps.findIndex(wp => wp.loc > this.loc)
      const wp = wps.filter((wp, j) =>
        (i < 0 || j < i) &&
        wp.terrainFactor() !== null
      ).pop()
      if (wp) {
        return wp.terrainFactor()
      } else {
        return null
      }
    }
  }

  terrainType (waypoints, useId = true) {
    if (this.site.terrainType || !waypoints) {
      return this.site.terrainType
    } else {
      const wps = waypoints.filter(wp => wp.loop === 1).sort((a, b) => a.loc - b.loc)
      const i = this.site._id && useId
        ? wps.findIndex(wp => wp.site._id === this.site._id)
        : wps.findIndex(wp => wp.loc > this.loc)
      const wp = wps.filter((wp, j) =>
        (i < 0 || j < i) &&
        wp.terrainType()
      ).pop()
      if (wp) {
        return wp.terrainType()
      } else {
        return null
      }
    }
  }

  len (segments) {
    if (this.loc === 0) return 0
    const segment = this.matchingSegment(segments)
    if (segment) return segment.len
    return undefined
  }

  gain (segments) {
    if (this.loc === 0) return 0
    const segment = this.matchingSegment(segments)
    if (segment) return segment.gain
    return undefined
  }

  loss (segments) {
    if (this.loc === 0) return 0
    const segment = this.matchingSegment(segments)
    if (segment) return segment.loss
    return undefined
  }

  time (segments) {
    if (this.loc === 0) return 0
    const segment = this.matchingSegment(segments)
    if (segment) return segment.time
    return undefined
  }

  pace (segments) {
    if (this.loc === 0) return 0
    const segment = this.matchingSegment(segments)
    if (segment) return segment.pace
    return undefined
  }

  elapsed (segments) {
    // return elapsed time at waypoint, assume segments array includes waypoint
    if (this.loc === 0) return 0
    const segment = this.matchingSegment(segments)
    if (segment) return segment.elapsed
    return undefined
  }

  get hasTypicalDelay () {
    return Boolean(
      this.type === 'aid' ||
      this.type === 'water' ||
      (this.loop >= 2 && this.type === 'start')
    )
  }

  delay (typicalDelay, waypointDelays) {
    console.warn('"Waypoint.delay" field is deprecated.')
    const wpd = waypointDelays.find(
      wpd => wpd.site === this.site._id && this.loop === wpd.loop
    )
    if (wpd) {
      return wpd.delay
    } else if (this.hasTypicalDelay) {
      return typicalDelay
    } else {
      return 0
    }
  }

  get cutoff () {
    // getting cutoff retrieves from array of {time, loop} items
    if (this.tier === 1) {
      const v = this.site.cutoffs?.find(c => c.loop === this.loop)
      if (v) { return v.time }
    }
    return null
  }

  set cutoff (v) {
    // setting a cutoff updates or removes that item from array on db item

    // find index of cutoff if it already exists
    const i = this.site.cutoffs?.findIndex(c => c.loop === this.loop)

    // if it already exists, update or remove it
    if (i >= 0) {
      if (v) {
        this.site.cutoffs[i].time = v
      } else {
        this.site.cutoffs.splice(i, 1)
      }

    // otherwise add a new one
    } else if (v) {
      if (!this.site.cutoffs) { this.site.cutoffs = [] }
      this.site.cutoffs.push({ time: v, loop: this.loop })
    }
  }

  matchingSegment (segments) {
    return segments.find(s =>
      s.waypoint.site._id === this.site._id && s.waypoint.loop === this.loop
    )
  }

  // function updates the lat/lon/alt of a waypoint
  refreshLLA () {
    if (!this.course?.track?.points?.length) throw new MissingDataError('No track points defined', 'points')

    let lat, lon, alt, ind

    // if start use start lla
    if (this.type === 'start') {
      ;({ lat, lon, alt } = this.course.track.points[0])

    // if finish use finish lla
    } else if (this.type === 'finish') {
      ;({ lat, lon, alt } = _.last(this.course.track.points))

    // otherwise interpolate the lla from track array
    } else {
      ;({ lat, lon, alt, ind } = this.course.track.getLLA(this.loc / this.course.distScale, { start: this.site.pointsIndex || 0 }))
    }
    // update site values
    this.lat = lat
    this.lon = lon
    this.alt = alt
    if (ind) this.site.pointsIndex = ind

    // TODO. clearing splits; not sure if this is the best place to put this
    this.course.clearCache(1)
  }

  serialize () {
    const data = _.pick(this, [
      'loop',
      'name',
      'type',
      'cutoff',
      'loc',
      'lat',
      'lon',
      'alt',
      'tier',
      'crew',
      'dropbags'
    ])

    const terrainFactor = this.course.terrainFactors.find(tf => areSameWaypoint(tf.startWaypoint, this))
    data.terrainFactor = terrainFactor ? terrainFactor.tF : null
    data.terrainType = terrainFactor ? terrainFactor.type : ''

    data.site = this.site._id
    return data
  }
}

module.exports = Waypoint
