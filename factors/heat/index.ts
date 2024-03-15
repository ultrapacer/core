import { PlanPoint } from '../../models/PlanPoint'
import { HeatModel } from './HeatModel'

/**
 * Return a scaling factor for heat
 *
 * @param point - Point object per /models/Point
 * @param model - Heat model
 * @returns  The heat factor at the provided point
 */
export function getHeatFactor(point: PlanPoint, model?: HeatModel): number {
  if (!model) return 1

  if (point.tod === undefined) throw new Error('tod is undefined')

  const t = point.tod
  let f = 1
  if (t > model.start && t < model.stop) {
    const theta = ((t - model.start) / (model.stop - model.start)) * Math.PI
    f += ((model.max - model.baseline) * Math.sin(theta)) / 100
  }
  f += model.baseline / 100
  return f
}
