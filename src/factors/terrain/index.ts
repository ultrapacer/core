import _ from 'lodash'

import type { Types } from '../..'
import { rlte } from '../../util/math'

// TODO: instead of having tFs values as added % (eg 5, 10), change to percent eg (1.05, 1.10))

/**
 * Return a scaling factor for terrain
 *
 * @param point  - Point object per /models/Point
 * @param course - Course object per /models/Course
 *
 * @returns The terrain factor at the provided point
 */
export function getTerrainFactor(point: Types.CoursePoint | Types.PlanPoint, course: Types.Course) {
  const tF = _.findLast(course.terrain, (x) => rlte(x.percents[0] * course.dist, point.loc, 4))

  if (!tF) return 1

  return tF.value / 100 + 1
}
