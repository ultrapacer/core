import { along, lineString } from '@turf/turf'

import type { Types } from '../..'
import { Models } from '../..'
import { interp } from '../../util/math'

/**
 * interpolate between two track points
 * @param p1 - first point
 * @param p2 - second point
 * @param loc - location
 * @returns new TrackPoint
 */
export function interpolatePoint(p1: Types.TrackPoint, p2: Types.TrackPoint, loc: number) {
  if ((p1.loc > p2.loc && loc > p1.loc) || (p2.loc > p1.loc && loc > p2.loc))
    throw new Error('Input location must be between points')

  const line = lineString([
    [p1.lon, p1.lat],
    [p2.lon, p2.lat]
  ])
  const p3 = along(line, loc - p1.loc)

  // use first point for these fields:
  const grade = p1.grade

  // linear interpolation of other fields
  const alt = interp(p1.loc, p2.loc, p1.alt, p2.alt, loc)

  return new Models.TrackPoint(
    { lon: p3.geometry.coordinates[0], lat: p3.geometry.coordinates[1], alt },
    loc,
    grade
  )
}
