import { Types } from '../../main'
import { DarkModel } from './DarkModel'
import { defaults } from './defaults'
import { scale } from './scale'

/**
 * Return time-of-day based dark factor
 *
 * @param   timeOfDaySeconds - Time of day (in seconds)
 * @param   terrainFactor  -  Terrain %
 * @param   sun  -            Sun model, object w/ dawn, sunrise, sunset, dusk in time-of-day seconds
 * @param   model -       Darkness model (see ./defaults)
 *
 * @returns  The heat factor at the provided point
 */
export function getDarkFactor(
  timeOfDaySeconds: number,
  terrainFactor: number,
  sun: Types.SunEvents,
  model: DarkModel = defaults
): number {
  if (terrainFactor === 1) return 1

  if (model === null || typeof model === 'undefined') {
    model = defaults
  }

  // dark factor is a scaling of terrain
  const fdark = model.terrainScale * (terrainFactor - 1) + model.baseline

  // val will be between 0 and 1, where 0 is no additional and 1 is max
  const val = scale(sun, timeOfDaySeconds)

  return 1 + fdark * val
}
