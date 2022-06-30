const { latlon: LatLon } = require('sgeo')
const { interp, isNumeric } = require('../util/math')

class Point {
  constructor (arg) {
    // if arg is length 3, it's lat, lon, alt
    if (arg.length === 3) {
      [this.lat, this.lon, this.alt] = arg

    // if arg is length 5, it's loc, lat, lon, at, grade
    // ** NOTE **, this loc and grade are never used
    } else if (arg.length === 5) {
      [this.loc, this.lat, this.lon, this.alt, this.grade] = arg

    // otherwise it's wrong
    } else {
      throw new Error('Point data invalid')
    }
  }

  get latlon () { return new LatLon(this.lat, this.lon) }

  has (field) {
    return isNumeric(this[field])
  }
}

// interpolate between two points
function interpolatePoint (p1, p2, loc) {
  const p3 = new Point([p1.lat, p1.lon, p1.alt])
  p3.loc = loc

  // lat lon interpolation:
  const p1LL = new LatLon(p1.lat, p1.lon)
  const p2LL = new LatLon(p2.lat, p2.lon)
  const dist = Math.abs(p3.loc - p1.loc)
  const brng = p1LL.bearingTo(p2LL)
  const p3LL = p1LL.destinationPoint(brng, dist)
  p3.lat = Number(p3LL.lat)
  p3.lon = Number(p3LL.lng)

  // use first point for these fields:
  const fields1 = ['grade']
  fields1.forEach(field => { p3[field] = p1[field] })

  // linear interpolation of other fields
  const fields2 = ['alt']
  if (p1.has('tod') && p2.has('tod')) { fields2.push('tod') }
  fields2.forEach(field => {
    p3[field] = interp(
      p1.loc,
      p2.loc,
      p1[field],
      p2[field],
      p3.loc
    )
  })
  return p3
}

// exports.LLA = LLA
exports.Point = Point
exports.interpolatePoint = interpolatePoint
