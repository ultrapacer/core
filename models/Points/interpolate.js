const { latlon: LatLon } = require('sgeo')
const Point = require('../Point')
const { interp } = require('../../util/math')

// interpolate between two points
function interpolate(p1, p2, loc) {
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
  fields1.forEach((field) => {
    p3[field] = p1[field]
  })

  // linear interpolation of other fields
  const fields2 = ['alt']
  fields2.forEach((field) => {
    p3[field] = interp(p1.loc, p2.loc, p1[field], p2[field], p3.loc)
  })

  return p3
}

module.exports = interpolate
