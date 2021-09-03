class Waypoint {
  // #courseDistance; need webpack 5
  constructor (site, loop = 1, courseDistance = 0) {
    this.site = site
    this.loop = loop
    // this.#courseDistance = courseDistance
    this.courseDistance = courseDistance
    this.visible = site.tier === 1
  }

  name () {
    if (this.loop >= 2 && this.type() !== 'finish') {
      return `${this.site.name} ${this.loop}`
    } else {
      return this.site.name
    }
  }

  description () { return this.site.description }

  loc () {
    // return this.site.location + (this.#courseDistance * (this.loop - 1))
    return this.site.location + (this.courseDistance * (this.loop - 1))
  }

  lat () { return this.site.lat }
  lon () { return this.site.lon }
  alt () { return this.site.elevation }
  tier () { return this.site.tier }
  type () { return this.site.type }

  terrainFactor (waypoints) {
    if ((this.site.terrainFactor !== null && this.site.terrainFactor !== undefined) || !waypoints) {
      return this.site.terrainFactor
    } else {
      const wps = waypoints.filter(wp => wp.loop === 1).sort((a, b) => a.loc() - b.loc())
      const i = this.site._id
        ? wps.findIndex(wp => wp.site._id === this.site._id)
        : wps.findIndex(wp => wp.loc() > this.loc())
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

  terrainType (waypoints) {
    if (this.site.terrainType || !waypoints) {
      return this.site.terrainType
    } else {
      const wps = waypoints.filter(wp => wp.loop === 1).sort((a, b) => a.loc() - b.loc())
      const i = this.site._id
        ? wps.findIndex(wp => wp.site._id === this.site._id)
        : wps.findIndex(wp => wp.loc() > this.loc())
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

  elapsed (segments) {
    // return elapsed time at waypoint, assume segments array includes waypoint
    if (this.loc() === 0) return 0
    const segment = this.matchingSegment(segments)
    if (segment) return segment.elapsed
    return undefined
  }

  actualElapsed (segments) {
    // return actual elapsed time at waypoint, assume segments array includes waypoint
    if (this.loc() === 0) return 0
    const segment = this.matchingSegment(segments)
    if (segment) return segment.actualElapsed
    return undefined
  }

  hasTypicalDelay () {
    return Boolean(
      this.type() === 'aid' ||
      this.type() === 'water' ||
      (this.loop >= 2 && this.type() === 'start')
    )
  }

  delay (typicalDelay, waypointDelays) {
    const wpd = waypointDelays.find(
      wpd => wpd.site === this.site._id && this.loop === wpd.loop
    )
    if (wpd) {
      return wpd.delay
    } else if (this.hasTypicalDelay()) {
      return typicalDelay
    } else {
      return 0
    }
  }

  actualDelay (points) {
    if (points[0].actual === undefined) { return undefined }
    if (!this.loc() || this.type() === 'finish') return 0
    const threshold = 0.1 // km, distance away for time reference
    const l = this.loc()
    const start = Math.max(0, points.findIndex(p => p.loc > l - threshold) - 1)
    const end = Math.min(points.findIndex((p, i) => i > start && p.loc > l + threshold), points.length - 1)
    const plannedNoDelay = points[end].time - points[start].time
    const actualWithDelay = points[end].actual.elapsed - points[start].actual.elapsed
    return plannedNoDelay && actualWithDelay ? actualWithDelay - plannedNoDelay : undefined
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
}

// Returns an array of waypoints on the course including loops:
function loopedWaypoints (waypoints, loops = 1, courseDistance = 0) {
  const wpls = []
  for (let il = 1; il <= loops; il++) {
    wpls.push(
      ...waypoints.map(
        wp => {
          return new Waypoint(wp, il, courseDistance)
        }
      )
    )
  }
  return wpls.filter(wpl => wpl.loop === loops || wpl.type() !== 'finish')
}

module.exports = {
  Waypoint: Waypoint,
  loopedWaypoints: loopedWaypoints
}
