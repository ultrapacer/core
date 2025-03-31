import { distance } from '@turf/turf'

import type { Point } from '../Point'

export const getLocations = (points: Point[]) => {
  let d = 0
  let l = 0
  const locations = [0]
  for (let i = 1, il = points.length; i < il; i++) {
    d = distance([points[i - 1].lon, points[i - 1].lat], [points[i].lon, points[i].lat])
    l += d
    locations.push(l)
  }

  return locations
}
