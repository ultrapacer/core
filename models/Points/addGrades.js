import { getSmoothedProfile } from './getSmoothedProfile'

// add grades to array of Point objects
// mutates input array
export function addGrades(points) {
  // add grade field to points array
  const locs = []
  let i = 0
  for (i = 0; i < points.length; i++) {
    locs.push(points[i].loc)
  }
  const lsq = getSmoothedProfile({ points, locs, gt: 0.05 })
  points.forEach((p, i) => {
    p.grade = lsq[i].grade
  })
}
