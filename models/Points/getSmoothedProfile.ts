import { wlslr } from '../../util/math'

export const getSmoothedProfile = (
  locations: number[],
  altitudes: number[],
  smoothedLocations: number[],
  gt: number
) => {
  const mbs = wlslr(locations, altitudes, smoothedLocations, gt)

  const ga: { grade: number; alt: number }[] = []

  smoothedLocations.forEach((x, i) => {
    let grade = mbs[i][0] / 10
    if (grade > 50) {
      grade = 50
    } else if (grade < -50) {
      grade = -50
    }
    const alt = x * mbs[i][0] + mbs[i][1]
    ga.push({
      grade,
      alt
    })
  })
  return ga
}
