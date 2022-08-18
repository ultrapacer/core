const { isNumeric } = require('../util/math')

class Waypoint {
  constructor (site, course, loop = 1) {
    this.site = site
    this.course = course
    this.loop = loop
    this.visible = site.tier === 1
  }

  get name () {
    if (this.loop >= 2 && this.type !== 'finish') {
      return `${this.site.name} ${this.loop}`
    } else {
      return this.site.name
    }
  }

  get description () { return this.site.description }

  get loc () {
    const v = this.site.percent * this.course.trackDist
    return v + (this.course.trackDist * (this.loop - 1))
  }

  set loc (v) {
    if (!isNumeric(v)) throw new Error('Wrong format for Waypoint.loc')
    if (this.type === 'start') {
      this.site.percent = 0
      this.site.location = 0 // this is temporary for prior db structure that used location instead of percent
    } else if (this.type === 'finish') {
      this.site.percent = 1
      this.site.location = this.course.trackDist // this is temporary for prior db structure that used location instead of percent
    } else {
      this.site.percent = (v / this.course.trackDist) % 1
      this.site.location = v % this.course.trackDist // this is temporary for prior db structure that used location instead of percent
    }
  }

  // scaled location
  get sloc () {
    return this.loc * this.course.distScale
  }

  get lat () { return this.site.lat }
  get lon () { return this.site.lon }
  get alt () { return this.site.elevation }
  set lat (v) { this.site.lat = v }
  set lon (v) { this.site.lon = v }
  set alt (v) { this.site.elevation = v }
  get tier () { return this.site.tier }
  get type () { return this.site.type }

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

  actualElapsed (segments) {
    // return actual elapsed time at waypoint, assume segments array includes waypoint
    if (this.loc === 0) return 0
    const segment = this.matchingSegment(segments)
    if (segment) return segment.actualElapsed
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

  actualDelay (track) {
    if (track[0].actual === undefined) { return undefined }
    if (!this.loc || this.type === 'finish') return 0
    const threshold = 0.1 // km, distance away for time reference
    const l = this.loc
    const start = Math.max(0, track.findIndex(p => p.loc > l - threshold) - 1)
    const end = Math.min(track.findIndex((p, i) => i > start && p.loc > l + threshold), track.length - 1)
    const plannedNoDelay = track[end].time - track[start].time
    const actualWithDelay = track[end].actual.elapsed - track[start].actual.elapsed
    return plannedNoDelay && actualWithDelay ? actualWithDelay - plannedNoDelay : undefined
  }

  get cutoff () {
    // getting cutoff retrieves from array of {time, loop} items
    if (this.type === 'finish') return this.course.cutoff || null
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

  show () {
    this.visible = true
  }

  hide () {
    this.visible = false
  }

  matchingSegment (segments) {
    return segments.find(s =>
      s.waypoint.site._id === this.site._id && s.waypoint.loop === this.loop
    )
  }

  // function updates the lat/lon/alt of a waypoint
  refreshLLA (track) {
    if (!track) track = this.course?.track
    if (!track) throw new Error('No track defined')

    let lat, lon, alt, ind

    // if start use start lla
    if (this.type === 'start') {
      ;({ lat, lon, alt } = track[0])

    // if finish use finish lla
    } else if (this.type === 'finish') {
      ;({ lat, lon, alt } = track.last)

    // otherwise interpolate the lla from track array
    } else {
      ;({ lat, lon, alt, ind } = track.getLLA(this.loc, { start: this.site.pointsIndex || 0 }))
    }
    // update site values
    this.lat = lat
    this.lon = lon
    this.alt = alt
    if (ind) this.site.pointsIndex = ind
  }
}

module.exports = Waypoint
