import { sumBy } from 'lodash'

import type { Types } from '..'
import { Factors } from './Factors'

export function rollup(input: { factors: Types.Factors; dist: number }[]) {
  const f = new Factors().init(0)
  input.forEach(({ factors, dist }) => {
    f.applyEach((v, b) => v + dist * b, factors)
  })
  f.scaleEach(1 / sumBy(input, 'dist'))
  return f
}
