import { Point } from '../Point'
import { getSmoothedProfile } from './getSmoothedProfile'

export function getGrades(points: Point[], locations: number[]) {
  const lsq = getSmoothedProfile(
    locations,
    points.map((p) => p.alt),
    locations,
    0.05
  )
  return lsq.map((x) => x.grade)
}
