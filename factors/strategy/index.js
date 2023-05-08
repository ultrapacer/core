const adjust = require('./adjust')
const def = require('./default')
const _ = require('lodash')

function getFact (loc, strategy, length) {
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
          a += d.value * (loc - d.onset) / (end - d.onset)
        }
      }
    }
  })
  return a
}

class StrategyAutoPoint {
  constructor (arg = {}) {
    Object.defineProperty(this, 'point', { enumerable: false, writable: true })
    Object.assign(this, arg)
  }
}

class Strategy {
  constructor (arg = {}) {
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

      // autos
      this.autos = arg?.autos || []
    }
  }

  at (loc) {
    const a = getFact(loc, this.values, this.length)
    const b = getFact(loc, this.autos, this.length)
    return (1 + a / 100) * (1 + b / 100)
  }

  addValue (val) {
    const i = this.values.findIndex(v => v.onset >= val.onset)
    if (i >= 0) {
      this.values.splice(i, 0, val)
    } else {
      this.values.push(val)
    }
  }

  addAuto (val) {
    const i = this.autos.findIndex(v => v.onset >= val.onset)
    const val2 = new StrategyAutoPoint({ ...val }) // shallow copy
    val2.value = 0
    if (i >= 0) {
      this.autos.splice(i, 0, val2)
    } else {
      this.autos.push(val2)
    }
    this.adjustAutoValue(val2, val.value)
  }

  adjustAutoValue (item, y2) {
    // where item is an object in the autos array
    // y2 is the adjustment being made to the step value at this location

    const i = this.autos.indexOf(item)
    item.value += y2

    // x1 is the location of the prior break point
    // x2 is the current location
    // x3 is the location of the next break point
    const x1 = this.autos[i - 1]?.onset || 0
    const x2 = item.onset
    const x3 = this.autos[i + 1]?.onset || this.length
    const a = x2 - x1
    const b = x3 - x2

    // y1 is the corresponding reduction of the previous step
    // y3 is the corresponding reduction in the next step
    const y1 = b * y2 / (a + b)
    const y3 = a * y2 / (a + b)

    if (this.autos[i - 1]) this.autos[i - 1].value -= y1
    if (this.autos[i + 1]) this.autos[i + 1].value -= y3
  }
}

module.exports = Strategy
