const _ = require('lodash')
const addLocations = require('./addLocations')
const { interp } = require('../../util/math')
const debug = require('../../debug')('models:Points')

// clean up array of Point objects
// mutates input array
const clean = (points) => {
  const length0 = points.length

  addLocations(points)

  // filter out any zero-length segments:
  _.remove(points, (p, i) => i > 0 && !_.round(p.loc - points[i - 1].loc, 8))

  // REMOVE ALITITUDE STEPS FROM THE GPX. HAPPENS SOMETIMES WITH STRAVA DEM
  const at = 20 // meters step size
  const gt = 200 // % grade
  let i = 0
  // create array of step indices
  const steps = []
  let dloc = 0
  for (let i = 1, il = points.length; i < il; i++) {
    dloc = points[i].loc - points[i - 1].loc
    if (
      Math.abs((points[i].alt - points[i - 1].alt)) > at ||
        Math.abs((points[i].alt - points[i - 1].alt) / dloc / 10) > gt
    ) {
      steps.push(i)
    }
  }
  // for each step, find extents of adjacent flat sections and interp new alt
  steps.forEach(s => {
    let a = s - 1
    while (a >= 0 && points[s - 1].alt === points[a].alt) { a -= 1 }
    a += 1
    let z = s
    while (z <= points.length - 1 && points[s].alt === points[z].alt) { z += 1 }
    z -= 1
    if (z - a > 1) {
      for (i = a + 1; i < z; i++) {
        points[i].alt = interp(
          points[a].loc,
          points[z].loc,
          points[a].alt,
          points[z].alt,
          points[i].loc
        )
      }
    }
  }
  )
  debug(`clean from ${length0} to ${points.length} points.`)
}

module.exports = clean
