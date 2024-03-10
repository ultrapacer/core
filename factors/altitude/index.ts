import { AltitudeModel } from './AltitudeModel'
import { defaults } from './defaults'

/**
 * returns the altitude factor
 * @param alt - input altitude
 * @param model - alitude model
 * @returns - altitude model
 */
export function getAltitudeFactor(alt: number, model?: AltitudeModel): number {
  if (model === null || typeof model === 'undefined') {
    model = defaults
  }
  let a = 0
  if (Array.isArray(alt)) {
    a = (alt[0] + alt[1]) / 2
  } else {
    a = alt
  }
  if (a <= model.th) {
    return 1
  } else {
    const r = model.rate / model.span / 100
    return (1 + r) ** (a - model.th)
  }
}
