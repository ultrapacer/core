import _ from 'lodash'

import { adjust } from './adjust.js'
import { defaults as def } from './default.js'

function getFact(loc, strategy, length) {
  let a = -adjust(strategy, length)
  strategy.forEach((d, i) => {
    if (loc >= d.onset) {
      if (d.type === 'step') {
        a += d.value
      } else if (d.type === 'linear') {
        const end = i === strategy.length - 1 ? length : strategy[i + 1].onset
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

export class Strategy {
  constructor(arg = {}) {
    Object.defineProperty(this, '__class', { value: 'Strategy', enumerable: false })

    // if it's already a Strategy object, just clone it
    if (arg.__class === 'Strategy') {
      Object.assign(this, _.cloneDeep(arg))

      // otherwise copy over individual fields
    } else {
      // length
      // TODO: length should be assumed from strategy.plan.course.dist
      if (!arg.length) throw new Error('length required')
      this.length = arg.length

      // values
      // TODO: this is too flexible and prone to errors:
      if (_.isNumber(arg.values)) {
        this.values = [{ onset: 0, value: arg.values, type: 'linear' }]
      } else if (_.isArray(arg.values)) {
        this.values = _.cloneDeep(arg.values)
      } else if (arg.values) {
        throw new Error(`bad values input: ${JSON.stringify(arg.values)}`)
      } else {
        this.values = [{ onset: 0, value: def(this.length), type: 'linear' }]
      }
    }
  }

  /**
   * Returns strategy factor at location.
   *
   * @param {Number} loc - The location (in km) to determine value.
   * @return {Number} The strategy factor at input location.
   */
  at(loc) {
    const a = getFact(loc, this.values, this.length)
    return 1 + a / 100
  }

  addValue(val) {
    const i = this.values.findIndex((v) => v.onset >= val.onset)
    if (i >= 0) {
      this.values.splice(i, 0, val)
    } else {
      this.values.push(val)
    }
  }
}
