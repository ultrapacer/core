import _ from 'lodash'

import { Course } from '../../models/Course'
import { CoursePoint } from '../../models/CoursePoint'
import { PlanPoint } from '../../models/PlanPoint'
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
export function getTerrainFactor(point: CoursePoint | PlanPoint, course: Course) {
  const tF = _.findLast(course.terrainFactors, (x) => rlte(x.start, point.loc, 4))

  if (!tF) return 1

  return tF.value / 100 + 1
}
