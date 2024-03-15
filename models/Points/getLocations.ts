import { Point } from '../Point'

export const getLocations = (points: Point[]) => {
  let d = 0
  let l = 0
  const locations = [0]
  for (let i = 1, il = points.length; i < il; i++) {
    d = Number(points[i - 1].latlon.distanceTo(points[i].latlon))
    l += d
    locations.push(l)
  }
  return locations
}
