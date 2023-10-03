import _ from 'lodash'
import { addLocations } from './addLocations'
import { interp } from '../../util/math'
import { createDebug } from '../../debug'

const d = createDebug('models:Points:clean')

// clean up array of Point objects
// mutates input array
export const clean = (points) => {
  const length0 = points.length

  addLocations(points)

  // filter out any zero-length segments:
  _.remove(points, (p, i) => i > 0 && !_.round(p.loc - points[i - 1].loc, 8))

  // REMOVE ALITITUDE STEPS FROM THE GPX. HAPPENS SOMETIMES WITH STRAVA DEM
  const gt = 40 // % grade
  // create array of indices where we have steep transitions
  const steps = []
  for (let i = 1, il = points.length; i < il; i++) {
    if (
      Math.abs((points[i].alt - points[i - 1].alt) / (points[i].loc - points[i - 1].loc) / 10) > gt
    ) {
      steps.push(i)
    }
  }

  if (steps.length) {
    d(`Fixing ${steps.length} altitude steps`)

    // for each step, move outward to get under the grade threshold
    steps.forEach((i) => {
      let a = i - 1
      let b = i
      let grade = (points[b].alt - points[a].alt) / (points[b].loc - points[a].loc) / 10
      if (Math.abs(grade) > gt) {
        while (Math.abs(grade) > gt) {
          // figure out which way to expand:
          if (!points[b + 1]) a -= 1
          else if (!points[a - 1]) b += 1
          else {
            if (points[i].loc - points[a - 1].loc < points[b + 1].loc - points[i.loc]) a -= 1
            else b += 1
          }
          grade = (points[b].alt - points[a].alt) / (points[b].loc - points[a].loc) / 10
        }

        d(`Fixing step at index ${i} by adjustments to points ${a + 1} through ${b - 1}.`)
        for (let j = a + 1; j < b; j++) {
          points[j].alt = _.round(
            interp(points[a].loc, points[b].loc, points[a].alt, points[b].alt, points[j].loc),
            2
          )
        }
      } else {
        d(`Adjustment at index ${i} no longer needed (grade=${grade}%).`)
      }
    })
  }
  d(`clean from ${length0} to ${points.length} points.`)
}
