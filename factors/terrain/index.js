import _ from 'lodash'
import { rlte } from '../../util/math.js'

// TODO: instead of having tFs values as added % (eg 5, 10), change to percent eg (1.05, 1.10))

/**
 * Return a scaling factor for terrain
 *
 * @param {Object}  args          Arguments object
 * @param {Point}   args.point    Point object per /models/Point
 * @param {Course}  args.course   Course object per /models/Course
 *
 * @return {Number} The terrain factor at the provided point
 */
export function getTerrainFactor({ point, course }) {
  const tF = _.findLast(course.terrainFactors, (x) => rlte(x.start, point.loc, 4))

  if (!tF) return 1

  return tF.value / 100 + 1
}
