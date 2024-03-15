import { interp } from '../../util/math'
import { TrackPoint } from '../Point'

/**
 * interpolate between two track points
 * @param p1 - first point
 * @param p2 - second point
 * @param loc - location
 * @returns new TrackPoint
 */
export function interpolatePoint(p1: TrackPoint, p2: TrackPoint, loc: number) {
  if ((p1.loc > p2.loc && loc > p1.loc) || (p2.loc > p1.loc && loc > p2.loc))
    throw new Error('Input location must be between points')
  const dist = Math.abs(p1.loc - loc)
  const brng = p1.latlon.bearingTo(p2.latlon)
  const { lat, lng: lon } = p1.latlon.destinationPoint(brng, dist)

  // use first point for these fields:
  const grade = p1.grade

  // linear interpolation of other fields
  const alt = interp(p1.loc, p2.loc, p1.alt, p2.alt, loc)

  return new TrackPoint(lat, lon, alt, loc, grade)
}
