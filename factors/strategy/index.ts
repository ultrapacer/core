import _ from 'lodash'

import { Plan } from '../../models'
import { adjust } from './adjust'
import { defaults as def } from './default'
import { StrategyElement } from './StrategyElement'

function getFact(loc: number, values: StrategyElement[], length: number) {
  let a = -adjust(values, length)
  values.forEach((d, i) => {
    if (loc >= d.onset) {
      if (d.type === 'step') {
        a += d.value
      } else if (d.type === 'linear') {
        const end = i === values.length - 1 ? length : values[i + 1].onset
        if (loc > end) {
          a += d.value
        } else {
          a += (d.value * (loc - d.onset)) / (end - d.onset)
        }
      }
    }
  })
  return a
}

export type StrategyValues = { onset: number; value: number; type: string }[]

export class Strategy {
  plan: Plan
  values: StrategyValues

  constructor(plan: Plan, values?: StrategyValues) {
    this.plan = plan
    this.values = values
      ? _.cloneDeep(values)
      : [{ onset: 0, value: def(this.plan.course.dist), type: 'linear' }]
  }

  /**
   * Returns strategy factor at location.
   *
   * @param loc - The location (in km) to determine value.
   * @returns  The strategy factor at input location.
   */
  at(loc: number): number {
    const a = getFact(loc, this.values, this.plan.course.dist)
    return 1 + a / 100
  }

  addValue(val: StrategyElement) {
    const i = this.values.findIndex((v) => v.onset >= val.onset)
    if (i >= 0) {
      this.values.splice(i, 0, val)
    } else {
      this.values.push(val)
    }
  }
}
