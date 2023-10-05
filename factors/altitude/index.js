import { defaults } from './defaults.js'

export function getAltitudeFactor(alt, model) {
  // returns an exponential altitude factor
  // alt: altitude [km]
  // model format:
  //    rate: % increase per span
  //    span: meters for % increase
  //      th: alt threshold where model starts [m]
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
